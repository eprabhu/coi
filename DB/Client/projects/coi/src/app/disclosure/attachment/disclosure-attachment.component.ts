import { Component, OnInit } from '@angular/core';
import { CoiService } from "../services/coi.service";
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { AttachmentApiEndpoint, COIAttachmentConfig, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { COI } from '../coi-interface';

@Component({
    selector: 'app-disclosure-attachment',
    templateUrl: './disclosure-attachment.component.html',
    styleUrls: ['./disclosure-attachment.component.scss']
})
export class DisclosureAttachmentComponent implements OnInit {

    $subscriptions: Subscription[] = [];
    gridClass: string = 'coi-grid-1 coi-grid-md-1 coi-grid-lg-1 coi-grid-xl-2 coi-grid-xxl-2';
    isMangeAttachmentAction = false;
    isViewMode = false;
    coiData = new COI();
    attachmentConfig = new COIAttachmentConfig();

    constructor(public _coiService: CoiService,
        private _commonService: CommonService,
        private _dataStore: DataStoreService
    ) { }

    ngOnInit(): void {
        this.isMangeAttachmentAction = this._commonService.getAvailableRight(['MANAGE_DISCLOSURE_ATTACHMENT']);
        this.getDataFromStore();
        this.listenGlobalEventNotifier();
    }
    
    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'TRIGGER_DISCLOSURE_PARAM_CHANGE' && event?.content?.disclosureType === 'FCOI' && event?.content?.coiData) {
                    this.getDataFromStore();
                    this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_SHARED_ATTACHMENT_COMPONENT', content: { isReloadAttachment: true } });
                }
            })
        );
    }

    private checkManageAttachmentAction(): void {
        const CURRENT_USER_ID = this._commonService.getCurrentUserDetail('personID');
        const DISCLOSURE_CREATOR_ID = this.coiData.coiDisclosure.person.personId;
        const IS_DISCLOSURE_PENDING = this._dataStore.getEditModeForCOI();
        const IS_WITHDRAW_REQUEST_PENDING = this.coiData.coiDisclosure.withdrawalRequested;
        this.isViewMode = !IS_DISCLOSURE_PENDING || (CURRENT_USER_ID !== DISCLOSURE_CREATOR_ID && !this.isMangeAttachmentAction && !this._commonService.isCoiReviewer) || IS_WITHDRAW_REQUEST_PENDING;
    }

    private setAttachmentConfig(): void {
        this.checkManageAttachmentAction();
        this.attachmentConfig.gridClass = this.gridClass;
        this.attachmentConfig.isViewMode = this.isViewMode;
        this.attachmentConfig.canEditByAdmin = this.isMangeAttachmentAction;
        this.attachmentConfig.documentDetails = {
            key: 'disclosureId',
            documentId: this.coiData?.coiDisclosure?.disclosureId
        };
        this.attachmentConfig.attachmentApiEndpoint = this.getAttachmentEndPoint();
    }

    private getAttachmentEndPoint(): AttachmentApiEndpoint {
       return {
            attachmentTypeEndpoint: '/loadDisclAttachTypes',
            saveOrReplaceEndpoint: '/disclosure/attachment/save',
            updateAttachmentEndpoint: '/disclosure/attachment/updateDetails',
            loadAttachmentListEndpoint: '/disclosure/attachment/getAttachmentsByDisclId',
            deleteAttachmentEndpoint: '/disclosure/attachment/delete',
            downloadAttachmentEndpoint: '/disclosure/attachment/download'
        };
    }

    private getDataFromStore(): void {
        const COI_DATA = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.coiData = COI_DATA;
        this.setAttachmentConfig();
    }

}
