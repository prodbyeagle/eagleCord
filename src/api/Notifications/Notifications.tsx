/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import NotificationComponent from "@api/Notifications/NotificationComponent";
import { persistNotification } from "@api/Notifications/notificationLog";
import { Settings } from "@api/Settings";
import { Queue } from "@utils/Queue";
import { createRoot } from "@webpack/common";
import type { ReactNode } from "react";
import type { Root } from "react-dom/client";

const NotificationQueue = new Queue();

let reactRoot: Root;
let id = 42;

function getRoot() {
    if (!reactRoot) {
        const container = document.createElement("div");
        container.id = "vc-notification-container";
        document.body.append(container);
        reactRoot = createRoot(container);
    }
    return reactRoot;
}

export interface NotificationData {
    title: string;
    body: string;
    /**
     * Same as body but can be a custom component.
     * Will be used over body if present.
     * Not supported on desktop notifications, those will fall back to body */
    richBody?: ReactNode;
    /** Small icon. This is for things like profile pictures and should be square */
    icon?: string;
    /** Large image. Optimally, this should be around 16x9 but it doesn't matter much. Desktop Notifications might not support this */
    image?: string;
    onClick?(): void;
    onClose?(): void;
    color?: string;
    /** Whether this notification should not have a timeout */
    permanent?: boolean;
    /** Whether this notification should not be persisted in the Notification Log */
    noPersist?: boolean;
    /** Whether this notification should be dismissed when clicked (defaults to true) */
    dismissOnClick?: boolean;
}

function _showNotification(notification: NotificationData, id: number) {
    const root = getRoot();
    return new Promise<void>(resolve => {
        root.render(
            <NotificationComponent key={id} {...notification} onClose={() => {
                notification.onClose?.();
                root.render(null);
                resolve();
            }} />,
        );
    });
}

function shouldBeNative() {
    if (typeof Notification === "undefined") return false;

    const { useNative } = Settings.notifications;
    if (useNative === "always") return true;
    if (useNative === "not-focused") return !document.hasFocus();
    return false;
}

export async function requestPermission() {
    return (
        Notification.permission === "granted" ||
        (Notification.permission !== "denied" && (await Notification.requestPermission()) === "granted")
    );
}

export async function showNotification(data: NotificationData) {
    persistNotification(data);

    if (shouldBeNative() && await requestPermission()) {
        const { title, body, icon, image, onClick = null, onClose = null } = data;
        const n = new Notification(title, {
            body,
            icon,
            // @ts-expect-error ts is drunk
            image
        });
        n.onclick = onClick;
        n.onclose = onClose;
    } else {
        NotificationQueue.push(() => _showNotification(data, id++));
    }
}
