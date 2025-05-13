/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./fixDiscordBadgePadding.css";

import { _getBadges, BadgePosition, BadgeUserArgs, ProfileBadge } from "@api/Badges";
import DonateButton from "@components/DonateButton";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Heart } from "@components/Heart";
import { openContributorModal, openEagleModal } from "@components/PluginSettings/ContributorModal";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { Margins } from "@utils/margins";
import { isPluginDev } from "@utils/misc";
import { closeModal, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Forms, Toasts, UserStore } from "@webpack/common";
import { User } from "discord-types/general";

const CONTRIBUTOR_BADGE = "https://vencord.dev/assets/favicon.png";
const EAGLE_BADGE = "https://kappa.lol/WTiY5";
const DWH_BADGE = "https://kappa.lol/L3tbR";

const ContributorBadge: ProfileBadge = {
    description: "Vencord Contributor",
    image: CONTRIBUTOR_BADGE,
    position: BadgePosition.END,
    shouldShow: ({ userId }) => isPluginDev(userId),
    onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId))
};

const EagleBadge: ProfileBadge = {
    description: "prodbyeagle should sybau 🥀😭✌️✌️",
    image: EAGLE_BADGE,
    position: BadgePosition.START,
    shouldShow: ({ userId }) => userId === "893759402832699392",
    onClick: (() => openEagleModal())
};

const DWHBadge: ProfileBadge = {
    description: "dwhincandi was here.",
    image: DWH_BADGE,
    position: BadgePosition.START,
    shouldShow: ({ userId }) => userId === "893792975761584139",
};

let DonorBadges = {} as Record<string, Array<Record<"tooltip" | "badge", string>>>;

async function loadBadges(noCache = false) {
    DonorBadges = {};

    const init = {} as RequestInit;
    if (noCache)
        init.cache = "no-cache";

    DonorBadges = await fetch("https://badges.vencord.dev/badges.json", init)
        .then(r => r.json());
}

export default definePlugin({
    name: "BadgeAPI",
    description: "API to add badges to users.",
    authors: [Devs.Megu, Devs.Ven, Devs.TheSun],
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
                // conditionally override their onClick with badge.onClick if it exists
                {
                    match: /href:(\i)\.link/,
                    replace: "...($1.onClick&&{onClick:vcE=>$1.onClick(vcE,$1)}),$&"
                }
            ]
        }
    ],

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

        const store = Vencord.Webpack.findStore("UserProfileStore");
        if (!store || !store.getUserProfile) return;

        const original = store.getUserProfile.bind(store);
        store.getUserProfile = function (id) {
            const r = original(id);
            if (r && id === Vencord.Webpack.Common.UserStore.getCurrentUser()?.id) {
                r.badges = [
                    { id: "hypesquad_house_1", description: "HypeSquad Bravery", icon: "8a88d63823d8a71cd5e390baa45efa02", link: "https://discord.com/settings/hypesquad-online" },
                    { id: "hypesquad", description: "HypeSquad Events", icon: "bf01d1073931f921909045f3a39fd264", link: "https://discord.com/hypesquad" },
                    // { id: "early_supporter", description: "Early Supporter", icon: "7060786766c9c840eb3019e725d2b358", link: "https://discord.com/settings/premium" },
                    { id: "active_developer", description: "Active Developer", icon: "6bdc42827a38498929a4920da12695d9", link: "https://support-dev.discord.com/hc/en-us/articles/10113997751447" },
                    // { id: "verified_developer", description: "Early Verified Bot Developer", icon: "6df5892e0f35b051f8b61eace34f4967" },
                    { id: "bug_hunter_level_2", description: "Discord Bug Hunter", icon: "848f79194d4be5ff5f81505cbd0ce1e6", link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs" },
                    { id: "staff", description: "Discord Staff", icon: "5e74e9b61934fc1f67c65515d1f7e60d", link: "https://discord.com/company" }
                ];
            }
            return r;
        };
    },

    // getBadges(props: { userId: string; user?: User; guildId: string; }) {
    //     if (!props) return [];

    //     try {
    //         props.userId ??= props.user?.id!;

    //         return _getBadges(props);
    //     } catch (e) {
    //         new Logger("BadgeAPI#hasBadges").error(e);
    //         return [];
    //     }
    // },

    getBadges(props: { userId: string; user?: User; guildId: string; }) {
        if (!props || !props.userId) return [];

        try {
            const userId = props.userId ?? props.user?.id;
            if (!userId) return [];

            const badges = [
                ...(isPluginDev(userId) ? [ContributorBadge] : []),
                ...(userId === "893759402832699392" ? [EagleBadge] : []),
                ...(userId === "893792975761584139" ? [DWHBadge] : []),
                ...(this.getDonorBadges?.(userId) ?? []),
            ];

            return badges;
        } catch (e) {
            new Logger("BadgeAPI#getBadges").error(e);
            return [];
        }
    },

    renderBadgeComponent: ErrorBoundary.wrap((badge: ProfileBadge & BadgeUserArgs) => {
        const Component = badge.component!;
        return <Component {...badge} />;
    }, { noop: true }),

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
        }));
    }
});
