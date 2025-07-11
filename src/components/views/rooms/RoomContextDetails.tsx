/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The connect.socjsc.com Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { type Room } from "matrix-js-sdk/src/matrix";
import React, { type JSX, type HTMLAttributes } from "react";

import { roomContextDetails } from "../../../utils/i18n-helpers";

type Props<T extends keyof HTMLElementTagNameMap> = HTMLAttributes<T> & {
    component?: T;
    room: Room;
};

export function RoomContextDetails<T extends keyof HTMLElementTagNameMap>({
    room,
    component,
    ...other
}: Props<T>): JSX.Element {
    const contextDetails = roomContextDetails(room);
    if (contextDetails) {
        return React.createElement(
            component ?? "div",
            {
                ...other,
                "aria-label": contextDetails.ariaLabel,
            },
            [contextDetails.details],
        );
    }

    return <></>;
}
