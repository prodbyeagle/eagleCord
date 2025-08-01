/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelRouter, ChannelStore, NavigationRouter, SelectedChannelStore, SelectedGuildStore } from "@webpack/common";

export interface LogoutEvent {
    type: "LOGOUT";
    isSwitchingAccount: boolean;
}

interface ChannelSelectEvent {
    type: "CHANNEL_SELECT";
    channelId: string | null;
    guildId: string | null;
}

interface PreviousChannel {
    guildId: string | null;
    channelId: string | null;
}

let isSwitchingAccount = false;
let previousCache: PreviousChannel | undefined;

export default definePlugin({
    name: "KeepCurrentChannel",
    description: "Attempt to navigate to the channel you were in before switching accounts or loading Discord.",
    authors: [Devs.Nuckyz],

    patches: [
        {
            find: '"Switching accounts"',
            replacement: {
                match: /goHomeAfterSwitching:\i/,
                replace: "goHomeAfterSwitching:!1"
            }
        }
    ],

    flux: {
        LOGOUT(e: LogoutEvent) {
            ({ isSwitchingAccount } = e);
        },

        CONNECTION_OPEN() {
            if (!isSwitchingAccount) return;
            isSwitchingAccount = false;

            if (previousCache?.channelId) {
                if (ChannelStore.hasChannel(previousCache.channelId)) {
                    ChannelRouter.transitionToChannel(previousCache.channelId);
                } else {
                    NavigationRouter.transitionToGuild("@me");
                }
            }
        },

        async CHANNEL_SELECT({ guildId, channelId }: ChannelSelectEvent) {
            if (isSwitchingAccount) return;

            previousCache = {
                guildId,
                channelId
            };
            await DataStore.set("KeepCurrentChannel_previousData", previousCache);
        }
    },

    async start() {
        previousCache = await DataStore.get<PreviousChannel>("KeepCurrentChannel_previousData");
        if (!previousCache) {
            previousCache = {
                guildId: SelectedGuildStore.getGuildId(),
                channelId: SelectedChannelStore.getChannelId() ?? null
            };

            await DataStore.set("KeepCurrentChannel_previousData", previousCache);
        } else if (previousCache.channelId) {
            ChannelRouter.transitionToChannel(previousCache.channelId);
        }
    }
});
