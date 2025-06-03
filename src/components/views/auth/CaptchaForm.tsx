<<<<<<< Updated upstream
/*
Copyright 2024 New Vector Ltd.
Copyright 2015, 2016 OpenMarket Ltd

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, createRef, useEffect } from "react";
=======
import React, { type JSX, createRef } from "react";
>>>>>>> Stashed changes
import { logger } from "matrix-js-sdk/src/logger";
import { _t } from "../../../languageHandler";

<<<<<<< Updated upstream
=======
const TURNSTILE_ID = "mx_turnstile";

// Biến global để theo dõi trạng thái script và widget
let turnstileScriptPromise: Promise<void> | null = null;
let turnstileWidgetCount = 0;

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                },
            ) => string;
            reset: (widgetId: string) => void;
        };
    }
}

>>>>>>> Stashed changes
interface ICaptchaFormProps {
    sitePublicKey: string;
    onCaptchaResponse: (response: string) => void;
}

interface ICaptchaFormState {
    errorText?: string;
    isWidgetRendered: boolean;
}

<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
export default class CaptchaForm extends React.Component<ICaptchaFormProps, ICaptchaFormState> {
    public static defaultProps = {
        onCaptchaResponse: () => {},
    };

<<<<<<< Updated upstream
    private widgetId?: string;
    private turnstileContainer = createRef<HTMLDivElement>();
    private scriptLoaded = false;
=======
    private turnstileWidgetId?: string;
    private turnstileContainer = createRef<HTMLDivElement>();
    private isComponentMounted = false;
>>>>>>> Stashed changes

    constructor(props: ICaptchaFormProps) {
        super(props);
        this.state = { 
            errorText: undefined,
            isWidgetRendered: false
        };
    }

<<<<<<< Updated upstream
    public componentDidMount(): void {
        this.loadTurnstileScript();
    }

    public componentDidUpdate(prevProps: ICaptchaFormProps): void {
        // Re-render Turnstile if public key changes
        if (prevProps.sitePublicKey !== this.props.sitePublicKey) {
            this.resetTurnstile();
            this.renderTurnstile();
=======
    private loadTurnstileScript(): Promise<void> {
        if (turnstileScriptPromise) {
            return turnstileScriptPromise;
>>>>>>> Stashed changes
        }

        turnstileScriptPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(
                'script[src^="https://challenges.cloudflare.com/turnstile/"]',
            );

            if (existingScript) {
                if (this.isTurnstileReady()) {
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (this.isTurnstileReady()) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);

                    // Timeout sau 10 giây
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        reject(new Error("Turnstile script load timeout"));
                    }, 10000);
                }
                return;
            }

            const script = document.createElement("script");
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            
            script.onload = () => {
                if (this.isTurnstileReady()) {
                    resolve();
                } else {
                    reject(new Error("Turnstile script loaded but not ready"));
                }
            };
            
            script.onerror = () => {
                reject(new Error("Failed to load Turnstile script"));
            };

            document.head.appendChild(script);
        });

        return turnstileScriptPromise;
    }

<<<<<<< Updated upstream
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
=======
    private isTurnstileReady(): boolean {
        return (
            typeof window !== "undefined" &&
            typeof window.turnstile !== "undefined" &&
            typeof window.turnstile.render === "function"
        );
    }

    private async initializeTurnstile(): Promise<void> {
        if (!this.isComponentMounted || this.state.isWidgetRendered) {
            return;
        }

        try {
            await this.loadTurnstileScript();
            this.renderTurnstile();
        } catch (error) {
            if (this.isComponentMounted) {
                this.setState({
                    errorText: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }

    private renderTurnstile(): void {
        if (!this.isComponentMounted || !this.turnstileContainer.current || !this.isTurnstileReady()) {
            return;
        }

        if (this.state.isWidgetRendered) {
            logger.warn("Turnstile widget already rendered");
>>>>>>> Stashed changes
            return;
        }

        try {
<<<<<<< Updated upstream
            this.widgetId = window.turnstile?.render(container, {
                sitekey: '0x4AAAAAABfxOk3QuexiBOyI',
                callback: this.props.onCaptchaResponse,
                "refresh-expired": "manual"
=======
            const publicKey = "0x4AAAAAABfxOk3QuexiBOyI";
            logger.info("Rendering Turnstile widget");

            this.turnstileWidgetId = window.turnstile?.render(this.turnstileContainer.current, {
                sitekey: publicKey,
                callback: (token: string) => {
                    if (this.isComponentMounted) {
                        logger.info("Turnstile verification successful");
                        this.props.onCaptchaResponse(token);
                    }
                },
            });

            turnstileWidgetCount++;
            this.setState({ 
                isWidgetRendered: true,
                errorText: undefined 
>>>>>>> Stashed changes
            });
        } catch (e) {
            logger.error("Error rendering Turnstile:", e);
            if (this.isComponentMounted) {
                this.setState({
                    errorText: e instanceof Error ? e.message : String(e)
                });
            }
        }
    }

<<<<<<< Updated upstream
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
=======
    public componentDidMount(): void {
        this.isComponentMounted = true;
        this.initializeTurnstile();
    }
>>>>>>> Stashed changes

    public componentWillUnmount(): void {
        this.isComponentMounted = false;
        
        if (this.turnstileWidgetId && window.turnstile) {
            try {
                window.turnstile.reset(this.turnstileWidgetId);
                turnstileWidgetCount--;
                
                // Nếu không còn widget nào, reset script promise
                if (turnstileWidgetCount === 0) {
                    turnstileScriptPromise = null;
                }
            } catch (e) {
                logger.error("Error resetting Turnstile:", e);
            }
        }
    }

    public render(): JSX.Element {
        return (
<<<<<<< Updated upstream
            <div className="mx_CaptchaForm">
                <div ref={this.turnstileContainer} className="mx_CaptchaForm_container">
                    <p>{_t("auth|captcha_description")}</p>
                </div>
                {error}
=======
            <div>
                <p>{_t("auth|captcha_description")}</p>
                <div ref={this.turnstileContainer} id={TURNSTILE_ID}></div>
                {this.state.errorText && (
                    <div className="mx_Turnstile_error" style={{ color: "red", marginTop: "8px" }}>
                        {this.state.errorText}
                    </div>
                )}
>>>>>>> Stashed changes
            </div>
        );
    }
}
