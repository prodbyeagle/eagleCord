/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { showToast, Toasts } from "@webpack/common";

import { QuestSpooferLogger } from "../constants";
import { postVideoProgress } from "../helpers";

export async function spoofVideoQuest(
    quest: any,
    secondsNeeded: number,
    secondsDone: number,
) {
    const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
    const speed = 7;
    const interval = 1;

    (async function spoof() {
        QuestSpooferLogger.info("Started video spoofing...");
        while (true) {
            const maxAllowed =
                Math.floor((Date.now() - enrolledAt) / 1000) + 10;
            const diff = maxAllowed - secondsDone;
            const timestamp = secondsDone + speed;

            if (diff >= speed) {
                const postTime = Math.min(
                    secondsNeeded,
                    timestamp + Math.random(),
                );
                const res = await postVideoProgress(quest.id, postTime);

                QuestSpooferLogger.log(
                    `POST /video-progress: +${speed}s → ${postTime}s`,
                );

                if (res.body.completed_at) {
                    QuestSpooferLogger.info("Video quest marked as completed.");
                    break;
                }

                secondsDone = Math.min(secondsNeeded, timestamp);
            }

            if (timestamp >= secondsNeeded) break;
            await new Promise((r) => setTimeout(r, interval * 1000));
        }

        await postVideoProgress(quest.id, secondsNeeded);
        showToast("✅ Video quest completed!", Toasts.Type.SUCCESS);
        QuestSpooferLogger.info("Sent final video-progress to finish quest.");
    })();

    showToast(
        `▶️ Spoofing video quest: ${quest.config.messages.questName}`,
        Toasts.Type.MESSAGE,
    );
}
