import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { EntireEntityDetails, EntityAttachment, EntityDetails, EntityRiskCategoryCode } from '../entity-interface';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { closeCommonModal, deepCloneObject, fileDownloader, isEmptyObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { EntityAttachmentModalService } from './entity-attachment-section.service';
import { AttachmentInputType } from '../../../attachments/attachment-interface';
import { SUB_AWARD_ATTACHMENTS, COMPLIANCE_ATTACHMENTS, SPONSOR_ATTACHMENTS, ENTITY_ATTACHMENTS } from '../entity-constants';
import { EntityManagementService } from '../../entity-management.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-entity-attachment-section',
    templateUrl: './entity-attachment-section.component.html',
    styleUrls: ['./entity-attachment-section.component.scss'],
})
export class EntityAttachmentSectionComponent implements OnInit, OnDestroy, OnChanges {

    @Input() sectionId: any;
    @Input() sectionName: any;
    @Input() subSectionId: any;
    @Input() riskCategoryCode: EntityRiskCategoryCode;
    @Input() entityAttachmentsList: EntityAttachment[] = [];

    @Output() emitUpdatedAttachmentList: EventEmitter<EntityAttachment[]> = new EventEmitter<EntityAttachment[]>();

    updateIndex: number = null;
    entityAttachmentHelpText = '';
    isOpenAttachmentModal = false;
    isOpenConfirmationModal = false;
    isOpenVersionModal = false;
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    isEditMode = false;
    isShowCommentButton = false;
    commentCount = 0;
    currentAttachment: EntityAttachment;
    attachmentInputType: AttachmentInputType = 'ADD';
    filteredEntityAttachmentsList: EntityAttachment[] = [];
    VERSION_MODAL_ID: string = 'entity-attachment-delete-confirm-modal';
    CONFIRMATION_MODAL_ID: string = 'entity-attachment-delete-confirm-modal';
    versionModalConfig = new CommonModalConfig(this.VERSION_MODAL_ID, '', 'Close', 'xl');
    confirmationModalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Delete Attachment', 'Cancel');

    constructor(private _commonService: CommonService,
        private _dataStoreService: EntityDataStoreService,
        public entityManagementService: EntityManagementService,
        private _attachmentSectionService: EntityAttachmentModalService,
    ) {}

    ngOnInit(): void {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.filterLatestVersions();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(this.getSectionDetails(this.riskCategoryCode));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['entityAttachmentsList'] && !changes['entityAttachmentsList'].isFirstChange()) {
            const PREVIOUS_LIST = changes['entityAttachmentsList'].previousValue;
            const CURRENT_VALUE = changes['entityAttachmentsList'].currentValue;
            (JSON.stringify(PREVIOUS_LIST) !== JSON.stringify(CURRENT_VALUE)) && this.filterLatestVersions();
        }
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.isEditMode = this._dataStoreService.getEditMode();
        this.commentCount = ENTITY_DATA.commentCountList?.[this.getSectionDetails(this.riskCategoryCode)?.sectionTypeCode] || 0;
        this.checkUserHasRight();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(this._dataStoreService.dataEvent
            .subscribe(() => {
                this.getDataFromStore();
            }));
    }

    /**
     * Filters the latest versions of entity attachments.
     *
     * This method processes the `entityAttachmentsList` to group attachments by their
     * `attachmentNumber`, sorts them by `versionNumber`, and then stores only the latest
     * version in the `filteredEntityAttachmentsList`. If an attachment has older versions,
     * they are stored in the `versionList` property of the latest attachment.
     */
    filterLatestVersions(): void {
        const ATTACHMENTS_MAP = new Map<number, EntityAttachment[]>();
        // Group attachments by attachmentNumber
        for (const attachment of this.entityAttachmentsList) {
            const { attachmentNumber } = attachment;
            if (!ATTACHMENTS_MAP.has(attachmentNumber)) {
                ATTACHMENTS_MAP.set(attachmentNumber, []);
            }
            ATTACHMENTS_MAP.get(attachmentNumber)!.push(attachment);
        }
        const PROCESSED_LIST: EntityAttachment[] = [];
        // Sort attachments by versionNumber and process the latest versions
        ATTACHMENTS_MAP.forEach((attachments, attachmentNumber) => {
            if (attachments.length > 1) {
                attachments.sort((a, b) => b.versionNumber! - a.versionNumber!);
                const LATEST_ATTACHMENT = attachments[0];
                const OLDER_VERSIONS = attachments.slice(1); // Exclude the latest version
                LATEST_ATTACHMENT.versionList = OLDER_VERSIONS.length > 0 ? OLDER_VERSIONS : undefined;
                PROCESSED_LIST.push(LATEST_ATTACHMENT);
            } else {
                PROCESSED_LIST.push(attachments[0]);
            }
        });
        this.filteredEntityAttachmentsList = PROCESSED_LIST;
    }

    closeAttachmentModal(event: EntityAttachment[] | EntityAttachment): void {
        if (Array.isArray(event)) {
            this.entityAttachmentsList = deepCloneObject(event);
            this.filterLatestVersions()
        } else if (event) {
            this.updateAndArrangeAttachments(event);
        }
        this.emitUpdatedAttachmentList.emit(this.entityAttachmentsList);
        this.isOpenAttachmentModal = false;
        this.currentAttachment = null;
        this.updateIndex = null;
    }

    private updateAndArrangeAttachments(event: EntityAttachment) {
        const UPDATED_ATTACHMENT = deepCloneObject(event);
        this.filteredEntityAttachmentsList.splice(this.updateIndex, 1);
        const INDEX = this.entityAttachmentsList.findIndex(attachment => attachment.entityAttachmentId == attachment?.entityAttachmentId);
        INDEX > -1 ?? this.entityAttachmentsList.splice(INDEX, 1);
        this.filteredEntityAttachmentsList.unshift(UPDATED_ATTACHMENT);
        this.entityAttachmentsList.unshift(UPDATED_ATTACHMENT);
    }

    private getSectionDetails(riskCategoryCode: EntityRiskCategoryCode): any {
        switch (riskCategoryCode) {
            case 'OR': return SUB_AWARD_ATTACHMENTS;
            case 'CO': return COMPLIANCE_ATTACHMENTS;
            case 'SP': return SPONSOR_ATTACHMENTS;
            case 'EN': return ENTITY_ATTACHMENTS;
            default: return;
        }
    }

    getSectionCode(): number | undefined {
        switch (this.riskCategoryCode) {
            case 'CO': return 4; // Compliance - Attachment
            case 'OR': return 3; // Organization - Attachment
            case 'SP': return 2; // Sponsor - Attachment
            case 'EN': return 1; // General - Attachment
            default: return undefined;
        }
    }

    openAttachmentModal(attachmentInputType: AttachmentInputType) {
        this.isOpenAttachmentModal = true;
        this.attachmentInputType = attachmentInputType;
        // this.entityAttachmentHelpText = 'You can view and edit attachments under the tab.';
    }

    replaceAttachmentModal(currentAttachment: EntityAttachment, updateIndex: number): void {
        this.currentAttachment = deepCloneObject(currentAttachment);
        this.openAttachmentModal('REPLACE');
    }

    editEntityAttachment(currentAttachment: EntityAttachment, editIndex: number): void {
        this.updateIndex = editIndex;
        this.currentAttachment = deepCloneObject(currentAttachment);
        this.openAttachmentModal('DESCRIPTION_CHANGE');
    }

    downloadAttachment(attachment: EntityAttachment): void {
        this.$subscriptions.push(
            this._attachmentSectionService.downloadAwardAttachment(attachment?.entityAttachmentId)
                .subscribe((data: any) => {
                    fileDownloader(data, attachment.fileName);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment downloaded successfully');
                }, (_error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Attachment downloading failed.');
                }));
    }

    deleteAttachment(): void {
        this.$subscriptions.push(
            this._attachmentSectionService.deleteAttachment(this.currentAttachment?.attachmentNumber)
                .subscribe((data: any) => {
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.deleteAttachmentAndVersions(this.updateIndex);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
                }, (_error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Attachment deleting failed.');
                }));
    }

    /**
     * Deletes an attachment and its versions from both `filteredEntityAttachmentsList` and `entityAttachmentsList`.
     *
     * @param index The index of the attachment to be deleted in the `filteredEntityAttachmentsList`.
     */
    deleteAttachmentAndVersions(index: number): void {
        // Get the attachment to delete from filteredEntityAttachmentsList
        const ATTACHMENT_TO_DELETE = this.filteredEntityAttachmentsList[index];
        if (ATTACHMENT_TO_DELETE) {
            const { attachmentNumber } = ATTACHMENT_TO_DELETE;
            // Remove the attachment from filteredEntityAttachmentsList
            this.filteredEntityAttachmentsList.splice(index, 1);
            // Filter out all attachments with the same attachmentNumber from entityAttachmentsList
            this.entityAttachmentsList = this.entityAttachmentsList.filter(
                attachment => attachment.attachmentNumber !== attachmentNumber
            );
        }
        this.emitUpdatedAttachmentList.emit(this.entityAttachmentsList);
        this.closeConfirmationModal();
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

    openDeleteConfirmModal(attachment: EntityAttachment, deleteIndex: number): void {
        this.updateIndex = deleteIndex;
        this.isOpenConfirmationModal = true;
        this.currentAttachment = attachment;
        setTimeout(() => {
            openCommonModal(this.CONFIRMATION_MODAL_ID);
        }, 200);
    }

    closeConfirmationModal(): void {
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

    openVersionModal(attachment: EntityAttachment, versionIndex: number): void {
        this.updateIndex = versionIndex;
        this.isOpenVersionModal = true;
        this.currentAttachment = attachment;
        setTimeout(() => {
            openCommonModal(this.VERSION_MODAL_ID);
        }, 200);
    }

    closeVersionModal(): void {
        closeCommonModal(this.VERSION_MODAL_ID);
        setTimeout(() => {
            this.currentAttachment = null;
            this.isOpenVersionModal = false;
            this.updateIndex = null;
        }, 200);
    }

    checkUserHasRight(): void {
        const CAN_MANAGE_ENTITY_SPONSOR = this._commonService.getAvailableRight(['MANAGE_ENTITY_SPONSOR'], 'SOME') && this.riskCategoryCode == 'SP';
        const CAN_MANAGE_ENTITY_ORGANIZATION = this._commonService.getAvailableRight(['MANAGE_ENTITY_ORGANIZATION'], 'SOME') && this.riskCategoryCode == 'OR';
        const CAN_MANAGE_ENTITY_COMPLIANCE = this._commonService.getAvailableRight(['MANAGE_ENTITY_COMPLIANCE'], 'SOME') && this.riskCategoryCode == 'CO';
        const CAN_MANAGE_ENTITY_ATTACHMENT = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') && this.riskCategoryCode == 'EN';
        if (!CAN_MANAGE_ENTITY_SPONSOR && !CAN_MANAGE_ENTITY_ORGANIZATION && !CAN_MANAGE_ENTITY_COMPLIANCE && !CAN_MANAGE_ENTITY_ATTACHMENT) {
            this.isEditMode = false;
        }
        if (this.isEditMode) {
            this.isEditMode = this._dataStoreService.getOverviewEditRight(this.sectionId);
        }
    }

    openReviewComments(): void {
        const SECTION_DETAILS = this.getSectionDetails(this.riskCategoryCode);
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SECTION_DETAILS.commentTypeCode,
            sectionTypeCode: SECTION_DETAILS.sectionTypeCode
        });
    }

}
