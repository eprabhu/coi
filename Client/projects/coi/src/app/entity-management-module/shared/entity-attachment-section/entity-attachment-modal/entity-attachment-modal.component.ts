import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { subscriptionHandler } from '../../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { Router } from '@angular/router';
import { EntityAttachmentModalService } from '../entity-attachment-section.service';
import { CommonService } from '../../../../common/services/common.service';
import { deepCloneObject, isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { EntireEntityDetails, EntityAttachment, EntityAttachmentType, EntityDetails } from '../../entity-interface';
import { EntityDataStoreService } from '../../../entity-data-store.service';
import { CommonModalConfig, ModalActionEvent } from 'projects/coi/src/app/shared-components/common-modal/common-modal.interface';
import { closeCommonModal, openCommonModal } from 'projects/coi/src/app/common/utilities/custom-utilities';
import { AttachmentReplaceRO, AttachmentSaveRO } from 'projects/coi/src/app/common/services/coi-common.interface';

@Component({
    selector: 'app-entity-attachment-modal',
    templateUrl: './entity-attachment-modal.component.html',
    styleUrls: ['./entity-attachment-modal.component.scss']
})
export class EntityAttachmentModalComponent implements OnInit {

    isSaving = false;
    uploadedFiles = [];
    attachmentErrorMsg = '';
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    newAttachments: Array<AttachmentSaveRO> = [];
    attachmentTypes: EntityAttachmentType[] = [];
    selectedAttachmentDescriptions: string[] = [];
    selectedAttachmentType: EntityAttachmentType[] = [];
    ENTITY_ATTACHMENT_MODAL_ID: string = 'entity-attachment-modal';
    entityAttachmentTypeOption = 'ENTITY_ATTACHMENT_TYPE#ATTACHMENT_TYPE_CODE#false#false';
    entityAttachmentModalConfig = new CommonModalConfig(this.ENTITY_ATTACHMENT_MODAL_ID, 'Add Risk', 'Cancel', 'xl');

    @Input() attachmentHelpText: string;
    @Input() currentAttachment: EntityAttachment;
    @Input() sectionCode: '1' | '2' | '3' | '4';
    @Input() attachmentInputType: 'REPLACE' | 'ADD' | 'DESCRIPTION_CHANGE' = 'ADD';
    @Input() subSectionId: any;

    @Output() closeModal = new EventEmitter<EntityAttachment[] | EntityAttachment | null>();

    constructor(private _attachmentSectionService: EntityAttachmentModalService, public commonService: CommonService, public _router: Router, private _dataStoreService: EntityDataStoreService) {}

    ngOnInit(): void {
        if (this.attachmentInputType === 'ADD') {
            this.fetchAttachmentTypes();
        } else {
            setTimeout(() => {
                this.openAttachmentModal();
            }, 50)
        }
        this.getDataFromStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private fetchAttachmentTypes(): void {
        this.$subscriptions.push(
            this._attachmentSectionService.fetchAttachmentTypes(this.sectionCode)
                .subscribe((attachmentTypes: EntityAttachmentType[]) => {
                    this.attachmentTypes = attachmentTypes;
                    this.openAttachmentModal()
                }, err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
                    this.closeModal.emit(null);
                }));
    }

    private openAttachmentModal(): void {
        this.entityAttachmentModalConfig.namings.primaryBtnName = this.getPrimaryBtnName();
        openCommonModal(this.ENTITY_ATTACHMENT_MODAL_ID);
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
    }

    fileDrop(files: any) {
        this.attachmentErrorMsg = '';
        if (this.attachmentInputType === 'REPLACE') {
            this.updateReplaceAttachmentDetails(files, 0);
        } else {
            this.uploadedFiles.push(...files);
        }
    }

    /**updateReplaceAttachmentDetails - sets attachment details for replacing attachment
    * @param files
    * @param index
    */
    updateReplaceAttachmentDetails(files, index) {
        if (files.length === 1) {
            this.uploadedFiles = [];
            this.uploadedFiles.push(files[index]);
            this.selectedAttachmentDescriptions[index] = deepCloneObject(this.currentAttachment.comment);
        } else {
            this.attachmentErrorMsg = 'Please choose only one document to replace.';
        }
    }

    private updateAddAttachmentDetails(): void {
        this.uploadedFiles.forEach((ele, index) => {
            const attachment: AttachmentSaveRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                comment: this.selectedAttachmentDescriptions[index],
                attachmentTypeCode: this.selectedAttachmentType[index]?.attachmentTypeCode
            };
            this.newAttachments.push(attachment);
        });
    }
    private getReplaceAttachmentRO(): { sectionCode: string, newAttachments: AttachmentReplaceRO[], entityId: string | number } {
        const REPLACE_ATTACHMENT_RO: AttachmentReplaceRO[] = []
        this.uploadedFiles.forEach((ele, index) => {
            const attachment: AttachmentReplaceRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                comment: this.selectedAttachmentDescriptions[index],
                versionNumber: this.currentAttachment?.versionNumber,
                attachmentNumber: this.currentAttachment?.attachmentNumber,
                attachmentTypeCode: this.currentAttachment?.attachmentTypeCode,
            };
            REPLACE_ATTACHMENT_RO.push(attachment);
        });
        return {
            sectionCode: this.sectionCode,
            entityId: this.entityDetails.entityId,
            newAttachments: REPLACE_ATTACHMENT_RO
        }
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

    saveAttachments(): void {
        this.checkMandatory();
        if (!this.attachmentErrorMsg && !this.isSaving) {
            this.isSaving = true;
            this.updateAddAttachmentDetails();
            this.$subscriptions.push(this._attachmentSectionService.saveAttachment({
                sectionCode: this.sectionCode,
                newAttachments: this.newAttachments,
                entityId: this.entityDetails?.entityId
            }, this.uploadedFiles).subscribe((data: any) => {
                this._dataStoreService.enableModificationHistoryTracking();
                this.clearAttachments(data)
                this.showSuccessToast();
            }, err => {
                this.isSaving = false;
                this.showErrorToast();
            }));
        }
    }

    replaceAttachments(): void {
        this.attachmentErrorMsg = '';
        this.validateFiles();
        if (!this.attachmentErrorMsg && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._attachmentSectionService.saveAttachment(this.getReplaceAttachmentRO(), this.uploadedFiles)
                    .subscribe((data: any) => {
                        this._dataStoreService.enableModificationHistoryTracking();
                        this.clearAttachments(data)
                        this.showSuccessToast();
                    }, err => {
                        this.isSaving = false;
                        this.showErrorToast();
                    }));
        }
    }

    updateAttachments(): void {
        this.$subscriptions.push(
            this._attachmentSectionService.updateAttachment(this.currentAttachment.entityAttachmentId, this.currentAttachment.comment)
                .subscribe((data: any) => {
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.clearAttachments(this.currentAttachment);
                    this.showSuccessToast();
                }, err => {
                    this.isSaving = false;
                    this.showErrorToast();
                }));
    }

    private checkMandatory(): void {
        this.attachmentErrorMsg = '';
        this.validateFiles();
        this.validateAttachmentType();
    }

    private validateAttachmentType(): void {
        this.uploadedFiles.forEach((ele, index) => {
            if (this.selectedAttachmentType[index]?.attachmentTypeCode == null || !this.selectedAttachmentType[index]?.attachmentTypeCode) {
                this.attachmentErrorMsg = 'Please select attachment type for each attachment.';
            }
        });
    }

    private validateFiles(): void {
        if (!this.uploadedFiles.length) {
            this.attachmentErrorMsg = 'Please choose at least one document.';
        }
    }

    clearAttachments(emitData: any = null): void {
        closeCommonModal(this.ENTITY_ATTACHMENT_MODAL_ID);
        setTimeout(() => {
            this.isSaving = false;
            this.uploadedFiles = [];
            this.newAttachments = [];
            this.selectedAttachmentDescriptions = [];
            this.selectedAttachmentType = [];
            this.closeModal.emit(emitData);
        }, 200);
    }

    clearValidation(): void {
        this.attachmentErrorMsg = '';
    }

    onAttachmentTypeSelected(event: any, uploadIndex: number) {
        this.selectedAttachmentType[uploadIndex] = event?.[0] ? event?.[0] : null;
    }

    /** shows success toast based on replace attachment or not */
    showSuccessToast() {
        let toastMsg: string;
        switch (this.attachmentInputType) {
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
    showErrorToast() {
        let toastMsg: string;
        switch (this.attachmentInputType) {
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

    attachmentActions(): void {
        switch (this.attachmentInputType) {
            case 'ADD': return this.saveAttachments();
            case 'REPLACE': return this.replaceAttachments();
            case 'DESCRIPTION_CHANGE': return this.updateAttachments();
            default: return;
        }
    }

    getPrimaryBtnName(): string {
        switch (this.attachmentInputType) {
            case 'ADD': return 'Add Attachment';
            case 'REPLACE': return 'Replace Attachment';
            case 'DESCRIPTION_CHANGE': return 'Update Attachment';
            default: return;
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.clearAttachments();
        }
    }
}
