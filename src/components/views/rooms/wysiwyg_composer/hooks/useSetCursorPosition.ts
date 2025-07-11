/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The connect.socjsc.com Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { type RefObject, useEffect } from "react";

import { setCursorPositionAtTheEnd } from "./utils";

export function useSetCursorPosition(disabled: boolean, ref: RefObject<HTMLDivElement | null>): void {
    useEffect(() => {
        if (ref.current && !disabled) {
            setCursorPositionAtTheEnd(ref.current);
        }
    }, [ref, disabled]);
}
