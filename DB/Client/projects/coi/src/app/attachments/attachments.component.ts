import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../common/services/common.service';
import { subscriptionHandler } from '../../../../fibi/src/app/common/utilities/subscription-handler';
import { AttachmentApiEndpoint, COIAttachmentConfig } from '../common/services/coi-common.interface';

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

    @Input() isViewMode = false;
    @Input() personId: string | null = null;
    @Input() gridClass = 'coi-grid-1 coi-grid-md-1 coi-grid-lg-1 coi-grid-xl-2 coi-grid-xxl-2';

    $subscriptions: Subscription[] = [];
    attachmentConfig = new COIAttachmentConfig();

    constructor(public commonService: CommonService) { }

    ngOnInit(): void {
        this.setAttachmentConfig();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setAttachmentConfig(): void {
        this.attachmentConfig.gridClass = this.gridClass;
        this.attachmentConfig.isViewMode = this.isViewMode;
        this.attachmentConfig.attachmentPersonId = this.personId;
        this.attachmentConfig.attachmentApiEndpoint = this.getAttachmentEndPoint();
    }

    private getAttachmentEndPoint(): AttachmentApiEndpoint {
        return {
            attachmentTypeEndpoint: '/loadDisclAttachTypes',
            saveOrReplaceEndpoint: '/saveOrReplaceAttachments',
            updateAttachmentEndpoint: '/updateAttachmentDetails',
            loadAttachmentListEndpoint: '/loadAllAttachmentsForPerson',
            deleteAttachmentEndpoint: '/deleteAttachment',
            downloadAttachmentEndpoint: '/downloadAttachment'
        }
    }
}
