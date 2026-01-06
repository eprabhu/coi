import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ADD_REVIEW_MODAL_ID, COI, COIApproveOrRejectWorkflowRO,
    CertifyDisclosureRO, CoiDisclosure, DefineRelationshipDataStore,
    DisclosureCompleteFinalReviewRO, ModalType, ProjectSfiRelationLoadRO,
    ProjectSfiRelations, ValidationDockModalConfiguration, getApplicableQuestionnaireData } from './coi-interface';
import { DataStoreService } from './services/data-store.service';
import { CoiService, certifyIfQuestionnaireCompleted } from './services/coi.service';
import { Location } from '@angular/common';
import { CommonService } from '../common/services/common.service';
import {
    NO_DATA_FOUND_MESSAGE,
    REPORTER_HOME_URL,
    POST_CREATE_DISCLOSURE_ROUTE_URL,
    CREATE_DISCLOSURE_ROUTE_URL,CONFLICT_STATUS_TYPE,
    EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE,
    COMMON_ERROR_TOAST_MSG,
    DISCLOSURE_TYPE,
    DISCLOSURE_CREATE_MODE_PATHS,
    DISCLOSURE_REVIEW_STATUS,
    CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL,
    DISCLOSURE_NOTES_RIGHT,
    ADMIN_DASHBOARD_URL,
    PROJECT_TYPE,
    HTTP_ERROR_STATUS,
    HTTP_SUCCESS_STATUS,
    COI_MODULE_CODE,
    FCOI_DISCLOSURE_CHILD_ROUTE_URLS,
    USER_DASHBOARD_CHILD_ROUTE_URLS,
    SECTION_DETAILS_OF_CONFIGURED_INFO_TEXT,
    PROJECT_DASHBOARD_URL,
    FCOI_REVIEWER_REVIEW_STATUS_TYPE,
    FCOI_SUB_MODULE_ITEM_KEY,
    FCOI_DISCL_VIEW_MODE_CHILD_ROUTE_URLS,
    FCOI_PROJECT_DISCLOSURE_RIGHTS,
    DISCLOSURE_CONFLICT_STATUS_BADGE,
    COI_REVIEW_STATUS_BADGE,
    COI_DISPOSITION_STATUS_BADGE,
    DISCLOSURE_RISK_BADGE
} from '../app-constants';
import { NavigationService } from '../common/services/navigation.service';
import { closeCommonModal, deepCloneObject, hideModal, isEmptyObject, openCommonModal, openModal, sanitizeHtml } from '../common/utilities/custom-utilities';
import { environment } from '../../environments/environment';
import { COICountModal, DefaultAssignAdminDetails, PersonProjectOrEntity } from '../shared-components/shared-interface';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { AutoSaveService } from '../common/services/auto-save.service';
import { getCurrentTime } from '../common/utilities/date-utilities';
import { COIValidationModalConfig, DataStoreEvent, DisclosureCommentsCountRO, DisclosureCommentsCounts, DisclosureReviewFetchType, DocumentActionStorageEvent, EvaluateValidationRO,
    FcoiType,
    FetchEachOrAllEngagementsRO, GlobalEventNotifier, PrintModalConfig, ReviewCommentsSliderConfig } from '../common/services/coi-common.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../shared-components/coi-review-comments/coi-review-comments-constants';
import { FetchReviewCommentRO, Projects } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { DefineRelationshipDataStoreService } from './define-relationship/services/define-relationship-data-store.service';
import { CoiStepsNavActionType, CoiStepsNavBtnConfig, CoiStepsNavConfig } from '../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HeaderService } from '../common/header/header.service';
import { COMMON_DISCL_LOCALIZE, ENGAGEMENT_LOCALIZE } from '../app-locales';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { WorkFlowAction, WorkflowDetail } from '../shared-components/workflow-engine2/workflow-engine-interface';
import { BypassValidateAction } from '../shared-components/workflow-engine2/workflow-engine.component';
import { REVIEWER_ADMIN_DASHBOARD_BASE_URL, REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS } from '../reviewer-dashboard/reviewer-dashboard-constants';

export class RoutingBypassRO {
    workflow: WorkFlowAction; 
    flag: string; 
    allApprovers: WorkflowDetail[];
}

@Component({
    selector: 'app-disclosure',
    templateUrl: './disclosure.component.html',
    styleUrls: ['./disclosure.component.scss'],
})

export class DisclosureComponent implements OnInit, OnDestroy {

    isCardExpanded = false;
    isCreateMode = false;
    isSaving = false;
    isAddAssignModalOpen = false;
    certificationText = 'I certify that the information provided for the Financial conflict of interest, including, responses to screening questions, list of my pertinent Engagements and possible relationship to my sponsored activity is an accurate and current statement of my reportable outside interests and activities.';
    $subscriptions: Subscription[] = [];
    coiData = new COI();
    projectRelationshipData = new ProjectSfiRelations();
    currentStepNumber: 1 | 2 | 3 | 4 = 1;
    tempStepNumber: any;
    NO_DATA_FOUND_MESSAGE = NO_DATA_FOUND_MESSAGE;
    assignReviewerActionDetails: any = {};
    assignReviewerActionValidation = new Map();
    adminGroupsCompleterOptions: any = {};
    personElasticOptions: any = {};
    categoryClearFiled: String;
    assigneeClearField: String;
    coiList = [];
    prevURL = '';
    userId: any;
    disclosureId: number;
    disclosureNumber: number;
    disclosureStatusCode: string;
    deployMap = environment.deployUrl;
    isCOIReviewer = false;
    error = '';
    canShowReviewerTab = false;
    canShowAttachmentTab = false;
    showConfirmation = false;
    relationshipError: any;
    questionnaireError: any;
    defaultAdminDetails = new DefaultAssignAdminDetails();
    personProjectDetails = new PersonProjectOrEntity();
    count: number;
    dependencies = ['coiDisclosure', 'numberOfSFI'];
    reviewStatus: string;
    filterType = 'ACTIVE';
    withdrawError = new Map();
    description: any;
    returnError = new Map();
    isShowMore = false;
    primaryBtnName = '';
    descriptionErrorMsg = '';
    textAreaLabelName = '';
    withdrawErrorMsg = 'Please provide the reason for Recalling the disclosure.';
    returnErrorMsg = 'Please provide the reason for returning the disclosure.';
    withdrawRequestErrorMsg = 'Please provide the reason for the Recall request.';
    denyErrorMsg = 'Please provide the reason for denying request to recall.';
    helpTexts = '';
    confirmationHelpTexts = '';
    isHomePageClicked = false;
    showSlider = false;
    selectedType = '';
    withdrawHelpTexts = 'Please provide the reason for Recall.';
    returnHelpTexts = 'Please provide the reason for return.';
    denyHelpTexts = 'Please provide the reason for denying the request to recall.';
    withdrawRequestHelpTexts = 'Please provide the reason for Recall request.'
    completeReviewHelpText = 'You are about to complete the disclosure\'s final review.'
    returnModalHelpText = '';
    withdrawModalHelpText = '';
    withdrawRequestModalHelpText = '';
    denyModalHelpText = '';
    isOpenRiskSlider = false;
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    PROJECT_TYPE = PROJECT_TYPE;
    COI_REVIEW_STATUS_TYPE = DISCLOSURE_REVIEW_STATUS;
    EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE = EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE;
    commentsRight: any = {};
    isUserCollapse = false;
    submitHelpTexts = '';
    fcoiTypeCode = '';
    coiProjectTypeCode = '';
    coiCountModal = new COICountModal();
    isCreateModeTabsVisible = false;
    isDisclosureTabActive = false;
    getCurrentTime = getCurrentTime;
    canShowWithdrawRequestBtn = false;
    validationList: string[] = [];
    validationDockModalConfig = new ValidationDockModalConfiguration();
    disclosureCommentsCountRO = new DisclosureCommentsCountRO();
    canShowNotesLink = false;
    canShowAddNoteBtn = false;
    isShowCommentButton = false;
    isDisclosureOwner = false;
    reviewSliderConfig = new ReviewCommentsSliderConfig();
    isShowCompleteDisclHistory = false;
    lastScrollTop = 0;
    scrollTop = 0;
    isManuallyExpanded = false;
    isScrolled = false;
    isShowAssignAdmin = false;
    isShowReAssignAdmin = false;
    isShowApproveDisapproveBtn = false;
    isShowModifyRisk = false;
    isShowWithdrawRequest = false;
    isShowWithdrawDisclosure = false;
    isShowReturnDIsclosure = false;
    disclosureURls = FCOI_DISCLOSURE_CHILD_ROUTE_URLS;
    disclosureViewModeUrls = FCOI_DISCL_VIEW_MODE_CHILD_ROUTE_URLS;
    reviewDescription = '';
    printModalConfig = new PrintModalConfig();
    certificationSectionDetails = SECTION_DETAILS_OF_CONFIGURED_INFO_TEXT.FCOI_DISCLOSURE_CERTIFICATION;
    isShowCompleteFinalReviewBtn = false;
    isShowReviseButton = false;
    isShowRouteLogTab = false;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    workFlowConfirmModalId = 'work-flow-approve-return-confirm-modal';
    workFlowConfirmModalConfig = new CommonModalConfig(this.workFlowConfirmModalId, '', 'Cancel', 'lg');
    approveOrRejectWorkflowRO = new COIApproveOrRejectWorkflowRO();
    WorkflowUploadedFiles: any[] = [];
    attachmentErrorMsg = '';
    workFlowMandatoryList = new Map();
    validationAction: 'BYPASS' | 'APPROVE' | null;
    routingBypassRO = new RoutingBypassRO();
    isShowAdminDetails = false;
    isShowOverAllHistory = false;
    disclosureTitle = '';
    disclosureConflictStatusBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
    coiReviewStatusBadge = COI_REVIEW_STATUS_BADGE;
    coiDispositionStatusBadge = COI_DISPOSITION_STATUS_BADGE;
    disclosureRiskBadge = DISCLOSURE_RISK_BADGE;
    documentAction: DocumentActionStorageEvent;

    @HostListener('window:resize', ['$event'])
    listenScreenSize(event?: Event) {
        if(!this.isCreateMode) {
            if(!this.isUserCollapse) {
                this.isCardExpanded = window.innerWidth > 1399;
            }
        }
        this.emitDisclosureHeaderResize(false);
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: Event) {
        if(!this.isCreateMode) {
            this.scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (!this.isManuallyExpanded && !this.isScrolled) {
                if (this.scrollTop === 0 && !this.isCardExpanded) {
                    // this.isCardExpanded = true;
                } else if (this.scrollTop > this.lastScrollTop && this.isCardExpanded) {
                    this.isScrolled = true;
                    this.isCardExpanded = false;
                }
                this.lastScrollTop = this.scrollTop <= 0 ? 0 : this.scrollTop;
                this.emitDisclosureHeaderResize(false);
                setTimeout(() => {
                    this.isScrolled = false;
                }, 50);
            }
        }
    }

    constructor(public router: Router,
        public commonService: CommonService,
        private _elasticConfigService: ElasticConfigService,
        public coiService: CoiService,
        public location: Location,
        public autoSaveService: AutoSaveService,
        public dataStore: DataStoreService, public navigationService: NavigationService,
        private _activatedRoute: ActivatedRoute,
        private _projectRelationDataStore: DefineRelationshipDataStoreService,
        private _headerService: HeaderService,
        private _informationAndHelpTextService: InformationAndHelpTextService,
        private sanitizer: DomSanitizer) {
        window.scrollTo(0, 0);
        this.isCreateMode = this.router.url.includes('create-disclosure');
        this.isCreateModeTabsVisible = DISCLOSURE_CREATE_MODE_PATHS.some(path => this.router.url.includes(path));
        this.setStepFirstTime(this.router.url);
        this.$subscriptions.push(this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.isCreateMode = event.url.includes('create-disclosure');
            }
        }));
    }

    ngOnInit(): void {
        this.listenGlobalEventNotifier();
        this.listenScreenSize();
        this.isCardExpanded = !this.isCreateMode;
        this.personElasticOptions = this._elasticConfigService.getElasticForPerson();
        this.coiService.isCOIAdministrator = this.commonService.getAvailableRight(['MANAGE_FCOI_DISCLOSURE', 'MANAGE_PROJECT_DISCLOSURE']);
        this.setDisclosureTabActive(this.router.url);
        this.getDataFromStore();
        this.getProjectRelationData();
        this.openValidationModal();
        this.updateWithDrawRequest(this.coiData.coiDisclosure.withdrawalRequested);
        this.listenDataChangeFromStore();
        this.listenDataChangeFromRelationStore();
        this.checkAttachmentRight();
        this.prevURL = this.navigationService.previousURL;
        this.setPersonProjectDetails();
        this.listenQueryParamsChanges();
        this.triggerValidationModalOpen();
        this.updateStepsNavBtnConfig();
        this.fetchWorkFlowDetails();
        this.setDisclosureCertificationText(this.certificationSectionDetails.SUB_SECTION_ID, this.certificationSectionDetails.ELEMENT_ID);
        this.checkForFailedProjectSync();
        this.listenToOpenBypassModal();
        if (!this.navigationService.navigationGuardUrl.includes(USER_DASHBOARD_CHILD_ROUTE_URLS.MY_PROJECTS_ROUTE_URL)) {
            this._headerService.triggerProjectsTabCount();
        }
        this.openModalBasedOnActions();
    }

    private checkForFailedProjectSync(): void {
        if (this.isCreateMode) {
            this.$subscriptions.push(this.coiService.checkForFailedProjectsSync(this.coiData?.coiDisclosure?.personId).subscribe());
        }
    }

    ngOnDestroy(): void {
        this.dataStore.dataChanged = false;
        this.coiService.isCOIAdministrator = false;
        this.coiService.isOpenEngagementCreateSlider = false;
        this.commonService.clearReviewCommentsSlider();
        this.coiService.FCOICertificationText = '';
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                switch (event?.uniqueId) {
                    case 'TRIGGER_DISCLOSURE_CERTIFY_MODAL':
                        this.checkQuestionnaireCompletedBeforeCertify();
                        break;
                    case COI_REVIEW_COMMENTS_IDENTIFIER:
                        if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(EVENT_DATA?.action)) {
                            this.getCommentsCounts();
                            this.commonService.clearReviewCommentsSlider();
                        }
                        break;
                    case 'TRIGGER_ROUTER_NAVIGATION_END':
                        this.setStepFirstTime(this.router.url);
                        this.setDisclosureTabActive(this.router.url);
                        this.updateStepsNavBtnConfig();
                        break;
                    case 'ATTACHMENTS_COUNT_UPDATE':
                        this.disclosureAttachmentCountUpdate(EVENT_DATA);
                        break;
                    case 'TRIGGER_DISCLOSURE_REVIEW_COMPONENT':
                        if (EVENT_DATA?.disclosureType === 'FCOI') {
                            this.getCoiReview(EVENT_DATA?.actionType);
                        }
                        break;
                    case 'COI_VALIDATION_MODAL':
                        this.validationModalAction(event.content);
                        break;
                    case 'DOC_ACTION_STORAGE_EVENT':
                            this.openModalBasedOnActions();
                        break;
                    default: break;
                }
            })
        );
    }

    private validationModalAction(modalAction: any): void {
        switch (modalAction.modalAction.action) {
            case 'CLOSE_BTN':
            case 'CANCEL_BTN':
            case 'SECONDARY_BTN':
                this.commonService.closeCOIValidationModal();
                break;
            case 'PRIMARY_BTN':
                this.openApproveOrByPassModal();
                break;
            default: break;
        }
    }

    private triggerValidationModalOpen(): void {
        this.$subscriptions.push(this.dataStore.emitValidationModalOpen.subscribe((data: boolean) => {
            this.validationList = [...this.validationList];
            this.validationDockModalConfig.modalBodyMsg = this.coiData.coiDisclosure.withdrawalRequestReason;
            this.validationDockModalConfig.validationType = 'Recall Request';
            this.validationDockModalConfig.modalHeader = 'Recall Request';
            this.validationDockModalConfig.additionalBtns = ['Leave Page'];
        }));
    }

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            const DISCLOSURE_ID = params['disclosureId'];
            if (this.coiData?.coiDisclosure?.disclosureId) {
                if (!DISCLOSURE_ID) {
                    this.router.navigate([], { queryParams: { disclosureId: this.coiData.coiDisclosure.disclosureId },
                        queryParamsHandling: 'merge',
                    });
                } else if (this.coiData.coiDisclosure.disclosureId != DISCLOSURE_ID) {
                    this.loadDisclosureAndUpdateStore(DISCLOSURE_ID);
                }
            }
        }));
        this.setPersonProjectDetails();
    }

    private loadDisclosureAndUpdateStore(disclosureId: string): void {
        this.$subscriptions.push(this.coiService.loadDisclosure(disclosureId).subscribe((response: COI) => {
            if (response) {
            this.rerouteIfWrongPath(this.router.url, response.coiDisclosure);
            this.updateDisclosureDataStore(response);
            this.triggerUrlParamChange(response);
            this.fetchWorkFlowDetails();
            const { COMPLETED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED } = DISCLOSURE_REVIEW_STATUS;
            if ([REVIEW_IN_PROGRESS, COMPLETED, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].includes(response.coiDisclosure?.coiReviewStatusType?.reviewStatusCode)) {
                this.coiService.triggerCoiReviewFetch('REFRESH');
            } 
            }
        }));
    }

    private fetchWorkFlowDetails(): void {
        if (this.isShowRouteLogTab && !this.router.url.includes(this.disclosureViewModeUrls.ROUTE_LOG)) {
            this.$subscriptions.push(
                this.coiService.fetchWorkFlowDetails(COI_MODULE_CODE, this.coiData?.coiDisclosure?.disclosureId)
                    .subscribe((workFlowResult: any) => {
                        workFlowResult.coiDisclosure = this.coiData?.coiDisclosure;
                        this.dataStore.updateStore(['workFlowResult'], { workFlowResult });
                    }, (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching route log.');
                    }));
        }
    }

    private updateDisclosureDataStore(coiData: COI) {
        this.dataStore.setStoreData(coiData);
        this.dataStore.updateStore(['coiDisclosure'], coiData);
    }

    private triggerUrlParamChange(coiData: COI): void {
        setTimeout(() => {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_DISCLOSURE_PARAM_CHANGE', content: { coiData: coiData, disclosureType: 'FCOI' } });
        });
    }

    private rerouteIfWrongPath(currentPath: string, coiDisclosure: CoiDisclosure): void {
        const { reviewStatusCode, personId, dispositionStatusCode, isNewEngagementAdded, disclosureId } = coiDisclosure;
        const IS_DISCLOSURE_VOID = dispositionStatusCode === '2';
        const IS_CREATE_URL = currentPath.includes('create-disclosure');
        const IS_READY_FOR_REVIEW = !['1', '5', '6'].includes(reviewStatusCode);
        const IS_CREATE_PERSON = personId === this.commonService.getCurrentUserDetail('personID');
        let reRoutePath;

        if (!IS_CREATE_URL && !IS_READY_FOR_REVIEW && IS_CREATE_PERSON && !IS_DISCLOSURE_VOID && !isNewEngagementAdded) {
            reRoutePath = CREATE_DISCLOSURE_ROUTE_URL;
        }
        if (currentPath.includes(this.disclosureViewModeUrls.ROUTE_LOG) && !this.isShowRouteLogTab) {
            reRoutePath = POST_CREATE_DISCLOSURE_ROUTE_URL;
        }
        if (IS_CREATE_URL && (isNewEngagementAdded || IS_READY_FOR_REVIEW || IS_DISCLOSURE_VOID || (!IS_READY_FOR_REVIEW && !IS_CREATE_PERSON))) {
            reRoutePath = POST_CREATE_DISCLOSURE_ROUTE_URL;
        }
        if (reRoutePath) {
          this.router.navigate([reRoutePath], { queryParams: { disclosureId: disclosureId } });
        }
    }

    private getCommentsCounts(): void{
        this.disclosureCommentsCountRO.projects = this.getDisclosureProjectList();
        this.disclosureCommentsCountRO.moduleCode = COI_MODULE_CODE;
        this.disclosureCommentsCountRO.documentOwnerPersonId = this.coiData.coiDisclosure.person.personId;
        this.disclosureCommentsCountRO.moduleItemKey = this.coiData.coiDisclosure.disclosureId;
        this.$subscriptions.push(
            this.commonService.getDisclosureCommentsCount(this.disclosureCommentsCountRO).subscribe((response: DisclosureCommentsCounts) => {
                this.dataStore.updateStore(['disclosureCommentsCount'], { disclosureCommentsCount: response });
            },
            (_err) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            })
        );
    }

    private checkAttachmentRight(): void {
        const CURRENT_USER_ID = this.commonService.getCurrentUserDetail('personID');
        const DISCLOSURE_CREATOR_ID = this.coiData.coiDisclosure.person.personId;
        this.canShowAttachmentTab = CURRENT_USER_ID === DISCLOSURE_CREATOR_ID || this.commonService.isCoiReviewer ||
            this.commonService.getAvailableRight(['MANAGE_DISCLOSURE_ATTACHMENT', 'VIEW_DISCLOSURE_ATTACHMENT']);
    }

    private emitDisclosureHeaderResize(isResize: boolean): void {
        setTimeout(() => {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'COI_DISCLOSURE_HEADER_RESIZE', content: { isCardExpanded: this.isCardExpanded, isResize: isResize } });
        });
    }

    private getDisclosureProjectList(): Projects[] {
        const SINGLE_DISCLOSURE_PROJECT = this.getDisclosureProject();
        if (SINGLE_DISCLOSURE_PROJECT) {
            return SINGLE_DISCLOSURE_PROJECT;
        }
        return this.getFcoiProjectList();
    }

    private getDisclosureProject(): Projects[] {
        const PROJECT_DISCLOSURE_DETAILS = this.coiData?.projectDetail;
        if (PROJECT_DISCLOSURE_DETAILS?.projectNumber || PROJECT_DISCLOSURE_DETAILS?.documentNumber) {
            return [{
                projectNumber: String(PROJECT_DISCLOSURE_DETAILS.projectNumber || PROJECT_DISCLOSURE_DETAILS.documentNumber),
                projectModuleCode: Number(PROJECT_DISCLOSURE_DETAILS.moduleCode)
            }];
        }
        return null;
    }

    private getFcoiProjectList(): Projects[] {
        const FCOI_PROJECT_DETAILS = Array.isArray(this.projectRelationshipData) ? this.projectRelationshipData : [];
        return FCOI_PROJECT_DETAILS
            .filter(project => project?.projectNumber || project?.documentNumber)
            .map(project => ({
                projectNumber: String(project.projectNumber || project.documentNumber),
                projectModuleCode: Number(project.moduleCode)
            }));
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._projectRelationDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes?.projectId === 'ALL' && changes?.personEntityId === 'ALL' && changes?.searchChanged && !changes?.updatedKeys.length) {
                    this.loadProjectRelationsFromStore();
                }
            })
        );
    }

    private getProjectRelationData(): void {
        if (this.isCreateMode) {
            if (this.router.url.includes('create-disclosure/relationship')) {
                this.loadProjectRelationsFromStore();
            } else {
                this.loadProjectRelationsFromApi();
            }
        }
    }

    private loadProjectRelationsFromApi(): void {
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: this.coiData.coiDisclosure.person.personId,
            disclosureId: this.coiData.coiDisclosure.disclosureId,
            disclosureNumber: this.coiData.coiDisclosure.disclosureNumber,
            dispositionStatusCode: this.coiData.coiDisclosure.dispositionStatusCode
        };
        this.$subscriptions.push(this.commonService.getProjectRelations(PROJECT_SFI_RELATION).subscribe((data: ProjectSfiRelations) => {
            this.projectRelationshipData = data;
            this.getCommentsCounts();
        },
        (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private loadProjectRelationsFromStore(): void {
        this.projectRelationshipData = this._projectRelationDataStore.getActualStoreData();
        this.getCommentsCounts();
    }

    private updateStepsNavBtnConfig(): void {
        this.coiService.stepsNavBtnConfig = new CoiStepsNavConfig();
        const IS_STEPS_URLS = DISCLOSURE_CREATE_MODE_PATHS.some(path => this.router.url.includes(path))
        if (IS_STEPS_URLS) {
            const CONFIG = this.coiService.stepsNavBtnConfig;
            CONFIG.previousBtnConfig.isShowBtn = true;
            CONFIG.proceedBtnConfig.isShowBtn = true;
             switch (this.currentStepNumber) {
                case 1:
                    this.disableCoiStepsNavBtn(CONFIG.previousBtnConfig);
                    break;
                case 2: break;
                case 3: break;
                case 4:
                    this.configureCertifyStep(CONFIG);
                    CONFIG.proceedBtnConfig.isShowBtn = false;
                    break;
                default:
                    CONFIG.previousBtnConfig.isShowBtn = false;
                    CONFIG.proceedBtnConfig.isShowBtn = false;
                    break;
            }
        }
    }

    private disableCoiStepsNavBtn(config: CoiStepsNavBtnConfig): void {
        config.isDisabled = true;
        config.title = 'The button is disabled';
        config.ariaLabel = config.title;
    }

    private configureCertifyStep(config: CoiStepsNavConfig): void {
        this.disableCoiStepsNavBtn(config.proceedBtnConfig);
        config.primaryBtnConfig = {
            btnName: 'Submit',
            matIcon: 'done',
            ariaLabel: this.coiService.isCertified ? 'Click here to submit disclosure' : 'Please certify to submit disclosure',
            title: this.coiService.isCertified ? 'Click here to submit disclosure' : 'Please certify to submit disclosure',
            isDisabled: !this.coiService.isCertified,
            isShowBtn: true,
            actionType: 'SUBMIT'
        };
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    // This function retrieves the certification terms and conditions message dynamically from the database from the table dyn_element_config, making it configurable.
    private setDisclosureCertificationText(subsectionId: string | number, elementId: string): void {
        const RAW_CONTENT = this._informationAndHelpTextService.getInFormationText(subsectionId, elementId);
        if (RAW_CONTENT?.trim()) {
            const ENTIRE_CERTIFICATION_TEXT = sanitizeHtml(RAW_CONTENT);
            this.coiService.FCOICertificationText = this.sanitizer.bypassSecurityTrustHtml(ENTIRE_CERTIFICATION_TEXT);
        }
    }

    private disclosureAttachmentCountUpdate(eventData: any): void {
        this.coiData.coiDisclosure.disclosureAttachmentsCount = eventData?.attachmentsCount;
        this.dataStore.updateStore(['coiDisclosure'], { coiDisclosure: this.coiData.coiDisclosure });
    }

    setStepFirstTime(currentUrl) {
        if (currentUrl.includes('create-disclosure/screening')) {
            this.currentStepNumber = 1;
        } else if (currentUrl.includes('create-disclosure/sfi')) {
            this.currentStepNumber = 2;
        } else if (currentUrl.includes('create-disclosure/relationship')) {
            this.currentStepNumber = 3;
        } else if (currentUrl.includes('create-disclosure/certification')) {
            this.currentStepNumber = 4;
        }
    }

    private setDisclosureTabActive(currentUrl: string): void {
        this.isDisclosureTabActive = DISCLOSURE_CREATE_MODE_PATHS.some(path => currentUrl.includes(path)) || currentUrl.includes('disclosure/summary');
    }

    goToStep(stepPosition?: any) {
        if (this.coiService.isRelationshipSaving) { return; }
        this.isHomePageClicked = false;
        if (this.dataStore.dataChanged) {
            this.tempStepNumber = stepPosition ? stepPosition : this.currentStepNumber + 1;
             openCommonModal('disclosure-unsaved-changes-modal');
        } else {
            if (!stepPosition && this.currentStepNumber === 4) {
                return;
            }
            this.currentStepNumber = stepPosition ? stepPosition : this.currentStepNumber + 1;
            this.navigateToStep();
        }
        this.setFocus('step_'+stepPosition);
    }

    leavePageClicked() {
        this.dataStore.dataChanged = false;
        this.coiService.unSavedModules = '';
        this.commonService.hasChangesAvailable = false;
        this.currentStepNumber = this.tempStepNumber;
        !this.isHomePageClicked ? this.navigateToStep() : this.router.navigate(['/coi/user-dashboard']);
    }

    stayOnPageClicked() {
        this.commonService.attemptedPath = '';
        this.commonService.isNavigationStopped = false;
    }

    isRouteComplete(possibleActiveRoutes: string[] = []) {
        return possibleActiveRoutes.some(paths => this.router.url.includes(paths));
    }

    private getDisclosureTitleName(fcoiTypeCode: string | number): string {
        const { coiDisclosureFcoiType, coiProjectType} = this.coiData?.coiDisclosure;
        return fcoiTypeCode?.toString() == DISCLOSURE_TYPE.PROJECT.toString()
            ? COMMON_DISCL_LOCALIZE.TERM_COI + ' ' + coiProjectType?.description
            : COMMON_DISCL_LOCALIZE.TERM_COI + ' ' + coiDisclosureFcoiType?.description;
    }

    navigateToStep() {
        let nextStepUrl = '';
        this.isHomePageClicked = false;
        switch (this.currentStepNumber) {
            case 1:
                nextStepUrl = '/coi/create-disclosure/screening';
                this.router.navigate([nextStepUrl], { queryParamsHandling: 'preserve' });
                this.tempStepNumber = null;
                break;
            case 2:
                nextStepUrl = '/coi/create-disclosure/sfi';
                this.router.navigate([nextStepUrl], { queryParamsHandling: 'preserve' });
                this.tempStepNumber = null;
                break;
            case 3:
                nextStepUrl = CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL;
                this.router.navigate([nextStepUrl], { queryParamsHandling: 'preserve' });
                this.tempStepNumber = null;
                break;
            case 4:
                nextStepUrl = '/coi/create-disclosure/certification';
                this.router.navigate([nextStepUrl], { queryParamsHandling: 'preserve' });
                this.tempStepNumber = null;
                break;
            default:
                nextStepUrl = this.navigationService.navigationGuardUrl;
                this.router.navigateByUrl(this.navigationService.navigationGuardUrl);
                this.tempStepNumber = null;
                break;
        }
    }

    checkQuestionnaireCompletedBeforeCertify() {
        this.coiService.submitResponseErrors = [];
        if (!this.isSaving) {
            this.isSaving = true;
            this.coiService.getApplicableQuestionnaire(this.getApplicationQuestionnaireRO())
                .subscribe((res: getApplicableQuestionnaireData) => {
                    this.checkQuestionnaireCompleted(res);
                }, _err => {
                    this.isSaving = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                });
        }
    }

    checkQuestionnaireCompleted(res) {
        let errorArray = certifyIfQuestionnaireCompleted(res);
        if(errorArray && errorArray.length) {
            errorArray.forEach(ele => this.coiService.submitResponseErrors.push(ele));
        }
        this.validateRelationship();
    }

    getApplicationQuestionnaireRO() {
        return {
            'moduleItemCode': 8,
            'moduleSubItemCode': 0,
            'moduleSubItemKey': 0,
            'moduleItemKey': this.coiData.coiDisclosure.disclosureId,
            'actionUserId': this.commonService.getCurrentUserDetail('personID'),
            'actionPersonName': this.commonService.getCurrentUserDetail('fullName'),
            'questionnaireMode': 'ACTIVE_ANSWERED_UNANSWERED'
        };
    }

    certifyDisclosure() {
        const REQUESTREPORTDATA: CertifyDisclosureRO = {
            disclosureId: this.coiData.coiDisclosure.disclosureId,
            certificationText: this.coiData.coiDisclosure.certificationText ? this.coiData.coiDisclosure.certificationText : this.certificationText,
            conflictStatusCode: this.dataStore.disclosureStatus
        };
        this.$subscriptions.push(this.coiService.certifyDisclosure(REQUESTREPORTDATA).subscribe((res: any) => {
            this.dataStore.dataChanged = false;
            this.dataStore.updateStore(['coiDisclosure'], { coiDisclosure: res });
            this.isSaving = false;
            this.addHistory();
            // this.coiService.addAwardCompletionHistory(this.coiData.coiDisclosure.disclosureId);
            this.router.navigate([POST_CREATE_DISCLOSURE_ROUTE_URL], { queryParamsHandling: 'preserve' });
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Disclosure Submitted Successfully.');
            this.coiService.submitResponseErrors = [];
        }, err => {
            this.isSaving = false;
            if (err.status === 405) {
            hideModal('confirmModal');
            this.coiService.submitResponseErrors = [];
            this.coiService.concurrentUpdateAction = 'Submit Disclosure';
          } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error In Certifying Disclosure.');
          }
        }));
    }

    addHistory() {
        this.$subscriptions.push(this.coiService.addAwardCompletionHistory(this.coiData.coiDisclosure.disclosureId).subscribe((data) => {
        }));
    }

    validateRelationship() {
        const EVALUATE_VALIDATION_RO: EvaluateValidationRO = this.coiService.getEvaluateValidationRO(this.coiData?.coiDisclosure);
        this.$subscriptions.push(
            this.coiService.evaluateValidation(EVALUATE_VALIDATION_RO)
            .subscribe((res: any) => {
                res.map((error) => {
                    this.coiService.submitResponseErrors.push( error) ;
                });
                this.getSfiDetails();
            }, err => {
                this.isSaving = false;
                if (err.status === 405) {
                    this.coiService.concurrentUpdateAction = 'Submit Disclosure';
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            }));
    }
    private getDataFromStore() {
        const coiData = this.dataStore.getData();
        if (isEmptyObject(coiData)) { return; }
        this.coiData = coiData;
        this.isDisclosureOwner = this.coiData.coiDisclosure.personId === this.commonService.getCurrentUserDetail('personID');
        this.setAdminGroupOptions();
        this.setAssignAdminModalDetails();
        this.canShowWithdrawRequestBtn = this.getCanShowWithdrawRequestBtn();
        this.checkForTabVisibility();
        this.checkForActionButtonsVisibility();
        this.checkForPersonLinkVisibility();
        this.reviewSliderConfig.isDisclosureOwner = this.isDisclosureOwner;
        if(this.coiData.coiDisclosure) {
            this.fcoiTypeCode = this.coiData.coiDisclosure.coiDisclosureFcoiType?.fcoiTypeCode?.toString();
            this.coiProjectTypeCode = this.coiData.coiDisclosure.coiProjectType?.coiProjectTypeCode?.toString();
            this.disclosureTitle = this.getDisclosureTitleName(this.fcoiTypeCode);
            const DISCLOSURE_TEXT = this.fcoiTypeCode != DISCLOSURE_TYPE.REVISION ? ' disclosure.' : '.';
            this.submitHelpTexts = 'You are about to submit the ' + this.disclosureTitle + DISCLOSURE_TEXT;
            this.returnModalHelpText = 'You are about to return the ' + this.disclosureTitle + DISCLOSURE_TEXT;
            this.withdrawModalHelpText = 'You are about to Recall the ' + this.disclosureTitle + DISCLOSURE_TEXT;
            this.withdrawRequestModalHelpText = 'You are about to request Recall of the ' + this.disclosureTitle + DISCLOSURE_TEXT;
            this.denyModalHelpText = 'You are about to deny the Request to Recall of the ' + this.disclosureTitle + DISCLOSURE_TEXT;
        }
        this.rerouteIfWrongPath(this.router.url, this.coiData.coiDisclosure);
    }
    
    private checkForPersonLinkVisibility(): void {
        const IS_REVIEWER = this.coiData.coiReviewerList?.some(reviewer => reviewer.assigneePersonId === this.commonService.getCurrentUserDetail('personID')) || false;
        this.canShowNotesLink = this.commonService.canShowReporterNotes && (this.isDisclosureOwner || this.commonService.getAvailableRight(DISCLOSURE_NOTES_RIGHT));
        this.isShowOverAllHistory = this.isDisclosureOwner || this.canShowReviewerTab || this.commonService.getAvailableRight(FCOI_PROJECT_DISCLOSURE_RIGHTS) || IS_REVIEWER;
    } 

    private checkForTabVisibility(): void {
        const { PENDING, ROUTING_IN_PROGRESS, WITHDRAWN, RETURNED, SUBMITTED } = DISCLOSURE_REVIEW_STATUS;
        const REVIEW_STATUS_CODE = this.coiData.coiDisclosure?.coiReviewStatusType?.reviewStatusCode?.toString();
        const HAS_REVIEW_TAB_RIGHTS = this.commonService.getAvailableRight(['MANAGE_DISCLOSURE_REVIEW', 'VIEW_DISCLOSURE_REVIEW']);
        const IS_FLOW_ELIGIBLE = this.commonService.opaApprovalFlowType !== 'NO_REVIEW';
        this.isShowRouteLogTab = REVIEW_STATUS_CODE !== PENDING.toString() &&
            (['ROUTING_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.coiApprovalFlowType));
        this.isShowAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.coiApprovalFlowType);
        this.canShowReviewerTab = (HAS_REVIEW_TAB_RIGHTS || this.coiService.isCOIAdministrator || this.commonService.isCoiReviewer) && !this.isCreateMode &&
            ![PENDING, ROUTING_IN_PROGRESS, WITHDRAWN, RETURNED, SUBMITTED].map(status => status.toString()).includes(REVIEW_STATUS_CODE) && IS_FLOW_ELIGIBLE;
    }
    private canShowAddNoteButton(): void {
        const MANAGE_DISCLOSURE_NOTES = this.commonService.getAvailableRight('MANAGE_DISCLOSURE_NOTES');
        const IS_DISCLOSURE_ADMIN = this.commonService.getCurrentUserDetail('personID') === this.coiData?.coiDisclosure?.adminPersonId;
        const IS_PENDING_REVIEWER = (this.coiData?.coiDisclosure?.coiReviewStatusType?.reviewStatusCode === DISCLOSURE_REVIEW_STATUS.REVIEW_ASSIGNED && (this.coiService.isStartReview || this.coiService.isCompleteReview));
        const IS_DISCLOSURE_COMPLETED = this.coiData?.coiDisclosure?.coiReviewStatusType?.reviewStatusCode === DISCLOSURE_REVIEW_STATUS.COMPLETED;
        this.canShowAddNoteBtn = (!this.isDisclosureOwner || IS_DISCLOSURE_ADMIN || this.getManageDisclosureRight() || IS_PENDING_REVIEWER) && !IS_DISCLOSURE_COMPLETED && MANAGE_DISCLOSURE_NOTES;
    }
    private canShowEngagementRisk(): void {
        const LOGGED_PERSON_ID = this.commonService.getCurrentUserDetail('personID');
        const IS_DISCLOSURE_ADMIN = LOGGED_PERSON_ID === this.coiData?.coiDisclosure?.adminPersonId;
        const IS_DISCLOSURE_REVIEWER = this.coiData?.coiReviewerList?.some(ele => ele?.assigneePersonId === LOGGED_PERSON_ID) || false;
        this.dataStore.isShowEngagementRisk = IS_DISCLOSURE_ADMIN || IS_DISCLOSURE_REVIEWER;
    }

    handleFCOICreation(fcoiType: FcoiType): void {
        this._headerService.triggerFCOICreation(fcoiType);
    }

    checkReviseButtonVisibility(): boolean {
        const { coiReviewStatusType, personId, versionStatus } = this.coiData.coiDisclosure || {};
        const IS_COMPLETED = coiReviewStatusType?.reviewStatusCode === DISCLOSURE_REVIEW_STATUS.COMPLETED;
        const IS_CREATOR = this.commonService.getCurrentUserDetail('personID') === personId;
        const IS_ACTIVE = versionStatus === 'ACTIVE';
        return IS_COMPLETED && IS_ACTIVE && IS_CREATOR && this.fcoiTypeCode !== DISCLOSURE_TYPE.PROJECT;
    }

    getCanShowWithdrawRequestBtn(): boolean {
        return (this.isDisclosureOwner) &&
        ([DISCLOSURE_REVIEW_STATUS.REVIEW_ASSIGNED, DISCLOSURE_REVIEW_STATUS.ASSIGNED_REVIEW_COMPLETED, DISCLOSURE_REVIEW_STATUS.REVIEW_IN_PROGRESS].includes(this.coiData.coiDisclosure.reviewStatusCode));
    }

    openValidationModal() {
        this.validationList = [];
        if (this.coiData.coiDisclosure.withdrawalRequested && this.commonService.getCurrentUserDetail('personID') === this.coiData.coiDisclosure.adminPersonId) {
            this.validationList.push('A request for recall has been submitted for this disclosure. Please return the disclosure or take any necessary actions before continuing.');
            this.validationDockModalConfig.modalBodyMsg = this.coiData.coiDisclosure.withdrawalRequestReason;
            this.validationDockModalConfig.validationType = 'Recall Request';
            this.validationDockModalConfig.modalHeader = 'Request to Recall';
            this.validationDockModalConfig.modalConfiguration.namings.primaryBtnName = 'Return';
            this.validationDockModalConfig.modalConfiguration.namings.secondaryBtnName = 'Deny';
        } else if (this.coiData.coiDisclosure.withdrawalRequested && ![this.coiData.coiDisclosure.adminPersonId, this.coiData.coiDisclosure.personId].includes(this.commonService.getCurrentUserDetail('personID'))) {
            this.validationList.push('A Recall request has been submitted for this disclosure.');
            this.validationDockModalConfig.modalConfiguration.namings.primaryBtnName = '';
            this.validationDockModalConfig.modalConfiguration.namings.secondaryBtnName = '';
            this.validationDockModalConfig.modalHeader = 'Request to Recall';
            this.validationDockModalConfig.validationType = 'Recall Request';
            this.validationDockModalConfig.modalBodyMsg = '';
        }
    }

    changeDataStoreRisk(event) {
        this.coiData.coiDisclosure.riskCategoryCode = event.riskCategoryCode;
        this.coiData.coiDisclosure.coiRiskCategory = event.riskCategory;
        this.dataStore.updateStore(['coiDisclosure'], { coiDisclosure: this.coiData.coiDisclosure });
    }

    openAddAssignModal(): void {
        this.isAddAssignModalOpen = true;
        this.setAssignAdminModalDetails();
    }

    private setAssignAdminModalDetails(): void {
        this.defaultAdminDetails.adminGroupId = this.coiData.coiDisclosure.adminGroupId;
        this.defaultAdminDetails.adminGroupName = this.coiData.coiDisclosure.adminGroupName;
        this.defaultAdminDetails.adminPersonId = this.coiData.coiDisclosure.adminPersonId;
        this.defaultAdminDetails.adminPersonName = this.coiData.coiDisclosure.adminPersonName;
    }

    completeDisclosureReview(): void {
        const RO: DisclosureCompleteFinalReviewRO = {
            disclosureId: this.coiData?.coiDisclosure?.disclosureId,
            disclosureNumber: this.coiData?.coiDisclosure?.disclosureNumber,
            description: this.reviewDescription
        };
        this.$subscriptions.push(
            this.coiService.completeDisclosureReview(RO)
            .subscribe((res: any) => {
                this.updateDisclosureReviewStatus(res);
                this.commonService.showToast(HTTP_SUCCESS_STATUS, `Review completed successfully.`);
            }, _err => {
                if (_err.status === 405) {
                    hideModal('completeReviewModalFromDashboard');
                    this.coiService.concurrentUpdateAction = 'Complete Review';
                } else {
                if (_err.error.text === 'REVIEW_STATUS_NOT_COMPLETE') {
                    document.getElementById('reviewPendingCompleteReviewErrorModalTrigger').click();
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in completing review.`);
                }
            }
            }));
        this.clearCompleteReviewModal();
    }

    clearCompleteReviewModal(): void {
        this.reviewDescription = '';
    }

    private updateDisclosureReviewStatus(res: any): void {
        this.coiData.coiDisclosure = deepCloneObject(res);
        this.dataStore.updateStore(['coiDisclosure'],  { coiDisclosure: this.coiData.coiDisclosure });
        this.router.navigate([POST_CREATE_DISCLOSURE_ROUTE_URL], { queryParamsHandling: 'preserve' });
    }

    private validateAssignReviewerAction() {
        this.assignReviewerActionValidation.clear();
        if (!this.assignReviewerActionDetails.assigneePersonId && !this.assignReviewerActionDetails.adminGroupId) {
            this.assignReviewerActionValidation.set('reviewer', 'Please select an admin group or assignee.');
        }
        return this.assignReviewerActionValidation.size === 0;
    }

    saveOrUpdateCoiReview() {
        if (this.validateAssignReviewerAction()) {
            this.assignReviewerActionDetails.disclosureId = this.coiData.coiDisclosure.disclosureId;
            this.$subscriptions.push(this.coiService
                .saveOrUpdateCoiReview({ coiReview: this.assignReviewerActionDetails }).subscribe((res: any) => {
                    this.assignReviewerActionDetails = {};
                    this.triggerAssignReviewerModal();
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, `Review added successfully.`);
                }, _err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in adding review.`);
                }));
        }
    }

    adminGroupSelect(event: any): void {
        this.assignReviewerActionDetails.adminGroupId = event ? event.adminGroupId : null;
        this.assignReviewerActionDetails.adminGroup = event ? event : null;
    }

    assigneeSelect(event: any): void {
        this.assignReviewerActionDetails.assigneePersonId = event ? event.prncpl_id : null;
        this.assignReviewerActionDetails.assigneePersonName = event ? event.full_name : null;
    }

    private setAdminGroupOptions(): void {
        this.adminGroupsCompleterOptions = {
            arrayList: this.getActiveAdminGroups(),
            contextField: 'adminGroupName',
            filterFields: 'adminGroupName',
            formatString: 'adminGroupName',
            defaultValue: ''
        };
    }

    private getActiveAdminGroups() {
        return this.coiData.adminGroup && this.coiData.adminGroup.filter(element => element.isActive === 'Y') || [];
    }

    triggerAssignReviewerModal() {
        this.assignReviewerActionDetails = {};
        this.assignReviewerActionValidation.clear();
        this.assigneeClearField = new String('true');
        this.categoryClearFiled = new String('true');
        const isReviewTab = this.router.url.includes('disclosure/review');
        document.getElementById(isReviewTab ?
            ADD_REVIEW_MODAL_ID : 'assign-reviewer-modal-trigger').click();
    }

    // currently this fuction is not using. It is for future
    openCountModal(moduleCode: number, count = 0): void {
        if (count > 0) {
            const { person, coiDisclosureFcoiType, coiProjectType, disclosureId } = this.coiData?.coiDisclosure;
            this.coiCountModal = {
                moduleCode: moduleCode,
                personUnit: person?.unit,
                personId: person?.personId,
                disclosureId: disclosureId,
                inputType: 'DISCLOSURE_TAB',
                personFullName: person?.fullName,
                fcoiTypeCode: this.fcoiTypeCode,
                disclosureType: this.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT
                    ? COMMON_DISCL_LOCALIZE.PROJECT_BADGE_PREFIX + coiProjectType?.description
                    : COMMON_DISCL_LOCALIZE.ANNUAL_BADGE_PREFIX + coiDisclosureFcoiType?.description,
                isOpenCountModal: true
            };
        }
    }

    openPersonDetailsModal(coiData: any): void {
        this.commonService.openPersonDetailsModal(coiData.coiDisclosure.person.personId)
    }

    reRouteAfterReturn() {
        if(this.dataStore.attemptedPath) {
            this.router.navigateByUrl(this.dataStore.attemptedPath);
        } else {
            let  reRouteUrl= '';
            reRouteUrl = this.isDisclosureOwner ? REPORTER_HOME_URL : ADMIN_DASHBOARD_URL;
            this.router.navigate([reRouteUrl]);
        }
    }

    goBackInEditMode() {
        this.isHomePageClicked = true;
        if (this.dataStore.dataChanged) {
           openCommonModal('disclosure-unsaved-changes-modal');
        } else {
            this.router.navigate(['/coi/user-dashboard']);
        }
    }

    closeAssignAdministratorModal(event) {
        if (event && (event.adminPersonId || event.adminGroupId)) {
            this.coiData.coiDisclosure.adminPersonId = event.adminPersonId;
            this.coiData.coiDisclosure.adminPersonName = event.adminPersonName;
            this.coiData.coiDisclosure.adminGroupId = event.adminGroupId;
            this.coiData.coiDisclosure.adminGroupName = event.adminGroupName;
            this.coiData.coiDisclosure.coiReviewStatusType.reviewStatusCode = event.reviewStatusCode;
            this.coiData.coiDisclosure.coiReviewStatusType.description = event.reviewStatus;
            this.coiData.coiDisclosure.reviewStatusCode = event.reviewStatusCode;
            this.coiData.coiDisclosure.updateTimestamp = event.updateTimestamp;
            this.coiService.triggerCoiReviewFetch('ASSIGN_ADMIN');
            this.openValidationModal();
            this.dataStore.updateStore(['coiDisclosure'], this.coiData);
        }
        this.isAddAssignModalOpen = false;
    }

    getCoiReview(actionType: DisclosureReviewFetchType): void {
        this.$subscriptions.push(
            this.coiService.getCoiReview(this.coiData.coiDisclosure.disclosureId, this.coiData.coiDisclosure.dispositionStatusCode).subscribe((data: any) => {
                this.coiService.isReviewActionCompleted = this.coiService.isAllReviewsCompleted(data);
                if (actionType === 'REFRESH' || 'REVIEWER_TAB_CLICKED') {
                    this.dataStore.updateStore(['coiReviewerList'], { coiReviewerList: data });
                    const REVIEWER_DETAILS = this.getLoggedInReviewerInfo(data);
                    if (REVIEWER_DETAILS) {
                        this.coiService.isStartReview = REVIEWER_DETAILS.reviewStatusTypeCode?.toString() === FCOI_REVIEWER_REVIEW_STATUS_TYPE.ASSIGNED?.toString();
                        this.coiService.isCompleteReview = REVIEWER_DETAILS.reviewStatusTypeCode?.toString() === FCOI_REVIEWER_REVIEW_STATUS_TYPE.IN_PROGRESS?.toString();
                        this.coiService.isDisclosureReviewer = true;
                        this.coiService.$SelectedReviewerDetails.next(REVIEWER_DETAILS);
                        this.coiService.currentReviewForAction = REVIEWER_DETAILS;
                    }
                }
                this.checkForActionButtonsVisibility();
            }, (error: any) => {
                this.router.navigate([this.coiService.previousHomeUrl]);
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching review details');
            }));
    }

    getLoggedInReviewerInfo(coiReviewerList: any[]): any {
        const REVIEWER_DETAILS = coiReviewerList?.find(item => item?.assigneePersonId === this.commonService.getCurrentUserDetail('personID') && item?.reviewStatusTypeCode?.toString() !== FCOI_REVIEWER_REVIEW_STATUS_TYPE.COMPLETED?.toString());
        return REVIEWER_DETAILS;
    }

    public updateCoiReview(modalType: ModalType) {
        const reviewerInfo = this.coiData.coiReviewerList.find(ele =>
            ele.assigneePersonId === this.commonService.getCurrentUserDetail('personID') && ele.reviewStatusTypeCode != '2');
        if (reviewerInfo) {
            this.coiService.$SelectedReviewerDetails.next(reviewerInfo);
            this.coiService.triggerStartOrCompleteCoiReview(modalType);
            this.coiService.isEnableReviewActionModal = true;
        }
    }

    errorCheck() {
        if (this.coiService.submitResponseErrors.length && this.coiService.submitResponseErrors.find(data => data.validationType == "VE")) {
            this.isSaving = false;
            openModal('ValidatedModal');
        } else {
            this.isSaving = false;
            openModal('confirmModal');
        }
    }

    getSfiDetails() {
        this.$subscriptions.push(this.commonService.fetchEachOrAllEngagements(this.getRequestObject()).subscribe((data: any) => {
            if (data) {
                this.count = data.count;
                this.errorCheck();
            }
        }, (_error: any) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    getRequestObject(): FetchEachOrAllEngagementsRO {
      const REQ_OBJ = new FetchEachOrAllEngagementsRO();
      REQ_OBJ.currentPage = 0;
      REQ_OBJ.disclosureId = this.coiData.coiDisclosure.disclosureId;
      REQ_OBJ.filterType = this.filterType;
      REQ_OBJ.pageNumber = 0;
      REQ_OBJ.personId = this.coiData.coiDisclosure.person.personId;
      REQ_OBJ.reviewStatusCode = this.coiData.coiDisclosure.reviewStatusCode;
      REQ_OBJ.searchWord = '';
      REQ_OBJ.sortType = '';
      REQ_OBJ.dispositionStatusCode = this.coiData.coiDisclosure.dispositionStatusCode;
      return REQ_OBJ;
    }

    withdrawDisclosure() {
        this.$subscriptions.push(this.coiService
            .withdrawDisclosure({
                disclosureId: this.coiData.coiDisclosure.disclosureId,
                description: this.description
            })
            .subscribe((res: any) => {
                this.coiData.coiDisclosure.coiReviewStatusType.reviewStatusCode = res.reviewStatusCode;
                this.coiData.coiDisclosure.coiReviewStatusType.description = res.reviewStatusDescription;
                this.coiData.coiDisclosure.reviewStatusCode = res.reviewStatusCode;
                this.router.navigate([CREATE_DISCLOSURE_ROUTE_URL],
                    { queryParams: { disclosureId: this.coiData.coiDisclosure.disclosureId } });
            }, _err => {
                if (_err.status === 405) {
                    this.closeConfirmationModal();
                    this.coiService.concurrentUpdateAction = 'Recall Disclosure';
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in Recalling disclosure.`);
                }
            }));
    }

    returnDisclosure() {
        this.$subscriptions.push(this.coiService
            .returnDisclosure({
                disclosureId: this.coiData.coiDisclosure.disclosureId,
                description: this.description
            })
            .subscribe((res: any) => {
                this.dataStore.isPendingWithdrawRequest = false;
                this.commonService.showToast(HTTP_SUCCESS_STATUS, `Disclosure returned successfully.`);
                this.reRouteAfterReturn();
            }, _err => {
                if (_err.status === 405) {
                    this.validationList = [];
                    this.closeConfirmationModal();
                    this.coiService.concurrentUpdateAction = 'Return Disclosure';
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in returning disclosure.`);
                }
            }));
    }

    openReturnDenyConfirmationModal(actionEvent: {actionName: 'Return'|'Deny'}) {
        if(actionEvent.actionName === 'Return') {
            this.openConfirmationModal('Return', this.returnHelpTexts, this.returnErrorMsg, this.returnModalHelpText);
        } else if(actionEvent.actionName === 'Deny') {
            this.openConfirmationModal('Deny', this.denyHelpTexts, this.denyErrorMsg, this.denyModalHelpText);
        } else if(actionEvent.actionName === 'Leave Page') {
            this.dataStore.isPendingWithdrawRequest = false;
            this.router.navigateByUrl(this.dataStore.attemptedPath);
        }
    }

    openConfirmationModal(actionBtnName: string, helpTexts: string = '', descriptionErrorMsg: string = '', modalHelpText: string = ''): void {
        this.primaryBtnName = actionBtnName;
        this.descriptionErrorMsg = descriptionErrorMsg;
        this.confirmationHelpTexts = '';
        this.helpTexts = '';
        setTimeout(() => {
            this.confirmationHelpTexts = modalHelpText;
            this.helpTexts = helpTexts;
            document.getElementById('disclosure-confirmation-modal-trigger-btn').click();
        });
        this.setPersonProjectDetails();
        switch(actionBtnName) {
            case 'Recall': {
                this.textAreaLabelName = 'Recall';
                break;
            }
            case COMMON_DISCL_LOCALIZE.TERM_REQUEST_RECALL: {
                this.textAreaLabelName = COMMON_DISCL_LOCALIZE.TERM_REQUEST_RECALL;
                break;
            }
            case 'Return': {
                this.textAreaLabelName = 'Return';
                break;
            }
            case 'Deny': {
                this.textAreaLabelName = 'denying the request to recall';
                break;
            }
        }
    }

    private setPersonProjectDetails(): void {
        this.personProjectDetails.personFullName = this.coiData?.coiDisclosure?.person?.fullName;
        this.personProjectDetails.projectDetails = this.coiData?.projectDetail;
        this.personProjectDetails.homeUnit = this.coiData?.coiDisclosure?.person?.unit?.unitNumber;
        this.personProjectDetails.homeUnitName = this.coiData?.coiDisclosure?.person?.unit?.unitName;
        this.personProjectDetails.personEmail = this.coiData?.coiDisclosure?.person?.emailAddress;
        this.personProjectDetails.personPrimaryTitle = this.coiData?.coiDisclosure?.person?.primaryTitle;
    }

    performDisclosureAction(event): void {
        this.description = event;
        switch (this.primaryBtnName) {
            case 'Return':
                return this.returnDisclosure();
            case 'Recall':
                return this.withdrawDisclosure();
            case COMMON_DISCL_LOCALIZE.TERM_REQUEST_RECALL:
                return this.withdrawRequestTrigger();
            case 'Deny':
                return this.denyWithdrawalRequest();
            default:
                return;
        }
    }

    postWorkFlowConfirmation(modalActions: ModalActionEvent): void {
        if (modalActions.action === 'PRIMARY_BTN') {
            this.approveOrRejectWorkflow();
        } else {
            this.closeWorkFlowModal();
        }
    }

    private approveOrRejectWorkflow(): void {
        this.setApproveOrRejectWorkflowRO();
        if (this.validateWorkFlowApproveReject()) {
            this.$subscriptions.push(
                this.coiService.approveOrRejectWorkflow(this.approveOrRejectWorkflowRO, this.WorkflowUploadedFiles)
                    .subscribe((res: any) => {
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, `COI ${ this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approved' : 'returned' } successfully.`);
                        if (this.approveOrRejectWorkflowRO.actionType === 'R') {
                            this.reRouteAfterReturn();
                        } else {
                            const WOK_FLOW_RESPONSE = this.coiService.workFlowResponse(res, this.coiData.workFlowResult, this.coiData.coiDisclosure);
                            this.dataStore.updateStore(['coiDisclosure', 'workFlowResult'], WOK_FLOW_RESPONSE);
                        }
                        this.closeWorkFlowModal();
                    }, (error: any) => {
                        if (error?.status === 405) {
                            closeCommonModal(this.workFlowConfirmModalId);
                            this.commonService.concurrentUpdateAction = this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approve COI disclosure' : 'return COI disclosure';
                        } else {
                            this.commonService.showToast(HTTP_ERROR_STATUS, `Error in ${ this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approving' : 'returning' } disclosure.`);
                        }
                    }));
        }
    }

    private closeWorkFlowModal(): void {
        closeCommonModal(this.workFlowConfirmModalId);
        const TIME_OUT = setTimeout(() => {
            this.approveOrRejectWorkflowRO = new COIApproveOrRejectWorkflowRO();
            this.workFlowConfirmModalConfig.namings.primaryBtnName = '';
            this.attachmentErrorMsg = null;
            this.WorkflowUploadedFiles = [];
            this.workFlowMandatoryList.clear();
            clearTimeout(TIME_OUT);
        }, 200);
    }

    private setApproveOrRejectWorkflowRO(): void {
        this.approveOrRejectWorkflowRO.coiDisclosureId = this.coiData.coiDisclosure.disclosureId;
        this.approveOrRejectWorkflowRO.coiDisclosureNumber = this.coiData.coiDisclosure.disclosureNumber;
        this.approveOrRejectWorkflowRO.personId = this.commonService.getCurrentUserDetail('personID');
        this.approveOrRejectWorkflowRO.workFlowPersonId = this.commonService.getCurrentUserDetail('personID');
        this.approveOrRejectWorkflowRO.updateUser = this.commonService.getCurrentUserDetail('userName');
        this.approveOrRejectWorkflowRO.approverStopNumber = null;
    }

    validateWorkFlowApproveReject(): boolean {
        this.workFlowMandatoryList.clear();
        this.approveOrRejectWorkflowRO.approveComment = this.approveOrRejectWorkflowRO.approveComment?.trim();
        if (!this.approveOrRejectWorkflowRO.approveComment) {
            this.workFlowMandatoryList.set('COMMENT', `Please enter the reason for ${this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approval' : 'return'}.`)
        }
        return this.workFlowMandatoryList.size === 0;
    }

     /**
     * @param  {} files
     * Check file duplication ,if no duplication insert it into an array
     */
    fileDrop(files: any): void {
        this.attachmentErrorMsg = null;
        let dupCount = 0;
        for (let index = 0; index < files?.length; index++) {
            if (this.WorkflowUploadedFiles.find(dupFile => dupFile?.name === files[index]?.name) != null) {
                dupCount = dupCount + 1;
                this.attachmentErrorMsg = '* ' + dupCount + ' File(s) already added';
            } else {
                this.WorkflowUploadedFiles.push(files[index]);
            }
        }
    }

    deleteFromUploadedFileList(index: number): void {
        this.WorkflowUploadedFiles.splice(index, 1);
        this.attachmentErrorMsg = null;
    }

    disapproveOPARouting(): void {
        this.approveOrRejectWorkflowRO.actionType = 'R';
        this.workFlowConfirmModalConfig.namings.primaryBtnName = 'Return';
        openCommonModal(this.workFlowConfirmModalId);
    }

    routingAction(action: 'APPROVE' | 'BYPASS'): void {
        this.validationAction = action;
        this.validateCOI();
    }

    private validateCOI(): void {
        if (this.dataStore.isRoutingReview && this.coiData.workFlowResult.isFinalApprovalPending) {
            this.$subscriptions.push(this.coiService.validateCOI(this.coiData.coiDisclosure.disclosureId).subscribe((data: any[]) => {
                (data?.length) ? this.openCreateConfirmationModal(data) : this.openApproveOrByPassModal();
            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in validating OPA.');
            }));
        } else {
            this.openApproveOrByPassModal();
        }
    }

    private openCreateConfirmationModal(validations): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'COI_VALIDATION_MODAL';
        CONFIG.errorMsgHeader = 'Attention';
        CONFIG.validationType = 'ACTIONABLE';
        CONFIG.errorList = validations?.filter(item => item.validationType === 'VE')?.map(item => item.validationMessage);
        CONFIG.warningList = validations?.filter(item => item.validationType === 'VW')?.map(item => item.validationMessage);
        if (!CONFIG.errorList.length) {
            CONFIG.modalConfig.namings.primaryBtnName = `Continue to ${this.validationAction === 'APPROVE' ? 'Approve' : 'Bypass'}`;
        }
        CONFIG.modalConfig.styleOptions.closeBtnClass = 'invisible';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private openApproveOrByPassModal(): void {
        this.commonService.closeCOIValidationModal();
        this.validationAction === 'APPROVE' ? this.approveCOIRouting() : this.coiService.$byPassValidationEvent.next({actiontype: 'OPEN_BYPASS_MODAL', content: this.routingBypassRO});
    }

    private approveCOIRouting(): void {
        this.approveOrRejectWorkflowRO.actionType = 'A';
        this.workFlowConfirmModalConfig.namings.primaryBtnName = 'Approve';
        openCommonModal(this.workFlowConfirmModalId);
    }

    private listenToOpenBypassModal(): void {
            this.validationAction = null;
            this.routingBypassRO = new RoutingBypassRO();
            this.$subscriptions.push(this.coiService.$byPassValidationEvent.subscribe((data: BypassValidateAction) => {
                if (data?.actiontype === 'BYPASS_STOP') {
                    this.routingBypassRO = data?.content;
                    this.routingAction('BYPASS');
                }
            }));
    }

    closeAction(event: string): void {
        if (event === 'close') {
            this.reopenValidationModal();
        }
    }

    reopenValidationModal(): void {
        if (this.validationList.length && ['Return', 'Deny'].includes(this.primaryBtnName) && this.coiData.coiDisclosure.withdrawalRequested) {
            this.validationList = [...this.validationList];
        }
    }

    private denyWithdrawalRequest(): void {
        this.$subscriptions.push(this.coiService.denyWithdrawRequest({
            disclosureId: this.coiData.coiDisclosure.disclosureId,
            description: this.description
        }).subscribe((data: any) => {
            this.validationList = [];
            this.updateWithDrawRequest(false);
            this.dataStore.attemptedPath = '';
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Disclosure Recall request denied successfully.');
            this.closeConfirmationModal();
        }, err => {
            if (err.status === 405) {
                this.closeConfirmationModal();
                this.validationList = [];
                this.coiService.concurrentUpdateAction = 'Deny Recall Disclosure';
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in denying disclosure Recall request.');
            }
        }
        ));
    }

    private updateWithDrawRequest(flag: boolean): void {
        this.coiData.coiDisclosure.withdrawalRequested = flag;
        this.dataStore.isPendingWithdrawRequest = this.coiData.coiDisclosure.withdrawalRequested && (this.commonService.getCurrentUserDetail('personID') === this.coiData.coiDisclosure.adminPersonId);
        this.dataStore.updateStore(['coiDisclosure'], { coiDisclosure: this.coiData.coiDisclosure });
    }

    private withdrawRequestTrigger(): void {
        this.$subscriptions.push(this.coiService.withdrawRequest({
            disclosureId: this.coiData.coiDisclosure.disclosureId,
            description: this.description
        }).subscribe((data: any) => {
            this.closeConfirmationModal();
            this.coiData.coiDisclosure.withdrawalRequestReason = this.description;
            this.updateWithDrawRequest(true);
            this.openValidationModal();
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Recall request send successfully.');
        }, _err => {
            if (_err.status === 405) {
                this.closeConfirmationModal();
                this.coiService.concurrentUpdateAction = 'Recall Disclosure';
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, `Error in Recalling disclosure.`);
            }
        }));
    }

    /**
     * Opens action modals based on document actions stored in  sessionStorage.
     */
    private openModalBasedOnActions(): void {
        this.documentAction = this._headerService.getDocActionStorageEvent();
        if (this.documentAction?.targetModule === 'FCOI_DISCLOSURE') {
            if (this.isShowWithdrawRequest && this.documentAction.action === 'REVISE') {
                this.openConfirmationModal(COMMON_DISCL_LOCALIZE.TERM_REQUEST_RECALL, this.withdrawRequestHelpTexts, this.withdrawRequestErrorMsg, this.withdrawModalHelpText);
            }
            if (this.isShowWithdrawDisclosure && this.documentAction.action === 'REVISE') {
                if (this.documentAction.isModalRequired) {
                    this.isActionAllowed('Recall', this.withdrawHelpTexts, this.withdrawErrorMsg, this.withdrawModalHelpText);
                } else {
                    this.withdrawDisclosure();
                }
            }
            this._headerService.removeDocActionStorageEvent();
        }
    }

    private closeConfirmationModal(): void {
        setTimeout(() => {
            this.description = '';
            this.documentAction = null;
        }, 200);
    }

    openRiskSlider() {
        this.$subscriptions.push(this.coiService.riskAlreadyModified({
            'riskCategoryCode': this.coiData.coiDisclosure.riskCategoryCode,
            'disclosureId': this.coiData.coiDisclosure.disclosureId
        }).subscribe((data: any) => {
            this.isOpenRiskSlider = true;
        }, err => {
            if (err.status === 405) {
                this.coiService.concurrentUpdateAction = 'Disclosure Risk Status';
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        }))
    }

    closeSlider(event) {
        this.isOpenRiskSlider = false;
    }

    getManageDisclosureRight(): boolean {
        const IS_FCOI_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_FCOI_DISCLOSURE');
        const IS_PROJECT_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_PROJECT_DISCLOSURE');
        switch (this.fcoiTypeCode) {
			case DISCLOSURE_TYPE.INITIAL:
			case DISCLOSURE_TYPE.REVISION:
				return IS_FCOI_ADMINISTRATOR;
			case DISCLOSURE_TYPE.PROJECT:
				return IS_PROJECT_ADMINISTRATOR;
		}
    }

    openReviewComment() {
        const REQ_BODY: FetchReviewCommentRO = {
           componentTypeCode: '3',
           moduleItemKey: this.coiData?.coiDisclosure?.disclosureId,
           moduleItemNumber: this.coiData?.coiDisclosure?.disclosureNumber,
           subModuleCode: null,
           subModuleItemKey: null,
           subModuleItemNumber: null,
           isSectionDetailsNeeded: true,
           documentOwnerPersonId: this.coiData?.coiDisclosure?.person?.personId,
           projects: this.getDisclosureProjectList()
        }
        this.coiService.setReviewCommentSliderConfig(REQ_BODY);
    }

    cancelConcurrency() {
        this.coiService.concurrentUpdateAction = '';
    }

    openSlider(type, count) {
        if(count || (type === 'NOTES' && this.canShowAddNoteBtn)) {
            this.showSlider = true;
            this.selectedType = type;
        }
    }

    closeHeaderSlider(event: any): void {
        if (event?.concurrentUpdateAction) {
            this.coiService.concurrentUpdateAction = event.concurrentUpdateAction;
        } else {
            if(this.selectedType === 'NOTES') {
                this.getNotesCount();
            }
            this.showSlider = false;
            this.selectedType = '';
        }
    }

    private getNotesCount(): void {
        this.$subscriptions.push(this.commonService.fetchNotesList(this.coiData.coiDisclosure.personId).subscribe((data: any) => {
            this.coiData.coiDisclosure.personNotesCount = data?.length;
            this.dataStore.updateStore(['coiDisclosure'], { coiDisclosure: this.coiData.coiDisclosure });
        }));
    }

    setFocus(id) {
        const focusedElement = document.getElementById(id);
        if(focusedElement) {
            setTimeout(() => {
                focusedElement.focus();
            },500)
        }
    }

    collapseHeader(): void {
        this.isCardExpanded = !this.isCardExpanded;
        this.isUserCollapse = !this.isUserCollapse;
        this.isManuallyExpanded = this.isCardExpanded;
        this.emitDisclosureHeaderResize(false);
    }

    openProjectHierarchySlider(): void {
        this.commonService.openProjectHierarchySlider(this.coiData?.projectDetail?.projectTypeCode, this.coiData?.projectDetail?.projectNumber);
    }

    onTabSwitch(tabName: string): void {
        this.isCreateModeTabsVisible = tabName === 'disclosure';
    }

    isActionAllowed(actionBtnName: string, helpTexts: string = '', descriptionErrorMsg: string = '', modalHelpText: string = '') {
        const { coiDisclosureFcoiType, coiProjectType } = this.coiData?.coiDisclosure;
        if (coiDisclosureFcoiType.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT && coiProjectType.coiProjectTypeCode === PROJECT_TYPE.AWARD) {
            this.$subscriptions.push(this.coiService.isEngagmentSynced(this.coiData?.coiDisclosure?.disclosureId, this.coiData?.coiDisclosure?.person?.personId).subscribe((data: any) => {
                if (data) {
                    this.openConfirmationModal(actionBtnName, helpTexts, descriptionErrorMsg, modalHelpText);
                } else {
                    const TERM_FINANCIAL = this.commonService.engagementTypeForCoiDisclosure === 'ALL_SFI'
                        ? ENGAGEMENT_LOCALIZE.TERM_SIGNIFICANT_FINANCIAL : ENGAGEMENT_LOCALIZE.TERM_FINANCIAL_FOR_REL_PILLS + 'relationship';
                    let ERR_MSG = '';
                    if (this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG') {
                        ERR_MSG = actionBtnName === 'Return'
                            ? 'An engagement has been flagged after the reporter\'s submission, and cannot proceed with the return action.'
                            : 'An engagement has been flagged after the current disclosure submission, and cannot proceed with the Recalled action.';
                    } else {
                        ERR_MSG = actionBtnName === 'Return'
                            ? `An engagement with a ${TERM_FINANCIAL} has been flagged after the reporter\'s submission, and cannot proceed with the return action.`
                            : `An engagement with a ${TERM_FINANCIAL} has been flagged after the current disclosure submission, and cannot proceed with the Recalled action.`;
                    }
                    const CONFIG = new COIValidationModalConfig();
                    CONFIG.errorList = [ERR_MSG];
                    this.commonService.openCOIValidationModal(CONFIG);
                }
            }));
        } else {
            this.openConfirmationModal(actionBtnName, helpTexts, descriptionErrorMsg, modalHelpText);
        }
    }

    private checkForActionButtonsVisibility(): void {
        const { adminPersonId, coiReviewStatusType, withdrawalRequested, conflictStatusCode } = this.coiData.coiDisclosure || {};
        const REVIEW_STATUS_CODE = coiReviewStatusType?.reviewStatusCode?.toString();
        const { SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED, ROUTING_IN_PROGRESS } = DISCLOSURE_REVIEW_STATUS;
        const IS_REVIEW_PROCESS_STARTED = [REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].includes(REVIEW_STATUS_CODE);
        const { NO_CONFLICT_WITHOUT_ENGAGEMENTS, NO_CONFLICT_WITHOUT_PROJECTS, NO_CONFLICT_WITHOUT_PROJECTS_AND_ENGAGEMENTS } = CONFLICT_STATUS_TYPE;
        const IS_NO_CONFLICT_WITHOUT_RELATION = [NO_CONFLICT_WITHOUT_ENGAGEMENTS, NO_CONFLICT_WITHOUT_PROJECTS, NO_CONFLICT_WITHOUT_PROJECTS_AND_ENGAGEMENTS].includes(conflictStatusCode);
        const IS_DISCLOSURE_SUBMITTED = String(REVIEW_STATUS_CODE) === String(SUBMITTED);
        const IS_REVIEWER_ACTION_COMPLETED = this.coiService.isReviewActionCompleted;
        const IS_LOGGED_USER_ADMIN_PERSON = this.commonService.getCurrentUserDetail('personID') === adminPersonId;
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL = this.dataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const CAN_MANAGE_DISCLOSURE = this.getManageDisclosureRight() && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL;
        const CAN_COMPLETE_NO_CONFLICT_DISCLOSURE_AS_ADMIN = (CAN_MANAGE_DISCLOSURE || IS_LOGGED_USER_ADMIN_PERSON) && IS_NO_CONFLICT_WITHOUT_RELATION && IS_DISCLOSURE_SUBMITTED;
        const CAN_COMPLETE_BY_ADMIN_PERSON = IS_LOGGED_USER_ADMIN_PERSON && IS_REVIEWER_ACTION_COMPLETED && [REVIEW_IN_PROGRESS, ASSIGNED_REVIEW_COMPLETED].includes(coiReviewStatusType?.reviewStatusCode);
        const CAN_EDIT_DISCLOSURE = this.dataStore.getEditModeForCOI();
        // disclosure action btns rights
        this.isShowApproveDisapproveBtn = REVIEW_STATUS_CODE === ROUTING_IN_PROGRESS.toString() && this.coiData.workFlowResult?.canApproveRouting?.toString() === '1';
        this.isShowAssignAdmin = CAN_EDIT_DISCLOSURE && CAN_MANAGE_DISCLOSURE && IS_DISCLOSURE_SUBMITTED;
        this.isShowReAssignAdmin = CAN_EDIT_DISCLOSURE && CAN_MANAGE_DISCLOSURE && IS_REVIEW_PROCESS_STARTED;
        this.isShowModifyRisk = CAN_EDIT_DISCLOSURE && IS_LOGGED_USER_ADMIN_PERSON && !withdrawalRequested && this.commonService.isShowEntityComplianceRisk;
        this.isShowWithdrawDisclosure = CAN_EDIT_DISCLOSURE && [SUBMITTED, ROUTING_IN_PROGRESS].map(status => status.toString()).includes(REVIEW_STATUS_CODE) && this.isDisclosureOwner;
        this.isShowReturnDIsclosure = CAN_EDIT_DISCLOSURE && IS_REVIEW_PROCESS_STARTED && IS_LOGGED_USER_ADMIN_PERSON;
        this.isShowWithdrawRequest = CAN_EDIT_DISCLOSURE && IS_REVIEW_PROCESS_STARTED && this.isDisclosureOwner && !withdrawalRequested;
        this.isShowCompleteFinalReviewBtn = CAN_EDIT_DISCLOSURE && !withdrawalRequested && ( CAN_COMPLETE_BY_ADMIN_PERSON || CAN_COMPLETE_NO_CONFLICT_DISCLOSURE_AS_ADMIN );
        this.isShowCommentButton = this.dataStore.getCommentButtonVisibility();
        this.isShowReviseButton = this.checkReviseButtonVisibility();
        this.canShowAddNoteButton();
        this.canShowEngagementRisk();
    }

    openHistorySlider (): void {
        this.isShowCompleteDisclHistory = true;
    }

    closeCompleteDisclosureHistorySlider (): void {
        this.isShowCompleteDisclHistory = false;
    }

    routeToAdminOrUserDashboard(): void {
        const URL = this.coiService.previousDisclosureRouteUrl;
        switch (true) {
            case URL.includes(ADMIN_DASHBOARD_URL):
                this.router.navigate([ADMIN_DASHBOARD_URL]);
                break;
            case URL.includes(PROJECT_DASHBOARD_URL):
                this.router.navigate([PROJECT_DASHBOARD_URL]);
                break;
            case URL.includes(REVIEWER_ADMIN_DASHBOARD_BASE_URL):
                this.router.navigate([REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.DISCLOSURE_LIST]);
                break;
            default:
                this.router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    stepNavAction(event: any): void {
        switch (event?.actionType as CoiStepsNavActionType) {
            case 'PREVIOUS':
                this.goToPrevStep();
                break;
            case 'PROCEED':
                this.goToStep();
                break;
            case 'SUBMIT':
                this.checkQuestionnaireCompletedBeforeCertify();
                break;
            default: break;
        }
    }

    goToPrevStep(): void {
        if (this.currentStepNumber === 1) { return; }
        this.currentStepNumber--;
        this.navigateToStep();
    }

    openPrintDisclosureModal(): void {
        const { coiProjectType, coiDisclosureFcoiType, disclosureId, disclosureNumber, person } = this.coiData?.coiDisclosure || {};
        const DISCLOSURE_NAME = String(this.fcoiTypeCode) === String(DISCLOSURE_TYPE.PROJECT)
            ? COMMON_DISCL_LOCALIZE.PROJECT_BADGE_PREFIX + coiProjectType?.description
            : COMMON_DISCL_LOCALIZE.ANNUAL_BADGE_PREFIX + coiDisclosureFcoiType?.description;
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = disclosureId;
        this.printModalConfig.moduleItemCode = COI_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = disclosureNumber;
        this.printModalConfig.moduleSubItemCode = FCOI_SUB_MODULE_ITEM_KEY;
        this.printModalConfig.modalConfig.namings.modalName = 'fcoi-discl-print-modal';
        this.printModalConfig.modalHeaderText = 'Print ' + DISCLOSURE_NAME + ' Disclosure';
        this.printModalConfig.helpTextConfig = { subSectionId: '815', elementId: 'fcoi-discl-print' };
        this.printModalConfig.templateLabel = 'Choose a template to print ' + DISCLOSURE_NAME.toLowerCase() + ' disclosure';
        this.printModalConfig.fileName = 'FCOI-' + DISCLOSURE_NAME + '-disclosure-' + disclosureId + '-' + person?.fullName;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }

}
