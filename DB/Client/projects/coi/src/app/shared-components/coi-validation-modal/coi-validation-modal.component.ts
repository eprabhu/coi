import { Component, Input, OnInit } from '@angular/core';
import { COIValidationModalConfig } from '../../common/services/coi-common.interface';
import { ModalActionEvent } from '../common-modal/common-modal.interface';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { CommonService } from '../../common/services/common.service';

@Component({
    selector: 'app-coi-validation-modal',
    templateUrl: './coi-validation-modal.component.html',
    styleUrls: ['./coi-validation-modal.component.scss']
})
export class CoiValidationModalComponent implements OnInit {

    @Input() validationModalInfo = new COIValidationModalConfig();

    constructor(private _commonService: CommonService) {}

    ngOnInit(): void {
        this.validationModalInfo.modalConfig.dataBsOptions.focus = !document.querySelector('.offcanvas-backdrop');
        if (this.validationModalInfo.validationType === 'VIEW_ONLY') {
            this.validationModalInfo.modalConfig.styleOptions.closeBtnClass = 'invisible';
        }
    }
    validationModalActions(modalAction: ModalActionEvent): void {
        if (this.validationModalInfo.validationType === 'VIEW_ONLY') {
            this._commonService.closeCOIValidationModal();
        } else {
            this._commonService.$globalEventNotifier.next({
                uniqueId: this.validationModalInfo.triggeredFrom,
                content: { modalAction, validationModalInfo: deepCloneObject(this.validationModalInfo)}
            })
        }
    }

}
