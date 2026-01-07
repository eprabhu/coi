import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval, of, Subject, Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { catchError, debounce, switchMap } from 'rxjs/operators';
import { CommonService } from '../../../common/services/common.service';
import { quickListAnimation } from '../../../common/utilities/animations';
import { REVIEWER_DASH_NO_INFO_MESSAGE } from '../../../no-info-message-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE } from '../../reviewer-dashboard-constants';
import { REVIEWER_DASHBOARD_LOCALIZE } from '../../../app-locales';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader.component';
import { RevDashDeptOverviewCount, RevDashDeptOverview, ReviewerDashboardRo, SelectedUnit, ReviewerDashboardSearchValues } from '../../reviewer-dashboard.interface';
import { DeptOverviewDetailsModalComponent, DeptOverviewModalEvent } from '../dept-overview-details-modal/dept-overview-details-modal.component';
import { GlobalEventNotifier } from '../../../common/services/coi-common.interface';
import { EndPointOptions } from '../../../shared-components/shared-interface';

@Component({
    selector: 'app-overview-department',
    templateUrl: './overview-department.component.html',
    styleUrls: ['./overview-department.component.scss'],
    standalone: true,
    animations: [quickListAnimation],
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, FormsModule, DeptOverviewDetailsModalComponent, SkeletonLoaderComponent]
})
export class OverviewDepartmentComponent implements OnInit, OnDestroy {

    searchText = '';
    elasticPersonSearchOptions: EndPointOptions = {};
    isLoading = false;
    isAPIFailed = false;
    totalDepartmentCount = 0;
    isCountLinkClicked = false;
    skeletonLoaderList = [1, 2];
    noDataMessage = REVIEWER_DASH_NO_INFO_MESSAGE;
    overviewDeptFetchRO = new ReviewerDashboardRo();
    overviewDepartmentList: RevDashDeptOverview[] = [];
    REVIEWER_DASHBOARD_LOCALIZE = REVIEWER_DASHBOARD_LOCALIZE;
    dashboardTempSearchValues = new ReviewerDashboardSearchValues();
    private $subscriptions: Subscription[] = [];
    private $debounceEventForSearch = new Subject();
    private selectedPersonId: string | number | null = null;

    constructor(
        private _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        public reviewerDashboardService: ReviewerDashboardService
    ) { }

    ngOnInit(): void {
        this.setInitialReviewerDashboardRO();
        this.listenFetchOverviewDepartment();
        this.listenDeptSearchChanged();
        this.setPersonSearchOptions();
        this.setTempFromCache();
        this.searchText = this.reviewerDashboardService.deptOverviewUnitSearchText;
        this.reviewerDashboardService.isDisclosureListInitialLoad = true;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setInitialReviewerDashboardRO(): void {
        this.overviewDeptFetchRO = new ReviewerDashboardRo();
        this.overviewDeptFetchRO.fetchType = undefined;
        this.overviewDeptFetchRO.dashboardData.SORT_TYPE = undefined;
        this.prepareDeptSearchData();
        this.selectedPersonId = null;
        delete this.overviewDeptFetchRO.dashboardData.PERSON;
    }

    private setTempFromCache(): void {
        const CACHED_DATA = this.reviewerDashboardService.overviewDeptFetchServiceRO.dashboardData;
        const REVIEWER_DASHBOARD_LOCAL_RO = this.overviewDeptFetchRO.dashboardData;
        REVIEWER_DASHBOARD_LOCAL_RO.PERSON = CACHED_DATA.PERSON || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.PAGED = CACHED_DATA.PAGED;
        this.selectedPersonId = CACHED_DATA.PERSON || undefined;
        this.setSearchOptionsFromCache();
    }

    private cacheSearchCriteria(): void {
        this.reviewerDashboardService.overviewDeptSearchValues = this.dashboardTempSearchValues;
        const REVIEWER_DASHBOARD_LOCAL_RO = this.overviewDeptFetchRO.dashboardData;
        const REVIEWER_DASHBOARD_SERVICE_RO = this.reviewerDashboardService.overviewDeptFetchServiceRO.dashboardData;
        REVIEWER_DASHBOARD_SERVICE_RO.PERSON = REVIEWER_DASHBOARD_LOCAL_RO.PERSON || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.PAGED = REVIEWER_DASHBOARD_LOCAL_RO.PAGED;
    }

    private setSearchOptionsFromCache(): void {
        this.dashboardTempSearchValues = this.reviewerDashboardService.overviewDeptSearchValues;
        this.elasticPersonSearchOptions.defaultValue = this.dashboardTempSearchValues.personName || '';
    }

    private fetchOverviewDepartment(): void {
        this.cacheSearchCriteria();
        this.reviewerDashboardService.triggerOverviewDepartment();
    }

    private prepareDeptSearchData(): void {
        this.overviewDeptFetchRO.dashboardData.HOME_UNIT = this.reviewerDashboardService.deptOverviewUnitSearchText?.trim() ||
            this.reviewerDashboardService.overviewUnitDetails?.unitNumber || undefined;
        this.overviewDeptFetchRO.dashboardData.PAGED = 0;
        this.overviewDeptFetchRO.isCountNeeded = true;
    }

    private setPersonSearchOptions(): void {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    private resetPaginationForFilterChange(): void {
        this.overviewDeptFetchRO.dashboardData.PAGED = 0;
        this.overviewDeptFetchRO.isCountNeeded = true;
    }

    selectedPersonForDeptOverview(selectedPerson: any): void {
        if (selectedPerson?.value_source === 'DEFAULT_SEARCH_TEXT') {
            return;
        }
        if (!selectedPerson) {
            if (this.selectedPersonId) {
                this.selectedPersonId = null;
                delete this.overviewDeptFetchRO.dashboardData.PERSON;
                this.resetPaginationForFilterChange();
                this.fetchOverviewDepartment();
            }
            this.reviewerDashboardService.overviewDeptSearchValues = new ReviewerDashboardSearchValues();
            this.dashboardTempSearchValues = new ReviewerDashboardSearchValues();
            return;
        }
        const PERSON_ID = selectedPerson?.personId ?? selectedPerson?.prncpl_id ?? selectedPerson?.value ?? null;
        if (PERSON_ID === this.selectedPersonId) {
            return;
        }
        this.selectedPersonId = PERSON_ID;
        this.overviewDeptFetchRO.dashboardData.PERSON = PERSON_ID || undefined;
        this.dashboardTempSearchValues.personName = selectedPerson?.value || selectedPerson?.full_name || null;
        this.resetPaginationForFilterChange();
        this.fetchOverviewDepartment();
    }

    private listenDeptSearchChanged(): void {
        this.$subscriptions.push(
            this.$debounceEventForSearch.pipe(debounce(() => interval(800)))
                .subscribe((data: any) => {
                    this.fetchOverviewDepartment();
                }));
    }

    private listenFetchOverviewDepartment(): void {
        this.isLoading = true;
        this.$subscriptions.push(
            this.reviewerDashboardService.$fetchOverviewDepartment.pipe(
                switchMap((params: { unitDetails: SelectedUnit }) => {
                    this.isLoading = true;
                    if (params.unitDetails?.unitNumber) {
                        const NEW_HOME_UNIT = this.searchText || params.unitDetails?.unitNumber;
                        if (this.overviewDeptFetchRO.dashboardData.HOME_UNIT !== NEW_HOME_UNIT) {
                            this.overviewDeptFetchRO.dashboardData.HOME_UNIT = NEW_HOME_UNIT;
                            this.overviewDeptFetchRO.dashboardData.PAGED = 0;
                            this.overviewDeptFetchRO.isCountNeeded = true;
                        }
                    } else if (this.overviewDeptFetchRO.dashboardData.HOME_UNIT !== (this.reviewerDashboardService.deptOverviewUnitSearchText?.trim() || undefined)) {
                        this.prepareDeptSearchData();
                    }
                    this.overviewDeptFetchRO.dashboardData.INCLUDE_CHILD_UNITS = this.searchText ? false : params.unitDetails?.isIncludeChildUnits;
                    this.isAPIFailed = false;
                    this.overviewDepartmentList = [];
                    return this.reviewerDashboardService.fetchReviewerDeptOverview(this.overviewDeptFetchRO).pipe(
                        catchError((error) => {
                            this.isAPIFailed = true;
                            this.isLoading = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching overview department details.');
                            return of(null);
                        })
                    );
                })).subscribe((data: { dashboardData: RevDashDeptOverview[], totalCount: number | null } | null) => {
                    this.overviewDepartmentList = this.formatDashboardData(data?.dashboardData || []);
                    this.totalDepartmentCount = this.overviewDeptFetchRO.isCountNeeded ? (data?.totalCount || 0) : this.totalDepartmentCount;
                    this.isLoading = false;
                }
                )
        );
    }

    private formatDashboardData(dashboardData: RevDashDeptOverview[]): RevDashDeptOverview[] {
        return dashboardData
            .map(item => ({
                ...item,
                departmentOverviewCountDetails: item.departmentOverviewCountDetails
                    ? item.departmentOverviewCountDetails.sort((x, y) => (x.ORDER_NUMBER || 0) - (y.ORDER_NUMBER || 0))
                    : []
            }));
    }

    openDeptReviewDetailsModal(deptDetails: RevDashDeptOverview): void {
        setTimeout(() => {
            if (!this.isCountLinkClicked) {
                this.reviewerDashboardService.deptReviewDetailsModalConfig.revDashDeptOverview = deptDetails;
                this.reviewerDashboardService.deptReviewDetailsModalConfig.personId = this.overviewDeptFetchRO.dashboardData.PERSON;
                this.reviewerDashboardService.deptReviewDetailsModalConfig.personName = this.dashboardTempSearchValues.personName;
                this.reviewerDashboardService.deptReviewDetailsModalConfig.isOpenDeptReviewModal = true;
            }
        })
    }

    deptReviewOverviewModalAction(event: DeptOverviewModalEvent): void {
        this.reviewerDashboardService.deptReviewDetailsModalConfig = event.content.deptReviewDetailsModalConfig;
    }

    getDeptListForSearchWord(): void {
        this.reviewerDashboardService.deptOverviewUnitSearchText = this.searchText;
        this.prepareDeptSearchData();
        this.$debounceEventForSearch.next();
    }

    resetDeptListFilter(): void {
        this.searchText = '';
        this.reviewerDashboardService.deptOverviewUnitSearchText = '';
        this.prepareDeptSearchData();
        this.fetchOverviewDepartment();
    }

    viewDisclosureReviewList(selectedCountDetails: RevDashDeptOverviewCount, departmentDetails: RevDashDeptOverview): void {
        this.isCountLinkClicked = true;
        this.reviewerDashboardService.viewReviewerDashboardList({
            unitNumber: departmentDetails.unitNumber,
            uniqueId: selectedCountDetails?.UNIQUE_ID,
            moduleCode: selectedCountDetails?.MODULE_CODE,
            moduleName: selectedCountDetails?.MODULE_NAME,
            unitDisplayName: departmentDetails.displayName,
            isIncludeChildUnits: false,
            tabType: REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE[selectedCountDetails?.UNIQUE_ID],
            personId: this.overviewDeptFetchRO?.dashboardData?.PERSON,
            personFullName: this.dashboardTempSearchValues.personName,
        });
    }

    actionsOnPageChange(event: number): void {
        const PAGE_OFFSET = (event - 1);
        if (this.overviewDeptFetchRO.dashboardData.PAGED != PAGE_OFFSET) {
            this.overviewDeptFetchRO.dashboardData.PAGED = PAGE_OFFSET;
            this.overviewDeptFetchRO.isCountNeeded = false;
            this.fetchOverviewDepartment();
        }
    }

}
