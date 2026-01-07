import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getEndPointOptionsForLeadUnit, getEndPointOptionsForCountry, getEndPointOptionsForSponsor } from '../../../../fibi/src/app/common/services/end-point.config';
import {
    deepCloneObject, hideModal,
    isEmptyObject, openModal,
    setFocusToElement
} from '../../../../fibi/src/app/common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../fibi/src/app/common/utilities/subscription-handler';
import { CommonService } from '../common/services/common.service';
import { AdminDashboardService } from './admin-dashboard.service';
import {
    CONSULTING_DISCLOSURE_RIGHTS, TRAVEL_DISCLOSURE_RIGHTS,
    CONSULTING_REDIRECT_URL,DATE_PLACEHOLDER, DISCLOSURE_TYPE, FCOI_PROJECT_DISCLOSURE_RIGHTS, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS,
    POST_CREATE_DISCLOSURE_ROUTE_URL,
    POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
    ADVANCE_SEARCH_CRITERIA_IN_ADMIN_DASHBOARD,
    DEFAULT_DATE_FORMAT,
    PROJECT_TYPE,
    COI_MODULE_CODE,
    MAINTAIN_DISCL_FROM_AFFILIATED_UNITS,
    CONSULTING_REVIEW_STATUS,
    CONSULTING_DISCLOSURE_MANAGE_RIGHTS,
    TRAVEL_DISCLOSURE_MANAGE_RIGHTS,
    DISCLOSURE_CONFLICT_STATUS_BADGE,
    COI_REVIEW_STATUS_BADGE,
    COI_DISPOSITION_STATUS_BADGE,
    CONSULTING_REVIEW_STATUS_BADGE,
    CONSULTING_DISPOSITION_STATUS_BADGE,
    EMPLOYEE_LOOKUP,
} from '../app-constants';
import { NavigationService } from '../common/services/navigation.service';
import { fadeInOutHeight, listAnimation, topSlideInOut, slideInAnimation,
    scaleOutAnimation, leftSlideInOut, heightAnimation } from '../common/utilities/animations';
import { calculateFilledProperties, openCoiSlider, updateSearchField } from '../common/utilities/custom-utilities';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { compareDates, getDateObjectFromTimeStamp, isValidDateFormat, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { AdminDashboardResolvedData, AdminDashboardTabCount, AdminPathType, CmpDashboardRequest,
    CoiProjectOverviewRequest, ContentRole, DisclosureStatusFilterType } from './admin-dashboard.interface';
import { SortCountObj, CoiDashboardRequest, NameObject, CoiDashboardDisclosures } from './admin-dashboard.interface';
import { AttachmentSourceSection, COICountModal, COICountModalViewSlider } from '../shared-components/shared-interface';
import { ADV_SEARCH_CERT_DATE_ARIA_LABEL, ADV_SEARCH_CERT_DATE_TITLE,
        ADV_SEARCH_CONSULTING_CERT_DATE_AL, ADV_SEARCH_CONSULTING_CERT_DATE_TITLE, 
        ADV_SEARCH_CONSULTING_REVIEW_AL, ADV_SEARCH_CONSULTING_REVIEW_TITLE, 
        ADV_SEARCH_REVIEW_ARIA_LABEL, ADV_SEARCH_REVIEW_TITLE, ADV_SEARCH_TRAVEL_CERT_DATE_AL, 
        ADV_SEARCH_TRAVEL_CERT_DATE_TITLE, ADV_SEARCH_TRAVEL_REVIEW_AL, 
        ADV_SEARCH_TRAVEL_REVIEW_TITLE, ADV_SEARCH_DEPARTMENT_PH, 
        COI_CERTIFICATION_DATE, COMMON_DISCLOSURE_STATUS, COMMON_DISPOSITION_STATUS, 
        COI_REVIEW_STATUS, CONSULTING_CERTIFICATION_DATE, CONSULTING_REVIEW_STATUS_LABEL, 
        TRAVEL_CERTIFICATION_DATE, TRAVEL_REVIEW_STATUS_LABEL,
        ADV_SEARCH_PROJECT_NUMBER_PH, ADV_SEARCH_PROJECT_TITLE_PH, COMMON_DISCL_LOCALIZE, CMP_LOCALIZE
} from '../app-locales';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { ADMIN_DASHBOARD_NO_INFO_MESSAGE } from '../no-info-message-constants';
import { ElasticPersonSource, ElasticRolodexSource, GlobalEventNotifier, LookUpClass } from '../common/services/coi-common.interface';
import { CoiDashboardCardEvent } from '../shared-components/coi-disclosure-dashboard-card/coi-disclosure-dashboard-card.component';
import { ProjectSfiRelations } from '../disclosure/coi-interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER, FCOI_COMMENTS_RIGHTS, TRAVEL_COMMENTS_RIGHTS } from '../shared-components/coi-review-comments/coi-review-comments-constants';
import { DisclosureCompleteFinalReviewRO } from '../disclosure/coi-interface';
import { CoiReviewCommentSliderService } from '../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { TRAVEL_DISCL_REVIEW_STATUS_TYPE } from '../travel-disclosure/travel-disclosure-constants';
import { ADVANCE_SEARCH_CRITERIA_IN_CMP_ADMIN_DASHBOARD, CMP_BASE_URL,
    CMP_CREATION_URL, MAINTAIN_CMP_RIGHTS } from '../conflict-management-plan/shared/management-plan-constants';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
    animations: [fadeInOutHeight, listAnimation, topSlideInOut,leftSlideInOut,
        heightAnimation('0', '*', 300, 'heightAnimation'),
        slideInAnimation('0','12px', 400, 'slideUp'),
        slideInAnimation('0','-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px','0', 200, 'scaleOut'),
    ]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;
    @ViewChild('certificationDateInput', { static: false }) certificationDateInput?: ElementRef;
    @ViewChild('travelStartDateInput', { static: false }) travelStartDateInput?: ElementRef;
    @ViewChild('travelEndDateInput', { static: false }) travelEndDateInput?: ElementRef;
    @ViewChild('cmpApprovalStartDateInput', { static: false }) cmpApprovalStartDateInput?: ElementRef;
    @ViewChild('cmpApprovalEndDate', { static: false }) cmpApprovalEndDate?: ElementRef;
    @ViewChild('cmpExpirationStartDateInput', { static: false }) cmpExpirationStartDateInput?: ElementRef;
    @ViewChild('cmpExpirationEndDate', { static: false }) cmpExpirationEndDate?: ElementRef;
    setFocusToElement = setFocusToElement;
    isShowDisclosureList = false;
    currentSelected = {
        tab: 'IN_PROGRESS',
        filter: 'did'
    };
    isAssignAdminModalOpen = false;
    datePlaceHolder = DATE_PLACEHOLDER;
    advancedSearch = { hasSFI: true };
    conflictStatusOptions = 'coi_disc_det_status#DISC_DET_STATUS_CODE#true#true';
    disclosureStatusOptions = 'COI_CONFLICT_STATUS_TYPE#CONFLICT_STATUS_CODE#true#true';
    disclosureTypeOptions = 'COI_DISCLOSURE_FCOI_TYPE#FCOI_TYPE_CODE#true#true';
    disPositionOptions = 'COI_DISPOSITION_STATUS_TYPE#DISPOSITION_STATUS_CODE#true#true';
    coiReviewStatusOptions = 'COI_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true';
    travelDisclosureStatusOptions = 'coi_travel_disclosure_status#TRAVEL_DISCLOSURE_STATUS_CODE#true#true';
    travelDocumentStatusOptions = 'coi_travel_document_status_type#DOCUMENT_STATUS_CODE#true#true';
    travelReviewStatusOptions = 'coi_travel_review_status#REVIEW_STATUS_CODE#true#true';
    proposalStatusOptionsForProjectOverview = 'EMPTY#EMPTY#true#true#true#true';
    disclosureAdministratorOptions = 'EMPTY#EMPTY#true#true#true#true';
    cmpTypeOptions = 'COI_MANAGEMENT_PLAN_TYPE#CMP_TYPE_CODE#true#true';
    cmpStatusOptions = 'coi_mgmt_plan_status_type#STATUS_CODE#true#true';
    $subscriptions: Subscription[] = [];
    result: any = { disclosureCount: 0 };
    $coiList = new Subject();
    elasticPersonSearchOptions: any = {};
    elasticRolodexSearchOptions: any = {};
    leadUnitSearchOptions: any = {};
    countrySearchOptions: any = {};
    lookupValues = [];
    advSearchClearField: string;
    coiList: CoiDashboardDisclosures[] = [];
    isActiveDisclosureAvailable: boolean;
    advanceSearchDates = { approvalDate: null, expirationDate: null, certificationDate: null, travelStartDate: null, travelEndDate: null, approvalStartDate: null, approvalEndDate: null, expirationStartDate: null, expirationEndDate: null };
    advacnceSearchDatesForProjectOverview = {startDate : null, endDate : null}
    selectedStartReviewCoiId = null;
    selectedReviewStatusCode = null;
    isSaving = false;
    dashboardCounts = {
        conflictIdentifiedCount: 0,
        pendingEntityApproval: 0,
        unassignedCount: 0,
        newSubmissionsCount: 0,
        reviewCommentsCount: 0
    };
    comments: any[] = [];
    replyComment: any[] = [];
    searchText: any;
    entitySearchOptions: any = {};
    sortCountObj: SortCountObj;
    clearField: string;
    clearAdvSearchFields : string;
    countryClearField: string;
    isViewAdvanceSearch = true;
    hasReviewerRight = false;
    hasFCOIDisclosureRights = false;
    hasTravelDisclosureRights = false;
    hasConsultingDisclosureRights = false;
    isCoiAdminGroupMember = false;
    disclosureTypes: any;
    addAdmin: any = {};
    localCOIRequestObject: CoiDashboardRequest = new CoiDashboardRequest();
    localSearchDefaultValues: NameObject = new NameObject();
    isLoading = false;
    assignAdminPath: AdminPathType = 'DISCLOSURES';
    sortSectionsList = [];
    showSlider = false;
    entityId: any;
    disclosureSortSections = [
        { variableName: 'disclosurePersonFullName', fieldName: 'Person' },
        { variableName: 'disclosureCategoryType', fieldName: 'Disclosure Type' },
        { variableName: 'disclosureStatus', fieldName: COMMON_DISCLOSURE_STATUS },
        { variableName: 'dispositionStatus', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'reviewStatus', fieldName: COI_REVIEW_STATUS },
        { variableName: 'certificationDate', fieldName: COI_CERTIFICATION_DATE },
        { variableName: 'expirationDate', fieldName: 'Expiration Date' },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' },
    ];
    travelDisclosureSortSections = [
        { variableName: 'travellerName', fieldName: 'Person' },
        { variableName: 'travelEntityName', fieldName: 'Entity' },
        { variableName: 'documentStatusDescription', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'reviewDescription', fieldName: TRAVEL_REVIEW_STATUS_LABEL },
        { variableName: 'certifiedAt', fieldName: TRAVEL_CERTIFICATION_DATE },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' },
    ];
    consultingFormSortSection = [
        { variableName: 'fullName', fieldName: 'Person' },
        { variableName: 'entityName', fieldName: 'Entity' },
        { variableName: 'dispositionStatusDescription', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'reviewStatusDescription', fieldName: CONSULTING_REVIEW_STATUS_LABEL },
        { variableName: 'certifiedAt', fieldName: CONSULTING_CERTIFICATION_DATE },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' },
    ];
    cmpSortSection = [
        { variableName: 'fullName', fieldName: 'Person' },
        { variableName: 'homeUnitName', fieldName: CMP_LOCALIZE.TERM_DEPARTMENT },
        { variableName: 'cmpType', fieldName: `${CMP_LOCALIZE.TERM_CMP} Type` },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' },
    ];
    readMoreOrLess = [];
    isReadMore = false;
    selectedDisclosures = [];
    isAllDisclosuresSelected = false;
    isFcoiReadMore = false;
    isPurposeRead = false;
    isShowOptions = false;
    sliderElementId = '';
    $projectOverviewList = new Subject<any>();
    localProjectOverviewRO = new CoiProjectOverviewRequest();
    leadUnitSearchOptionsForProjectOverview: any = {};
    sponsorSearchOptionsForProjectOverview: any = {};
    primeSponsorSearchOptionsForProjectOverview: any = {};
    elasticPersonSearchOptionsForProjectOverview: any = {};
    lookupValuesForProjectOverview = [];
    coiCountModal = new COICountModal();
    lastOpenedCountModalData = new COICountModal();
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    advSearchDepartmentPlaceholder = ADV_SEARCH_DEPARTMENT_PH;
    isAdvanceSearchMade = false;
    advancedSearchCriteriaCount: number = 0;
    noDataMessage = ADMIN_DASHBOARD_NO_INFO_MESSAGE;
    lookupArrayForAdministrator: LookUpClass[] = [];
    dateValidationMap = new Map();
    projectRelationshipData = new ProjectSfiRelations();
    selectedDisclosureCount = 0;
    PROJECT_TYPE = PROJECT_TYPE;
    advSearchProjectNumberPH = ADV_SEARCH_PROJECT_NUMBER_PH;
    advSearchProjectTitlePH = ADV_SEARCH_PROJECT_TITLE_PH;
    coiModuleCode = COI_MODULE_CODE;
    advanceSearchTimeOut: any;
    loginPersonId = '';
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    isShowAdminDetails = false;
    adminDashboardTabCount: AdminDashboardTabCount;
    disclosureConflictStatusBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
    consultingDispositionStatusBadge = CONSULTING_DISPOSITION_STATUS_BADGE;
    consultingReviewStatusBadge = CONSULTING_REVIEW_STATUS_BADGE;
    coiDispositionStatusBadge = COI_DISPOSITION_STATUS_BADGE;
    coiReviewStatusBadge = COI_REVIEW_STATUS_BADGE;
    cmpCreateUrl = CMP_CREATION_URL;
    elasticPISearchOptions: any = {};
    sponsorSearchOptions: any = {};
    canMaintainCmp = false;
    canAccessCmpTab = false;
    departmentSearchOptions: any = {};
    localCmpRequestObject: CmpDashboardRequest = new CmpDashboardRequest();
    CMP_LOCALIZE = CMP_LOCALIZE;
    employeeLookup: LookUpClass[] = EMPLOYEE_LOOKUP;

    constructor(public coiAdminDashboardService: AdminDashboardService,
                private _router: Router,
                private _elasticConfig: ElasticConfigService,
                public commonService: CommonService,
                private _navigationService: NavigationService,
                private _informationAndHelpTextService: InformationAndHelpTextService,
                private _activatedRoute: ActivatedRoute,
                private _coiReviewCommentSliderService: CoiReviewCommentSliderService
    ) { document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this)); }

    async ngOnInit() {
        this.loginPersonId = this.commonService.getCurrentUserDetail('personID');
        this.getAdminDashboardTabCount();
        this.getPermissions();
        this.checkTravelDisclosureRights();
        this.checkForConsultingDisclosureRight();
        this.setDashboardConfigFromSnapshot();
        this.setDashboardTab();
        this.setSearchOptions();
        this.setAdvanceSearch();
        this.getDashboardDetails();
        this.checkForSort();
        this.checkForPagination();
        this.checkForAdvanceSearch();
        this.listenGlobalEventNotifier();
        this.isShowAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.coiApprovalFlowType);
    }

    private setDashboardConfigFromSnapshot(): void {
        const RESOLVED_DATA: AdminDashboardResolvedData = this._activatedRoute.snapshot.data.resolvedData;
        this._informationAndHelpTextService.moduleConfiguration = this.commonService.getSectionCodeAsKeys(RESOLVED_DATA?.moduleConfig);
        this.lookupArrayForAdministrator = RESOLVED_DATA?.lookupArrayForAdministrator;
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                // This emitter will be triggered either when the comment slider closes or when the API request fails.
                if (event?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                    if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(event?.content?.action)) {
                        this.$coiList.next();
                        this.commonService.clearReviewCommentsSlider();
                    }
                }
            })
        );
    }

    private getCommentBtnVisibility(disclosureDetails: CoiDashboardDisclosures): boolean {
        const TAB_NAME = this.coiAdminDashboardService.coiRequestObject.tabName;
        const IS_CONSULTING_TAB = TAB_NAME === 'CONSULTING_DISCLOSURES';
        const IS_TRAVEL_TAB = TAB_NAME === 'TRAVEL_DISCLOSURES';
        // Consulting tab → Comment Button hidden
        if (IS_CONSULTING_TAB) {
            return false;
        }
        // Reviewer always gets the Comment Button
        if (this.hasReviewerRight) {
            return true;
        }
        // Travel tab → check travel comments rights
        if (IS_TRAVEL_TAB) {
            return this.commonService.getAvailableRight(TRAVEL_COMMENTS_RIGHTS);
        }
        // Otherwise (FCOI tabs) → check doc-level comments rights
        return this.commonService.getAvailableRight(FCOI_COMMENTS_RIGHTS);
    }

    private getAdminDashboardTabCount(): void {
        const DASHBOARD_COUNT_RO = new CoiDashboardRequest();
        DASHBOARD_COUNT_RO.filterType = 'ALL';
        this.$subscriptions.push(this.coiAdminDashboardService.getAdminDashboardTabCount(DASHBOARD_COUNT_RO).subscribe((data: AdminDashboardTabCount) => {
            this.adminDashboardTabCount = data;
        },
        err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in getting Tab Count');
        }));
    }

    checkForPreviousURL() {
        return ['coi/disclosure', 'coi/travel-disclosure', CMP_BASE_URL].some((url) => this._navigationService.previousURL.includes(url));
    }

    checkForAdvanceSearch() {
        if (this.isAdvancedSearchMade() && this.checkForPreviousURL()) {
            this.isShowDisclosureList = true;
            if (this.coiAdminDashboardService.isAdvanceSearch) {
                this.isViewAdvanceSearch = true;
                this.fetchLocalObjectFromServiceObject();
                this.generateLookupArrayForDropdown();
                this.setDefaultSearchOptions();
            } else {
                if (this.coiAdminDashboardService.coiRequestObject.tabName === 'ALL_DISCLOSURES') {
                    this.isViewAdvanceSearch = true;
                    this.isShowDisclosureList = false;
                } else {
                    this.isViewAdvanceSearch = false;
                }
            }
            this.$coiList.next();
        } else {
            this.resetSortObjects();
            this.resetAdvanceSearchFields();
            if (this.coiAdminDashboardService.coiRequestObject.tabName !== 'ALL_DISCLOSURES') {
                this.$coiList.next();
            }
        }
    }

    checkForSort() {
        if (!isEmptyObject(this.coiAdminDashboardService.coiRequestObject.sort) && this.checkForPreviousURL()) {
            this.localCOIRequestObject.sort = deepCloneObject(this.coiAdminDashboardService.coiRequestObject.sort);
            this.sortCountObj = deepCloneObject(this.coiAdminDashboardService.sortCountObject);
        } else {
            this.resetSortObjects();
        }
    }

    checkForPagination() {
        if (this.checkForPreviousURL()) {
            this.localCOIRequestObject.currentPage = this.coiAdminDashboardService.coiRequestObject.currentPage;
        }
    }

    resetSortObjects() {
        this.localCOIRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.coiAdminDashboardService.coiRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.sortCountObj = new SortCountObj();
        this.coiAdminDashboardService.sortCountObject = new SortCountObj();
    }

    setDefaultSearchOptions() {
        this.elasticPersonSearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.personName || '';
        this.entitySearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.entityName || '';
        this.leadUnitSearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.departmentName || '';
        this.countrySearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.travelCountryName || '';
        this.elasticPISearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.piPersonName || '';
        this.sponsorSearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.sponsorName || '';
        this.departmentSearchOptions.defaultValue = this.coiAdminDashboardService.searchDefaultValues.departmentName || '';
    }

    generateLookupArrayForDropdown() {
        if (this.coiAdminDashboardService.coiRequestObject.property4.length) {
            this.generateLookupArray(this.coiAdminDashboardService.coiRequestObject.property4, 'property4');
        }
        if (this.coiAdminDashboardService.coiRequestObject.property5.length) {
            this.generateLookupArray(this.coiAdminDashboardService.coiRequestObject.property5, 'property5');
        }
        if (this.coiAdminDashboardService.coiRequestObject.property10.length) {
            this.generateLookupArray(this.coiAdminDashboardService.coiRequestObject.property10, 'property10');
        }
        if (this.coiAdminDashboardService.coiRequestObject.property20.length) {
            this.generateLookupArray(this.coiAdminDashboardService.coiRequestObject.property20, 'property20');
        }
        if (this.coiAdminDashboardService.coiRequestObject.property21.length) {
            this.generateLookupArray(this.coiAdminDashboardService.coiRequestObject.property21, 'property21');
        }
        
        if (this.coiAdminDashboardService.cmpRequestObject.cmpTypeCode.length) {
            this.generateLookupArray(this.coiAdminDashboardService.cmpRequestObject.cmpTypeCode, 'cmpTypeCode');
        }
        if (this.coiAdminDashboardService.cmpRequestObject.cmpStatusCode.length) {
            this.generateLookupArray(this.coiAdminDashboardService.cmpRequestObject.cmpStatusCode, 'cmpStatusCode');
        }
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        property.forEach(element => {
            this.lookupValues[propertyNumber].push({ code: element });
        });
    }

    isAdvancedSearchMade() {
        return !!Object.values(this.coiAdminDashboardService.coiRequestObject)
            .find(V => V && ((typeof (V) === 'string' && V) || (typeof (V) === 'object' && V.length)));
    }


    private setSearchOptions() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
        this.countrySearchOptions = getEndPointOptionsForCountry(this.commonService.fibiUrl);
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.elasticPISearchOptions = this._elasticConfig.getElasticForPerson();
        this.sponsorSearchOptions = getEndPointOptionsForSponsor({ baseUrl: this.commonService.fibiUrl });
        this.departmentSearchOptions = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
    }

    setAdvanceSearch() {
        sessionStorage.setItem('currentCOIAdminTab', this.coiAdminDashboardService.coiRequestObject.tabName);
        if (this.coiAdminDashboardService.coiRequestObject.tabName === 'ALL_DISCLOSURES') {
            this.isViewAdvanceSearch = true;
        } else {
            this.isShowDisclosureList = true;
            this.isViewAdvanceSearch = false;
        }
    }

    setDashboardTab() {
        this.setDefaultDashboard();
        this.checkForTravelDisclosureTabChange(this.coiAdminDashboardService.coiRequestObject.tabName);
    }

    private setDefaultDashboard(): void {
        const DEFAULT_TAB = this.getDefaultDashboard();
        const CURRENT_TAB = sessionStorage.getItem('currentCOIAdminTab') || DEFAULT_TAB;
        this.coiAdminDashboardService.coiRequestObject.tabName = this.isTabAccessible(CURRENT_TAB) ? CURRENT_TAB : DEFAULT_TAB;
        sessionStorage.setItem('currentCOIAdminTab', this.coiAdminDashboardService.coiRequestObject.tabName);
    }

    private getDefaultDashboard(): string {
        switch (true) {
            case this.hasFCOIDisclosureRights && this.commonService?.isShowFinancialDisclosure:
                return 'ALL_DISCLOSURES';
            case this.hasReviewerRight && this.commonService?.isShowFinancialDisclosure:
                return 'MY_REVIEWS';
            case this.hasTravelDisclosureRights && this.commonService?.isShowTravelDisclosure:
                return 'TRAVEL_DISCLOSURES';
            case this.hasConsultingDisclosureRights && this.commonService?.isShowConsultingDisclosure:
                return 'CONSULTING_DISCLOSURES';
            case this.canAccessCmpTab:
                return 'CMP';
            default:
                return '';
        }
    }

    private isTabAccessible(tabName: string | null): boolean {
        const TAB_ACCESS_MAP: { [key: string]: boolean } = {
            ALL_DISCLOSURES: this.hasFCOIDisclosureRights,
            NEW_SUBMISSIONS: this.hasFCOIDisclosureRights,
            NEW_SUBMISSIONS_WITHOUT_SFI: this.hasFCOIDisclosureRights,
            MY_REVIEWS: this.hasReviewerRight,
            ALL_REVIEWS: this.hasReviewerRight,
            TRAVEL_DISCLOSURES: this.hasTravelDisclosureRights,
            CONSULTING_DISCLOSURES: this.hasConsultingDisclosureRights,
            CMP: this.canAccessCmpTab,
        };
        return TAB_ACCESS_MAP[tabName || ''] ?? false;
    }

    toggleADSearch() {
        if (document.getElementById('collapseExample').classList.contains('show')) {
            document.getElementById('collapseExample').classList.remove('show');
        } else {
            document.getElementById('collapseExample').classList.add('show');
        }
    }

    getDashboardDetails() {
        this.$subscriptions.push(this.$coiList.pipe(
            switchMap(() => {
                this.clearSelectAllDisclosure();
                this.isLoading = true;
                return this.getAdminDashboard(); 
            }))
            .subscribe((data: any) => {
                this.result = data || [];
                if (this.result) {
                    this.coiList = this.getAdminDashboardList();
                    this.isLoading = false;
                    this.coiList.map(ele => {
                        if (ele) {
                            ele.projectHeader = (ele.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT) ? (`#${ele.projectNumber} - ${ele.projectTitle}`) : '';
                            ele.isShowCommentBtn = this.getCommentBtnVisibility(ele);
                        }
                    });
                }
                this.setEventTypeFlag();
            }));
    }

    private getAdminDashboard() {
        if (this.coiAdminDashboardService.coiRequestObject.tabName == 'CMP') {
            return this.coiAdminDashboardService.getCmpAdminDashboard(this.getCmpRequestObject());
        }
        return this.coiAdminDashboardService.getCOIAdminDashboard(this.getRequestObject());
    }
    
    private getCmpRequestObject(): CmpDashboardRequest {
        this.setAdvanceSearchValuesToServiceObject();
        return this.localCmpRequestObject;
    }

    private getAdminDashboardList(): any {
        const disclosureViews = this.result.disclosureViews || [];
        const travelDashboardViews = this.result.travelDashboardViews || [];
        const consultingDisclosureView = this.result.consultingDisclDashboardViews || [];
        const cmpDashboardView = this.result.records || [];
        return [...disclosureViews, ...travelDashboardViews, ...consultingDisclosureView, ...cmpDashboardView];
    }

    setEventTypeFlag() {
        this.isActiveDisclosureAvailable = !!this.coiList.find((ele: any) => ele?.disclosureSequenceStatusCode === '2');
    }

    getRequestObject() {
        this.setAdvanceSearchValuesToServiceObject();
        this.localCOIRequestObject.tabName = sessionStorage.getItem('currentCOIAdminTab');
        return this.localCOIRequestObject;
    }

    ngOnDestroy(): void {
        document.removeEventListener('mouseup', null);
        subscriptionHandler(this.$subscriptions);
        this.commonService.clearReviewCommentsSlider();
    }

    actionsOnPageChange(event) {
        if (this.coiAdminDashboardService.coiRequestObject.tabName === 'CMP') {
            if (this.localCmpRequestObject.currentPage != event) {
                this.localCmpRequestObject.currentPage = event;
                this.coiAdminDashboardService.cmpRequestObject.currentPage = event;
                this.$coiList.next();
            }
        } else {
            if (this.localCOIRequestObject.currentPage != event) {
                this.localCOIRequestObject.currentPage = event;
                this.coiAdminDashboardService.coiRequestObject.currentPage = event;
                this.$coiList.next();
            }
        }
    }

    changeTab(tabName) {
        this.coiList = [];
        this.isShowDisclosureList = false;
        this.coiAdminDashboardService.isAdvanceSearch = false;
        this.coiAdminDashboardService.coiRequestObject.tabName = tabName;
        this.getAdminDashboardTabCount();
        this.coiAdminDashboardService.coiRequestObject.sort = { 'updateTimeStamp': 'desc' };
        sessionStorage.setItem('currentCOIAdminTab', tabName);
        this.checkForTravelDisclosureTabChange(tabName);
        if (this.isAdvanceSearchTab(tabName)) {
            this.resetAdvanceSearchFields();
            this.setAdvanceSearch();
            if (tabName !== 'ALL_DISCLOSURES') {
                this.$coiList.next();
            }
        }
        this.localCOIRequestObject.tabName = tabName;
    }

    private checkForTravelDisclosureTabChange(tabName: string): void {
        if (!['TRAVEL_DISCLOSURES', 'CONSULTING_DISCLOSURES', 'CMP'].includes(tabName)) {
            this.assignAdminPath = 'DISCLOSURES';
            this.sortSectionsList = this.disclosureSortSections;
        } else if(tabName == 'TRAVEL_DISCLOSURES') {
            this.assignAdminPath = tabName;
            this.sortSectionsList = this.travelDisclosureSortSections;
        } else if(tabName == 'CONSULTING_DISCLOSURES'){
            this.assignAdminPath = tabName;
            this.sortSectionsList = this.consultingFormSortSection;
        } else if (tabName === 'CMP') {
            this.assignAdminPath = tabName;
            this.sortSectionsList = this.cmpSortSection;
        }
        this.localCOIRequestObject.filterType = tabName === 'NEW_SUBMISSIONS_WITHOUT_SFI' ? 'ALL' : null;
    }

    isAdvanceSearchTab(tabName): boolean {
        return [ 'ALL_DISCLOSURES', 'NEW_SUBMISSIONS', 'NEW_SUBMISSIONS_WITHOUT_SFI',
                 'MY_REVIEWS', 'ALL_REVIEWS', 'TRAVEL_DISCLOSURES', 'CONSULTING_DISCLOSURES', 'CMP' ].includes(tabName);
    }

    fetchMentionedComments() {
        this.$subscriptions.push(this.coiAdminDashboardService.loadCoiReviewComments({
            personId: this.loginPersonId,
            disclosureId: null,
            coiSubSectionsId: null,
            coiSectionsTypeCode: null,
            sort: 'desc'
        }).subscribe((res: any) => {
            this.comments = this.setCommentArray(res.coiReviewComments);
        }));
    }

    setCommentArray(commentArray: any) {
        const COMMENT_ARRAY = [];
        commentArray.forEach(comment => {
            if (!comment.coiParentCommentId) {
                const COMMENT = JSON.parse(JSON.stringify(comment));
                COMMENT.childComments = this.filterChildComments(comment.coiReviewCommentId, commentArray);
                COMMENT.isShowReplies = false;
                COMMENT_ARRAY.push(COMMENT);
            }
        });
        return COMMENT_ARRAY;
    }

    filterChildComments(parentCommentId: string, commentArray: any) {
        return commentArray.filter(comment => comment.coiParentCommentId === parentCommentId);
    }

    leadUnitChangeFunction(unit: any) {
        this.localCOIRequestObject.property3 = unit ? unit.unitNumber : null;
        this.localSearchDefaultValues.departmentName = unit ? unit.unitName : null;
    }

    selectPersonName(person: ElasticPersonSource) {
        this.localCOIRequestObject.property2 = person?.value ?? person?.prncpl_id ?? null;
        this.localCmpRequestObject.cmpPerson = person?.value ?? person?.prncpl_id ?? null;
        this.localSearchDefaultValues.personName = person?.value ?? person?.full_name ?? null;
        updateSearchField(this.localCOIRequestObject.freeTextSearchFields, 'PERSON', !!person?.value);
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'PERSON', !!person?.value);
    }

    selectRolodex(person: ElasticRolodexSource) {
        this.localCmpRequestObject.cmpRolodex = person?.value ?? person?.rolodex_id ?? null;
        this.localSearchDefaultValues.rolodexName = person?.value ?? person?.full_name ?? null;
        updateSearchField(this.localCOIRequestObject.freeTextSearchFields, 'ROLODEX', !!person?.value);
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'ROLODEX', !!person?.value);
    }

    setAdvanceSearchValuesToServiceObject() {
        this.localCOIRequestObject.property6 = parseDateWithoutTimestamp(this.advanceSearchDates.approvalDate);
        this.localCOIRequestObject.property23 = parseDateWithoutTimestamp(this.advanceSearchDates.certificationDate);
        this.localCOIRequestObject.property7 = parseDateWithoutTimestamp(this.advanceSearchDates.expirationDate);
        this.localCOIRequestObject.property25 = parseDateWithoutTimestamp(this.advanceSearchDates.travelStartDate);
        this.localCOIRequestObject.property26 = parseDateWithoutTimestamp(this.advanceSearchDates.travelEndDate);
        this.localCmpRequestObject.approvalStartDate = parseDateWithoutTimestamp(this.advanceSearchDates.approvalStartDate);
        this.localCmpRequestObject.approvalEndDate = parseDateWithoutTimestamp(this.advanceSearchDates.approvalEndDate);
        this.localCmpRequestObject.expirationStartDate = parseDateWithoutTimestamp(this.advanceSearchDates.expirationStartDate);
        this.localCmpRequestObject.expirationEndDate = parseDateWithoutTimestamp(this.advanceSearchDates.expirationEndDate);
        this.localCmpRequestObject.projectTitle = this.localCOIRequestObject.property12? this.localCOIRequestObject.property12 : null;
        this.localCmpRequestObject.projectNumber = this.localCOIRequestObject.property11? this.localCOIRequestObject.property11 : null;
    }

    onLookupSelect(data: any, property: string) {
        this.lookupValues[property] = data;
        this.localCOIRequestObject[property] = data.length ? data.map(d => d.code) : [];
    }
    onCmpLookupSelect(data: any, property: string) {
        this.lookupValues[property] = data;
        this.localCmpRequestObject[property] = data.length ? data.map(d => d.code) : [];
    }
    resetAndPerformAdvanceSearch() {
        this.resetAdvanceSearchFields();
        this.coiList = [];
        this.$coiList.next();
    }

    openCountModal(coi: CoiDashboardDisclosures, count: number | null = null, moduleCode: number = 0, inputType: AttachmentSourceSection = 'DISCLOSURE_TAB'): void {
        if (count > 0) {
            this.coiCountModal = {
                personUnit: coi?.unit,
                moduleCode: moduleCode,
                personId: coi?.personId,
                disclosureType: coi?.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT ? coi?.projectType : coi?.fcoiType,
                inputType: inputType,
                fcoiTypeCode: coi?.fcoiTypeCode,
                disclosureId: coi?.coiDisclosureId,
                projectHeader: coi?.projectHeader,
                personFullName: coi?.disclosurePersonFullName,
                reviewStatusCode: coi?.reviewStatusCode,
                count: count,
                isOpenCountModal: true
            };
            this.lastOpenedCountModalData = deepCloneObject(this.coiCountModal);
        }
    }

    formatTravellerTypes(travellerTypes: string): string {
        return travellerTypes ? (travellerTypes.split(',').map(travellerType => travellerType.trim()).join(', ')) : '';
    }

    performAdvanceSearch() { 
        this.advanceSearchTimeOut = setTimeout(() => {
            this.localCmpRequestObject.currentPage = 1;
            this.localCmpRequestObject.advancedSearch = 'A';
            this.setAdvanceSearchToServiceObject();
            this.isShowDisclosureList = true;
            this.coiList = [];
            this.coiAdminDashboardService.isAdvanceSearch = true;
            this.isAdvanceSearchMade = true;
            this.$coiList.next();      
            this.isViewAdvanceSearch = false;
            if (this.coiAdminDashboardService.coiRequestObject.tabName === 'CMP') {
                this.advancedSearchCriteriaCount = calculateFilledProperties(this.localCmpRequestObject, ADVANCE_SEARCH_CRITERIA_IN_CMP_ADMIN_DASHBOARD);
            } else {
                this.advancedSearchCriteriaCount = calculateFilledProperties(this.localCOIRequestObject, ADVANCE_SEARCH_CRITERIA_IN_ADMIN_DASHBOARD);
            }
            // Subtract 1 if both Start date and end date are filled 
            if (this.advanceSearchDates.travelStartDate && this.advanceSearchDates.travelEndDate) {
                this.advancedSearchCriteriaCount = this.advancedSearchCriteriaCount + 1;
            }
            if (this.advanceSearchDates.approvalStartDate && this.advanceSearchDates.approvalEndDate) {
                this.advancedSearchCriteriaCount = this.advancedSearchCriteriaCount + 1;
            }
            if (this.advanceSearchDates.expirationStartDate && this.advanceSearchDates.expirationEndDate) {
                this.advancedSearchCriteriaCount = this.advancedSearchCriteriaCount + 1;
            }
            this.dateValidationMap = new Map();
        }, 100);
    }

    toggleAdvanceSearch() {
        this.isViewAdvanceSearch = !this.isViewAdvanceSearch;
        if (!this.isViewAdvanceSearch) {
            this.coiAdminDashboardService.isAdvanceSearch = false;
        }
    }

    processDisclosureReview() {
        if (!this.isSaving && this.selectedStartReviewCoiId) {
            this.isSaving = true;
            if (this.selectedReviewStatusCode === '1') {
                this.startDisclosureReview();
            } else {
                this.completeDisclosureReview();
            }
        }
    }

    completeDisclosureReview() {
        this.$subscriptions.push(this.coiAdminDashboardService
            .completeCOIReview(this.selectedStartReviewCoiId)
            .subscribe((_res: any) => {
                // this._router.navigate(['fibi/coi/summary'], { queryParams: { disclosureId: this.selectedStartReviewCoiId }});
                // this.commonService.showToast(HTTP_SUCCESS_STATUS, `Review completed successfully.`);
                this.finishReviewRequest();
                this.$coiList.next();
            }, _err => {
                this.finishReviewRequest();
                // this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
            }));
    }

    startDisclosureReview() {
        this.$subscriptions.push(this.coiAdminDashboardService
            .startCOIReview(this.selectedStartReviewCoiId)
            .subscribe(async (res: any) => {
                await this._router.navigate(['fibi/coi/summary'], { queryParams: { disclosureId: res.coiDisclosure.disclosureId } });
                this.finishReviewRequest();
            }, _err => {
                this.finishReviewRequest();
                // this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
            }));
    }

    finishReviewRequest() {
        this.isSaving = false;
        this.clearSelectedReview();
    }

    clearSelectedReview() {
        this.selectedStartReviewCoiId = null;
        this.selectedReviewStatusCode = null;
    }

    getReviewStatusBadge(statusCode) {
        switch (statusCode) {
            case '1': return 'warning';
            case '2': return 'info';
            case '3': return 'success';
            case '4': return 'success';
            default: return 'danger';
        }
    }

    getDisclosureStatusBadge(statusCode) {
        switch (statusCode) {
            case '1': return 'warning';
            case '2':
            case '4':
            case '5':
                return 'info';
            case '3': case '6': return 'success';
            default: return 'danger';
        }
    }

    getDispositionStatusBadge(statusCode) {
        switch (statusCode) {
            case '1': return 'warning';
            case 2: return 'success';
            case 3: return 'danger';
            default: return 'info';
        }
    }

    getSubSectionDescription(comment: any) {
        return comment.coiSectionsTypeCode === '2' ? comment.coiFinancialEntity.coiEntity.coiEntityName :
            comment.coiDisclosureDetails.coiFinancialEntity.coiEntity.coiEntityName;
    }

    performReplyComment(comment: any, index: number) {
        if (this.replyComment[index] !== undefined && this.replyComment[index].trim() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this.coiAdminDashboardService
                .addCOIReviewComment(this.getCommentRequestObj(comment, index))
                .subscribe((res: any) => {
                    this.replyComment[index] = '';
                    comment.childComments.push(res.coiReviewComment);
                    comment.isShowReplies = true;
                    // this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added successfully.');
                    this.isSaving = false;
                }, _err => {
                    // this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in adding comment. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    getCommentRequestObj(comment: any, index: number) {
        return {
            coiReviewComment: {
                coiReviewId: comment.coiReviewId,
                disclosureId: comment.disclosureId,
                coiReviewActivityId: comment.coiReviewActivityId,
                coiSectionsTypeCode: comment.coiSectionsTypeCode,
                coiSectionsType: comment.coiSectionsType,
                coiSubSectionsId: comment.coiSubSectionsId,
                coiReviewCommentTag: [],
                comment: this.replyComment[index],
                coiParentCommentId: comment.coiReviewCommentId,
                isPrivate: comment.isPrivate
            }
        };
    }

    private resetAdvanceSearchFields() {
        this.sortCountObj = new SortCountObj();
        this.coiAdminDashboardService.coiRequestObject.tabName = sessionStorage.getItem('currentCOIAdminTab');
        this.localCOIRequestObject = new CoiDashboardRequest(this.coiAdminDashboardService.coiRequestObject.tabName);
        this.localSearchDefaultValues = new NameObject();
        this.coiAdminDashboardService.searchDefaultValues = new NameObject();
        this.coiAdminDashboardService.coiRequestObject = new CoiDashboardRequest(this.coiAdminDashboardService.coiRequestObject.tabName);
        this.coiAdminDashboardService.cmpRequestObject = new CmpDashboardRequest();
        this.localCmpRequestObject = new CmpDashboardRequest();
        this.resetDateInputs();
        if (this.coiAdminDashboardService.coiRequestObject.tabName !== 'ALL_DISCLOSURES') {
            this.coiAdminDashboardService.isAdvanceSearch = false;
        }
        this.isAdvanceSearchMade = false;
        this.lookupValues = [];
        this.setSearchOptions();
        this.dateValidationMap = new Map();
    }

    private getInputValue(inputRef?: ElementRef): string {
        return inputRef?.nativeElement?.value?.trim() || '';
    }

    private resetDateInputs(): void {
        if (this.getInputValue(this.certificationDateInput)) {
            this.certificationDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.travelStartDateInput)) {
            this.travelStartDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.travelEndDateInput)) {
            this.travelEndDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.cmpApprovalStartDateInput)) {
            this.cmpApprovalStartDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.cmpApprovalEndDate)) {
            this.cmpApprovalEndDate.nativeElement.value = '';
        }
        if (this.getInputValue(this.cmpExpirationStartDateInput)) {
            this.cmpExpirationStartDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.cmpExpirationEndDate)) {
            this.cmpExpirationEndDate.nativeElement.value = '';
        }
        this.advanceSearchDates = {
            approvalDate: null, expirationDate: null, certificationDate: null, travelStartDate: null,
            travelEndDate: null, approvalStartDate: null, approvalEndDate: null, expirationStartDate: null, expirationEndDate: null
        };

    }

    getEventType(disclosureSequenceStatusCode, disclosureCategoryType) {
        if (disclosureCategoryType === 1) {
            if (disclosureSequenceStatusCode === 2 || disclosureSequenceStatusCode === 1 && !this.isActiveDisclosureAvailable) {
                return 'Active';
            } else if (disclosureSequenceStatusCode === 1 && this.isActiveDisclosureAvailable) {
                return 'Revision';
            }
        } else if (disclosureCategoryType === 3) {
            return 'Proposal';
        }
    }

    sortResult(sortFieldBy) {
        this.sortCountObj[sortFieldBy]++;
        this.sortAdminDashboardTabs(sortFieldBy);
    }

    private sortAdminDashboardTabs(sortFieldBy: string) {
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.localCmpRequestObject.sort[sortFieldBy] = !this.localCOIRequestObject.sort[sortFieldBy] ? 'asc' : 'desc';
            this.localCOIRequestObject.sort[sortFieldBy] = !this.localCOIRequestObject.sort[sortFieldBy] ? 'asc' : 'desc';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.localCOIRequestObject.sort[sortFieldBy];
            delete this.localCmpRequestObject.sort[sortFieldBy];
        }
        this.updateCOISort();
        this.$coiList.next();
    }

    private updateCOISort(): void {
        this.coiAdminDashboardService.sortCountObject = deepCloneObject(this.sortCountObj);
        this.coiAdminDashboardService.cmpRequestObject.sort = deepCloneObject(this.localCmpRequestObject.sort);
        this.coiAdminDashboardService.coiRequestObject.sort = deepCloneObject(this.localCOIRequestObject.sort);
    }

    selectedEvent(event) {
        this.localCOIRequestObject.property8 = event?.value ?? event?.entity_id ?? null;
        this.localSearchDefaultValues.entityName = event?.value ?? event?.entity_name ?? null;
        updateSearchField(this.localCOIRequestObject.freeTextSearchFields, 'ENTITY', !!event?.value);
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'ENTITY', !!event?.value);
        this.localCmpRequestObject.entity = event?.value ?? event?.entity_id ?? null;
    }

    selectedCountryEvent(event) {
        this.localCOIRequestObject.property9 = event?.value ?? event?.countryCode ?? null;
        this.localSearchDefaultValues.travelCountryName = event?.value ?? event?.countryName ?? null;
        updateSearchField(this.localCOIRequestObject.freeTextSearchFields, 'COUNTRY', !!event?.value);
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'COUNTRY', !!event?.value);
    }

    isActive(colName) {
        if (!isEmptyObject(this.localCOIRequestObject.sort) && colName in this.localCOIRequestObject.sort) {
            return true;
        } else {
            return false;
        }
    }

    getPermissions() {
        this.hasFCOIDisclosureRights = this.commonService.getAvailableRight(FCOI_PROJECT_DISCLOSURE_RIGHTS);
        this.hasReviewerRight = this.commonService.isCoiReviewer;
        this.isCoiAdminGroupMember = this.commonService.getAvailableRight(['VIEW_ADMIN_GROUP_COI']);
        this.canMaintainCmp = this.commonService.getAvailableRight(MAINTAIN_CMP_RIGHTS) && this.commonService.isShowManagementPlan;
        this.canAccessCmpTab = this.commonService.checkFCOIDashboardRights('CMP_ONLY');
    }

    checkTravelDisclosureRights() {
        this.hasTravelDisclosureRights = this.commonService.getAvailableRight(TRAVEL_DISCLOSURE_RIGHTS);
    }

    checkForConsultingDisclosureRight() {
        this.hasConsultingDisclosureRights = this.commonService.getAvailableRight(CONSULTING_DISCLOSURE_RIGHTS);
    }

    formatTravellerListValues(travellerTypes: string): string {
        return travellerTypes ? travellerTypes.split(',').map(value => value.trim()).join(', ') : '';
    }

    redirectToDisclosure(coi) {
        sessionStorage.setItem('previousUrl', this._router.url);
        const redirectUrl = coi?.travelDisclosureId ? POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL : coi?.disclosureId ? CONSULTING_REDIRECT_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
        this._router.navigate([redirectUrl],
            { queryParams: { disclosureId: coi?.travelDisclosureId || coi?.coiDisclosureId || coi?.disclosureId } });
    }

    fetchLocalObjectFromServiceObject() {
        this.localCOIRequestObject.property1 = this.coiAdminDashboardService.coiRequestObject.property1 ?
            this.coiAdminDashboardService.coiRequestObject.property1 : null;
        this.localCOIRequestObject.property2 = this.coiAdminDashboardService.coiRequestObject.property2 ?
            this.coiAdminDashboardService.coiRequestObject.property2 : null;
        this.localCOIRequestObject.property3 = this.coiAdminDashboardService.coiRequestObject.property3 ?
            this.coiAdminDashboardService.coiRequestObject.property3 : null;
        this.localCOIRequestObject.property4 = this.coiAdminDashboardService.coiRequestObject.property4.length > 0 ?
            this.coiAdminDashboardService.coiRequestObject.property4 : [];
        this.localCOIRequestObject.property5 = this.coiAdminDashboardService.coiRequestObject.property5.length > 0 ?
            this.coiAdminDashboardService.coiRequestObject.property5 : [];
        this.localCOIRequestObject.property8 = this.coiAdminDashboardService.coiRequestObject.property8 ?
            this.coiAdminDashboardService.coiRequestObject.property8 : null;
        this.localCOIRequestObject.property9 = this.coiAdminDashboardService.coiRequestObject.property9 ?
            this.coiAdminDashboardService.coiRequestObject.property9 : null;
        this.localCOIRequestObject.property10 = this.coiAdminDashboardService.coiRequestObject.property10.length > 0 ?
            this.coiAdminDashboardService.coiRequestObject.property10 : [];
        this.localCOIRequestObject.property11 = this.coiAdminDashboardService.coiRequestObject.property11 ?
            this.coiAdminDashboardService.coiRequestObject.property11 : null;
        this.localCOIRequestObject.property12 = this.coiAdminDashboardService.coiRequestObject.property12 ?
            this.coiAdminDashboardService.coiRequestObject.property12 : null;
        this.localCOIRequestObject.property13 = this.coiAdminDashboardService.coiRequestObject.property13 ?
            this.coiAdminDashboardService.coiRequestObject.property13 : null;
        this.localCOIRequestObject.property14 = this.coiAdminDashboardService.coiRequestObject.property14 ?
            this.coiAdminDashboardService.coiRequestObject.property14 : null;
        this.localCOIRequestObject.property15 = this.coiAdminDashboardService.coiRequestObject.property15 ?
            this.coiAdminDashboardService.coiRequestObject.property15 : null;
        this.localCOIRequestObject.property21 = this.coiAdminDashboardService.coiRequestObject.property21 ?
            this.coiAdminDashboardService.coiRequestObject.property21 : [];
        this.localCOIRequestObject.property22 = this.coiAdminDashboardService.coiRequestObject.property22 ?
            this.coiAdminDashboardService.coiRequestObject.property22 : null;
        this.advanceSearchDates.approvalDate = this.localCOIRequestObject.property6 =
            this.coiAdminDashboardService.coiRequestObject.property6 ?
            getDateObjectFromTimeStamp(this.coiAdminDashboardService.coiRequestObject.property6) : null;
        this.advanceSearchDates.expirationDate = this.localCOIRequestObject.property7 =
            this.coiAdminDashboardService.coiRequestObject.property7 ?
            getDateObjectFromTimeStamp(this.coiAdminDashboardService.coiRequestObject.property7) : null;
        this.advanceSearchDates.certificationDate = this.localCOIRequestObject.property23 =
            this.coiAdminDashboardService.coiRequestObject.property23 ?
            getDateObjectFromTimeStamp(this.coiAdminDashboardService.coiRequestObject.property23) : null;
        this.localCOIRequestObject.property20 = this.coiAdminDashboardService.coiRequestObject.property20 ?
            this.coiAdminDashboardService.coiRequestObject.property20 : [];
        this.localCOIRequestObject.property24 = this.coiAdminDashboardService.coiRequestObject.property24 ?
            this.coiAdminDashboardService.coiRequestObject.property24 : null;
        this.advanceSearchDates.travelStartDate = this.localCOIRequestObject.property25 =
            this.coiAdminDashboardService.coiRequestObject.property25 ?
            getDateObjectFromTimeStamp(this.coiAdminDashboardService.coiRequestObject.property25) : null;
        this.advanceSearchDates.travelEndDate = this.localCOIRequestObject.property26 =
            this.coiAdminDashboardService.coiRequestObject.property26 ?
            getDateObjectFromTimeStamp(this.coiAdminDashboardService.coiRequestObject.property26) : null;
        this.localCOIRequestObject.advancedSearch = 'A';
        this.localSearchDefaultValues = this.coiAdminDashboardService.searchDefaultValues;
        this.localCOIRequestObject.freeTextSearchFields = this.coiAdminDashboardService?.coiRequestObject?.freeTextSearchFields ?
            this.coiAdminDashboardService.coiRequestObject.freeTextSearchFields : null;
       this.updateCmpLocalObject();
    }
  
    private updateCmpLocalObject(): void {
        // updates local cmp req object by fetching from service
        this.localCmpRequestObject.cmpPerson = this.coiAdminDashboardService.cmpRequestObject.cmpPerson ? this.coiAdminDashboardService.cmpRequestObject.cmpPerson : null;
        this.localCmpRequestObject.cmpRolodex = this.coiAdminDashboardService.cmpRequestObject.cmpRolodex ? this.coiAdminDashboardService.cmpRequestObject.cmpRolodex : null;
        this.localCmpRequestObject.cmpTypeCode = this.coiAdminDashboardService.cmpRequestObject.cmpTypeCode.length > 0 ? this.coiAdminDashboardService.cmpRequestObject.cmpTypeCode : [];
        this.localCmpRequestObject.cmpStatusCode = this.coiAdminDashboardService.cmpRequestObject.cmpStatusCode.length > 0 ? this.coiAdminDashboardService.cmpRequestObject.cmpStatusCode : [];
        this.advanceSearchDates.approvalStartDate = this.localCmpRequestObject.approvalStartDate =
            this.coiAdminDashboardService.cmpRequestObject.approvalStartDate ?
                getDateObjectFromTimeStamp(this.coiAdminDashboardService.cmpRequestObject.approvalStartDate) : null;
        this.advanceSearchDates.approvalEndDate = this.localCmpRequestObject.approvalEndDate =
            this.coiAdminDashboardService.cmpRequestObject.approvalEndDate ?
                getDateObjectFromTimeStamp(this.coiAdminDashboardService.cmpRequestObject.approvalEndDate) : null;
        this.advanceSearchDates.expirationStartDate = this.localCmpRequestObject.expirationStartDate =
            this.coiAdminDashboardService.cmpRequestObject.expirationStartDate ?
                getDateObjectFromTimeStamp(this.coiAdminDashboardService.cmpRequestObject.expirationStartDate) : null;
        this.advanceSearchDates.expirationEndDate = this.localCmpRequestObject.expirationEndDate =
            this.coiAdminDashboardService.cmpRequestObject.expirationEndDate ?
                getDateObjectFromTimeStamp(this.coiAdminDashboardService.cmpRequestObject.expirationEndDate) : null;
        this.localCmpRequestObject.leadUnit = this.coiAdminDashboardService.cmpRequestObject.leadUnit ? this.coiAdminDashboardService.cmpRequestObject.leadUnit : null;
        this.localCmpRequestObject.sponsorAwardNumber = this.coiAdminDashboardService.cmpRequestObject.sponsorAwardNumber ? this.coiAdminDashboardService.cmpRequestObject.sponsorAwardNumber : null;
        this.localCmpRequestObject.principleInvestigator = this.coiAdminDashboardService.cmpRequestObject.principleInvestigator ? this.coiAdminDashboardService.cmpRequestObject.principleInvestigator : null;
        this.localCmpRequestObject.sponsor = this.coiAdminDashboardService.cmpRequestObject.sponsor ? this.coiAdminDashboardService.cmpRequestObject.sponsor : null;
        this.localCmpRequestObject.entity = this.coiAdminDashboardService.cmpRequestObject.entity ? this.coiAdminDashboardService.cmpRequestObject.entity : null;
        this.localCmpRequestObject.projectTitle = this.coiAdminDashboardService.cmpRequestObject.projectTitle ? this.coiAdminDashboardService.cmpRequestObject.projectTitle : null;
        this.localCmpRequestObject.projectNumber = this.coiAdminDashboardService.cmpRequestObject.projectNumber ? this.coiAdminDashboardService.cmpRequestObject.projectNumber : null;
        this.localCmpRequestObject.homeUnit = this.coiAdminDashboardService.cmpRequestObject.homeUnit ? this.coiAdminDashboardService.cmpRequestObject.homeUnit : null;
        this.localCmpRequestObject.freeTextSearchFields = this.coiAdminDashboardService?.cmpRequestObject?.freeTextSearchFields ? this.coiAdminDashboardService.cmpRequestObject.freeTextSearchFields : null;
        this.localCmpRequestObject.advancedSearch = 'A';
    }

    setAdvanceSearchToServiceObject() {
        this.coiAdminDashboardService.coiRequestObject.property1 = this.localCOIRequestObject.property1 || null;
        this.coiAdminDashboardService.coiRequestObject.property2 = this.localCOIRequestObject.property2 || null;
        this.coiAdminDashboardService.coiRequestObject.property3 = this.localCOIRequestObject.property3 || null;
        this.coiAdminDashboardService.coiRequestObject.property4 = this.localCOIRequestObject.property4 || [];
        this.coiAdminDashboardService.coiRequestObject.property5 = this.localCOIRequestObject.property5 || [];
        this.coiAdminDashboardService.coiRequestObject.property8 = this.localCOIRequestObject.property8 || null;
        this.coiAdminDashboardService.coiRequestObject.property9 = this.localCOIRequestObject.property9 || null;
        this.coiAdminDashboardService.coiRequestObject.property10 = this.localCOIRequestObject.property10 || [];
        this.coiAdminDashboardService.coiRequestObject.property11 = this.localCOIRequestObject.property11 || null;
        this.coiAdminDashboardService.coiRequestObject.property12 = this.localCOIRequestObject.property12 || null;
        this.coiAdminDashboardService.coiRequestObject.property13 = this.localCOIRequestObject.property13 || null;
        this.coiAdminDashboardService.coiRequestObject.property14 = this.localCOIRequestObject.property14 || null;
        this.coiAdminDashboardService.coiRequestObject.property15 = this.localCOIRequestObject.property15 || null;
        this.coiAdminDashboardService.coiRequestObject.property20 = this.localCOIRequestObject.property20 || [];
        this.coiAdminDashboardService.coiRequestObject.property21 = this.localCOIRequestObject.property21 || [];
        this.coiAdminDashboardService.coiRequestObject.property22 = this.localCOIRequestObject.property22 || null;
        this.coiAdminDashboardService.coiRequestObject.property23 = parseDateWithoutTimestamp(
            this.advanceSearchDates.certificationDate) || null;
        this.coiAdminDashboardService.coiRequestObject.property6 = parseDateWithoutTimestamp(
            this.localCOIRequestObject.property6) || null;
        this.coiAdminDashboardService.coiRequestObject.property7 = parseDateWithoutTimestamp(
            this.advanceSearchDates.expirationDate) || null;
        this.coiAdminDashboardService.coiRequestObject.property24 = this.localCOIRequestObject.property24 || null;   
        this.coiAdminDashboardService.coiRequestObject.property25 = parseDateWithoutTimestamp(
            this.advanceSearchDates.travelStartDate) || null; 
        this.coiAdminDashboardService.coiRequestObject.property26 = parseDateWithoutTimestamp(
            this.advanceSearchDates.travelEndDate) || null;    
        this.coiAdminDashboardService.coiRequestObject.currentPage = this.localCOIRequestObject.currentPage;
        this.coiAdminDashboardService.searchDefaultValues.personName = this.localSearchDefaultValues.personName || null;
        this.coiAdminDashboardService.searchDefaultValues.entityName = this.localSearchDefaultValues.entityName || null;
        this.coiAdminDashboardService.searchDefaultValues.departmentName = this.localSearchDefaultValues.departmentName || null;
        this.coiAdminDashboardService.searchDefaultValues.travelCountryName = this.localSearchDefaultValues.travelCountryName || null;
        this.coiAdminDashboardService.coiRequestObject.freeTextSearchFields = this.localCOIRequestObject?.freeTextSearchFields || [];
        this.updateCmpServiceObject();
    }
     
    private updateCmpServiceObject(): void {
        this.coiAdminDashboardService.cmpRequestObject.cmpPerson = this.localCmpRequestObject.cmpPerson || null;
        this.coiAdminDashboardService.cmpRequestObject.cmpRolodex = this.localCmpRequestObject.cmpRolodex || null;
        this.coiAdminDashboardService.cmpRequestObject.cmpTypeCode = this.localCmpRequestObject.cmpTypeCode || [];
        this.coiAdminDashboardService.cmpRequestObject.cmpStatusCode = this.localCmpRequestObject.cmpStatusCode || [];
        this.coiAdminDashboardService.cmpRequestObject.approvalStartDate = parseDateWithoutTimestamp(
            this.advanceSearchDates.approvalStartDate) || null;
        this.coiAdminDashboardService.cmpRequestObject.approvalEndDate = parseDateWithoutTimestamp(
            this.advanceSearchDates.approvalEndDate) || null;
        this.coiAdminDashboardService.cmpRequestObject.expirationStartDate = parseDateWithoutTimestamp(
            this.advanceSearchDates.expirationStartDate) || null;
        this.coiAdminDashboardService.cmpRequestObject.expirationEndDate = parseDateWithoutTimestamp(
            this.advanceSearchDates.expirationEndDate) || null;
        this.coiAdminDashboardService.cmpRequestObject.leadUnit = this.localCmpRequestObject.leadUnit || null;
        this.coiAdminDashboardService.cmpRequestObject.sponsorAwardNumber = this.localCmpRequestObject.sponsorAwardNumber || null;
        this.coiAdminDashboardService.cmpRequestObject.principleInvestigator = this.localCmpRequestObject.principleInvestigator || null;
        this.coiAdminDashboardService.cmpRequestObject.sponsor = this.localCmpRequestObject.sponsor || null;
        this.coiAdminDashboardService.cmpRequestObject.entity = this.localCmpRequestObject.entity || null;
        this.coiAdminDashboardService.cmpRequestObject.projectTitle = this.localCOIRequestObject.property12 || null;
        this.coiAdminDashboardService.cmpRequestObject.projectNumber = this.localCOIRequestObject.property11 || null;
        this.coiAdminDashboardService.cmpRequestObject.homeUnit = this.localCmpRequestObject.homeUnit || null;
        this.coiAdminDashboardService.cmpRequestObject.currentPage = this.localCmpRequestObject.currentPage;
        this.coiAdminDashboardService.cmpRequestObject.freeTextSearchFields = this.localCmpRequestObject?.freeTextSearchFields || [];
    }

    showAssignAdminButton(coi: any): boolean {
        const tabName = this.coiAdminDashboardService.coiRequestObject.tabName;
        const IS_TRAVEL_ADMINISTRATOR = this.commonService.getAvailableRight(TRAVEL_DISCLOSURE_MANAGE_RIGHTS);
        const IS_CONSULTING_ADMINISTRATOR = this.commonService.getAvailableRight(CONSULTING_DISCLOSURE_MANAGE_RIGHTS);
        const HAS_AFFILIATION_MANAGE_RIGHT = this.commonService.getAvailableRight(MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
        const CAN_EDIT_AFFILIATED_DISCLOSURE = coi?.isHomeUnitSubmission === false && HAS_AFFILIATION_MANAGE_RIGHT;
        const CAN_MANAGE_DISCLOSURE = (coi?.isHomeUnitSubmission || CAN_EDIT_AFFILIATED_DISCLOSURE) && coi?.personId !== this.loginPersonId;
        const IS_SHOW_ASSIGN_ADMIN_BTN = (CAN_MANAGE_DISCLOSURE || coi?.adminPersonId === this.loginPersonId);
        switch (tabName) {
            case 'TRAVEL_DISCLOSURES':
                return (String(coi?.reviewStatusCode) === String(TRAVEL_DISCL_REVIEW_STATUS_TYPE.SUBMITTED)) && IS_TRAVEL_ADMINISTRATOR && IS_SHOW_ASSIGN_ADMIN_BTN;
            case 'CONSULTING_DISCLOSURES':
                return (String(coi?.reviewStatusCode) === String(CONSULTING_REVIEW_STATUS.SUBMITTED)) && IS_CONSULTING_ADMINISTRATOR;
            case 'NEW_SUBMISSIONS':
            case 'NEW_SUBMISSIONS_WITHOUT_SFI':
                return this.getManageDisclosureRight(coi?.fcoiTypeCode) && IS_SHOW_ASSIGN_ADMIN_BTN;
            default: return false;
        }
    }

    getManageDisclosureRight(fcoiTypeCode: string): boolean {
        const IS_FCOI_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_FCOI_DISCLOSURE');
        const IS_PROJECT_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_PROJECT_DISCLOSURE');
        switch (fcoiTypeCode) {
            case DISCLOSURE_TYPE.INITIAL:
            case DISCLOSURE_TYPE.REVISION:
                return IS_FCOI_ADMINISTRATOR;
            case DISCLOSURE_TYPE.PROJECT:
                return IS_PROJECT_ADMINISTRATOR;
            default:
                return ;
        }
    }

    cardActions(event: CoiDashboardCardEvent): void {
        if (event?.action === 'ASSIGN_ADMIN') {
            this.openAssignAdminModal(event.disclosureDetails);
        }
        if (event?.action === 'COMMENTS') {
            this.openReviewComment(event.disclosureDetails);
        }
    }

    openAssignAdminModal(coi): void {
        this.addAdmin.disclosureId = coi?.coiDisclosureId || coi?.travelDisclosureId || coi?.disclosureId;
        this.isAssignAdminModalOpen = true;
    }

    closeAssignAdminModal(event): void {
        if (event) {
            this.addAdmin.disclosureId = null;
            this.getAdminDashboardTabCount();
            this.$coiList.next();
        }
        this.isAssignAdminModalOpen = false;
    }

    getReviewerStatus(statusCode) {
        switch (statusCode) {
            case '3': return 'info';
            case '2': return 'success';
            case '1': return 'warning';
            default: return 'danger';
        }
    }

    viewSlider(event: COICountModalViewSlider): void {
        this.showSlider = event.isOpenSlider;
        this.entityId = event.entityId;
        this.sliderElementId = `admin-dashboard-entity-slider-${this.entityId}`;
        setTimeout(() => {
            openCoiSlider(this.sliderElementId);
        });
    }

    validateSliderClose() {
        setTimeout(() => {
            this.showSlider = false;
            this.entityId = null;
            this.sliderElementId = '';
            this.coiCountModal = { ...this.lastOpenedCountModalData, isOpenCountModal: true };
	    }, 500);
	}

    checkIfAllDisclosuresSelected(): void {
        this.isAllDisclosuresSelected = this.selectedDisclosures.filter(index => index)?.length == this.coiList?.length;
        this.setSelectedItemCount();
    }

    selectAllDisclosures(): void {
        this.isAllDisclosuresSelected = !this.isAllDisclosuresSelected;
        this.coiList.forEach((disclosure, index) => {
            const IS_ADMIN_OR_NON_AFFILIATED_DISCL = ((disclosure?.isHomeUnitSubmission && disclosure?.personId !== this.loginPersonId) || disclosure?.adminPersonId === this.loginPersonId);
            this.selectedDisclosures[index] = IS_ADMIN_OR_NON_AFFILIATED_DISCL && this.isAllDisclosuresSelected;
        });
        this.setSelectedItemCount();
    }

    atLeastOneIsSelected() {
        return this.selectedDisclosures.filter(index => index).length > 0;
    }

    confirmCompleteReview() {
        openModal('complete-review-confirmation-modal');
    }

    performCompleteReview(reviewDescription: string): void {
        this.$subscriptions.push(this.coiAdminDashboardService
            .completeDisclosureReviews(this.generateNumberMap(reviewDescription))
            .subscribe((res) => {
                hideModal('complete-review-confirmation-modal');
                this.$coiList.next();
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Review Completed successfully.');
        }, err => this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.')));
    }

    private generateNumberMap(reviewDescription: string): DisclosureCompleteFinalReviewRO[] {
        const RO: DisclosureCompleteFinalReviewRO[] = [];
        this.selectedDisclosures.forEach((selected, index) => {
            if (selected && this.coiList[index]) {
                RO.push({
                    disclosureId: this.coiList[index].coiDisclosureId,
                    disclosureNumber: this.coiList[index].coiDisclosureNumber,
                    description: reviewDescription
                });
            }
        });
        return RO;
    }

    // The function is used for closing nav dropdown at mobile screen
    offClickMainHeaderHandler(event: any) {
        if (window.innerWidth < 1200) {
            const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
            if (ELEMENT?.classList.contains('show')) {
                ELEMENT.classList.remove('show');
            }
        } else {
            this.isShowOptions = false;
        }
    }

    clearSelectAllDisclosure() {
        this.isAllDisclosuresSelected = false;
        this.selectedDisclosures = [];
    }

    private setSelectedItemCount(): void {
       this.selectedDisclosureCount = this.selectedDisclosures.filter(e => e).length;
    }

    getClassForSort(index: number, sortSection: any): any {
        const CLASS_LIST: { [key: string]: boolean } = {
          'ms-1': index === 0,
          'mx-0': index !== 0,
          'px-8': (!this.coiAdminDashboardService.coiRequestObject.sort[sortSection?.variableName]) ||
                  (!this.coiAdminDashboardService.projectOverviewRequestObject.sort[sortSection?.variableName]),
          'filter-active': (this.coiAdminDashboardService.coiRequestObject.sort[sortSection?.variableName]) ||
                           (this.coiAdminDashboardService.projectOverviewRequestObject.sort[sortSection?.variableName] !== undefined)
        };
      
        return CLASS_LIST;
    }

    getLocalizedText(field: string, contentRole: ContentRole): string {
        const TAB_NAME = this.coiAdminDashboardService.coiRequestObject.tabName;
        const LOCALIZATION_MAP = {
            reviewStatus: {
                TRAVEL_DISCLOSURES: {
                    label: TRAVEL_REVIEW_STATUS_LABEL,
                    title: ADV_SEARCH_TRAVEL_REVIEW_TITLE,
                    'aria-label': ADV_SEARCH_TRAVEL_REVIEW_AL
                },
                CONSULTING_DISCLOSURES: {
                    label: CONSULTING_REVIEW_STATUS_LABEL,
                    title: ADV_SEARCH_CONSULTING_REVIEW_TITLE,
                    'aria-label': ADV_SEARCH_CONSULTING_REVIEW_AL
                },
                default: {
                    label: COI_REVIEW_STATUS,
                    title: ADV_SEARCH_REVIEW_TITLE,
                    'aria-label': ADV_SEARCH_REVIEW_ARIA_LABEL
                }
            },
            certificationDate: {
                TRAVEL_DISCLOSURES: {
                    label: TRAVEL_CERTIFICATION_DATE,
                    title: ADV_SEARCH_TRAVEL_CERT_DATE_TITLE,
                    'aria-label': ADV_SEARCH_TRAVEL_CERT_DATE_AL
                },
                CONSULTING_DISCLOSURES: {
                    label: CONSULTING_CERTIFICATION_DATE,
                    title: ADV_SEARCH_CONSULTING_CERT_DATE_TITLE,
                    'aria-label': ADV_SEARCH_CONSULTING_CERT_DATE_AL
                },
                default: {
                    label: COI_CERTIFICATION_DATE,
                    title: ADV_SEARCH_CERT_DATE_TITLE,
                    'aria-label': ADV_SEARCH_CERT_DATE_ARIA_LABEL
                }
            }
        };
        return LOCALIZATION_MAP[field]?.[TAB_NAME]?.[contentRole] 
        || LOCALIZATION_MAP[field]?.default?.[contentRole] || '';
    }

    openPersonDetailsModal(DisclosureDetails): void {
        this.commonService.openPersonDetailsModal(DisclosureDetails?.personId);
    }

    // This function is used for check whether the user have Entity right or not,It may be useful for future implementation.
    // showViewButton() {
    //     return  this.commonService.getAvailableRight(['MANAGE_ENTITY', 'VIEW_ENTITY']) && !['manage-entity/'].some(ele => this._router.url.includes(ele))
    // }

    viewEntityDetails(disclosureDetails) {
        this.commonService.openEntityDetailsModal(disclosureDetails.entityId);
    }

    setFilterType(filterType: DisclosureStatusFilterType): void {
        this.localCOIRequestObject.filterType = filterType;
        this.performAdvanceSearch();
    }

    private validateTravelDateRange(fieldName: string): boolean {
        if (fieldName === 'travelDate') {
            if (this.advanceSearchDates.travelEndDate && this.advanceSearchDates.travelStartDate &&
                compareDates(this.advanceSearchDates.travelStartDate, this.advanceSearchDates.travelEndDate) === 1) {
                this.dateValidationMap.set(fieldName, 'Please select an end date after start date.');
            }
        }
        if (fieldName === 'cmpApprovalDate') {
            if (this.advanceSearchDates.approvalStartDate && this.advanceSearchDates.approvalEndDate &&
                compareDates(this.advanceSearchDates.approvalStartDate, this.advanceSearchDates.approvalEndDate) === 1) {
                this.dateValidationMap.set(fieldName, 'Please select an end date after start date.');
            }
        }
        if (fieldName === 'cmpExpirationDate') {
            if (this.advanceSearchDates.expirationStartDate && this.advanceSearchDates.expirationEndDate &&
                compareDates(this.advanceSearchDates.expirationStartDate, this.advanceSearchDates.expirationEndDate) === 1) {
                this.dateValidationMap.set(fieldName, 'Please select an end date after start date.');
            }
        }
        return !this.dateValidationMap.size;
    }

    validateDateFormat(fieldName: string): void {
        this.dateValidationMap.delete(fieldName);
        if (fieldName === 'certificationDate') {
            const travelCertifyDate: string = this.certificationDateInput?.nativeElement.value?.trim() || '';
            if (!travelCertifyDate) {
                return;
            }
            if (!this.isDateFormatValid(travelCertifyDate)) {
                this.dateValidationMap.set(
                    'certificationDate',
                    `Entered date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
            }
        }
        else {
            const startDate: string = this.getDateNativeElementValue(fieldName,'START');
            const endEndDate: string = this.getDateNativeElementValue(fieldName,'END');
            if (!startDate && !endEndDate) {
                return;
            }
            const isStartDateValid = this.isDateFormatValid(startDate);
            const isEndDateValid = this.isDateFormatValid(endEndDate);
            if (!isStartDateValid && !isEndDateValid) {
                this.dateValidationMap.set(
                    fieldName,
                    `Entered start and end date formats are invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
            } else if (!isStartDateValid) {
                this.dateValidationMap.set(
                    fieldName,
                    `Entered start date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
            } else if (!isEndDateValid) {
                this.dateValidationMap.set(
                    fieldName,
                    `Entered end date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
                return;
            }
            this.validateTravelDateRange(fieldName);
        }
    }

    private getDateNativeElementValue(fieldName, field: 'START' | 'END') {
        if (fieldName === 'travelDate') {
            if (field === 'START') return this.travelStartDateInput?.nativeElement.value?.trim() || '';
            if (field === 'END') return this.travelEndDateInput?.nativeElement.value?.trim() || '';
        }
        if (fieldName === 'cmpApprovalDate') {
            if (field === 'START') return this.cmpApprovalStartDateInput?.nativeElement.value?.trim() || '';
            if (field === 'END') return this.cmpApprovalEndDate?.nativeElement.value?.trim() || '';
        }
        if (fieldName === 'cmpExpirationDate') {
            if (field === 'START') return this.cmpExpirationStartDateInput?.nativeElement.value?.trim() || '';
            if (field === 'END') return this.cmpExpirationEndDate?.nativeElement.value?.trim() || '';
        }
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    openReviewComment(disclosureData: CoiDashboardDisclosures): void {
        this._coiReviewCommentSliderService.initializeReviewCommentSlider(disclosureData);
    }

    onLeadUnitSelected(unit: any): void {
        this.localCmpRequestObject.leadUnit = unit?.value ?? unit?.unitNumber ?? null;
        this.localSearchDefaultValues.leadUnitName = unit?.value ?? unit?.unitName ?? null;
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'LEAD_UNIT', !!unit?.value);
    }

    onPiPersonNameSelect(person: any): void {
        this.localCmpRequestObject.principleInvestigator = person?.value ?? person?.prncpl_id ?? null;
        this.localSearchDefaultValues.piPersonName = person?.value ?? person?.full_name ?? null;
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'PI', !!person?.value);
    }

    onSponsorSelect(sponsor: any): void {
        this.localCmpRequestObject.sponsor = sponsor?.value ?? sponsor?.sponsorCode ?? null;
        this.localSearchDefaultValues.sponsorName = sponsor?.value ?? sponsor?.sponsorName ?? null;
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'SPONSOR', !!sponsor?.value);
    }

    onHomeUnitChangeFunction(unit: any) {
        this.localCmpRequestObject.homeUnit = unit?.value ?? unit?.unitNumber ?? null;
        this.localSearchDefaultValues.departmentName = unit?.value ?? unit?.unitName ?? null;
        updateSearchField(this.localCmpRequestObject.freeTextSearchFields, 'HOME_UNIT', !!unit?.value);
    }

    redirectToCmpCreation(): void {
        this._router.navigate([CMP_CREATION_URL]);
    }

    employeeTypeChanged(event: any): void {
        this.selectPersonName(null);
        this.selectRolodex(null);
        this.localSearchDefaultValues.employeeType = event?.code || null;
        if (this.localSearchDefaultValues.employeeType === 'ROLODEX') {
            this.elasticRolodexSearchOptions = this._elasticConfig.getElasticForRolodex();
        } else {
            this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        }
    }

}
