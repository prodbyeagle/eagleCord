/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ScreenshareIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { openImageModal } from "@utils/discord";
import definePlugin from "@utils/types";
import { Channel, User } from "@vencord/discord-types";
import { Menu } from "@webpack/common";

import { ApplicationStreamingStore, ApplicationStreamPreviewStore } from "./webpack/stores";
import { ApplicationStream, Stream } from "./webpack/types/stores";

export interface UserContextProps {
    channel: Channel,
    channelSelected: boolean,
    className: string,
    config: { context: string; };
    context: string,
    onHeightUpdate: Function,
    position: string,
    target: HTMLElement,
    theme: string,
    user: User;
}

export interface StreamContextProps {
    appContext: string,
    className: string,
    config: { context: string; };
    context: string,
    exitFullscreen: Function,
    onHeightUpdate: Function,
    position: string,
    target: HTMLElement,
    stream: Stream,
    theme: string,
}

export const handleViewPreview = async ({ guildId, channelId, ownerId }: ApplicationStream | Stream) => {
    const previewUrl = await ApplicationStreamPreviewStore.getPreviewURL(guildId, channelId, ownerId);
    if (!previewUrl) return;

    openImageModal({
        url: previewUrl,
        height: 720,
        width: 1280
    });
};

export const addViewStreamContext: NavContextMenuPatchCallback = (children, { userId }: { userId: string | bigint; }) => {
    const stream = ApplicationStreamingStore.getAnyStreamForUser(userId);
    if (!stream) return;

    const streamPreviewItem = (
        <Menu.MenuItem
            label="View Stream Preview"
            id="view-stream-preview"
            icon={ScreenshareIcon}
            action={() => stream && handleViewPreview(stream)}
            disabled={!stream}
        />
    );

    children.push(<Menu.MenuSeparator />, streamPreviewItem);
};

export const streamContextPatch: NavContextMenuPatchCallback = (children, { stream }: StreamContextProps) => {
    return addViewStreamContext(children, { userId: stream.ownerId });
};

export const userContextPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (user) return addViewStreamContext(children, { userId: user.id });
};

export default definePlugin({
    name: "BiggerStreamPreview",
    description: "This plugin allows you to enlarge stream previews",
    authors: [Devs.phil],
    contextMenus: {
        "user-context": userContextPatch,
        "stream-context": streamContextPatch
    }
});
