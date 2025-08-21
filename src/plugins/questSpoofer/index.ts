/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { showToast, Toasts } from "@webpack/common";

import { QuestSpooferLogger, QuestTasks, randomPid } from "./constants";
import { fetchQuests } from "./helpers";
import { spoofDesktopPlayQuest } from "./tasks/desktopPlay";
import { spoofPlayActivityQuest } from "./tasks/playActivity";
import { spoofStreamDesktopQuest } from "./tasks/streamDesktop";
import { spoofVideoQuest } from "./tasks/video";


export default definePlugin({
    name: "QuestSpoofer",
    description: "Spoofs Discord Quests for video, desktop play, and streaming.",
    authors: [Devs.prodbyeagle],
    isEagleCord: true,

    async start() {
        delete (window as any).$;

        const quests = await fetchQuests();

        if (quests.length === 0) {
            QuestSpooferLogger.warn("No uncompleted quests found from API.");
            return showToast("No uncompleted quest found.", Toasts.Type.MESSAGE);
        }

        QuestSpooferLogger.log(`Detected ${quests.length} uncompleted quest(s).`);

        for (const quest of quests) {
            QuestSpooferLogger.log(`Detected quest: ${quest.config.application.name} - ${quest.config.messages.game_title}`);

            const pid = randomPid();
            const appId = quest.config.application.id;
            const appName = quest.config.application.name;

            const taskConfig = quest.config.taskConfig ?? quest.config.task_config_v2;
            const task = QuestTasks.find(t => taskConfig?.tasks?.[t]);

            if (!task) {
                QuestSpooferLogger.warn(`No valid quest task found in config for ${appName}.`);
                continue;
            }

            const secondsNeeded = taskConfig.tasks[task].target;
            const secondsDone = quest.user_status?.progress?.[task]?.value ?? 0;

            QuestSpooferLogger.info(`Spoofing task: ${task} | Needed: ${secondsNeeded}s | Done: ${secondsDone}s`);

            try {
                if (task === "WATCH_VIDEO" || task === "WATCH_VIDEO_ON_MOBILE") {
                    await spoofVideoQuest(quest, secondsNeeded, secondsDone);
                } else if (task === "PLAY_ON_DESKTOP") {
                    await spoofDesktopPlayQuest(quest, appId, appName, pid, secondsNeeded);
                } else if (task === "STREAM_ON_DESKTOP") {
                    spoofStreamDesktopQuest(quest, appId, appName, pid, secondsNeeded);
                } else if (task === "PLAY_ACTIVITY") {
                    await spoofPlayActivityQuest(quest, secondsNeeded);
                } else {
                    QuestSpooferLogger.warn(`Unsupported quest task: ${task}`);
                }
            } catch (err) {
                QuestSpooferLogger.error(`Failed to spoof quest ${appName}:`, err);
            }
        }

        showToast(`Finished spoofing ${quests.length} quest(s).`, Toasts.Type.MESSAGE);
    },

    stop() {
        QuestSpooferLogger.info("QuestSpoofer plugin stopped.");
        showToast("QuestSpoofer plugin stopped.", Toasts.Type.MESSAGE);
    }
});
