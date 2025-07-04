/*
Copyright 2024 New Vector Ltd.
Copyright 2020 The connect.socjsc.com Foundation C.I.C.
Copyright 2015, 2016 OpenMarket Ltd

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX } from "react";

import { type IBodyProps } from "./IBodyProps";

export default ({ mxEvent, ref }: IBodyProps): JSX.Element => {
    const text = mxEvent.getContent().body;
    return (
        <div className="mx_UnknownBody" ref={ref}>
            {text}
        </div>
    );
};
