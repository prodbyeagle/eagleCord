import definePlugin, { OptionType } from "@utils/types";
import {
    addProfileBadge,
    BadgePosition,
    ProfileBadge,
    removeProfileBadge,
} from "@api/Badges";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { BADGES } from "./badges";
import { definePluginSettings, SettingsStore } from "@api/Settings";
import { UserStore } from "@webpack/common";

const logger = new Logger("FakeBadges", "#5aa5ff");
const registeredBadges: ProfileBadge[] = [];

const settings = definePluginSettings(
    Object.fromEntries(
        BADGES.map((badge) => [
            badge.name,
            {
                type: OptionType.BOOLEAN,
                description: badge.description,
                default: true,
                restartNeeded: true,
            },
        ])
    )
);
settings.pluginName = "FakeBadges";

export default definePlugin({
    name: "FakeBadges",
    description: "Add fake badges that you can wear.",
    authors: [Devs.prodbyeagle],
    settings,

    start() {
        const currentUserId = UserStore.getCurrentUser()?.id;

        if (!currentUserId) {
            logger.warn("No current user found. Aborting badge registration.");
            return;
        }

        logger.info(`Starting badge registration for user ID: ${currentUserId}`);

        for (const badge of registeredBadges) {
            removeProfileBadge(badge);
            logger.debug(`Removed badge: ${badge.description}`);
        }
        registeredBadges.length = 0;

        let registeredCount = 0;

        const pluginSettings = SettingsStore.store.plugins.FakeBadges;

        for (const badge of BADGES) {
            const isEnabled = pluginSettings?.[badge.name] ?? true;
            logger.debug(isEnabled);

            logger.debug(`Badge "${badge.name}" setting: ${isEnabled}`);

            if (!isEnabled) {
                continue;
            }

            const profileBadge: ProfileBadge = {
                description: badge.tooltip,
                image: badge.image,
                position: BadgePosition.END,
                shouldShow: ({ userId }) => userId === currentUserId,
            };

            try {
                addProfileBadge(profileBadge);
                registeredBadges.push(profileBadge);
                registeredCount++;
                logger.info(`Added badge: "${badge.name}"`);
            } catch (err) {
                logger.error(`Failed to add badge "${badge.name}":`, err);
            }
        }

        logger.info(`Badge registration complete. Total badges registered: ${registeredCount}`);
    },

    stop() {
        logger.info(`Stopping plugin. Removing ${registeredBadges.length} badges.`);

        for (const badge of registeredBadges) {
            try {
                removeProfileBadge(badge);
                logger.debug(`Removed badge: ${badge.description}`);
            } catch (err) {
                logger.error(`Failed to remove badge "${badge.description}":`, err);
            }
        }

        registeredBadges.length = 0;
        logger.info("Unregistered all fake badges.");
    },
});
