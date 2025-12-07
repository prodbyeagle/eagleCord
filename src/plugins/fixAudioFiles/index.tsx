/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

let last: HTMLAudioElement | null = null;

export default definePlugin({
    name: "FixAudioFiles",
    description: "Prevents overlapping audio by enforcing one 'sound' at a time.",
    authors: [Devs.prodbyeagle],

    // Inject handlers onto rendered <audio> elements; handler filters down to attachment UIs
    patches: [
        {
            // Target the audio attachment component by its preload metadata attribute.
            find: 'preload:"metadata"',
            all: true,
            noWarn: true,
            replacement: {
                match: /preload:"metadata"/g,
                replace: 'onPlay:$self.handlePlay,onEnded:$self.handleEnded,preload:"metadata"'
            }
        }
    ],

    handlePlay(event: Event) {
        const target = event?.currentTarget;
        if (!(target instanceof HTMLAudioElement)) return;

        // Ignore non-UI audio (e.g. notification sounds)
        const className = target.className ?? "";
        const parentClasses = [
            target.parentElement?.className ?? "",
            target.parentElement?.parentElement?.className ?? ""
        ].join(" ");
        if (!/audio_/i.test(className) && !/wrapperAudio_/i.test(parentClasses)) return;

        if (last && last !== target && !last.paused) {
            try {
                last.pause();
            } catch { /* ignored */ }
        }

        last = target;
    },

    handleEnded(event: Event) {
        if (event?.currentTarget === last) last = null;
    },

    stop() {
        last = null;
    },
});
