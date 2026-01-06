/**
 * Common Modal Component [Author: Abdul Ashfaque M]
 *
 * This component represents a reusable common modal that can be used to prompt users for common
 * or gather additional information before performing an action.
 *
 * Usage:
 * 1. Import the CommonModalComponent in the parent component's module.
 * 2. Add the CommonModalComponent selector '<app-common-modal></app-common-modal>' in the parent component's template.
 * 3. Bind the necessary input properties and handle the primaryBtnAction, secondaryBtnAction and close events in the parent component's class.
 * 4. Modal can open and closed using openCommonModal and closeCommonModal.
 * 
 * @input config - A configuration object to set up the modal properties.
 * @output primaryBtnAction - Event emitted when the primary action button is clicked.
 * @output secondaryBtnAction - Event emitted when the secondary action button is clicked.
 * @output close - Event emitted when the close button is clicked.
 *
 * Example:
 * <app-common-modal modalName="common-modal" modalSize="lg"
 *      primaryBtnName="Proceed" secondaryBtnName="Cancel"
 *      (primaryBtnAction)="handlePrimaryAction($event)"
 *      (secondaryBtnAction)="handleSecondaryAction($event)">
 *
 *          <ng-container modal-header>
 *              Custom Header Content
 *          </ng-container>
 * 
 *          <ng-container modal-content-sticky>
 *              Custom Body position-sticky content
 *          </ng-container>
 * 
 *          <ng-container modal-body>
 *              Custom Body Content
 *          </ng-container>
 * 
 *          <ng-content modal-content-after-footer>
 *              Custom Body Content
 *          </ng-content>
 * 
 * </app-common-modal>
 * 
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { closeCommonModal, focusElementById } from '../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from './common-modal.interface';

@Component({
    selector: 'app-common-modal',
    templateUrl: './common-modal.component.html',
    styleUrls: ['./common-modal.component.scss']
})
export class CommonModalComponent {

    @Input() modalConfig = new CommonModalConfig('common-modal', 'Ok', 'Cancel', '');

    @Output() modalAction: EventEmitter<ModalActionEvent> = new EventEmitter<ModalActionEvent>();

    /**
     * Close the modal.
     *
     * Purpose: Closes the modal if the common component exist.
     */
    closeModal(event: any): void {
        if (event) {
            event.stopPropagation();
            this.modalAction.emit({ action: 'CLOSE_BTN' });
        }
    }

    /**
     * Perform the secondary action.
     * Purpose: Emits the secondaryBtnAction event.
     */
    performSecondaryAction(): void {
        this.modalAction.emit({ action: 'SECONDARY_BTN' });
    }

    /**
     * Perform the primary action.
     * Purpose: Emits the primaryBtnAction event
     */
    performPrimaryAction(): void {
        this.modalAction.emit({ action: 'PRIMARY_BTN' });
    }

    focusAfterModalClose(): void {
        setTimeout(() => {
            focusElementById(this.modalConfig.ADAOptions.idToFocusAfterClose);
        }, 200);
    }

    ngOnDestroy(): void {
        closeCommonModal(this.modalConfig.namings.modalName);
    }
}
