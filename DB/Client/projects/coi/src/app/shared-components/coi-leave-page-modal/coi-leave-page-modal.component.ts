import { Component, Input } from '@angular/core';
import { ModalActionEvent } from '../common-modal/common-modal.interface';
import { COILeavePageModalConfig } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';

@Component({
    selector: 'app-coi-leave-page-modal',
    templateUrl: './coi-leave-page-modal.component.html',
    styleUrls: ['./coi-leave-page-modal.component.scss']
})
export class CoiLeavePageModalComponent {

    @Input() leavePageModalInfo = new COILeavePageModalConfig();

    constructor(private _commonService: CommonService) { }

    ngOnInit(): void {
        this.leavePageModalInfo.modalConfig.dataBsOptions.focus = !document.querySelector('.offcanvas-backdrop');
    }

    leavePageModalActions(modalActionEvent: ModalActionEvent) {
        this._commonService.$globalEventNotifier.next({
            uniqueId: this.leavePageModalInfo.triggeredFrom,
            content: { modalActionEvent }
        });
    }
}
