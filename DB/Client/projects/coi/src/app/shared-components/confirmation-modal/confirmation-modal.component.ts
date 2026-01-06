/**
 * Confirmation Modal Component
 *
 * This component represents a reusable confirmation modal that can be used to prompt users for confirmation
 * or gather additional information before performing an action. It supports customizable inputs and outputs
 * for various configuration options.
 *
 * Usage:
 * 1. Import the ConfirmationModalComponent in the parent component's module.
 * 2. Add the ConfirmationModalComponent selector '<app-confirmation-modal></app-confirmation-modal>' in the parent component's template.
 * 3. Bind the necessary input properties and handle the primaryBtnAction and secondaryBtnAction events in the parent component's class.
 *
 * Example:
 * <app-confirmation-modal
 * modalName="confirmation-modal"
 *     [needDescriptionField]="true"
 *     [isMandatory]="true"
 *     modalSize="lg"
 *     descriptionErrorMsg="Description is required."
 *     primaryBtnName="Proceed"
 *     secondaryBtnName="Cancel"
 *     (primaryBtnAction)="handlePrimaryAction($event)"
 *     (secondaryBtnAction)="handleSecondaryAction($event)">
 *     <ng-container header>
 *         Custom Header Content
 *     </ng-container>
 *     <ng-container content>
 *         Custom Body Content
 *     </ng-container>
 * </app-confirmation-modal>
 */

import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { closeCommonModal } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnDestroy {
    // Inputs
    /**
     * Specifies whether a description field is required.
     * Default value is false.
     *
     * Purpose: Determines if a description field should be displayed in the modal.
     */
    @Input() needDescriptionField = false;

    /**
     * Specifies whether the description field is mandatory.
     * Default value is false.
     *
     * Purpose: Determines if the description field must be filled in by the user.
     */
    @Input() isMandatory = false;

    /**
     * Specifies the size of the modal.
     * Possible values are 'sm' (small), 'lg' (large), 'xl' (extra large), or '' (default size).
     *
     * Purpose: Sets the size of the modal dialog for visual customization.
     */
    @Input() modalSize: 'sm' | 'md' | 'lg' | 'xl' | '' = '';

    /**
     * The initial value of the description field title.
     * Default value is an empty string.
     *
     * Purpose: Sets the initial value of the description field title if needed.
     */
    @Input() textAreaLabelName = '';

    /**
     * The initial value of the description field.
     * Default value is an empty string.
     *
     * Purpose: Sets the initial value of the description field if needed.
     */
    @Input() description = '';

    /**
     * The error message to display when the description field is mandatory and empty.
     *
     * Purpose: Sets the error message to be displayed if the description field is mandatory and left empty.
     */
    @Input() descriptionErrorMsg = '';

    /**
     * The label for the primary action button.
     * Default value is 'Save'.
     *
     * Purpose: Sets the label for the primary action button.
     */
    @Input() primaryBtnName = 'Save';

     /**
     * The tooltip for the primary action button.
     *
     * Purpose: Sets the tooltip for the primary action button.
     */
    @Input() primaryBtnTooltip = '';

    /**
     * The label for the secondary action button.
     * Default value is 'Cancel'.
     *
     * Purpose: Sets the label for the secondary action button.
     */
    @Input() secondaryBtnName = 'Cancel';

     /**
     * The tooltip for the secondary action button.
     * Default value is 'Cancel'.
     *
     * Purpose: Sets the tooltip for the secondary action button.
     */
    @Input() secondaryBtnTooltip = '';

    /**
     * The unique identifier for the modal.
     *
     * Purpose: Provides a unique identifier for the modal dialog, mainly used for DOM manipulation.
     */
    @Input() modalName = 'confirmation-modal';

    /**
     * Input field help text.
     *
     * Purpose: Provides a helptext for text area.
     */
      @Input() helpText = '';

    /**
    * textarea field placeholder.
    *
    * Purpose: Provides a placeholder for textarea.
    */
    @Input() textAreaPlaceholder = 'Please provide the reason';

    // Outputs
    /**
     * An event emitted when the primary action button is clicked.
     * It passes the value of the description field as the event payload.
     *
     * Purpose: Notifies the parent component when the primary action button is clicked,
     *          providing the value of the description field as the event payload.
     */
    @Output() primaryBtnAction: EventEmitter<any> = new EventEmitter<any>();

    /**
     * An event emitted when the secondary action button is clicked.
     * It passes a boolean indicating whether the action was performed.
     *
     * Purpose: Notifies the parent component when the secondary action button is clicked,
     *          providing a boolean value indicating whether the action was performed.
     */
    @Output() secondaryBtnAction: EventEmitter<any> = new EventEmitter<any>();

    /**
     * An event emitted when the close button is clicked.
     * It passes a boolean indicating whether the action was performed.
     *
     * Purpose: Notifies the parent component when the close button is clicked,
     *          providing a boolean value indicating whether the action was performed.
     */
    @Output() close: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Map to store mandatory field errors.
     */
    mandatoryList = new Map();

    ngOnDestroy() {
        this.closeModal();
    }

    /**
     * Close the modal and perform cleanup.
     *
     * Purpose: Clears the mandatory field errors, resets the description field.
     *          Closes the modal if the confirmation component exist.
     *
     */
    closeModal(action: string = '') {
        this.mandatoryList.clear();
        this.description = '';
        this.close.emit(action);
        closeCommonModal(this.modalName);
    }

    /**
     * Handle the change or empty state of the description field.
     *
     * Purpose: Validates the description field and sets the mandatory field error if applicable.
     */
    descriptionChangedOrEmpty() {
        if (!this.description) {
            this.mandatoryList.set('description', `${this.descriptionErrorMsg}`);
        } else {
            this.mandatoryList.clear();
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.closeModal();
        }
    }

    /**
     * Validate the description field.
     *
     * Purpose: Checks if there are any mandatory field errors by invoking the `descriptionChangedOrEmpty()` method,
     *          and returns whether the description field is valid.
     *
     * @returns Whether the description field is valid. Returns true if there are no mandatory field errors, false otherwise.
     */
    validateDescription(): boolean {
        this.descriptionChangedOrEmpty();
        return this.mandatoryList.size === 0;
    }
    /**
     * Get the CSS class for the modal size.
     *
     * Purpose: Determines the CSS class based on the modal size input.
     *
     * @returns The CSS class for the modal size.
     */
    getModalSize(): string {
        return this.modalSize ? `modal-${this.modalSize}` : '';
    }

    /**
     * Perform the secondary action.
     *
     * Purpose: Emits the secondaryBtnAction event and closes the modal.
     *
     * @param event The event indicating whether the action was performed.
     */
    performSecondaryAction() {
        this.secondaryBtnAction.emit();
        this.closeModal();
    }

    /**
     * Perform the primary action.
     *
     * Purpose: Validates the description field (if mandatory) and emits the primaryBtnAction event.
     */
    performPrimaryAction() {
        if (this.isMandatory) {
            if (this.validateDescription()) {
                this.primaryBtnAction.emit(this.description);
                this.closeModal();
            }
        } else {
            this.primaryBtnAction.emit(this.needDescriptionField ? this.description : null);
            this.closeModal();
        }
    }

}
