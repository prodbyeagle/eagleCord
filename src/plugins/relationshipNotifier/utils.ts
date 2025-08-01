/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore, Notices } from "@api/index";
import { showNotification } from "@api/Notifications";
import { getUniqueUsername, openUserProfile } from "@utils/discord";
import { FluxStore } from "@vencord/discord-types";
import { findStoreLazy } from "@webpack";
import { ChannelStore, GuildMemberStore, GuildStore, RelationshipStore, UserStore, UserUtils } from "@webpack/common";

import settings from "./settings";
import { ChannelType, RelationshipType, SimpleGroupChannel, SimpleGuild } from "./types";

export const GuildAvailabilityStore = findStoreLazy("GuildAvailabilityStore") as FluxStore & {
    totalGuilds: number;
    totalUnavailableGuilds: number;
    unavailableGuilds: string[];
    isUnavailable(guildId: string): boolean;
};

const guilds = new Map<string, SimpleGuild>();
const groups = new Map<string, SimpleGroupChannel>();
const friends = {
    friends: [] as string[],
    requests: [] as string[]
};

const guildsKey = () => `relationship-notifier-guilds-${UserStore.getCurrentUser().id}`;
const groupsKey = () => `relationship-notifier-groups-${UserStore.getCurrentUser().id}`;
const friendsKey = () => `relationship-notifier-friends-${UserStore.getCurrentUser().id}`;

async function runMigrations() {
    DataStore.delMany(["relationship-notifier-guilds", "relationship-notifier-groups", "relationship-notifier-friends"]);
}

export async function syncAndRunChecks() {
    await runMigrations();
    if (UserStore.getCurrentUser() == null) return;

    const [oldGuilds, oldGroups, oldFriends] = await DataStore.getMany([
        guildsKey(),
        groupsKey(),
        friendsKey()
    ]) as [Map<string, SimpleGuild> | undefined, Map<string, SimpleGroupChannel> | undefined, Record<"friends" | "requests", string[]> | undefined];

    await Promise.all([syncGuilds(), syncGroups(), syncFriends()]);

    if (settings.store.offlineRemovals) {
        if (settings.store.groups && oldGroups?.size) {
            for (const [id, group] of oldGroups) {
                if (!groups.has(id))
                    notify(`You are no longer in the group ${group.name}.`, group.iconURL);
            }
        }

        if (settings.store.servers && oldGuilds?.size) {
            for (const [id, guild] of oldGuilds) {
                if (!guilds.has(id) && !GuildAvailabilityStore.isUnavailable(id))
                    notify(`You are no longer in the server ${guild.name}.`, guild.iconURL);
            }
        }

        if (settings.store.friends && oldFriends?.friends.length) {
            for (const id of oldFriends.friends) {
                if (friends.friends.includes(id)) continue;

                const user = await UserUtils.getUser(id).catch(() => void 0);
                if (user)
                    notify(
                        `You are no longer friends with ${getUniqueUsername(user)}.`,
                        user.getAvatarURL(undefined, undefined, false),
                        () => openUserProfile(user.id)
                    );
            }
        }

        if (settings.store.friendRequestCancels && oldFriends?.requests?.length) {
            for (const id of oldFriends.requests) {
                if (
                    friends.requests.includes(id) ||
                    [RelationshipType.FRIEND, RelationshipType.BLOCKED, RelationshipType.OUTGOING_REQUEST].includes(RelationshipStore.getRelationshipType(id))
                ) continue;

                const user = await UserUtils.getUser(id).catch(() => void 0);
                if (user)
                    notify(
                        `Friend request from ${getUniqueUsername(user)} has been revoked.`,
                        user.getAvatarURL(undefined, undefined, false),
                        () => openUserProfile(user.id)
                    );
            }
        }
    }
}

export function notify(text: string, icon?: string, onClick?: () => void) {
    if (settings.store.notices)
        Notices.showNotice(text, "OK", () => Notices.popNotice());

    showNotification({
        title: "Relationship Notifier",
        body: text,
        icon,
        onClick
    });
}

export function getGuild(id: string) {
    return guilds.get(id);
}

export function deleteGuild(id: string) {
    guilds.delete(id);
    syncGuilds();
}

export async function syncGuilds() {
    guilds.clear();

    const me = UserStore.getCurrentUser().id;
    for (const [id, { name, icon }] of Object.entries(GuildStore.getGuilds())) {
        if (GuildMemberStore.isMember(id, me))
            guilds.set(id, {
                id,
                name,
                iconURL: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`
            });
    }
    await DataStore.set(guildsKey(), guilds);
}

export function getGroup(id: string) {
    return groups.get(id);
}

export function deleteGroup(id: string) {
    groups.delete(id);
    syncGroups();
}

export async function syncGroups() {
    groups.clear();

    for (const { type, id, name, rawRecipients, icon } of ChannelStore.getSortedPrivateChannels()) {
        if (type === ChannelType.GROUP_DM)
            groups.set(id, {
                id,
                name: name || rawRecipients.map(r => r.username).join(", "),
                iconURL: icon && `https://cdn.discordapp.com/channel-icons/${id}/${icon}.png`
            });
    }

    await DataStore.set(groupsKey(), groups);
}

export async function syncFriends() {
    friends.friends = [];
    friends.requests = [];

    const relationShips = RelationshipStore.getMutableRelationships();
    for (const [id, type] of relationShips) {
        switch (type) {
            case RelationshipType.FRIEND:
                friends.friends.push(id);
                break;
            case RelationshipType.INCOMING_REQUEST:
                friends.requests.push(id);
                break;
        }
    }

    await DataStore.set(friendsKey(), friends);
}
