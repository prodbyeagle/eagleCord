/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "FixImagesQuality",
    description: "Improves quality of images in chat by forcing png format",
    authors: [Devs.Nuckyz],
    patches: [
        {
            find: ".handleImageLoad)",
            replacement: {
                match: /(?<=\i=)"webp"/,
                replace: '"png"'
            }
        }
    ]
});
