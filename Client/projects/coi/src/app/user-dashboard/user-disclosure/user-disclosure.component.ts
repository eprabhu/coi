import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDisclosureService } from './user-disclosure.service';
import { UserDashboardService } from '../user-dashboard.service';
import { CommonService } from '../../common/services/common.service';
import {
    CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_DISCLOSURE_ROUTE_URL, CONSULTING_REDIRECT_URL,
    POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
    DISCLOSURE_TYPE,
    TRAVEL_DISCLOSURE_FORM_ROUTE_URL,
    OPA_CHILD_ROUTE_URLS,
    OPA_VERSION_TYPE,
    OPA_INITIAL_VERSION_NUMBER,
    PROJECT_TYPE,
    COI_MODULE_CODE,
    HTTP_ERROR_STATUS,
    OPA_MODULE_CODE,
    DISCLOSURE_CONFLICT_STATUS_BADGE,
    COI_DISPOSITION_STATUS_BADGE,
    COI_REVIEW_STATUS_BADGE,
    OPA_DISPOSITION_STATUS_BADGE,
    OPA_REVIEW_STATUS_BADGE,
    CONSULTING_DISPOSITION_STATUS_BADGE,
    CONSULTING_REVIEW_STATUS_BADGE
} from '../../app-constants';
import { Router } from '@angular/router';
import { ActiveDisclosure, DisclosureExpireDateValidation, SortCountObj, UserDisclosure } from './user-disclosure-interface';
import { Subject, interval, of } from 'rxjs';
import { catchError, debounce, switchMap } from 'rxjs/operators';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { listAnimation, leftSlideInOut, slideInAnimation, scaleOutAnimation } from '../../common/utilities/animations';
import { getDuration } from '../../../../../fibi/src/app/common/utilities/date-utilities';
import { HeaderService } from '../../common/header/header.service';
import { deepCloneObject, isEmptyObject, openCoiSlider } from '../../common/utilities/custom-utilities';
import { AttachmentSourceSection, COICountModal, COICountModalViewSlider, FcoiReviseRO } from '../../shared-components/shared-interface';
import { CoiDisclosureCount, FcoiType, GlobalEventNotifier, OPADisclosureDetails } from '../../common/services/coi-common.interface';
import { COMMON_DEPARTMENT, COMMON_DISCL_LOCALIZE, COMMON_DISCLOSURE_STATUS, COMMON_DISPOSITION_STATUS, COMMON_DOCUMENT_STATUS, COI_REVIEW_STATUS, CONSULTING_REVIEW_STATUS_LABEL,
    DECLARATION_LOCALIZE, TRAVEL_REVIEW_STATUS_LABEL, 
    CMP_LOCALIZE} from '../../app-locales';
import { CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS } from '../../travel-disclosure/travel-disclosure-constants';
import { USER_DASHBOARD_FILTER_SPECIFIC_NO_INFO_MESSAGE, USER_DASHBOARD_NO_INFO_MESSAGE } from '../../no-info-message-constants';
import { ProjectSfiRelations } from '../../disclosure/coi-interface';
import { CMP_GENERAL_COMMENTS, COI_REVIEW_COMMENTS_IDENTIFIER } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { CoiDashboardCardEvent } from '../../shared-components/coi-disclosure-dashboard-card/coi-disclosure-dashboard-card.component';
import { CoiReviewCommentSliderService } from '../../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { NavigationService } from '../../common/services/navigation.service';
import { DeclarationDashboard, DeclarationAdminDashboardRO, DeclarationAdminDashboard } from '../../declarations/declaration.interface';
import { CmpCard, CmpCardActionEvent, FetchReporterCmpRO } from '../../conflict-management-plan/shared/management-plan.interface';
import { FetchReviewCommentRO } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../shared-components/coi-review-comments/coi-review-comments.interface';

@Component({
    selector: 'app-user-disclosure',
    templateUrl: './user-disclosure.component.html',
    styleUrls: ['./user-disclosure.component.scss'],
    animations: [listAnimation, leftSlideInOut,
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ]
})

export class UserDisclosureComponent implements OnInit, OnDestroy {

    searchText = '';
    currentSelected = {
        tab: 'IN_PROGRESS_DISCLOSURES',
        filter: 'ALL',
    };
    dashboardRequestObject = {
        tabName: 'IN_PROGRESS_DISCLOSURES',
        isDownload: false,
        filterType: 'ALL',
        pageNumber: 20,
        currentPage: 1,
        property2: '',
        sort: { 'updateTimeStamp': 'desc' } 
    };
    completeDisclosureList: (UserDisclosure | DeclarationDashboard)[] = [];
    dashboardCount = new CoiDisclosureCount();
    isActiveDisclosureAvailable = false;
    coiList: [];
    isHover: [] = [];
    onButtonHovering: any = true;
    index: any;
    result: any;
    $subscriptions = [];
    $debounceEventForDisclosureList = new Subject();
    $fetchDisclosures = new Subject();
    isSearchTextHover = false;
    isLoading = false;
    readMoreOrLess = [];
    isShowFilterAndSearch = false;
    isShowCreate = false;
    showSlider = false;
    entityId: any;
    fcoiExpireDateValidation = new DisclosureExpireDateValidation();
    opaExpireDateValidation = new DisclosureExpireDateValidation();
    hasPendingFCOI: any = false;
    hasActiveFCOI = false;
    hasPendingOPA = false;
    hasActiveOPA = false;
    completeDisclosureListCopy: any = []; /* Excat copy of original list which is to perform every array operations */
    DATA_PER_PAGE: number = 20; /* Number of data to be shown in single page */
    paginationArray: any = []; /* Introduced to set the page count after searching with some keyword */
    sliderElementId: string = '';
    isPurposeRead = {};
    $debounceEventForAPISearch = new Subject();
    pageCountFromAPI: number;
    countModalData = new COICountModal();
    lastOpenedCountModalData = new COICountModal();
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    pendingDisclosureDetails: ActiveDisclosure;
    activeDisclosureDetails: ActiveDisclosure;
    noDataMessage = '';
    isShowDisclosureMasterCard = false;
    isShowOpaMasterCard = false;
    isShowFilterBox: boolean;
    OPA_CHILD_ROUTE_URLS = OPA_CHILD_ROUTE_URLS;
    projectRelationshipData = new ProjectSfiRelations();
    isShowCommentButton = false;
    isDateBetweenPeriod = false;
    opaInitialVersion = OPA_INITIAL_VERSION_NUMBER;
    fcoiReviseRO = new FcoiReviseRO();
    expireValidationMessage = 'Your Disclosure will expire today.';
    PROJECT_TYPE = PROJECT_TYPE;
    coiModuleCode = COI_MODULE_CODE;
    opaModuleCode = OPA_MODULE_CODE;
    isShowAdminDetails = false;
    isShowFCOIAdminDetails = false;
    travelDisclosureSortSections = [
        { variableName: 'travelEntityName', fieldName: 'Entity' },
        { variableName: 'documentStatusDescription', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'reviewDescription', fieldName: TRAVEL_REVIEW_STATUS_LABEL },
        { variableName: 'certifiedAt', fieldName: 'Submission Date' },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' }
    ];
    sortCountObj: SortCountObj = new SortCountObj();
    declarationLocalize = DECLARATION_LOCALIZE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    searchPlaceHolder = {
        TRAVEL_DISCLOSURES: `Search by Entity Name, ${COMMON_DEPARTMENT}, Traveller Type, Destination, ${TRAVEL_REVIEW_STATUS_LABEL}, ${COMMON_DOCUMENT_STATUS}, Purpose`,
        CONSULTING_DISCLOSURES: `Search by Entity Name, ${COMMON_DEPARTMENT}, ${COMMON_DISPOSITION_STATUS}, ${CONSULTING_REVIEW_STATUS_LABEL}`,
        IN_PROGRESS_DISCLOSURES: `Search by Project Title, ${COMMON_DEPARTMENT}, ${COMMON_DISCLOSURE_STATUS}, ${COMMON_DISPOSITION_STATUS}, ${COI_REVIEW_STATUS}`,
        APPROVED_DISCLOSURES: `Search by Project Title, ${COMMON_DEPARTMENT}, ${COMMON_DISCLOSURE_STATUS}, ${COMMON_DISPOSITION_STATUS}, ${COI_REVIEW_STATUS}`,
        DECLARATION: `Search by ${COMMON_DEPARTMENT}, ${DECLARATION_LOCALIZE.TERM} Type, ${DECLARATION_LOCALIZE.TERM} Status`
    };
    disclosureConflictStatusBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
    coiDispositionStatusBadge = COI_DISPOSITION_STATUS_BADGE;
    coiReviewStatusBadge = COI_REVIEW_STATUS_BADGE;
    opaDispositionStatusBadge = OPA_DISPOSITION_STATUS_BADGE;
    opaReviewStatusBadge = OPA_REVIEW_STATUS_BADGE;
    consultingDispositionStatusBadge = CONSULTING_DISPOSITION_STATUS_BADGE;
    consultingReviewStatusBadge = CONSULTING_REVIEW_STATUS_BADGE;
    CMP_LOCALIZE = CMP_LOCALIZE;
    sortSectionsList = [];
    cmpSortSections = [
        { variableName: 'cmpType', fieldName: 'CMP Type' },
        { variableName: 'updateTimeStamp', fieldName: 'Last Updated' },
    ]
    constructor(public userDisclosureService: UserDisclosureService,
                public userDashboardService: UserDashboardService,
                public commonService: CommonService,
                public headerService: HeaderService,
                private _router: Router,
                private _navigationService: NavigationService,
                private _coiReviewCommentSliderService: CoiReviewCommentSliderService) {
    }
    ngOnInit() {
        this.loadDashboardCount();
        this.setActiveTab();
        this.loadDashboard();
        this.getTravelSearchList();
        this.setDefaultDashboard();
        window.scrollTo(0,0);
        this.listenGlobalEventNotifier();
        this.isShowDisclosureMasterCard = this.commonService?.isShowFinancialDisclosure;
        this.isShowOpaMasterCard = this.commonService?.isShowOpaDisclosure;
        this.isShowCommentButton = !!(this.currentSelected.tab !== 'CONSULTING_DISCLOSURES');
        this.fcoiDatesRemaining();
        this.checkForSort();
        this.isShowAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType);
        this.isShowFCOIAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.coiApprovalFlowType);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                // This emitter will be triggered either when the comment slider closes or when the API request fails.
                if (event?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                    if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(event?.content?.action)) {
                        this.getDashboardBasedOnTab();
                        this.commonService.clearReviewCommentsSlider();
                    }
                }
            })
        );
    }

    private getTravelSearchList(): void {
        this.$subscriptions.push(this.$debounceEventForAPISearch.pipe(debounce(() => interval(800))).subscribe((data: any) => {
            this.$fetchDisclosures.next();
        }));
    }

    private setActiveTab(): void {
        let tabName: string;
        if (this.commonService?.isShowFinancialDisclosure || this.commonService?.isShowOpaDisclosure) {
            tabName = 'IN_PROGRESS_DISCLOSURES';
        } else if (this.commonService?.isShowTravelDisclosure) {
            tabName = 'TRAVEL_DISCLOSURES';
        } else {
            tabName = 'CONSULTING_DISCLOSURES';
        }
        this.currentSelected.tab = tabName;
        this.dashboardRequestObject.tabName = tabName;
    }

    private loadDashboard(): void {
        this.$subscriptions.push(this.$fetchDisclosures.pipe(
            switchMap(() => {
                this.getNoDataMessage();
                this.isLoading = true;
                this.dashboardRequestObject.property2 = this.isCurrentTabTravelOrConsulting() ? this.searchText?.trim() : '';
                return this.userDisclosureService.getCOIDashboard(this.dashboardRequestObject).pipe(
                    catchError((error) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, `Failed to fetch disclosure list. Please try again.`);
                        return of(null);
                    })
                );
            })).subscribe((res: any) => {
                this.result = res;
                if (this.result) {
                    this.completeDisclosureList = this.getDashboardList();
                    this.completeDisclosureListCopy = this.paginationArray = deepCloneObject(this.completeDisclosureList);
                    this.isCurrentTabTravelOrConsulting() ? this.pageCountFromAPI = this.result.totalServiceRequest : this.getArrayListForPagination();
                    this.updateTabCount(this.isCurrentTabTravelOrConsulting() ? this.pageCountFromAPI : this.paginationArray.length);
                    this.isShowFilterBox = this.isShowFilter();
                    this.isShowFilterAndSearch = !!this.getTabCount() || this.isShowFilterBox;
                }
                this.loadingComplete();
            }), (err) => {
                this.loadingComplete();
        });
    }

    /**
     * Description
     * @returns {any}
     * Here the sorting is applied for the merged array inorder to get the list based on the decreasing
     * order of updateTimeStamp. If any action performed on a particular disclosure or if any disclosure
     * created then that one will comes first in the list.
     */
    private getDashboardList(): any {
        const DISCLOSURE_VIEWS = this.getDisclosureProjectHeader(this.result.disclosureViews);
        const TRAVEL_DASHBOARD_VIEWS = this.result.travelDashboardViews || [];
        const OPA_DETAILS = this.result.opaDashboardDto || [];
        const CONSULTING_DISCLOSURE = this.result.consultingDisclDashboardViews || [];
        const MERGED_LIST = [...DISCLOSURE_VIEWS, ...TRAVEL_DASHBOARD_VIEWS, ...OPA_DETAILS, ...CONSULTING_DISCLOSURE];
        return this.getSortedListForParam(MERGED_LIST, 'updateTimeStamp');
    }

    private loadingComplete() {
        this.isLoading = false;
    }

    /**
     * Description
     * @param {any} arrayList:any
     * @param {any} sortByParam:any
     * @returns {any}
     * The method takes an input array and returns the corresponding sorted array for the param passed
     */
    private getSortedListForParam(arrayList: any, sortByParam: any): any {
        return arrayList.sort((a, b) => b[sortByParam] - a[sortByParam]);
    }

    private getDashboardBasedOnTab(): void {
        switch (this.currentSelected.tab) {
            case 'DISCLOSURE_HISTORY':
                this.getDisclosureHistory();
                break;
            case 'DECLARATION':
                this.getUserDeclarations();
                break;
            case 'CMP':
                this.fetchReporterCmp();
                break;
            default:
                this.completeDisclosureList = [];
                this.$fetchDisclosures.next();
                break;
        }
    }

    /**
     * Description
     * @returns {any}
     * The function will trigger for the close button in the search field
     */
    private resetAndFetchDisclosure(): void {
        this.searchText = '';
        this.pageCountFromAPI = 0;
        this.completeDisclosureList = [];
        this.cacheSelectedDisclosureTab();
        this.getDashboardBasedOnTab();
    }

    /**
     * Description
     * @param {any} event:number
     * @returns {any}
     * Basically for every page change, it will computes the data to be shown in that particular page by slicing the original disclosure
     * list based on the start and end indices.
     * For page 1 => data will shows from index 0 to index 19.
     * For page 2 => data will shows from index 20 to index 39 and so on
     */
    actionsOnPageChange(event: number): void {
        if (this.dashboardRequestObject.currentPage != event) {
            this.dashboardRequestObject.currentPage = event;
            this.isCurrentTabTravelOrConsulting() ? this.$fetchDisclosures.next() : this.getArrayListForPagination();
        }
    }

    /**
     * Description
     * @returns {any}
     * Arranges data in each page according to the Maximum number of data. By default the maximum number of data shows in a page is 20.
     * This function is implemented on purpose as we are removing the pagination functionality from server side. This is because we won't
     * be having a huge data in the dashboard in real time(production environment). Hence we dont want to make unnecessary api calls to
     * the server everytime for fetching the data.
     */
    private getArrayListForPagination(): void {
        const [START_INDEX, END_INDEX] = [this.getStartIndex(), this.getEndIndex()];
        this.completeDisclosureList = this.completeDisclosureListCopy.slice(START_INDEX, END_INDEX + 1);
    }

    /**
     * Description
     * @returns {any}
     * If there is only one page, then the maximum number of data would be 20. so we need to arrange the data from [0 to 19].
     * i.e., the starting point would always be 0 and ending point is always 19. Otherwise, for instance if the user clicks
     * on 2nd page, the starting point would be (2-1) * 20 = 20.
     */
    private getStartIndex(): number {
        if (this.dashboardRequestObject.currentPage == 1) { return 0; }
        return (this.dashboardRequestObject.currentPage - 1) * this.DATA_PER_PAGE;
    }

    /**
     * Description
     * @returns {any}
     * If there is only one page, then the maximum number of data would be 20. so we need to arrange the data from [0 to 19].
     * i.e., the starting point would always be 0 and ending point is always 19. Otherwise, for instance if the user clicks
     * on 2nd page, the ending point would be (20 * 2) - 1  = 39.
     */
    private getEndIndex(): number {
        if (this.dashboardRequestObject.currentPage == 1) { return this.DATA_PER_PAGE - 1; }
        return (this.DATA_PER_PAGE * this.dashboardRequestObject.currentPage) - 1;
    }

    /**
     * This function handles the filtering of disclosure lists based on the search word.
     *
     * Note:
     * - For the 'TRAVEL_DISCLOSURES' tab, pagination and search are managed by the backend,
     *   so a debounce event is triggered to handle this.
     * - For all other tabs, the search and pagination is performed on the frontend by filtering the local
     *   completeDisclosureListCopy array.
     *
     * The pagination is reset to the first page whenever a search is initiated.
     */
    getFilteredDisclosureListForSearchWord(): any {
        this.dashboardRequestObject.currentPage = 1; /* To set the pagination while search */
        this.getNoDataMessage();
        if (this.isCurrentTabTravelOrConsulting()) {
            this.$debounceEventForAPISearch.next();
        } else {
            this.completeDisclosureList = this.completeDisclosureListCopy.filter(disclosure => {
                for (const value in disclosure) {
                    if (this.isExistSearchWord(disclosure, value)) { return true; }
                }
                return false;
            });
            this.resetDisclosureCopy();
        }
    }

    private isExistSearchWord(disclosure: any, value: string): boolean {
        if (disclosure[value]?.unitDetail) {
            return disclosure[value].unitDetail.toString().trim().toLowerCase().includes(this.searchText.trim().toLowerCase());
        }
        return disclosure[value] && disclosure[value].toString().trim().toLowerCase().includes(this.searchText.trim().toLowerCase());
    }

    resetDashboardAfterSearch(): void {
        this.searchText = '';
        if(this.isCurrentTabTravelOrConsulting()) {
            this.$fetchDisclosures.next();
        } else {
            this.completeDisclosureList = this.getDashboardList();
            this.resetDisclosureCopy();
            this.getArrayListForPagination();
        }
    }

    isCurrentTabTravelOrConsulting() {
        return ['TRAVEL_DISCLOSURES', 'CONSULTING_DISCLOSURES'].includes(this.currentSelected.tab);
    }

    /**
     * Description
     * @returns {any}
     * The function is to set the pagination array separately while searching with a keyword
     */
    private resetDisclosureCopy(): void {
        this.paginationArray = this.completeDisclosureList;
    }

    private loadDashboardCount() {
        this.userDisclosureService.getCOIDashboardCount(this.dashboardRequestObject).subscribe((res: any) => {
            this.dashboardCount = res;
            this.setIsShowCreateFlag();
        });
    }

    private setIsShowCreateFlag() {
        if (!this.dashboardCount.inProgressDisclosureCount && !this.dashboardCount.approvedDisclosureCount
            && !this.dashboardCount.travelDisclosureCount && !this.dashboardCount.disclosureHistoryCount &&
            !this.completeDisclosureList.length && !this.dashboardCount?.declarationCount && !this.dashboardCount?.cmpCount &&
            this.dashboardRequestObject.currentPage == 1 && this.dashboardRequestObject.filterType == 'ALL') {
            this.isShowCreate = true;
            this.getNoDataMessage();
        }
    }

    private cacheSelectedDisclosureTab(): void {
        sessionStorage.setItem('currentMyDisclosureTab', JSON.stringify(this.currentSelected));
    }

    private getTabCount(): number {
        switch (this.currentSelected?.tab) {
            case 'IN_PROGRESS_DISCLOSURES': return this.dashboardCount?.inProgressDisclosureCount;
            case 'APPROVED_DISCLOSURES': return this.dashboardCount?.approvedDisclosureCount;
            case 'TRAVEL_DISCLOSURES': return this.dashboardCount?.travelDisclosureCount;
            case 'CONSULTING_DISCLOSURES': return this.dashboardCount?.consultDisclCount;
            case 'DISCLOSURE_HISTORY': return this.dashboardCount?.disclosureHistoryCount;
            case 'DECLARATION': return this.dashboardCount?.declarationCount;
            case 'CMP': return this.dashboardCount?.cmpCount;
            default: return 0;
        }
    }

    private isShowFilter(): boolean {
        switch (this.currentSelected?.tab) {
            case 'IN_PROGRESS_DISCLOSURES':
            case 'APPROVED_DISCLOSURES':
                return this.commonService.isShowFinancialDisclosure;
            case 'TRAVEL_DISCLOSURES':
            case 'CONSULTING_DISCLOSURES':
            case 'CMP':
                return false;
            case 'DISCLOSURE_HISTORY':
                return this.commonService.isShowFinancialDisclosure ||
                    ([this.commonService.isShowTravelDisclosure,
                      this.commonService.isShowConsultingDisclosure,
                      this.commonService.isShowOpaDisclosure,
                      this.commonService.activeDeclarationTypes?.length].filter(Boolean).length >= 2);
            case 'DECLARATION':
                return this.commonService.activeDeclarationTypes?.length > 1;
            default:
                return false;
        }
    }

    private setDefaultDashboard(): void {
        const STORED_TAB = JSON.parse(sessionStorage.getItem('currentMyDisclosureTab'));
        const CURRENT_TAB = (STORED_TAB?.tab && STORED_TAB?.filter) && this.isTabAccessible(STORED_TAB?.tab) ? STORED_TAB : this.currentSelected;
        this.setCurrentTab(CURRENT_TAB?.tab, CURRENT_TAB?.filter);
    }

    private isTabAccessible(tabName: string | null): boolean {
        const TAB_ACCESS_MAP: { [key: string]: boolean } = {
            IN_PROGRESS_DISCLOSURES: this.commonService.isShowFinancialDisclosure || this.commonService.isShowOpaDisclosure,
            APPROVED_DISCLOSURES: this.commonService.isShowFinancialDisclosure || this.commonService.isShowOpaDisclosure,
            TRAVEL_DISCLOSURES:this.commonService.isShowTravelDisclosure,
            CONSULTING_DISCLOSURES: this.commonService.isShowConsultingDisclosure,
            DECLARATION: this.commonService.activeDeclarationTypes?.length > 0,
            CMP: true,
            DISCLOSURE_HISTORY: this.commonService.isShowFinancialDisclosure || this.commonService.isShowTravelDisclosure || this.commonService.isShowConsultingDisclosure || this.commonService.isShowOpaDisclosure
        };
        return TAB_ACCESS_MAP[tabName || ''] ?? false;
    }

    private setCurrentTab(tabName: string, filterType: string): void {
        this.currentSelected.tab = tabName;
        this.dashboardRequestObject.tabName = tabName;
        this.dashboardRequestObject.currentPage = 1;
        this.dashboardRequestObject.filterType = filterType;
        this.currentSelected.filter = filterType;
        this.isShowFilterBox = this.isShowFilter();
        this.pageCountFromAPI = 0;
        this.isShowFilterAndSearch = !!this.getTabCount() || this.isShowFilterBox;
        this.resetAndFetchDisclosure();
        this.setSortSection();
    }

    private setSortSection(): void {
        this.sortCountObj = new SortCountObj();
        if (['TRAVEL_DISCLOSURES', 'CMP'].includes(this.currentSelected.tab)) {
            if (this.currentSelected.tab == 'TRAVEL_DISCLOSURES') {
                this.sortSectionsList = this.travelDisclosureSortSections;
                return;
            }
            if (this.currentSelected.tab == 'CMP') {
                this.sortSectionsList = this.cmpSortSections;
            }
        }
    }

    setTab(tabName: string): void {
        this.isShowCommentButton = !['CONSULTING_DISCLOSURES', 'DECLARATION'].includes(tabName);
        const ACTIVE_DECLARATION = this.commonService.activeDeclarationTypes;
        const DEFAULT_FILTER = tabName === 'DECLARATION' && ACTIVE_DECLARATION?.length === 1 ? ACTIVE_DECLARATION[0]?.declarationTypeCode : 'ALL';
        this.setCurrentTab(tabName, DEFAULT_FILTER);
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

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.commonService.clearReviewCommentsSlider();
    }

    openCountModal(disclosure: any, count: number | null = null, moduleCode: number = 0, inputType: AttachmentSourceSection = 'DISCLOSURE_TAB'): void {
        if (count > 0) {
            this.countModalData = {
                personUnit: moduleCode === this.opaModuleCode ? { unitDisplayName: disclosure?.unitDisplayName }: disclosure?.unit,
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

    setFilter(type = 'ALL') {
        this.currentSelected.filter = type;
        this.dashboardRequestObject.filterType = type;
        this.dashboardRequestObject.currentPage = 1;
        this.resetAndFetchDisclosure();
    }

    redirectToDisclosure(disclosure: UserDisclosure) {
        let redirectUrl;
        sessionStorage.setItem('previousUrl', this._router.url);
        if (disclosure.travelDisclosureId) {
            const isTravelDisclosureEditPage = CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS.includes(disclosure.reviewStatusCode);
            redirectUrl = isTravelDisclosureEditPage ? TRAVEL_DISCLOSURE_FORM_ROUTE_URL : POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL;
        } else if (disclosure.opaDisclosureId) {
            redirectUrl = OPA_CHILD_ROUTE_URLS.FORM;
        } else if(disclosure.disclosureId) {
            redirectUrl = CONSULTING_REDIRECT_URL;
        }
        else {
            const isDisclosureEditPage = ['1', '5', '6'].includes(disclosure.reviewStatusCode);
            redirectUrl = isDisclosureEditPage ? CREATE_DISCLOSURE_ROUTE_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
        }
        this._router.navigate([redirectUrl],
            { queryParams: { disclosureId: disclosure.travelDisclosureId || disclosure.coiDisclosureId || disclosure.opaDisclosureId || disclosure.disclosureId} });
    }

    redirectToFCOIDisclosure(disclosures: any) {
        if (disclosures?.disclosureId) {
            sessionStorage.setItem('previousUrl', this._router.url);
            const IS_DISCLOSURE_EDITABLE  = ['1', '5', '6'].includes(disclosures?.reviewStatusCode);
            const REDIRECT_URL = IS_DISCLOSURE_EDITABLE ? CREATE_DISCLOSURE_ROUTE_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: disclosures?.disclosureId} });
        }
    }

    redirectToOPADisclosure(opaDisclosure: OPADisclosureDetails): void {
        if (opaDisclosure?.opaDisclosureId) {
            sessionStorage.setItem('previousUrl', this._router.url);
            const REDIRECT_URL = OPA_CHILD_ROUTE_URLS.FORM;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: opaDisclosure?.opaDisclosureId} });
        }
    }

    formatTravellerTypes(travellerTypes: string): string {
        return travellerTypes ? (travellerTypes.split(',').map(travellerType => travellerType.trim()).join(', ')) : '';
    }

    private getDisclosureHistory(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.completeDisclosureList = [];
            this.$subscriptions.push(
                this.userDisclosureService.getDisclosureHistory({ 'filterType': this.currentSelected.filter })
                    .subscribe((data: any) => {
                        this.setDisclosureHistoryDetails(data);
                    }, (error: any) => {
                        this.setDisclosureHistoryDetails();
                    }));
        }
    }

    private fetchReporterCmp(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.getNoDataMessage();
            this.completeDisclosureList = [];
            this.$subscriptions.push(
                this.userDisclosureService.fetchReporterCmp(this.getFetchReporterCmpRO())
                    .subscribe((data: any) => {
                        this.completeDisclosureList = data?.records || [];
                        this.completeDisclosureListCopy = this.paginationArray = deepCloneObject(this.completeDisclosureList);
                        this.pageCountFromAPI = data?.totalCount || 0;
                        this.updateTabCount(this.pageCountFromAPI);
                        this.isShowFilterBox = this.isShowFilter();
                        this.isShowFilterAndSearch = !!this.getTabCount() || this.isShowFilterBox;
                        this.loadingComplete();
                    }, (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load conflict management plans. Please try again later.');
                        this.loadingComplete();
                    }));
        }
    }

    private getFetchReporterCmpRO(): FetchReporterCmpRO {
        const FETCH_RO = new FetchReporterCmpRO();
        FETCH_RO.currentPage = this.dashboardRequestObject.currentPage;
        FETCH_RO.sort = this.dashboardRequestObject.sort;
        return FETCH_RO;
    }

    private getUserDeclarationRO(): DeclarationAdminDashboardRO {
        const FETCH_RO = new DeclarationAdminDashboardRO();
        FETCH_RO.DECLARATION_TYPE = this.dashboardRequestObject.filterType === 'ALL' ? undefined : this.dashboardRequestObject.filterType;
        FETCH_RO.PERSON = this.commonService.getCurrentUserDetail('personID');
        FETCH_RO.PAGED = this.dashboardRequestObject.currentPage - 1;
        FETCH_RO.DASHBOARD_TYPE = undefined;
        FETCH_RO.TYPE = 'A';
        return FETCH_RO;
    }

    private setDisclosureHistoryDetails(historyDetails: any = null) {
        if (historyDetails) {
            this.completeDisclosureList = this.getAllDisclosureHistories(historyDetails);
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load history. Please try again later.');
        }
        this.getNoDataMessage();
        this.updateTabCount(this.completeDisclosureList.length);
        this.isShowFilterBox = this.isShowFilter();
        this.isShowFilterAndSearch = !!this.getTabCount() || this.isShowFilterBox;
        this.loadingComplete();
    }

    private getAllDisclosureHistories(data: { opaDashboardDtos: any[], disclosureHistoryDtos: any[], declDashboardResponses: DeclarationAdminDashboard[], cmpHistoryDashboardResponse: CmpCard[] }): any {
        const DISCLOSURE_HISTORY = this.getDisclosureHistoryProjectHeader(data?.disclosureHistoryDtos);
        const OPA_HISTORY = data?.opaDashboardDtos || [];
        const DECLARATION_HISTORY = data?.declDashboardResponses || [];
        const CMP_HISTORY = data?.cmpHistoryDashboardResponse?.map((cmpDetails: CmpCard) => ({ ...cmpDetails, updateTimeStamp: cmpDetails.updateTimestamp })) || [];
        const MERGED_LIST = [...DISCLOSURE_HISTORY, ...OPA_HISTORY, ...DECLARATION_HISTORY, ...CMP_HISTORY];
        return this.getSortedListForParam(MERGED_LIST, 'updateTimeStamp');
    }

    private getDisclosureHistoryProjectHeader(disclosureHistory: any): any[] {
        return disclosureHistory?.map((ele: any) => {
            ele.projectHeader = ele.fcoiTypeCode == DISCLOSURE_TYPE.PROJECT ? `#${ele.projectNumber} - ${ele.projectTitle}` : '';
            return ele;
        }) || [];
    }

    private getDisclosureProjectHeader(disclosures: any) {
        return disclosures?.map((ele: any) => {
            ele.projectHeader = ele.fcoiTypeCode == DISCLOSURE_TYPE.PROJECT ? `#${ele.projectNumber} - ${ele.projectTitle}` : '';
            return ele;
        }) || [];
    }

  private getUserDeclarations(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.completeDisclosureList = [];
            this.getNoDataMessage();
            this.$subscriptions.push(
                this.userDisclosureService.fetchDeclarations(this.getUserDeclarationRO())
                    .subscribe((data: DeclarationAdminDashboard) => {
                        this.completeDisclosureList = data.dashboardResponses || [];
                        this.completeDisclosureListCopy = this.paginationArray = deepCloneObject(this.completeDisclosureList);
                        this.pageCountFromAPI = data.totalDeclarationResponse || 0;
                        this.updateTabCount(this.pageCountFromAPI);
                        this.isShowFilterBox = this.isShowFilter();
                        this.isShowFilterAndSearch = !!this.getTabCount() || this.isShowFilterBox;
                        this.loadingComplete();
                    }, (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load declarations. Please try again later.');
                        this.loadingComplete();
                    }));
        }
    }

    fcoiReviseButtonAction(): void {
        this.hasPendingFCOI ? this.redirectToFCOIDisclosure(this.pendingDisclosureDetails) : this.handleFCOICreation('REVISION');
    }

    handleFCOICreation(fcoiType: FcoiType): void {
        this.headerService.triggerFCOICreation(fcoiType);
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
        setTimeout(() => {
            this.showSlider = false;
            this.entityId = null;
            this.sliderElementId = '';
            this.countModalData = { ...this.lastOpenedCountModalData, isOpenCountModal: true };
        }, 500);
    }

    getActiveFCOI() {
        return this.headerService.activeDisclosures.filter(disclosure =>
            ([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)));
    }

    private fcoiDatesRemaining(): void {
        this.hasPendingFCOI = false;
        this.hasActiveFCOI = false;
        this.headerService.activeDisclosures.forEach(disclosure => {
            //the revision condition is also applied in disclosure create modal for showing revise btn.
            if (([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) && disclosure?.versionStatus == 'PENDING') {
                this.pendingDisclosureDetails = disclosure;
                this.hasPendingFCOI = true;
            }
            if (([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) && disclosure?.versionStatus !== 'PENDING') {
                this.activeDisclosureDetails = disclosure;
                this.hasActiveFCOI = true;
            }
        });
        this.headerService.activeOPAs.forEach(disclosure => {
            if(disclosure?.versionStatus === OPA_VERSION_TYPE.ACTIVE) {
                this.hasActiveOPA = true;
                this.isDateBetweenPeriod = this.commonService.getDateIsBetweenPeriod(disclosure);
            }
            if(disclosure?.versionStatus === OPA_VERSION_TYPE.PENDING) {
                this.hasPendingOPA = true;
            }
        });
        this.validateDisclosureExpirationDate();
    }

    private validateDisclosureExpirationDate(): void {
        // Validate FCOI Expire Date
        const ANNUAL_FINANCIAL_DISCLOSURE_TYPES = [DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION];
        const FCOI_DISCLOSURE_DATE = this.headerService.activeDisclosures?.filter(disclosure => (ANNUAL_FINANCIAL_DISCLOSURE_TYPES.includes(disclosure?.fcoiTypeCode)) && disclosure?.versionStatus !== 'PENDING');
        this.fcoiExpireDateValidation = this.getExpirationDateValidationResult(FCOI_DISCLOSURE_DATE[0]);
        // Validate OPA Expire Date
        const OPA_DISCLOSURE_DATE = this.headerService.activeOPAs?.filter(disclosure => disclosure?.versionStatus !== 'PENDING');
        this.opaExpireDateValidation = this.getExpirationDateValidationResult(OPA_DISCLOSURE_DATE[0]);
    }

    private getExpirationDateValidationResult(activeDisclosure: any): DisclosureExpireDateValidation {
        const EXPIRE_DATE_VALIDATION_RESULT = new DisclosureExpireDateValidation();
        if (activeDisclosure) {
            const EXPIRATION_DATE = activeDisclosure.expirationDate;
            const CURRENT_DATE = new Date().getTime();
            EXPIRE_DATE_VALIDATION_RESULT.differenceInDays = getDuration(CURRENT_DATE, EXPIRATION_DATE);
            const { durInDays, durInMonths, durInYears } = EXPIRE_DATE_VALIDATION_RESULT.differenceInDays;
            const TOTAL_DAYS = durInDays + (durInMonths * 30) + (durInYears * 360);
            EXPIRE_DATE_VALIDATION_RESULT.isExpiringIn10Days = !!TOTAL_DAYS && TOTAL_DAYS < 10;
            EXPIRE_DATE_VALIDATION_RESULT.isShowExpiringValidation = !!TOTAL_DAYS && TOTAL_DAYS <= 30;
        }
        return EXPIRE_DATE_VALIDATION_RESULT;
    }

    createOPA(): void {
        this.headerService.triggerOPACreation('INITIAL');
    }

    reviseOPA(): void {
        this.headerService.triggerOPACreation('REVISION');
    }


    selectedTabLabel(): string {
        //Need correct label from ba
        switch (this.currentSelected.tab) {
            case 'IN_PROGRESS_DISCLOSURES':
                return 'Results for In Progress Disclosures';
            case 'APPROVED_DISCLOSURES':
                return 'Results for Approved Disclosures';
            case 'TRAVEL_DISCLOSURES':
                return 'Results for Travel Disclosures';
            case 'DISCLOSURE_HISTORY':
                return 'Results for Disclosure History';
            default:
                return '';
        }
    }

    readMorePurpose(id: number, flag: boolean): void {
        this.isPurposeRead[id] = !flag;
    }

    private updateTabCount(totalCount: number): void {
        switch (this.currentSelected.tab) {
            case 'IN_PROGRESS_DISCLOSURES':
                this.dashboardCount.inProgressDisclosureCount = this.currentSelected?.filter === 'ALL' ? totalCount : this.dashboardCount?.inProgressDisclosureCount;
                break;
            case 'APPROVED_DISCLOSURES':
                this.dashboardCount.approvedDisclosureCount = this.currentSelected?.filter === 'ALL' ? totalCount : this.dashboardCount?.approvedDisclosureCount;
                break;
            case 'TRAVEL_DISCLOSURES':
                this.dashboardCount.travelDisclosureCount = !this.searchText ? totalCount : this.dashboardCount?.travelDisclosureCount;
                break;
            case 'CONSULTING_DISCLOSURES':
                this.dashboardCount.consultDisclCount = !this.searchText ? totalCount : this.dashboardCount?.consultDisclCount;
                break;
            case 'DISCLOSURE_HISTORY':
                this.dashboardCount.disclosureHistoryCount = this.currentSelected?.filter === 'ALL' ? totalCount : this.dashboardCount?.disclosureHistoryCount;
                break;
            case 'DECLARATION':
                const IS_SINGLE_DECLARATION_WITHOUT_SEARCH = this.commonService.activeDeclarationTypes?.length === 1 && !this.searchText;
                this.dashboardCount.declarationCount = this.currentSelected?.filter === 'ALL' || IS_SINGLE_DECLARATION_WITHOUT_SEARCH ? totalCount : this.dashboardCount?.declarationCount;
                break;
            case 'CMP':
                this.dashboardCount.cmpCount = !this.searchText ? totalCount : this.dashboardCount?.cmpCount;
                break;
            default:
                break;
        }
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

    private getNoDataMessage(): void {
        const { tab, filter } = this.currentSelected || {};
        const IS_CMP_TAB = tab === 'CMP';
        const IS_DECLARATION_TAB = tab === 'DECLARATION';
        const FILTER_MESSAGE = USER_DASHBOARD_FILTER_SPECIFIC_NO_INFO_MESSAGE[tab];
        if (IS_DECLARATION_TAB) {
            const DECLARATION_TYPE_CONFIG = this.commonService.getDeclarationTypeDetails(filter);
            if (this.searchText) {
                this.noDataMessage = DECLARATION_TYPE_CONFIG ? USER_DASHBOARD_NO_INFO_MESSAGE['DECLARATION_TYPE'].replace('DECLARATION_TYPE', DECLARATION_TYPE_CONFIG.declarationType) : USER_DASHBOARD_NO_INFO_MESSAGE['ALL_DECLARATION'];
            } else {
                this.noDataMessage = DECLARATION_TYPE_CONFIG ? FILTER_MESSAGE['DECLARATION_TYPE'].replace('DECLARATION_TYPE', DECLARATION_TYPE_CONFIG.declarationType) : FILTER_MESSAGE[filter];
            }
            return;
        }
        if (IS_CMP_TAB) {
            this.noDataMessage = USER_DASHBOARD_FILTER_SPECIFIC_NO_INFO_MESSAGE['CMP'];
            return;
        }
        if (this.searchText) {
            this.noDataMessage = USER_DASHBOARD_NO_INFO_MESSAGE['NO_SEARCH_RESULT'];
        } else if (this.isShowCreate && !this.paginationArray.length) {
            this.noDataMessage = USER_DASHBOARD_NO_INFO_MESSAGE['NO_DISCLOSURES_CREATED'];
        } else {
            this.noDataMessage = FILTER_MESSAGE?.[filter] || USER_DASHBOARD_NO_INFO_MESSAGE[tab];
        }
    }

    cardActions(event: CoiDashboardCardEvent): void {
        if (event?.action === 'COMMENTS') {
            this.openReviewComment(event.disclosureDetails);
        }
    }

    openReviewComment(disclosureData: UserDisclosure): void {
        this._coiReviewCommentSliderService.initializeReviewCommentSlider(disclosureData);
    }

    getClassForSort(index: number, sortSection: any): { [key: string]: boolean } {
        const CLASS_LIST: { [key: string]: boolean } = {
            'ms-1': index === 0,
            'mx-0': index !== 0,
            'px-8': (!this.userDisclosureService.dashboardRequestObject?.sort[sortSection?.variableName]),
            'filter-active': (this.userDisclosureService.dashboardRequestObject?.sort[sortSection?.variableName])
        };
        return CLASS_LIST;
    }

    sortResult(sortFieldBy: string): void {
        this.sortCountObj[sortFieldBy]++;
        this.sortAdminDashboardTabs(sortFieldBy);
    }

    private sortAdminDashboardTabs(sortFieldBy: string): void {
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.dashboardRequestObject.sort[sortFieldBy] = !this.dashboardRequestObject?.sort[sortFieldBy] ? 'asc' : 'desc';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.dashboardRequestObject?.sort[sortFieldBy];
        }
        this.setSortObjectToServiceObject();
        this.getDashboardBasedOnTab();
    }

    private setSortObjectToServiceObject(): void {
        this.userDisclosureService.sortCountObject = deepCloneObject(this.sortCountObj);
        this.userDisclosureService.dashboardRequestObject.sort = deepCloneObject(this.dashboardRequestObject?.sort);
    }

    private checkForSort(): void {
        if (!isEmptyObject(this.userDisclosureService.dashboardRequestObject?.sort) && this.checkForPreviousURL()) {
            this.dashboardRequestObject.sort = deepCloneObject(this.userDisclosureService.dashboardRequestObject?.sort);
            this.sortCountObj = deepCloneObject(this.userDisclosureService.sortCountObject);
        } else {
            this.resetSortObjects();
        }
    }

    private resetSortObjects(): void {
        this.dashboardRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.userDisclosureService.dashboardRequestObject.sort = { 'updateTimeStamp': 'desc' };
        this.sortCountObj = new SortCountObj();
        this.userDisclosureService.sortCountObject = new SortCountObj();
    }

    private checkForPreviousURL(): boolean {
        return ['coi/travel-disclosure'].some((url) => this._navigationService.previousURL.includes(url));
    }

}
