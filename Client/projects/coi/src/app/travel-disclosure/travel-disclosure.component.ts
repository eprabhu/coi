import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelDisclosureService } from './services/travel-disclosure.service';
import { CommonService } from '../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { environment } from '../../environments/environment';
import { TravelDataStoreService } from './services/travel-data-store.service';
import {
    CoiTravelDisclosure, TravelCreateModalDetails,
    TravelActionAfterSubmitRO, TravelDisclosure, ModalSize,
    TabType,
    CreateDisclosureModalDetails,
    DisclosureValidatedDetails
} from './travel-disclosure.interface';
import {
    REPORTER_HOME_URL, HTTP_ERROR_STATUS, ADMIN_DASHBOARD_URL, HTTP_SUCCESS_STATUS,
    CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
    TRAVEL_DISCLOSURE_FORM_ROUTE_URL,
    TRAVEL_DISCLOSURE_MANAGE_RIGHTS,
    ENGAGEMENT_ROUTE_URL,
    DISCLOSURE_REVIEW_STATUS,
    CREATE_DISCLOSURE_ROUTE_URL,
    POST_CREATE_DISCLOSURE_ROUTE_URL,
    DISCLOSURE_TYPE,
    COMMON_ERROR_TOAST_MSG,
    TRAVEL_MODULE_CODE,
    TRAVEL_SUB_MODULE_CODE,
    TRAVEL_FORM_UNSAVED_WARNING_MESSAGE,
    USER_DASHBOARD_CHILD_ROUTE_URLS,
    SECTION_DETAILS_OF_CONFIGURED_INFO_TEXT,
    TRAVEL_DISCLOSURE_RIGHTS
} from '../app-constants';
import { NavigationService } from '../common/services/navigation.service';
import { DefaultAssignAdminDetails, FCOIDisclosureCreateRO, PersonProjectOrEntity } from '../shared-components/shared-interface';
import { arrangeFormValidationList, closeCommonModal, openCommonModal, sanitizeHtml } from '../common/utilities/custom-utilities';
import { heightAnimation } from '../common/utilities/animations';
import { COIValidationModalConfig, DisclosureCommentsCountRO, DisclosureCommentsCounts, DocumentActionStorageEvent, GlobalEventNotifier, PrintModalConfig } from '../common/services/coi-common.interface';
import { EntityDetails } from '../entity-management-module/shared/entity-interface';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { CREATE_OR_REVISE_FCOI_MODAL, TRAVEL_DISCL_REVIEW_STATUS_TYPE, TRAVEL_DISCLOSURE_PATHS, TRAVEL_ENGAGEMENT_VALIDATION_MODAL } from './travel-disclosure-constants';
import { FetchReviewCommentRO } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../shared-components/coi-review-comments/coi-review-comments-constants';
import { CoiStepsNavActionType, CoiStepsNavConfig } from '../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { HeaderService } from '../common/header/header.service';
import { DomSanitizer } from '@angular/platform-browser';
import { COMMON_DISCL_LOCALIZE } from '../app-locales';
import { AutoSaveEvent, AutoSaveService } from '../common/services/auto-save.service';
import { ValidationConfig } from '../configuration/form-builder-create/shared/form-validator/form-validator.interface';
import { REVIEWER_ADMIN_DASHBOARD_BASE_URL, REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS } from '../reviewer-dashboard/reviewer-dashboard-constants';

type Method = 'SOME' | 'EVERY';

@Component({
    selector: 'app-travel-disclosure',
    templateUrl: './travel-disclosure.component.html',
    styleUrls: ['./travel-disclosure.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})

export class TravelDisclosureComponent implements OnInit, OnDestroy {

    modalSize: ModalSize;
    deployMap = environment.deployUrl;
    $subscriptions: Subscription[] = [];
    travelDisclosure = new TravelDisclosure();
    TRAVEL_DISCLOSURE_REVIEW_STATUS = TRAVEL_DISCL_REVIEW_STATUS_TYPE;
    personEntityDetails = new PersonProjectOrEntity();
    defaultAdminDetails = new DefaultAssignAdminDetails();
    newTravelDisclosureCreateObject = new TravelCreateModalDetails();

    isCreateMode = true;
    isMandatory = false;
    isCardExpanded = true;
    isShowPersonSlider = false;
    isShowOverAllHistory = false;
    isAddAssignModalOpen = false;
    needDescriptionField = false;
    isShowMoreActionBtn = false;
    isShowAssignAdminBtn = false;
    isShowReAssignAdminBtn = false;
    isShowWithdrawBtn = false;
    isShowDisclosurePrintBtn = false;
    isShowPersonEntityDetails = false;
    isShowReturnBtn = false;
    isShowApproveBtn = false;

    reasonHelpText = '';
    modalHeaderTitle = '';
    textAreaLabelName = '';
    modalActionBtnName = '';
    descriptionErrorMsg = '';
    selectedPersonSliderType = '';
    confirmationModalHelpText = '';
    confirmationModalDescription = '';
    returnErrorMsg = 'Please provide the reason for returning the disclosure.';
    withdrawErrorMsg = 'Please provide the reason for Recalling the disclosure.';
    userDetails = {
        fullName: '',
        personId: '',
        homeUnit: null,
        homeUnitName: null,
        emailAddress: '',
        primaryTitle: ''
    };
    validationList: any = [];
    validationPath = TRAVEL_DISCLOSURE_FORM_ROUTE_URL;
    isExternal = false;
    isCreateTravelEngagement = false;
    engagementValidationModalConfig = new CommonModalConfig(TRAVEL_ENGAGEMENT_VALIDATION_MODAL, '', 'Close');
    fcoiModalConfig = new CommonModalConfig(CREATE_OR_REVISE_FCOI_MODAL, '', 'Cancel', 'lg');
    disclosureModalDetails = new CreateDisclosureModalDetails();
    disclosureMandatoryList = new Map();
    disclosureDescription = '';
    travelDisclosurePaths = TRAVEL_DISCLOSURE_PATHS;
    lastScrollTop = 0;
    scrollTop = 0;
    isManuallyExpanded = false;
    isScrolled = false;
    isShowCompleteDisclHistory = false;
    isDisclosureOwner = false;
    travelDisclCommentsCountRO = new DisclosureCommentsCountRO();
    isShowCommentButton = false;
    formList = [];
    formId: number | string;
    isShowCreateEngSlider = false;
    printModalConfig = new PrintModalConfig();
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    certificationSectionDetails = SECTION_DETAILS_OF_CONFIGURED_INFO_TEXT.TRAVEL_DISCLOSURE_CERTIFICATION;

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: Event) {
        if (!this.isCreateMode) {
            this.scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (!this.isManuallyExpanded && !this.isScrolled) {
                if (this.scrollTop === 0 && !this.isCardExpanded) {
                    this.isCardExpanded = true;
                } else if (this.scrollTop > this.lastScrollTop && this.isCardExpanded) {
                    this.isScrolled = true;
                    this.isCardExpanded = false;
                }
            }
            this.lastScrollTop = this.scrollTop <= 0 ? 0 : this.scrollTop;
            this.emitDisclosureHeaderResize(false);
            setTimeout(() => {
                this.isScrolled = false;
            }, 50);
        }
        this.travel_service.setTopForTravelDisclosure();
    }
    constructor(
        public router: Router,
        private _route: ActivatedRoute,
        public commonService: CommonService,
        public travel_service: TravelDisclosureService,
        private _dataStore: TravelDataStoreService,
        private _navigationService: NavigationService,
        private _informationAndHelpTextService: InformationAndHelpTextService,
        private _headerService: HeaderService,
        private sanitizer: DomSanitizer,
        public autoSaveService: AutoSaveService) {
    }

    ngOnInit(): void {
        this.autoSaveService.initiateAutoSave();
        this.getDataFromStore();
        this.getCommentsCounts();
        this.listenDataChangeFromStore();
        this.listenQueryParamsChanges();
        this.listenGlobalEventNotifier();
        this.listenTravelSaveComplete();
        this.checkExternalFundingType();
        this.isCreateMode = this._dataStore.getEditModeForDisclosure();
        this.isCardExpanded = !this.isCreateMode;
        this.isCreateTravelEngagement = [CREATE_TRAVEL_DISCLOSURE_ROUTE_URL].some(item => this.router.url.includes(item));
        this.engagementValidationModalConfig.styleOptions.closeBtnClass = 'invisible';
        this.getApplicableForms();
        this.updateStepsNavBtnConfig();
        this.getTravelCertificationText(this.certificationSectionDetails.SUB_SECTION_ID, this.certificationSectionDetails.ELEMENT_ID);
        this.autoSaveSubscribe();
        this.openModalBasedOnActions();
    }

    ngOnDestroy(): void {
        this.clearAllDetails();
        this.autoSaveService.stopAutoSaveEvent();
        this.travel_service.validationConfig = new ValidationConfig();
    }

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._route.queryParams.subscribe(params => {
            const MODULE_ID = params['disclosureId'];
            const HOME_UNIT = this.getHomeUnit();
            if (MODULE_ID && this.travelDisclosure.travelDisclosureId != MODULE_ID) {
                this.loadNewTravelDisclosureAndUpdateStore(MODULE_ID);
            }
            if (!MODULE_ID) {
                this.resetTravelDisclosure();
            }
            if (!HOME_UNIT && !MODULE_ID) {
                this.router.navigate([REPORTER_HOME_URL]);
            }
        }));
    }

    private loadNewTravelDisclosureAndUpdateStore(travelDisclosureId: number) {
        this.$subscriptions.push(this.travel_service.loadTravelDisclosure(travelDisclosureId).subscribe((data: any) => {
            this._dataStore.setStoreData(data);
        }));
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                switch (event?.uniqueId) {
                    case 'CREATE_NEW_TRAVEL_DISCLOSURE':
                        this.travel_service.isCreateNewTravelDisclosure = true;
                        this.newTravelDisclosureCreateObject = event.content;
                        this.travel_service.travelDataChanged ? openCommonModal('travel-unsaved-changes-modal') : this.redirectBasedOnCreateDisclosure();
                        break;
                    case 'SELECT_ENGAGEMENT_TRAVEL_DISCLOSURE':
                        this.travel_service.isCreateNewTravelDisclosure = true;
                        this.createTravelDisclosure(EVENT_DATA);
                        break;
                    case 'TRIGGER_TRAVEL_CERTIFY_MODAL':
                        this.openConfirmationModal('Submit', false);
                        break;
                    case COI_REVIEW_COMMENTS_IDENTIFIER:
                        if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(EVENT_DATA?.action)) {
                            this.getCommentsCounts();
                            this.commonService.clearReviewCommentsSlider();
                        }
                        break;
                    case 'TRAVEL_DISCLOSURE_LEAVE_PAGE':
                        this.leavePageModalAction(EVENT_DATA?.modalActionEvent);
                        break;
                    case 'TRAVEL_FORM_UNSAVED_VALIDATION':
                        this.warningModalAction(EVENT_DATA?.modalAction);
                        break;
                    case 'TRIGGER_ROUTER_NAVIGATION_END':
                        this.updateStepsNavBtnConfig();
                        break;
                    case 'DOC_ACTION_STORAGE_EVENT':
                            this.openModalBasedOnActions();
                        break;
                    default: break;
                }
            })
        );
    }

    private warningModalAction(modalAction: ModalActionEvent): void {
        this.commonService.closeCOIValidationModal();
        if (modalAction?.action === 'PRIMARY_BTN') {
            // this.saveTravelDisclosure();
        }
        if (modalAction?.action === 'SECONDARY_BTN' || modalAction?.action === 'CLOSE_BTN') {
            this._dataStore.storedCertifyTabPath  = '';
        }

    }

    private listenTravelSaveComplete(): void {
        this.$subscriptions.push(this.travel_service.triggerSaveComplete.subscribe((data: any) => {
            this.travel_service.isFormBuilderDataChangePresent = false;
            this.commonService.setChangesAvailable(false);
            if (Array.isArray(data?.result)) {
                this.travelDisclosure.updateTimestamp = data?.result?.[0]?.updateTimestamp;
            } else {
                this.travelDisclosure.updateTimestamp = data?.result?.updateTimestamp;
            } 
            this.autoSaveService.updatedLastSaveTime(this.travelDisclosure.updateTimestamp, true);
            if (this.travel_service.isAnyAutoSaveFailed) {
                this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
            }
        }));
    }

    private leavePageModalAction(modalAction: ModalActionEvent): void {
        this.commonService.closeCOILeavePageModal();
        if (modalAction.action === 'SECONDARY_BTN') {
            this.travel_service.isFormBuilderDataChangePresent = false;
            this.router.navigateByUrl(this._navigationService.navigationGuardUrl);
        }
    }

    private resetTravelDisclosure(): void {
        this.setCreateModalDetails();
        this.travelDisclosure = new TravelDisclosure();
        this._dataStore.setStoreData(this.travelDisclosure);
        this.setUserDetails();
        this.validationList = [];
        this.travel_service.setUnSavedChanges(false, '');
        this.travel_service.isCreateNewTravelDisclosure = false;
    }

    private getHomeUnit(): string | null {
        const TRAVEL_CREATE_MODAL_DETAILS = this._dataStore.getCreateModalDetails();
        if (TRAVEL_CREATE_MODAL_DETAILS?.homeUnit) {
            return TRAVEL_CREATE_MODAL_DETAILS.homeUnit;
        }
        return null;
    }

    private clearAllDetails(): void {
        this.travelDisclosure = new TravelDisclosure();
        this._dataStore.setStoreData(this.travelDisclosure);
        const IS_COI_ENGAGEMENT = [ENGAGEMENT_ROUTE_URL].some(item => this.router.url.includes(item)); // when goes to Engagement page by clicking "Modify" button
        if (!IS_COI_ENGAGEMENT) {
            this.removeSessionStorage();
        }
        this.travel_service.setUnSavedChanges(false, '');
        this.travel_service.travelEntityDetails = new EntityDetails();
        this.commonService.clearReviewCommentsSlider();
        this.isShowCreateEngSlider = false;
        this.travel_service.travelCertificationText = '';
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        this.travel_service.isAllowNavigation = false;
        if (this._dataStore.getData().travelDisclosureId) {
            this.travelDisclosure = this._dataStore.getData();
            this.isDisclosureOwner = this.travelDisclosure.personId === this.commonService.getCurrentUserDetail('personID');
            this.userDetails.personId = this.travelDisclosure.personId;
            this.userDetails.fullName = this.travelDisclosure.person.fullName;
            this.userDetails.homeUnit = this.travelDisclosure.person.homeUnit;
            this.userDetails.homeUnitName = this.travelDisclosure.person.unit.unitName;
            this.userDetails.emailAddress = this.travelDisclosure.person.emailAddress;
            this.userDetails.primaryTitle = this.travelDisclosure.person.primaryTitle;
            this.travel_service.travelEntityDetails = this._dataStore.getEntityDetails();
            this.isShowOverAllHistory = this.isDisclosureOwner || this.commonService.getAvailableRight(TRAVEL_DISCLOSURE_RIGHTS);
            this.setPersonEntityDetails();
            this.setDisclosureBtnVisibility();
            this.travel_service.triggerForApplicableForms.next(true);
        } else {
            this.setUserDetails();
        }
    }

    private setAssignAdminModalDetails(): void {
        this.defaultAdminDetails.adminGroupId = this.travelDisclosure.adminGroupId;
        this.defaultAdminDetails.adminPersonId = this.travelDisclosure.adminPersonId;
        this.defaultAdminDetails.adminGroupName = this.travelDisclosure.adminGroupName;
        this.defaultAdminDetails.adminPersonName = this.travelDisclosure.adminPersonName;
    }

    private setDisclosureBtnVisibility(): void {
        const HAS_ADMIN = !!this.travelDisclosure?.adminPersonId;
        const IS_CREATE_PERSON = this.travel_service.isCheckLoggedUser(this.userDetails?.personId);
        const IS_LOGGED_PERSON_ADMIN = this.travel_service.isCheckLoggedUser(this.travelDisclosure?.adminPersonId);
        const IS_SUBMITTED = this.checkReviewStatusCode([TRAVEL_DISCL_REVIEW_STATUS_TYPE.SUBMITTED]);
        const IS_IN_REVIEW = this.checkReviewStatusCode([TRAVEL_DISCL_REVIEW_STATUS_TYPE.REVIEW_IN_PROGRESS]);
        const HAS_TRAVEL_MANAGE_RIGHT = this.commonService.getAvailableRight(TRAVEL_DISCLOSURE_MANAGE_RIGHTS);
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL = this._dataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const CAN_MANAGE_DISCLOSURE = HAS_TRAVEL_MANAGE_RIGHT && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
        this.isShowAssignAdminBtn = !HAS_ADMIN && CAN_MANAGE_DISCLOSURE && IS_SUBMITTED;
        this.isShowReAssignAdminBtn = HAS_ADMIN && CAN_MANAGE_DISCLOSURE && IS_IN_REVIEW;
        this.isShowWithdrawBtn = IS_SUBMITTED && IS_CREATE_PERSON;
        this.isShowReturnBtn = IS_IN_REVIEW && IS_LOGGED_PERSON_ADMIN;
        this.isShowApproveBtn = (CAN_MANAGE_DISCLOSURE && IS_SUBMITTED) || (IS_IN_REVIEW && IS_LOGGED_PERSON_ADMIN);
        this.isShowDisclosurePrintBtn = !!this.travelDisclosure.travelDisclosureId;
        this.isShowMoreActionBtn = this.isShowDisclosurePrintBtn || this.isShowAssignAdminBtn || this.isShowWithdrawBtn;
    }

    private setModalHeaderTitle(modalActionBtnName: string): void {
        const TRAVEL_DISCLOSURE_ID = this.travelDisclosure.travelDisclosureId || null;
        const CREATOR_NAME = this.travelDisclosure?.person?.fullName || null;
        const MODAL_BTN_NAME = modalActionBtnName;

        if (TRAVEL_DISCLOSURE_ID) {
            this.modalHeaderTitle = `${MODAL_BTN_NAME} Disclosure #${TRAVEL_DISCLOSURE_ID} : ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL } Disclosure By ${CREATOR_NAME}`;
        } else {
            this.modalHeaderTitle = ` ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL } Disclosure By ${CREATOR_NAME}`;
        }
    }

    private setUserDetails(): void {
        const TRAVEL_CREATE_MODAL_DETAILS: TravelCreateModalDetails = this._dataStore.getCreateModalDetails();
        this.userDetails.fullName = this.commonService.getCurrentUserDetail('fullName');
        this.userDetails.homeUnitName = this.commonService.getCurrentUserDetail('unitName');
        this.userDetails.personId = TRAVEL_CREATE_MODAL_DETAILS?.personId;
        this.userDetails.homeUnit = TRAVEL_CREATE_MODAL_DETAILS?.homeUnit;
        this.userDetails.primaryTitle = this.commonService.getCurrentUserDetail('primaryTitle');
        this.userDetails.emailAddress = this.commonService.getCurrentUserDetail('email');
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getDataFromStore();
            })
        );
    }

    private setApprovalChangesToDisclosure(travelDisclosure): void {
        this.travelDisclosure.travelReviewStatusType.description = travelDisclosure?.travelReviewStatusType?.description;
        this.travelDisclosure.travelDocumentStatusType.description = travelDisclosure?.travelDocumentStatusType?.description;
        this.travelDisclosure.updateTimestamp = travelDisclosure.updateTimestamp;
        this.travelDisclosure.reviewStatusCode = travelDisclosure.reviewStatusCode;
        this.travelDisclosure.documentStatusCode = travelDisclosure.documentStatusCode;
        this._dataStore.manualDataUpdate(this.travelDisclosure);
    }

    private getActionRequestObject(): TravelActionAfterSubmitRO {
        return {
            travelDisclosureId: this.travelDisclosure.travelDisclosureId,
            description: this.confirmationModalDescription
        };
    }

    private reRoutePage(): void {
        if (!this.travel_service.isCheckLoggedUser(this.travelDisclosure.personId)) {
            this.navigateBack();
        } else {
            this.router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
                { queryParams: { disclosureId: this.travelDisclosure.travelDisclosureId } });
        }
    }

    private navigateBack(): void {
        const PREVIOUS_MODULE_URL = this.travel_service.PREVIOUS_MODULE_URL;
        const ROUTE_URL = this.travel_service.isAdminDashboard ? ADMIN_DASHBOARD_URL : REPORTER_HOME_URL;
        (PREVIOUS_MODULE_URL?.includes('travel-disclosure')) ?
            this.router.navigate([ROUTE_URL]) : this.router.navigateByUrl(PREVIOUS_MODULE_URL || ROUTE_URL);
    }

    private removeSessionStorage(): void {
        if (!this._navigationService.navigationGuardUrl.includes('create-travel-disclosure')) {
            this._dataStore.removeCreateModalDetails();
        }
    }

    private redirectBasedOnCreateDisclosure(): void {
        if (this.travel_service.isCreateNewTravelDisclosure) {
            this.resetTravelDisclosure();
            this.router.navigate([CREATE_TRAVEL_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: null }, queryParamsHandling: 'merge' });
        } else {
            this.router.navigateByUrl(this._navigationService.navigationGuardUrl); // navigateByUrl is used due to "navigationGuardUrl" may contain querry params;
        }
    }

    private setCreateModalDetails(): void {
        if (this.travel_service.isCreateNewTravelDisclosure) {
            this._dataStore.setCreateModalDetails(this.newTravelDisclosureCreateObject);
            this.newTravelDisclosureCreateObject = new TravelCreateModalDetails();
        }
    }

    private async validateForm(): Promise<boolean> {
        if (this.travelDisclosure.travelDisclosureId) {
            try {
                const VALIDATION_RESPONSE = await this.commonService.validateForm({
                    formBuilderIds: [this.formId],
                    moduleItemCode: '24',
                    moduleSubItemCode: '0',
                    moduleItemKey: this.travelDisclosure.travelDisclosureId.toString(),
                    moduleSubItemKey: '0',
                }).toPromise();
                this.validationList = [...arrangeFormValidationList(VALIDATION_RESPONSE)];
                this._headerService.$globalPersistentEventNotifier.$formValidationList.next(this.validationList);
                this.updateStepsNavBtnConfig();
                if (!this.validationList.length && this._dataStore?.storedCertifyTabPath ) {
                    this.router.navigate([this._dataStore?.storedCertifyTabPath ], { queryParamsHandling: 'preserve' });
                }
                this._dataStore.storedCertifyTabPath  = '';
                return !this.validationList.length; // Return true if there are no validation errors
            } catch (err) {
                this.commonService.showToast('ERROR', `Error occurred during form validation.`);
                return false; // Return false in case of an error
            }
        }
        return false;
    }

    private createTravelDisclosure(travelDisclosureRO): void {
        this.$subscriptions.push((this.travelDisclosure.travelDisclosureId ?
            this.travel_service.updateTravelDisclosure(travelDisclosureRO) :
            this.travel_service.createTravelDisclosure(travelDisclosureRO))
            .subscribe((res: any) => {
                if (res) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Your selected engagement has been successfully linked to the disclosure.');
                    this.travel_service.isCreateNewTravelDisclosure = false;
                    this.router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
                        { queryParams: { disclosureId: res.travelDisclosureId } });
                }
            }, (err) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in Saving ' + COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure');
            })
        );
    }

    private checkExternalFundingType() {
        this.$subscriptions.push(this.travel_service.isExternalFundingType.subscribe((data: any) => {
            this.isExternal = data;
        }))
    }

    private setPersonEntityDetails(): void {
        this.personEntityDetails.personFullName = this.travelDisclosure?.person?.fullName;
        this.personEntityDetails.entityName = this.travelDisclosure?.personEntity?.coiEntity?.entityName;
        this.personEntityDetails.homeUnitName = this.travelDisclosure?.person?.unit?.unitName;
        this.personEntityDetails.homeUnit = this.travelDisclosure?.person?.homeUnit;
        this.personEntityDetails.personEmail = this.travelDisclosure?.person?.emailAddress;
        this.personEntityDetails.personPrimaryTitle = this.travelDisclosure?.person?.primaryTitle;
        this.isShowPersonEntityDetails = true;
    }

    private async checkDisclosureCreationAllowed(): Promise<boolean | null> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(
                this._headerService.isDisclosureCreationAllowed()
                    .subscribe((data: { isFcoiRequired: boolean, isOpaRequired: boolean }) => {
                        const CAN_CREATE_FCOI = data?.isFcoiRequired && this.commonService.isDisclosureRequired && this.commonService.isShowFinancialDisclosure;
                        resolve(CAN_CREATE_FCOI);
                    }, err => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Disclosure creation validation failed.');
                        resolve(null);
                    }));
        });
    }

    private async submitTravelDisclosure(): Promise<void> {
        const TRAVEL_SUBMIT_REQ_OBJECT: CoiTravelDisclosure = this._dataStore.getTravelDisclosureSubmitRO();
        this.$subscriptions.push(this.travel_service.submitTravelDisclosure(TRAVEL_SUBMIT_REQ_OBJECT)
            .subscribe(async (res: any) => {
                if (res) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure Submitted Successfully');
                    this.travel_service.setUnSavedChanges(false, '');
                    if (res.disclValidatedObject && await this.checkDisclosureCreationAllowed()) {
                        this.validateReimbursedCost(res.disclValidatedObject);
                    } else {
                        this.router.navigate([POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL],
                            { queryParams: { disclosureId: this.travelDisclosure.travelDisclosureId } });
                    }
                }
            }, (err) => {
                switch (err.status) {
                    case 405:
                        closeCommonModal('travel-confirmation-modal');
                        this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`;
                        break;
                    case 406:
                        this.triggerEngagementInactiveValidationModal(err?.error);
                        break;
                    default:
                        this.commonService.showToast(HTTP_ERROR_STATUS,'Error in Submitting ' + COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure');
                        break;
                }
            })
        );
    }

    private triggerEngagementInactiveValidationModal(errorMsg: string): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'ENGAGEMENT_INACTIVE_VALIDATION';
        CONFIG.modalHeader = 'Attention';
        CONFIG.errorMsgHeader = '';
        CONFIG.validationType = 'VIEW_ONLY';
        CONFIG.errorList = [errorMsg];
        CONFIG.modalConfig.namings.secondaryBtnName = 'Close';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private withdrawTravelDisclosure(): void {
        this.$subscriptions.push(this.travel_service.withdrawTravelDisclosure(this.getActionRequestObject())
            .subscribe((res: any) => {
                if (res) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure Recalled Successfully.');
                    this.travel_service.setUnSavedChanges(false, '');
                    this.router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
                        { queryParams: { disclosureId: this.travelDisclosure.travelDisclosureId } });
                }
            }, (err) => {
                if (err.status === 405) {
                    closeCommonModal('travel-confirmation-modal');
                    this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`;
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in Recalling ' + COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure');
                }
            })
        );
    }

    private returnTravelDisclosure(): void {
        this.$subscriptions.push(this.travel_service.returnTravelDisclosure(this.getActionRequestObject())
            .subscribe((res: any) => {
                if (res) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure Returned Successfully');
                    this.travel_service.setUnSavedChanges(false, '');
                    this.reRoutePage();
                }
            }, (err) => {
                if (err.status === 405) {
                    closeCommonModal('travel-confirmation-modal');
                    this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`;
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in Returning ' + COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure');
                }
            })
        );
    }

    private approveTravelDisclosure(): void {
        this.$subscriptions.push(this.travel_service.approveTravelDisclosure(this.getActionRequestObject())
            .subscribe((res: any) => {
                if (res) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure Approved Successfully');
                    this.travel_service.setUnSavedChanges(false, '');
                    this.setApprovalChangesToDisclosure(res);
                }
            }, (err) => {
                if (err.status === 405) {
                    closeCommonModal('travel-confirmation-modal');
                    this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`;
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in Approving ' + COMMON_DISCL_LOCALIZE.TERM_TRAVEL + ' Disclosure');
                }
            })
        );
    }

    private emitDisclosureHeaderResize(isResize: boolean): void {
        setTimeout(() => {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'TRAVEL_DISCLOSURE_HEADER_RESIZE', content: { isCardExpanded: this.isCardExpanded, isResize: isResize } });
        });
    }

    private updateStepsNavBtnConfig(): void {
        this.travel_service.stepsNavBtnConfig = new CoiStepsNavConfig();
        const CONFIG = this.travel_service.stepsNavBtnConfig;
        switch (true) {
            case this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.TRAVEL_DETAILS]):
                this.configureTravelDetailsStep(CONFIG);
                break;
            case this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.CERTIFY]):
                this.configureCertifyStep(CONFIG);
                break;
            case this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.ENGAGEMENTS]):
                this.configureEngagementsStep(CONFIG);
                break;
            default:
                break;
        }
    }

    private configureTravelDetailsStep(CONFIG: CoiStepsNavConfig): void {
        CONFIG.previousBtnConfig.isShowBtn = true;
        CONFIG.proceedBtnConfig.isShowBtn = true;
    }

    private configureCertifyStep(CONFIG: CoiStepsNavConfig): void {
        CONFIG.previousBtnConfig.isShowBtn = true;
        CONFIG.proceedBtnConfig.isShowBtn = false;
        CONFIG.primaryBtnConfig = {
            btnName: 'Submit',
            matIcon: 'done',
            ariaLabel: this.travel_service.isTravelCertified ? 'Click here to submit the disclosure' : 'Please certify to submit the disclosure',
            title: this.travel_service.isTravelCertified ? 'Click here to submit the disclosure' : 'Please certify to submit the disclosure',
            isDisabled: !this.travel_service.isTravelCertified,
            isShowBtn: true,
            actionType: 'SUBMIT'
        };
    }

    private configureEngagementsStep(CONFIG: CoiStepsNavConfig): void {
        CONFIG.previousBtnConfig.isShowBtn = true;
        CONFIG.proceedBtnConfig.isShowBtn = true;
        CONFIG.previousBtnConfig.isDisabled = true;
        CONFIG.previousBtnConfig.title = 'The button is disabled';
        CONFIG.previousBtnConfig.ariaLabel = CONFIG.previousBtnConfig.title;
    }

    // This function retrieves the certification terms and conditions message dynamically from the database from the table dyn_element_config, making it configurable.
    private getTravelCertificationText(subsectionId, elementId): void {
        const RAW_CONTENT = this._informationAndHelpTextService.getInFormationText(subsectionId, elementId);
        if (RAW_CONTENT?.trim()) {
            const ENTIRE_TRAVEL_CERTIFICATION_TEXT = sanitizeHtml(RAW_CONTENT);
            this.travel_service.travelCertificationText = this.sanitizer.bypassSecurityTrustHtml(ENTIRE_TRAVEL_CERTIFICATION_TEXT);
        }

    }

    isRouteComplete(possibleActiveRoutes: string[] = []): boolean {
        return possibleActiveRoutes.some(paths => this.router.url.includes(paths));
    }

    checkReviewStatusCode(statusCode: string[] | string, method: Method = 'EVERY'): boolean {
        const REVIEW_STATUS = Array.isArray(statusCode) ? statusCode : [statusCode];
        if (method === 'EVERY') {
            return REVIEW_STATUS.every((status) => status.includes(this.travelDisclosure.reviewStatusCode));
        } else {
            return REVIEW_STATUS.some((status) => status.includes(this.travelDisclosure.reviewStatusCode));
        }
    }

    openAddAssignModal(): void {
        this.isAddAssignModalOpen = true;
        this.setAssignAdminModalDetails();
    }

    closeAssignAdministratorModal(event): void {
        if (event && (event.adminPersonId || event.adminGroupId)) {
            this.travelDisclosure.adminPersonId = event.adminPersonId || null;
            this.travelDisclosure.adminPersonName = event.adminPersonName || null;
            this.travelDisclosure.adminGroupId = event.adminGroupId || null;
            this.travelDisclosure.adminGroupName = event.adminGroupName || null;
            this.travelDisclosure.reviewStatusCode = event.reviewStatusCode;
            this.travelDisclosure.travelReviewStatusType = event.reviewStatus;
            this.travelDisclosure.updateTimestamp = event.updateTimestamp;
            this.travelDisclosure.travelReviewStatusType = event?.travelReviewStatusType;
            // this.travelDisclosure.disclosureStatusCode = event.disclosureStatusCode; // need to clarify
            // this.travelDisclosure.disclosureStatus = event.disclosureStatus;
            this._dataStore.manualDataUpdate(this.travelDisclosure);
        }
        this.isAddAssignModalOpen = false;
    }

    async openConfirmationModal(actionBtnName: string, needDescriptionField: boolean, isMandatory: boolean = false, descriptionErrorMsg: string = ''): Promise<void> {
        if (await this.validateForm()) {
            this.modalActionBtnName = actionBtnName;
            this.needDescriptionField = needDescriptionField;
            this.isMandatory = isMandatory;
            this.textAreaLabelName = actionBtnName === 'Recall' ? ' Recall' : (actionBtnName === 'Approve' ? 'Approval' : actionBtnName);
            this.modalSize = needDescriptionField ? 'lg' : 'md';
            this.setModalHeaderTitle(actionBtnName);
            this.descriptionErrorMsg = descriptionErrorMsg;
            this.confirmationModalHelpText = '';
            this.reasonHelpText = '';
            setTimeout(() => {
                this.reasonHelpText = `Please provide the reason for ${this.textAreaLabelName.toLowerCase()}.`;
                this.confirmationModalHelpText = `You are about to ${actionBtnName.toLowerCase()} the disclosure.`;
            });
            openCommonModal('travel-confirmation-modal');
        }
    }

    performDisclosureAction(event: string): void {
        this.needDescriptionField = false;
        this.confirmationModalDescription = event;
        switch (this.modalActionBtnName) {
            case 'Submit':
                this.submitTravelDisclosure();
                break;
            case 'Return':
                return this.returnTravelDisclosure();
            case 'Approve':
                return this.approveTravelDisclosure();
            case 'Recall':
                return this.withdrawTravelDisclosure();
            default:
                return;
        }
    }

    leavePageClicked(): void {
        this.travel_service.isAllowNavigation = true;
        this.travel_service.setUnSavedChanges(false, '');
        this.travel_service.isFormBuilderDataChangePresent = false;
        this.removeSessionStorage();
        this.redirectBasedOnCreateDisclosure();
    }

    removeNewTravelCreateObject(): void {
        this.travel_service.isCreateNewTravelDisclosure = false;
        this.newTravelDisclosureCreateObject = new TravelCreateModalDetails();
    }

    // saveTravelDisclosure(): void {
    //     if (this.travel_service?.isFormBuilderDataChangePresent) {
    //         this.travel_service.formBuilderEvents.next({ eventType: 'SAVE' });
    //         this.travel_service.setUnSavedChanges(false, '');
    //     } else {
    //         this.validateForm();
    //     }
    // }

    async navigateTo(tab: TabType) {
        const ROUTES: Record<TabType, string> = {
            TRAVEL_ENGAGEMENTS: 'coi/create-travel-disclosure/engagements',
            TRAVEL_DETAILS: 'coi/create-travel-disclosure/travel-details',
            CERTIFY: 'coi/create-travel-disclosure/certification',
            HISTORY_CREATE: 'coi/create-travel-disclosure/history',
            HISTORY_VIEW: 'coi/travel-disclosure/history',
            SUMMARY: 'coi/travel-disclosure/summary',
            RELATED_DISCLOSURES: 'coi/travel-disclosure/related-disclosures',
        };

        if (tab === 'SUMMARY') {
            this.travel_service.triggerForApplicableForms.next(true);
        }

        if (ROUTES[tab]) {
            window.scrollTo(0, 0);
            if (tab !== "CERTIFY" || (!this.travel_service.isFormBuilderDataChangePresent && await this.validateForm())) {
                this.router.navigate([ROUTES[tab]], { queryParamsHandling: 'preserve' });
            } else if (tab === "CERTIFY" && this.travel_service?.isFormBuilderDataChangePresent ) {
                this._dataStore.storedCertifyTabPath  = ROUTES[tab];
                await this.validateForm();
                // this.triggerTravelFormWarningModal();
            }
        }
        this.travel_service.setTopForTravelDisclosure();
    }

    private triggerTravelFormWarningModal(): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'TRAVEL_FORM_UNSAVED_VALIDATION';
        CONFIG.validationType = 'ACTIONABLE';
        CONFIG.warningList = [TRAVEL_FORM_UNSAVED_WARNING_MESSAGE];
        CONFIG.modalConfig.namings.secondaryBtnName = 'Close';
        CONFIG.modalConfig.namings.primaryBtnName = 'Save & Proceed';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    openPersonSlider(type: string, count: number): void {
        if (count) {
            this.isShowPersonSlider = true;
            this.selectedPersonSliderType = type;
        }
    }

    closePersonSlider(event): void {
        if (event?.concurrentUpdateAction) {
            this.commonService.concurrentUpdateAction = event.concurrentUpdateAction;
        } else {
            this.isShowPersonSlider = false;
            this.selectedPersonSliderType = '';
        }
    }

    // opens a validation modal on clicking travel-details by without choosing an engagement on 'External' Funding type
    travelDetailsValidation() {
        const IS_TRAVEL_EXTERNAL = this._dataStore.isExternal();
        if (this.isExternal && this.isCreateTravelEngagement && !IS_TRAVEL_EXTERNAL) {
            openCommonModal(TRAVEL_ENGAGEMENT_VALIDATION_MODAL);
        } else if (this.travelDisclosure.travelDisclosureId) {
            this.navigateTo('TRAVEL_DETAILS');
        }
    }

    postConfirmation(modalAction: ModalActionEvent) {
        closeCommonModal(TRAVEL_ENGAGEMENT_VALIDATION_MODAL);
    }

    postFCOIModalConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            // this.disclosureMandatoryCheck(); //Mandatory check for the comment text area is temporarily commented out — not needed now, but may be used in the future.
            if (this.fcoiModalConfig.namings.primaryBtnName.includes('Revise')) {
                if(this.disclosureModalDetails.isView) {
                    this.viewDisclosure();
                } else {
                    this.reviseFCOI();
                }
            } else if (this.fcoiModalConfig.namings.primaryBtnName.includes('Create')) {
                this.createFCOI();
            }
        } else {
            this.disclosureModalDetails = new CreateDisclosureModalDetails();
            this.disclosureMandatoryList.clear();
            closeCommonModal(CREATE_OR_REVISE_FCOI_MODAL);
            this.router.navigate([POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL],
                { queryParams: { disclosureId: this.travelDisclosure.travelDisclosureId } });
        }
    }

    private validateReimbursedCost(data: DisclosureValidatedDetails): void{
        this.setDisclosureModal(data);
    }

    private setDisclosureModal(data: DisclosureValidatedDetails): void {
        if (Object.keys(data?.fcoiDisclosureDetails || {}).length > 0) {
            this.disclosureModalDetails.id = data?.fcoiDisclosureDetails?.DISCLOSURE_ID;
            this.disclosureModalDetails.REVIEW_STATUS_CODE = data?.fcoiDisclosureDetails?.REVIEW_STATUS_CODE;
            switch (data?.fcoiDisclosureDetails?.REVIEW_STATUS_CODE) {
                case DISCLOSURE_REVIEW_STATUS.COMPLETED: {
                    this.fcoiModalConfig.namings.primaryBtnName = 'Revise';
                    this.disclosureModalDetails.modalHeader = 'Revise';
                    this.disclosureModalDetails.message = 'A reimbursement cost has exceeded the limit for this engagement, marking it as a financial engagement. Please revise the disclosure for this engagement.';
                    break;
                }
                case DISCLOSURE_REVIEW_STATUS.REVIEW_IN_PROGRESS:
                case DISCLOSURE_REVIEW_STATUS.REVIEW_ASSIGNED:
                case DISCLOSURE_REVIEW_STATUS.SUBMITTED:
                case DISCLOSURE_REVIEW_STATUS.ASSIGNED_REVIEW_COMPLETED: {
                    this.fcoiModalConfig.namings.primaryBtnName = 'Revise';
                    this.disclosureModalDetails.modalHeader = 'Revise';
                    this.disclosureModalDetails.message = `The travel reimbursement cost for this engagement exceeds the limit set by university and requires a financial disclosure. Please recall your submitted ${COMMON_DISCL_LOCALIZE.TERM_COI} and revise it to reflect this change.`;
                    this.disclosureModalDetails.isView = true;
                    break;
                }
                default: {
                    break;
                }
            }
        } else {
            this.fcoiModalConfig.namings.primaryBtnName = 'Create';
            this.disclosureModalDetails.modalHeader = `Create ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}`;
            this.disclosureModalDetails.message = `A reimbursement cost has exceeded the limit for this engagement, marking it as a financial engagement. Please create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL} for this engagement`;
        }
        setTimeout(() => {
            openCommonModal(CREATE_OR_REVISE_FCOI_MODAL);
        }, 50);
    }

    // Temporarily commenting out the mandatory check function, as it is not currently in use. This function may be needed for future requirements.
    // private disclosureMandatoryCheck(): void {
    //     this.disclosureMandatoryList.clear();
    //     if (!this.disclosureDescription) {
    //         this.disclosureMandatoryList.set('description', 'Please enter description');
    //     }
    // }

    private reviseFCOI(): void {
        if (!this.disclosureMandatoryList.size) {
            let revisionReqObj: any = {};
            revisionReqObj.disclosureId = this.disclosureModalDetails.id;
            revisionReqObj.comment = this.disclosureDescription;
            revisionReqObj.homeUnit = this.commonService.currentUserDetails.unitNumber;
            this.$subscriptions.push(this._headerService.reviseFcoiDisclosure(revisionReqObj).subscribe((data: any) => {
                this.disclosureMandatoryList.clear();
                closeCommonModal(CREATE_OR_REVISE_FCOI_MODAL);
                this.router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: data.disclosureId } });
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        }
    }

    private viewDisclosure(): void {
        this.navigateToDisclosure(POST_CREATE_DISCLOSURE_ROUTE_URL, this.disclosureModalDetails.id);
    }
    private navigateToDisclosure(routeUrl: string, disclosureId: string | number): void {
        this.router.navigate([routeUrl], { queryParams: { disclosureId } });
    }

    private createFCOI(): void {
        if (!this.disclosureMandatoryList.size) {
            const FCOI_DISCLOSURE_RO: FCOIDisclosureCreateRO = {
                fcoiTypeCode: DISCLOSURE_TYPE.INITIAL,
                homeUnit: this.commonService.currentUserDetails.unitNumber,
                revisionComment: this.disclosureDescription,
                personId: this.commonService.getCurrentUserDetail('personID')
            };
            this.$subscriptions.push(this._headerService.createInitialDisclosure(FCOI_DISCLOSURE_RO).subscribe((data: any) => {
                this.disclosureMandatoryList.clear();
                closeCommonModal(CREATE_OR_REVISE_FCOI_MODAL);
                this.router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: data.disclosureId } });
            }, err => {
                if (err.status === 406) {
                    this.disclosureMandatoryList.clear();
                    closeCommonModal(CREATE_OR_REVISE_FCOI_MODAL);
                    this.commonService.showToast(HTTP_ERROR_STATUS, err?.error);
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            }));
        }
    }

    collapseHeader(): void {
        this.isCardExpanded = !this.isCardExpanded;
        this.isManuallyExpanded = this.isCardExpanded;
        this.emitDisclosureHeaderResize(false);
        this.travel_service.setTopForTravelDisclosure();
    }

    openHistorySlider (): void {
        this.isShowCompleteDisclHistory = true;
    }

    closeCompleteDisclosureHistorySlider (): void {
        this.isShowCompleteDisclHistory = false;
    }

    openTravelReviewComment(): void {
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: '13',
            moduleItemKey: this.travelDisclosure?.travelDisclosureId,
            moduleItemNumber: this.travelDisclosure?.travelNumber,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: this.travelDisclosure?.person?.personId,
        }
        this.travel_service.setReviewCommentSliderConfig(REQ_BODY);
    }

    private getCommentsCounts(): void {
        if(this.travelDisclosure?.travelDisclosureId) {
            this.travelDisclCommentsCountRO.moduleCode = TRAVEL_MODULE_CODE;
            this.travelDisclCommentsCountRO.documentOwnerPersonId = this.travelDisclosure?.person?.personId;
            this.travelDisclCommentsCountRO.moduleItemKey = this.travelDisclosure?.travelDisclosureId;
            this.$subscriptions.push(
                this.commonService.getDisclosureCommentsCount(this.travelDisclCommentsCountRO).subscribe((response: DisclosureCommentsCounts) => {
                    this._dataStore.updateStore(['travelDisclosureCommentsCounts'], { travelDisclosureCommentsCounts: response });
                },
                (_err) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                })
            );
        }
    }

    private getApplicableForms(): void {
        this.$subscriptions.push(this.travel_service.triggerForApplicableForms.subscribe((data: any) => {
            const REQ_OBJ = this.commonService.getApplicableFormRO(TRAVEL_MODULE_CODE.toString(), TRAVEL_SUB_MODULE_CODE.toString(), this.travelDisclosure?.personId, this.travelDisclosure?.travelDisclosureId?.toString());
            this.commonService.getApplicableForms(REQ_OBJ).subscribe((data: any) => {
                this.formList = data;
                this.setFormStatus();
                this.getFormId(this.formList[0]);
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            });
        }));
    }

    private setFormStatus(): void {
        this.formList.forEach((form: any) => {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                this.travel_service.formStatusMap.set(form?.answeredFormId, 'N');
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.travel_service.answeredFormId = form?.answeredFormId;
                this.travel_service.formStatusMap.set(form?.activeFormId, 'Y');
            } else {
                this.travel_service.formStatusMap.set(form?.activeFormId, 'N');
            }
        });
    }

    private getFormId(form: any): void {
        if (this.isCreateMode) {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                this.formId = form?.answeredFormId;
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.formId = form?.activeFormId;
            } else {
                this.formId = form?.activeFormId;
            }
        } else {
            this.formId = form?.answeredFormId || form?.activeFormId;
        }
        this.travel_service.triggerFormId.next({ 'formId': this.formId });
    }

    /**
  * Opens action modals based on document actions stored in  sessionStorage.
 */
    private openModalBasedOnActions(): void {
        const DOCUMENT_ACTION: DocumentActionStorageEvent = this._headerService.getDocActionStorageEvent();
        if (DOCUMENT_ACTION?.targetModule === 'TRAVEL_DISCLOSURE') {
            if (this.isShowWithdrawBtn && DOCUMENT_ACTION.action === 'REVISE') {
                if (DOCUMENT_ACTION.isModalRequired) {
                    this.openConfirmationModal('Recall', true, true, this.withdrawErrorMsg);
                } else {
                    this.withdrawTravelDisclosure();
                }
            }
            this._headerService.removeDocActionStorageEvent();
        }
    }

    viewEntityDetails(): void {
        this.commonService.openEntityDetailsModal(this.travel_service?.travelEntityDetails?.entityId);
    }

    stepNavAction(event: any): void {
        switch(event?.actionType as CoiStepsNavActionType) {
            case 'PREVIOUS':
                this.goToPrevStep();
                break;
            case 'PROCEED':
                this.goToNextStep();
                break;
            case 'SUBMIT':
                this.openConfirmationModal('Submit', false);
                break;
            default: break;
        }
    }

    goToNextStep(): void {
        if (this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.ENGAGEMENTS])) {
            this.travelDetailsValidation();
        } else if (this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.TRAVEL_DETAILS])) {
            this.navigateTo('CERTIFY');
        }
    }

    goToPrevStep(): void {
        if (this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.TRAVEL_DETAILS])) {
            this.navigateTo('TRAVEL_ENGAGEMENTS');
        } else if (this.isRouteComplete([TRAVEL_DISCLOSURE_PATHS.CERTIFY])) {
            this.travelDetailsValidation();
        }
    }

    routeToAdminOrUserDashboard(): void {
        const URL = this.travel_service.previousTravelDisclRouteUrl;
        if (URL.includes(ADMIN_DASHBOARD_URL)) {
            this.router.navigate([ADMIN_DASHBOARD_URL]);
        } else if (URL.includes(REVIEWER_ADMIN_DASHBOARD_BASE_URL)) {
            this.router.navigate([REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.DISCLOSURE_LIST]);
        } else {
            this.router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    openPrintDisclosureModal(): void {
        const { travelDisclosureId, travelNumber, person } = this.travelDisclosure || {};
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = travelDisclosureId;
        this.printModalConfig.moduleItemCode = TRAVEL_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = travelNumber;
        this.printModalConfig.moduleSubItemCode = TRAVEL_SUB_MODULE_CODE;
        this.printModalConfig.modalConfig.namings.modalName = 'travel-discl-print-modal';
        this.printModalConfig.modalHeaderText = `Print ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL } Disclosure`;
        this.printModalConfig.helpTextConfig = { subSectionId: '2401', elementId: 'travel-discl-print' };
        this.printModalConfig.templateLabel = `Choose a template to print ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL } Disclosure`;
        this.printModalConfig.fileName = 'travel-disclosure-' + travelDisclosureId + '-' + person?.fullName;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(this.autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
            this.travel_service.formBuilderEvents.next({ eventType: 'SAVE' });
            this.travel_service.setUnSavedChanges(false, '');
        }
        ));
    }

}
