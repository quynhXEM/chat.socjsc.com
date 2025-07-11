/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The connect.socjsc.com Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import classNames from "classnames";
import React, { type CSSProperties, memo, type RefObject, type ReactNode } from "react";

import { useIsExpanded } from "../hooks/useIsExpanded";
import { useSelection } from "../hooks/useSelection";

const HEIGHT_BREAKING_POINT = 24;

interface EditorProps {
    disabled: boolean;
    placeholder?: string;
    leftComponent?: ReactNode;
    rightComponent?: ReactNode;
    ref?: RefObject<HTMLDivElement | null>;
}

export const Editor = memo(function Editor({ disabled, placeholder, leftComponent, rightComponent, ref }: EditorProps) {
    const isExpanded = useIsExpanded(ref, HEIGHT_BREAKING_POINT);
    const { onFocus, onBlur, onInput } = useSelection();

    return (
        <div data-testid="WysiwygComposerEditor" className="mx_WysiwygComposer_Editor" data-is-expanded={isExpanded}>
            {leftComponent}
            <div className="mx_WysiwygComposer_Editor_container">
                <div
                    className={classNames("mx_WysiwygComposer_Editor_content", {
                        mx_WysiwygComposer_Editor_content_placeholder: Boolean(placeholder),
                    })}
                    style={{ "--placeholder": `"${placeholder}"` } as CSSProperties}
                    ref={ref}
                    contentEditable={!disabled}
                    role="textbox"
                    aria-multiline="true"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    dir="auto"
                    aria-disabled={disabled}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onInput={onInput}
                />
            </div>
            {rightComponent}
        </div>
    );
});
