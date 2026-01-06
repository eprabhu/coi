import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ConsultingFormDataStoreService } from './services/consulting-data-store.service';
import { CommonService } from '../common/services/common.service';
import { ConsultingFormActionType, ConsultingService } from './services/consulting.service';
import {
    ADMIN_DASHBOARD_URL, COMMON_ERROR_TOAST_MSG, CONSULTING_DISCLOSURE_MANAGE_RIGHTS,
    CONSULTING_DISPOSITION_STATUS_BADGE, CONSULTING_FORM_CHILD_ROUTE_URL, CONSULTING_MODULE_CODE,
    CONSULTING_REVIEW_STATUS, CONSULTING_REVIEW_STATUS_BADGE, CONSULTING_SUB_MODULE_CODE,
    HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, REPORTER_HOME_URL, USER_DASHBOARD_CHILD_ROUTE_URLS
} from '../app-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { DefaultAssignAdminDetails } from '../shared-components/shared-interface';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { NavigationService } from "../common/services/navigation.service";
import { ConsultingFormStoreData, ConsultingFormConfirmationModal, ConsultingFormConfirmModalType, ConsultingForm } from './consulting-form.interface';
import { arrangeFormValidationList, closeCommonModal, hideAutoSaveToast, openCommonModal } from '../common/utilities/custom-utilities';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { COMMON_DISCL_LOCALIZE } from '../app-locales';
import { AutoSaveEvent, AutoSaveService } from '../common/services/auto-save.service';
import { CoiAssignAdminConfig, DataStoreEvent, GlobalEventNotifier, PrintModalConfig } from '../common/services/coi-common.interface';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { DocumentActionStorageEvent } from '../common/services/coi-common.interface';
import { HeaderService } from '../common/header/header.service';

@Component({
    selector: 'app-consulting-form',
    templateUrl: './consulting-form.component.html',
    styleUrls: ['./consulting-form.component.scss']
})
export class ConsultingFormComponent implements OnInit, OnDestroy {

    consultingData = new ConsultingFormStoreData();
    showSlider = false;
    selectedType: string;
    isCardExpanded = true;
    isUserCollapse = false;
    isHomeClicked = false;
    isSubmitClicked = false;
    defaultAdminDetails = new DefaultAssignAdminDetails();
    isSaving = false;
    isFormEditable = false;
    consultingDispositionStatusBadge = CONSULTING_DISPOSITION_STATUS_BADGE;
    consultingReviewStatusBadge = CONSULTING_REVIEW_STATUS_BADGE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    validationPath = CONSULTING_FORM_CHILD_ROUTE_URL.FORM;
    printModalConfig = new PrintModalConfig();
    assignAdminModalConfig = new CoiAssignAdminConfig();
    confirmationModal = new ConsultingFormConfirmationModal();
    actionBtnConfig = {
        isShowReviseBtn: false,
        isShowWithdrawBtn: false,
        isShowReturnBtn: false,
        isShowAssignAdminBtn: false,
        isShowReAssignAdminBtn: false,
        isShowCompleteReviewBtn: false,
        isShowPrintBtn: false,
    };
    actionValidationMsg: Partial<Record<ConsultingFormConfirmModalType, string>> = {
        WITHDRAW: `Please provide the reason for ${COMMON_DISCL_LOCALIZE.TERM_WITHDRAWAL.toLowerCase()}.`,
        RETURN: `Please provide the reason for return.`,
        COMPLETE_FINAL_REVIEW: `Please provide the reason for approval/rejection.`
    };

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        if (!this.isUserCollapse) {
            this.isCardExpanded = window.innerWidth > 1399;
        }
        this.consultingService.setTopDynamically();
    }

    constructor(private _consultingFormDataStore: ConsultingFormDataStoreService, public commonService: CommonService,
        public location: Location, private _navigationService: NavigationService,
        public consultingService: ConsultingService, private _router: Router,
        private _activatedRoute: ActivatedRoute, public autoSaveService: AutoSaveService, private _headerService: HeaderService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        this.consultingService.setTopDynamically();
        this.listenQueryParamsChanges();
        this.listenGlobalEventNotifier();
        this.autoSaveService.initiateAutoSave();
        this.autoSaveSubscribe();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
        this.consultingService.clearConsultingServiceData();
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(
            this.autoSaveService.autoSaveTrigger$
                .subscribe((event: AutoSaveEvent) => {
                    this.consultingService.formBuilderEvents.next({ eventType: 'SAVE' });
                }));
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                if (event?.uniqueId === 'TRIGGER_CONSULTING_FORM_ACTIONS') {
                    switch (EVENT_DATA?.actionType as ConsultingFormActionType) {
                        case 'FORM_SUBMIT':
                            this.validateAndSubmit();
                            break;
                        case 'FORM_SAVE_COMPLETE':
                            if (this.isSubmitClicked) {
                                this.isSubmitClicked = false;
                                this.validateForm();
                            }
                            this.consultingService.isFormBuilderDataChangePresent = false;
                            this.commonService.setChangesAvailable(false);
                            const UPDATE_TIME_STAMP = Array.isArray(EVENT_DATA.result) ? EVENT_DATA.result[0]?.updateTimestamp : EVENT_DATA.updateTimestamp;
                            this.updateLastSavedTime(UPDATE_TIME_STAMP);
                            if (this.consultingService.isAnyAutoSaveFailed) {
                                this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
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

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            const MODULE_ID = params['disclosureId'];
            if (this.consultingData?.consultingForm?.disclosureId != MODULE_ID) {
                this.consultingService.clearConsultingServiceData();
                this.loadNewFormAndUpdateStore(MODULE_ID);
            }
        }));
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._consultingFormDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        this.consultingData = this._consultingFormDataStore.getData();
        this.isFormEditable = this._consultingFormDataStore.isFormEditable();
        this.setActionBtnVisibility();
        if (storeEvent.action === 'REFRESH') {
            this.openModalBasedOnActions();
            this.consultingService.consultingEntity = this.consultingData?.consultingForm?.entity;
            if (!this._router.url.includes(CONSULTING_FORM_CHILD_ROUTE_URL.FORM)) {
                this.getApplicableForms();
            }
        }
    }

    private setActionBtnVisibility(): void {
        const { reviewStatusCode, personId, adminPersonId } = this.consultingData?.consultingForm || {};
        const { SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED, ROUTING_IN_PROGRESS } = CONSULTING_REVIEW_STATUS;
        const HAS_ADMIN_RIGHT = this.commonService.getAvailableRight(CONSULTING_DISCLOSURE_MANAGE_RIGHTS);
        const CAN_MODIFY_DOCUMENT = this._consultingFormDataStore.getEditModeForConsulting();
        const REVIEW_STATUS_CODE = reviewStatusCode?.toString();
        const LOGIN_PERSON_ID = this.commonService.getCurrentUserDetail('personID');
        const IS_DOCUMENT_OWNER = LOGIN_PERSON_ID === personId;
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DOC = this._consultingFormDataStore.getIsAdminOrCanManageAffiliatedDoc();
        const HAS_DOCUMENT_MANAGE_RIGHTS = HAS_ADMIN_RIGHT && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DOC;
        const IS_ADMIN_REVIEWING = [REVIEW_ASSIGNED, REVIEW_IN_PROGRESS, ASSIGNED_REVIEW_COMPLETED].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        const CAN_ASSIGN_ADMIN = [SUBMITTED, REVIEW_ASSIGNED, REVIEW_IN_PROGRESS, ASSIGNED_REVIEW_COMPLETED].map(status => status.toString()).includes(REVIEW_STATUS_CODE);;
        this.actionBtnConfig.isShowAssignAdminBtn = CAN_MODIFY_DOCUMENT && HAS_DOCUMENT_MANAGE_RIGHTS && CAN_ASSIGN_ADMIN && !adminPersonId;
        this.actionBtnConfig.isShowReAssignAdminBtn = CAN_MODIFY_DOCUMENT && HAS_DOCUMENT_MANAGE_RIGHTS && CAN_ASSIGN_ADMIN && !!adminPersonId;
        this.actionBtnConfig.isShowCompleteReviewBtn = CAN_MODIFY_DOCUMENT && HAS_DOCUMENT_MANAGE_RIGHTS && IS_ADMIN_REVIEWING;
        this.actionBtnConfig.isShowReturnBtn = CAN_MODIFY_DOCUMENT && HAS_DOCUMENT_MANAGE_RIGHTS && IS_ADMIN_REVIEWING;
        this.actionBtnConfig.isShowWithdrawBtn = CAN_MODIFY_DOCUMENT && IS_DOCUMENT_OWNER && [SUBMITTED, ROUTING_IN_PROGRESS].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
    }

    private updateLastSavedTime(updateTimestamp: number): void {
        const CONSULTING_FORM: ConsultingFormStoreData = this._consultingFormDataStore.getData();
        CONSULTING_FORM.consultingForm.updateTimeStamp = updateTimestamp;
        this.autoSaveService.updatedLastSaveTime(updateTimestamp, true);
        this._consultingFormDataStore.updateStore(['declaration'], { consultingForm: CONSULTING_FORM.consultingForm });
    }

    private loadNewFormAndUpdateStore(MODULE_ID: number): void {
        this.$subscriptions.push(
            this.consultingService.loadConsultingFormHeader(MODULE_ID)
                .subscribe({
                    next: (data: ConsultingForm) => {
                        this._consultingFormDataStore.updateStore(['consultingForm'], { 'consultingForm': data });
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
    }

    private getApplicableForms(): void {
        this.$subscriptions.push(
            this.consultingService.getApplicableForms(this.consultingData?.consultingForm)
                .subscribe({
                    next: (data: any) => {
                        const FORM_LIST = data || [];
                        this.consultingService.setFormStatus(FORM_LIST);
                        setTimeout(() => {
                            this.consultingService.setFormBuilderId(FORM_LIST[0], this._consultingFormDataStore.isFormEditable());
                        });
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
    }

    private getValidFormRO(): any {
        const FORM_BUILDER_ID_LIST: number[] = [];
        FORM_BUILDER_ID_LIST.push(this.consultingService.formBuilderId);
        return {
            formBuilderIds: FORM_BUILDER_ID_LIST,
            moduleItemCode: CONSULTING_MODULE_CODE.toString(),
            moduleSubItemCode: CONSULTING_SUB_MODULE_CODE.toString(),
            moduleItemKey: this.consultingData?.consultingForm?.disclosureId?.toString(),
            moduleSubItemKey: '0',
        };
    }

    private validateForm(): void {
        this.consultingService.setCustomValidationList();
        this.$subscriptions.push(
            this.commonService.validateForm(this.getValidFormRO())
                .subscribe((validationList: any) => {
                    const VALIDATION_LIST = [...this.consultingService.customValidationList, ...validationList];
                    const FORMATTED_VALIDATION_LIST = [...arrangeFormValidationList(VALIDATION_LIST)];
                    this.consultingService.updateFormValidationList(FORMATTED_VALIDATION_LIST);
                    if (!FORMATTED_VALIDATION_LIST?.length && this.isSubmitClicked) {
                        this.openSubmitConfirmationModal();
                    }
                    if (FORMATTED_VALIDATION_LIST?.length) {
                        setTimeout(() => {
                            this._router.navigate([CONSULTING_FORM_CHILD_ROUTE_URL.FORM], { queryParams: { disclosureId: this.consultingData?.consultingForm?.disclosureId } });
                        });
                    }
                    this.isSubmitClicked = false;
                }, err => {
                    this.isSubmitClicked = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error occurred during form validation.`);
                }));
    }

    private openSubmitConfirmationModal(): void {
        this.confirmationModal = new ConsultingFormConfirmationModal();
        this.confirmationModal.action = 'SUBMIT';
        this.confirmationModal.modalHeader = `Submit ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting Form`;
        this.confirmationModal.modalBody = `Are you sure want to <strong>submit ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting Form</strong>?`;
        this.confirmationModal.modalConfig = new CommonModalConfig('consulting-submit-confirm-modal', 'Submit', 'Cancel');
        // this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `consulting-submit-modal-header` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    private closeConfirmationModal(): void {
        closeCommonModal(this.confirmationModal?.modalConfig?.namings?.modalName);
        this.timeOutRef = setTimeout(() => {
            this.confirmationModal = new ConsultingFormConfirmationModal();
        }, 200);
    }

    /**
     * Validates and submits the form. If form changes exist, saves first.
     */
    private validateAndSubmit(): void {
        this.isSubmitClicked = true;
        if (this.commonService.autoSaveSavingSpinner !== 'HIDE' || this.saveIfFormChanged()) {
            this.commonService.appLoaderContent = 'Saving...';
            this.commonService.isShowLoader.next(true);
        } else {
            this.validateForm();
        }
    }

    /**
     * Checks for form builder changes and triggers save if present.
     * @returns true if save was triggered, false otherwise
    */
    private saveIfFormChanged(): boolean {
        if (this.consultingService.isFormBuilderDataChangePresent && this.consultingService.isAnyAutoSaveFailed) {
            hideAutoSaveToast('ERROR');
            this.consultingService.triggerConsultingFormSave();
            return true;
        }
        return false;
    }

    private getWithdrawReturnRO(): any {
        return {
            disclosureId: this.consultingData?.consultingForm?.disclosureId,
            comment: this.confirmationModal.description
        }
    }

    private performConsultingActions(action: ConsultingFormConfirmModalType): void {
        if (action === 'CANCEL' || this.validateDescription()) {
            switch (action) {
                case 'SUBMIT':
                    this.submitConsultingForm();
                    break;
                case 'WITHDRAW':
                    this.withdrawConsultingForm();
                    break;
                case 'RETURN':
                    this.returnConsultingForm();
                    break;
                case 'APPROVE':
                    this.completeFinalReview();
                    break;
                case 'REJECT':
                    this.completeFinalReview();
                    break;
                case 'CANCEL':
                    this.closeConfirmationModal();
                    break;
                default: break;
            }
        }
    }

    private submitConsultingForm(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.consultingService.submitConsulting(this.consultingData?.consultingForm?.disclosureId)
                    .subscribe((consultingFormDetails: ConsultingForm) => {
                        this.isSubmitClicked = false;
                        const SUCCESS_TOAST_MSG = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form submitted successfully.`;
                        this.handleApiSuccess(consultingFormDetails, SUCCESS_TOAST_MSG);
                    }, (error: any) => {
                        this.isSubmitClicked = false;
                        const ERROR_TOAST_MSG = `Failed to submit ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST_MSG);
                    }));
        }
    }

    private withdrawConsultingForm(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.consultingService.withdrawConsulting(this.getWithdrawReturnRO())
                    .subscribe((consultingFormDetails: ConsultingForm) => {
                        const SUCCESS_TOAST_MSG = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form ${COMMON_DISCL_LOCALIZE.TERM_WITHDRAWN.toLowerCase()} successfully.`;
                        this.handleApiSuccess(consultingFormDetails, SUCCESS_TOAST_MSG);
                    }, (error: any) => {
                        const ERROR_TOAST_MSG = `Failed to withdraw ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST_MSG);
                    }));
        }
    }

    private returnConsultingForm(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.consultingService.returnConsulting(this.getWithdrawReturnRO())
                    .subscribe((consultingFormDetails: ConsultingForm) => {
                        const SUCCESS_TOAST_MSG = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form returned successfully.`;
                        this.handleApiSuccess(consultingFormDetails, SUCCESS_TOAST_MSG);
                    }, (error: any) => {
                        const ERROR_TOAST_MSG = `Failed to return ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST_MSG);
                    }));
        }
    }

    private completeFinalReview(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.consultingService.completeFinalReview(this.consultingData?.consultingForm?.disclosureId)
                    .subscribe((consultingFormDetails: ConsultingForm) => {
                        const SUCCESS_TOAST_MSG = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form final review has been completed successfully.`;
                        this.handleApiSuccess(consultingFormDetails, SUCCESS_TOAST_MSG);
                    }, (error: any) => {
                        const ERROR_TOAST_MSG = `Failed to complete the final review of ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form. Please try again.`;
                        this.handleApiFailure(error, ERROR_TOAST_MSG);
                    }));
        }
    }

    private handleApiSuccess(consultingFormDetails: ConsultingForm, toastMessage: string): void {
        this.closeConfirmationModal();
        this.isSaving = false;
        this._consultingFormDataStore.updateStore(['consultingForm'], { consultingForm: consultingFormDetails });
        this.commonService.showToast(HTTP_SUCCESS_STATUS, toastMessage);
        this._router.navigate([CONSULTING_FORM_CHILD_ROUTE_URL.FORM], { queryParams: { disclosureId: this.consultingData?.consultingForm?.disclosureId } });
    }

    private handleApiFailure(error: any, toastMsg = COMMON_ERROR_TOAST_MSG): void {
        this.isSaving = false;
        if (error?.status === 405) {
            this.closeConfirmationModal();
            this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form`;
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
        }
    }
    
    /**
     * Opens action modals based on document actions stored in  sessionStorage.
     */
    private openModalBasedOnActions(): void {
        const DOCUMENT_ACTION: DocumentActionStorageEvent = this._headerService.getDocActionStorageEvent();
        if (DOCUMENT_ACTION?.targetModule === 'CONSULTING_FORM') {
            if (this.actionBtnConfig.isShowWithdrawBtn && DOCUMENT_ACTION.action === 'REVISE' ) {
                if (DOCUMENT_ACTION.isModalRequired) {
                    this.openWithdrawConfirmationModal();
                } else {
                    this.withdrawConsultingForm();
                }
            }
            this._headerService.removeDocActionStorageEvent();
        }
    }

    openSlider(type: string, count: number): void {
        if (count) {
            this.showSlider = true;
            this.selectedType = type;
        }
    }

    closeHeaderSlider(event: any): void {
        if (event?.concurrentUpdateAction) {
            this.commonService.concurrentUpdateAction = event.concurrentUpdateAction;
        } else {
            this.showSlider = false;
            this.selectedType = '';
        }
    }

    goToHomeUrl(): void {
        this.isHomeClicked = true;
        const RE_ROUTE_URL = this.consultingService.previousHomeUrl || REPORTER_HOME_URL;
        this._router.navigate([RE_ROUTE_URL]);
    }

    triggerSave(): void {
        this.isSubmitClicked = false;
        this.consultingService.formBuilderEvents.next({ eventType: 'SAVE' });
    }

    triggerSubmit(): void {
        this.consultingService.triggerConsultingFormActions('FORM_SUBMIT');
    }

    openWithdrawConfirmationModal(): void {
        this.confirmationModal = new ConsultingFormConfirmationModal();
        this.confirmationModal.action = 'WITHDRAW';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = `Reason for ${COMMON_DISCL_LOCALIZE.TERM_WITHDRAWAL}`;
        this.confirmationModal.textAreaPlaceholder = `Please provide the reason for ${COMMON_DISCL_LOCALIZE.TERM_WITHDRAWAL.toLowerCase()}.`;
        this.confirmationModal.modalHeader = `${COMMON_DISCL_LOCALIZE.TERM_WITHDRAW} ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting Form`;
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('consulting-withdraw-confirm-modal', COMMON_DISCL_LOCALIZE.TERM_WITHDRAW, 'Cancel', 'lg');
        // this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `consulting-withdraw-modal-header` };
        // this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `consulting-withdraw-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openReturnConfirmationModal(): void {
        this.confirmationModal = new ConsultingFormConfirmationModal();
        this.confirmationModal.action = 'RETURN';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = 'Reason for Return';
        this.confirmationModal.textAreaPlaceholder = 'Please provide the reason for return.';
        this.confirmationModal.modalHeader = `Return ${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting Form`;
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('consulting-return-confirm-modal', 'Return', 'Cancel', 'lg');
        // this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `consulting-return-modal-header` };
        // this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `consulting-return-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openFinalReviewConfirmationModal(): void {
        this.confirmationModal = new ConsultingFormConfirmationModal();
        this.confirmationModal.action = 'COMPLETE_FINAL_REVIEW';
        this.confirmationModal.description = '';
        this.confirmationModal.isShowDescription = true;
        this.confirmationModal.isDescriptionMandatory = true;
        this.confirmationModal.descriptionLabel = 'Reason for Approval/Rejection';
        this.confirmationModal.textAreaPlaceholder = 'Please provide the reason for approval/rejection.';
        this.confirmationModal.modalHeader = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting Form - Final Review Decision`;
        this.confirmationModal.modalBody = '';
        this.confirmationModal.modalConfig = new CommonModalConfig('consulting-final-confirm-modal', '', '', 'lg');
        this.confirmationModal.additionalFooterBtns = [
            { action: 'CANCEL', event: { buttonName: 'Cancel', btnClass: 'btn-outline-secondary' } },
            { action: 'APPROVE', event: { buttonName: 'Approve', btnClass: 'btn-primary' } },
            { action: 'REJECT', event: { buttonName: 'Reject', btnClass: 'btn-danger' } }
        ];
        // this.confirmationModal.modalHelpTextConfig = { subSectionId: '281', elementId: `consulting-final-modal-header` };
        // this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '281', elementId: `consulting-final-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openAssignAdminModal(): void {
        const { adminGroupId, adminGroupName, adminPersonId, adminPersonName, disclosureId } = this.consultingData?.consultingForm || {};
        this.assignAdminModalConfig.defaultAdminDetails.adminGroupId = adminGroupId;
        this.assignAdminModalConfig.defaultAdminDetails.adminGroupName = adminGroupName;
        this.assignAdminModalConfig.defaultAdminDetails.adminPersonId = adminPersonId;
        this.assignAdminModalConfig.defaultAdminDetails.adminPersonName = adminPersonName;
        this.assignAdminModalConfig.adminGroupId = adminGroupId;
        this.assignAdminModalConfig.adminPersonId = adminPersonId;
        this.assignAdminModalConfig.documentId = disclosureId;
        this.assignAdminModalConfig.documentNumber = null;
        this.assignAdminModalConfig.isOpenAssignAdminModal = true;
    }

    closeAssignAdministratorModal(consultingForm: ConsultingForm): void {
        if (consultingForm) {
            this._consultingFormDataStore.updateStore(['consultingForm'], { consultingForm });
        }
        setTimeout(() => {
            this.assignAdminModalConfig = new CoiAssignAdminConfig();
        }, 200);
    }

    leavePageClicked(): void {
        this.consultingService.isFormBuilderDataChangePresent = false;
        if (this.isHomeClicked) {
            this.goToHomeUrl();
        } else {
            this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
        }
    }

    viewEntityDetails(): void {
        this.commonService.openEntityDetailsModal(this.consultingService.consultingEntity?.entityId);
    }

    routeToUserOrAdminDashboard(): void {
        if (this.consultingService.previousConsultingRouteUrl.includes(ADMIN_DASHBOARD_URL)) {
            this._router.navigate([ADMIN_DASHBOARD_URL]);
        } else {
            this._router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    openPersonDetailsModal(): void {
        this.commonService.openPersonDetailsModal(this.consultingData?.consultingForm?.person?.personId)
    }

    collapseHeader(): void {
        this.isCardExpanded = !this.isCardExpanded;
        this.isUserCollapse = !this.isUserCollapse;
        this.consultingService.setTopDynamically();
        this.consultingService.setTopForConsulting();
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.performConsultingActions(this.confirmationModal.action);
        } else {
            this.closeConfirmationModal();
        }
    }

    validateDescription(): boolean {
        this.confirmationModal.mandatoryList.delete('CONSULTING_FORM_ACTION_DESCRIPTION');
        if (this.confirmationModal.isDescriptionMandatory && !this.confirmationModal.description?.trim()) {
            this.confirmationModal.mandatoryList.set('CONSULTING_FORM_ACTION_DESCRIPTION', this.actionValidationMsg[this.confirmationModal.action]);
        }
        return !this.confirmationModal.mandatoryList.has('CONSULTING_FORM_ACTION_DESCRIPTION');
    }

    openPrintDisclosureModal(): void {
        const { disclosureId, createUserFullName } = this.consultingData?.consultingForm || {};
        const DISCLOSURE_NAME = `${COMMON_DISCL_LOCALIZE.CONSULTING_BADGE_PREFIX}Consulting form`;
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = disclosureId;
        this.printModalConfig.moduleItemCode = CONSULTING_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = null;
        this.printModalConfig.moduleSubItemCode = CONSULTING_SUB_MODULE_CODE;
        this.printModalConfig.modalConfig.namings.modalName = 'consulting-print-modal';
        this.printModalConfig.modalHeaderText = 'Print ' + DISCLOSURE_NAME;
        // this.printModalConfig.helpTextConfig = { subSectionId: '281', elementId: `consulting-print-modal-header` };
        this.printModalConfig.templateLabel = 'Choose a template to print ' + DISCLOSURE_NAME;
        this.printModalConfig.fileName = DISCLOSURE_NAME + disclosureId + '-' + createUserFullName;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }
    
}
