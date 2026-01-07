import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { NavigationService } from '../common/services/navigation.service';
import { ADVANCE_SEARCH_CRITERIA_IN_ADMIN_DASHBOARD, COMMON_ERROR_TOAST_MSG, DATE_PLACEHOLDER,
    DISCLOSURE_MANDATORY_FLAGS, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, PROJECT_DASHBOARD_ADV_SEARCH_ORDER, PROJECT_DASHBOARD_SORT_TITLES } from '../app-constants';
import { ProjectDashboardService } from './project-dashboard.service';
import { getEndPointOptionsForLeadUnit, getEndPointOptionsForSponsor } from 'projects/fibi/src/app/common/services/end-point.config';
import { Subject, Subscription } from 'rxjs';
import { getInvalidDateFormatMessage, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { calculateFilledProperties, closeCommonModal, deepCloneObject, isEmptyObject, openCommonModal, updateSearchField } from '../common/utilities/custom-utilities';
import { ADV_SEARCH_LEAD_UNIT_PH, OVERALL_REVIEW } from '../app-locales';
import { fadeInOutHeight, heightAnimation, leftSlideInOut, listAnimation, scaleOutAnimation, slideInAnimation, topSlideInOut } from '../common/utilities/animations';
import { AWARD_SUBMISSION_STATUS, CoiProjectOverviewRequest, DEV_PROPOSAL_SUBMISSION_STATUS, LookupArrayForAwardStatus,
    MANDATORY_MARKING_MODAL_ID, NameObject, ProjectDetails, ProjectOverview, SortCountObj } from './project-dashboard.interface';
import { switchMap } from 'rxjs/operators';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { ActivatedRoute } from '@angular/router';
import { PROJECT_DASHBOARD_NO_INFO_MESSAGE } from '../no-info-message-constants';
import { getEndPointOptionsForCaAdmin } from '../common/services/end-point.config';
import { EndPointOptions } from '../shared-components/shared-interface';

@Component({
    selector: 'app-project-dashboard',
    templateUrl: './project-dashboard.component.html',
    styleUrls: ['./project-dashboard.component.scss'],
    animations: [fadeInOutHeight, listAnimation, topSlideInOut, leftSlideInOut,
        heightAnimation('0', '*', 300, 'heightAnimation'),
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ]
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {

    @ViewChild('startDateInput', { static: false }) startDateInput?: ElementRef;
    @ViewChild('endDateInput', { static: false }) endDateInput?: ElementRef;

    isShowNavigationOptions = false;
    isViewAdvanceSearch = false;
    localProjectOverviewRO = new CoiProjectOverviewRequest();
    leadUnitSearchOptionsForProjectOverview: any = {};
    sponsorSearchOptionsForProjectOverview: any = {};
    caAdminSearchOptionsForProjectOverview: EndPointOptions  = {};
    primeSponsorSearchOptionsForProjectOverview: any = {};
    elasticPersonSearchOptionsForProjectOverview: any = {};
    $projectOverviewList = new Subject<any>();
    sortCountObj: SortCountObj;
    advacnceSearchDatesForProjectOverview = { startDate: null, endDate: null };
    $subscriptions: Subscription[] = [];
    lookupArrayForProjectStatus: any[] = [];
    lookupValuesForProjectOverview = [];
    projectOverviewData: ProjectOverview = new ProjectOverview();
    sortSectionsList = [];
    ProjectOverviewSortSections = [
        { variableName: 'projectSubmissionStatus', fieldName: 'Submission Status' },
        { variableName: 'projectReviewStatus', fieldName: OVERALL_REVIEW },
        { variableName: 'title', fieldName: 'Project Title' },
        { variableName: 'leadUnitName', fieldName: 'Lead Unit' },
        { variableName: 'sponsorName', fieldName: 'Sponsor' },
        { variableName: 'primeSponsorName', fieldName: 'Prime Sponsor' },
        { variableName: 'updateTimestamp', fieldName: 'Last Updated' }
    ];
    totalPageCount: number | null = null;
    proposalStatusOptionsForProjectOverview = 'EMPTY#EMPTY#true#true#true#true';
    isLoading = true;
    projectDefaultValues = new NameObject();
    datePlaceHolder = DATE_PLACEHOLDER;
    advSearchLeadUnitPlaceholder = ADV_SEARCH_LEAD_UNIT_PH;
    advSearchCaAdminPlaceholder = 'Search by Contract Administrator';
    isCAAdmin = false;
    projectDetailsForMandatoryMarking = new ProjectDetails();
    mandatoryList = new Map();
    confirmationDescription = '';
    modalConfig = new CommonModalConfig(MANDATORY_MARKING_MODAL_ID, 'Confirm', 'Cancel');
    DISCLOSURE_MANDATORY_FLAGS = DISCLOSURE_MANDATORY_FLAGS;
    isAdvanceSearchMade = false;
    advancedSearchCriteriaCount: number = 0;
    elasticPersonSearchOptionsForProjectOverviewPI: any = {};
    lookupArrayForAwardStatus: LookupArrayForAwardStatus[] = [];
    dynamicSortFieldName = PROJECT_DASHBOARD_SORT_TITLES;
    noDataMessage = PROJECT_DASHBOARD_NO_INFO_MESSAGE;
    submissionStatusLookup = {
        options: 'EMPTY#EMPTY#true#true#true#true',
        AWARD: AWARD_SUBMISSION_STATUS,
        DEV_PROPOSAL: DEV_PROPOSAL_SUBMISSION_STATUS
    };
    dateFormatValidationMap = new Map();
    isShowDisclosureList = false;
    PROJECT_DASHBOARD_ADV_SEARCH_ORDER = PROJECT_DASHBOARD_ADV_SEARCH_ORDER;
    isShowInfoMessage = true;
    defaultProjectCount: number | null = null;
    defaultDataLoadMessage = 'Please use the Advanced Search to retrieve results.';
    advanceSearchTimeOut: ReturnType<typeof setTimeout>;

    constructor( private _elasticConfig: ElasticConfigService,
        public commonService: CommonService,
        private _navigationService: NavigationService,
        public projectDashboardService: ProjectDashboardService,
        private _informationAndHelpTextService: InformationAndHelpTextService,
        private _activatedRoute: ActivatedRoute
    ) { document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this)); }

    ngOnInit() {
        this.isCAAdmin = this.commonService.getAvailableRight(['CONTRACT_ADMINISTRATOR']);
        this._informationAndHelpTextService.moduleConfiguration = this.commonService.getSectionCodeAsKeys(this._activatedRoute.snapshot.data.moduleConfig);
        this.getLookupDataForProposalStatus();
        this.getLookupDataForAwardStatus();
        this.setDashboardTab();
        this.setSortFieldName();
        this.setSearchOptionsForProjectOverview();
        this.setAdvanceSearch(this.projectDashboardService.projectOverviewRequestObject.tabName);
        this.loadProjectData();
        this.checkForSort();
        this.checkForPagination();
        this.checkForAdvanceSearch();
        this.fetchDefaultProjectCount();
    }

    private checkForAdvanceSearch(): void {
        if (this.isAdvancedSearchMade() && this.checkForPreviousURL()) {
            this.isShowDisclosureList = true;
            this.isShowInfoMessage = false;
            if (this.projectDashboardService.isAdvanceSearch) {
                this.isViewAdvanceSearch = true;
                this.fetchLocalObjectFromServiceObject();
                this.generateLookupArrayForDropdown();
                this.setDefaultSearchOptions();
            } else {
                this.isViewAdvanceSearch = false;
            }
        } else {
            this.resetSortObjects();
            this.resetAdvanceSearchFields();
        }
        this.$projectOverviewList.next();
    }

    private generateLookupArrayForDropdown(): void {
        if (this.projectDashboardService.projectOverviewRequestObject.property4.length) {
            this.generateLookupArray(this.projectDashboardService.projectOverviewRequestObject.property4, 'property4');
        }
        if (this.projectDashboardService.projectOverviewRequestObject.coiSubmissionStatus?.length) {
            this.generateLookupArray(this.projectDashboardService.projectOverviewRequestObject.coiSubmissionStatus, 'coiSubmissionStatus');
        }
    }

    private generateLookupArray(property, propertyNumber): void {
        this.lookupArrayForProjectStatus[propertyNumber] = [];
        property.forEach(element => {
            this.lookupArrayForProjectStatus[propertyNumber].push({ code: element });
        });
    }

    private fetchLocalObjectFromServiceObject(): void {
        this.localProjectOverviewRO.property2 = this.projectDashboardService.projectOverviewRequestObject.property2 ?
            this.projectDashboardService.projectOverviewRequestObject.property2 : null;
        this.localProjectOverviewRO.property3 = this.projectDashboardService.projectOverviewRequestObject.property3 ?
            this.projectDashboardService.projectOverviewRequestObject.property3 : null;
        this.localProjectOverviewRO.property4 = this.projectDashboardService.projectOverviewRequestObject.property4.length > 0 ?
            this.projectDashboardService.projectOverviewRequestObject.property4 : [];
        this.localProjectOverviewRO.property6 = this.projectDashboardService.projectOverviewRequestObject.property5 ?
            this.projectDashboardService.projectOverviewRequestObject.property6 : null;
        this.localProjectOverviewRO.property9 = this.projectDashboardService.projectOverviewRequestObject.property9 ?
            this.projectDashboardService.projectOverviewRequestObject.property9 : null;
        this.localProjectOverviewRO.property11 = this.projectDashboardService.projectOverviewRequestObject.property11 ?
            this.projectDashboardService.projectOverviewRequestObject.property11 : null;
        this.advacnceSearchDatesForProjectOverview.startDate = this.localProjectOverviewRO.property13 =
            this.projectDashboardService.projectOverviewRequestObject.property13 ?
            getDateObjectFromTimeStamp(this.projectDashboardService.projectOverviewRequestObject.property6) : null;
        this.advacnceSearchDatesForProjectOverview.endDate = this.localProjectOverviewRO.property14 =
            this.projectDashboardService.projectOverviewRequestObject.property14 ?
            getDateObjectFromTimeStamp(this.projectDashboardService.projectOverviewRequestObject.property14) : null;
        this.localProjectOverviewRO.accountNumber = this.projectDashboardService.projectOverviewRequestObject.accountNumber ?
            this.projectDashboardService.projectOverviewRequestObject.accountNumber : null;
        this.localProjectOverviewRO.piPersonIdentifier = this.projectDashboardService.projectOverviewRequestObject.piPersonIdentifier ?
            this.projectDashboardService.projectOverviewRequestObject.piPersonIdentifier : null;
        this.localProjectOverviewRO.caPersonIdentifier = this.projectDashboardService.projectOverviewRequestObject.caPersonIdentifier ?
            this.projectDashboardService.projectOverviewRequestObject.caPersonIdentifier : null;
        this.localProjectOverviewRO.coiSubmissionStatus = this.projectDashboardService.projectOverviewRequestObject.coiSubmissionStatus.length > 0 ?
            this.projectDashboardService.projectOverviewRequestObject.coiSubmissionStatus : [];
        this.localProjectOverviewRO.advancedSearch = 'A';
        this.projectDefaultValues = this.projectDashboardService.projectDefaultValues;
        this.localProjectOverviewRO.freeTextSearchFields = this.projectDashboardService?.projectOverviewRequestObject?.freeTextSearchFields ?
            this.projectDashboardService.projectOverviewRequestObject.freeTextSearchFields : null;
    }

    private isAdvancedSearchMade() : boolean {
        return !!Object.values(this.projectDashboardService.projectOverviewRequestObject)
            .find(V => V && ((typeof (V) === 'string' && V) || (typeof (V) === 'object' && V.length)));
    }

    private checkForPagination(): void {
        if (this.checkForPreviousURL()) {
            this.localProjectOverviewRO.currentPage = this.projectDashboardService.projectOverviewRequestObject.currentPage;
        }
    }

    private setAdvanceSearch(tabName: string): void {
        sessionStorage.setItem('currentProjectDashboardTab', tabName);
        this.isViewAdvanceSearch = true;
        this.isShowDisclosureList = false;
    }

    public loadProjectData(): void {
        this.$subscriptions.push(this.$projectOverviewList.pipe(
            switchMap(() => {
                this.isLoading = true;
                this.projectOverviewData = new ProjectOverview();
                return this.projectDashboardService.getCOIProjectOverviewDetails(this.getRequestObject())
            }))
            .subscribe((data: any) => {
                if (data.projectCount !== undefined) {
                    this.totalPageCount = data.projectCount;
                }
                this.projectOverviewData = data;
                this.isLoading = false;
            }, err => {
                this.isLoading = false;
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch dashboard.');
            }));
    }

    private fetchDefaultProjectCount(): Promise<boolean> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.projectDashboardService.getDefaultProjectCount(this.getRequestObject())
                    .subscribe({
                        next: (res: any) => {
                            this.defaultProjectCount = res?.projectCount;
                            resolve(true);
                        },
                        error: (err) => {
                            this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch project count.');
                            resolve(false);
                        }
                    }));
        });
    }

    private setDashboardTab(): void {
        this.projectDashboardService.projectOverviewRequestObject.tabName = sessionStorage.getItem('currentProjectDashboardTab') || 'AWARD';
    }

    private setSortFieldName(): void {
        const { tabName } = this.projectDashboardService.projectOverviewRequestObject;
        this.sortSectionsList = deepCloneObject(this.ProjectOverviewSortSections);
        const TITLE_SECTION = this.sortSectionsList.find(section => section?.variableName === 'title');
        if (TITLE_SECTION) {
            TITLE_SECTION.fieldName = this.dynamicSortFieldName[tabName];
        }
    }

    private setDefaultSearchOptions(): void {
        this.leadUnitSearchOptionsForProjectOverview.defaultValue = this.projectDashboardService.projectDefaultValues.departmentName || '';
        this.sponsorSearchOptionsForProjectOverview.defaultValue = this.projectDashboardService.projectDefaultValues.sponsorName || '';
        this.primeSponsorSearchOptionsForProjectOverview.defaultValue = this.projectDashboardService.projectDefaultValues.primeSponsorName || '';
        this.caAdminSearchOptionsForProjectOverview.defaultValue = this.projectDashboardService.projectDefaultValues.caPersonName || '';
        this.elasticPersonSearchOptionsForProjectOverview.defaultValue = this.projectDashboardService.projectDefaultValues.personName || '';
        this.elasticPersonSearchOptionsForProjectOverviewPI.defaultValue = this.projectDashboardService.projectDefaultValues.piPersonName || '';
    }

    ngOnDestroy(): void {
        document.removeEventListener('mouseup', null);
        subscriptionHandler(this.$subscriptions);
        clearTimeout(this.advanceSearchTimeOut);
    }

    private getRequestObject(): CoiProjectOverviewRequest {
        this.localProjectOverviewRO.tabName = sessionStorage.getItem('currentProjectDashboardTab');
        return this.localProjectOverviewRO;
    }

    actionsOnPageChange(event): void {
        if (this.localProjectOverviewRO.currentPage != event) {
            this.localProjectOverviewRO.currentPage = event;
            this.projectDashboardService.projectOverviewRequestObject.currentPage = event;
            this.isLoading = true;
            this.$projectOverviewList.next();
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
            this.isShowNavigationOptions = false;
        }
    }

    toggleAdvanceSearch(): void {
        this.isViewAdvanceSearch = !this.isViewAdvanceSearch;
        if (!this.isViewAdvanceSearch) {
            this.projectDashboardService.isAdvanceSearch = false;
        }
    }

    projectTabAdvSearch(): void {
        this.advanceSearchTimeOut = setTimeout(() => {
            this.setAdvanceSearchDateValuesToRO();
            this.isShowDisclosureList = true;
            this.isShowInfoMessage = false;
            this.localProjectOverviewRO.advancedSearch = 'A';
            this.localProjectOverviewRO.currentPage = 1;
            this.projectDashboardService.isAdvanceSearch = true;
            this.isAdvanceSearchMade = true;
            this.$projectOverviewList.next();
            this.setAdvanceSearchOfProjectOverviewToServiceObject();
            this.isViewAdvanceSearch = false;
            this.advancedSearchCriteriaCount = calculateFilledProperties(this.localProjectOverviewRO, ADVANCE_SEARCH_CRITERIA_IN_ADMIN_DASHBOARD);
            this.dateFormatValidationMap = new Map();
        }, 100);
    }

    setAdvanceSearchOfProjectOverviewToServiceObject(): void {
        this.projectDashboardService.projectOverviewRequestObject.property2 = this.localProjectOverviewRO.property2 || null;
        this.projectDashboardService.projectOverviewRequestObject.property3 = this.localProjectOverviewRO.property3 || null;
        this.projectDashboardService.projectOverviewRequestObject.property6 = this.localProjectOverviewRO.property6 || null;
        this.projectDashboardService.projectOverviewRequestObject.property4 = this.localProjectOverviewRO.property4 || [];
        this.projectDashboardService.projectOverviewRequestObject.property5 = this.localProjectOverviewRO.property5 || [];
        this.projectDashboardService.projectOverviewRequestObject.property9 = this.localProjectOverviewRO.property9 || null;
        this.projectDashboardService.projectOverviewRequestObject.property11 = this.localProjectOverviewRO.property11 || null;
        this.projectDashboardService.projectOverviewRequestObject.personIdentifier = this.localProjectOverviewRO.personIdentifier || null;
        this.projectDashboardService.projectOverviewRequestObject.property13 = parseDateWithoutTimestamp(this.localProjectOverviewRO.property13) || null;
        this.projectDashboardService.projectOverviewRequestObject.property14 = parseDateWithoutTimestamp(this.localProjectOverviewRO.property14) || null;
        this.projectDashboardService.projectOverviewRequestObject.accountNumber = this.localProjectOverviewRO.accountNumber || null;
        this.projectDashboardService.projectOverviewRequestObject.piPersonIdentifier = this.localProjectOverviewRO.piPersonIdentifier || null;
        this.projectDashboardService.projectOverviewRequestObject.caPersonIdentifier = this.localProjectOverviewRO.caPersonIdentifier || null;
        this.projectDashboardService.projectOverviewRequestObject.coiSubmissionStatus = this.localProjectOverviewRO.coiSubmissionStatus || null;
        this.projectDashboardService.projectDefaultValues.departmentName = this.projectDefaultValues.departmentName;
        this.projectDashboardService.projectDefaultValues.sponsorName = this.projectDefaultValues.sponsorName;
        this.projectDashboardService.projectDefaultValues.primeSponsorName = this.projectDefaultValues.primeSponsorName;
        this.projectDashboardService.projectDefaultValues.personName = this.projectDefaultValues.personName;
        this.projectDashboardService.projectDefaultValues.piPersonName = this.projectDefaultValues.piPersonName;
        this.projectDashboardService.projectDefaultValues.caPersonName = this.projectDefaultValues.caPersonName;
        this.projectDashboardService.projectOverviewRequestObject.freeTextSearchFields = this.localProjectOverviewRO?.freeTextSearchFields || [];
    }

    private setSearchOptionsForProjectOverview(): void {
        this.leadUnitSearchOptionsForProjectOverview = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
        this.sponsorSearchOptionsForProjectOverview = getEndPointOptionsForSponsor({ baseUrl: this.commonService.fibiUrl });
        this.primeSponsorSearchOptionsForProjectOverview = getEndPointOptionsForSponsor({ baseUrl: this.commonService.fibiUrl });
        this.caAdminSearchOptionsForProjectOverview = getEndPointOptionsForCaAdmin( this.commonService.baseUrl );
        this.elasticPersonSearchOptionsForProjectOverview = this._elasticConfig.getElasticForPerson();
        this.elasticPersonSearchOptionsForProjectOverviewPI = this._elasticConfig.getElasticForPerson();
    }

    clearAndExecuteAdvancedSearch(): void {
        this.resetAdvanceSearchFields();
        this.projectOverviewData = new ProjectOverview();
        this.$projectOverviewList.next();
    }

    async changeTab(tabName: 'AWARD' | 'DEV_PROPOSAL'): Promise<void> {
        this.isShowInfoMessage = true;
        this.projectDashboardService.isAdvanceSearch = false;
        this.setSortFieldName();
        this.resetAdvanceSearchFields();
        this.setAdvanceSearch(tabName);
        this.resetProjectOverviewSortObjects();
        if(tabName === 'AWARD') {
           await this.fetchDefaultProjectCount();
        }
        this.projectDashboardService.projectOverviewRequestObject.tabName = tabName;
        this.localProjectOverviewRO.tabName = tabName;
    }

    private setAdvanceSearchDateValuesToRO(): void {
        this.localProjectOverviewRO.property13 = parseDateWithoutTimestamp(this.advacnceSearchDatesForProjectOverview.startDate);
        this.localProjectOverviewRO.property14 = parseDateWithoutTimestamp(this.advacnceSearchDatesForProjectOverview.endDate);
    }

    private getLookupDataForProposalStatus(): void {
        this.$subscriptions.push(this.projectDashboardService.getLookupDataForProposalStatus().subscribe((res: any) => {
            this.lookupArrayForProjectStatus = res || [];
        }, err => this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)));
    }

    private getLookupDataForAwardStatus(): void {
        this.$subscriptions.push(this.projectDashboardService.getLookupDataForAwardStatus().subscribe((res: LookupArrayForAwardStatus[]) => {
            this.lookupArrayForAwardStatus = res || [];
        }, err => this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)));
    }

    private resetProjectOverviewSortObjects(): void {
        this.localProjectOverviewRO.sort = { "projectSubmissionStatus": 'asc', "projectReviewStatus": 'desc' };
        this.projectDashboardService.projectOverviewRequestObject.sort = { "projectSubmissionStatus": 'asc', "projectReviewStatus": 'desc' };
        this.sortCountObj = new SortCountObj();
        this.projectDashboardService.sortCountObject = new SortCountObj();
    }


    private resetAdvanceSearchFields() {
        this.sortCountObj = new SortCountObj();
        this.localProjectOverviewRO = new CoiProjectOverviewRequest();
        this.projectDashboardService.projectOverviewRequestObject.tabName = sessionStorage.getItem('currentProjectDashboardTab');
        this.projectDefaultValues = new NameObject();
        this.projectDashboardService.projectDefaultValues = new NameObject();
        if (this.getInputValue(this.startDateInput)) {
            this.startDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.endDateInput)) {
            this.endDateInput.nativeElement.value = '';
        }
        this.advacnceSearchDatesForProjectOverview = { startDate: null, endDate: null };
        this.lookupValuesForProjectOverview = [];
        this.isAdvanceSearchMade = false;
        this.setSearchOptionsForProjectOverview();
        this.dateFormatValidationMap = new Map();
    }

    private getInputValue(inputRef?: ElementRef): string {
        return inputRef?.nativeElement?.value?.trim() || '';
    }

    sortResult(sortFieldBy): void {
        this.sortCountObj[sortFieldBy]++;
        this.sortProjectsTab(sortFieldBy);
    }

    private sortProjectsTab(sortFieldBy: string): void {
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.localProjectOverviewRO.sort[sortFieldBy] = !this.localProjectOverviewRO.sort[sortFieldBy] ? 'asc' : 'desc'
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.localProjectOverviewRO.sort[sortFieldBy];
        }
        this.updateProjectSort();
        this.$projectOverviewList.next();
    }

    private updateProjectSort(): void {
        this.projectDashboardService.sortCountObject = deepCloneObject(this.sortCountObj);
        this.projectDashboardService.projectOverviewRequestObject.sort = deepCloneObject(this.localProjectOverviewRO.sort);
        this.projectDashboardService.sort = deepCloneObject(this.localProjectOverviewRO.sort);
    }

    onLookupSelectData(data: any, property: string): void {
        this.lookupValuesForProjectOverview[property] = data;
        this.localProjectOverviewRO[property] = data.length ? data.map(d => d.code) : [];
    }

    getClassForSort(index: number, sortSection: any): any {
        const CLASS_LIST: { [key: string]: boolean } = {
            'ms-1': index === 0,
            'mx-0': index !== 0,
            'px-8': !this.projectDashboardService.projectOverviewRequestObject.sort[sortSection?.variableName],
            'filter-active': this.projectDashboardService.projectOverviewRequestObject.sort[sortSection?.variableName] !== undefined
        };
        return CLASS_LIST;
    }

    private resetSortObjects(): void {
        this.localProjectOverviewRO.sort = { "projectSubmissionStatus": 'asc', "projectReviewStatus": 'desc' };
        this.projectDashboardService.projectOverviewRequestObject.sort = { "projectSubmissionStatus": 'asc', "projectReviewStatus": 'desc' };
        this.sortCountObj = new SortCountObj();
        this.projectDashboardService.sortCountObject = new SortCountObj();
    }

    private checkForPreviousURL() {
        return ['coi/disclosure'].some((url) => this._navigationService.previousURL.includes(url));
    }

    private checkForSort(): void {
        if (!isEmptyObject(this.projectDashboardService.projectOverviewRequestObject.sort) && this.checkForPreviousURL()) {
            this.localProjectOverviewRO.sort = deepCloneObject(this.projectDashboardService.projectOverviewRequestObject.sort);
            this.sortCountObj = deepCloneObject(this.projectDashboardService.sortCountObject);
        } else {
            this.resetSortObjects();
        }
    }

    onLeadUnitSelected(unit: any): void {
        this.localProjectOverviewRO.property3 = unit?.value ?? unit?.unitNumber ?? null;
        this.projectDefaultValues.departmentName = unit?.value ?? unit?.unitName ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'UNIT', !!unit?.value);
    }

    onCaAdminSelect(personDetails: any): void {
        this.localProjectOverviewRO.caPersonIdentifier = personDetails?.value ?? personDetails?.personId ?? null;
        this.projectDefaultValues.caPersonName = personDetails?.value ?? personDetails?.fullName ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'CONTRACT_ADMINISTRATOR', !!personDetails?.value);
    }

    onSponsorSelect(sponsor: any): void {
        this.localProjectOverviewRO.property9 = sponsor?.value ?? sponsor?.sponsorCode ?? null;  
        this.projectDefaultValues.sponsorName = sponsor?.value ?? sponsor?.sponsorName ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'SPONSOR', !!sponsor?.value);
    }

    onPrimeSponsorSelect(primeSponsor: any): void {
        this.localProjectOverviewRO.property11 = primeSponsor?.value ?? primeSponsor?.sponsorCode ?? null;  
        this.projectDefaultValues.primeSponsorName = primeSponsor?.value ?? primeSponsor?.sponsorName ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'PRIME_SPONSOR', !!primeSponsor?.value);
    }

    onPersonNameSelect(person: any): void {
        this.localProjectOverviewRO.personIdentifier = person?.value ?? person?.prncpl_id ?? null;  
        this.projectDefaultValues.personName = person?.value ?? person?.full_name ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'PERSON', !!person?.value);
    }

    onPiPersonNameSelect(person: any): void {
        this.localProjectOverviewRO.piPersonIdentifier = person?.value ?? person?.prncpl_id ?? null;     
        this.projectDefaultValues.piPersonName = person?.value ?? person?.full_name ?? null;
        updateSearchField(this.localProjectOverviewRO.freeTextSearchFields, 'PRINCIPAL_INVESTIGATOR', !!person?.value);
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            if (this.validateMandatoryFields()) {
                this.markDisclosureAsMandatory(this.projectDetailsForMandatoryMarking);
            }
        }
         else {
            this.clearMandatoryDisclosureDetails();
        }
    }

    private validateMandatoryFields(): boolean {
        this.mandatoryList.clear();
        if (!this.confirmationDescription) {
            this.mandatoryList.set('description', 'Please enter the description.');
        }
        return  this.mandatoryList.size === 0;
    }

    private clearMandatoryDisclosureDetails(): void {
        this.confirmationDescription = '';
        this.projectDetailsForMandatoryMarking = new ProjectDetails();
        this.mandatoryList.clear();
        closeCommonModal(MANDATORY_MARKING_MODAL_ID);
    }

    private markDisclosureAsMandatory(projectDetails): void {
        const REQ_BODY = {
            projectNumber: projectDetails?.projectNumber,
            disclosureValidationFlag: this.DISCLOSURE_MANDATORY_FLAGS.SELF,
            projectTitle: projectDetails?.title,
            projectUnitNumber: projectDetails?.leadUnitNumber,
            projectUnitName: projectDetails?.leadUnitName,
            comment: this.confirmationDescription,
            projectId: projectDetails?.projectId,
            projectStatus: projectDetails?.projectStatus
        }
        this.setDisclosureToMandatory(REQ_BODY);
    }

    private setDisclosureToMandatory(REQ_BODY): void {
        this.$subscriptions.push(this.projectDashboardService.setDisclosureToMandatory(REQ_BODY).subscribe((data) => {
            this.commonService.showToast(HTTP_SUCCESS_STATUS, `Disclosure request has been successfully initiated.`);
            this.$projectOverviewList.next();
            this.clearMandatoryDisclosureDetails();
            closeCommonModal(MANDATORY_MARKING_MODAL_ID);
        },
        error => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }))
    }

    getCurrentProjectDetails(event): void {
        if (event) {
            this.projectDetailsForMandatoryMarking = deepCloneObject(event);
            setTimeout(() => {
                openCommonModal(MANDATORY_MARKING_MODAL_ID);
            }, 50);
        }
    }

    validateDateFormat(fieldName: 'fromDate' | 'toDate'): void {
        const INPUT_DATE_FIELD = fieldName === 'fromDate' ? this.startDateInput : this.endDateInput;
        if (!INPUT_DATE_FIELD) return;
        this.dateFormatValidationMap.delete(fieldName);
        const DATE_VALUE = INPUT_DATE_FIELD.nativeElement.value?.trim();
        const ERROR_MESSAGE = getInvalidDateFormatMessage(DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.dateFormatValidationMap.set(fieldName, ERROR_MESSAGE);
        }
    }
}

