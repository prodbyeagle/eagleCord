/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { FormSwitch } from "@components/FormSwitch";
import { HeadingTertiary } from "@components/Heading";
import { SpecialCard } from "@components/settings/SpecialCard";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { CONTRIB_BACKGROUND_IMAGE, EAGLECORD_ICON_IMAGE } from "@utils/constants";
import { Margins } from "@utils/margins";

function EagleCordTab() {

    const settings = useSettings([
        "eaglecord.showBanner",
    ]);

    return (
        <SettingsTab title="EagleCord">
            <SpecialCard
                title="EagleCord"
                subtitle="Entwickelt mit ❤️ für die Psychiatrie."
                description="EagleCord erweitert Vencord um visuelle Verbesserungen, eigene Badges, Themes und mehr."
                cardImage={EAGLECORD_ICON_IMAGE}
                backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                backgroundColor="#cfa6f5"
            />

            <section className={Margins.top20}>
                <HeadingTertiary className={Margins.bottom8}>Funktionen</HeadingTertiary>
                <FormSwitch
                    title="Benutzerdefinierte Banner anzeigen"
                    description="Zeigt benutzerdefinierte Banner in Profilen und Einstellungen."
                    value={settings.eaglecord.showBanner}
                    onChange={(v: boolean) => settings.eaglecord.showBanner = v}
                />
            </section>
        </SettingsTab>
    );
}

export default wrapTab(EagleCordTab, "EagleCord");
