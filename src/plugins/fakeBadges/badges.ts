/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ProfileBadge } from "@api/Badges";
export interface ProfileBadgeWithName extends Omit<ProfileBadge, "image"> {
    /** Display name for settings UI */
    name: string;
    /** Discord Emoji ID.  */
    emojiId: string;
}

export const BADGES: ProfileBadgeWithName[] = [
    {
        name: "pssss",
        emojiId: "1385013987086958744",
        description: "Quiet... no one asked.",
    },
    {
        name: "Suspicious",
        emojiId: "1385014012764225667",
        description: "Kinda sus, not gonna lie.",
    },
    {
        name: "Shocked",
        emojiId: "1385013975380525087",
        description: "OMG?! I can't believe this.",
    },
    {
        name: "Nerd Alert",
        emojiId: "1385013958766891057",
        description: "Well, *actually*...",
    },
    {
        name: "Called Out",
        emojiId: "1385013946783895613",
        description: "That’s the guy, officer.",
    },
    {
        name: "Middle Finger",
        emojiId: "1385013935601745950",
        description: "With all due respect... nope.",
    },
    {
        name: "Standing Ovation",
        emojiId: "1385013923664760873",
        description: "*clap clap* truly majestic.",
    },
    {
        name: "Zombie Mode",
        emojiId: "1385013913124601958",
        description: "Brain... not found.",
    },
    {
        name: "On Fire",
        emojiId: "1385013893851512872",
        description: "Too hot to handle.",
    },
    {
        name: "Superstar",
        emojiId: "1385013883974189136",
        description: "You're not just a star — you're *the* star.",
    },
    {
        name: "Lucky Charm",
        emojiId: "1385013874389946440",
        description: "May the odds be ever in your favor.",
    },
    {
        name: "Certified Dumbass",
        emojiId: "1385013996360433745",
        description: "*insert goofy laugh*",
    },
];
