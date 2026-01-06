import { ActivatedRoute } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonService } from '../../common/services/common.service';
import { NavigationService } from '../../common/services/navigation.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ADV_SEARCH_DEPARTMENT_PH, DECLARATION_LOCALIZE } from '../../app-locales';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DECLARATION_ADMIN_DASHBOARD_NO_INFO_MESSAGE } from '../../no-info-message-constants';
import { CoiAssignAdminConfig, LookUpClass } from '../../common/services/coi-common.interface';
import { DeclarationAdminDashboardService } from './services/declaration-admin-dashboard.service';
import { ADVANCE_SEARCH_CRITERIA_IN_DECLARATION_ADMIN_DASHBOARD } from '../declaration-constants';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { calculateFilledProperties, updateSearchField } from '../../common/utilities/custom-utilities';
import { getEndPointOptionsForLeadUnit } from '../../../../../fibi/src/app/common/services/end-point.config';
import { DeclarationCardActionEvent } from '../../shared-components/declaration-card/declaration-card.component';
import { getDateObjectFromTimeStamp, isValidDateFormat, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { DATE_PLACEHOLDER, DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../app-constants';
import { fadeInOutHeight, listAnimation, topSlideInOut, slideInAnimation, scaleOutAnimation } from '../../common/utilities/animations';
import { DeclarationAdminDashboardSearchValues, DeclarationAdminDashboardRO, DeclarationSortCountObj,
    DeclarationDashboardSortType, DeclarationAdminDashboard, DeclAdminDashboardResolvedData,
    DeclarationDashboard, UserDeclaration, DeclAdminDashboardTabType, DeclAdminDashboardTabCount } from '../declaration.interface';

@Component({
    selector: 'app-declaration-admin-dashboard',
    templateUrl: './declaration-admin-dashboard.component.html',
    styleUrls: ['./declaration-admin-dashboard.component.scss'],
    animations: [fadeInOutHeight, listAnimation, topSlideInOut,
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ]
})
export class DeclarationAdminDashboardComponent implements OnInit, OnDestroy {

    @ViewChild('certificationDateInput', { static: false }) certificationDateInput?: ElementRef;
    @ViewChild('expirationDateInput', { static: false }) expirationDateInput?: ElementRef;

    isLoading = false;
    isSorting = false;
    loginPersonId = '';
    isShowOptions = false;
    isShowAdvanceSearch = true;
    isShowDeclarationList = false;
    dateValidationMap = new Map();
    selectedLookUpList: any[] = [];
    advancedSearchCriteriaCount = 0;
    leadUnitSearchOptions: any = {};
    hasAffiliationManageRight = false;
    datePlaceHolder = DATE_PLACEHOLDER;
    $fetchDeclarations = new Subject();
    elasticPersonSearchOptions: any = {};
    declarationLocalize = DECLARATION_LOCALIZE;
    lookupArrayForAdministrator: LookUpClass[];
    lookupArrayForDeclarationType: LookUpClass[];
    dashboardTempRO = new DeclarationAdminDashboardRO();
    assignAdminModalConfig = new CoiAssignAdminConfig();
    advSearchDepartmentPlaceholder = ADV_SEARCH_DEPARTMENT_PH;
    adminDashboardTabCount = new DeclAdminDashboardTabCount();
    declarationDashboardData = new DeclarationAdminDashboard();
    noDataMessage = DECLARATION_ADMIN_DASHBOARD_NO_INFO_MESSAGE;
    dashboardTempSearchValues = new DeclarationAdminDashboardSearchValues();
    dispositionStatusOptions = 'COI_DECLARATION_STATUS#DECLARATION_STATUS_CODE#true#true';
    reviewStatusOptions = 'DECLARATION_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true';
    declAdministratorOptions = 'EMPTY#EMPTY#true#true';
    declarationTypeOptions = 'EMPTY#EMPTY#true#true';
    sortSectionsList = [
        { variableName: 'PERSON_FULL_NAME', fieldName: 'Person' },
        { variableName: 'DECLARATION_TYPE', fieldName: `${DECLARATION_LOCALIZE.TERM} Type` },
        { variableName: 'DECLARATION_STATUS', fieldName: `${DECLARATION_LOCALIZE.TERM_DISPOSITION_STATUS}` },
        { variableName: 'REVIEW_STATUS_CODE', fieldName: `${DECLARATION_LOCALIZE.TERM_REVIEW_STATUS}` },
        { variableName: 'SUBMISSION_DATE', fieldName: `${DECLARATION_LOCALIZE.SUBMISSION} Date` },
        { variableName: 'EXPIRATION_DATE', fieldName: 'Expiration Date' },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' },
    ];

    private $subscriptions: Subscription[] = [];
    private advanceSearchTimeOut: ReturnType<typeof setTimeout>;

    readonly declarationTabTypeAll: DeclAdminDashboardTabType = 'ALL_DECLARATIONS';

    constructor(
        public commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
        private _elasticConfig: ElasticConfigService,
        private _navigationService: NavigationService,
        public adminDashBoardService: DeclarationAdminDashboardService,
        private _informationAndHelpTextService: InformationAndHelpTextService,
    ) {
        document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
    }

    ngOnInit(): void {
        this.loginPersonId = this.commonService.getCurrentUserDetail('personID');
        this.hasAffiliationManageRight = this.commonService.getAvailableRight(MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
        this.setDashboardConfigFromSnapshot();
        this.getAdminDashboardTabCount();
        this.listenFetchDeclarations();
        this.setSearchOptions();
        this.setAdvancedSearch();
    }

    ngOnDestroy(): void {
        clearTimeout(this.advanceSearchTimeOut);
        subscriptionHandler(this.$subscriptions);
    }

    private offClickMainHeaderHandler(event: any): void {
        if (window.innerWidth < 1200) {
            const ELEMENT = <HTMLInputElement>document.getElementById('declarationNav');
            if (ELEMENT?.classList.contains('show')) {
                ELEMENT?.classList.remove('show');
            }
        }
        this.isShowOptions = false;
    }

    private setDashboardConfigFromSnapshot(): void {
        const RESOLVED_DATA: DeclAdminDashboardResolvedData = this._activatedRoute.snapshot.data.resolvedData;
        this._informationAndHelpTextService.moduleConfiguration = this.commonService.getSectionCodeAsKeys(RESOLVED_DATA?.moduleConfig);
        this.lookupArrayForAdministrator = RESOLVED_DATA?.lookupArrayForAdministrator;
        this.lookupArrayForDeclarationType = RESOLVED_DATA?.lookupArrayForDeclarationType;
    }

    private listenFetchDeclarations(): void {
        this.$subscriptions.push(
            this.$fetchDeclarations.pipe(
                switchMap(() => {
                    this.isLoading = true;
                    this.isShowAdvanceSearch = false;
                    this.dateValidationMap = new Map();
                    this.declarationDashboardData = new DeclarationAdminDashboard();
                    return this.adminDashBoardService.fetchDeclarations(this.adminDashBoardService.dashboardRO).pipe(
                        catchError((error) => {
                            this.commonService.showToast(HTTP_ERROR_STATUS, `Failed to fetch declarations. Please try again.`);
                            return of(null);
                        })
                    );
                })
            ).subscribe(
                (declarationDashboardData: DeclarationAdminDashboard | null) => {
                    if (declarationDashboardData) {
                        this.declarationDashboardData = {
                            ...declarationDashboardData,
                            dashboardResponses: this.getFormattedDashboardList(declarationDashboardData.dashboardResponses)
                        };
                    }
                    this.isLoading = false;
                    this.isSorting = false;
                    this.isShowDeclarationList = true;
                }
            )
        );
    }

    private getFormattedDashboardList(declarationDashboardData: DeclarationDashboard[]): DeclarationDashboard[] {
        return declarationDashboardData.map((declarationDetails: DeclarationDashboard) => {
            return {
                ...declarationDetails,
                isShowAssignAdminBtn: this.getAssignAdminBtnVisibility(declarationDetails)
            }
        });
    }

    private getAssignAdminBtnVisibility(declarationDetails: DeclarationDashboard): boolean {
        const IS_NOT_DECLARATION_OWNER = declarationDetails?.personId !== this.loginPersonId;
        const IS_LOGGED_PERSON_ADMIN = declarationDetails?.adminPersonId === this.loginPersonId;
        const CAN_EDIT_AFFILIATED_DISCLOSURE = declarationDetails?.isHomeUnitSubmission === false && this.hasAffiliationManageRight;
        const CAN_MANAGE_DISCLOSURE = (declarationDetails?.isHomeUnitSubmission || CAN_EDIT_AFFILIATED_DISCLOSURE) && IS_NOT_DECLARATION_OWNER;
        const IS_NEW_SUBMISSION_TAB = this.adminDashBoardService.tabType === 'NEW_SUBMISSIONS';
        return IS_NEW_SUBMISSION_TAB && (CAN_MANAGE_DISCLOSURE || IS_LOGGED_PERSON_ADMIN);
    }

    private getAdminDashboardTabCount(): void {
        const DASHBOARD_COUNT_RO = new DeclarationAdminDashboardRO();
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.adminDashBoardService.getAdminDashboardTabCount(DASHBOARD_COUNT_RO)
                .subscribe((tabCounts: DeclAdminDashboardTabCount) => {
                    this.adminDashboardTabCount = tabCounts || new DeclAdminDashboardTabCount();
                }, (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in getting Tab Counts');
                }));
        this.commonService.removeLoaderRestriction();
    }

    private setSearchOptions(): void {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    private cacheSearchCriteria(): void {
        this.adminDashBoardService.dashboardSearchValues = this.dashboardTempSearchValues;
        this.adminDashBoardService.dashboardRO.TYPE = this.dashboardTempRO.TYPE || undefined;
        this.adminDashBoardService.dashboardRO.PERSON = this.dashboardTempRO.PERSON || undefined;
        this.adminDashBoardService.dashboardRO.TAB_TYPE = this.dashboardTempRO.TAB_TYPE || undefined;
        this.adminDashBoardService.dashboardRO.DEPARTMENT = this.dashboardTempRO.DEPARTMENT || undefined;
        this.adminDashBoardService.dashboardRO.ADMINISTRATOR = this.dashboardTempRO.ADMINISTRATOR || undefined;
        this.adminDashBoardService.dashboardRO.DECLARATION_TYPE = this.dashboardTempRO.DECLARATION_TYPE || undefined;
        this.adminDashBoardService.dashboardRO.DECLARATION_STATUS = this.dashboardTempRO.DECLARATION_STATUS || undefined;
        this.adminDashBoardService.dashboardRO.REVIEW_STATUS_CODE = this.dashboardTempRO.REVIEW_STATUS_CODE || undefined;
        this.adminDashBoardService.dashboardRO.FREE_TEXT_SEARCH_FIELDS = this.dashboardTempRO.FREE_TEXT_SEARCH_FIELDS || undefined;
        this.adminDashBoardService.dashboardRO.SUBMISSION_DATE = parseDateWithoutTimestamp(this.dashboardTempRO.SUBMISSION_DATE) || undefined;
        this.adminDashBoardService.dashboardRO.EXPIRATION_DATE = parseDateWithoutTimestamp(this.dashboardTempRO.EXPIRATION_DATE) || undefined;
        this.advancedSearchCriteriaCount = calculateFilledProperties(this.dashboardTempRO, ADVANCE_SEARCH_CRITERIA_IN_DECLARATION_ADMIN_DASHBOARD);
    }

    private setTempFromCache(): void {
        const CACHED_DATA = this.adminDashBoardService.dashboardRO;
        this.dashboardTempRO.TYPE = CACHED_DATA.TYPE || undefined;
        this.dashboardTempRO.PERSON = CACHED_DATA.PERSON || undefined;
        this.dashboardTempRO.TAB_TYPE = CACHED_DATA.TAB_TYPE || undefined;
        this.dashboardTempRO.DEPARTMENT = CACHED_DATA.DEPARTMENT || undefined;
        this.dashboardTempRO.ADMINISTRATOR = CACHED_DATA.ADMINISTRATOR || undefined;
        this.dashboardTempRO.DECLARATION_TYPE = CACHED_DATA.DECLARATION_TYPE || undefined;
        this.dashboardTempRO.DECLARATION_STATUS = CACHED_DATA.DECLARATION_STATUS || undefined;
        this.dashboardTempRO.REVIEW_STATUS_CODE = CACHED_DATA.REVIEW_STATUS_CODE || undefined;
        this.dashboardTempRO.FREE_TEXT_SEARCH_FIELDS = CACHED_DATA.FREE_TEXT_SEARCH_FIELDS || undefined;
        this.dashboardTempRO.SUBMISSION_DATE = getDateObjectFromTimeStamp(CACHED_DATA.SUBMISSION_DATE) || undefined;
        this.dashboardTempRO.EXPIRATION_DATE = getDateObjectFromTimeStamp(CACHED_DATA.EXPIRATION_DATE) || undefined;
        this.setSearchOptionsFromCache();
        this.generateSelectedLookupFromCache();
        this.advancedSearchCriteriaCount = calculateFilledProperties(this.dashboardTempRO, ADVANCE_SEARCH_CRITERIA_IN_DECLARATION_ADMIN_DASHBOARD);
    }

    private setSearchOptionsFromCache(): void {
        this.dashboardTempSearchValues = this.adminDashBoardService.dashboardSearchValues;
        this.elasticPersonSearchOptions.defaultValue = this.dashboardTempSearchValues.personName || '';
        this.leadUnitSearchOptions.defaultValue = this.dashboardTempSearchValues.departmentName || '';
    }

    private generateSelectedLookupFromCache(): void {
        const LOOKUP_KEYS = ['DECLARATION_STATUS', 'REVIEW_STATUS_CODE', 'DECLARATION_TYPE', 'ADMINISTRATOR'] as const;
        for (const KEY of LOOKUP_KEYS) {
            const VALUE = this.dashboardTempRO[KEY];
            if (VALUE) {
                this.generateLookupArray(VALUE, KEY);
            }
        }
    }

    private generateLookupArray(list: string, key: (keyof DeclarationAdminDashboardRO)): void {
        this.selectedLookUpList[key] = [];
        list.split(',').forEach(element => {
            this.selectedLookUpList[key].push({ code: element });
        });
    }

    private fetchDeclarations(): void {
        this.cacheSearchCriteria();
        this.cacheSortCriteria();
        this.$fetchDeclarations.next();
    }

    private checkForPreviousURL(): boolean {
        return ['coi/declaration'].some((url) => this._navigationService.previousURL?.includes(url));
    }

    private getDefaultTabType(): DeclAdminDashboardTabType {
        return this.declarationTabTypeAll;
    }

    /**
     * Retrieves the cached declaration tab type from sessionStorage.
     * 
     * - Reads the value stored under the key 'currentDeclarationAdminTab'.
     * - Converts it to a string if available.
     * - Returns the cached value, or null if nothing is stored.
     */
    private getCachedTabType(): DeclAdminDashboardTabType | null {
        const CACHED_TAB_TYPE = sessionStorage.getItem('currentDeclarationAdminTab')?.toString();
        return CACHED_TAB_TYPE as DeclAdminDashboardTabType || null;
    }

    private setTabType(tabType: DeclAdminDashboardTabType): void {
        this.adminDashBoardService.tabType = tabType;
        this.dashboardTempRO.TAB_TYPE = tabType;
        this.adminDashBoardService.dashboardRO.TAB_TYPE = tabType;
        sessionStorage.setItem('currentDeclarationAdminTab', tabType);
    }

    private setAdvancedSearch(): void {
        const DEFAULT_TAB_TYPE = this.getDefaultTabType();
        const CURRENT_TAB_TYPE = this.getCachedTabType();
        const IS_NAVIGATED_FROM_DECLARATION_PAGE = this.checkForPreviousURL();
        if (IS_NAVIGATED_FROM_DECLARATION_PAGE && CURRENT_TAB_TYPE) {
            this.setTabType(CURRENT_TAB_TYPE);
        } else {
            this.adminDashBoardService.isAdvanceSearchMade = false;
            this.adminDashBoardService.isShowAdvanceSearchBox = true;
            this.adminDashBoardService.sortCountObj = new DeclarationSortCountObj();
            this.adminDashBoardService.sortType = new DeclarationDashboardSortType();
            this.adminDashBoardService.dashboardRO = new DeclarationAdminDashboardRO();
            this.adminDashBoardService.dashboardSearchValues = new DeclarationAdminDashboardSearchValues();
            this.setTabType(DEFAULT_TAB_TYPE);
        }
        this.setTempFromCache();
        if (this.adminDashBoardService.isAdvanceSearchMade || this.adminDashBoardService.tabType !== this.declarationTabTypeAll) {
            this.fetchDeclarations();
        }
    }

    private sortAdminDashboardTabs(sortFieldBy: string): void {
        if (this.adminDashBoardService.sortCountObj[sortFieldBy] < 3) {
            this.adminDashBoardService.sortType[sortFieldBy] = !this.adminDashBoardService.sortType[sortFieldBy] ? 'ASC' : 'DESC';
        } else {
            this.adminDashBoardService.sortCountObj[sortFieldBy] = 0;
            delete this.adminDashBoardService.sortType[sortFieldBy];
        }
        this.fetchDeclarations();
    }

    /**
     * Caches the current sort configuration.
     * - If no sort keys are present, removes SORT_TYPE from the dashboardRO.
     * - Otherwise, converts the sort object to a comma-separated string and stores it in SORT_TYPE.
     */
    private cacheSortCriteria(): void {
        const SORT_TYPE_OBJECT = this.adminDashBoardService.sortType;
        if (!Object.keys(SORT_TYPE_OBJECT)?.length) {
            delete this.adminDashBoardService.dashboardRO.SORT_TYPE;
        } else {
            const KEY_VALUE_PAIRS = Object.entries(SORT_TYPE_OBJECT)
                .map(([key, value]) => `${key} ${value}`)
                .join(',');
            this.adminDashBoardService.dashboardRO.SORT_TYPE = KEY_VALUE_PAIRS;
        }
    }

    private setAdvanceSearchVisibility(): void {
        if (this.adminDashBoardService.tabType === this.declarationTabTypeAll) {
            this.isShowAdvanceSearch = true;
        } else {
            this.isShowDeclarationList = true;
            this.isShowAdvanceSearch = false;
            this.adminDashBoardService.isShowAdvanceSearchBox = false;
        }
    }

    private getInputValue(inputRef?: ElementRef): string {
        return inputRef?.nativeElement?.value?.trim() || '';
    }

    /**
     * Updates the FREE_TEXT_SEARCH_FIELDS in dashboardTempRO based on the field key and its presence.
     */
    private updateFreeTextSearchField(key: string, isPresent: boolean): void {
        const DATA = this.dashboardTempRO.FREE_TEXT_SEARCH_FIELDS?.split(',') || [];
        updateSearchField(DATA, key, isPresent);
        this.dashboardTempRO.FREE_TEXT_SEARCH_FIELDS = DATA.join(',');
    }

    private resetAdvancedSearch(tabType: DeclAdminDashboardTabType): void {
        this.setSearchOptions();
        this.selectedLookUpList = [];
        this.dateValidationMap = new Map();
        this.advancedSearchCriteriaCount = 0;
        this.adminDashBoardService.isAdvanceSearchMade = false;
        this.dashboardTempRO = new DeclarationAdminDashboardRO();
        this.declarationDashboardData = new DeclarationAdminDashboard();
        this.adminDashBoardService.sortCountObj = new DeclarationSortCountObj();
        this.adminDashBoardService.sortType = new DeclarationDashboardSortType();
        this.adminDashBoardService.dashboardRO = new DeclarationAdminDashboardRO();
        this.dashboardTempSearchValues = new DeclarationAdminDashboardSearchValues();
        this.adminDashBoardService.dashboardSearchValues = new DeclarationAdminDashboardSearchValues();
        if (this.getInputValue(this.certificationDateInput)) {
            this.certificationDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.expirationDateInput)) {
            this.expirationDateInput.nativeElement.value = '';
        }
        this.setTabType(tabType);
        this.setAdvanceSearchVisibility();
    }

    toggleAdvanceSearch(): void {
        this.isShowAdvanceSearch = !this.isShowAdvanceSearch;
        if (!this.isShowAdvanceSearch) {
            this.adminDashBoardService.isShowAdvanceSearchBox = false;
        }
    }

    selectPersonName(person: any): void {
        this.dashboardTempRO.PERSON = person?.value || person?.prncpl_id || null;
        this.dashboardTempSearchValues.personName = person?.value || person?.full_name || null;
        this.updateFreeTextSearchField('PERSON', !!person?.value);
    }

    leadUnitChangeFunction(unit: any): void {
        this.dashboardTempRO.DEPARTMENT = unit?.value || unit?.unitNumber || null;
        this.dashboardTempSearchValues.departmentName = unit?.value || unit?.displayName || null;
        this.updateFreeTextSearchField('DEPARTMENT', !!unit?.value);
    }

    onLookupSelect(data: any, property: string): void {
        this.selectedLookUpList[property] = data;
        this.dashboardTempRO[property] = data.length ? data.map(d => d.code)?.join(',') : '';
    }

    validateDateFormat(fieldName: 'SUBMISSION_DATE' | 'EXPIRATION_DATE'): void {
        this.dateValidationMap.delete(fieldName);
        const INPUT_MAP = {
            SUBMISSION_DATE: this.certificationDateInput,
            EXPIRATION_DATE: this.expirationDateInput
        };
        const DATE_VALUE = INPUT_MAP[fieldName]?.nativeElement.value?.trim() || '';
        if (!DATE_VALUE) {
            return;
        }
        if (!this.isDateFormatValid(DATE_VALUE)) {
            const ERROR_MSG = `Entered date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`;
            this.dateValidationMap.set(fieldName, ERROR_MSG);
        }
    }

    changeTab(tabType: DeclAdminDashboardTabType): void {
        this.isShowDeclarationList = false;
        this.resetAdvancedSearch(tabType);
        this.getAdminDashboardTabCount();
        if (tabType !== this.declarationTabTypeAll) {
            this.fetchDeclarations();
        }
    }

    clearAdvancedSearch(): void {
        this.changeTab(this.adminDashBoardService.tabType);
    }

    performAdvanceSearch(): void {
        this.adminDashBoardService.isAdvanceSearchMade = true;
        this.dashboardTempRO.TYPE = 'A';
        this.adminDashBoardService.dashboardRO.PAGED = 0;
        this.advanceSearchTimeOut = setTimeout(() => {
            this.fetchDeclarations();
        }, 100);
    }

    sortResult(sortFieldBy: any): void {
        this.isSorting = true;
        this.adminDashBoardService.sortCountObj[sortFieldBy]++;
        this.sortAdminDashboardTabs(sortFieldBy);
    }

    actionsOnPageChange(event: number): void {
        const PAGE_OFFSET = (event - 1);
        if (this.dashboardTempRO.PAGED != PAGE_OFFSET) {
            this.dashboardTempRO.PAGED = PAGE_OFFSET;
            this.adminDashBoardService.dashboardRO.PAGED = PAGE_OFFSET;
            this.fetchDeclarations();
        }
    }

    openAssignAdminModal(declaration: DeclarationDashboard): void {
        const { adminGroupId, adminGroupName, adminPersonId, adminPersonName,declarationId, declarationNumber } = declaration || {};
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
            this.getAdminDashboardTabCount();
            this.fetchDeclarations();
        }
        setTimeout(() => {
            this.assignAdminModalConfig = new CoiAssignAdminConfig();
        }, 200);
    }

    declarationCardActions(event: DeclarationCardActionEvent): void {
        if (event.action === 'ASSIGN_ADMIN') {
            this.openAssignAdminModal(event.declarationDetails);
        }
    }

}
