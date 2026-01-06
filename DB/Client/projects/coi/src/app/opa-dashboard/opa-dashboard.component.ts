import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fadeInOutHeight, listAnimation, topSlideInOut, slideInAnimation, scaleOutAnimation } from '../common/utilities/animations';
import { NameObject, OPADashboardRequest, OpaDashboardService, SortCountObj, OPAAdminDashboardResolvedData  } from './opa-dashboard.service';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { getEndPointOptionsForLeadUnit } from '../../../../fibi/src/app/common/services/end-point.config';
import { CommonService } from '../common/services/common.service';
import { deepCloneObject, isEmptyObject } from '../../../../fibi/src/app/common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';
import { subscriptionHandler } from '../../../../fibi/src/app/common/utilities/subscription-handler';
import { ADVANCE_SEARCH_CRITERIA_IN_OPA_DASHBOARD, DATE_PLACEHOLDER, HTTP_ERROR_STATUS, OPA_DISCLOSURE_ADMIN_RIGHTS,
    OPA_DISCLOSURE_RIGHTS, OPA_CHILD_ROUTE_URLS, OPA_INITIAL_VERSION_NUMBER, DEFAULT_DATE_FORMAT, 
    DISCLOSURE_TYPE,
    OPA_MODULE_CODE,
    MAINTAIN_DISCL_FROM_AFFILIATED_UNITS,
    OPA_DISPOSITION_STATUS_BADGE,
    OPA_REVIEW_STATUS_BADGE} from '../app-constants';
import { calculateFilledProperties, openCoiSlider, updateSearchField } from '../common/utilities/custom-utilities';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { compareDates, getInvalidDateFormatMessage, getDateObjectFromTimeStamp,
    isValidDateFormat, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { ADV_SEARCH_OPA_REVIEW_TITLE, ADV_SEARCH_DEPARTMENT_PH, COMMON_DEPARTMENT,
    COMMON_DISPOSITION_STATUS, OPA_CERTIFICATION_DATE, OPA_REVIEW_STATUS_LABEL } from '../app-locales';
import { FetchReviewCommentRO } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER, OPA_COMMENTS_RIGHTS, OPA_GENERAL_COMMENTS } from '../shared-components/coi-review-comments/coi-review-comments-constants';
import { GlobalEventNotifier, OPADisclosureDetails, LookUpClass } from '../common/services/coi-common.interface';
import { ElasticEntitySource } from '../entity-management-module/shared/entity-interface';
import { OPADashboardTabCount } from '../opa/opa-interface';
import { AttachmentSourceSection, COICountModal, COICountModalViewSlider } from '../shared-components/shared-interface';

@Component({
    selector: 'app-opa-dashboard',
    templateUrl: './opa-dashboard.component.html',
    styleUrls: ['./opa-dashboard.component.scss'],
    animations: [fadeInOutHeight, listAnimation, topSlideInOut,
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ]
})
export class OpaDashboardComponent implements OnInit {

    isShowAdminDashboard = false;
    localOPARequestObject: OPADashboardRequest = new OPADashboardRequest();
    localNameObject: any;
    sortCountObj: SortCountObj;
    $subscriptions: Subscription[] = [];
    $opaList = new Subject();
    isLoading = false;
    opaList = [];
    isHover: [] = [];
    isViewAdvanceSearch = true;
    result: any = { disclosureCount: 0 };
    advSearchClearField: string;
    leadUnitSearchOptions: any;
    assigneeClearField: String;
    advanceSearchDates = { submissionDate: null, periodStartDate: null, periodEndDate: null, expirationDate: null };
    localSearchDefaultValues: NameObject = new NameObject();
    lookupValues = [];
    datePlaceHolder = DATE_PLACEHOLDER;
    isShowOPAList = false;
    addAdmin: any = {};
    isAssignAdminModalOpen = false;
    assignAdminPath = 'OPA_DISCLOSURES';
    personElasticOptions: any = {};
    entitySearchOptions: any = {};
    map = new Map();
    sortSectionsList = [
        { variableName: 'person', fieldName: 'Person' },
        { variableName: 'homeUnitName', fieldName: COMMON_DEPARTMENT },
        { variableName: 'submissionTimestamp', fieldName: OPA_CERTIFICATION_DATE },
        { variableName: 'expirationDate', fieldName: 'Expiration Date' },
        { variableName: 'dispositionStatus', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'disclosureStatus', fieldName: OPA_REVIEW_STATUS_LABEL },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' }
    ];
    opaDisclosureStatusOptions = 'OPA_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true';
    opaDispositionStatusOption = 'OPA_DISPOSITION_STATUS_TYPE#DISPOSITION_STATUS_CODE#true#true';
    opaEmployeeRoleTypeOption = 'EMPTY#EMPTY#true#true';
    disclosureAdministratorOptions = 'EMPTY#EMPTY#true#true#true#true';
    disclosureTypeOptions = 'EMPTY#EMPTY#true#true#true#true';
    isShowOptions = false;
    isOPAReviewer = false;
    advSearchDepartmentPlaceholder = ADV_SEARCH_DEPARTMENT_PH;
    advSerachReviewStatusTitle = ADV_SEARCH_OPA_REVIEW_TITLE;
    advSearchDispositionStatusTitle =  $localize`:@@ADV_SEARCH_DISPOSITION_TITLE: Click here to search by Disposition Status`;
    isAdvanceSearchMade = false;
    advancedSearchCriteriaCount: number = 0;
    isShowCommentButton = false;
    lookupArrayForAdministrator: LookUpClass[] = [];
    lookupArrayForDisclosureType: LookUpClass[] = [];
    datesValidationMap = new Map();
    isShowAdminDetails = false;
    lastOpenedCountModalData = new COICountModal();
    countModalData = new COICountModal();
    opaModuleCode = OPA_MODULE_CODE;
    showSlider = false;
    entityId: number | string;
    sliderElementId: string = '';
    loginPersonId = '';
    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;
    opaInitialVersion = OPA_INITIAL_VERSION_NUMBER;
    @ViewChild('fromDateInput', { static: false }) fromDateInput?: ElementRef;
    @ViewChild('toDateInput', { static: false }) toDateInput?: ElementRef;
    @ViewChild('certificationDateInput', { static: false }) certificationDateInput?: ElementRef;
    @ViewChild('expirationDateInput', { static: false }) expirationDateInput?: ElementRef;
    opaDashboardTabCount: OPADashboardTabCount;
    private timeOutRef: ReturnType<typeof setTimeout>;
    opaDispositionStatusBadge = OPA_DISPOSITION_STATUS_BADGE;
    opaReviewStatusBadge = OPA_REVIEW_STATUS_BADGE;
    constructor(public opaDashboardService: OpaDashboardService,
        private _elasticConfigService: ElasticConfigService,
        private _router: Router, public commonService: CommonService, private _navigationService: NavigationService,
        private _activatedRoute: ActivatedRoute
    ) {  document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this)); }

    ngOnInit() {
        this.loginPersonId = this.commonService.getCurrentUserDetail('personID');
        this.isShowAdminDashboard = this.commonService.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || this.commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
        this.isOPAReviewer = this.commonService.isOPAReviewer;
        this.getOpaDashboardTabCount();
        this.setLookupArrayForDisclosureType();
        this.setDashboardConfigFromSnapshot();
        this.setDashboardTab();
        this.setSearchOptions();
        this.setAdvanceSearch();
        this.getOPADashboard();
        this.checkForSort();
        this.checkForPagination();
        this.checkForAdvanceSearch();
        this.listenGlobalEventNotifier();
        this.isShowCommentButton = this.commonService.getAvailableRight(OPA_COMMENTS_RIGHTS) || this.isOPAReviewer;
        this.isShowAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                // This emitter will be triggered either when the comment slider closes or when the API request fails.
                if (event?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                    if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(event?.content?.action)) {
                        this.$opaList.next();
                        this.commonService.clearReviewCommentsSlider();
                    }
                }
            })
        );
    }

    private setDashboardConfigFromSnapshot(): void {
        const RESOLVED_DATA: OPAAdminDashboardResolvedData = this._activatedRoute.snapshot.data.resolvedData;
        this.lookupArrayForAdministrator = RESOLVED_DATA?.lookupArrayForAdministrator;
    }

    private setLookupArrayForDisclosureType(): void {
        this.lookupArrayForDisclosureType.push({"code": "INITIAL", "description": "Initial"});
        this.lookupArrayForDisclosureType.push({"code": "REVISION", "description": "Revision"});
    }

    private getOpaDashboardTabCount(): void {
        const DASHBOARD_COUNT_RO = new OPADashboardRequest();
        this.$subscriptions.push(
            this.opaDashboardService.getOpaDashboardTabCount(DASHBOARD_COUNT_RO)
                .subscribe((data: OPADashboardTabCount) => {
                    this.opaDashboardTabCount = data;
                }, err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in getting OPA Tab Count');
                }));
    }

    checkForAdvanceSearch() {
        if (this.isAdvancedSearchMade() && this.checkForPreviousURL()) {
            this.isShowOPAList = true;
            if (this.opaDashboardService.isAdvanceSearch) {
                this.isViewAdvanceSearch = false;
                this.isAdvanceSearchMade = true;
                this.fetchLocalObjectFromServiceObject();
                this.generateLookupArrayForDropdown();
                this.setDefaultSearchOptions();
            } else {
                if (this.opaDashboardService.opaRequestObject.tabType === 'ALL_DISCLOSURES') {
                    this.isViewAdvanceSearch = true;
                    this.isShowOPAList = false;
                } else {
                    this.isViewAdvanceSearch = false;
                }
            }
            this.$opaList.next();
        } else {
            this.resetAdvanceSearchFields();
            if (this.opaDashboardService.opaRequestObject.tabType !== 'ALL_DISCLOSURES') {
                this.$opaList.next();
            }
        }
    }

    generateLookupArrayForDropdown() {
        if (this.opaDashboardService.opaRequestObject.dispositionStatusCodes.length) {
            this.generateLookupArray(this.opaDashboardService.opaRequestObject.dispositionStatusCodes, 'dispositionStatusCodes');
        }
        if (this.opaDashboardService.opaRequestObject.reviewStatusCodes.length) {
            this.generateLookupArray(this.opaDashboardService.opaRequestObject.reviewStatusCodes, 'reviewStatusCodes');
        }
        if (this.opaDashboardService.opaRequestObject.designationStatusCodes.length) {
            this.generateLookupArray(this.opaDashboardService.opaRequestObject.designationStatusCodes, 'designationStatusCodes');
        }
        if (this.opaDashboardService.opaRequestObject.adminPersonIds.length) {
            this.generateLookupArray(this.opaDashboardService.opaRequestObject.adminPersonIds, 'adminPersonIds');
        }
        if (this.opaDashboardService.opaRequestObject.opaDisclosureTypes.length) {
            this.generateLookupArray(this.opaDashboardService.opaRequestObject.opaDisclosureTypes, 'opaDisclosureTypes');
        }
    }

    personSelect(event: any): void {
        this.localOPARequestObject.personIdentifier = event?.value ?? event?.prncpl_id ?? null;
        this.localSearchDefaultValues.personName = event?.value ?? event?.full_name ?? null;
        updateSearchField(this.localOPARequestObject.freeTextSearchFields, 'PERSON', !!event?.value);
    }

    entitySelect(event: ElasticEntitySource): void {
        this.localOPARequestObject.entityIdentifier = event?.value ?? event?.entity_id ?? null;
        this.localSearchDefaultValues.entityName = event?.value ?? event?.entity_name ?? null;
        updateSearchField(this.localOPARequestObject.freeTextSearchFields, 'ENTITY', !!event?.value);
    }

    setDefaultSearchOptions() {
        this.leadUnitSearchOptions.defaultValue = this.opaDashboardService.searchDefaultValues.departmentName || '';
        this.personElasticOptions.defaultValue = this.opaDashboardService.searchDefaultValues.personName || '';
        this.entitySearchOptions.defaultValue = this.opaDashboardService.searchDefaultValues.entityName || '';
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        property.forEach(element => {
            this.lookupValues[propertyNumber].push({ code: element });
        });
    }

    fetchLocalObjectFromServiceObject() {
        this.localOPARequestObject.unitIdentifier = this.opaDashboardService.opaRequestObject.unitIdentifier ?
            this.opaDashboardService.opaRequestObject.unitIdentifier : null;
        this.localOPARequestObject.personIdentifier = this.opaDashboardService.opaRequestObject.personIdentifier ?
            this.opaDashboardService.opaRequestObject.personIdentifier : null;
        this.localOPARequestObject.entityIdentifier = this.opaDashboardService.opaRequestObject.entityIdentifier ?
            this.opaDashboardService.opaRequestObject.entityIdentifier : null;
        this.localOPARequestObject.dispositionStatusCodes = this.opaDashboardService.opaRequestObject.dispositionStatusCodes ?
            this.opaDashboardService.opaRequestObject.dispositionStatusCodes : [];
        this.localOPARequestObject.reviewStatusCodes = this.opaDashboardService.opaRequestObject.reviewStatusCodes ?
            this.opaDashboardService.opaRequestObject.reviewStatusCodes : [];
        this.localOPARequestObject.adminPersonIds = this.opaDashboardService.opaRequestObject.adminPersonIds ?
            this.opaDashboardService.opaRequestObject.adminPersonIds : [];
        this.localOPARequestObject.opaDisclosureTypes = this.opaDashboardService.opaRequestObject.opaDisclosureTypes ?
            this.opaDashboardService.opaRequestObject.opaDisclosureTypes : [];
        this.localOPARequestObject.designationStatusCodes = this.opaDashboardService.opaRequestObject.designationStatusCodes ?
            this.opaDashboardService.opaRequestObject.designationStatusCodes : [];
        this.advanceSearchDates.submissionDate = this.localOPARequestObject.submissionTimestamp =
            this.opaDashboardService.opaRequestObject.submissionTimestamp ?
                getDateObjectFromTimeStamp(this.opaDashboardService.opaRequestObject.submissionTimestamp) : null;
        this.advanceSearchDates.periodStartDate = this.localOPARequestObject.periodStartDate =
             this.opaDashboardService.opaRequestObject.periodStartDate ?
                    getDateObjectFromTimeStamp(this.opaDashboardService.opaRequestObject.periodStartDate) : null;
        this.advanceSearchDates.periodEndDate = this.localOPARequestObject.periodEndDate =
            this.opaDashboardService.opaRequestObject.periodEndDate ?
                    getDateObjectFromTimeStamp(this.opaDashboardService.opaRequestObject.periodEndDate) : null;
        this.advanceSearchDates.expirationDate = this.localOPARequestObject.expirationDate =
            this.opaDashboardService.opaRequestObject.expirationDate ?
                    getDateObjectFromTimeStamp(this.opaDashboardService.opaRequestObject.expirationDate) : null;
        this.localOPARequestObject.advancedSearch = 'A';
        this.localSearchDefaultValues = this.opaDashboardService.searchDefaultValues;
        this.localOPARequestObject.freeTextSearchFields = this.opaDashboardService?.opaRequestObject?.freeTextSearchFields ?
            this.opaDashboardService.opaRequestObject.freeTextSearchFields : null;
    }

    isAdvancedSearchMade() {
        return !!Object.values(this.opaDashboardService.opaRequestObject)
            .find(V => V && ((typeof (V) === 'string' && V) || (typeof (V) === 'object' && V.length)));
    }

    setDashboardTab() {
        const DEFAULT_TAB = this.isShowAdminDashboard ? 'ALL_DISCLOSURES' : 'MY_REVIEWS';
        let currentTab = sessionStorage.getItem('currentOPATab');
        const VALID_TABS = [];
        if (this.isShowAdminDashboard) {
            VALID_TABS.push('ALL_DISCLOSURES');
        }
        if (this.isShowAdminDashboard && this.commonService.opaApprovalFlowType === 'ADMIN_REVIEW') {
             VALID_TABS.push('NEW_SUBMISSIONS');
        }
        if ((this.isShowAdminDashboard || this.isOPAReviewer) && this.commonService.opaApprovalFlowType !== 'NO_REVIEW') {
            VALID_TABS.push('MY_REVIEWS', 'ALL_REVIEWS');
        }
        if (!currentTab || !VALID_TABS.includes(currentTab)) {
            currentTab = DEFAULT_TAB;
            sessionStorage.setItem('currentOPATab', currentTab);
        }
        this.opaDashboardService.opaRequestObject.tabType = currentTab;
    }

    setAdvanceSearch() {
        sessionStorage.setItem('currentOPATab', this.opaDashboardService.opaRequestObject.tabType);
        if (this.opaDashboardService.opaRequestObject.tabType === 'ALL_DISCLOSURES') {
            this.isViewAdvanceSearch = true;
        } else {
            this.isShowOPAList = true;
            this.isViewAdvanceSearch = false;
        }
    }

    checkForPagination() {
        if (this.checkForPreviousURL()) {
            this.localOPARequestObject.currentPage = this.opaDashboardService.opaRequestObject.currentPage;
        }
    }

    checkForSort() {
        if (!isEmptyObject(this.opaDashboardService.opaRequestObject.sort) && this.checkForPreviousURL()) {
            this.localOPARequestObject.sort = deepCloneObject(this.opaDashboardService.opaRequestObject.sort);
            this.sortCountObj = deepCloneObject(this.opaDashboardService.sortCountObject);
        } else {
            this.resetSortObjects();
        }
    }

    resetSortObjects() {
        this.localOPARequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.opaDashboardService.opaRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.sortCountObj = new SortCountObj();
        this.opaDashboardService.sortCountObject = new SortCountObj();
    }

    checkForPreviousURL() {
        return ['coi/opa'].some((url) => this._navigationService.previousURL.includes(url));
    }

    getOPADashboard() {
        this.$subscriptions.push(this.$opaList.pipe(
            switchMap(() => {
                this.isLoading = true;
                return this.opaDashboardService.getOPADashboard(this.getRequestObject())
            }))
            .subscribe((data: any) => {
                if (data) {
                    this.result = data || [];
                    this.opaList = data.data;
                }
                this.isLoading = false;
                this.advancedSearchCriteriaCount = calculateFilledProperties(this.opaDashboardService.opaRequestObject, ADVANCE_SEARCH_CRITERIA_IN_OPA_DASHBOARD);
            }, _err => {
                this.isLoading = false;
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch OPA disclosures, please try again.');
             }));
    }

    sortResult(sortFieldBy) {
        this.sortCountObj[sortFieldBy]++;
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.localOPARequestObject.sort[sortFieldBy] = !this.localOPARequestObject.sort[sortFieldBy] ? 'asc' : 'desc';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.localOPARequestObject.sort[sortFieldBy];
        }
        this.opaDashboardService.sortCountObject = deepCloneObject(this.sortCountObj);
        this.opaDashboardService.opaRequestObject.sort = deepCloneObject(this.localOPARequestObject.sort);
        this.opaDashboardService.sort = deepCloneObject(this.localOPARequestObject.sort);
        this.$opaList.next();
    }

    toggleAdvanceSearch() {
        this.isViewAdvanceSearch = !this.isViewAdvanceSearch;
        if (!this.isViewAdvanceSearch) {
            this.opaDashboardService.isAdvanceSearch = false;
        }
    }

    private setSearchOptions() {
        this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
        this.personElasticOptions = this._elasticConfigService.getElasticForPerson();
        this.entitySearchOptions = this._elasticConfigService.getElasticForActiveEntity();
    }

    resetAndPerformAdvanceSearch() {
        this.resetAdvanceSearchFields();
        this.opaList = [];
        this.$opaList.next();
    }

    private resetAdvanceSearchFields() {
        this.resetSortObjects();
        this.opaDashboardService.opaRequestObject.tabType = sessionStorage.getItem('currentOPATab');
        this.localOPARequestObject = new OPADashboardRequest(this.opaDashboardService.opaRequestObject.tabType);
        this.localSearchDefaultValues = new NameObject();
        this.opaDashboardService.searchDefaultValues = new NameObject();
        this.opaDashboardService.opaRequestObject = new OPADashboardRequest(this.opaDashboardService.opaRequestObject.tabType);
        if (this.getInputValue(this.certificationDateInput)) {
            this.certificationDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.fromDateInput)) {
            this.fromDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.toDateInput)) {
            this.toDateInput.nativeElement.value = '';
        }
        if(this.getInputValue(this.expirationDateInput)) {
            this.expirationDateInput.nativeElement.value = '';
        }
        this.advanceSearchDates = { submissionDate: null , periodStartDate: null, periodEndDate: null, expirationDate: null };
        if (this.opaDashboardService.opaRequestObject.tabType !== 'ALL_DISCLOSURES') {
            this.opaDashboardService.isAdvanceSearch = false;
        }
        this.lookupValues = [];
        this.map.clear();
        this.setSearchOptions();
        this.isAdvanceSearchMade = false;
        this.datesValidationMap.clear();
    }
    private getInputValue(inputRef?: ElementRef): string {
        return inputRef?.nativeElement?.value?.trim() || '';
    }

    performAdvanceSearch() {
        this.timeOutRef = setTimeout(() => {
            this.localOPARequestObject.currentPage = 1;
            this.setAdvanceSearchToServiceObject();
            this.localOPARequestObject.advancedSearch = 'A';
            this.isShowOPAList = true;
            this.opaList = [];
            this.opaDashboardService.isAdvanceSearch = true;
            this.$opaList.next();
            this.isViewAdvanceSearch = false;
            this.isAdvanceSearchMade = true;
            this.datesValidationMap.clear();
        }, 100);
    }

    setAdvanceSearchToServiceObject() {
        this.opaDashboardService.opaRequestObject.dispositionStatusCodes = this.localOPARequestObject.dispositionStatusCodes || [];
        this.opaDashboardService.opaRequestObject.reviewStatusCodes = this.localOPARequestObject.reviewStatusCodes || [];
        this.opaDashboardService.opaRequestObject.adminPersonIds = this.localOPARequestObject.adminPersonIds || [];
        this.opaDashboardService.opaRequestObject.opaDisclosureTypes = this.localOPARequestObject.opaDisclosureTypes || [];
        this.opaDashboardService.opaRequestObject.designationStatusCodes = this.localOPARequestObject.designationStatusCodes || [];
        this.opaDashboardService.opaRequestObject.unitIdentifier = this.localOPARequestObject.unitIdentifier || null;
        this.opaDashboardService.opaRequestObject.personIdentifier = this.localOPARequestObject.personIdentifier || null;
        this.opaDashboardService.opaRequestObject.entityIdentifier = this.localOPARequestObject.entityIdentifier || null;
        this.opaDashboardService.opaRequestObject.submissionTimestamp = parseDateWithoutTimestamp(
            this.advanceSearchDates.submissionDate) || null;
        this.opaDashboardService.opaRequestObject.periodStartDate = parseDateWithoutTimestamp(
                this.advanceSearchDates.periodStartDate) || null
        this.opaDashboardService.opaRequestObject.periodEndDate = parseDateWithoutTimestamp(
                    this.advanceSearchDates.periodEndDate) || null;
        this.opaDashboardService.opaRequestObject.expirationDate = parseDateWithoutTimestamp(
                    this.advanceSearchDates.expirationDate) || null;
        this.opaDashboardService.opaRequestObject.currentPage = this.localOPARequestObject.currentPage;
        this.opaDashboardService.searchDefaultValues.departmentName = this.localSearchDefaultValues.departmentName || null;
        this.opaDashboardService.searchDefaultValues.personName = this.localSearchDefaultValues.personName || null;
        this.opaDashboardService.searchDefaultValues.entityName = this.localSearchDefaultValues.entityName || null;
        this.opaDashboardService.opaRequestObject.freeTextSearchFields = this.localOPARequestObject?.freeTextSearchFields || [];

    }

    onLookupSelect(data: any, property: string) {
        this.lookupValues[property] = data;
        this.localOPARequestObject[property] = data.length ? data.map(d => d.code) : [];
    }

    redirectToDisclosure(opa) {
        sessionStorage.setItem('previousUrl', this._router.url);
        this._router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: opa.opaDisclosureId } });
    }

    getRequestObject() {
        this.localOPARequestObject.submissionTimestamp = parseDateWithoutTimestamp(this.advanceSearchDates.submissionDate);
        this.localOPARequestObject.periodStartDate = parseDateWithoutTimestamp(this.advanceSearchDates.periodStartDate);
        this.localOPARequestObject.periodEndDate = parseDateWithoutTimestamp(this.advanceSearchDates.periodEndDate);
        this.localOPARequestObject.expirationDate = parseDateWithoutTimestamp(this.advanceSearchDates.expirationDate);
        this.localOPARequestObject.tabType = sessionStorage.getItem('currentOPATab');
        return this.localOPARequestObject;
    }

    leadUnitChangeFunction(unit: any) {
        this.localOPARequestObject.unitIdentifier = unit?.value ?? unit?.unitNumber ?? null;
        this.localSearchDefaultValues.departmentName = unit?.value ?? unit?.displayName ?? null;
        updateSearchField(this.localOPARequestObject.freeTextSearchFields, 'UNIT', !!unit?.value);
    }

    changeTab(tabName) {
        this.opaList = [];
        this.isShowOPAList = false;
        this.opaDashboardService.isAdvanceSearch = false;
        this.opaDashboardService.opaRequestObject.tabType = tabName;
        this.opaDashboardService.opaRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.getOpaDashboardTabCount();
        sessionStorage.setItem('currentOPATab', tabName);
        this.resetAdvanceSearchFields();
        this.setAdvanceSearch();
        if (tabName !== 'ALL_DISCLOSURES') {
            this.$opaList.next();
        }
        this.localOPARequestObject.tabType = tabName;
    }

    showAssignAdminButton(opa: OPADisclosureDetails): boolean {
        const HAS_AFFILIATION_MANAGE_RIGHT = this.commonService.getAvailableRight(MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
        const CAN_EDIT_AFFILIATED_DISCLOSURE = opa?.isHomeUnitSubmission === false && HAS_AFFILIATION_MANAGE_RIGHT;
        const CAN_MANAGE_DISCLOSURE = (opa?.isHomeUnitSubmission || CAN_EDIT_AFFILIATED_DISCLOSURE) && opa?.personId !== this.loginPersonId;
        const IS_NEW_SUBMISSION_TAB = this.opaDashboardService.opaRequestObject.tabType === 'NEW_SUBMISSIONS';
        return IS_NEW_SUBMISSION_TAB && (CAN_MANAGE_DISCLOSURE || opa?.adminPersonId === this.loginPersonId);
    }

    actionsOnPageChange(event) {
        if (this.localOPARequestObject.currentPage != event) {
            this.localOPARequestObject.currentPage = event;
            this.opaDashboardService.opaRequestObject.currentPage = event;
            this.$opaList.next();
        }
    }

    ngOnDestroy(): void {
        document.removeEventListener('mouseup', null);
        subscriptionHandler(this.$subscriptions);
        clearTimeout(this.timeOutRef);
    }

    openAssignAdminModal(opa): void {
        this.addAdmin.disclosureId = opa.opaDisclosureId;
        this.isAssignAdminModalOpen = true;
    }

    closeAssignAdminModal(event): void {
        if (event) {
            this.addAdmin.disclosureId = null;
            this.getOpaDashboardTabCount();
            this.$opaList.next();
        }
        this.isAssignAdminModalOpen = false;
    }

    getReviewerStatus(statusCode) {
        switch (statusCode) {
            case '2': return 'info';
            case '3': return 'success';
            case '1': return 'warning';
            default: return 'danger';
        }
    }

    // The function is used for closing nav dropdown at mobile screen
    offClickMainHeaderHandler(event: any) {
        if (window.innerWidth < 1200) {
            const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
            if (document.getElementById('navbarResponsive').classList.contains('show')) {
                document.getElementById('navbarResponsive').classList.remove('show');
            }
        } else {
            this.isShowOptions = false;
        }
    }

    openPersonDetailsModal(DisclosureDetails): void {
        this.commonService.openPersonDetailsModal(DisclosureDetails?.personId);
    }

    openReviewComment(opaDetails: OPADisclosureDetails): void {
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: OPA_GENERAL_COMMENTS.componentTypeCode,
            moduleItemKey: opaDetails?.opaDisclosureId,
            moduleItemNumber: opaDetails?.opaDisclosureNumber,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: opaDetails?.personId,
        };
        this.opaDashboardService.setReviewCommentSliderConfig(REQ_BODY);
    }

    private validateTravelDate(): boolean {
        if (this.advanceSearchDates.periodStartDate && this.advanceSearchDates.periodEndDate &&
            compareDates(this.advanceSearchDates.periodStartDate, this.advanceSearchDates.periodEndDate) === 1) {
            this.datesValidationMap.set('reportingCycleDate', 'Please select an end date after start date.');
        }
        return !this.datesValidationMap.size;
    }

    validateMultiDateFieldFormat(fieldName: 'reportingCycleDate'): void {
        if (fieldName === 'reportingCycleDate') {
            this.datesValidationMap.delete('reportingCycleDate');
            const FROM_DATE: string = this.fromDateInput.nativeElement.value?.trim();
            const TO_DATE: string = this.toDateInput.nativeElement.value?.trim();
            if (!FROM_DATE && !TO_DATE) {
                return;
            }
            const IS_START_DATE_VALID = this.isDateFormatValid(FROM_DATE);
            const IS_END_DATE_VALID = this.isDateFormatValid(TO_DATE);
            if (!IS_START_DATE_VALID && !IS_END_DATE_VALID) {
                this.datesValidationMap.set(
                    'reportingCycleDate',
                    `Entered From and To date formats are invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
                return;
            }
            if (!IS_START_DATE_VALID) {
                this.datesValidationMap.set(
                    'reportingCycleDate',
                    `Entered From date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
                return;
            }
            if (!IS_END_DATE_VALID) {
                this.datesValidationMap.set(
                    'reportingCycleDate',
                    `Entered To date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
                return;
            }
            this.validateTravelDate();
        }
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    validateSingleDateFieldFormat(fieldName: 'certificationDate' | 'expirationDate'): void {
        const INPUT_DATE_FIELD = fieldName === 'certificationDate' ? this.certificationDateInput : this.expirationDateInput;
        if (!INPUT_DATE_FIELD) return;
        this.datesValidationMap.delete(fieldName);
        const DATE_VALUE = INPUT_DATE_FIELD.nativeElement.value?.trim();
        const ERROR_MESSAGE = getInvalidDateFormatMessage(DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.datesValidationMap.set(fieldName, ERROR_MESSAGE);
            return;
        }
    }
    
    openCountModal(disclosure: any, count: number | null = null, moduleCode: number = 0, inputType: AttachmentSourceSection = ''): void {
        if (count > 0) {
            this.countModalData = {
                personUnit: moduleCode === this.opaModuleCode ? { unitDisplayName: disclosure?.unitDisplayName } : disclosure?.unit,
                moduleCode: moduleCode,
                personId: disclosure?.personId,
                disclosureType: moduleCode === this.opaModuleCode ? (disclosure?.versionNumber === this.opaInitialVersion ? 'Initial' : 'Revision')
                    : (disclosure?.fcoiTypeCode == DISCLOSURE_TYPE.PROJECT ? disclosure?.projectType : disclosure?.fcoiType),
                inputType: inputType,
                fcoiTypeCode: disclosure?.fcoiTypeCode,
                disclosureId: moduleCode === this.opaModuleCode ? disclosure?.opaDisclosureId : disclosure?.coiDisclosureId,
                personFullName: moduleCode === this.opaModuleCode ? disclosure?.personName : disclosure?.disclosurePersonFullName,
                projectHeader: disclosure?.projectHeader,
                reviewStatusCode: disclosure?.reviewStatusCode,
                count: count,
                isOpenCountModal: true
            };
            this.lastOpenedCountModalData = deepCloneObject(this.countModalData);
        }
    }

    viewSlider(event: COICountModalViewSlider) {
        this.showSlider = event.isOpenSlider;
        this.entityId = event.entityId;
        this.sliderElementId = `user-disclosure-entity-${this.entityId}`;
        setTimeout(() => {
            openCoiSlider(this.sliderElementId);
        });
    }

    validateSliderClose() {
       const TIMEOUT_REF = setTimeout(() => {
            this.showSlider = false;
            this.entityId = null;
            this.sliderElementId = '';
            this.countModalData = { ...this.lastOpenedCountModalData, isOpenCountModal: true };
            clearTimeout(TIMEOUT_REF);
        }, 500);
    }
}
