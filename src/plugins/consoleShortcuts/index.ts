/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import { getCurrentChannel, getCurrentGuild } from "@utils/discord";
import { runtimeHashMessageKey } from "@utils/intlHash";
import { SYM_LAZY_CACHED, SYM_LAZY_GET } from "@utils/lazy";
import { sleep } from "@utils/misc";
import { ModalAPI } from "@utils/modal";
import { relaunch } from "@utils/native";
import { canonicalizeMatch, canonicalizeReplace, canonicalizeReplacement } from "@utils/patches";
import definePlugin, { PluginNative, StartAt } from "@utils/types";
import * as Webpack from "@webpack";
import { extract, filters, findAll, findModuleId, search } from "@webpack";
import * as Common from "@webpack/common";
import { loadLazyChunks } from "debug/loadLazyChunks";
import type { ComponentType } from "react";

const DESKTOP_ONLY = (f: string) => () => {
    throw new Error(`'${f}' is Discord Desktop only.`);
};

const define: typeof Object.defineProperty =
    (obj, prop, desc) => {
        if (Object.hasOwn(desc, "value"))
            desc.writable = true;

        return Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: true,
            ...desc
        });
    };

function makeShortcuts() {
    function newFindWrapper(filterFactory: (...props: any[]) => Webpack.FilterFn) {
        const cache = new Map<string, unknown>();

        return function (...filterProps: unknown[]) {
            const cacheKey = String(filterProps);
            if (cache.has(cacheKey)) return cache.get(cacheKey);

            const matches = findAll(filterFactory(...filterProps));

            const result = (() => {
                switch (matches.length) {
                    case 0: return null;
                    case 1: return matches[0];
                    default:
                        const uniqueMatches = [...new Set(matches)];
                        if (uniqueMatches.length > 1)
                            console.warn(`Warning: This filter matches ${uniqueMatches.length} exports. Make it more specific!\n`, uniqueMatches);

                        return matches[0];
                }
            })();
            if (result && cacheKey) cache.set(cacheKey, result);
            return result;
        };
    }

    function findStoreWrapper(findStore: typeof Webpack.findStore) {
        const cache = new Map<string, unknown>();

        return function (storeName: string) {
            const cacheKey = String(storeName);
            if (cache.has(cacheKey)) return cache.get(cacheKey);

            let store: unknown;
            try {
                store = findStore(storeName);
            } catch { }
            if (store) cache.set(cacheKey, store);
            return store;
        };
    }

    let fakeRenderWin: WeakRef<Window> | undefined;
    const find = newFindWrapper(f => f);
    const findByProps = newFindWrapper(filters.byProps);

    return {
        ...Object.fromEntries(Object.keys(Common).map(key => [key, { getter: () => Common[key] }])),
        wp: Webpack,
        wpc: { getter: () => Webpack.cache },
        wreq: { getter: () => Webpack.wreq },
        wpPatcher: { getter: () => Vencord.WebpackPatcher },
        wpInstances: { getter: () => Vencord.WebpackPatcher.allWebpackInstances },
        wpsearch: search,
        wpex: extract,
        wpexs: (code: string) => extract(findModuleId(code)!),
        loadLazyChunks: IS_DEV ? loadLazyChunks : () => { throw new Error("loadLazyChunks is dev only."); },
        find,
        findAll: findAll,
        findByProps,
        findAllByProps: (...props: string[]) => findAll(filters.byProps(...props)),
        findByCode: newFindWrapper(filters.byCode),
        findAllByCode: (code: string) => findAll(filters.byCode(code)),
        findComponentByCode: newFindWrapper(filters.componentByCode),
        findAllComponentsByCode: (...code: string[]) => findAll(filters.componentByCode(...code)),
        findExportedComponent: (...props: string[]) => findByProps(...props)[props[0]],
        findStore: findStoreWrapper(Webpack.findStore),
        PluginsApi: { getter: () => Vencord.Plugins },
        plugins: { getter: () => Vencord.Plugins.plugins },
        Settings: { getter: () => Vencord.Settings },
        Api: { getter: () => Vencord.Api },
        Util: { getter: () => Vencord.Util },
        reload: () => location.reload(),
        restart: IS_WEB ? DESKTOP_ONLY("restart") : relaunch,
        canonicalizeMatch,
        canonicalizeReplace,
        canonicalizeReplacement,
        runtimeHashMessageKey,
        fakeRender: (component: ComponentType, props: any) => {
            const prevWin = fakeRenderWin?.deref();
            const win = prevWin?.closed === false
                ? prevWin
                : window.open("about:blank", "Fake Render", "popup,width=500,height=500")!;
            fakeRenderWin = new WeakRef(win);
            win.focus();

            const doc = win.document;
            doc.body.style.margin = "1em";

            if (!win.prepared) {
                win.prepared = true;

                [...document.querySelectorAll("style"), ...document.querySelectorAll("link[rel=stylesheet]")].forEach(s => {
                    const n = s.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;

                    if (s.parentElement?.tagName === "HEAD")
                        doc.head.append(n);
                    else if (n.id?.startsWith("vencord-") || n.id?.startsWith("vcd-"))
                        doc.documentElement.append(n);
                    else
                        doc.body.append(n);
                });
            }

            const root = Common.createRoot(doc.body.appendChild(document.createElement("div")));
            root.render(Common.React.createElement(component, props));

            doc.addEventListener("close", () => root.unmount(), { once: true });
        },

        preEnable: (plugin: string) => (Vencord.Settings.plugins[plugin] ??= { enabled: true }).enabled = true,

        channel: { getter: () => getCurrentChannel(), preload: false },
        channelId: { getter: () => Common.SelectedChannelStore.getChannelId(), preload: false },
        guild: { getter: () => getCurrentGuild(), preload: false },
        guildId: { getter: () => Common.SelectedGuildStore.getGuildId(), preload: false },
        me: { getter: () => Common.UserStore.getCurrentUser(), preload: false },
        meId: { getter: () => Common.UserStore.getCurrentUser().id, preload: false },
        messages: { getter: () => Common.MessageStore.getMessages(Common.SelectedChannelStore.getChannelId()), preload: false },
        openModal: { getter: () => ModalAPI.openModal },
        openModalLazy: { getter: () => ModalAPI.openModalLazy },

        Stores: Webpack.fluxStores,

        // e.g. "2024-05_desktop_visual_refresh", 0
        setExperiment: (id: string, bucket: number) => {
            Common.FluxDispatcher.dispatch({
                type: "EXPERIMENT_OVERRIDE_BUCKET",
                experimentId: id,
                experimentBucket: bucket,
            });
        },
    };
}

function loadAndCacheShortcut(key: string, val: any, forceLoad: boolean) {
    const currentVal = val.getter();
    if (!currentVal || val.preload === false) return currentVal;

    function unwrapProxy(value: any) {
        if (value[SYM_LAZY_GET]) {
            forceLoad ? currentVal[SYM_LAZY_GET]() : currentVal[SYM_LAZY_CACHED];
        } else if (value.$$vencordGetWrappedComponent) {
            return forceLoad ? value.$$vencordGetWrappedComponent() : value;
        }

        return value;
    }

    const value = unwrapProxy(currentVal);
    if (typeof value === "object" && value !== null) {
        const descriptors = Object.getOwnPropertyDescriptors(value);

        for (const propKey in descriptors) {
            if (value[propKey] == null) continue;

            const descriptor = descriptors[propKey];
            if (descriptor.writable === true || descriptor.set != null) {
                const currentValue = value[propKey];
                const newValue = unwrapProxy(currentValue);
                if (newValue != null && currentValue !== newValue) {
                    value[propKey] = newValue;
                }
            }
        }
    }

    if (value != null) {
        define(window.shortcutList, key, { value });
        define(window, key, { value });
    }

    return value;
}

const webpackModulesProbablyLoaded = Webpack.onceReady.then(() => sleep(1000));

export default definePlugin({
    name: "ConsoleShortcuts",
    description: "Adds shorter Aliases for many things on the window. Run `shortcutList` for a list.",
    authors: [Devs.Ven],
    startAt: StartAt.Init,

    patches: [
        {
            find: 'this,"_changeCallbacks",',
            replacement: {
                match: /\i\(this,"_changeCallbacks",/,
                replace: "Reflect.defineProperty(this,Symbol.toStringTag,{value:this.getName(),configurable:!0,writable:!0,enumerable:!1}),$&"
            }
        }
    ],


    start() {
        const shortcuts = makeShortcuts();
        window.shortcutList = {};

        for (const [key, val] of Object.entries(shortcuts)) {
            if ("getter" in val) {
                define(window.shortcutList, key, {
                    get: () => loadAndCacheShortcut(key, val, true)
                });

                define(window, key, {
                    get: () => window.shortcutList[key]
                });
            } else {
                window.shortcutList[key] = val;
                window[key] = val;
            }
        }

        // unproxy loaded modules
        this.eagerLoad(false);

        if (!IS_WEB) {
            const Native = VencordNative.pluginHelpers.ConsoleShortcuts as PluginNative<typeof import("./native")>;
            Native.initDevtoolsOpenEagerLoad();
        }
    },

    async eagerLoad(forceLoad: boolean) {
        await webpackModulesProbablyLoaded;

        const shortcuts = makeShortcuts();

        for (const [key, val] of Object.entries(shortcuts)) {
            if (!Object.hasOwn(val, "getter") || (val as any).preload === false) continue;

            try {
                loadAndCacheShortcut(key, val, forceLoad);
            } catch { } // swallow not found errors in DEV
        }
    },

    stop() {
        delete window.shortcutList;
        for (const key in makeShortcuts()) {
            delete window[key];
        }
    }
});
