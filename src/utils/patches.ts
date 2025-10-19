/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { runtimeHashMessageKey, runtimeHashMessageKeyLegacy } from "./intlHash";
import { Patch, PatchReplacement, ReplaceFn } from "./types";

// TODO: remove legacy hashing function once Discord ships new one everywhere for a while

// @ts-expect-error "RegExp.escape" is very new and not yet in DOM types
const escapeRegex = RegExp.escape || ((s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

function getReplacement(isString: boolean, hashed: string) {
    const hasSpecialChars = !Number.isNaN(Number(hashed[0])) || hashed.includes("+") || hashed.includes("/");

    if (hasSpecialChars) {
        return isString
            ? `["${hashed}"]`
            : String.raw`(?:\["${hashed}"\])`.replaceAll("+", "\\+");
    }

    return isString ? `.${hashed}` : String.raw`(?:\.${hashed})`;
}

function getCompatReplacement(key: string) {
    const hashed = getReplacement(false, runtimeHashMessageKey(key));
    const legacyHashed = getReplacement(false, runtimeHashMessageKeyLegacy(key));

    return String.raw`(?:${hashed}|${legacyHashed})`;
}

function canonicalizeMatchCompatString(str: string) {
    let result = "";
    let lastIndex = 0;
    const re = /#{intl::([\w$+/]*)(?:::(\w+))?}/g;
    for (const match of str.matchAll(re)) {
        result += escapeRegex(str.slice(lastIndex, match.index));
        result += getCompatReplacement(match[1]);
        lastIndex = (match.index ?? 0) + match[0].length;
    }
    result += escapeRegex(str.slice(lastIndex));
    return new RegExp(result);
}

export function canonicalizeMatch<T extends RegExp | string>(match: T): T extends RegExp ? RegExp : string | RegExp {
    if (typeof match === "string") {
        return canonicalizeMatchCompatString(match) as any;
    }

    let partialCanon = typeof match === "string" ? match : match.source;
    partialCanon = partialCanon.replaceAll(/#{intl::([\w$+/]*)(?:::(\w+))?}/g, (_, key, modifier) => {
        if (modifier === "raw") return getReplacement(false, key);
        return getCompatReplacement(key);
    });

    if (typeof match === "string") {
        return partialCanon as any;
    }

    const canonSource = partialCanon.replaceAll("\\i", String.raw`(?:[A-Za-z_$][\w$]*)`);
    const canonRegex = new RegExp(canonSource, match.flags);
    canonRegex.toString = match.toString.bind(match);

    return canonRegex as any;
}

export function canonicalizeReplace<T extends string | ReplaceFn>(replace: T, pluginPath: string): T {
    if (typeof replace !== "function")
        return replace.replaceAll("$self", pluginPath) as T;

    return ((...args) => replace(...args).replaceAll("$self", pluginPath)) as T;
}

export function canonicalizeDescriptor<T>(descriptor: TypedPropertyDescriptor<T>, canonicalize: (value: T) => T) {
    if (descriptor.get) {
        const original = descriptor.get;
        descriptor.get = function () {
            return canonicalize(original.call(this));
        };
    } else if (descriptor.value) {
        descriptor.value = canonicalize(descriptor.value);
    }
    return descriptor;
}

export function canonicalizeReplacement(replacement: Pick<PatchReplacement, "match" | "replace">, pluginPath: string) {
    const descriptors = Object.getOwnPropertyDescriptors(replacement);
    descriptors.match = canonicalizeDescriptor(descriptors.match, canonicalizeMatch);
    descriptors.replace = canonicalizeDescriptor(
        descriptors.replace,
        replace => canonicalizeReplace(replace, pluginPath),
    );
    Object.defineProperties(replacement, descriptors);
}

export function canonicalizeFind(patch: Patch) {
    const descriptors = Object.getOwnPropertyDescriptors(patch);
    descriptors.find = canonicalizeDescriptor(descriptors.find, canonicalizeMatch);
    Object.defineProperties(patch, descriptors);
}
