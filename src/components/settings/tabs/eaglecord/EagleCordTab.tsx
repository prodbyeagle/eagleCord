import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { SpecialCard } from "@components/settings/SpecialCard";
import { React, Forms, Switch, UserStore } from "@webpack/common";
import { useSettings } from "@api/Settings";
import { Margins } from "@utils/margins";
import { CONTRIB_BACKGROUND_IMAGE, EAGLECORD_ICON_IMAGE } from "../vencord";

function EagleCordTab() {
    const user = UserStore.getCurrentUser();

    const settings = useSettings([
        "plugins.eaglecord.showEagleBadges",
        "plugins.eaglecord.showCustomBanners"
    ]);

    return (
        <SettingsTab title="EagleCord">
            <SpecialCard
                title="EagleCord"
                subtitle="Custom Discord Experience"
                description="Welcome to your personalized EagleCord space!"
                cardImage={EAGLECORD_ICON_IMAGE}
                backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                backgroundColor="#b083c9"
            />

            <Forms.FormSection className={Margins.top16} title="User Info">
                <Forms.FormText>
                    You are currently logged in as: <strong>{user?.username}</strong>
                </Forms.FormText>
            </Forms.FormSection>

            <Forms.FormSection className={Margins.top16} title="Feature Flags">
                <Switch
                    key="plugins.eaglecord.showEagleBadges"
                    value={settings["plugins.eaglecord.showEagleBadges"]}
                    onChange={v => settings["plugins.eaglecord.showEagleBadges"] = v}
                    note="Display EagleCord-specific user badges where supported."
                >
                    Show EagleCord Badges
                </Switch>

                <Switch
                    key="plugins.eaglecord.showCustomBanners"
                    value={settings["plugins.eaglecord.showCustomBanners"]}
                    onChange={v => settings["plugins.eaglecord.showCustomBanners"] = v}
                    note="Render custom banners in profiles and settings."
                >
                    Show Custom Banners
                </Switch>
            </Forms.FormSection>
        </SettingsTab>
    );
}

export default wrapTab(EagleCordTab, "EagleCord");
