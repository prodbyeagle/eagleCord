/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as $Badges from "@api/Badges";
import * as $ChatButtons from "@api/ChatButtons";
import * as $Commands from "@api/Commands";
import * as $ContextMenu from "@api/ContextMenu";
import * as $DataStore from "@api/DataStore";
import * as $MemberListDecorators from "@api/MemberListDecorators";
import * as $MessageAccessories from "@api/MessageAccessories";
import * as $MessageDecorations from "@api/MessageDecorations";
import * as $MessageEventsAPI from "@api/MessageEvents";
import * as $MessagePopover from "@api/MessagePopover";
import * as $MessageUpdater from "@api/MessageUpdater";
import * as $Notices from "@api/Notices";
import * as $Notifications from "@api/Notifications";
import * as $ServerList from "@api/ServerList";
import * as $Settings from "@api/Settings";
import * as $Styles from "@api/Styles";
import * as $UserSettings from "@api/UserSettings";

/**
 * An API allowing you to listen to Message Clicks or run your own logic
 * before a message is sent
 *
 * If your plugin uses this, you must add MessageEventsAPI to its dependencies
 */
export const MessageEvents = $MessageEventsAPI;
/**
 * An API allowing you to create custom notices
 * (snackbars on the top, like the Update prompt)
 */
export const Notices = $Notices;
/**
 * An API allowing you to register custom commands
 */
export const Commands = $Commands;
/**
 * A wrapper around IndexedDB. This can store arbitrarily
 * large data and supports a lot of datatypes (Blob, Map, ...).
 * For a full list, see the mdn link below
 *
 * This should always be preferred over the Settings API if possible, as
 * localstorage has very strict size restrictions and blocks the event loop
 *
 * Make sure your keys are unique (tip: prefix them with ur plugin name)
 * and please clean up no longer needed entries.
 *
 * This is actually just idb-keyval, so if you're familiar with that, you're golden!
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types}
 */
export const DataStore = $DataStore;
/**
 * An API allowing you to add custom components as message accessories
 */
export const MessageAccessories = $MessageAccessories;
/**
 * An API allowing you to add custom buttons in the message popover
 */
export const MessagePopover = $MessagePopover;
/**
 * An API allowing you to add badges to user profiles
 */
export const Badges = $Badges;
/**
 * An API allowing you to add custom elements to the server list
 */
export const ServerList = $ServerList;
/**
 * An API allowing you to add components as message accessories
 */
export const MessageDecorations = $MessageDecorations;
/**
 * An API allowing you to add components to member list users, in both DM's and servers
 */
export const MemberListDecorators = $MemberListDecorators;
/**
 * An API allowing you to persist data
 */
export const Settings = $Settings;
/**
 * An API allowing you to dynamically load styles
 * a
 */
export const Styles = $Styles;
/**
 * An API allowing you to display notifications
 */
export const Notifications = $Notifications;

/**
 * An api allowing you to patch and add/remove items to/from context menus
 */
export const ContextMenu = $ContextMenu;

/**
 * An API allowing you to add buttons to the chat input
 */
export const ChatButtons = $ChatButtons;

/**
 * An API allowing you to update and re-render messages
 */
export const MessageUpdater = $MessageUpdater;

/**
 * An API allowing you to get an user setting
 */
export const UserSettings = $UserSettings;
