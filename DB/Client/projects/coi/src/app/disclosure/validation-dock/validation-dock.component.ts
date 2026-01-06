import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { ValidationDockModalConfiguration } from '../coi-interface';
import { closeCommonModal, openCommonModal } from '../../common/utilities/custom-utilities';
import { dockerFadeIn } from '../../common/utilities/animations';
import { DataStoreService } from '../services/data-store.service';


@Component({
    selector: 'app-validation-dock',
    templateUrl: './validation-dock.component.html',
    styleUrls: ['./validation-dock.component.scss'],
    animations: [
        dockerFadeIn
    ]
})
export class ValidationDockComponent implements OnChanges {

    @Input() validationList: string[];
    @Input() validationDockModalConfig = new ValidationDockModalConfiguration();

    @Output() emitActionEvent = new EventEmitter<{ actionName: string }>();
    isModalOpened = false;

    constructor(private _dataStoreService: DataStoreService) { }

    ngOnChanges() {
        if (this.validationList.length) {
            this.openModal();
        }
    }

    validationModalActions(actionEvent: ModalActionEvent) {
        if (actionEvent.action === 'CLOSE_BTN') {
            this.closeModalAndShowDock();
        } else {
            if (actionEvent.action === 'PRIMARY_BTN') {
                this.emitAdditionalButtonAction(this.validationDockModalConfig.modalConfiguration.namings.primaryBtnName);
            } else {
                this.closeModalAndShowDock();
                this.emitAdditionalButtonAction(this.validationDockModalConfig.modalConfiguration.namings.secondaryBtnName);
            }
        }
    }

    private closeModalAndShowDock(): void {
        this.isModalOpened = false;
        this._dataStoreService.attemptedPath = '';
        closeCommonModal(this.validationDockModalConfig.modalId);
    }

    emitAdditionalButtonAction(buttonName: string) {
        closeCommonModal(this.validationDockModalConfig.modalId);
        setTimeout(() => {
            this.emitActionEvent.emit({ 'actionName': buttonName });
        }, 200);
    }

    openModal(actionType: 'EXPAND' | '' = '') {
        this.isModalOpened = true;
        setTimeout(() => {
            if (actionType === 'EXPAND') {
                this.validationDockModalConfig.additionalBtns = this.validationDockModalConfig?.additionalBtns?.filter(item => item !== 'Leave Page');
            }
            openCommonModal(this.validationDockModalConfig.modalId);
        }, 200);
    }

}
