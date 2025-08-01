/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { shikiOnigasmSrc, shikiWorkerSrc } from "@utils/dependencies";
import { WorkerClient } from "@vap/core/ipc";
import type { IShikiTheme, IThemedToken } from "@vap/shiki";

import { dispatchTheme } from "../hooks/useTheme";
import type { ShikiSpec } from "../types";
import { getGrammar, languages, loadLanguages, resolveLang } from "./languages";
import { themes } from "./themes";

const themeUrls = Object.values(themes);

let resolveClient: (client: WorkerClient<ShikiSpec>) => void;

export const shiki = {
    client: null as WorkerClient<ShikiSpec> | null,
    currentTheme: null as IShikiTheme | null,
    currentThemeUrl: null as string | null,
    timeoutMs: 10000,
    languages,
    themes,
    loadedThemes: new Set<string>(),
    loadedLangs: new Set<string>(),
    clientPromise: new Promise<WorkerClient<ShikiSpec>>(resolve => resolveClient = resolve),

    init: async (initThemeUrl: string | undefined) => {
        /** https://stackoverflow.com/q/58098143 */
        const workerBlob = await fetch(shikiWorkerSrc).then(res => res.blob());

        const client = shiki.client = new WorkerClient<ShikiSpec>(
            "shiki-client",
            "shiki-host",
            workerBlob,
            { name: "ShikiWorker" },
        );
        await client.init();

        const themeUrl = initThemeUrl || themeUrls[0];

        await loadLanguages();
        await client.run("setOnigasm", { wasm: shikiOnigasmSrc });
        await client.run("setHighlighter", { theme: themeUrl, langs: [] });
        shiki.loadedThemes.add(themeUrl);
        await shiki._setTheme(themeUrl);
        resolveClient(client);
    },
    _setTheme: async (themeUrl: string) => {
        shiki.currentThemeUrl = themeUrl;
        const { themeData } = await shiki.client!.run("getTheme", { theme: themeUrl });
        shiki.currentTheme = JSON.parse(themeData);
        dispatchTheme({ id: themeUrl, theme: shiki.currentTheme });
    },
    loadTheme: async (themeUrl: string) => {
        const client = await shiki.clientPromise;
        if (shiki.loadedThemes.has(themeUrl)) return;

        await client.run("loadTheme", { theme: themeUrl });

        shiki.loadedThemes.add(themeUrl);
    },
    setTheme: async (themeUrl: string) => {
        await shiki.clientPromise;
        themeUrl ||= themeUrls[0];
        if (!shiki.loadedThemes.has(themeUrl)) await shiki.loadTheme(themeUrl);

        await shiki._setTheme(themeUrl);
    },
    loadLang: async (langId: string) => {
        const client = await shiki.clientPromise;
        const lang = resolveLang(langId);

        if (!lang || shiki.loadedLangs.has(lang.id)) return;

        await client.run("loadLanguage", {
            lang: {
                ...lang,
                grammar: lang.grammar ?? await getGrammar(lang),
            }
        });
        shiki.loadedLangs.add(lang.id);
    },
    tokenizeCode: async (code: string, langId: string): Promise<IThemedToken[][]> => {
        const client = await shiki.clientPromise;
        const lang = resolveLang(langId);
        if (!lang) return [];

        if (!shiki.loadedLangs.has(lang.id)) await shiki.loadLang(lang.id);

        return await client.run("codeToThemedTokens", {
            code,
            lang: langId,
            theme: shiki.currentThemeUrl ?? themeUrls[0],
        });
    },
    destroy() {
        shiki.currentTheme = null;
        shiki.currentThemeUrl = null;
        dispatchTheme({ id: null, theme: null });
        shiki.client?.destroy();
    }
};
