import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponseBase} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {getFromLocalStorage, setIntoLocalStorage} from '../../../../../fibi/src/app/common/utilities/user-service';
import {Toast} from 'bootstrap';
import { HTTP_SUCCESS_STATUS, AWARD_EXTERNAL_RESOURCE_URL, PROPOSAL_EXTERNAL_RESOURCE_URL, IP_EXTERNAL_RESOURCE_URL, ADMIN_DASHBOARD_RIGHTS,
    COI_DISCLOSURE_SUPER_ADMIN_RIGHTS, HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG, OPA_DISCLOSURE_RIGHTS, OPA_DISCLOSURE_ADMIN_RIGHTS,
    PERSON_EXTERNAL_RESOURCE_URL, ROLODEX_PERSON_EXTERNAL_RESOURCE_URL, PROJECT_DASHBOARD_RIGHTS, LEAVE_PAGE_MODAL_MSG, USER_DASHBOARD_CHILD_ROUTE_URLS,
    DISCLOSURE_TYPE_CODE, DISCLOSURE_REVIEW_STATUS, FCOI_DISCLOSURE_CHILD_ROUTE_URLS, FCOI_DISCL_VIEW_MODE_CHILD_ROUTE_URLS, ENTITY_DASHBOARD_RIGHTS, ADMIN_DASHBOARD_URL,
    ENTITY_DASHBOARD_URL, OPA_DASHBOARD_ROUTE_URL, FCOI_PROJECT_DISCLOSURE_RIGHTS, TRAVEL_DISCLOSURE_RIGHTS, CONSULTING_DISCLOSURE_RIGHTS, PROJECT_DASHBOARD_URL, 
    COI_ERROR_ROUTE_URLS,
    ENGAGEMENT_FLOW_TYPE, APPLICATION_FULL_LOADER_ID } from '../../app-constants';
import { closeCommonModal, deepCloneObject, getPersonLeadUnitDetails, hideAutoSaveToast, openCommonModal, showAutoSaveToast } from '../utilities/custom-utilities';
import { Router } from '@angular/router';
import { ElasticConfigService } from './elastic-config.service';
import { COICountModal, DisclosureProjectData, DisclosureProjectModalData } from '../../shared-components/shared-interface';
import { LoginPersonDetails, GlobalEventNotifier, LoginPersonDetailsKey, Method, COIAttachmentModalInfo, COIAppConfig, ProjDisclCreateModal, SharedProjectDetails,
    CoiProjectType, ActionListSliderConfig, InboxObject, ActionListOptions, EntityCreationModalConfig, COIValidationModalConfig, PersonType, COIPersonModalConfig,
    COIEntityModalConfig, COILeavePageModalConfig, ApplicableFormRO, FetchEachOrAllEngagementsRO, COIGraphModalConfig, EntityGraphTriggeredFrom, CoiDisclosureType,
    DisclosureCommentsCountRO } from './coi-common.interface';
import { hideModal } from "../../../../../fibi/src/app/common/utilities/custom-utilities";
import { ProjectHierarchySliderPayload } from '../../shared-components/project-hierarchy-slider/services/project-hierarchy-slider.interface';
import { NotificationTypeRO , ProjectDetails } from '../../admin-dashboard/admin-dashboard.interface';
import { EntityUpdateClass } from '../../entity-management-module/shared/entity-interface';
import { Note, PersonEntityRelations, ProjectSfiRelationLoadRO } from '../../disclosure/coi-interface';
import { GraphAction } from '../../../../../shared/src/lib/graph/graph.component';
import { COUNTRY_CODE_FOR_ALLOW_LOOKUP_ONLY } from '../../entity-management-module/shared/entity-constants';
import { COIReviewCommentsSliderConfig } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { ModulesConfiguration, SectionConfig, SubSectionConfig } from '../../shared/common.interface';
import { compareDates } from '../../common/utilities/date-utilities';
import { DeclarationType } from '../../declarations/declaration.interface';
import { COMMON_DISCL_LOCALIZE, ENGAGEMENT_LOCALIZE } from '../../app-locales';
import { CmpCreationConfig, CmpCreationSliderConfig } from '../../conflict-management-plan/shared/management-plan.interface';
import { CMP_RIGHTS } from '../../conflict-management-plan/shared/management-plan-constants';

@Injectable()
export class CommonService {

    isShowLoader = new BehaviorSubject<boolean>(true);
    baseUrl = '';
    fibiUrl = '';
    authUrl = '';
    formUrl = '';
    printUrl = '';
    fibiCOIConnectUrl = '';
    EXTERNAL_APPLICATION_BASE_URL = '';
    EXTERNAL_DEV_PROPOSAL_URL = '';
    EXTERNAL_PERSON_URL = '';
    EXTERNAL_ROLODEX_PERSON_URL = '';
    EXTERNAL_AWARD_URL = '';
    EXTERNAL_IP_URL = '';
    forbiddenModule = '';
    isEvaluation: boolean;
    isMapRouting: boolean;
    isEvaluationAndMapRouting: boolean;
    cvFileType: any = [];
    wordFileType: any = [];
    claimFileType: any = [];
    enableSSO = false;
    rightsArray: any = [];
    isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
    extension: any = [];
    currentUserDetails = new LoginPersonDetails();
    isWafEnabled: boolean;
    canAddOrganization: boolean;
    isGrantCallStatusAutomated = false;
    isManpowerEnabled = false;
    isEnableAddtoAddressBook = false;
    isDevProposalVersioningEnabled = false;
    isExternalUser = false;
    isCreateAgreement = false;
    isShowAgreementSupport = false;
    isShowAgreementNotifyAction = false;
    isElasticAuthentiaction = false;
    isCoiReviewer = false;
    isOPAReviewer = false;
    canCreateOPA = false;
    elasticUserName = '';
    elasticAuthScheme = '';
    elasticDelimiter = '';
    elasticPassword = '';
    elasticIndexUrl = '';
    generalFileType: any = [];
    appLoaderContent = '';
    isEnableLock = false;
    isPreventDefaultLoader = false;
    timer: any;
    appToastContent = '';
    toastClass = 'success';
    dashboardModules: any = {};
    previousURL = null;
    fibiApplicationUrl = '';
    $ScrollAction = new Subject<{event: Event,pageYOffset: number}>();
    $sliderScrollAction = new Subject<{event: Event,pageYOffset: number}>();
    $commentConfigurationDetails =  new BehaviorSubject<any>({});
    enableGraph = false;
    $updateLatestNote = new Subject();
    isShowCreateNoteModal = false;
    projectDetailsModalInfo = new DisclosureProjectModalData();
    personModalConfig = new COIPersonModalConfig();
    entityModalConfig = new COIEntityModalConfig();
    graphModalConfig = new COIGraphModalConfig();
    $globalEventNotifier = new Subject<GlobalEventNotifier>();
    relationshipTypeCache = {};
    hasChangesAvailable = false;
    isNavigationStopped: boolean = false;
    attemptedPath: string = '';
    coiAttachmentModalInfo = new COIAttachmentModalInfo();
    projDisclCreateModal = new ProjDisclCreateModal();
    projectHierarchySliderInfo = new ProjectHierarchySliderPayload();
    autoSaveSavingSpinner: 'SHOW'|'HIDE' = 'HIDE';
    loaderRestrictedUrls: any[] = [];
    isShowEntityMigrationPhase = false;
    concurrentUpdateAction = '';
    $updateNoteList = new Subject<Note>();
    coiProjectTypes: CoiProjectType[] = [];
    activeProjectsTypes: CoiProjectType[] = [];
    coiDisclosureTypes: CoiDisclosureType[] = [];
    coiLookups: Record<string, any[]> = {};
    entityCreationModalConfig = new EntityCreationModalConfig();
    actionListSliderConfig = new ActionListSliderConfig();
    validationModalInfo = new COIValidationModalConfig();
    isUnifiedQuestionnaireEnabled = false;
    isFromAddSFIPage = false;
    engagementFlowType = '';
    isCompensatedFlow = false;
    toastTimeOut: any;
    leavePageModalInfo = new COILeavePageModalConfig();
    isEngagementChangesAvailable = false;
    isEntityChangesAvailable = false;
    isShowEntityComplianceRisk = false;
    canEditDisclosureUnit = false;
    isEnableEntityDunsMatch = false;
    canShowReporterNotes = false;
    canShowReporterAttachments = false;
    isActionListSortingEnabled = false;
    travelDisclosureFlowType = '';
    isEnableLegacyEngMig = false;
    isDisclosureRequired = false;
    isShowFinancialDisclosure = false;
    isShowOpaDisclosure = false;
    isShowTravelDisclosure = false;
    isShowConsultingDisclosure = false;
    isShowManagementPlan = false;
    allowFcoiWithoutProjects = false;
    enableKeyPersonDisclosureComments = false;
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    opaFrequency: 'PERIODIC' | 'YEARLY';
    previousUrlBeforeActivate = '';
    engagementTypeForCoiDisclosure: 'ALL_ENG' | 'ALL_FIN' | 'ALL_SFI';
    isSfiEvaluationEnabled = false;
    currencySymbol: string;
    canDeleteEngagement = false;
    currencyFormat = '$';
    declarationTypes: DeclarationType[] = [];
    activeDeclarationTypes: DeclarationType[] = [];
    opaApprovalFlowType: 'NO_REVIEW' | 'ROUTING_REVIEW' | 'ADMIN_REVIEW' | 'ROUTING_AND_ADMIN_REVIEW';
    coiApprovalFlowType: 'NO_REVIEW' | 'ROUTING_REVIEW' | 'ADMIN_REVIEW' | 'ROUTING_AND_ADMIN_REVIEW';
    isStartDateOfInvolvementMandatory = false;
    enableRouteLogUserAddOpaReviewer = false;
    declarationEligibilityMap: Record<string, boolean> = null;
    isShowPreLoader = true;
    isCmpReviewer = false;
    cmpCreationSliderConfig = new CmpCreationSliderConfig();

    constructor(private _http: HttpClient, private elasticConfigService: ElasticConfigService, private _router: Router) {
    }

    /**
     * returns a config file from assets and assign to application variables
     */
    async getAppConfig() {
        return new Promise(async (resolve, reject) => {
            const CONFIG_DATA: COIAppConfig = await this.readConfigFile();
            this.assignConfigurationValues(CONFIG_DATA);
            try {
                const LOGIN_USER_DETAILS: any = await this.authLogin();
                const SYSTEM_PARAMETERS: any = await this.getRequiredParameters();
                this.assignSystemParameters(SYSTEM_PARAMETERS);
                this.onSuccessFullLogin(LOGIN_USER_DETAILS);
                resolve(true);
            } catch (e) {
                this.onFailedLogin(e);
                resolve(true);
            }
        });
    }

    readConfigFile(): Promise<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Cache-Control', 'no-store');
        headers = headers.append('Pragma', 'no-cache');
        return this._http.get(environment.deployUrl + 'assets/app-config.json', {headers}).toPromise();
    }

    /**
     * @param  {} configurationData
     * assign system configurations to global variables
     */
    assignConfigurationValues(configurationData: COIAppConfig) {
        this.baseUrl = configurationData.baseUrl;
        this.fibiUrl = configurationData.fibiUrl;
        this.authUrl = configurationData.authUrl;
        this.formUrl = configurationData.formUrl;
        this.printUrl = configurationData.printUrl;
        this.fibiCOIConnectUrl = configurationData.fibiCOIConnectUrl;
        this.enableSSO = configurationData.enableSSO;
        this.isElasticAuthentiaction = configurationData.isElasticAuthentiaction;
        this.elasticUserName = configurationData.elasticUserName;
        this.elasticDelimiter = configurationData.elasticDelimiter;
        this.elasticPassword = configurationData.elasticPassword;
        this.elasticAuthScheme = configurationData.elasticAuthScheme;
        this.elasticConfigService.url = configurationData.elasticIndexUrl;
        this.elasticConfigService.indexValue = configurationData.indexValue;
        this.fibiApplicationUrl = configurationData.fibiApplicationUrl;
        this.enableGraph = configurationData.enableGraph;
        this.EXTERNAL_APPLICATION_BASE_URL = configurationData.EXTERNAL_APPLICATION_BASE_URL;
        this.EXTERNAL_DEV_PROPOSAL_URL = configurationData.EXTERNAL_DEV_PROPOSAL_URL;
        this.EXTERNAL_AWARD_URL = configurationData.EXTERNAL_AWARD_URL;
        this.EXTERNAL_IP_URL = configurationData.EXTERNAL_IP_URL;
        this.EXTERNAL_PERSON_URL = configurationData.EXTERNAL_PERSON_URL;
        this.EXTERNAL_ROLODEX_PERSON_URL = configurationData.EXTERNAL_ROLODEX_PERSON_URL;
        this.currencySymbol = configurationData.currencySymbol;
    }

    pageScroll(elementId) {
        const id = document.getElementById(elementId);
        if (id) {
            id.scrollIntoView({behavior: 'smooth'});
        }
    }

    _keyPress(event: any, patternType) {
        const pattern = patternType === 'date' ? /[0-9\+\-\/\ ]/ : /[0-9\a-zA-Z]/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    loginWithCurrentUser() {
        return this._http.post(this.formUrl + '/auth/login', {}, {observe: 'response'}).toPromise();
    }

    authLogin() {
        return this._http.post(this.authUrl + '/login', {}, {observe: 'response'}).toPromise();
    }

    signOut() {
        return this._http.get(this.authUrl + '/logout');
    }

    /**
     * @param  {} details update the local storage with application constant values
     *  will be moved to application context once SSO is stable
     */
    updateLocalStorageWithUserDetails(details: any) {
        this.currentUserDetails = details.body;
        setIntoLocalStorage(details.body);
    }

    getCurrentUserDetail(detailsKey: LoginPersonDetailsKey) {
        return this.currentUserDetails && this.currentUserDetails[detailsKey] ?
            this.currentUserDetails[detailsKey] : this.updateCurrentUser(detailsKey);
    }

    updateCurrentUser(detailsKey: LoginPersonDetailsKey) {
        this.currentUserDetails = getFromLocalStorage();
        return this.currentUserDetails && this.currentUserDetails[detailsKey] ? this.currentUserDetails[detailsKey] : '';
    }

    getDashboardActiveModules(moduleCode = ''): Observable<ModulesConfiguration> {
        return this._http.get<ModulesConfiguration>(this.fibiUrl + '/getModulesConfiguration' + (moduleCode ? '/' + moduleCode : ''));
    }

    /**
     * Converts array to an object with keys as sectionCode or subSectionCodes and values as the whole object.
     * @param data
     * */
    getSectionCodeAsKeys(data: ModulesConfiguration): Record<string, SectionConfig | SubSectionConfig> {
        return data?.sectionConfig?.reduce((acc, obj) => {
            const SUB_SECTION = obj?.subSectionConfig?.reduce((ac, ob) => ({...ac, [ob?.subSectionCode]: ob}), {});
            return {...acc, [obj?.sectionCode]: obj, ...SUB_SECTION};
        }, {});
    }

    getRequiredParameters() {
        return this._http.get(this.baseUrl + '/coiCustom/fetchRequiredParams').toPromise();
    }

    createEntity(entityRO: EntityUpdateClass) {
        return this._http.post(this.baseUrl + '/entity/create', entityRO);
    }

    /**
     * @param  {} parameters assign system level parameters to global variables
     */
    assignSystemParameters(parameters) {
        this.isEvaluation = parameters.isEvaluation;
        this.isMapRouting = parameters.isMapRouting;
        this.isEvaluationAndMapRouting = parameters.isEvaluationAndMapRouting;
        if (parameters.fileTypes?.length) {
            this.generalFileType = parameters.fileTypes[0] ? parameters.fileTypes[0].extension : null;
            this.cvFileType = parameters.fileTypes[1] ? parameters.fileTypes[1].extension : null;
            this.claimFileType = parameters.fileTypes[2] ? parameters.fileTypes[2].extension : null;
            this.wordFileType = parameters.fileTypes[3] ? parameters.fileTypes[3].extension : null;
        }
        this.isWafEnabled = parameters.isWafEnabled;
        this.canAddOrganization = parameters.canUserAddOrganization;
        this.isGrantCallStatusAutomated = parameters.isGrantCallStatusAutomated;
        this.isManpowerEnabled = parameters.isAwardManpowerActive;
        this.isEnableAddtoAddressBook = parameters.isEnableAddtoAddressBook;
        this.isDevProposalVersioningEnabled = parameters.isDevProposalVersioningEnabled;
        this.isCreateAgreement = parameters.isShowCreateAgreement;
        this.isShowAgreementNotifyAction = parameters.isShowAgreementNotifyAction;
        this.isShowAgreementSupport = parameters.isShowAgreementSupport;
        this.isEnableLock = parameters.isEnableLock;
        this.isShowEntityMigrationPhase = parameters.showEntityMigrationPhase;
        this.isShowEntityComplianceRisk = parameters.showEntityComplianceRisk;
        this.isEnableEntityDunsMatch = parameters.isEnableEntityDunsMatch;
        this.coiProjectTypes = parameters.coiProjectTypes;
        this.coiDisclosureTypes = parameters.coiDisclosureTypes;
        // this.isUnifiedQuestionnaireEnabled = parameters.isUnifiedQuestionnaireEnabled;
        this.engagementFlowType = parameters.engagementFlowType;
        this.canEditDisclosureUnit = parameters.enableEditForDisclosureUnit;
        this.canShowReporterNotes = parameters.coiNotesTabEnabled;
        this.canShowReporterAttachments = parameters.coiAttachmentsTabEnabled;
        this.isActionListSortingEnabled = parameters.coiActionListSortingEnabled;
        this.travelDisclosureFlowType = parameters.travelDisclosureFlowType;
        this.allowFcoiWithoutProjects = parameters.allowFcoiWithoutProjects;
        this.engagementTypeForCoiDisclosure = parameters.engagementTypeForCoiDisclosure;
        this.enableKeyPersonDisclosureComments = parameters.enableKeyPersonDisclosureComments;
        this.isEnableLegacyEngMig = parameters.isEnableLegacyEngMig;
        this.isDisclosureRequired = parameters.isDisclosureRequired;
        this.isSfiEvaluationEnabled = parameters.isSfiEvaluationEnabled;
        this.canDeleteEngagement = parameters.canDeleteEngagement;
        this.declarationTypes = parameters.declarationTypes;
        this.activeProjectsTypes = this.coiProjectTypes?.filter((projectType: CoiProjectType) => projectType?.projectDisclosureNeeded);
        this.activeDeclarationTypes = this.getActiveDeclarationTypes();
        this.opaApprovalFlowType = parameters.opaApprovalFlowType;
        this.coiApprovalFlowType = parameters.fcoiApprovalFlowType;
        this.isStartDateOfInvolvementMandatory = parameters.isStartDateOfInvolvementMandatory;
        this.isShowManagementPlan = true;
        this.enableRouteLogUserAddOpaReviewer = parameters.enableRouteLogUserAddOpaReviewer;
        this.declarationEligibilityMap = this.getDeclarationEligibilityMap(parameters.declarationEligibilityMap);
        this.setEngagementFlow();
        this.setDisclosureTypeVisibility(this.coiDisclosureTypes);
    }

    setEngagementFlow(): void {
        const { FLOW_2, FLOW_3 } = ENGAGEMENT_FLOW_TYPE;
        this.isCompensatedFlow = this.engagementFlowType === FLOW_3;
        if([FLOW_2, FLOW_3].includes(this.engagementFlowType)) {
            this.isUnifiedQuestionnaireEnabled = true;
        } else {
            this.isUnifiedQuestionnaireEnabled = false
        }
    }

    async fetchPermissions(hardRefresh = false) {
        if (!hardRefresh && this.rightsArray.length) {
            return this.rightsArray;
        }
        const {fibiRights, coiRights} = await this.getAllSystemRights();
        this.assignFibiBasedRights(fibiRights);
        this.assignCOIBasedRights(coiRights);
    }

    assignCOIBasedRights(coiRights) {
        if (coiRights) {
            if ('IS_REVIEW_MEMBER' in coiRights) {
                this.isCoiReviewer = coiRights.IS_REVIEW_MEMBER;
            }
            if ('IS_OPA_REVIEW_MEMBER' in coiRights) {
                this.isOPAReviewer = coiRights.IS_OPA_REVIEW_MEMBER;
            }
            if('IS_CMP_REVIEW_MEMBER' in coiRights) {
                this.isCmpReviewer = coiRights.IS_CMP_REVIEW_MEMBER;
            }
            if('CAN_CREATE_OPA' in coiRights) {
                this.canCreateOPA = coiRights.CAN_CREATE_OPA;
            }
            if (Array.isArray(coiRights.rights)) {
                this.rightsArray = [...this.rightsArray, ...coiRights.rights];
            }
        }
    }

    assignFibiBasedRights(fibiRights) {
        if (fibiRights.length) {
            this.rightsArray = fibiRights;
        }
    }

    private async getAllSystemRights() {
        const fibiRightsAPI = this._http.get(this.fibiUrl + '/getAllSystemRights').toPromise();
        const coiRightsAPI = this._http.get(this.baseUrl + '/coiCustom/fetchAllCoiRights').toPromise();
        const [fibiRights, coiRights]: any = await Promise.all([fibiRightsAPI, coiRightsAPI]);
        return {fibiRights, coiRights};
    }

    showToast(status = HTTP_SUCCESS_STATUS, toastContent = '', timer = 5000) {
        this.toastTimeOut && clearTimeout(this.toastTimeOut)
        const toast: any = new Toast(document.getElementById('coi-bootstrap-toast'));
        const toast_body: any = document.getElementById('coi-bootstrap-toast-body');
        this.appToastContent = toastContent === '' ? status === HTTP_SUCCESS_STATUS ?
            'Your details saved successfully' : 'Error Saving Data! Please try again' : toastContent;
        this.toastClass = status === HTTP_SUCCESS_STATUS ? 'bg-success' :'bg-danger';
        if (toast && toast_body) {
            ['bg-success', 'bg-danger'].forEach(className => toast._element.classList.remove(className));
            toast_body.innerText =  this.appToastContent;
            toast._element.classList.add(this.toastClass);
            toast.show();

            // Focus the toast element
            // toast_body.focus();

            // Unfocus after 5000 milliseconds
            this.toastTimeOut = setTimeout(() => {
                toast_body.innerText = '';
                toast.hide();
            }, timer);
        }
    }

  getDisclosureConflictBadge(statusCode: string) {
        switch (String(statusCode)) {
            case '1':
                return 'green-badge';
            case '2':
                return 'brown-badge';
            case '3':
                return 'red-badge';
            case '4':
            case '5':
            case '6':
                return 'green-badge';
            default:
                return 'yellow-badge';
        }
    }

    getDisclosureConflictBadgeForSlider(statusCode: string) {
        switch (String(statusCode)) {
            case '1':
                return 'green-badge-for-slider';
            case '2':
                return 'brown-badge-for-slider';
            case '3':
                return 'red-badge-for-slider';
            case '4':
            case '5':
            case '6':
                return 'green-badge-for-slider';
            default:
                return 'yellow-badge-for-slider';
        }
    }

    getReviewStatusBadge(statusCode: string): string {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'blue-badge';
            case '3':
                return 'yellow-badge';
            case '4':
                return 'green-badge';
            case '5':
                return 'red-badge';
            case '6':
                return 'red-badge';
            case '7':
                return 'blue-badge';
            case '8':
                return 'green-badge';
            default:
                return 'red-badge';
        }
    }

    getDispositionStatusBadge(statusCode) {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'grey-badge';
            case '3':
                return 'green-badge';
            case '4':
                return 'red-badge';
            default:
                return 'yellow-badge';
        }
    }

    getConsultingDispositionStatusBadge(statusCode) {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'green-badge';
            case '3':
                return 'grey-badge';
            default:
                return '';
        }
    }

    getConsultingReviewStatusBadge(statusCode: string): string {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'blue-badge';
            case '3':
                return 'yellow-badge';
            case '5':
                return 'green-badge';
            case '8':
                return 'red-badge';
            case '7':
                return 'red-badge';
            case '4':
                return 'blue-badge';
            case '6':
                return 'green-badge';
            default:
                return '';
        }
    }

    getTravelReviewStatusBadge(statusCode) {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'blue-badge';
            case '3':
                return 'green-badge';
            case '4':
                return 'orange-badge';
            case '5':
                return 'bright-red-badge';
            case '6':
            case '7':
                return 'green-badge';
            default:
                return 'red-badge';
        }
    }

    getDocumentStatusBadge(statusCode) {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
                return 'green-badge';
            default:
                return 'yellow-badge';
        }
    }

  getProjectDisclosureConflictStatusBadge(statusCode: string) {
    switch (String(statusCode)) {
        case '100':
            return 'green-badge';
        case '200':
            return 'brown-badge';
        case '300':
            return 'red-badge';
        case '400':
            return 'green-badge';
    }
}

getProjectDisclosureConflictStatusBadgeForConfiltSliderStyleRequierment(statusCode: string) {
    switch (String(statusCode)) {
        case '100':
            return 'green-badge-for-slider';
        case '200':
            return 'brown-badge-for-slider';
        case '300':
            return 'red-badge-for-slider';
        case '400':
            return 'green-badge-for-slider';
    }
}

    getAvailableRight(rights: string | string[], method: Method = 'SOME'): boolean {
      const rightsArray = Array.isArray(rights) ? rights : [rights];
      if (method === 'EVERY') {
        return rightsArray.every((right) => this.rightsArray.includes(right));
      } else {
        return rightsArray.some((right) => this.rightsArray.includes(right));
      }
    }

    getPersonLeadUnitDetails(unitData: any): string {
        return getPersonLeadUnitDetails(unitData);
    }

    onSuccessFullLogin(userData: HttpResponseBase) {
        this.updateLocalStorageWithUserDetails(userData);
        const URL = sessionStorage.getItem('url');
        URL ? this.readRedirectPathFromURL(URL) : this.refreshAfterLogin();
    }

    /**
     * Redirects to project details based on the project type.
     *
     * @param projectTypeCode - The moduleCode/typeCode of project (1: Award, 2: Institute Proposal, 3: Development Proposal).
     * @param projectId - The unique ID of the project to redirect to.
     *
     * Project Types:
     * 1: Award - Uses EXTERNAL_AWARD_URL (if defined) or falls back to AWARD_EXTERNAL_RESOURCE_URL for FIBI integration.
     * 2: Institute Proposal - Uses EXTERNAL_IP_URL (if defined) or falls back to IP_EXTERNAL_RESOURCE_URL for FIBI integration.
     * 3: Development Proposal - Uses EXTERNAL_DEV_PROPOSAL_URL (if defined) or falls back to PROPOSAL_EXTERNAL_RESOURCE_URL for FIBI integration.
     *
     * External URLs:
     * EXTERNAL_AWARD_URL, EXTERNAL_IP_URL, EXTERNAL_DEV_PROPOSAL_URL, EXTERNAL_APPLICATION_BASE_URL => for KC integration or external integration.
     * AWARD_EXTERNAL_RESOURCE_URL, IP_EXTERNAL_RESOURCE_URL, PROPOSAL_EXTERNAL_RESOURCE_URL, fibiApplicationUrl => for FIBI.
     */
    redirectToProjectDetails(projectTypeCode: string | number, projectId: string): void {
        const EXTERNAL_PROJECT_URLS = [this.EXTERNAL_AWARD_URL, this.EXTERNAL_IP_URL, this.EXTERNAL_DEV_PROPOSAL_URL];
        const PROJECT_URLS_MAP = {
            1: EXTERNAL_PROJECT_URLS[0] || AWARD_EXTERNAL_RESOURCE_URL,
            2: EXTERNAL_PROJECT_URLS[1] || IP_EXTERNAL_RESOURCE_URL,
            3: EXTERNAL_PROJECT_URLS[2] || PROPOSAL_EXTERNAL_RESOURCE_URL,
        };
        if (PROJECT_URLS_MAP[projectTypeCode]) {
            const IS_EXTERNAL_URL = EXTERNAL_PROJECT_URLS.includes(PROJECT_URLS_MAP[projectTypeCode]);
            const BASE_URL = IS_EXTERNAL_URL ? this.EXTERNAL_APPLICATION_BASE_URL : this.fibiApplicationUrl;
            const RESOURCE_URL = PROJECT_URLS_MAP[projectTypeCode].replace('{projectId}', projectId);
            window.open(`${BASE_URL}${RESOURCE_URL}`, '_blank');
        }
    }

    /**
     * Redirects to person details based on the personType ('PERSON' or 'ROLODEX').
     *
     * @param personId - The unique ID of the person to redirect to.
     * @param personType - Specifies if the person is a 'PERSON' (default) or 'ROLODEX'.
     *
     * PERSON:
     *  - Uses EXTERNAL_PERSON_URL (if defined) or falls back to PERSON_EXTERNAL_RESOURCE_URL for FIBI integration.
     *  - Represents standard users or individuals directly interacting with the application.
     * ROLODEX:
     *  - Uses EXTERNAL_ROLODEX_PERSON_URL (if defined) or falls back to ROLODEX_PERSON_EXTERNAL_RESOURCE_URL for KC integration or external integration.
     *  - Represents contacts stored in a rolodex-like directory, typically external users / not standard users of the application.
     * BASE_URL:
     *  - Uses EXTERNAL_APPLICATION_BASE_URL if the URL is external; otherwise, it uses fibiApplicationUrl for FIBI redirection.
     */
    redirectToPersonDetails(personId: string, personType: PersonType = 'PERSON'): void {
        const EXTERNAL_PERSON_URLS = [this.EXTERNAL_PERSON_URL, this.EXTERNAL_ROLODEX_PERSON_URL];
        const PERSON_URLS_MAP = {
            'PERSON': EXTERNAL_PERSON_URLS[0] || PERSON_EXTERNAL_RESOURCE_URL,
            'ROLODEX': EXTERNAL_PERSON_URLS[1] || ROLODEX_PERSON_EXTERNAL_RESOURCE_URL
        };
        if (PERSON_URLS_MAP[personType]) {
            const IS_EXTERNAL_URL = EXTERNAL_PERSON_URLS.includes(PERSON_URLS_MAP[personType]);
            const BASE_URL = IS_EXTERNAL_URL ? this.EXTERNAL_APPLICATION_BASE_URL : this.fibiApplicationUrl;
            const RESOURCE_URL = PERSON_URLS_MAP[personType].replace('{personId}', personId);
            window.open(`${BASE_URL}${RESOURCE_URL}`, '_blank');
        }
    }

    setLoaderRestriction(): void {
        this.isPreventDefaultLoader = true;
    }

    removeLoaderRestriction(): void {
        this.isPreventDefaultLoader = false;
    }

    openProjectDetailsModal(projectDetails: DisclosureProjectData | null = null, coiDisclosureId: number | null = null, needReporterRole: boolean = true): void {
        this.projectDetailsModalInfo.projectDetails = projectDetails;
        this.projectDetailsModalInfo.coiDisclosureId = coiDisclosureId;
        this.projectDetailsModalInfo.needReporterRole = needReporterRole;
    }

    closeProjectDetailsModal(isOpen = true): void {
        if (isOpen) {
            document.getElementById('coi-project-view-modal-close-btn')?.click();
        }
        setTimeout(() => {
            this.projectDetailsModalInfo = new DisclosureProjectModalData();
        }, 200);
    }

    openProjectHierarchySlider(projectTypeCode: string | number | null, projectNumber: string | null): void {
        if (projectTypeCode && projectNumber) {
            this.projectHierarchySliderInfo.projectTypeCode = projectTypeCode;
            this.projectHierarchySliderInfo.projectNumber = projectNumber;
            this.projectHierarchySliderInfo.isOpenSlider = true;
        } else {
            this.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
    }

    closeProjectHierarchySlider(): void {
        this.projectHierarchySliderInfo = new ProjectHierarchySliderPayload();
    }

    openPersonDetailsModal(personId: string, personType: PersonType = 'PERSON', isShowViewButton = false): void {
        this.personModalConfig = { personId, personType, isShowViewButton };
    }

    closePersonDetailsModal(isOpen = true): void {
        if (isOpen) {
            document.getElementById('coi-person-view-modal-close-btn')?.click();
        }
        setTimeout(() => {
            this.personModalConfig = new COIPersonModalConfig();
        }, 200);
    }

    openEntityDetailsModal(entityId: string | number): void {
        this.entityModalConfig = { isOpenModal: true, entityId };
    }

    closeEntityDetailsModal(isOpen = true): void {
        if (isOpen) {
            document.getElementById('coi-entity-view-modal-dissmiss-btn')?.click();
        }
        setTimeout(() => {
            this.entityModalConfig = new COIEntityModalConfig();
        }, 200);
    }

    openEntityGraphModal(entityId: string | number, entityName: string, triggeredFrom: EntityGraphTriggeredFrom) {
        if (entityId) {
            this.graphModalConfig.entityId = entityId;
            this.graphModalConfig.entityName = entityName;
            this.graphModalConfig.triggeredFrom = triggeredFrom;
            setTimeout(() => {
                this.graphModalConfig.graphEvent?.next({ visible: true, id: entityId?.toString(), name: entityName });
            }, 50);
        }
    }

    closeEntityGraphModal(graphAction: GraphAction): void {
        setTimeout(() => {
            if (this.graphModalConfig?.triggeredFrom === 'ENTITY_DETAILS_MODAL' && graphAction?.content?.closeTrigger  === 'BUTTON_CLICK') {
                this.openEntityDetailsModal(this.entityModalConfig?.entityId);
            }
            this.graphModalConfig.entityId = '';
            this.graphModalConfig.entityName = '';
            this.graphModalConfig.triggeredFrom = null;
        }, 250);
    }

    getRiskColor(typeCode: string): string {
        switch (typeCode) {
            case '1':
                return 'high-risk';
            case '2':
                return 'medium-risk';
            case '3':
                return 'low-risk';
            default:
                return '';
        }
    }

    /**
     * Extracts relationship types from a given string and returns them as a list.
     * - First, checks if the result is already stored in a cache to avoid extra work.
     * - Splits the input string using `':;:'` to separate multiple relationships.
     * - Each relationship is further split using `':'` to get the type and description.
     * - Returns a list of objects containing `relationshipType` and `description`.
     *
     * @param {string} validPersonEntityRelType - The input relationship string.
     * @returns {PersonEntityRelations[]} - List of processed relationship data.
    */
    getEntityRelationTypePills(validPersonEntityRelType: string) {
        if (validPersonEntityRelType) {
            if (this.relationshipTypeCache[validPersonEntityRelType]) {
                return this.relationshipTypeCache[validPersonEntityRelType];
            }
            const entityRelTypes = validPersonEntityRelType.split(':;:');
            this.relationshipTypeCache[validPersonEntityRelType] = entityRelTypes.map(entity => {
                const relationshipType = entity.split(':');
                return { relationshipType: relationshipType[0] || '', description: relationshipType[1] || '' };
            });
            return this.relationshipTypeCache[validPersonEntityRelType];
        }
    }

    /**
     * Groups a list of relationship data by `relationshipType`.
     * - Combines all `description` values under their respective `relationshipType`.
     * - Keeps one `icon` per `relationshipType` instead of repeating it.
     * - Returns a structured list with `relationshipType`, a list of `Relation`, and `icon`.
     *
     * @param {PersonEntityRelations[]} data - Input list of relationships.
     * @returns {PersonEntityRelations[]} - Grouped and structured data.
     */
    convertRelationshipData(personEntityRelations: PersonEntityRelations[]): PersonEntityRelations[] {
        const RESULT: Record<string, { relations: string[]; icon: string }> = {};

        personEntityRelations?.forEach(item => {
            const KEY = item.relationshipType.trim();
            if (!RESULT[KEY]) {
                RESULT[KEY] = { relations: [], icon: item.icon };
            }
            RESULT[KEY].relations.push(item.description.trim());
        });

        return Object.keys(RESULT)?.map(key => ({
            relationshipType: key,
            relations: RESULT[key].relations,
            icon: RESULT[key].icon
        }));
    }

    //There are some scenarios where we have to refresh and call get login user detials and navigate similar to initail login.
    //when we are in login page itself , or logout page we have to refresh and navigate to page based on rights.
    //during 403, 401 also need right based navigation.
    refreshAfterLogin() {
        const CURRENT_URL = window.location.href;
        const IS_HASH_AVAILABLE = CURRENT_URL.includes('/#/');
        const PATH_STR = ['login', 'logout', COI_ERROR_ROUTE_URLS.FORBIDDEN, COI_ERROR_ROUTE_URLS.UNAUTHORIZED, 'error/401', 'error/403'];
        if (PATH_STR.some((str) => CURRENT_URL.includes(str)) || !IS_HASH_AVAILABLE) {
            this.redirectToCOI();
        }
    }

    onFailedLogin(err): void {
        if (err.status == 401) {
            this.enableSSO ? window.location.reload() : this._router.navigate(['/login']);
        } else if (err.status === 403) {
            this.navigateToErrorRoute('FORBIDDEN');
        }
    }

    checkFCOIRights(): boolean {
        return this.getAvailableRight(COI_DISCLOSURE_SUPER_ADMIN_RIGHTS) || this.isCoiReviewer || this.getAvailableRight(ADMIN_DASHBOARD_RIGHTS);
    }

    checkManagementPlanRights(): boolean {
        return this.getAvailableRight(CMP_RIGHTS) || this.isCmpReviewer;
    }

    checkFCOIDashboardRights(dashboardType: 'DISCLOSURES_AND_CMP' | 'CMP_ONLY' | 'DISCLOSURE_ONLY'): boolean {
        const IS_SHOW_ADMIN_DASHBOARD = this.isShowFinancialDisclosure || this.isShowTravelDisclosure || this.isShowConsultingDisclosure;
        const CAN_ACCESS_DISCLOSURE_DASHBOARD = this.checkFCOIRights() && IS_SHOW_ADMIN_DASHBOARD;
        const CAN_ACCESS_CMP_TAB = this.checkManagementPlanRights() && this.isShowManagementPlan;
        if (dashboardType === 'DISCLOSURES_AND_CMP') {
            return CAN_ACCESS_DISCLOSURE_DASHBOARD || CAN_ACCESS_CMP_TAB;
        } else if (dashboardType === 'CMP_ONLY') {
            return CAN_ACCESS_CMP_TAB
        } else if (dashboardType === 'DISCLOSURE_ONLY') {
            return CAN_ACCESS_DISCLOSURE_DASHBOARD;
        }
        switch (dashboardType) {
            case 'CMP_ONLY': return CAN_ACCESS_CMP_TAB;
            case 'DISCLOSURE_ONLY': return CAN_ACCESS_DISCLOSURE_DASHBOARD;
            case 'DISCLOSURES_AND_CMP': return CAN_ACCESS_DISCLOSURE_DASHBOARD || CAN_ACCESS_CMP_TAB;
            default:return false;
        }
    }

    checkProjectDashboardRight(): boolean {
        return this.getAvailableRight(PROJECT_DASHBOARD_RIGHTS);
    }

    checkOPARights(): boolean {
        return this.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || (this.isOPAReviewer && this.opaApprovalFlowType !== 'NO_REVIEW') || this.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
    }

    redirectToCOI(): void {
        const URL = sessionStorage.getItem('url');
        if (URL) {
            this.readRedirectPathFromURL(URL);
        } else {
            this.fetchPermissions(true).then((res) => {
                this.redirectionBasedOnRights();
            });
        }
    }

    private redirectionBasedOnRights(): void {
        const IS_SUPER_ADMIN = this.getAvailableRight(COI_DISCLOSURE_SUPER_ADMIN_RIGHTS) && (this.isShowFinancialDisclosure || this.isShowTravelDisclosure || this.isShowConsultingDisclosure);
        const CAN_VIEW_FCOI_DISCLOSURE = this.getAvailableRight(FCOI_PROJECT_DISCLOSURE_RIGHTS) && this.isShowFinancialDisclosure;
        const CAN_VIEW_TRAVEL_DISCLOSURE = this.getAvailableRight(TRAVEL_DISCLOSURE_RIGHTS) && this.isShowTravelDisclosure;
        const CAN_VIEW_CONSULTING_DISCLOSURE = this.getAvailableRight(CONSULTING_DISCLOSURE_RIGHTS) && this.isShowConsultingDisclosure;
        const CAN_VIEW_FCOI_DASHBOARD = IS_SUPER_ADMIN || CAN_VIEW_FCOI_DISCLOSURE || CAN_VIEW_TRAVEL_DISCLOSURE || CAN_VIEW_CONSULTING_DISCLOSURE;
        const CAN_VIEW_PROJECT_DASHBOARD = this.checkProjectDashboardRight() && this.isShowFinancialDisclosure;
        const CAN_VIEW_OPA_DASHBOARD = (this.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || this.getAvailableRight(OPA_DISCLOSURE_RIGHTS)) && this.isShowOpaDisclosure;
        const CAN_VIEW_ENTITY_DASHBOARD = this.getAvailableRight(ENTITY_DASHBOARD_RIGHTS);
        // Ordered redirection logic – DO NOT CHANGE ORDER
        const REDIRECT_PRIORITY_ORDER: { label: string; condition: boolean; route: string; }[] = [
            { label: 'FCOI_DASHBOARD', condition: CAN_VIEW_FCOI_DASHBOARD, route: ADMIN_DASHBOARD_URL },
            { label: 'PROJECT_DASHBOARD', condition: CAN_VIEW_PROJECT_DASHBOARD, route: PROJECT_DASHBOARD_URL },
            { label: 'OPA_DASHBOARD', condition: CAN_VIEW_OPA_DASHBOARD, route: OPA_DASHBOARD_ROUTE_URL },
            { label: 'ENTITY_DASHBOARD', condition: CAN_VIEW_ENTITY_DASHBOARD, route: ENTITY_DASHBOARD_URL }
        ];
        // Preserve strict evaluation order - do not reorder entries above
        const ROUTE_URL = REDIRECT_PRIORITY_ORDER.find(r => r.condition)?.route || USER_DASHBOARD_CHILD_ROUTE_URLS.MY_HOME_ROUTE_URL;
        this._router.navigate([ROUTE_URL]);
    }

    removeUserDetailsFromLocalStorage() {
        ['authKey', 'cookie', 'sessionId', 'currentTab'].forEach((item) => localStorage.removeItem(item));
    }

    fetchAllNotifications(notificationRequest: NotificationTypeRO) {
        return this._http.post(this.fibiUrl + '/getNotifications', notificationRequest);
    }

    getSectionName(tabName, section) {
        const sectionDetails = tabName.get(section);
        if (sectionDetails) {
           return sectionDetails.sectionName;
        }
   }

   getSectionId(tabName, section) {
       const sectionDetails = tabName.get(section);
       if (sectionDetails) {
           return sectionDetails.sectionId;
       }
   }

   getSubSectionId(tabName, section) {
       const sectionDetails = tabName.get(section);
       if (sectionDetails) {
           return sectionDetails.subSectionId;
       }
   }

    openCommonAttachmentModal(coiAttachmentModalInfo: COIAttachmentModalInfo): void {
        this.coiAttachmentModalInfo = { ...coiAttachmentModalInfo };
        this.coiAttachmentModalInfo.isOpenAttachmentModal = true;
    }

    closeCommonAttachmentModal(): void {
        this.coiAttachmentModalInfo = new COIAttachmentModalInfo();
    }

    setChangesAvailable(hasChange: boolean) {
        this.hasChangesAvailable = hasChange;
        if (!hasChange) {
            this.navigateToRoute();
        }
    }

    navigateToRoute() {
        if (this.isNavigationStopped) {
            hideModal('coi-entity-confirmation-modal');
            this._router.navigateByUrl(this.attemptedPath);
        }
    }

    hideSuccessErrorToast(): void {
        hideAutoSaveToast('SUCCESS');
        hideAutoSaveToast('ERROR');
    }

    showAutoSaveSpinner(): void {
        this.hideSuccessErrorToast();
        this.autoSaveSavingSpinner = 'SHOW';
    }

    hideAutoSaveSpinner(toastType: 'SUCCESS' | 'ERROR'): void {
        setTimeout(() => {
            if (!this.loaderRestrictedUrls.length) {
                this.autoSaveSavingSpinner = 'HIDE';
                showAutoSaveToast(toastType);
            }
        });
    }

    fetchNotesList(personId: number | string) {
        return this._http.get(`${this.baseUrl}/notes/fetch/${personId}`);
    }

    getProjDisclByType(projectTypeCode: number | string): Observable<boolean> {
        return this._http.get<boolean>(`${this.baseUrl}/fcoiDisclosure/getProjectDisclosures/${projectTypeCode}`);
    }

    getAllProjDiscl(): Observable<boolean> {
        return this._http.get<boolean>(`${this.baseUrl}/fcoiDisclosure/getProjectDisclosures`);
    }

    voidProjDisclByType(projectTypeCode: number | string): Observable<any> {
        return this._http.get(`${this.baseUrl}/fcoiDisclosure/markProjectDisclosureAsVoid/${projectTypeCode}`);
    }

    voidAllProjDiscl(): Observable<any> {
        return this._http.get(`${this.baseUrl}/fcoiDisclosure/markProjectDisclosureAsVoid`);
    }

    getActiveFcoiProjectTypes(): CoiProjectType[] {
        return this.coiProjectTypes?.filter((projectType: CoiProjectType) => projectType?.projectDisclosureNeeded && projectType?.fcoiNeeded) || [];
    }

    checkFcoiUnlinkedProjDiscl(): Observable<boolean> {
        const ACTIVE_FCOI_PROJECT_TYPES = this.getActiveFcoiProjectTypes();
        if (!ACTIVE_FCOI_PROJECT_TYPES.length) {
            return of(false);
        }
        return ACTIVE_FCOI_PROJECT_TYPES.length === 1
            ? this.getProjDisclByType(ACTIVE_FCOI_PROJECT_TYPES[0].coiProjectTypeCode)
            : this.getAllProjDiscl();
    }

    markProjectDisclosureAsVoid(): Observable<any> {
        const ACTIVE_FCOI_PROJECT_TYPES = this.getActiveFcoiProjectTypes();
        if (!ACTIVE_FCOI_PROJECT_TYPES.length) {
            return of(false);
        }
        return ACTIVE_FCOI_PROJECT_TYPES.length === 1
            ? this.voidProjDisclByType(ACTIVE_FCOI_PROJECT_TYPES[0].coiProjectTypeCode)
            : this.voidAllProjDiscl();
    }

    openProjDisclCreateModal(projectTypeCode: number | string | null, selectedProject?: SharedProjectDetails): void {
        this.projDisclCreateModal = { projectTypeCode, selectedProject, isOpenModal: true };
    }

    closeProjDisclCreateModal(): void {
        closeCommonModal('coi-create-project-disclosure-modal');
        setTimeout(() => {
            this.projDisclCreateModal = new ProjDisclCreateModal();
        }, 200);
    }

    private buildLookupCacheKey(source: 'COI' | 'FIBI', table: string, column: string, isActive?: 'Y' | 'N' | null): string {
        return `${table}#${column}${isActive ? `#${isActive}` : ''}#${source}`;
    }

    private async fetchAndCacheLookup(url: string, payload: any, cacheKey: string): Promise<any[]> {
        return new Promise((resolve) => {
            this._http.post(url, payload).subscribe({
                next: (lookup: any[]) => {
                    this.coiLookups[cacheKey] = lookup;
                    resolve(lookup);
                },
                error: () => {
                    this.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    resolve(null);
                }
            });
        });
    }

    async getOrFetchLookup(table: string, column: string, isActive: 'Y' | 'N' | null = null): Promise<any[]> {
        const cacheKey = this.buildLookupCacheKey('COI', table, column, isActive);
        return this.coiLookups.hasOwnProperty(cacheKey)
            ? this.coiLookups[cacheKey]
            : this.fetchAndCacheLookup(`${this.baseUrl}/coiCustom/getLookupValues`, { lookupTableName: table, lookupTableColumnName: column, isActive }, cacheKey);
    }

    async getOrFetchFibiLookup(table: string, column: string): Promise<any[]> {
        const cacheKey = this.buildLookupCacheKey('FIBI', table, column);
        return this.coiLookups.hasOwnProperty(cacheKey)
            ? this.coiLookups[cacheKey]
            : this.fetchAndCacheLookup(`${this.fibiUrl}/getLookUpDatas`, { lookUpTableName: table, lookUpTableColumnName: column }, cacheKey);
    }

    openNewEntityCreateModal(entityCreationModalConfig: EntityCreationModalConfig): void {
        this.entityCreationModalConfig = { ...entityCreationModalConfig };
    }

    closeNewEntityCreateModal(): void {
        closeCommonModal('coi-create-new-entity-modal');
        setTimeout(() => {
            this.entityCreationModalConfig = new EntityCreationModalConfig();
        }, 200);
    }

    openActionListSlider(inboxObject = new InboxObject(), actionListOptions: ActionListOptions[] = ['PAGINATION', 'UPDATE_DATE', 'ACTION_BTN']): void {
        this.actionListSliderConfig = { inboxObject, actionListOptions, isOpenSlider: true };
    }

    closeActionListSlider(): void {
        this.actionListSliderConfig = new ActionListSliderConfig();
    }

    openCOIValidationModal(validationModalInfo: COIValidationModalConfig): void {
        this.validationModalInfo = validationModalInfo;
        setTimeout(() => {
            openCommonModal(this.validationModalInfo.modalId);
        }, 200);
    }

    openAddSFILeaveModal(): void {
        const CONFIG = new COILeavePageModalConfig();
        CONFIG.triggeredFrom = 'ADD_SFI_LEAVE_PAGE';
        CONFIG.unsavedChangesPageName = 'Engagement - Relationship Details';
        this.openCOILeavePageModal(CONFIG);
    }

    closeCOILeavePageModal(): void {
        closeCommonModal(this.leavePageModalInfo.modalId);
        setTimeout(() => {
            this.leavePageModalInfo = new COILeavePageModalConfig();
        }, 200);
    }

    openCOILeavePageModal(leavePageModalInfo: COILeavePageModalConfig): void {
        if(!this.checkModalAlreadyOpened(leavePageModalInfo.modalId)) {
            this.leavePageModalInfo = leavePageModalInfo;
            this.leavePageModalInfo.message = leavePageModalInfo.message ? leavePageModalInfo.message : this.changeLeavePageModalMessage(LEAVE_PAGE_MODAL_MSG, leavePageModalInfo.unsavedChangesPageName)
            setTimeout(() => {
                openCommonModal(this.leavePageModalInfo.modalId);
            }, 200);
        }
    }

    /**
     * Generates an HTML-formatted message to guide users on disclosure actions
     * based on engagement status, project type, and the type of message context.
     *
     * @param messageType - Context for the message: 
     *                      'TO_ACTIVATE' (after creating engagement), 
     *                      'AFTER_SAVE_COMPLETE' (after saving response), 
     *                      'MODIFY' (when engagement is modified)
     * @returns HTML-formatted string message
     */
    getEngagementDisclosureVoidMessage(messageType: 'TO_ACTIVATE' | 'AFTER_SAVE_COMPLETE' | 'MODIFYING' | 'TO_ADD_RELATION'): string {
        const IS_FINANCIAL_ENGAGEMENT = this.engagementTypeForCoiDisclosure !== 'ALL_ENG';
        const { TERM_COMMITMENT_FOR_REL_PILLS, TERM_FINANCIAL_FOR_REL_PILLS } = ENGAGEMENT_LOCALIZE;
        const TERM_FINANCIAL = this.engagementTypeForCoiDisclosure === 'ALL_SFI'
                        ? ENGAGEMENT_LOCALIZE.TERM_SIGNIFICANT_FINANCIAL : ENGAGEMENT_LOCALIZE.TERM_FINANCIAL_FOR_REL_PILLS + 'relationship';
        const PROJECT_TYPE = this.activeProjectsTypes?.length === 1
            ? (COMMON_DISCL_LOCALIZE.PROJECT_BADGE_PREFIX + this.activeProjectsTypes[0]?.description) || 'project'
            : 'project';
        switch (messageType) {
            case 'TO_ACTIVATE':
            case 'TO_ADD_RELATION': {
                const ENGAGEMENT_TEXT = IS_FINANCIAL_ENGAGEMENT
                    ? `An engagement with ${TERM_FINANCIAL} has been created`
                    : 'An engagement has been created';
                return `${ENGAGEMENT_TEXT}. Please create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL} or revise your ${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure.<br><strong>Confirm:</strong> All your ${PROJECT_TYPE} disclosures will be marked as void and removed from your disclosure list.`;
            }
            case 'AFTER_SAVE_COMPLETE': {
                const ENGAGEMENT_TEXT = IS_FINANCIAL_ENGAGEMENT
                    ? `Based on your response, ${TERM_FINANCIAL} and ${TERM_COMMITMENT_FOR_REL_PILLS} relationship has been identified. Please create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL} or revise your ${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure.`
                    : `Based on your response, please create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL} or revise your ${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure.`;
                return `${ENGAGEMENT_TEXT} <br><strong>Confirm:</strong><ul>
                    <li>You have pending ${PROJECT_TYPE} disclosures. Upon clicking the button <strong>"Mark as Void"</strong>, the pending ${PROJECT_TYPE} disclosure will be removed from your disclosure list and marked as void.</li>
                    <li>Click <strong>"Deactivate Engagement"</strong> to make this engagement inactive so it will not be included in any of your disclosures.</li></ul>`;
            }
            case 'MODIFYING': {
                return `You are required to create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL} or revise your ${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure due to modification in the engagement.<br><strong>Confirm:</strong><ul>
                    <li>You have pending ${PROJECT_TYPE} disclosures. Upon clicking the button <strong>"Mark as Void"</strong>, the pending ${PROJECT_TYPE} disclosure will be removed from your disclosure list and marked as void.</li>
                    <li>Click <strong>"Deactivate Engagement"</strong> to make this engagement inactive so it will not be included in any of your disclosures.</li></ul>`;
            }
            default: return null;
        }
    }

    checkModalAlreadyOpened(modalId: string): boolean {
        const modal = document.getElementById(modalId);
        return modal ? modal?.classList?.contains('show') : false;
    }

    changeLeavePageModalMessage(message: string, unsavedChangesPageName: string) {
        return message.replace('${pageName}', unsavedChangesPageName);
    }

    closeCOIValidationModal(): void {
        closeCommonModal(this.validationModalInfo.modalId);
        setTimeout(() => {
            this.validationModalInfo = new COIValidationModalConfig();
        }, 200);
    }

    setProjectCardDetails(projectDetails: ProjectDetails): SharedProjectDetails {
        if (projectDetails) {
            const {
                projectNumber, sponsorCode, primeSponsorCode, sponsorName, leadUnitName: homeUnitName, leadUnitNumber: homeUnitNumber, primeSponsorName, projectStatus, piName,
                projectStartDate, projectEndDate, projectBadgeColour, projectIcon, projectType, projectTypeCode, title: projectTitle, documentNumber, accountNumber, projectId,
                keyPersonRole: reporterRole
            } = projectDetails;

            return {
                projectNumber, sponsorCode, primeSponsorCode, sponsorName, homeUnitName, homeUnitNumber, primeSponsorName, projectStatus, piName, projectStartDate,
                projectEndDate, projectBadgeColour, projectIcon, projectType, projectTypeCode, projectTitle, documentNumber, accountNumber, projectId, reporterRole
            };
        }
    }

    getApplicableFormRO(moduleItemCode: string, moduleSubItemCode: string, documentOwnerPersonId: string, moduleItemKey: string): ApplicableFormRO {
        return {
            moduleItemCode,
            moduleSubItemCode,
            documentOwnerPersonId,
            moduleItemKey
        };
    }

    getApplicableForms(getFormObj: ApplicableFormRO): Observable<any> {
        return this._http.post(this.formUrl + '/formbuilder/getApplicableForms', getFormObj);
    }

    fetchEachOrAllEngagements(params: FetchEachOrAllEngagementsRO) {
        return this._http.post(this.baseUrl + '/personEntity/fetch', params);
    }

    setDisclosureTypeVisibility(coiDisclosureTypes: CoiDisclosureType[]): void {
        const ACTIVE_DISCLOSURE_TYPE_CODE = coiDisclosureTypes.map((item) => item.disclosureTypeCode);
        ACTIVE_DISCLOSURE_TYPE_CODE.forEach(disclosureTypeCode => {
            switch (disclosureTypeCode) {
              case DISCLOSURE_TYPE_CODE?.FINANCIAL_DISCLOSURE_TYPE_CODE:
                this.isShowFinancialDisclosure = true;
                break;
              case DISCLOSURE_TYPE_CODE?.OPA_DISCLOSURE_TYPE_CODE:
                this.isShowOpaDisclosure = true;
                break;
              case DISCLOSURE_TYPE_CODE?.TRAVEL_DISCLOSURE_TYPE_CODE:
                this.isShowTravelDisclosure = true;
                break;
              case DISCLOSURE_TYPE_CODE?.CONSULTING_DISCLOSURE_TYPE_CODE:
                this.isShowConsultingDisclosure = true;
                break;
            }
        });
    }

    closeMatSelectOpened(): void {
        const SELECT_PANEL = document.querySelector('.mat-mdc-select-panel');
        if (SELECT_PANEL) {
            const BACKDROP = document.querySelector('.cdk-overlay-backdrop');
            if (BACKDROP) {
                (BACKDROP as HTMLElement).click();
            }
        }
    }

    private readRedirectPathFromURL(url: string): void {
        url = url.substr(5);
        url = url.replace(/AND/g, '&');
        window.location.hash = url;
        sessionStorage.clear();
    }

    canAllowStateFreeText(countryCode): boolean {
        return !COUNTRY_CODE_FOR_ALLOW_LOOKUP_ONLY.includes(countryCode);
    }

    getDisclosureCommentsCount(params: DisclosureCommentsCountRO): Observable<any> {
        return this._http.post(`${this.baseUrl}/reviewComments/count`, params);
    }

    routeToPreviousURL(url): void {
        this._router.navigate([url]);
    }

    getProjectRelations(projectSfiRelationLoadRO: ProjectSfiRelationLoadRO): Observable<any> {
        return this._http.post(`${this.baseUrl}/fcoiDisclosure/project/relations`, projectSfiRelationLoadRO);
    }

    openReviewCommentSlider(reviewCommentsSliderConfig: COIReviewCommentsSliderConfig): void {
        this.reviewCommentsSliderConfig = deepCloneObject(reviewCommentsSliderConfig);
    }

    clearReviewCommentsSlider(): void {
        this.reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    }

    getDateIsBetweenPeriod(disclosure: any): boolean {
        const CURRENT_DATA = new Date();
        const IS_CURRENT_DATE_BETWEEN_CYCLE = (compareDates(disclosure?.opaCycles?.openDate, CURRENT_DATA) === -1) && (compareDates(disclosure?.opaCycles?.closeDate, CURRENT_DATA) === 1);
        const IS_CURRENT_DATE_CYCLE_OPEN = compareDates(disclosure?.opaCycles?.openDate, CURRENT_DATA) === 0;
        const IS_CURRENT_DATE_CYCLE_CLOSE = compareDates(disclosure?.opaCycles?.closeDate, CURRENT_DATA) === 0;
        return IS_CURRENT_DATE_BETWEEN_CYCLE || IS_CURRENT_DATE_CYCLE_OPEN || IS_CURRENT_DATE_CYCLE_CLOSE;
    }

    redirectToAttachmentTab(disclosureDetails: COICountModal, redirectedFromUrl: string): void {
        if (disclosureDetails?.count > 0) {
            sessionStorage.setItem('previousUrl', redirectedFromUrl);
            const DISCLOSURE_OWNER = disclosureDetails.personId === this.getCurrentUserDetail('personID');
            const IS_RETURNED_OR_WITHDRAW = [DISCLOSURE_REVIEW_STATUS.RETURNED, DISCLOSURE_REVIEW_STATUS.WITHDRAWN, DISCLOSURE_REVIEW_STATUS.PENDING].includes(disclosureDetails?.reviewStatusCode);
            const ROUTE = (IS_RETURNED_OR_WITHDRAW && DISCLOSURE_OWNER) ? FCOI_DISCLOSURE_CHILD_ROUTE_URLS.ATTACHMENT : FCOI_DISCL_VIEW_MODE_CHILD_ROUTE_URLS.ATTACHMENT;
            this._router.navigate([ROUTE], { queryParams: { disclosureId: disclosureDetails?.disclosureId } });
        }
    }

    /**
     * Returns only active certification types from the compliance declarations list.
     */
    getActiveDeclarationTypes(): DeclarationType[] {
        return this.declarationTypes?.filter(
            (declarationType: DeclarationType) => declarationType?.isActive
        );
    }
    

    /**
     * Builds and returns a normalized eligibility map.
     * - For each active declaration type, the value is `true` unless the input map explicitly contains `false`.
     * - Any declaration type not present in the input map defaults to `true`.
     */
    getDeclarationEligibilityMap(declarationEligibilityMap: Record<string, boolean>): Record<string, boolean> {
        const DECLARATION_ELIGIBILITY_MAP: Record<string, boolean> = {};
        this.activeDeclarationTypes?.map((declarationType: DeclarationType) => {
            DECLARATION_ELIGIBILITY_MAP[declarationType.declarationTypeCode] = declarationEligibilityMap[declarationType.declarationTypeCode] !== false;
        });
        return DECLARATION_ELIGIBILITY_MAP;
    }

    getDeclarationTypeDetails(declarationTypeCode: string | number): DeclarationType | null {
        if (!this.declarationTypes?.length) return null;
        return this.declarationTypes.find(
            declarationType => declarationType?.declarationTypeCode?.toString() === declarationTypeCode.toString()
        ) || null;
    }

    /**
     * Navigates to a specific COI error route based on the error type key.
     * Defaults to NOT_FOUND if the type is invalid.
     * @param type One of: 'FORBIDDEN', 'NOT_FOUND', 'UNAUTHORIZED', 'MAINTENANCE'
     */
    navigateToErrorRoute(type: keyof typeof COI_ERROR_ROUTE_URLS): void {
        const path = COI_ERROR_ROUTE_URLS[type] || COI_ERROR_ROUTE_URLS.NOT_FOUND;
        this._router.navigate([path]);
    }

    validateForm(configuration: any): Observable<any> {
        return this._http.post(this.formUrl + '/formbuilder/validateForm', configuration);
    }

    getHasAnyRights(rightsArray: string[], rights: string | string[], method: Method = 'SOME'): boolean {
        const RIGHTS_ARRAY = Array.isArray(rights) ? rights : [rights];
        if (method === 'EVERY') {
            return RIGHTS_ARRAY.every((right) => rightsArray?.includes(right));
        } else {
            return RIGHTS_ARRAY.some((right) => rightsArray?.includes(right));
        }
    }

    isDeptLevelRightsAvailable(unitNumber: string, rights: string[]): Observable<any> {
        return this._http.post(`${this.baseUrl}/coiCustom/isDeptLevelRightsAvailable`, { unitNumber, rights });
    }

    async getHasDepLevelRight(unitNumber: string, rights: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            this.isDeptLevelRightsAvailable(unitNumber, rights).subscribe({
                next: (hasRight: boolean) => {
                    resolve(hasRight);
                },
                error: () => {
                    this.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    resolve(null);
                }
            });
        });
    }

    /**
     * Determines if the logged-in user is an admin or can manage affiliated disclosures/declarations.
     * Safely handles null or undefined inputs.
     */
    getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission: boolean | null, adminPersonId: string, manageRights: string[] | string): boolean {
        const IS_LOGGED_USER_ADMIN_PERSON = adminPersonId === this.getCurrentUserDetail('personID');
        const IS_NON_AFFILIATED_DISCLOSURE = isHomeUnitSubmission === true;
        const HAS_AFFILIATION_MANAGE_RIGHT = this.getAvailableRight(manageRights);
        const CAN_EDIT_AFFILIATED_DISCLOSURE = IS_NON_AFFILIATED_DISCLOSURE === false && HAS_AFFILIATION_MANAGE_RIGHT;
        return IS_NON_AFFILIATED_DISCLOSURE || CAN_EDIT_AFFILIATED_DISCLOSURE || IS_LOGGED_USER_ADMIN_PERSON;
    }

    /**
     * Calls the API to check which department-level rights are available
     * for a specific unit. Returns an Observable of a key–value map,
     * where each right name maps to true/false.
     *
     * @param unitNumber - The unit number to check rights for
     * @param rights - The list of right names to validate
     * @returns Observable<Record<string, boolean>>
     */
    getDeptLevelAvailableRightsApi(unitNumber: string, rights: string[]): Observable<Record<string, boolean> | null> {
        return this._http.post<Record<string, boolean> | null>(`${this.baseUrl}/coiCustom/getDeptLevelAvailableRights`, { unitNumber, rightName: rights });
    }

    /**
     * Async wrapper for getDeptLevelAvailableRightsApi() that returns a Promise.
     * Useful when using async/await inside components or services.
     *
     * @param unitNumber - The unit number to check rights for
     * @param rights - The list of right names to validate
     * @returns Promise<Record<string, boolean>> - Map of right → boolean
     */
    async getDeptLevelAvailableRights(unitNumber: string, rights: string[]): Promise<Record<string, boolean> | null> {
        return new Promise((resolve) => {
            this.getDeptLevelAvailableRightsApi(unitNumber, rights).subscribe({
                next: (hasRight: Record<string, boolean>) => {
                    resolve(hasRight);
                },
                error: () => {
                    this.showToast(HTTP_ERROR_STATUS, 'Failed to check department-level rights. Please try again.');
                    resolve(null);
                }
            });
        });
    }

    removeApplicationPreLoader(): void {
        setTimeout(() => {
            const LOADER = document.getElementById(APPLICATION_FULL_LOADER_ID);
            if (LOADER) {
                LOADER.remove();
                document.body.classList.remove('overflow-hidden');
                this.isShowPreLoader = false;
            }
        }, 50);
    }

    getCoiProjectTypesMap(): Record<string, CoiProjectType> {
        return this.coiProjectTypes.reduce((acc, item) => {
            acc[item.coiProjectTypeCode] = item;
            return acc;
        }, {} as Record<string, CoiProjectType>);
    }

    openCmpCreationSlider(cmpCreationConfig?: CmpCreationConfig, cmpCreationSliderConfig?: CmpCreationSliderConfig): void {
        this.cmpCreationSliderConfig = { ...new CmpCreationSliderConfig(), ...cmpCreationSliderConfig};
        this.cmpCreationSliderConfig.cmpCreationConfig = { ...new CmpCreationConfig(), ...cmpCreationConfig};
        this.cmpCreationSliderConfig.isOpenSlider = true;
    }

    closeCmpCreationSlider(): void {
        this.cmpCreationSliderConfig = new CmpCreationSliderConfig();
    }


}
