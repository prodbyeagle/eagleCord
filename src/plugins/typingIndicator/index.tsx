/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings, Settings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { findComponentByCodeLazy, findStoreLazy } from "@webpack";
import { GuildMemberStore, RelationshipStore, SelectedChannelStore, Tooltip, UserStore, UserSummaryItem, useStateFromStores } from "@webpack/common";

import { buildSeveralUsers } from "../typingTweaks";

const ThreeDots = findComponentByCodeLazy(".dots,", "dotRadius:");

const TypingStore = findStoreLazy("TypingStore");
const UserGuildSettingsStore = findStoreLazy("UserGuildSettingsStore");

const enum IndicatorMode {
    Dots = 1 << 0,
    Avatars = 1 << 1
}

function getDisplayName(guildId: string, userId: string) {
    const user = UserStore.getUser(userId);
    return GuildMemberStore.getNick(guildId, userId) ?? (user as any).globalName ?? user.username;
}

function TypingIndicator({ channelId, guildId }: { channelId: string; guildId: string; }) {
    const typingUsers: Record<string, number> = useStateFromStores(
        [TypingStore],
        () => ({ ...TypingStore.getTypingUsers(channelId) as Record<string, number> }),
        null,
        (old, current) => {
            const oldKeys = Object.keys(old);
            const currentKeys = Object.keys(current);

            return oldKeys.length === currentKeys.length && currentKeys.every(key => old[key] != null);
        }
    );
    const currentChannelId = useStateFromStores([SelectedChannelStore], () => SelectedChannelStore.getChannelId());

    if (!settings.store.includeMutedChannels) {
        const isChannelMuted = UserGuildSettingsStore.isChannelMuted(guildId, channelId);
        if (isChannelMuted) return null;
    }

    if (!settings.store.includeCurrentChannel) {
        if (currentChannelId === channelId) return null;
    }

    const myId = UserStore.getCurrentUser()?.id;

    const typingUsersArray = Object.keys(typingUsers).filter(id =>
        id !== myId && !(RelationshipStore.isBlocked(id) && !settings.store.includeBlockedUsers)
    );
    const [a, b, c] = typingUsersArray;
    let tooltipText: string;

    switch (typingUsersArray.length) {
        case 0: break;
        case 1: {
            tooltipText = getIntlMessage("ONE_USER_TYPING", { a: getDisplayName(guildId, a) });
            break;
        }
        case 2: {
            tooltipText = getIntlMessage("TWO_USERS_TYPING", { a: getDisplayName(guildId, a), b: getDisplayName(guildId, b) });
            break;
        }
        case 3: {
            tooltipText = getIntlMessage("THREE_USERS_TYPING", { a: getDisplayName(guildId, a), b: getDisplayName(guildId, b), c: getDisplayName(guildId, c) });
            break;
        }
        default: {
            tooltipText = Settings.plugins.TypingTweaks.enabled
                ? buildSeveralUsers({ a: UserStore.getUser(a), b: UserStore.getUser(b), count: typingUsersArray.length - 2, guildId })
                : getIntlMessage("SEVERAL_USERS_TYPING");
            break;
        }
    }

    if (typingUsersArray.length > 0) {
        return (
            <Tooltip text={tooltipText!}>
                {props => (
                    <div className="vc-typing-indicator" {...props}>
                        {((settings.store.indicatorMode & IndicatorMode.Avatars) === IndicatorMode.Avatars) && (
                            <div
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                                onKeyPress={e => e.stopPropagation()}
                            >
                                <UserSummaryItem
                                    users={typingUsersArray.map(id => UserStore.getUser(id))}
                                    guildId={guildId}
                                    renderIcon={false}
                                    max={3}
                                    showDefaultAvatarsForNullUsers
                                    showUserPopout
                                    size={16}
                                    className="vc-typing-indicator-avatars"
                                />
                            </div>
                        )}
                        {((settings.store.indicatorMode & IndicatorMode.Dots) === IndicatorMode.Dots) && (
                            <div className="vc-typing-indicator-dots">
                                <ThreeDots dotRadius={3} themed={true} />
                            </div>
                        )}
                    </div>
                )}
            </Tooltip>
        );
    }

    return null;
}

const settings = definePluginSettings({
    includeCurrentChannel: {
        type: OptionType.BOOLEAN,
        description: "Whether to show the typing indicator for the currently selected channel",
        default: true
    },
    includeMutedChannels: {
        type: OptionType.BOOLEAN,
        description: "Whether to show the typing indicator for muted channels.",
        default: false
    },
    includeBlockedUsers: {
        type: OptionType.BOOLEAN,
        description: "Whether to show the typing indicator for blocked users.",
        default: false
    },
    indicatorMode: {
        type: OptionType.SELECT,
        description: "How should the indicator be displayed?",
        options: [
            { label: "Avatars and animated dots", value: IndicatorMode.Dots | IndicatorMode.Avatars, default: true },
            { label: "Animated dots", value: IndicatorMode.Dots },
            { label: "Avatars", value: IndicatorMode.Avatars },
        ],
    }
});

export default definePlugin({
    name: "TypingIndicator",
    description: "Adds an indicator if someone is typing on a channel.",
    authors: [Devs.Nuckyz, Devs.fawn, Devs.Sqaaakoi],
    settings,

    patches: [
        // Normal channel
        {
            find: "UNREAD_IMPORTANT:",
            replacement: {
                match: /\.Children\.count.+?:null(?<=,channel:(\i).+?)/,
                replace: "$&,$self.TypingIndicator($1.id,$1.getGuildId())"
            }
        },
        // Theads
        {
            // This is the thread "spine" that shows in the left
            find: "M0 15H2c0 1.6569",
            replacement: {
                match: /mentionsCount:\i.+?null(?<=channel:(\i).+?)/,
                replace: "$&,$self.TypingIndicator($1.id,$1.getGuildId())"
            }
        }
    ],

    TypingIndicator: (channelId: string, guildId: string) => (
        <ErrorBoundary noop>
            <TypingIndicator channelId={channelId} guildId={guildId} />
        </ErrorBoundary>
    ),
});
