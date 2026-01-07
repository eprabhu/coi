import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../../../../app/common/services/common.service';
import { subscriptionHandler } from '../../../../../app/common/utilities/subscription-handler';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import { SharedComponentModule } from '../../../../../app/shared-components/shared-component.module';
import { AttachmentApiEndpoint, COIAttachmentConfig, GlobalEventNotifier } from '../../../../../app/common/services/coi-common.interface';
import { ManagementPlanStoreData } from '../../../shared/management-plan.interface';
import { MAINTAIN_CMP_ATTACHMENT_RIGHTS, MAINTAIN_CMP_RIGHTS } from '../../../shared/management-plan-constants';

@Component({
    selector: 'app-management-plan-attachments',
    templateUrl: './management-plan-attachments.component.html',
    styleUrls: ['./management-plan-attachments.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedComponentModule]
})
export class ManagementPlanAttachmentsComponent implements OnInit, OnDestroy {

    attachmentConfig = new COIAttachmentConfig();
    
    private $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService, private _managementPlanDataStore: ManagementPlanDataStoreService) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenGlobalEventNotifier();
    }
    
    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'TRIGGER_DISCLOSURE_PARAM_CHANGE' && event?.content?.documentType === 'CMP' && event?.content?.managementPlan) {
                    this.getDataFromStore();
                    this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_SHARED_ATTACHMENT_COMPONENT', content: { isReloadAttachment: true } });
                }
            })
        );
    }

    private setAttachmentConfig(): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        const IS_CMP_PERSON = this._managementPlanDataStore.isLoggedCmpPerson();
        const IS_LOGGED_PERSON_REVIEWER = this._managementPlanDataStore.isLoggedPersonReviewer();
        const IS_FORM_EDITABLE_STATUS = this._managementPlanDataStore.isFormEditableStatus();
        const HAS_MAINTAIN_CMP_RIGHTS = this._managementPlanDataStore.getHasMaintainCmp();
        const IS_FORM_EDITABLE = IS_FORM_EDITABLE_STATUS && (IS_CMP_PERSON || HAS_MAINTAIN_CMP_RIGHTS || IS_LOGGED_PERSON_REVIEWER);
        const HAS_MAINTAIN_ATTACHMENT_RIGHT = this._commonService.getAvailableRight(MAINTAIN_CMP_ATTACHMENT_RIGHTS);
        const HAS_MANAGE_RIGHT = HAS_MAINTAIN_ATTACHMENT_RIGHT || HAS_MAINTAIN_CMP_RIGHTS;
        const IS_EDIT_MODE = IS_FORM_EDITABLE || (!IS_FORM_EDITABLE && HAS_MANAGE_RIGHT);
        this.attachmentConfig.gridClass = 'coi-grid-1 coi-grid-md-1 coi-grid-lg-1 coi-grid-xl-2 coi-grid-xxl-2';
        this.attachmentConfig.isViewMode = !IS_EDIT_MODE;
        this.attachmentConfig.canEditByAdmin = HAS_MANAGE_RIGHT;
        this.attachmentConfig.documentDetails = {
            key: 'cmpId',
            documentId: MANAGEMENT_PLAN?.plan?.cmpId
        };
        this.attachmentConfig.attachmentApiEndpoint = this.getAttachmentEndPoint();
    }

    private getAttachmentEndPoint(): AttachmentApiEndpoint {
       return {
            attachmentTypeEndpoint: '/cmp/plan/getCmpAttachTypes',
            saveOrReplaceEndpoint: '/cmp/attachment/save',
            updateAttachmentEndpoint: '/cmp/attachment/updateDetails',
            loadAttachmentListEndpoint: '/cmp/attachment/getAttachmentsByCmpId',
            deleteAttachmentEndpoint: '/cmp/attachment/delete',
            downloadAttachmentEndpoint: '/cmp/attachment/download'
        };
    }

    private getDataFromStore(): void {
        this.setAttachmentConfig();
    }

}
