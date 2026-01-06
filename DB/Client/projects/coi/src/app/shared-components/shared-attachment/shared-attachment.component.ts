import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedAttachmentService } from './shared-attachment.service';
import { AttachmentInputType, COIAttachment, UpdateAttachmentEvent } from '../../attachments/attachment-interface';
import { Subscription } from 'rxjs';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { COIAttachmentConfig, COIAttachmentModalInfo, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { closeCommonModal, deepCloneObject, fileDownloader, openCommonModal } from '../../common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { ATTACHMENT_NO_INFO_MESSAGE } from '../../no-info-message-constants';

@Component({
    selector: 'app-shared-attachment',
    templateUrl: './shared-attachment.component.html',
    styleUrls: ['./shared-attachment.component.scss'],
    providers: [SharedAttachmentService]
})
export class SharedAttachmentComponent implements OnInit, OnDestroy {

    @Input() attachmentConfig = new COIAttachmentConfig();

    attachmentLists: COIAttachment[] = [];
    isLoading = false;
    isSaving = false;
    $subscriptions: Subscription[] = [];
    attachmentInputType: AttachmentInputType = 'ADD';
    currentAttachment: COIAttachment;
    filteredCoiAttachmentsList: COIAttachment[] = [];
    updateIndex: number = null;
    isOpenConfirmationModal = false;
    isOpenVersionModal = false;
    CONFIRMATION_MODAL_ID: string = 'coi-attachment-delete-confirm-modal';
    VERSION_MODAL_ID: string = 'coi-disc-attachment-version-modal';
    versionModalConfig = new CommonModalConfig(this.VERSION_MODAL_ID, '', 'Close', 'xl');
    confirmationModalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Delete Attachment', 'Cancel');
    noDataMessage = ATTACHMENT_NO_INFO_MESSAGE;
    loginPersonId = this._commonService?.getCurrentUserDetail('personID');

    constructor(private _commonService: CommonService, private _sharedAttachmentService: SharedAttachmentService) { }

    ngOnInit(): void {
        this.fetchAllAttachments();
        this.applyAttachmentChanges(); 
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private applyAttachmentChanges(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'TRIGGER_SHARED_ATTACHMENT_COMPONENT') {
                    if (event.content?.isReloadAttachment) {
                        this.fetchAllAttachments();
                    } else {
                        this.setUpdatedAttachments(event.content as UpdateAttachmentEvent);
                    }
                }
            })
        );
    }

    private setUpdatedAttachments(event: UpdateAttachmentEvent) {
        const attachment = event.attachment;
        if (attachment === null) return;
        if (Array.isArray(attachment)) {
            // Add new attachments to the beginning of the list
            this.attachmentLists = [...attachment, ...this.attachmentLists];
        } else {
            const index = this.attachmentLists.findIndex(att => att.attachmentId === attachment.attachmentId);
            if (index > -1) {
                // update existing attachment
                this.attachmentLists[index] = deepCloneObject(attachment);
            }
        }
        this.filterLatestVersions();
        this.emitAttachmentCount();
    }

    private setDisclosureOrPersonId() {
        return this.attachmentConfig?.documentDetails?.documentId || this.attachmentConfig?.attachmentPersonId || this._commonService.getCurrentUserDetail('personID');
    }

    private fetchAllAttachments(): void {
        this.isLoading = true;
        this.$subscriptions.push(this._sharedAttachmentService.fetchAllAttachments(this.setDisclosureOrPersonId(), this.attachmentConfig?.attachmentApiEndpoint.loadAttachmentListEndpoint).subscribe((data: any) => {
            if (data) {
                this.attachmentLists = data;
                this.filterLatestVersions();
            }
            this.isLoading = false;
        }, (_err) => {
            this.isLoading = false;
            this._commonService.showToast(HTTP_ERROR_STATUS, "Error in fetching attachment list");
        }));
    }

    /**
    * Filters and retains only the latest versions of attachments.
    *
    * This method processes `attachmentLists` by grouping attachments based on their 
    * `attachmentNumber`. For attachments with multiple versions, it sorts them in 
    * descending order by `versionNumber` and keeps only the latest version. Older 
    * versions are stored in the `versionList` property of the latest attachment. 
    * If an attachment has no older versions, it is directly added to the final list.
    *
    * The filtered attachments are then stored in the `filteredCoiAttachmentsList`.
    */
    private filterLatestVersions(): void {
        const ATTACHMENTS_MAP = new Map<number, COIAttachment[]>();
        // Group attachments by attachmentNumber
        this.attachmentLists.forEach(attachment => {
            const { attachmentNumber } = attachment;
            const attachments = ATTACHMENTS_MAP.get(attachmentNumber) || [];
            attachments.push(attachment);
            ATTACHMENTS_MAP.set(attachmentNumber, attachments);
        });
        // Process the latest versions of each attachment
        this.filteredCoiAttachmentsList = Array.from(ATTACHMENTS_MAP.values()).map(attachments => {
            if (attachments.length > 1) {
                attachments.sort((a: COIAttachment, b: COIAttachment) => b.versionNumber - a.versionNumber);
                const [LATEST_ATTACHMENT, ...OLDER_VERSIONS] = attachments;
                LATEST_ATTACHMENT.versionList = OLDER_VERSIONS.length > 0 ? OLDER_VERSIONS : undefined;
                return LATEST_ATTACHMENT;
            }
            return attachments[0];
        });
        this.emitAttachmentCount();
    }

    private emitAttachmentCount(): void {
        const ATTACHMENTS_COUNT = this.filteredCoiAttachmentsList?.length;
        this._commonService.$globalEventNotifier.next({
            uniqueId: 'ATTACHMENTS_COUNT_UPDATE',
            content: { attachmentsCount: ATTACHMENTS_COUNT, attachmentList: this.filteredCoiAttachmentsList }
        });
    }

    openAttachmentModal(attachmentInputType: AttachmentInputType, currentAttachment: COIAttachment | null = null): void {
        this.currentAttachment = deepCloneObject(currentAttachment);
        this.attachmentInputType = attachmentInputType;
        const ATTACHMENT_MODAL_INFO = new COIAttachmentModalInfo();
        ATTACHMENT_MODAL_INFO.attachmentInputType = this.attachmentInputType;
        ATTACHMENT_MODAL_INFO.currentAttachment = this.currentAttachment;
        ATTACHMENT_MODAL_INFO.attachmentApiEndpoint = this.attachmentConfig?.attachmentApiEndpoint;
        ATTACHMENT_MODAL_INFO.documentDetails = this.attachmentConfig?.documentDetails;
        this._commonService.openCommonAttachmentModal(ATTACHMENT_MODAL_INFO);
    }

    deleteConfirmModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.closeConfirmationModal();
            case 'PRIMARY_BTN':
                return this.deleteAttachment();
            default: break;
        }
    }

    openDeleteConfirmModal(attachment: COIAttachment, deleteIndex: number): void {
        this.updateIndex = deleteIndex;
        this.isOpenConfirmationModal = true;
        this.currentAttachment = attachment;
        setTimeout(() => {
            openCommonModal(this.CONFIRMATION_MODAL_ID);
        }, 200);
    }

    private closeConfirmationModal(): void {
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
        setTimeout(() => {
            this.currentAttachment = null;
            this.isOpenConfirmationModal = false;
            this.updateIndex = null;
        }, 200);
    }

    fileVersionModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.closeVersionModal();
            default: break;
        }
    }

    openVersionModal(attachment: COIAttachment, versionIndex: number): void {
        this.updateIndex = versionIndex;
        this.isOpenVersionModal = true;
        this.currentAttachment = attachment;
        setTimeout(() => {
            openCommonModal(this.VERSION_MODAL_ID);
        }, 200);
    }

    private closeVersionModal(): void {
        closeCommonModal(this.VERSION_MODAL_ID);
        setTimeout(() => {
            this.currentAttachment = null;
            this.isOpenVersionModal = false;
            this.updateIndex = null;
        }, 200);
    }

    replaceAttachmentModal(currentAttachment: COIAttachment, updateIndex: number): void {
        this.currentAttachment = deepCloneObject(currentAttachment);
        this.openAttachmentModal('REPLACE', currentAttachment);
    }

    private deleteAttachment(): void {
        if (!this.isSaving) {
            this.isSaving = true
            this.$subscriptions.push(
                this._sharedAttachmentService.deleteAttachment(this.currentAttachment?.attachmentNumber, this.attachmentConfig?.attachmentApiEndpoint.deleteAttachmentEndpoint)
                    .subscribe((data: any) => {
                        this.deleteAttachmentAndVersions(this.updateIndex);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
                        this.isSaving = false;
                    }, (_err) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Attachment deleting failed.');
                        this.isSaving = false;
                    }));
        }
    }

    /**
    * Deletes an attachment and its versions from both `filteredCoiAttachmentsList` and `coiAttachmentsList`.
    *
    * @param index The index of the attachment to be deleted in the `filteredCoiAttachmentsList`.
    */
    private deleteAttachmentAndVersions(index: number): void {
        // Get the attachment to delete from filteredCoiAttachmentsList
        const ATTACHMENT_TO_DELETE = this.filteredCoiAttachmentsList[index];
        if (ATTACHMENT_TO_DELETE) {
            const { attachmentNumber } = ATTACHMENT_TO_DELETE;
            // Remove the attachment from filteredCoiAttachmentsList
            this.filteredCoiAttachmentsList.splice(index, 1);
            // Filter out all attachments with the same attachmentNumber from coiAttachmentsList
            this.attachmentLists = this.attachmentLists.filter(
                attachment => attachment.attachmentNumber !== attachmentNumber
            );
        }
        this.emitAttachmentCount();
        this.closeConfirmationModal();
    }

    downloadAttachment(attachment: COIAttachment): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._sharedAttachmentService.downloadAttachment(attachment?.attachmentId, this.attachmentConfig?.attachmentApiEndpoint.downloadAttachmentEndpoint)
                    .subscribe((data: any) => {
                        fileDownloader(data, attachment.fileName);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment downloaded successfully');
                        this.isSaving = false;
                    }, (_err) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Attachment downloading failed.');
                        this.isSaving = false;
                    }));
        }
    }

    editCoiAttachment(currentAttachment: COIAttachment, editIndex: number): void {
        this.updateIndex = editIndex;
        this.openAttachmentModal('DESCRIPTION_CHANGE', currentAttachment);
    }
}
