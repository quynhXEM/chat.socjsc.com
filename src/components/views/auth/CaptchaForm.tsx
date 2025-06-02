/*
Copyright 2024 New Vector Ltd.
Copyright 2015, 2016 OpenMarket Ltd

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, createRef, useEffect } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../languageHandler";

interface ICaptchaFormProps {
    sitePublicKey: string;
    onCaptchaResponse: (response: string) => void;
}

interface ICaptchaFormState {
    errorText?: string;
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    "sitekey": string;
                    "callback": (token: string) => void;
                    "refresh-expired": string;
                },
            ) => string;
            reset: (widgetId: string) => void;
        };
        onloadTurnstileCallback?: () => void;
    }
}

/**
 * A pure UI component which displays a Cloudflare Turnstile captcha form.
 */
export default class CaptchaForm extends React.Component<ICaptchaFormProps, ICaptchaFormState> {
    public static defaultProps = {
        onCaptchaResponse: () => {},
    };

    private widgetId?: string;
    private turnstileContainer = createRef<HTMLDivElement>();
    private scriptLoaded = false;

    public constructor(props: ICaptchaFormProps) {
        super(props);

        this.state = {
            errorText: undefined,
        };
    }

    public componentDidMount(): void {
        this.loadTurnstileScript();
    }

    public componentDidUpdate(prevProps: ICaptchaFormProps): void {
        // Re-render Turnstile if public key changes
        if (prevProps.sitePublicKey !== this.props.sitePublicKey) {
            this.resetTurnstile();
            this.renderTurnstile();
        }
    }

    public componentWillUnmount(): void {
        this.resetTurnstile();
        // Clean up global callback
        if (window.onloadTurnstileCallback === this.onTurnstileLoaded) {
            window.onloadTurnstileCallback = undefined;
        }
    }

    private loadTurnstileScript(): void {
        if (this.isTurnstileReady()) {
            this.onTurnstileLoaded();
            return;
        }

        if (!document.querySelector("script[src*='turnstile']")) {
            window.onloadTurnstileCallback = () => {
                this.scriptLoaded = true;
                this.onTurnstileLoaded();
            };
            const scriptTag = document.createElement("script");
            scriptTag.setAttribute(
                "src",
                "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit",
            );
            document.body.appendChild(scriptTag);
        } else if (!this.scriptLoaded) {
            // Script exists but hasn't loaded yet
            window.onloadTurnstileCallback = () => {
                this.scriptLoaded = true;
                this.onTurnstileLoaded();
            };
        } else {
            this.onTurnstileLoaded();
        }
    }

    private isTurnstileReady(): boolean {
        return (
            typeof window !== "undefined" &&
            typeof window.turnstile !== "undefined" &&
            typeof window.turnstile.render === "function"
        );
    }

    private renderTurnstile(): void {
        const container = this.turnstileContainer.current;
        if (!container || !this.isTurnstileReady()) {
            return;
        }

        // Reset any existing widget
        this.resetTurnstile();

        const publicKey = this.props.sitePublicKey;
        if (!publicKey) {
            this.setState({
                errorText: "This server has not supplied enough information for Turnstile authentication",
            });
            return;
        }

        try {
            this.widgetId = window.turnstile?.render(container, {
                sitekey: '0x4AAAAAABfxOk3QuexiBOyI',
                callback: this.props.onCaptchaResponse,
                "refresh-expired": "manual"
            });
        } catch (e) {
            this.setState({
                errorText: e instanceof Error ? e.message : String(e),
            });
        }
    }

    private resetTurnstile(): void {
        if (this.widgetId && window.turnstile) {
            try {
                window.turnstile.reset(this.widgetId);
            } catch (e) {
                // Ignore reset errors
                logger.warn("Error resetting Turnstile:", e);
            }
            this.widgetId = undefined;
        }
    }

    private onTurnstileLoaded(): void {
        logger.log("Loaded Turnstile script.");
        this.renderTurnstile();
    }

    public render(): React.ReactNode {
        let error: JSX.Element | undefined;
        if (this.state.errorText) {
            error = <div className="error" role="alert">{this.state.errorText}</div>;
        }

        return (
            <div className="mx_CaptchaForm">
                <div ref={this.turnstileContainer} className="mx_CaptchaForm_container">
                    <p>{_t("auth|captcha_description")}</p>
                </div>
                {error}
            </div>
        );
    }
}
