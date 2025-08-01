/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import * as DataStore from "@api/DataStore";
import { useSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { ChangeList } from "@utils/ChangeList";
import { Logger } from "@utils/Logger";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { useAwaiter, useCleanupEffect } from "@utils/react";
import { findByPropsLazy } from "@webpack";
import { Alerts, Button, Card, Forms, lodash, Parser, React, Select, Text, TextInput, Tooltip, useMemo, useState } from "@webpack/common";
import { JSX } from "react";

import Plugins, { ExcludedPlugins } from "~plugins";

import { PluginCard } from "./PluginCard";

export const cl = classNameFactory("vc-plugins-");
export const logger = new Logger("PluginSettings", "#a6d189");

const InputStyles = findByPropsLazy("inputWrapper", "inputError", "error");

function ReloadRequiredCard({ required }: { required: boolean; }) {
    return (
        <Card className={classes(cl("info-card"), required && "vc-warning-card")}>
            {required
                ? (
                    <>
                        <Forms.FormTitle tag="h5">Restart required!</Forms.FormTitle>
                        <Forms.FormText className={cl("dep-text")}>
                            Restart now to apply new plugins and their settings
                        </Forms.FormText>
                        <Button onClick={() => location.reload()} className={cl("restart-button")}>
                            Restart
                        </Button>
                    </>
                )
                : (
                    <>
                        <Forms.FormTitle tag="h5">Plugin Management</Forms.FormTitle>
                        <Forms.FormText>Press the cog wheel or info icon to get more info on a plugin</Forms.FormText>
                        <Forms.FormText>Plugins with a cog wheel have settings you can modify!</Forms.FormText>
                    </>
                )}
        </Card>
    );
}

const enum SearchStatus {
    ALL,
    ENABLED,
    DISABLED,
    NEW
}

function ExcludedPluginsList({ search }: { search: string; }) {
    const matching = Object.entries(ExcludedPlugins).filter(([name]) =>
        name.toLowerCase().includes(search)
    );

    if (!matching.length) {
        return (
            <Text variant="text-md/normal" className={Margins.top16}>
                No excluded plugins match your search.
            </Text>
        );
    }

    const reasonMap: Record<keyof typeof ExcludedPlugins, string> = {
        desktop: "Only available on Desktop/Vesktop",
        discordDesktop: "Only available on Discord Desktop",
        vesktop: "Only available on Vesktop",
        web: "Only available on Web/Vesktop",
        dev: "Only available in Dev builds"
    };

    return (
        <div className={classes(Margins.top20, cl("excluded-plugins"))}>
            <Forms.FormTitle tag="h5">Unavailable Plugins</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8}>
                These plugins are not available in your current platform/environment:
            </Forms.FormText>
            <div className={cl("excluded-list")}>
                {matching.map(([name, reason]) => (
                    <Card className={cl("excluded-card")} key={name}>
                        <div className={cl("excluded-header")}>
                            <Text variant="text-md/semibold">{name}</Text>
                            <Text className={cl("excluded-badge")} variant="text-sm/medium">
                                {reasonMap[reason]}
                            </Text>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function PluginSettings() {
    const settings = useSettings();
    const changes = useMemo(() => new ChangeList<string>(), []);

    useCleanupEffect(() => {
        if (changes.hasChanges)
            Alerts.show({
                title: "Restart required",
                body: (
                    <>
                        <p>The following plugins require a restart:</p>
                        <div>{changes.map((s, i) => (
                            <>
                                {i > 0 && ", "}
                                {Parser.parse("`" + s.split(".")[0] + "`")}
                            </>
                        ))}</div>
                    </>
                ),
                confirmText: "Restart now",
                cancelText: "Later!",
                onConfirm: () => location.reload()
            });
    }, []);

    const depMap = useMemo(() => {
        const o = {} as Record<string, string[]>;
        for (const plugin in Plugins) {
            const deps = Plugins[plugin].dependencies;
            if (deps) {
                for (const dep of deps) {
                    o[dep] ??= [];
                    o[dep].push(plugin);
                }
            }
        }
        return o;
    }, []);

    const sortedPlugins = useMemo(() =>
        Object.values(Plugins).sort((a, b) => a.name.localeCompare(b.name)),
        []
    );

    const [searchValue, setSearchValue] = useState({ value: "", status: SearchStatus.ALL });

    const search = searchValue.value.toLowerCase();
    const onSearch = (query: string) => setSearchValue(prev => ({ ...prev, value: query }));
    const onStatusChange = (status: SearchStatus) => setSearchValue(prev => ({ ...prev, status }));

    const pluginFilter = (plugin: typeof Plugins[keyof typeof Plugins]) => {
        const { status } = searchValue;
        const enabled = Vencord.Plugins.isPluginEnabled(plugin.name);

        switch (status) {
            case SearchStatus.DISABLED:
                if (enabled) return false;
                break;
            case SearchStatus.ENABLED:
                if (!enabled) return false;
                break;
            case SearchStatus.NEW:
                if (!newPlugins?.includes(plugin.name)) return false;
                break;
        }

        if (!search.length) return true;

        return (
            plugin.name.toLowerCase().includes(search) ||
            plugin.description.toLowerCase().includes(search) ||
            plugin.tags?.some(t => t.toLowerCase().includes(search))
        );
    };

    const [newPlugins] = useAwaiter(() => DataStore.get("Vencord_existingPlugins").then((cachedPlugins: Record<string, number> | undefined) => {
        const now = Date.now() / 1000;
        const existingTimestamps: Record<string, number> = {};
        const sortedPluginNames = Object.values(sortedPlugins).map(plugin => plugin.name);

        const newPlugins: string[] = [];
        for (const { name: p } of sortedPlugins) {
            const time = existingTimestamps[p] = cachedPlugins?.[p] ?? now;
            if ((time + 60 * 60 * 24 * 2) > now) {
                newPlugins.push(p);
            }
        }
        DataStore.set("Vencord_existingPlugins", existingTimestamps);

        return lodash.isEqual(newPlugins, sortedPluginNames) ? [] : newPlugins;
    }));

    const plugins = [] as JSX.Element[];
    const requiredPlugins = [] as JSX.Element[];

    const showApi = searchValue.value.includes("API");
    for (const p of sortedPlugins) {
        if (p.hidden || (!p.options && p.name.endsWith("API") && !showApi))
            continue;

        if (!pluginFilter(p)) continue;

        const isRequired = p.required || p.isDependency || depMap[p.name]?.some(d => settings.plugins[d].enabled);

        if (isRequired) {
            const tooltipText = p.required || !depMap[p.name]
                ? "This plugin is required for Vencord to function."
                : makeDependencyList(depMap[p.name]?.filter(d => settings.plugins[d].enabled));

            requiredPlugins.push(
                <Tooltip text={tooltipText} key={p.name}>
                    {({ onMouseLeave, onMouseEnter }) => (
                        <PluginCard
                            onMouseLeave={onMouseLeave}
                            onMouseEnter={onMouseEnter}
                            onRestartNeeded={(name, key) => changes.handleChange(`${name}.${key}`)}
                            disabled={true}
                            plugin={p}
                            key={p.name}
                        />
                    )}
                </Tooltip>
            );
        } else {
            plugins.push(
                <PluginCard
                    onRestartNeeded={(name, key) => changes.handleChange(`${name}.${key}`)}
                    disabled={false}
                    plugin={p}
                    isNew={newPlugins?.includes(p.name)}
                    key={p.name}
                />
            );
        }
    }

    return (
        <SettingsTab title="Plugins">
            <ReloadRequiredCard required={changes.hasChanges} />

            <Forms.FormTitle tag="h5" className={classes(Margins.top20, Margins.bottom8)}>
                Filters
            </Forms.FormTitle>

            <div className={classes(Margins.bottom20, cl("filter-controls"))}>
                <TextInput autoFocus value={searchValue.value} placeholder="Search for a plugin..." onChange={onSearch} />
                <div className={InputStyles.inputWrapper}>
                    <Select
                        options={[
                            { label: "Show All", value: SearchStatus.ALL, default: true },
                            { label: "Show Enabled", value: SearchStatus.ENABLED },
                            { label: "Show Disabled", value: SearchStatus.DISABLED },
                            { label: "Show New", value: SearchStatus.NEW }
                        ]}
                        serialize={String}
                        select={onStatusChange}
                        isSelected={v => v === searchValue.status}
                        closeOnSelect={true}
                        className={InputStyles.input}
                    />
                </div>
            </div>

            <Forms.FormTitle className={Margins.top20}>Plugins</Forms.FormTitle>

            {plugins.length || requiredPlugins.length
                ? (
                    <div className={cl("grid")}>
                        {plugins.length
                            ? plugins
                            : <Text variant="text-md/normal">No plugins meet the search criteria.</Text>
                        }
                    </div>
                )
                : <ExcludedPluginsList search={search} />
            }


            <Forms.FormDivider className={Margins.top20} />

            <Forms.FormTitle tag="h5" className={classes(Margins.top20, Margins.bottom8)}>
                Required Plugins
            </Forms.FormTitle>
            <div className={cl("grid")}>
                {requiredPlugins.length
                    ? requiredPlugins
                    : <Text variant="text-md/normal">No plugins meet the search criteria.</Text>
                }
            </div>
        </SettingsTab >
    );
}

function makeDependencyList(deps: string[]) {
    return (
        <>
            <Forms.FormText>This plugin is required by:</Forms.FormText>
            {deps.map((dep: string) => <Forms.FormText key={dep} className={cl("dep-text")}>{dep}</Forms.FormText>)}
        </>
    );
}

export default wrapTab(PluginSettings, "Plugins");
