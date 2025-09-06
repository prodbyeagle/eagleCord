/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./fixDiscordBadgePadding.css";

import { _getBadges, addProfileBadge, BadgePosition, BadgeUserArgs, ProfileBadge } from "@api/Badges";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Heart } from "@components/Heart";
import DonateButton from "@components/settings/DonateButton";
import { openContributorModal, openStaffModal } from "@components/settings/tabs";
import { EAGLECORD_ICON_IMAGE } from "@components/settings/tabs/vencord";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { Margins } from "@utils/margins";
import { copyWithToast, shouldShowContributorBadge } from "@utils/misc";
import { closeModal, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { User } from "@vencord/discord-types";
import { ContextMenuApi, Forms, Menu, Toasts, UserStore } from "@webpack/common";

// const CONTRIBUTOR_BADGE = "https://cdn.discordapp.com/emojis/1092089799109775453.png?size=64";
const OWNER_BADGE = "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png";

const ContributorBadge: ProfileBadge = {
    description: "EagleCord Contributor",
    image: EAGLECORD_ICON_IMAGE,
    position: BadgePosition.END,
    shouldShow: ({ userId }) => shouldShowContributorBadge(userId),
    onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId)),
    props: { style: { scale: 0.85 } }
};

const FormerStaff: ProfileBadge = {
    description: "Former Staff",
    image: OWNER_BADGE,
    position: BadgePosition.END,
    onClick: () => openStaffModal(FormerStaff),
    shouldShow: ({ userId }) => ["1093444260491165777", "773166395147157504"].includes(userId),
    props: {
        style: {
            filter: "grayscale(100%)"
        }
    },
};

const OwnerBadge: ProfileBadge = {
    description: "Owner",
    image: OWNER_BADGE,
    position: BadgePosition.END,
    shouldShow: ({ userId }) => ["893759402832699392"].includes(userId),
    onClick: () => openEaglePage(),
};

function openEaglePage() {
    VencordNative.native.openExternal("https://prodbyeagle.vercel.app/");
}

let DonorBadges = {} as Record<string, Array<Record<"tooltip" | "badge", string>>>;
let EagleBadges = {} as Record<string, Array<Record<"tooltip" | "badge", string>>>;

async function loadBadges(noCache = false) {
    const init = {} as RequestInit;
    if (noCache)
        init.cache = "no-cache";

    DonorBadges = await fetch("https://badges.vencord.dev/badges.json", init)
        .then(r => r.json());

    EagleBadges = await fetch("https://raw.githubusercontent.com/prodbyeagle/dotfiles/refs/heads/main/Vencord/eagleCord/badges.json", init)
        .then(r => r.json());

    addProfileBadge(OwnerBadge);
    addProfileBadge(FormerStaff);
}

let intervalId: any;

function BadgeContextMenu({ badge }: { badge: ProfileBadge & BadgeUserArgs; }) {
    console.log(badge);
    return (
        <Menu.Menu
            navId="vc-badge-context"
            onClose={ContextMenuApi.closeContextMenu}
            aria-label="Badge Options"
        >
            {badge.description && (
                <Menu.MenuItem
                    id="vc-badge-copy-name"
                    label="Copy Badge Name"
                    action={() => copyWithToast(badge.description!)}
                />
            )}
            {badge.image && (
                <Menu.MenuItem
                    id="vc-badge-copy-link"
                    label="Copy Badge Image Link"
                    action={() => copyWithToast(badge.image!)}
                />
            )}
        </Menu.Menu>
    );
}

export default definePlugin({
    name: "BadgeAPI",
    description: "API to add badges to users. (modded by prodbyeagle)",
    authors: [Devs.prodbyeagle, Devs.Megu, Devs.Ven, Devs.TheSun],
    required: true,

    patches: [
        {
            find: ".MODAL]:26",
            replacement: {
                match: /(?=;return 0===(\i)\.length\?)(?<=(\i)\.useMemo.+?)/,
                replace: ";$1=$2.useMemo(()=>[...$self.getBadges(arguments[0].displayProfile),...$1],[$1])"
            }
        },
        {
            find: "#{intl::PROFILE_USER_BADGES}",
            replacement: [
                {
                    match: /(alt:" ","aria-hidden":!0,src:)(.+?)(?=,)(?<=href:(\i)\.link.+?)/,
                    replace: (_, rest, originalSrc, badge) => `...${badge}.props,${rest}${badge}.image??(${originalSrc})`
                },
                {
                    match: /(?<="aria-label":(\i)\.description,.{0,200})children:/,
                    replace: "children:$1.component?$self.renderBadgeComponent({...$1}) :"
                },
                // handle onClick and onContextMenu
                {
                    match: /href:(\i)\.link/,
                    replace: "...$self.getBadgeMouseEventHandlers($1),$&"
                }
            ]
        }
    ],

    // for access from the console or other plugins
    get DonorBadges() {
        return DonorBadges;
    },

    // for access from the console or other plugins
    get EagleBadges() {
        return EagleBadges;
    },

    toolboxActions: {
        async "Refetch Badges"() {
            await loadBadges(true);
            Toasts.show({
                id: Toasts.genId(),
                message: "Successfully refetched badges!",
                type: Toasts.Type.SUCCESS
            });
        }
    },

    userProfileBadge: ContributorBadge,

    async start() {
        await loadBadges();

        clearInterval(intervalId);
        intervalId = setInterval(loadBadges, 1000 * 60 * 30); // 30 minutes
    },

    async stop() {
        clearInterval(intervalId);
    },

    getBadges(props: { userId: string; user?: User; guildId: string; }) {
        if (!props) return [];

        try {
            props.userId ??= props.user?.id!;

            return _getBadges(props);
        } catch (e) {
            new Logger("BadgeAPI#hasBadges").error(e);
            return [];
        }
    },

    renderBadgeComponent: ErrorBoundary.wrap((badge: ProfileBadge & BadgeUserArgs) => {
        const Component = badge.component!;
        return <Component {...badge} />;
    }, { noop: true }),

    getBadgeMouseEventHandlers(badge: ProfileBadge & BadgeUserArgs) {
        const handlers = {} as Record<string, (e: React.MouseEvent) => void>;

        if (!badge) return handlers; // sanity check

        const { onClick, onContextMenu } = badge;

        if (onClick) handlers.onClick = e => onClick(e, badge);
        if (onContextMenu) handlers.onContextMenu = e => onContextMenu(e, badge);

        return handlers;
    },



    getDonorBadges(userId: string) {
        return DonorBadges[userId]?.map(badge => ({
            image: badge.badge,
            description: badge.tooltip,
            position: BadgePosition.START,
            props: {
                style: {
                    borderRadius: "50%",
                    transform: "scale(0.9)" // The image is a bit too big compared to default badges
                }
            },
            onContextMenu(event, badge) {
                ContextMenuApi.openContextMenu(event, () => <BadgeContextMenu badge={badge} />);
            },
            onClick() {
                const modalKey = openModal(props => (
                    <ErrorBoundary noop onError={() => {
                        closeModal(modalKey);
                        VencordNative.native.openExternal("https://github.com/sponsors/Vendicated");
                    }}>
                        <ModalRoot {...props}>
                            <ModalHeader>
                                <Flex style={{ width: "100%", justifyContent: "center" }}>
                                    <Forms.FormTitle
                                        tag="h2"
                                        style={{
                                            width: "100%",
                                            textAlign: "center",
                                            margin: 0
                                        }}
                                    >
                                        <Heart />
                                        Vencord Donor
                                    </Forms.FormTitle>
                                </Flex>
                            </ModalHeader>
                            <ModalContent>
                                <Flex>
                                    <img
                                        role="presentation"
                                        src="https://cdn.discordapp.com/emojis/1026533070955872337.png"
                                        alt=""
                                        style={{ margin: "auto" }}
                                    />
                                    <img
                                        role="presentation"
                                        src="https://cdn.discordapp.com/emojis/1026533090627174460.png"
                                        alt=""
                                        style={{ margin: "auto" }}
                                    />
                                </Flex>
                                <div style={{ padding: "1em" }}>
                                    <Forms.FormText>
                                        This Badge is a special perk for Vencord Donors
                                    </Forms.FormText>
                                    <Forms.FormText className={Margins.top20}>
                                        Please consider supporting the development of Vencord by becoming a donor. It would mean a lot!!
                                    </Forms.FormText>
                                </div>
                            </ModalContent>
                            <ModalFooter>
                                <Flex style={{ width: "100%", justifyContent: "center" }}>
                                    <DonateButton />
                                </Flex>
                            </ModalFooter>
                        </ModalRoot>
                    </ErrorBoundary>
                ));
            },
        }) satisfies ProfileBadge);
    },

    getEagleCordBadges(userId: string) {
        return EagleBadges[userId]?.map(badge => ({
            image: badge.badge,
            description: badge.tooltip,
            position: BadgePosition.START,
            props: {
                style: {
                    borderRadius: "50%",
                    transform: "scale(0.9)" // The image is a bit too big compared to default badges
                }
            },
            onContextMenu(event, badge) {
                ContextMenuApi.openContextMenu(event, () => <BadgeContextMenu badge={badge} />);
            },
            onClick() {
                const modalKey = openModal(props => (
                    <ErrorBoundary
                        noop
                        onError={() => {
                            closeModal(modalKey);
                        }}
                    >
                        <ModalRoot {...props}>
                            <ModalHeader>
                                <Flex style={{ width: "100%", justifyContent: "center" }}>
                                    <Forms.FormTitle
                                        style={{
                                            width: "100%",
                                            textAlign: "center",
                                            margin: 0,
                                        }}
                                    >
                                        🦅 EagleCord
                                    </Forms.FormTitle>
                                </Flex>
                            </ModalHeader>

                            <ModalContent>
                                <Flex style={{ justifyContent: "center", gap: "1rem" }}>
                                    <img
                                        src={badge.badge}
                                        alt="EagleCord Badge"
                                        style={{
                                            width: 128,
                                            height: 128,
                                        }}
                                    />
                                </Flex>
                                <div style={{ padding: "1em", textAlign: "center" }}>
                                    <Forms.FormText>{badge.tooltip}</Forms.FormText>
                                    <Forms.FormText className={Margins.top20}>
                                        {badge.tooltip === "EagleCord User"
                                            ? "This badge is given by 'prodbyeagle'. The Creator of EagleCord"
                                            : "This is a custom badge from the EagleCord project, made by the user you are currently visiting."}
                                    </Forms.FormText>
                                </div>
                            </ModalContent>
                        </ModalRoot>
                    </ErrorBoundary>
                ));
            },
        }) satisfies ProfileBadge);
    }
});
