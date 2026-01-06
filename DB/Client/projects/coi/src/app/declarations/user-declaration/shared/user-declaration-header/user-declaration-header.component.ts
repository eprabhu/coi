import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { DECLARATION_LOCALIZE } from '../../../../../app/app-locales';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../common/services/common.service';
import { HeaderService } from '../../../../../app/common/header/header.service';
import { UserDeclaration, DeclarationType } from '../../../declaration.interface';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SharedComponentModule } from '../../../../shared-components/shared-component.module';
import { UserDeclarationDataStoreService } from '../../services/user-declaration-data-store.service';
import { DeclarationActionType, UserDeclarationService } from '../../services/user-declaration.service';
import { CommonModalConfig } from './../../../../shared-components/common-modal/common-modal.interface';
import { ModalActionEvent } from '../../../../../app/shared-components/common-modal/common-modal.interface';
import { CoiAssignAdminConfig, DataStoreEvent, 
    DocumentActionStorageEvent, 
    GlobalEventNotifier, PrintModalConfig } from '../../../../common/services/coi-common.interface';
import { arrangeFormValidationList, closeCommonModal,
    hideAutoSaveToast, isEmptyObject, openCommonModal } from '../../../../common/utilities/custom-utilities';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS,
    HTTP_SUCCESS_STATUS, USER_DASHBOARD_CHILD_ROUTE_URLS } from '../../../../../app/app-constants';
import { DeclarationActionRO,
    DeclarationConfirmationModal, DeclarationConfirmationModalType } from '../../../declaration.interface';
import { DECLARATION_ROUTE_URLS, DECLARATION_STATUS_BADGE, COI_DECLARATION_MODULE_CODE,
    DECLARATION_ADMIN_DASHBOARD_URL, MANAGE_MFTRP_DECLARATION_RIGHTS, DECLARATION_REVIEW_STATUS,
    DECLARATION_REVIEW_STATUS_BADGE, DECLARATION_INITIAL_VERSION_NUMBER } from '../../../declaration-constants';

@Component({
    selector: 'app-user-declaration-header',
    templateUrl: './user-declaration-header.component.html',
    styleUrls: ['./user-declaration-header.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        SharedComponentModule
    ]
})
export class UserCertificationHeaderComponent implements OnInit {

    isSaving = false;
    isCardExpanded = true;
    isFormEditable = false;
    isSubmitClicked = false;
    isShowAdminDetails = true;
    deployMap = environment.deployUrl;
    userDeclaration = new UserDeclaration();
    declarationUrls = DECLARATION_ROUTE_URLS;
    printModalConfig = new PrintModalConfig();
    declarationLocalize = DECLARATION_LOCALIZE;
    assignAdminModalConfig = new CoiAssignAdminConfig();
    declarationTypeDetails: DeclarationType | null = null;
    confirmationModal = new DeclarationConfirmationModal();
    declarationStatusBadgeClass = DECLARATION_STATUS_BADGE;
    reviewStatusBadgeClass = DECLARATION_REVIEW_STATUS_BADGE;
    initialVersionNumber = DECLARATION_INITIAL_VERSION_NUMBER;
    actionBtnConfig = {
        isShowReviseBtn: false,
        isShowWithdrawBtn: false,
        isShowReturnBtn: false,
        isShowAssignAdminBtn: false,
        isShowReAssignAdminBtn: false,
        isShowCompleteReviewBtn: false,
        isShowPrintBtn: false,
        isShowVoidBtn: false,
    };
    actionValidationMsg: Partial<Record<DeclarationConfirmationModalType, string>> = {
        WITHDRAW: `Please provide the reason for ${DECLARATION_LOCALIZE.TERM_WITHDRAWAL.toLowerCase()}.`,
        RETURN: `Please provide the reason for return.`,
        COMPLETE_FINAL_REVIEW: `Please provide the reason for approval/rejection.`
    };

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(public router: Router,
        private _commonService: CommonService,
        private _headerService: HeaderService,
        public declarationService: UserDeclarationService,
        private _userDeclarationDataStore: UserDeclarationDataStoreService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const USER_DECLARATION: UserDeclaration = this._userDeclarationDataStore.getData();
        if (isEmptyObject(USER_DECLARATION)) { return; }
        this.userDeclaration = USER_DECLARATION;
        this.declarationTypeDetails = this.userDeclaration?.declaration?.declarationType;
        this.isFormEditable = this._userDeclarationDataStore.isFormEditable();
        this.setActionBtnVisibility();
        if (storeEvent.action === 'REFRESH') {
            this.openModalBasedOnActions();
        }
    }

    private setActionBtnVisibility(): void {
        const { declarationReviewStatusType, personId, versionStatus, adminPersonId } = this.userDeclaration?.declaration || {};
        const { REVIEW_REQUIRED, REVIEW_IN_PROGRESS, PENDING } = DECLARATION_REVIEW_STATUS;
        const HAS_ADMIN_RIGHT = this._commonService.getAvailableRight(MANAGE_MFTRP_DECLARATION_RIGHTS);
        const CAN_MODIFY_DOCUMENT = this._userDeclarationDataStore.getEditModeForDeclaration();
        const REVIEW_STATUS_CODE = declarationReviewStatusType?.reviewStatusCode?.toString();
        const LOGIN_PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        const IS_SUBMITTED = REVIEW_STATUS_CODE === String(REVIEW_REQUIRED);
        const IS_DOCUMENT_OWNER = LOGIN_PERSON_ID === personId;
        const IS_VERSION_ACTIVE = versionStatus === 'ACTIVE';
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL = this._userDeclarationDataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const CAN_MANAGE_DECLARATION = HAS_ADMIN_RIGHT && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL;
        const IS_ADMIN_REVIEWING = [REVIEW_REQUIRED, REVIEW_IN_PROGRESS].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        const IS_DECLARATION_ELIGIBLE = this._commonService.declarationEligibilityMap?.[this.declarationTypeDetails.declarationTypeCode];
        const IS_DECLARATION_VOID = this._userDeclarationDataStore.getDeclarationVoidStatus();
        const IS_REVIEW_PENDING = REVIEW_STATUS_CODE === String(PENDING);
        this.actionBtnConfig.isShowAssignAdminBtn = CAN_MODIFY_DOCUMENT && CAN_MANAGE_DECLARATION && IS_SUBMITTED && !adminPersonId;
        this.actionBtnConfig.isShowReAssignAdminBtn = CAN_MODIFY_DOCUMENT && CAN_MANAGE_DECLARATION && IS_ADMIN_REVIEWING && !!adminPersonId;
        this.actionBtnConfig.isShowCompleteReviewBtn = CAN_MODIFY_DOCUMENT && CAN_MANAGE_DECLARATION && IS_ADMIN_REVIEWING;
        this.actionBtnConfig.isShowReturnBtn = CAN_MODIFY_DOCUMENT && CAN_MANAGE_DECLARATION && IS_ADMIN_REVIEWING;
        this.actionBtnConfig.isShowWithdrawBtn = CAN_MODIFY_DOCUMENT && IS_DOCUMENT_OWNER && IS_SUBMITTED;
        this.actionBtnConfig.isShowReviseBtn = !CAN_MODIFY_DOCUMENT && IS_DOCUMENT_OWNER && IS_VERSION_ACTIVE && IS_DECLARATION_ELIGIBLE && !IS_DECLARATION_VOID;
        this.actionBtnConfig.isShowVoidBtn = CAN_MODIFY_DOCUMENT && IS_DOCUMENT_OWNER && IS_REVIEW_PENDING;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._userDeclarationDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                if (event?.uniqueId === 'TRIGGER_USER_DECLARATION_ACTIONS') {
                    switch (EVENT_DATA?.actionType as DeclarationActionType) {
                        case 'FORM_SUBMIT':
                            this.validateAndSubmit();
                            break;
                        case 'FORM_SAVE_COMPLETE':
                            if (this.isSubmitClicked) {
                                this.isSubmitClicked = false;
                                this.validateForm();
                            }
                            break;
                        default: break;
                    }
                }
                if (event?.uniqueId === 'DOC_ACTION_STORAGE_EVENT') {
                    this.openModalBasedOnActions();
                }
            })
        );
    }

    private validateForm(): void {
        this.$subscriptions.push(
            this._commonService.validateForm(this.getValidFormRO())
                .subscribe((validationList: any) => {
                    this.declarationService.validationList = [...arrangeFormValidationList(validationList)];
                    this._headerService.$globalPersistentEventNotifier.$formValidationList.next(this.declarationService.validationList);
                    if (!validationList?.length && this.isSubmitClicked) {
                        this.openSubmitConfirmationModal();
                    }
                    if (validationList?.length) {
                        this.router.navigate([DECLARATION_ROUTE_URLS.FORM], { queryParams: { declarationId: this.userDeclaration?.declaration?.declarationId } });
                    }
                    this.isSubmitClicked = false;
                }, err => {
                    this.isSubmitClicked = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Error occurred during form validation.`);
                }));
    }

    private getValidFormRO(): any {
        const FORM_BUILDER_ID_LIST: number[] = [];
        FORM_BUILDER_ID_LIST.push(this.declarationService.formBuilderId);
        return {
            formBuilderIds: FORM_BUILDER_ID_LIST,
            moduleItemCode: COI_DECLARATION_MODULE_CODE?.toString(),
            moduleSubItemCode: this.declarationTypeDetails?.declarationTypeCode?.toString(),
            moduleItemKey: this.userDeclaration?.declaration?.declarationId?.toString(),
            moduleSubItemKey: this.userDeclaration?.declaration?.declarationNumber?.toString(),
        };
    }

    private openSubmitConfirmationModal(): void {
        this.confirmationModal = new DeclarationConfirmationModal();
        this.confirmationModal.action = 'SUBMIT';
        this.confirmationModal.modalHeader = 'Submit ' + this.getDeclarationLabel();
        this.confirmationModal.modalBody = `Are you sure want to <strong>submit ${this.getDeclarationLabel()}</strong>?`;
        this.confirmationModal.modalConfig = new CommonModalConfig('decl-submit-confirm-modal', 'Submit', 'Cancel');
        this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `decl-submit-modal-header-${this.declarationTypeDetails?.declarationTypeCode}` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    private performDeclarationActions(action: DeclarationConfirmationModalType): void {
        if (action === 'CANCEL' || this.validateDescription()) {
            switch (action) {
                case 'SUBMIT':
                    this.submitDeclaration();
                    break;
                case 'APPROVE':
                    this.completeAdminReview('APPROVE');
                    break;
                case 'REJECT':
                    this.completeAdminReview('REJECT');
                    break;
                case 'WITHDRAW':
                    this.withDrawDeclaration();
                    break;
                case 'RETURN':
                    this.returnDeclaration();
                    break;
                case 'CANCEL':
                    this.closeConfirmationModal();
                    break;
                case 'MARK_AS_VOID':
                    this.markDeclarationAsVoid();
                    break;
                default: break;
            }
        }
    }

    private submitDeclaration(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.declarationService.submitDeclaration(this.userDeclaration?.declaration?.declarationId, this.declarationTypeDetails?.declarationTypeCode)
                    .subscribe((userDeclaration: UserDeclaration) => {
                        this.isSubmitClicked = false;
                        const SUCCESS_TOAST_MSG = `${this.getDeclarationLabel()} submitted successfully.`;
                        this.handleApiSuccess(userDeclaration, SUCCESS_TOAST_MSG);
                    }, (error) => {
                        this.isSubmitClicked = false;
                        const ERROR_TOAST = `Failed to submit ${this.getDeclarationLabel()}. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST);
                    }));
        }
    }

    private completeAdminReview(reviewType: 'APPROVE' | 'REJECT'): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.declarationService.completeAdminReview(this.getDeclarationActionsRO(reviewType))
                    .subscribe((userDeclaration: UserDeclaration) => {
                        const SUCCESS_TOAST_MSG = `${this.getDeclarationLabel()} ${ reviewType==='APPROVE' ? 'approved' : 'rejected' } successfully.`;
                        this.handleApiSuccess(userDeclaration, SUCCESS_TOAST_MSG);
                    }, (error) => {
                        const ERROR_TOAST = `Failed to a ${ reviewType==='APPROVE' ? 'approve' : 'reject' } ${this.getDeclarationLabel()}. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST);
                    }));
        }
    }

    private withDrawDeclaration(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.declarationService.withdrawDeclaration(this.getDeclarationActionsRO('WITHDRAW'))
                    .subscribe((userDeclaration: UserDeclaration) => {
                        const SUCCESS_TOAST_MSG = `${this.getDeclarationLabel()} ${DECLARATION_LOCALIZE.TERM_WITHDRAWN.toLowerCase()} successfully.`;
                        this.handleApiSuccess(userDeclaration, SUCCESS_TOAST_MSG);
                    }, (error) => {
                        const ERROR_TOAST = `Failed to withdraw ${this.getDeclarationLabel()}. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST);
                    }));
        }
    }

    private returnDeclaration(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.declarationService.returnDeclaration(this.getDeclarationActionsRO('RETURN'))
                    .subscribe((userDeclaration: UserDeclaration) => {
                        const SUCCESS_TOAST_MSG = `${this.getDeclarationLabel()} returned successfully.`;
                        this.handleApiSuccess(userDeclaration, SUCCESS_TOAST_MSG);
                    }, (error) => {
                        const ERROR_TOAST = `Failed to return ${this.getDeclarationLabel()}. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST);
                    }));
        }
    }

    private handleApiSuccess(userDeclaration: UserDeclaration, toastMessage: string): void {
        this.isSaving = false;
        this.closeConfirmationModal();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMessage);
        this._userDeclarationDataStore.updateStore(['declaration'], { declaration: userDeclaration?.declaration });
        this.router.navigate([DECLARATION_ROUTE_URLS.FORM], { queryParams: { declarationId: this.userDeclaration?.declaration?.declarationId } });
    }

    private handleApiFailure(error: any, toastMsg = COMMON_ERROR_TOAST_MSG): void {
        this.isSaving = false;
        if (error?.status === 405) {
            this.closeConfirmationModal();
            this._commonService.concurrentUpdateAction = this.declarationTypeDetails?.declarationType;
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
        }
    }

    private getDeclarationActionsRO(reviewType: DeclarationConfirmationModalType): DeclarationActionRO {
        return {
            declarationId: this.userDeclaration?.declaration?.declarationId,
            isApproval: reviewType === 'APPROVE' ? true : reviewType === 'REJECT' ? false : undefined,
            comment: this.confirmationModal.description
        }
    }

    private closeConfirmationModal(): void {
        closeCommonModal(this.confirmationModal?.modalConfig?.namings?.modalName);
        this.timeOutRef = setTimeout(() => {
            this.confirmationModal = new DeclarationConfirmationModal();
        }, 200);
    }

    /**
     * Checks for form builder changes and triggers save if present.
     * @returns true if save was triggered, false otherwise
    */
    private saveIfFormChanged(): boolean {
        if (this.declarationService.isFormBuilderDataChangePresent && this.declarationService.isAnyAutoSaveFailed) {
            hideAutoSaveToast('ERROR');
            this.declarationService.triggerDeclarationSave();
            return true;
        }
        return false;
    }

    /**
     * Validates and submits the form. If form changes exist, saves first.
     */
    private validateAndSubmit(): void {
        this.isSubmitClicked = true;
        if (this._commonService.autoSaveSavingSpinner !== 'HIDE' || this.saveIfFormChanged()) {
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);
        } else {
            this.validateForm()
        }
    }

    /**
     * Opens action modals based on document actions stored in  sessionStorage.
     */
    private openModalBasedOnActions(): void {
        const DOCUMENT_ACTION: DocumentActionStorageEvent = this._headerService.getDocActionStorageEvent();
        if (DOCUMENT_ACTION?.targetModule === 'DECLARATION') {
            if (this.actionBtnConfig.isShowWithdrawBtn && DOCUMENT_ACTION.action === 'REVISE') {
                if (DOCUMENT_ACTION.isModalRequired) {
                    this.openWithdrawConfirmationModal();
                } else {
                    this.withDrawDeclaration();
                }
            }
            this._headerService.removeDocActionStorageEvent();
        }
    }

    /**
     * 
     * Returns Declarations label based on its current status
     */
    private getDeclarationLabel(): string {
        const DECLARATION_ACTION_TYPE = this._headerService.getCreateOrReviseDeclaration(this.declarationTypeDetails.declarationTypeCode);
        if (DECLARATION_ACTION_TYPE == 'REVISE_DECLARATION') {
            return `${this.declarationTypeDetails?.declarationType} Revision`;
        } else {
            return this.declarationTypeDetails?.declarationType;
        }
    }

    /**
     * Marks a declaration as void
     */
    private markDeclarationAsVoid(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.declarationService.markAsVoid(this.userDeclaration?.declaration?.declarationId)
                    .subscribe((userDeclaration: UserDeclaration) => {
                        const SUCCESS_TOAST_MSG = `${this.getDeclarationLabel()} has been marked as void successfully.`;
                        this.handleApiSuccess(userDeclaration, SUCCESS_TOAST_MSG);
                        this.closeDeclaration();
                    }, (error) => {
                        const ERROR_TOAST = `Failed to mark ${this.getDeclarationLabel()} as void. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST);
                    }));
        }
    }

    openPersonDetailsModal(): void {
        this._commonService.openPersonDetailsModal(this.userDeclaration?.declaration?.person?.personId);
    }

    collapseHeader(): void {
        this.isCardExpanded = !this.isCardExpanded;
        this.declarationService.setTopForDeclaration();
    }

    openHistorySlider(): void {
        this.declarationService.isShowOverallHistory = true;
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.performDeclarationActions(this.confirmationModal.action);
        } else {
            this.closeConfirmationModal();
        }
    }

    reviseDeclaration(): void {
        this._headerService.triggerDeclarationCreation('REVISION', this.declarationTypeDetails);
    }

    closeDeclaration(): void {
        if (this.declarationService.previousRouteUrl.includes(DECLARATION_ADMIN_DASHBOARD_URL)) {
            this.router.navigate([DECLARATION_ADMIN_DASHBOARD_URL]);
        } else {
            this.router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    validateDescription(): boolean {
        this.confirmationModal.mandatoryList.delete('DECLARATION_ACTION_DESCRIPTION');
        if (this.confirmationModal.isDescriptionMandatory && !this.confirmationModal.description?.trim()) {
            this.confirmationModal.mandatoryList.set('DECLARATION_ACTION_DESCRIPTION', this.actionValidationMsg[this.confirmationModal.action]);
        }
        return !this.confirmationModal.mandatoryList.has('DECLARATION_ACTION_DESCRIPTION');
    }

    openAssignAdminModal(): void {
        const { adminGroupId, adminGroupName, adminPersonId, adminPersonName,declarationId, declarationNumber } = this.userDeclaration?.declaration || {};
        this.assignAdminModalConfig.defaultAdminDetails.adminGroupId = adminGroupId;
        this.assignAdminModalConfig.defaultAdminDetails.adminGroupName = adminGroupName;
        this.assignAdminModalConfig.defaultAdminDetails.adminPersonId = adminPersonId;
        this.assignAdminModalConfig.defaultAdminDetails.adminPersonName = adminPersonName;
        this.assignAdminModalConfig.adminGroupId = adminGroupId;
        this.assignAdminModalConfig.adminPersonId = adminPersonId;
        this.assignAdminModalConfig.documentId = declarationId;
        this.assignAdminModalConfig.documentNumber = declarationNumber;
        this.assignAdminModalConfig.isOpenAssignAdminModal = true;
    }

    closeAssignAdministratorModal(userDeclaration: UserDeclaration): void {
        if (userDeclaration?.declaration) {
            this._userDeclarationDataStore.updateStore(['declaration'], { declaration: userDeclaration.declaration });
        }
        setTimeout(() => {
            this.assignAdminModalConfig = new CoiAssignAdminConfig();
        }, 200);
    }

    openWithdrawConfirmationModal(): void {
        this.confirmationModal = new DeclarationConfirmationModal();
        this.confirmationModal.action = 'WITHDRAW';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = `Reason for ${DECLARATION_LOCALIZE.TERM_WITHDRAWAL}`;
        this.confirmationModal.textAreaPlaceholder = `Please provide the reason for ${DECLARATION_LOCALIZE.TERM_WITHDRAWAL.toLowerCase()}.`;
        this.confirmationModal.modalHeader = `${DECLARATION_LOCALIZE.TERM_WITHDRAW} ${this.getDeclarationLabel()}`;
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('decl-withdraw-confirm-modal', DECLARATION_LOCALIZE.TERM_WITHDRAW, 'Cancel', 'lg');
        this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `decl-withdraw-modal-header-${this.declarationTypeDetails?.declarationTypeCode}` };
        this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `decl-withdraw-modal-desc-${this.declarationTypeDetails?.declarationTypeCode}` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openReturnConfirmationModal(): void {
        this.confirmationModal = new DeclarationConfirmationModal();
        this.confirmationModal.action = 'RETURN';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = 'Reason for Return';
        this.confirmationModal.textAreaPlaceholder = 'Please provide the reason for return.';
        this.confirmationModal.modalHeader = 'Return ' + this.getDeclarationLabel();
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('decl-return-confirm-modal', 'Return', 'Cancel', 'lg');
        this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `decl-return-modal-header-${this.declarationTypeDetails?.declarationTypeCode}` };
        this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `decl-return-modal-desc-${this.declarationTypeDetails?.declarationTypeCode}` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openFinalReviewConfirmationModal(): void {
        this.confirmationModal = new DeclarationConfirmationModal();
        this.confirmationModal.action = 'COMPLETE_FINAL_REVIEW';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = 'Reason for Approval/Rejection';
        this.confirmationModal.textAreaPlaceholder = 'Please provide the reason for approval/rejection.';
        this.confirmationModal.modalHeader = this.getDeclarationLabel() + ' - Final Review Decision';
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('decl-final-confirm-modal', '', '', 'lg');
        this.confirmationModal.additionalFooterBtns = [
            { action: 'CANCEL', event: { buttonName: 'Cancel', btnClass: 'btn-outline-secondary'} },
            { action: 'APPROVE', event: { buttonName: 'Approve', btnClass: 'btn-primary'} },
            { action: 'REJECT', event: { buttonName: 'Reject', btnClass: 'btn-danger'} }
        ];
        this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `decl-final-modal-header-${this.declarationTypeDetails?.declarationTypeCode}` };
        this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `decl-final-modal-desc-${this.declarationTypeDetails?.declarationTypeCode}` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openPrintDisclosureModal(): void {
        const { declarationId,  declarationNumber, versionNumber, createUserFullName } = this.userDeclaration?.declaration || {};
        const DECLARATION_TYPE = this.declarationTypeDetails?.declarationType;
        const DISCLOSURE_NAME = DECLARATION_TYPE + (versionNumber === DECLARATION_INITIAL_VERSION_NUMBER ? ' - Initial' : ' - Revision');
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = declarationId;
        this.printModalConfig.moduleItemCode = COI_DECLARATION_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = declarationNumber;
        this.printModalConfig.moduleSubItemCode = this.declarationTypeDetails?.declarationTypeCode;
        this.printModalConfig.modalConfig.namings.modalName = 'decl-print-modal';
        this.printModalConfig.modalHeaderText = 'Print ' + DISCLOSURE_NAME;
        this.printModalConfig.helpTextConfig = { subSectionId: '281', elementId: `decl-print-modal-header-${this.declarationTypeDetails?.declarationTypeCode}` };
        this.printModalConfig.templateLabel = 'Choose a template to print ' + DISCLOSURE_NAME;
        this.printModalConfig.fileName = DISCLOSURE_NAME + declarationId + '-' + createUserFullName;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }

    openVoidDisclosureModal(): void {
        const DECLARATION_LABEL = this.getDeclarationLabel();
        this.confirmationModal = new DeclarationConfirmationModal();
        this.confirmationModal.action = 'MARK_AS_VOID';
        this.confirmationModal.modalHeader = 'Mark ' + DECLARATION_LABEL + ' as Void';
        this.confirmationModal.modalBody = `Are you sure you want to mark this ${DECLARATION_LABEL} as <strong>void</strong>? The declaration will be removed from your declaration list.`;
        this.confirmationModal.modalConfig = new CommonModalConfig('decl-void-confirm-modal', 'Mark as Void', 'Cancel');
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

}
