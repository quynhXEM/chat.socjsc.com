/*
Copyright 2024 New Vector Ltd.
Copyright 2021 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect } from "react";
import { type MatrixEvent } from "matrix-js-sdk/src/matrix";

import { type ButtonEvent } from "../elements/AccessibleButton";
import dis from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";
import { type RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import { copyPlaintext } from "../../../utils/strings";
import { ChevronFace, ContextMenuTooltipButton, type MenuProps, useContextMenu } from "../../structures/ContextMenu";
import { _t } from "../../../languageHandler";
import IconizedContextMenu, { IconizedContextMenuOption, IconizedContextMenuOptionList } from "./IconizedContextMenu";
import { WidgetLayoutStore } from "../../../stores/widgets/WidgetLayoutStore";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { type ViewRoomPayload } from "../../../dispatcher/payloads/ViewRoomPayload";
import QuestionDialog from "../../views/dialogs/QuestionDialog";
import Modal from "../../../Modal";
import BaseDialog from "../dialogs/BaseDialog";
import DialogButtons from "../elements/DialogButtons";
export interface ThreadListContextMenuProps {
    mxEvent: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
    onMenuToggle?: (open: boolean) => void;
}

const contextMenuBelow = (elementRect: DOMRect): MenuProps => {
    // align the context menu's icons with the icon which opened the context menu
    const left = elementRect.left + window.scrollX + elementRect.width;
    const top = elementRect.bottom + window.scrollY;
    const chevronFace = ChevronFace.None;
    return { left, top, chevronFace };
};

const ThreadListContextMenu: React.FC<ThreadListContextMenuProps> = ({
    mxEvent,
    permalinkCreator,
    onMenuToggle,
    ...props
}) => {
    const [menuDisplayed, button, openMenu, closeThreadOptions] = useContextMenu();

    const viewInRoom = useCallback(
        (evt: ButtonEvent): void => {
            evt.preventDefault();
            evt.stopPropagation();
            dis.dispatch<ViewRoomPayload>({
                action: Action.ViewRoom,
                event_id: mxEvent.getId(),
                highlighted: true,
                room_id: mxEvent.getRoomId(),
                metricsTrigger: undefined, // room doesn't change
            });
            closeThreadOptions();
        },
        [mxEvent, closeThreadOptions],
    );

    const copyLinkToThread = useCallback(
        async (evt: ButtonEvent | undefined): Promise<void> => {
            if (permalinkCreator) {
                evt?.preventDefault();
                evt?.stopPropagation();
                const matrixToUrl = permalinkCreator.forEvent(mxEvent.getId()!);
                await copyPlaintext(matrixToUrl);
                closeThreadOptions();
            }
        },
        [mxEvent, closeThreadOptions, permalinkCreator],
    );
    
    const deleteThread = useCallback(
        async (evt: ButtonEvent) => {
            evt.preventDefault();
            evt.stopPropagation();

            const client = MatrixClientPeg.safeGet();
            const room = client.getRoom(mxEvent.getRoomId());
            if (!room) return;

            // lấy thread dựa trên event gốc
            const thread = room.getThread?.(mxEvent.getId());
            // lấy tất cả event con (không bao gồm event gốc)
            const childEvents = thread?.events.filter((e) => e.getId() !== mxEvent.getId()) ?? [];

            try {
                await Promise.all(
                    childEvents.map(async (e) => {
                        if (room.currentState.maySendRedactionForEvent(e, client.getUserId()!)) {
                            await client.redactEvent(mxEvent.getRoomId(), e.getId()!, undefined, {
                                reason: "Deleted by user",
                            });
                        } else {
                            console.warn("No permission to redact", e.getId());
                        }
                    }),
                );
            } catch (err) {
                console.error("Failed to delete child events of thread", err);
            }

            closeThreadOptions();
        },
        [mxEvent, closeThreadOptions],
    );

    const confirmDeleteThread = useCallback(
        async (evt: ButtonEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            // Modal.createDialog(BaseDialog, {
            //     title: `${_t("timeline|mab|remove_thread")} ${_t("common|threads")}`, // "Xoá các tin trong thread?"
            //     className: "mx_ConfirmDeleteThreadDialog",
            //     contentId: "mx_ConfirmDeleteThreadDialog_content",
            //     children: (
            //         <div>
            //             <p>{_t("timeline|mab|action_no_disable")}</p>
            //             <DialogButtons
            //                 primaryButton={_t("action|ok")} // "Xoá"
            //                 primaryButtonClass="danger" // tạo nút đỏ
            //                 cancelButton={_t("common|cancel")} // "Hủy bỏ"
            //                 onPrimaryButtonClick={async () => {
            //                     await deleteThread(evt);
            //                 }}
            //                 onCancel={closeThreadOptions}
            //             />
            //         </div>
            //     ),
            // });

            // Modal.createDialog(QuestionDialog, {
            //     title: _t("timeline|mab|remove_thread"), // "Xoá các tin trong thread?"
            //     description: _t("timeline|mab|action_no_disable"),
            //     button: _t("action|ok"), // "Xoá"
            //     danger: true, // tạo nút đỏ
            //     onFinished: async (confirm) => {
            //         if (confirm) {
            //             await deleteThread(evt);
            //         } else {
            //             closeThreadOptions();
            //         }
            //     },
            // });

            const { finished } = Modal.createDialog(QuestionDialog, {
                title: _t("timeline|mab|remove_thread"), // "Xoá các tin trong thread?"
                description: _t("timeline|mab|action_no_disable"),
                button: _t("action|confirm"),
            });
            const [confirmed] = await finished;
            if (confirmed) {
                deleteThread(evt);
            } else {
                closeThreadOptions();
            }
        },
        [deleteThread],
    );
    useEffect(() => {
        onMenuToggle?.(menuDisplayed);
    }, [menuDisplayed, onMenuToggle]);

    const room = MatrixClientPeg.safeGet().getRoom(mxEvent.getRoomId());
    const isMainSplitTimelineShown = !!room && !WidgetLayoutStore.instance.hasMaximisedWidget(room);
    return (
        <React.Fragment>
            <ContextMenuTooltipButton
                {...props}
                className="mx_BaseCard_header_title_button--option"
                onClick={openMenu}
                title={_t("right_panel|thread_list|context_menu_label")}
                isExpanded={menuDisplayed}
                ref={button}
                data-testid="threadlist-dropdown-button"
            />
            {menuDisplayed && (
                <IconizedContextMenu
                    onFinished={closeThreadOptions}
                    className="mx_RoomTile_contextMenu"
                    compact
                    rightAligned
                    {...contextMenuBelow(button.current!.getBoundingClientRect())}
                >
                    <IconizedContextMenuOptionList>
                        {isMainSplitTimelineShown && (
                            <IconizedContextMenuOption
                                onClick={(e) => viewInRoom(e)}
                                label={_t("timeline|mab|view_in_room")}
                                iconClassName="mx_ThreadPanel_viewInRoom"
                            />
                        )}
                        {permalinkCreator && (
                            <IconizedContextMenuOption
                                data-testid="copy-thread-link"
                                onClick={(e) => copyLinkToThread(e)}
                                label={_t("timeline|mab|copy_link_thread")}
                                iconClassName="mx_ThreadPanel_copyLinkToThread"
                            />
                        )}
                        <IconizedContextMenuOption
                            className="mx_IconizedContextMenu_itemDestructive"
                            data-testid="remove-thread"
                            onClick={(e) => confirmDeleteThread(e)}
                            label={_t("timeline|mab|remove_thread")}
                            iconClassName="mx_ThreadPanel_removeThread"
                        />
                    </IconizedContextMenuOptionList>
                </IconizedContextMenu>
            )}
        </React.Fragment>
    );
};

export default ThreadListContextMenu;
