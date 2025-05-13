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
import { Forms, showToast, useEffect, useMemo, UserProfileStore, useStateFromStores } from "@webpack/common";
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

function EagleModal() {
    return (
        <div className={cl("eagle-modal")}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.5rem",
                }}
            >
                <img
                    src="https://kappa.lol/WTiY5"
                    alt="prodbyeagle badge"
                    width={256}
                    height={256}
                />

                <Forms.FormTitle tag="h3" style={{ marginBottom: 0 }}>
                    injected by <strong>@prodbyeagle</strong>
                </Forms.FormTitle>

                <Forms.FormText>
                    One day I looked at Vencord and thought: "What if I just... put myself in here?"
                    And then I did. You're welcome.
                </Forms.FormText>

                <Forms.FormText>
                    This isn't a feature.
                    It's a **lore drop**.
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
