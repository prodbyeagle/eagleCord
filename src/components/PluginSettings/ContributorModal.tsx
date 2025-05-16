/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./contributorModal.css";

import { useSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import ErrorBoundary from "@components/ErrorBoundary";
import { Link } from "@components/Link";
import { DevsById } from "@utils/constants";
import { fetchUserProfile } from "@utils/discord";
import { classes, pluralise } from "@utils/misc";
import { ModalContent, ModalRoot, openModal } from "@utils/modal";
import { Avatar, Forms, showToast, useEffect, useMemo, UserProfileStore, useStateFromStores } from "@webpack/common";
import { User } from "discord-types/general";

import Plugins from "~plugins";

import { PluginCard } from ".";
import { GithubButton, WebsiteButton } from "./LinkIconButton";

const cl = classNameFactory("vc-author-modal-");

export function openContributorModal(user: User) {
    openModal(modalProps =>
        <ModalRoot {...modalProps}>
            <ErrorBoundary>
                <ModalContent className={cl("root")}>
                    <ContributorModal user={user} />
                </ModalContent>
            </ErrorBoundary>
        </ModalRoot>
    );
}

export function openEagleCordModal(user: User) {
    openModal(modalProps =>
        <ModalRoot {...modalProps}>
            <ErrorBoundary>
                <ModalContent className={cl("root")}>
                    <EagleCordModal user={user} />
                </ModalContent>
            </ErrorBoundary>
        </ModalRoot>
    );
}

export function openEagleModal() {
    openModal(modalProps =>
        <ModalRoot {...modalProps}>
            <ErrorBoundary>
                <ModalContent className={cl("root")}>
                    <EagleModal />
                </ModalContent>
            </ErrorBoundary>
        </ModalRoot>
    );
}

function EagleCordModal({ user }: { user: User; }) {
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.5rem",
                }}
            >
                <Avatar
                    src={user.getAvatarURL(void 0, 128, true)}
                    size={"SIZE_120"}
                />

                <Forms.FormTitle tag="h1">
                    Welcome to <strong>EagleCord</strong>
                </Forms.FormTitle>

                <Forms.FormText>
                    You're running a custom build of Vencord, modified by <strong>@prodbyeagle</strong>.
                </Forms.FormText>

                <Forms.FormText>
                    This version adds some easter eggs, UI tweaks, and custom enhancements.
                </Forms.FormText>

                <Forms.FormText>
                    The EagleCord badge is shown to every user as a subtle signature of this modded experience.
                </Forms.FormText>

                <div className={cl("modal-links")}>
                    <WebsiteButton
                        text="prodbyeagle's Website"
                        href="https://prodbyeagle.vercel.app/"
                    />
                    <GithubButton
                        text="GitHub"
                        href="https://github.com/prodbyeagle"
                    />
                </div>
            </div>
        </div>
    );
}

function EagleModal() {
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.5rem",
                }}
            >
                <Avatar
                    src="https://cdn.discordapp.com/avatars/893759402832699392/31f821743ad2b667b0853208e38607dc.webp?size=2048&format=webp"
                    size={"SIZE_120"}
                />

                <Forms.FormTitle tag="h1">
                    made by <strong>@prodbyeagle</strong>
                </Forms.FormTitle>

                <Forms.FormText>
                    one day i looked at vencord and thought: "what if i just... put myself in here?"
                    and then i did.
                </Forms.FormText>

                <Forms.FormText>
                    Pro tip: If you're reading this, you're probably using my modded Version of Vencord. Congrats on finding this EasterEgg.
                </Forms.FormText>
            </div>
        </div>
    );
}

function ContributorModal({ user }: { user: User; }) {
    useSettings();

    const profile = useStateFromStores([UserProfileStore], () => UserProfileStore.getUserProfile(user.id));

    useEffect(() => {
        if (!profile && !user.bot && user.id)
            fetchUserProfile(user.id);
    }, [user.id, user.bot, profile]);

    const githubName = profile?.connectedAccounts?.find(a => a.type === "github")?.name;
    const website = profile?.connectedAccounts?.find(a => a.type === "domain")?.name;

    const plugins = useMemo(() => {
        const allPlugins = Object.values(Plugins);
        const pluginsByAuthor = DevsById[user.id]
            ? allPlugins.filter(p => p.authors.includes(DevsById[user.id]))
            : allPlugins.filter(p => p.authors.some(a => a.name === user.username));

        return pluginsByAuthor
            .filter(p => !p.name.endsWith("API"))
            .sort((a, b) => Number(a.required ?? false) - Number(b.required ?? false));
    }, [user.id, user.username]);

    const ContributedHyperLink = <Link href="https://vencord.dev/source">contributed</Link>;

    return (
        <>
            <div className={cl("header")}>
                <img
                    className={cl("avatar")}
                    src={user.getAvatarURL(void 0, 512, true)}
                    alt=""
                />
                <Forms.FormTitle tag="h2" className={cl("name")}>{user.username}</Forms.FormTitle>

                <div className={classes("vc-settings-modal-links", cl("links"))}>
                    {website && (
                        <WebsiteButton
                            text={website}
                            href={`https://${website}`}
                        />
                    )}
                    {githubName && (
                        <GithubButton
                            text={githubName}
                            href={`https://github.com/${githubName}`}
                        />
                    )}
                </div>
            </div>

            {plugins.length ? (
                <Forms.FormText>
                    This person has {ContributedHyperLink} to {pluralise(plugins.length, "plugin")}!
                </Forms.FormText>
            ) : (
                <Forms.FormText>
                    This person has not made any plugins. They likely {ContributedHyperLink} to Vencord in other ways!
                </Forms.FormText>
            )}

            {!!plugins.length && (
                <div className={cl("plugins")}>
                    {plugins.map(p =>
                        <PluginCard
                            key={p.name}
                            plugin={p}
                            disabled={p.required ?? false}
                            onRestartNeeded={() => showToast("Restart to apply changes!")}
                        />
                    )}
                </div>
            )}
        </>
    );
}
