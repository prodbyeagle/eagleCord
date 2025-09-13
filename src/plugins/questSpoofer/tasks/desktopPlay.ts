/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxDispatcher, RestAPI, showToast, Toasts } from "@webpack/common";

import { QuestSpooferLogger, RunningGameStore } from "../constants";

export async function spoofDesktopPlayQuest(
    quest: any,
    appId: string,
    appName: string,
    pid: number,
    secondsNeeded: number,
) {
    if (!IS_DISCORD_DESKTOP) {
        QuestSpooferLogger.error("Not in desktop environment.");
        return showToast(
            "❌ Use the desktop app to spoof this quest.",
            Toasts.Type.FAILURE,
        );
    }

    try {
        const res = await RestAPI.get({
            url: `/applications/public?application_ids=${appId}`,
        });
        const app = res.body[0];
        const exeName = app.executables
            .find(x => x.os === "win32")
            ?.name.replace(">", "");

        const fakeGame = {
            cmdLine: `C:\\Program Files\\${app.name}\\${exeName}`,
            exeName,
            exePath: `c:/program files/${app.name.toLowerCase()}/${exeName}`,
            hidden: false,
            isLauncher: false,
            id: appId,
            name: app.name,
            pid,
            pidPath: [pid],
            processName: app.name,
            start: Date.now(),
        };

        QuestSpooferLogger.log(
            `Injecting fake game process: ${exeName} (pid ${pid})`,
        );

        const realGames = RunningGameStore.getRunningGames();
        const backupGetGames = RunningGameStore.getRunningGames;
        const backupGetByPid = RunningGameStore.getGameForPID;

        RunningGameStore.getRunningGames = () => [fakeGame];
        RunningGameStore.getGameForPID = () => fakeGame;

        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: realGames,
            added: [fakeGame],
            games: [fakeGame],
        });

        const listener = (data: any) => {
            const progress =
                quest.config.configVersion === 1
                    ? data.userStatus.streamProgressSeconds
                    : Math.floor(
                          data.userStatus.progress.PLAY_ON_DESKTOP.value,
                      );

            QuestSpooferLogger.debug(
                `Heartbeat received: ${progress}/${secondsNeeded}s`,
            );

            if (progress >= secondsNeeded) {
                FluxDispatcher.unsubscribe(
                    "QUESTS_SEND_HEARTBEAT_SUCCESS",
                    listener,
                );
                RunningGameStore.getRunningGames = backupGetGames;
                RunningGameStore.getGameForPID = backupGetByPid;
                FluxDispatcher.dispatch({
                    type: "RUNNING_GAMES_CHANGE",
                    removed: [fakeGame],
                    added: [],
                    games: [],
                });

                showToast(
                    "✅ Desktop play quest completed!",
                    Toasts.Type.SUCCESS,
                );
                QuestSpooferLogger.info(
                    "Desktop play quest spoofed successfully.",
                );
            }
        };

        FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", listener);
        showToast(`🎮 Spoofing game: ${appName}`, Toasts.Type.MESSAGE);
    } catch (err) {
        QuestSpooferLogger.error("Failed to fetch application data.", err);
    }
}
