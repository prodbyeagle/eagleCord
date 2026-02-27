/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ClockIcon } from "@components/Icons";
import SettingsPlugin from "@plugins/_core/settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import StartupTimingPage from "./StartupTimingPage";

export default definePlugin({
    name: "StartupTimings",
    description: "Adds Startup Timings to the Settings menu",
    authors: [Devs.Megu],
    start() {
        SettingsPlugin.customEntries.push({
            key: "vencord_startup_timings",
            title: "Startup Timings",
            Component: StartupTimingPage,
            Icon: ClockIcon
        });
        SettingsPlugin.settingsSectionMap.push(["VencordStartupTimings", "vencord_startup_timings"]);
    },
    stop() {
        function removeFromArray<T>(arr: T[], predicate: (e: T) => boolean) {
            const idx = arr.findIndex(predicate);
            if (idx !== -1) arr.splice(idx, 1);
        }
        removeFromArray(SettingsPlugin.customEntries, e => e.key === "vencord_startup_timings");
        removeFromArray(SettingsPlugin.settingsSectionMap, entry => entry[1] === "vencord_startup_timings");
    },
});
