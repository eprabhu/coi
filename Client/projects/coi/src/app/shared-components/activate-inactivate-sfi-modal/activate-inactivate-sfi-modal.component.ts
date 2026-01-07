import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivateInactivateSfiModalService } from './activate-inactivate-sfi-modal.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, PROJECT_TYPE } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { hideModal, openModal } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-activate-inactivate-sfi-modal',
    templateUrl: './activate-inactivate-sfi-modal.component.html',
    styleUrls: ['./activate-inactivate-sfi-modal.component.scss'],
    providers: [ActivateInactivateSfiModalService]
})
export class ActivateInactivateSfiModalComponent implements OnInit, OnDestroy {

    constructor(private _activateInactivateSfiService: ActivateInactivateSfiModalService, private _commonServices: CommonService, private _router: Router) { }

    @Input() entityName: any = {};
    reasonValidateMapSfi = new Map();
    activateInactivateReason = '';
    $subscriptions: Subscription[] = [];
    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
    @Input() relationshipDetails: any;
    @Input() personEntityId: number = null;
    @Input() updatedRelationshipStatus: string;
    @Input() personEntityNumber: any;
    @Input() isSignificantFinInterest = false;
    modalHelpTexts = ''
    concurrentActionName = '';
    helpTexts: string;
    hasPendingProjDiscl = false;
    disclosureVoidMessage = '';

    ngOnInit() {
        this.helpTexts = this.updatedRelationshipStatus == 'INACTIVE' ? 'Please provide the reason for inactivation.' :
                         'Please provide the reason for activation.'
        this.modalHelpTexts = this.updatedRelationshipStatus == 'INACTIVE' ? 'You are about to deactivate your relationship with entity.': 'You are about to activate your relationship with entity.'
        this.disclosureVoidMessage = this._commonServices.getEngagementDisclosureVoidMessage('TO_ACTIVATE');
        this.validatePendingProjectDisclosure();
    }

    private openActiveInactiveModal(): void {
        document.getElementById('activate-inactivate-show-btn').click();
    }

    private validatePendingProjectDisclosure(): void {
        this.openActiveInactiveModal();
    }

    private markProjectDisclosureAsVoid(response: any): void {
        this.$subscriptions.push(
            this._commonServices.markProjectDisclosureAsVoid()
                .subscribe((data: any) => {
                    this.activateOrInactivateSuccess(response);
                },  (error: any) => {
                    this._commonServices.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    activateAndInactivateSfi() {
        if (this.validForActivateAndInactivate()) {
            const REQ_BODY = {
                personEntityId: this.personEntityId,
                versionStatus: this.updatedRelationshipStatus,
                revisionReason: this.activateInactivateReason,
                personEntityNumber: this.personEntityNumber
            };
            this.setActivateInactivate(REQ_BODY);
        }
    }

    setActivateInactivate(REQ_BODY) {
        this.$subscriptions.push(this._activateInactivateSfiService.activateAndInactivateSfi(REQ_BODY).subscribe((res: any) => {
            if (this.hasPendingProjDiscl && this.updatedRelationshipStatus == 'ACTIVE') {
                this.markProjectDisclosureAsVoid(res);
            } else {
                this.activateOrInactivateSuccess(res);
            }
            this._commonServices.$globalEventNotifier.next({ uniqueId: 'ACTIVATE_DEACTIVATE_ENG_MODAL', content: { response: res, action: 'ACTIVATE_DEACTIVATE_SUCCESS' }});
        }, err => {
            if (err.status === 405) {
                document.getElementById('activate-inactivate-show-btn').click();
                this.concurrentActionName = this.updatedRelationshipStatus == 'INACTIVE' ? 'Inactivate Engagement' : 'Activate Engagement';
                openModal('sfiConcurrentActionModalCOI',{
                    backdrop: 'static',
                    keyboard: false,
                    focus: true
                  });
            } else {
                this._commonServices.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
                this.activateOrInactivateFailed();
            }
        }));
    }

    closeSfiActivateAndInactivateModal(data: any = null): void {
        setTimeout(() => {
            this.activateInactivateReason = '';
            this.closeModal.emit(data ? data : false);
        }, 200);
    }

    validForActivateAndInactivate(): boolean {
        this.reasonValidateMapSfi.clear();
        if (!this.activateInactivateReason && this.updatedRelationshipStatus == 'INACTIVE') {
            this.reasonValidateMapSfi.set('reason', `Please provide the reason for deactivation.`);
        }
        return this.reasonValidateMapSfi.size === 0 ? true : false;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    activateOrInactivateSuccess(response) {
        this.closeSfiActivateAndInactivateModal(response);
        this._commonServices.showToast(HTTP_SUCCESS_STATUS, `Engagement successfully ${this.updatedRelationshipStatus == 'INACTIVE' ? 'inactivated' : 'activated '}`);
        hideModal('activateInactivateSfiModal');
    }

    activateOrInactivateFailed() {
        this.closeSfiActivateAndInactivateModal();
        this._commonServices.showToast(HTTP_ERROR_STATUS, `Error in ${this.updatedRelationshipStatus == 'INACTIVE' ? 'inactivating' : 'activating'} Engagement`);
        hideModal('activateInactivateSfiModal');
    }

    navigateConcurrency() {
        if (!this._router.url.includes('entity-details/entity') || this.updatedRelationshipStatus == 'INACTIVE') {
                window.location.reload();
        }
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: this.personEntityId, mode: 'view' } });
        hideModal('sfiConcurrentActionModalCOI');
    }

    groupBy(jsonData: any, key: string, innerKey: string): any {
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key][innerKey]] = relationsTypeGroup[item[key][innerKey]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.closeModal.emit(false);
        }
    }
}
