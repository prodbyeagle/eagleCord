/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import DonateButton from "@components/settings/DonateButton";
import { DONOR_ROLE_ID, EAGLE_USER_ROLE_ID, MEOW_LOUNGE_GUILD_ID, VENCORD_GUILD_ID } from "@utils/constants";
import { Button, GuildMemberStore } from "@webpack/common";
import BadgeAPI from "plugins/_api/badges";

export const isDonor = (userId: string) => !!(
    BadgeAPI.getDonorBadges(userId)?.length > 0
    || GuildMemberStore.getMember(VENCORD_GUILD_ID, userId)?.roles.includes(DONOR_ROLE_ID)
);

export function isEagleUser(userId: string): boolean {
    const EagleBadges = BadgeAPI.getEagleCordBadges(userId);
    return (
        GuildMemberStore.getMember(MEOW_LOUNGE_GUILD_ID, userId)?.roles.includes(EAGLE_USER_ROLE_ID) ||
        !!EagleBadges
    );
}

export function DonateButtonComponent() {
    return (
        <DonateButton
            look={Button.Looks.FILLED}
            color={Button.Colors.WHITE}
            style={{ marginTop: "1em" }}
        />
    );
}
