/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { checkIntersecting } from "@utils/misc";
import { React, useEffect, useMemo, useReducer, useState } from "@webpack/common";
import { ActionDispatch } from "react";

export * from "./lazyReact";

export const NoopComponent = () => null;

/**
 * Check if an element is on screen
 * @param intersectOnly If `true`, will only update the state when the element comes into view
 * @returns [refCallback, isIntersecting]
 */
export const useIntersection = (intersectOnly = false): [
    refCallback: React.RefCallback<Element>,
    isIntersecting: boolean,
] => {
    const observerRef = React.useRef<IntersectionObserver | null>(null);
    const [isIntersecting, setIntersecting] = useState(false);

    const refCallback = (element: Element | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;

        if (!element) return;

        if (checkIntersecting(element)) {
            setIntersecting(true);
            if (intersectOnly) return;
        }

        observerRef.current = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== element) continue;
                if (entry.isIntersecting && intersectOnly) {
                    setIntersecting(true);
                    observerRef.current?.disconnect();
                    observerRef.current = null;
                } else {
                    setIntersecting(entry.isIntersecting);
                }
            }
        });
        observerRef.current.observe(element);
    };

    return [refCallback, isIntersecting];
};

type AwaiterRes<T> = [T, any, boolean];
interface AwaiterOpts<T> {
    fallbackValue: T;
    deps?: unknown[];
    onError?(e: any): void;
    onSuccess?(value: T): void;
}
/**
 * Await a promise
 * @param factory Factory
 * @param fallbackValue The fallback value that will be used until the promise resolved
 * @returns [value, error, isPending]
 */
export function useAwaiter<T>(factory: () => Promise<T>): AwaiterRes<T | null>;
export function useAwaiter<T>(factory: () => Promise<T>, providedOpts: AwaiterOpts<T>): AwaiterRes<T>;
export function useAwaiter<T>(factory: () => Promise<T>, providedOpts?: AwaiterOpts<T | null>): AwaiterRes<T | null> {
    const opts: Required<AwaiterOpts<T | null>> = Object.assign({
        fallbackValue: null,
        deps: [],
        onError: null,
    }, providedOpts);
    const [state, setState] = useState({
        value: opts.fallbackValue,
        error: null,
        pending: true
    });

    useEffect(() => {
        let isAlive = true;
        if (!state.pending) setState({ ...state, pending: true });

        factory()
            .then(value => {
                if (!isAlive) return;
                setState({ value, error: null, pending: false });
                opts.onSuccess?.(value);
            })
            .catch(error => {
                if (!isAlive) return;
                setState({ value: null, error, pending: false });
                opts.onError?.(error);
            });

        return () => void (isAlive = false);
    }, opts.deps);

    return [state.value, state.error, state.pending];
}

/**
 * Returns a function that can be used to force rerender react components
 */
export function useForceUpdater(): ActionDispatch<[]>;
export function useForceUpdater(withDep: true): [any, ActionDispatch<[]>];
export function useForceUpdater(withDep?: true) {
    const r = useReducer(x => x + 1, 0);
    return withDep ? r : r[1];
}

interface TimerOpts {
    interval?: number;
    deps?: unknown[];
}

export function useTimer({ interval = 1000, deps = [] }: TimerOpts) {
    const [time, setTime] = useState(0);
    const start = useMemo(() => Date.now(), deps);

    useEffect(() => {
        const intervalId = setInterval(() => setTime(Date.now() - start), interval);

        return () => {
            setTime(0);
            clearInterval(intervalId);
        };
    }, deps);

    return time;
}

export function useCleanupEffect(
    effect: () => void,
    deps?: React.DependencyList
): void {
    useEffect(() => effect, deps);
}
