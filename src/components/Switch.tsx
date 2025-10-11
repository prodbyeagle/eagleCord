/*
 * EagleCord, a Vencord mod
 *
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./Switch.css";

import { classNameFactory } from "@api/Styles";
import { classes } from "@utils/misc";

const switchCls = classNameFactory("vc-switch-");

const SWITCH_ON = "var(--brand-500)";
const SWITCH_OFF = "var(--primary-400)";

export interface SwitchProps {
    disabled?: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Switch({ checked, onChange, disabled }: SwitchProps) {
    return (
        <div>
            <div className={classes(switchCls("container"), "default-colors", switchCls({ checked, disabled }))}>
                <svg
                    className={switchCls("slider")}
                    viewBox="0 0 28 20"
                    preserveAspectRatio="xMinYMid meet"
                    aria-hidden="true"
                    style={{
                        transform: checked ? "translateX(12px)" : "translateX(-3px)",
                    }}
                >
                    <rect fill="white" x="4" y="0" height="20" width="20" rx="10" />
                    <svg viewBox="0 0 20 20" fill="none">
                        {checked ? (
                            <>
                                <path fill={SWITCH_ON} d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z" />
                                <path fill={SWITCH_ON} d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z" />
                            </>
                        ) : (
                            <>
                                <path fill={SWITCH_OFF} d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z" />
                                <path fill={SWITCH_OFF} d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z" />
                            </>
                        )}

                    </svg>
                </svg>
                <input
                    disabled={disabled}
                    type="checkbox"
                    className={switchCls("input")}
                    tabIndex={0}
                    checked={checked}
                    onChange={e => onChange(e.currentTarget.checked)}
                />
            </div>
        </div>
    );
}
