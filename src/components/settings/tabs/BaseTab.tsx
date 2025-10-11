/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import ErrorBoundary from "@components/ErrorBoundary";
import { handleComponentFailed } from "@components/handleComponentFailed";
import { Margins } from "@utils/margins";
import { onlyOnce } from "@utils/onlyOnce";
import type { ComponentType, PropsWithChildren } from "react";

export function SettingsTab({ title, children }: PropsWithChildren<{ title: string; }>) {
    return (
        <section>
            <BaseText tag="h2" size="xl" weight="semibold" className={Margins.bottom16}>{title}</BaseText>
            {children}
        </section>
    );
}

export const handleSettingsTabError = onlyOnce(handleComponentFailed);

export function wrapTab(component: ComponentType<any>, tab: string) {
    return ErrorBoundary.wrap(component, {
        message: `Failed to render the ${tab} tab. If this issue persists, try using the installer to reinstall!`,
        onError: handleSettingsTabError,
    });
}
