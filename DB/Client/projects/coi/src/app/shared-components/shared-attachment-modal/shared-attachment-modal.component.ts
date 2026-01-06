import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, deepCloneObject, openCommonModal } from '../../common/utilities/custom-utilities';
import { CommonService } from '../../common/services/common.service';
import { SharedAttachmentModalService } from './shared-attachment-modal.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { COIAttachment, CoiAttachmentType, UpdateAttachmentEvent } from '../../attachments/attachment-interface';
import { AttachmentSaveRO, AttachmentReplaceRO, COIAttachmentModalInfo } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-shared-attachment-modal',
    templateUrl: './shared-attachment-modal.component.html',
    styleUrls: ['./shared-attachment-modal.component.scss'],
    providers: [SharedAttachmentModalService]
})
export class SharedAttachmentModalComponent implements OnInit {

    isSaving = false;
    uploadedFiles = [];
    attachmentErrorMsg = '';
    $subscriptions: Subscription[] = [];
    newAttachments: Array<AttachmentSaveRO> = [];
    attachmentTypes: any[] = [];
    selectedAttachmentDescriptions: string[] = [];
    selectedAttachmentType: any[] = [];
    attachmentLookupTypes = 'EMPTY#EMPTY#false#false'
    COI_ATTACHMENT_MODAL_ID: string = 'coi-attachment-modal';
    coiAttachmentModalConfig = new CommonModalConfig(this.COI_ATTACHMENT_MODAL_ID, 'Add Attachment', 'Cancel', 'xl');

    @Input() attachmentConfig = new COIAttachmentModalInfo();

    constructor(public commonService: CommonService, 
        public _router: Router, 
        private _attachmentService: SharedAttachmentModalService
    ) { }

    ngOnInit(): void {
        this.attachmentConfig?.attachmentInputType === 'ADD' ? this.getAttachmentType() : this.openAttachmentModal();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getAttachmentType(): void {
        this.$subscriptions.push(this._attachmentService.getAttachmentTypes(this.attachmentConfig?.attachmentApiEndpoint.attachmentTypeEndpoint).subscribe((attachmentTypes: CoiAttachmentType[]) => {
            this.attachmentTypes = attachmentTypes;
            this.openAttachmentModal()
        }, (_err) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    private openAttachmentModal(): void {
        setTimeout(() => {
            this.coiAttachmentModalConfig.namings.primaryBtnName = this.getPrimaryBtnName();
            openCommonModal(this.COI_ATTACHMENT_MODAL_ID);
        }, 50);
    }

    fileDrop(files: any[]): void {
        this.attachmentErrorMsg = '';
        if (this.attachmentConfig?.attachmentInputType === 'REPLACE') {
            this.updateReplaceAttachmentDetails(files, 0);
        } else {
            this.uploadedFiles.push(...files);
        }
    }

    /**updateReplaceAttachmentDetails - sets attachment details for replacing attachment
    * @param files
    * @param index
    */
    private updateReplaceAttachmentDetails(files, index): void {
        if (files.length === 1) {
            this.uploadedFiles = [];
            this.uploadedFiles.push(files[index]);
            this.selectedAttachmentDescriptions[index] = deepCloneObject(this.attachmentConfig?.currentAttachment.description);
        } else {
            this.attachmentErrorMsg = 'Please choose only one document to replace.';
        }
    }

    private setAttachmentsForSave(): void {
        this.newAttachments = [];
        this.uploadedFiles.forEach((ele, index) => {
            const attachment: AttachmentSaveRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                description: this.selectedAttachmentDescriptions[index],
                attaTypeCode: this.selectedAttachmentType[index]?.attaTypeCode
            };
            this.newAttachments.push(attachment);
        });
    }

    deleteFromUploadedFileList(index: number): void {
        this.commonSplice(this.uploadedFiles, index);
        this.commonSplice(this.newAttachments, index);
        this.commonSplice(this.selectedAttachmentDescriptions, index);
        this.commonSplice(this.selectedAttachmentType, index);
        this.attachmentErrorMsg = '';
    }

    private commonSplice(arrayName, index): void {
        arrayName.splice(index, 1);
    }

    private saveAttachments(): void {
        if (!this.isSaving && this.validateAttachment()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._attachmentService.saveAttachment(this.getSaveAttachmentRO(), this.uploadedFiles, this.attachmentConfig?.attachmentApiEndpoint.saveOrReplaceEndpoint)
                    .subscribe((data: any) => {
                        this.isSaving = false;
                        this.clearAttachments(data);
                        this.showSuccessToast();
                    }, (_err: any) => {
                        this.isSaving = false;
                        this.showErrorToast();
                    }));
        }
    }

    private getSaveAttachmentRO(): {  [key: string]: any, attachments: any } {
        this.setAttachmentsForSave();
        const idKey = this.attachmentConfig?.documentDetails?.documentId ? this.attachmentConfig?.documentDetails?.key : 'personId';
        const idValue = this.attachmentConfig?.documentDetails?.documentId ? this.attachmentConfig?.documentDetails?.documentId : this.commonService.getCurrentUserDetail('personID');
        return {
            [idKey]: idValue,
            attachments: this.newAttachments
        };
    }

    private replaceAttachments(): void {
        this.attachmentErrorMsg = '';
        this.validateFiles();
        if (!this.attachmentErrorMsg && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._attachmentService.saveAttachment(this.getReplaceAttachmentRO(), this.uploadedFiles, this.attachmentConfig?.attachmentApiEndpoint.saveOrReplaceEndpoint)
                    .subscribe((data: any) => {
                        this.clearAttachments(data)
                        this.showSuccessToast();
                    }, err => {
                        this.isSaving = false;
                        this.showErrorToast();
            }));
        }
    }

    private getReplaceAttachmentRO(): { attachments: AttachmentReplaceRO[] } | Record<string, string> {
        const REPLACE_ATTACHMENT_RO: AttachmentReplaceRO[] = []
        this.uploadedFiles.forEach((ele, index) => {
            const attachment: AttachmentReplaceRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                description: this.selectedAttachmentDescriptions[index],
                attaTypeCode: this.attachmentConfig?.currentAttachment?.attaTypeCode,
                versionNumber: this.attachmentConfig?.currentAttachment?.versionNumber,
                attachmentNumber: this.attachmentConfig?.currentAttachment?.attachmentNumber
            };
            REPLACE_ATTACHMENT_RO.push(attachment);
        });
        return { 
            attachments: REPLACE_ATTACHMENT_RO,
            [this.attachmentConfig?.documentDetails?.key]: this.attachmentConfig?.documentDetails?.documentId ?? undefined
        };
    }

    private updateAttachments(): void {
        const params = {
            attachmentId: this.attachmentConfig?.currentAttachment.attachmentId,
            description: this.attachmentConfig?.currentAttachment.description,
            updateAttachmentEndpoint: this.attachmentConfig?.attachmentApiEndpoint.updateAttachmentEndpoint
        };
        this.$subscriptions.push(
            this._attachmentService.updateAttachment(params)
                .subscribe((data: string) => {
                    if (data.includes('successfully')) {
                        this.clearAttachments(this.attachmentConfig?.currentAttachment);
                        this.showSuccessToast();
                    }
                    else{
                        this.showErrorToast();
                    }
                },(_err) => {
                    this.isSaving = false;
                    this.showErrorToast();
                }));
    }

    private validateAttachment(): boolean {
        this.attachmentErrorMsg = '';
        this.validateFiles();
        this.validateAttachmentType();
        return !this.attachmentErrorMsg;
    }

    private validateAttachmentType(): void {
        this.uploadedFiles.forEach((ele, index) => {
            if (this.selectedAttachmentType[index]?.attaTypeCode == null || !this.selectedAttachmentType[index]?.attaTypeCode) {
                this.attachmentErrorMsg = 'Please select attachment type for each attachment.';
            }
        });
    }

    private validateFiles(): void {
        if (!this.uploadedFiles.length) {
            this.attachmentErrorMsg = 'Please choose at least one document.';
        }
    }

    private clearAttachments(updatedAttachment: COIAttachment = null): void {
        closeCommonModal(this.COI_ATTACHMENT_MODAL_ID);
        this.emitAttachments(updatedAttachment);
        setTimeout(() => {
            this.isSaving = false;
            this.uploadedFiles = [];
            this.newAttachments = [];
            this.selectedAttachmentDescriptions = [];
            this.selectedAttachmentType = [];
            this.commonService.closeCommonAttachmentModal();
        }, 200);
    }

    private emitAttachments(updatedAttachment: COIAttachment): void {
        const UPDATE_ATTACHMENT_EVENT: UpdateAttachmentEvent = { attachment: updatedAttachment, attachmentInputType: this.attachmentConfig?.attachmentInputType }
        this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_SHARED_ATTACHMENT_COMPONENT', content: UPDATE_ATTACHMENT_EVENT });
    }

    onAttachmentTypeSelected(event: any, uploadIndex: number): void {
        this.selectedAttachmentType[uploadIndex] = event?.[0] ? event?.[0] : null;
    }

    /** shows success toast based on replace attachment or not */
    private showSuccessToast(): void {
        let toastMsg: string;
        switch (this.attachmentConfig?.attachmentInputType) {
            case 'REPLACE':
                toastMsg = 'Attachment replaced successfully.';
                break;
            case 'ADD':
                toastMsg = 'Attachment added successfully.';
                break;
            case 'DESCRIPTION_CHANGE':
                toastMsg = 'Attachment description updated successfully.';
                break;
            default:
                toastMsg = 'Something went wrong, Please try again.';
                break;
        }
        this.commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
    }


    /** shows error toast based on replace attachment or not and wab enabled or not */
    private showErrorToast(): void {
        let toastMsg: string;
        switch (this.attachmentConfig?.attachmentInputType) {
            case 'REPLACE':
                toastMsg = 'Failed to replace attachment.';
                break;
            case 'ADD':
                toastMsg = 'Failed to add attachment.';
                break;
            case 'DESCRIPTION_CHANGE':
                toastMsg = 'Failed to update the attachment description.';
                break;
            default:
                toastMsg = 'Something went wrong, Please try again.';
                break;
        }
        this.commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
    }

    attachmentModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.clearAttachments();
            case 'PRIMARY_BTN':
                return this.attachmentActions();
            default: break;
        }
    }

    private attachmentActions(): void {
        switch (this.attachmentConfig?.attachmentInputType) {
            case 'ADD': return this.saveAttachments();
            case 'REPLACE': return this.replaceAttachments();
            case 'DESCRIPTION_CHANGE': return this.updateAttachments();
            default: return;
        }
    }

    private getPrimaryBtnName(): string {
        switch (this.attachmentConfig?.attachmentInputType) {
            case 'ADD': return 'Add Attachment';
            case 'REPLACE': return 'Replace Attachment';
            case 'DESCRIPTION_CHANGE': return 'Update Attachment';
            default: return;
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    private handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.clearAttachments();
        }
    }
}
