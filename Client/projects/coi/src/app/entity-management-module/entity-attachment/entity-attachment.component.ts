import { Component } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { EntityDataStoreService } from '../entity-data-store.service';
import { EntireEntityDetails, EntityAttachment, EntitySectionDetails, OverallAttachmentList } from '../shared/entity-interface';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { AttachmentTab } from '../shared/entity-constants';
import { deepCloneObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { EntityAttachmentService } from './entity-attachment.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
@Component({
    selector: 'app-entity-attachment',
    templateUrl: './entity-attachment.component.html',
    styleUrls: ['./entity-attachment.component.scss']
})
export class EntityAttachmentComponent {

    $subscriptions: Subscription[] = [];
    attachmentSectionDetails = new EntitySectionDetails();
    sponsorAttachmentDetails = new EntitySectionDetails()
    organizationAttachmentDetails = new EntitySectionDetails()
    complianceAttachmentDetails = new EntitySectionDetails()
    overviewTab: any;
    attachmentList: EntityAttachment[] = [];
    overallAttachmentList: OverallAttachmentList = {
        Organization: [],
        Compliance: [],
        General: [],
        Sponsor: []
    };
    isLoading = true;


    constructor(public commonService: CommonService, private _dataStoreService: EntityDataStoreService,
        private entityAttachmentService: EntityAttachmentService) { }


    ngOnInit() {
        window.scrollTo(0, 0);
        this.overviewTab = AttachmentTab;
        this.getDataFromStore()
        this.listenDataChangeFromStore();
        this.setSectionDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setSectionDetails() {
        this.setAttachmentDetails(this.attachmentSectionDetails, 2623, 'ATT_ENTITY_ATTACHMENTS');
        this.setAttachmentDetails(this.sponsorAttachmentDetails, 2611, 'ATT_SPONSOR_ATTACHMENTS');
        this.setAttachmentDetails(this.organizationAttachmentDetails, 2614, 'ATT_ORGANIZATION_ATTACHMENTS');
        this.setAttachmentDetails(this.complianceAttachmentDetails, 2616, 'ATT_COMPLIANCE_ATTACHMENTS');
    }

    setAttachmentDetails(details: any, subSectionId: number, sectionKey: string) {
        details.subSectionId = subSectionId;
        details.sectionId = this.commonService.getSectionId(this.overviewTab, sectionKey);
        details.sectionName = this.commonService.getSectionName(this.overviewTab, sectionKey);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore() {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) {
            return;
        }
        this.fetchEntityAttachments(ENTITY_DATA?.entityDetails?.entityId);
    }

    attachemntUpdated(attachmentList: EntityAttachment[]): void {
        this.attachmentList = deepCloneObject(attachmentList);
        this._dataStoreService.updateStore(['attachments'], { 'attachments': this.attachmentList });
    }

    fetchEntityAttachments(entityId: string | number): void {
        this.$subscriptions.push(this.entityAttachmentService.fetchEntityAttachments(entityId).subscribe((data: any) => {
            this.overallAttachmentList = data;
            this.isLoading = false;
        }, (_error: any) => {
            this.isLoading = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

}
