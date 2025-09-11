/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {Logger} from "@utils/Logger";
import {findByPropsLazy} from "@webpack";

// Lazy-loaded stores
export const ApplicationStreamingStore = findByPropsLazy("getStreamerActiveStreamMetadata");
export const RunningGameStore = findByPropsLazy("getRunningGames", "getGameForPID");
export const QuestsStore = findByPropsLazy("getQuest");

// Task types
export const QuestTasks = [
    "WATCH_VIDEO",
    "PLAY_ON_DESKTOP",
    "STREAM_ON_DESKTOP",
    "PLAY_ACTIVITY",
    "WATCH_VIDEO_ON_MOBILE"
] as const;

// Helpers
export const randomPid = () => Math.floor(Math.random() * 30000) + 1000;
export const QuestSpooferLogger = new Logger("QuestSpoofer", "#473763");


