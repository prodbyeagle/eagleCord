/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { findComponentByCodeLazy, findStoreLazy } from "@webpack";
import { Animations, useStateFromStores } from "@webpack/common";
import type { CSSProperties } from "react";

import { ExpandedGuildFolderStore, settings } from ".";

const ChannelRTCStore = findStoreLazy("ChannelRTCStore");
const GuildsBar = findComponentByCodeLazy('("guildsnav")');

export default ErrorBoundary.wrap(guildsBarProps => {
    const expandedFolders = useStateFromStores([ExpandedGuildFolderStore], () => ExpandedGuildFolderStore.getExpandedFolders());
    const isFullscreen = useStateFromStores([ChannelRTCStore], () => ChannelRTCStore.isFullscreenInContext());

    const Sidebar = (
        <GuildsBar
            {...guildsBarProps}
            isBetterFolders={true}
            betterFoldersExpandedIds={expandedFolders}
        />
    );

    const visible = !!expandedFolders.size;
    const guilds = document.querySelector(guildsBarProps.className.split(" ").map(c => `.${c}`).join(""));

    // We need to display none if we are in fullscreen. Yes this seems horrible doing with css, but it's literally how Discord does it.
    // Also display flex otherwise to fix scrolling.
    const sidebarStyle = {
        display: isFullscreen ? "none" : "flex"
    } satisfies CSSProperties;

    if (!guilds || !settings.store.sidebarAnim) {
        return visible
            ? <div className="vc-betterFolders-sidebar" style={sidebarStyle}>{Sidebar}</div>
            : null;
    }

    return (
        <Animations.Transition
            items={visible}
            from={{ width: 0 }}
            enter={{ width: guilds.getBoundingClientRect().width }}
            leave={{ width: 0 }}
            config={{ duration: 200 }}
        >
            {(animationStyle: any, show: any) =>
                show && (
                    <Animations.animated.div className="vc-betterFolders-sidebar"
                                             style={{ ...animationStyle, ...sidebarStyle }}>
                        {Sidebar}
                    </Animations.animated.div>
                )
            }
        </Animations.Transition>
    );
}, { noop: true });
