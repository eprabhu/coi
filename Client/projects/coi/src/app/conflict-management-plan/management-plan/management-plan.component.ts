import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AutoSaveEvent, AutoSaveService } from '../../common/services/auto-save.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ManagementPlanDataStoreService } from './services/management-plan-data-store.service';
import { ManagementPlanActionType, ManagementPlanService } from './services/management-plan.service';
import { AvailableDocumentActions, DataStoreEvent, DisclosureCommentsCountRO, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { COMMON_ERROR_TOAST_MSG, DATE_PLACEHOLDER, DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import {
    CMP_BASE_URL, CMP_CHILD_ROUTE_URL, CMP_GENERATE_FILE_TYPE, CMP_STATUS, CMP_TYPE, COI_CMP_MODULE_CODE, TASK_STATUS_BADGE, TASK_STATUS_CODES
} from '../shared/management-plan-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, openCommonModal } from '../../common/utilities/custom-utilities';
import {
    CmpAttachmentReplaceFilesRO, CmpAttachmentReplaceRO, CmpAttachmentSaveFilesRO,
    CmpAttachmentSaveRO, CmpCommentsCounts, CmpConfirmationModal, CmpConfirmModalType, CmpHeader, CmpReviewLocation,
    CmpRouteGuard, ManagementPlanStoreData, UpdateCmpStatusRO
} from '../shared/management-plan.interface';
import { HeaderService } from '../../common/header/header.service';
import { CMP_LOCALIZE } from '../../app-locales';
import { parseDateWithoutTimestamp, isValidDateFormat } from '../../common/utilities/date-utilities';
import { COIAttachment } from '../../attachments/attachment-interface';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { environment } from '../../../environments/environment';
import { CmpTaskDetails, PersonTaskListModalConfig } from './sub-modules/management-plan-tasks/task.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../../shared-components/coi-review-comments/coi-review-comments-constants';

@Component({
    selector: 'app-management-plan',
    templateUrl: './management-plan.component.html',
    styleUrls: ['./management-plan.component.scss']
})
export class ManagementPlanComponent implements OnInit {

    isSaving = false;
    isEditMode = false;
    isLoading = false;
    infoText = '';
    deployMap = environment.deployUrl;
    managementPlan = new ManagementPlanStoreData();
    datePlaceHolder = DATE_PLACEHOLDER;
    CMP_LOCALIZE = CMP_LOCALIZE;
    CMP_GENERATE_FILE_TYPE = CMP_GENERATE_FILE_TYPE;
    actionBtnConfig = {
        isShowGenerateBtn: false,
        isShowUploadBtn: false,
        isShowReplaceBtn: false,
        isShowReGenerateBtn: false,
    };
    isShowGenerateWarning = false;
    uploadedAttachment: COIAttachment[] = [];
    taskStatusBadge = TASK_STATUS_BADGE;
    loggedPersonPendingTaskList: CmpTaskDetails[] = [];
    personTaskListModalConfig = new PersonTaskListModalConfig();

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    @ViewChild('approvalDateInput', { static: false }) approvalDateInput?: ElementRef;
    @ViewChild('expirationDateInput', { static: false }) expirationDateInput?: ElementRef;

    constructor(private _router: Router,
        public commonService: CommonService,
        private _headerService: HeaderService,
        private _activatedRoute: ActivatedRoute,
        public autoSaveService: AutoSaveService,
        public managementPlanService: ManagementPlanService,
        private _dataFormatPipe: DateFormatPipeWithTimeZone,
        private _managementPlanDataStore: ManagementPlanDataStoreService) { }

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenUrlChanges();
        this.autoSaveSubscribe();
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromStore();
        this.autoSaveService.initiateAutoSave();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
        this.managementPlanService.clearManagementPlanServiceData();
    }

    private listenUrlChanges(): void {
        this.$subscriptions.push(
            this._router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.handleUrlChange();
                }
            })
        );
    }

    private handleUrlChange(): void {
        const CMP_ID = this._activatedRoute.snapshot.firstChild?.paramMap.get('CMP_ID');
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        this.managementPlanService.rerouteIfWrongPath(this._router.url, MANAGEMENT_PLAN?.plan);
        if (!CMP_ID) {
            this._headerService.redirectToCMP(MANAGEMENT_PLAN.plan?.cmpId)
        } else if (CMP_ID !== String(MANAGEMENT_PLAN.plan?.cmpId)) {
            this.fetchEntireManagementPlan(CMP_ID);
        }
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        this.managementPlan = this._managementPlanDataStore.getData();
        this.isEditMode = this._managementPlanDataStore.getCanEditOrReview();
        this.infoText = this.getInfoText();
        if (storeEvent.action === 'REFRESH') {
            this.getAvailableCmpActions();
            this.checkUserTaskAssignment();
            this.getCommentsCounts();
            if (!this._router.url.includes(CMP_CHILD_ROUTE_URL.DETAILS)) {
                this.getApplicableForms();
            }
            if (!this._router.url.includes(CMP_CHILD_ROUTE_URL.ATTACHMENT)) {
                this.isLoading = true;
                this.fetchAllAttachments();
            }
        }
    }

    private getInfoText(): string {
        const { INPROGRESS, DRAFT, VOID } = CMP_STATUS;
        const STATUS_TYPE_CODE = String(this.managementPlan?.plan?.statusType?.statusCode);
        const IS_EDIT_MODE = [INPROGRESS, DRAFT].map(status => status.toString()).includes(STATUS_TYPE_CODE);
        this.uploadedAttachment = this.managementPlan?.cmpAttachmentsList?.filter((attachment) => attachment?.attaTypeCode == '1');
        const HAS_UPLOADED = this.uploadedAttachment?.length > 0;
        const CAN_MAINTAIN_CMP = this._managementPlanDataStore.getHasMaintainCmp();
        const IS_UNIVERSITY_TYPE = String(this.managementPlan?.plan?.cmpTypeCode) === String(CMP_TYPE.UNIVERSITY);
        this.actionBtnConfig.isShowGenerateBtn = CAN_MAINTAIN_CMP && IS_EDIT_MODE && !HAS_UPLOADED && IS_UNIVERSITY_TYPE;
        this.actionBtnConfig.isShowReGenerateBtn = CAN_MAINTAIN_CMP && IS_EDIT_MODE && HAS_UPLOADED && IS_UNIVERSITY_TYPE;
        this.actionBtnConfig.isShowUploadBtn = CAN_MAINTAIN_CMP && !HAS_UPLOADED && (STATUS_TYPE_CODE !== String(VOID));
        this.actionBtnConfig.isShowReplaceBtn = CAN_MAINTAIN_CMP && HAS_UPLOADED && (STATUS_TYPE_CODE !== String(VOID));
        const UPLOADED_ATTACHMENT = this.uploadedAttachment[0];
        if (HAS_UPLOADED) {
            return `<strong>${UPLOADED_ATTACHMENT.fileName}</strong> (Version ${UPLOADED_ATTACHMENT.versionNumber}) <span class="coi-text-light">Created by</span> ${UPLOADED_ATTACHMENT.updateUserFullame} on ${this._dataFormatPipe.transform(UPLOADED_ATTACHMENT.updateTimestamp)}`
        } else {
            return `Click <strong>Generate ${CMP_LOCALIZE.TERM_CMP} Document</strong> or <strong>Upload</strong> to create or upload a ${CMP_LOCALIZE.TERM_CMP} document.`;
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private fetchEntireManagementPlan(cmpId: string | number): void {
        this.$subscriptions.push(
            this.managementPlanService.fetchEntireManagementPlan(cmpId)
                .subscribe({
                    next: (managementPlan: CmpRouteGuard) => {
                        this.managementPlanService.clearManagementPlanServiceData();
                        this._managementPlanDataStore.setRouteGuardStoreData(managementPlan);
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch management plan details.');
                    }
                })
        );
    }

    private getApplicableForms(): void {
        this.$subscriptions.push(
            this.managementPlanService.getApplicableForms(this.managementPlan?.plan)
                .subscribe({
                    next: (data: any) => {
                        const FORM_LIST = data || [];
                        this.managementPlanService.setFormStatus(FORM_LIST);
                        setTimeout(() => {
                            this.managementPlanService.setFormBuilderId(FORM_LIST[0], this._managementPlanDataStore.isFormEditable());
                        });
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
    }

    private getAvailableCmpActions(): void {
        this.$subscriptions.push(
            this.managementPlanService.getAvailableCmpActions(this.managementPlan?.plan?.cmpId)
                .subscribe({
                    next: (availableActions: AvailableDocumentActions[]) => {
                        this._managementPlanDataStore.updateStore(['availableActions'], { availableActions });
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                })
        );
    }

    private checkUserTaskAssignment(): void {
        this.loggedPersonPendingTaskList = [];
        const FILTERED_TASK_LIST = this.managementPlan?.loggedPersonTaskList?.filter((task) => {
            return String(task?.cmpTaskStatus?.taskStatusCode) !== String(TASK_STATUS_CODES.COMPLETED);
        })
        if (FILTERED_TASK_LIST?.length > 0 && !this._router.url.includes(CMP_CHILD_ROUTE_URL.TASK)) {
            this.loggedPersonPendingTaskList = FILTERED_TASK_LIST;
            this.openTaskInitialDetailsModal();
        }
    }

    private openTaskInitialDetailsModal(): void {
        this.personTaskListModalConfig.isShowModal = true;
        setTimeout(() => {
            openCommonModal(this.personTaskListModalConfig.modalConfig.namings.modalName);
        });
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                if (event?.uniqueId === 'TRIGGER_USER_CMP_ACTIONS') {
                    if (EVENT_DATA?.actionType as ManagementPlanActionType === 'FORM_SAVE_COMPLETE') {
                        this.managementPlanService.isFormBuilderDataChangePresent = false;
                        this.commonService.setChangesAvailable(false);
                        const UPDATE_TIME_STAMP = Array.isArray(EVENT_DATA.result) ? EVENT_DATA.result[0]?.updateTimestamp : EVENT_DATA.updateTimestamp;
                        this.updateLastSavedTime(UPDATE_TIME_STAMP);
                        if (this.managementPlanService.isAnyAutoSaveFailed) {
                            this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
                        }
                    } else if (EVENT_DATA?.actionType as ManagementPlanActionType === 'REFRESH_CMP' && EVENT_DATA?.cmpId === this.managementPlan?.plan?.cmpId) {
                        this.fetchEntireManagementPlan(EVENT_DATA?.cmpId);
                    }
                }
                if (event?.uniqueId === 'ATTACHMENTS_COUNT_UPDATE') {
                    this._managementPlanDataStore.updateStore(['cmpAttachmentsList'], { cmpAttachmentsList: event?.content?.attachmentList });
                }
                if (event?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                    if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(event?.content?.action)) {
                        this.getCommentsCounts();
                        this.commonService.clearReviewCommentsSlider();
                    }
                }
            })
        );
    }

    private updateLastSavedTime(updateTimestamp: number): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        MANAGEMENT_PLAN.plan.updateTimestamp = updateTimestamp;
        this.autoSaveService.updatedLastSaveTime(updateTimestamp, true);
        this._managementPlanDataStore.updateStore(['plan'], { plan: MANAGEMENT_PLAN.plan });
    }

    private getCommentsCounts(): void {
        const MANAGEMENT_PLAN_DETAILS: CmpHeader = this.managementPlan?.plan;
        const COMMENT_COUNT_RO: DisclosureCommentsCountRO = {
            moduleCode: COI_CMP_MODULE_CODE,
            documentOwnerPersonId: MANAGEMENT_PLAN_DETAILS.personId,
            moduleItemKey: MANAGEMENT_PLAN_DETAILS.cmpId,
            replyCommentsCountRequired: false
        }
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.commonService.getDisclosureCommentsCount(COMMENT_COUNT_RO)
            .subscribe({
                    next: (response: CmpCommentsCounts) => {
                        this._managementPlanDataStore.updateStore(['cmpCommentsCount'], { cmpCommentsCount: response });
                    },
                    error: (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch comments count.');
                    }
                })
        );
        this.commonService.removeLoaderRestriction();
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(
            this.autoSaveService.autoSaveTrigger$
                .subscribe((event: AutoSaveEvent) => {
                    this.managementPlanService.formBuilderEvents.next({ eventType: 'SAVE' });
                }));
    }

    private async saveAndUpdateCmpStatus(): Promise<void> {
        if (!this.isSaving) {
            this.isSaving = true;
            const API_RESPONSE: 'SUCCESS' | 'ERROR' | 'NO_ATTACHMENTS' = await this.saveAttachmentForCmpStatus();
            if (API_RESPONSE === 'ERROR') {
                this.handleApiFailure(`Failed to upload ${CMP_LOCALIZE.TERM_CMP} document. Please try again.`);
            } else {
                this.fetchAllAttachments();
                this.updateCmpStatus();
            }
        }
    }

    private updateCmpStatus(): void {
        this.$subscriptions.push(
            this.managementPlanService.updateCmpStatus(this.getUpdateCmpStatusRO())
                .subscribe({
                    next: (cmpHeader: CmpHeader) => {
                        this.getAvailableCmpActions();
                        this._managementPlanDataStore.updateStore(['plan'], { plan: cmpHeader });
                        this.handleApiSuccess(`${CMP_LOCALIZE.TERM_CMP} status updated successfully.`);
                    },
                    error: (error: any) => {
                        this.handleApiFailure(error, `Failed to update ${CMP_LOCALIZE.TERM_CMP} status.`);
                    }
                })
        );
    }

    private getUpdateCmpStatusRO(): UpdateCmpStatusRO {
        return {
            cmpId: this.managementPlan?.plan?.cmpId,
            description: this.managementPlanService.confirmationModal?.description,
            availableActionId: this.managementPlanService.confirmationModal?.selectedAction?.availableActionId,
            approvalDate: this.managementPlanService.confirmationModal?.approvalDate
                ? parseDateWithoutTimestamp(this.managementPlanService.confirmationModal?.approvalDate)
                : undefined,
            expirationDate: this.managementPlanService.confirmationModal?.approvalDate
                ? parseDateWithoutTimestamp(this.managementPlanService.confirmationModal?.expirationDate)
                : undefined
        }
    }

    private handleApiSuccess(toastMessage: string): void {
        this.isSaving = false;
        this.closeConfirmationModal();
        this.commonService.showToast(HTTP_SUCCESS_STATUS, toastMessage);
    }

    private handleApiFailure(error: any, toastMsg = COMMON_ERROR_TOAST_MSG): void {
        this.isSaving = false;
        if (error?.status === 405) {
            this.closeConfirmationModal();
            this.commonService.concurrentUpdateAction = CMP_LOCALIZE.TERM_CMP;
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
        }
    }

    private updateReviewerStoreData(reviewer: CmpReviewLocation): void {
        const COI_REVIEWER_LIST: CmpReviewLocation[] = this._managementPlanDataStore.getData()?.cmpReviewLocationList;
        const index = COI_REVIEWER_LIST.findIndex(ele => ele.cmpReviewId === reviewer.cmpReviewId);
        COI_REVIEWER_LIST[index] = reviewer;
        this._managementPlanDataStore.updateStore(['cmpReviewLocationList'], { cmpReviewLocationList: COI_REVIEWER_LIST });
    }

    private startLocationReview(reviewerDetails: CmpReviewLocation): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const DESCRIPTION = this.managementPlanService.confirmationModal?.description;
            this.$subscriptions.push(
                this.managementPlanService.startLocationReview(reviewerDetails?.cmpReviewId, DESCRIPTION)
                    .subscribe({
                        next: (reviewer: CmpReviewLocation) => {
                            this.updateReviewerStoreData(reviewer);
                            this.handleApiSuccess(`Review started successfully.`);
                        },
                        error: (error) => {
                            this.handleApiFailure(error, `Failed to start review.`);
                        }
                    })
            );
        }
    }

    private completeLocationReview(reviewerDetails: CmpReviewLocation): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const RO = {
                endDate: parseDateWithoutTimestamp(new Date().setHours(0, 0, 0, 0)),
                description: this.managementPlanService.confirmationModal?.description
            };
            this.$subscriptions.push(
                this.managementPlanService.completeLocationReview(reviewerDetails?.cmpReviewId, RO)
                    .subscribe({
                        next: (reviewer: CmpReviewLocation) => {
                            this.updateReviewerStoreData(reviewer);
                            this.handleApiSuccess(`Review completed successfully.`);
                        },
                        error: (error) => {
                            this.handleApiFailure(error, `Failed to complete review.`);
                        }
                    })
            );
        }
    }

    private generateManagementPlan(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.generateManagementPlan(this.managementPlan?.plan?.cmpId)
                    .subscribe({
                        next: () => {
                            this.handleApiSuccess(`Management Plan generated successfully.`);
                            this.updateAttachmentDataStore();
                        },
                        error: (error) => {
                            this.handleApiFailure(error, `Failed to generate management plan.`);
                        }
                    })
            );
        }
    }

    private regenerateManagementPlan(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.regenerateManagementPlan(this.managementPlan?.plan?.cmpId)
                    .subscribe({
                        next: () => {
                            this.handleApiSuccess(`Management Plan generated successfully.`);
                            this.updateAttachmentDataStore();
                        },
                        error: (error) => {
                            this.handleApiFailure(error, `Failed to generate management plan.`);
                        }
                    })
            );
        }
    }

    private updateAttachmentDataStore(): void {
        if (this._router.url.includes(CMP_CHILD_ROUTE_URL.ATTACHMENT)) {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_SHARED_ATTACHMENT_COMPONENT', content: { isReloadAttachment: true } });
        } else {
            this.fetchAllAttachments();
        }
    }

    private closeConfirmationModal(): void {
        closeCommonModal(this.managementPlanService.confirmationModal?.modalConfig?.namings?.modalName);
        this.timeOutRef = setTimeout(() => {
            this.managementPlanService.confirmationModal = new CmpConfirmationModal();
        }, 200);
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    private fetchAllAttachments(): Promise<void> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.managementPlanService.fetchAllCmpAttachments(this.managementPlan?.plan?.cmpId)
                    .subscribe((data: any) => {
                        this.filterLatestVersions(data);
                        resolve();
                    }, (_err) => {
                        this.isLoading = false;
                        this.commonService.showToast(HTTP_ERROR_STATUS, "Error in fetching attachment list");
                        resolve();
                    }));
        });
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
    private filterLatestVersions(attachmentLists: COIAttachment[]): void {
        const ATTACHMENTS_MAP = new Map<number, COIAttachment[]>();
        // Group attachments by attachmentNumber
        attachmentLists?.forEach(attachment => {
            const { attachmentNumber } = attachment;
            const attachments = ATTACHMENTS_MAP.get(attachmentNumber) || [];
            attachments.push(attachment);
            ATTACHMENTS_MAP.set(attachmentNumber, attachments);
        });
        // Process the latest versions of each attachment
        this.managementPlan.cmpAttachmentsList = Array.from(ATTACHMENTS_MAP.values())?.map(attachments => {
            if (attachments?.length > 1) {
                attachments.sort((a: COIAttachment, b: COIAttachment) => b.versionNumber - a.versionNumber);
                const [LATEST_ATTACHMENT, ...OLDER_VERSIONS] = attachments;
                LATEST_ATTACHMENT.versionList = OLDER_VERSIONS.length > 0 ? OLDER_VERSIONS : undefined;
                return LATEST_ATTACHMENT;
            }
            return attachments?.[0];
        });
        this.isLoading = false;
        this._managementPlanDataStore.updateStore(['cmpAttachmentsList'], { cmpAttachmentsList: this.managementPlan.cmpAttachmentsList });
    }

    private uploadAttachment(): Promise<'SUCCESS' | 'ERROR'> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.managementPlanService.saveAttachment(this.getUploadAttachmentRO(), this.managementPlanService.confirmationModal.uploadedFiles)
                    .subscribe((data: any) => {
                        resolve('SUCCESS');
                    }, err => {
                        resolve('ERROR')
                    }));
        });
    }

    private async uploadCmpDocument(): Promise<void> {
        if (!this.isSaving) {
            this.isSaving = true;
            const API_RESPONSE: 'SUCCESS' | 'ERROR' = await this.uploadAttachment();
            if (API_RESPONSE === 'SUCCESS') {
                this.fetchAllAttachments();
                this.handleApiSuccess(`${CMP_LOCALIZE.TERM_CMP} document uploaded successfully.`);
            } else {
                this.handleApiFailure(`Failed to upload ${CMP_LOCALIZE.TERM_CMP} document.`);
            }
            this.isSaving = false;
        }
    }

    private getUploadAttachmentRO(): CmpAttachmentSaveRO {
        const SAVE_ATTACHMENT_RO: CmpAttachmentSaveFilesRO[] = []
        this.managementPlanService.confirmationModal.uploadedFiles.forEach((ele, index) => {
            const ATTACHMENT: CmpAttachmentSaveFilesRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                description: this.managementPlanService.confirmationModal.description,
                attaTypeCode: '1'
            };
            SAVE_ATTACHMENT_RO.push(ATTACHMENT);
        });
        return {
            cmpId: this.managementPlan?.plan?.cmpId ?? undefined,
            attachments: SAVE_ATTACHMENT_RO,
            isCmpDocumentUpload: true
        };
    }

    private replaceAttachments(): Promise<'SUCCESS' | 'ERROR'> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.managementPlanService.saveAttachment(this.getReplaceAttachmentRO(), this.managementPlanService.confirmationModal.uploadedFiles)
                    .subscribe((data: any) => {
                        resolve('SUCCESS');
                    }, err => {
                        resolve('ERROR');
                    }));
        });
    }

    private async replaceCmpDocument(): Promise<void> {
        if (!this.isSaving) {
            this.isSaving = true;
            const API_RESPONSE: 'SUCCESS' | 'ERROR' = await this.replaceAttachments();
            if (API_RESPONSE === 'SUCCESS') {
                this.fetchAllAttachments();
                this.handleApiSuccess(`${CMP_LOCALIZE.TERM_CMP} document generated successfully.`);
            } else {
                this.handleApiFailure(`Failed to replace ${CMP_LOCALIZE.TERM_CMP} document.`);
            }
            this.isSaving = false;
        }
    }

    private getReplaceAttachmentRO(): CmpAttachmentReplaceRO {
        const REPLACE_ATTACHMENT_RO: CmpAttachmentReplaceFilesRO[] = []
        this.managementPlanService.confirmationModal.uploadedFiles.forEach((ele, index) => {
            const ATTACHMENT: CmpAttachmentReplaceFilesRO = {
                fileDataId: null,
                fileName: ele.name,
                mimeType: ele.type,
                description: this.managementPlanService.confirmationModal.description,
                attaTypeCode: '1',
                versionNumber: this.uploadedAttachment[0]?.versionNumber,
                attachmentNumber: this.uploadedAttachment[0]?.attachmentNumber
            };
            REPLACE_ATTACHMENT_RO.push(ATTACHMENT);
        });
        return {
            attachments: REPLACE_ATTACHMENT_RO,
            cmpId: this.managementPlan?.plan?.cmpId ?? undefined,
            isCmpDocumentReplace: true
        };
    }

    private async saveAttachmentForCmpStatus(): Promise<'SUCCESS' | 'ERROR' | 'NO_ATTACHMENTS'> {
        if (this.managementPlanService.confirmationModal?.uploadedFiles?.length) {
            if (this.uploadedAttachment.length) {
                return await this.replaceAttachments();
            } else {
                return await this.uploadAttachment();
            }
        }
        return 'NO_ATTACHMENTS';
    }

    openGenerateConfirmationModal(action: 'GENERATE' | 'REGENERATE'): void {
        const BTN_NAME = action === 'GENERATE' ? 'Generate' : 'Regenerate';
        this.managementPlanService.confirmationModal = new CmpConfirmationModal();
        this.managementPlanService.confirmationModal.action = action;
        this.managementPlanService.confirmationModal.description = '';
        this.managementPlanService.confirmationModal.visibleFieldsList = ['CMP_ACTION_DESCRIPTION'];
        this.managementPlanService.confirmationModal.mandatoryFieldsList = [];
        this.managementPlanService.confirmationModal.descriptionLabel = `Description`;
        this.managementPlanService.confirmationModal.textAreaPlaceholder = `Please provide the description`;
        this.managementPlanService.confirmationModal.modalHeader = action === 'GENERATE'
            ? `Generate ${CMP_LOCALIZE.TERM_CMP} Document` : `Regenerate ${CMP_LOCALIZE.TERM_CMP} Document`;
        this.managementPlanService.confirmationModal.modalBody = '';
        this.managementPlanService.confirmationModal.modalConfig = new CommonModalConfig('cmp-generate-confirm-modal', '', '', 'xl');
        this.managementPlanService.confirmationModal.additionalFooterBtns = [
            { action: 'CANCEL', event: { buttonName: 'Cancel', btnClass: 'btn-outline-secondary' } },
            { action: 'PREVIEW', event: { buttonName: 'Preview', btnClass: 'btn-outline-secondary' } },
            { action: 'GENERATE', event: { buttonName: BTN_NAME, btnClass: 'btn-primary' } }
        ];
        this.managementPlanService.confirmationModal.modalHelpTextConfig = { subSectionId: '2904', elementId: `cmp-generate-modal-header` };
        this.managementPlanService.confirmationModal.descriptionHelpTextConfig = { subSectionId: '2904', elementId: `cmp-generate-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.managementPlanService.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openUploadConfirmationModal(action: 'UPLOAD' | 'REPLACE'): void {
        this.managementPlanService.confirmationModal = new CmpConfirmationModal();
        this.managementPlanService.confirmationModal.action = action;
        this.managementPlanService.confirmationModal.description = '';
        this.managementPlanService.confirmationModal.visibleFieldsList = ['CMP_ACTION_DESCRIPTION', 'ATTACHMENT'];
        this.managementPlanService.confirmationModal.mandatoryFieldsList = ['ATTACHMENT'];
        this.managementPlanService.confirmationModal.descriptionLabel = `Description`;
        this.managementPlanService.confirmationModal.textAreaPlaceholder = `Please provide the description`;
        this.managementPlanService.confirmationModal.modalHeader = action === 'UPLOAD'
            ? `Upload ${CMP_LOCALIZE.TERM_CMP} Document` : `Replace ${CMP_LOCALIZE.TERM_CMP} Document`;
        this.managementPlanService.confirmationModal.modalBody = '';
        this.managementPlanService.confirmationModal.modalConfig = action === 'UPLOAD'
            ? new CommonModalConfig('cmp-upload-confirm-modal', 'Upload', 'Cancel', 'xl')
            : new CommonModalConfig('cmp-upload-confirm-modal', 'Replace', 'Cancel', 'xl');
        this.managementPlanService.confirmationModal.modalHelpTextConfig = { subSectionId: '2904', elementId: `cmp-upload-modal-header` };
        this.managementPlanService.confirmationModal.descriptionHelpTextConfig = { subSectionId: '2904', elementId: `cmp-upload-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.managementPlanService.confirmationModal.modalConfig.namings.modalName);
        });
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.performCmpDocAction(this.managementPlanService.confirmationModal?.action);
        } else {
            this.closeConfirmationModal();
        }
    }

    performCmpDocAction(action: CmpConfirmModalType): void {
        if (action === 'CANCEL' || this.validateConfirmation()) {
            switch (action) {
                case "CONFIRMATION":
                    this.saveAndUpdateCmpStatus();
                    break;
                case "START_LOCATION_REVIEW":
                    this.startLocationReview(this.managementPlanService.confirmationModal?.selectedReviewLocation);
                    break;
                case "COMPLETE_LOCATION_REVIEW":
                    this.completeLocationReview(this.managementPlanService.confirmationModal?.selectedReviewLocation);
                    break;
                case "GENERATE":
                    this.generateManagementPlan();
                    break;
                case "REGENERATE":
                    this.regenerateManagementPlan();
                    break;
                case "UPLOAD":
                    this.uploadCmpDocument();
                    break;
                case "REPLACE":
                    this.replaceCmpDocument();
                    break;
                case "CANCEL":
                    this.closeConfirmationModal();
                    break;
                default: break;
            }
        }
    }

    validateConfirmation(): boolean {
        const { errorMsgMap, mandatoryFieldsList, description, uploadedFiles, approvalDate, expirationDate } = this.managementPlanService.confirmationModal || {};
        errorMsgMap.clear();
        if (mandatoryFieldsList.includes('CMP_ACTION_DESCRIPTION') && !description?.trim()) {
            errorMsgMap.set('CMP_ACTION_DESCRIPTION', 'Please provide the description.');
        }
        if (mandatoryFieldsList.includes('ATTACHMENT') && !uploadedFiles?.length) {
            errorMsgMap.set('ATTACHMENT', 'Please provide the attachment.');
        }
        if (mandatoryFieldsList.includes('APPROVAL_DATE') && !approvalDate) {
            errorMsgMap.set('APPROVAL_DATE', 'Please provide the approval date.');
        }
        if (mandatoryFieldsList.includes('EXPIRATION_DATE') && !expirationDate) {
            errorMsgMap.set('EXPIRATION_DATE', 'Please provide the expiration date.');
        }
        return errorMsgMap.size === 0;
    }

    /**
    * @param  {} files
    * Check file duplication ,if no duplication insert it into an array
    */
    fileDrop(files: any): void {
        this.managementPlanService.confirmationModal.errorMsgMap.delete('ATTACHMENT');
        let dupCount = 0;
        for (let index = 0; index < files?.length; index++) {
            if (this.managementPlanService.confirmationModal.uploadedFiles.find(dupFile => dupFile?.name === files[index]?.name) != null) {
                dupCount = dupCount + 1;
                const ERROR_MSG = '* ' + dupCount + ' File(s) already added';
                this.managementPlanService.confirmationModal.errorMsgMap.set('ATTACHMENT', ERROR_MSG);
            } else {
                this.managementPlanService.confirmationModal.uploadedFiles.push(files[index]);
            }
        }
    }

    deleteFromUploadedFileList(index: number): void {
        this.managementPlanService.confirmationModal.uploadedFiles.splice(index, 1);
        this.managementPlanService.confirmationModal.errorMsgMap.delete('ATTACHMENT');
    }

    validateDateFormat(fieldName: 'APPROVAL_DATE' | 'EXPIRATION_DATE'): void {
        this.managementPlanService.confirmationModal.errorMsgMap.delete(fieldName);
        const INPUT_MAP = {
            SUBMISSION_DATE: this.approvalDateInput,
            EXPIRATION_DATE: this.expirationDateInput
        };
        const DATE_VALUE = INPUT_MAP[fieldName]?.nativeElement.value?.trim() || '';
        if (!DATE_VALUE) {
            return;
        }
        if (!this.isDateFormatValid(DATE_VALUE)) {
            const ERROR_MSG = `Entered date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`;
            this.managementPlanService.confirmationModal.errorMsgMap.set(fieldName, ERROR_MSG);
        }
    }

    assignedTaskDetailsModalAction(event: ModalActionEvent): void {
        if (event.action === 'CLOSE_BTN' || event.action === 'SECONDARY_BTN') {
            this.closeAndReset();
        }
    }

    private closeAndReset(): void {
        closeCommonModal(this.personTaskListModalConfig.modalConfig.namings.modalName);
        setTimeout(() => {
            this.personTaskListModalConfig = new PersonTaskListModalConfig();
        }, 200);
    }

    navigateToTask(taskId: number): void {
        this.closeAndReset();
        const CMP_ID = this.managementPlan?.plan?.cmpId;
        if (!CMP_ID) { return; }
        this.managementPlanService.setTopForManagementPlan();
        this.managementPlanService.isNavigateToTask = true;
        this._router.navigate([CMP_BASE_URL, CMP_ID, CMP_CHILD_ROUTE_URL.TASK]).then(() => {
            setTimeout(() => {
                this.managementPlanService.triggerManagementPlanActions('TRIGGER_SCROLL_TO_TASK', { taskId });
            }, 500);
        });
    }

    async downloadCmpAttachment(attachment: COIAttachment): Promise<void> {
        if (!this.isSaving) {
            this.isSaving = true;
            await this.fetchAllAttachments();
            if (attachment?.attachmentId) {
                await this._headerService.downloadCmpAttachment(attachment);
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'No uploaded attachment found.');
            }
            this.isSaving = false;
        }
    }

    openCmpVersionModal(): void {

    }

}

