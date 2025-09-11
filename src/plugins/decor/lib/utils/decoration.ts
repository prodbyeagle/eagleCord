/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AvatarDecoration } from "../../";
import { Decoration } from "../api";
import { SKU_ID } from "../constants";

export function decorationToAsset(decoration: Decoration) {
    return `${decoration.animated ? "a_" : ""}${decoration.hash}`;
}

export function decorationToAvatarDecoration(
    decoration: Decoration,
): AvatarDecoration {
    return { asset: decorationToAsset(decoration), skuId: SKU_ID };
}
