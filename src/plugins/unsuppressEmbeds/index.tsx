/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ImageInvisible, ImageVisible } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { MessageSnapshot } from "@vencord/discord-types";
import { Constants, Menu, PermissionsBits, PermissionStore, RestAPI, UserStore } from "@webpack/common";


const EMBED_SUPPRESSED = 1 << 2;

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, { channel, message: { author, messageSnapshots, embeds, flags, id: messageId } }) => {
    const isEmbedSuppressed = (flags & EMBED_SUPPRESSED) !== 0;
    const hasEmbedsInSnapshots = messageSnapshots.some(
        (snapshot: MessageSnapshot) => snapshot?.message.embeds.length
    );

    if (!isEmbedSuppressed && !embeds.length && !hasEmbedsInSnapshots) return;

    const hasEmbedPerms = channel.isPrivate() || !!(PermissionStore.getChannelPermissions({ id: channel.id }) & PermissionsBits.EMBED_LINKS);
    if (author.id === UserStore.getCurrentUser().id && !hasEmbedPerms) return;

    const menuGroup = findGroupChildrenByChildId("delete", children);
    const deleteIndex = menuGroup?.findIndex(i => i?.props?.id === "delete");
    if (!deleteIndex || !menuGroup) return;

    menuGroup.splice(deleteIndex - 1, 0, (
        <Menu.MenuItem
            id="unsuppress-embeds"
            key="unsuppress-embeds"
            label={isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds"}
            color={isEmbedSuppressed ? undefined : "danger"}
            icon={isEmbedSuppressed ? ImageVisible : ImageInvisible}
            action={() =>
                RestAPI.patch({
                    url: Constants.Endpoints.MESSAGE(channel.id, messageId),
                    body: { flags: isEmbedSuppressed ? flags & ~EMBED_SUPPRESSED : flags | EMBED_SUPPRESSED }
                })
            }
        />
    ));
};

export default definePlugin({
    name: "UnsuppressEmbeds",
    authors: [Devs.rad, Devs.HypedDomi],
    description: "Allows you to unsuppress embeds in messages",
    contextMenus: {
        "message": messageContextMenuPatch
    }
});
