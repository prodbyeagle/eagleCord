/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { authorizeCloud, deauthorizeCloud } from "@api/SettingsSync/cloudSetup";
import { deleteCloudSettings, eraseAllCloudData, getCloudSettings, putCloudSettings } from "@api/SettingsSync/cloudSync";
import { CheckedTextInput } from "@components/CheckedTextInput";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { Grid } from "@components/Grid";
import { Link } from "@components/Link";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { Margins } from "@utils/margins";
import { Alerts, Button, Forms, Tooltip } from "@webpack/common";

function validateUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch {
        return "Invalid URL";
    }
}

function SettingsSyncSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.settingsSync"]);
    const sectionEnabled = cloud.authenticated && cloud.settingsSync;

    return (
        <section className={Margins.top16}>
            <Forms.FormTitle tag="h5">Settings Sync</Forms.FormTitle>

            <Paragraph size="md" className={Margins.bottom20}>
                Synchronize your settings to the cloud. This allows easy synchronization across multiple devices with
                minimal effort.
            </Paragraph>
            <FormSwitch
                key="cloud-sync"
                title="Settings Sync"
                value={cloud.settingsSync}
                onChange={v => { cloud.settingsSync = v; }}
                disabled={!cloud.authenticated}
            />
            <div className="vc-cloud-settings-sync-grid">
                <Button
                    size={Button.Sizes.SMALL}
                    disabled={!sectionEnabled}
                    onClick={() => putCloudSettings(true)}
                >
                    Sync to Cloud
                </Button>
                <Tooltip text="This will overwrite your local settings with the ones on the cloud. Use wisely!">
                    {({ onMouseLeave, onMouseEnter }) => (
                        <Button
                            onMouseLeave={onMouseLeave}
                            onMouseEnter={onMouseEnter}
                            size={Button.Sizes.SMALL}
                            color={Button.Colors.RED}
                            disabled={!sectionEnabled}
                            onClick={() => getCloudSettings(true, true)}
                        >
                            Sync from Cloud
                        </Button>
                    )}
                </Tooltip>
                <Button
                    size={Button.Sizes.SMALL}
                    color={Button.Colors.RED}
                    disabled={!sectionEnabled}
                    onClick={() => deleteCloudSettings()}
                >
                    Delete Cloud Settings
                </Button>
            </div>
        </section>
    );
}

function CloudTab() {
    const settings = useSettings(["cloud.authenticated", "cloud.url"]);

    return (
        <SettingsTab>
            <section className={Margins.top16}>
                <Paragraph size="md" className={Margins.bottom20}>
                    Vencord comes with a cloud integration that adds goodies like settings sync across devices.
                    It <Link href="https://vencord.dev/cloud/privacy">respects your privacy</Link>, and
                    the <Link href="https://github.com/Vencord/Backend">source code</Link> is AGPL 3.0 licensed so you
                    can host it yourself.
                </Paragraph>
                <FormSwitch
                    key="backend"
                    title="Enable Cloud Integrations"
                    description="This will request authorization if you have not yet set up cloud integrations."
                    value={settings.cloud.authenticated}
                    onChange={v => {
                        if (v)
                            authorizeCloud();
                        else
                            settings.cloud.authenticated = v;
                    }}
                />
                <Forms.FormTitle tag="h5" className={Margins.top16}>Backend URL</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom8}>
                    Which backend to use when using cloud integrations.
                </Forms.FormText>
                <CheckedTextInput
                    key="backendUrl"
                    value={settings.cloud.url}
                    onChange={async v => {
                        settings.cloud.url = v;
                        settings.cloud.authenticated = false;
                        deauthorizeCloud();
                    }}
                    validate={validateUrl}
                />

                <Grid columns={2} gap="1em" className={Margins.top8}>
                    <Button
                        size={Button.Sizes.MEDIUM}
                        disabled={!settings.cloud.authenticated}
                        onClick={async () => {
                            await deauthorizeCloud();
                            settings.cloud.authenticated = false;
                            await authorizeCloud();
                        }}
                    >
                        Reauthorise
                    </Button>
                    <Button
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.RED}
                        disabled={!settings.cloud.authenticated}
                        onClick={() => Alerts.show({
                            title: "Are you sure?",
                            body: "Once your data is erased, we cannot recover it. There's no going back!",
                            onConfirm: eraseAllCloudData,
                            confirmText: "Erase it!",
                            confirmColor: "vc-cloud-erase-data-danger-btn",
                            cancelText: "Nevermind"
                        })}
                    >
                        Erase All Data
                    </Button>
                </Grid>

                <Divider className={Margins.top16} />
            </section >
            <SettingsSyncSection />
        </SettingsTab>
    );
}

export default wrapTab(CloudTab, "Cloud");
