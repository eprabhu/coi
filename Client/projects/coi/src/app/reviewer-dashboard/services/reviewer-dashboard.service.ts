import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
    DeptReviewModalConfig, DisclConfigurationModalConfig, DisclosureFetchConfig,
    EngagementSliderConfig,
    PersonEligibilityModalConfig,
    PersonHistorySliderConfig,
    PersonNotificationSliderConfig,
    ReviewerDashboardRo, ReviewerDashboardSearchValues, ReviewerDashboardSortCountObj,
    ReviewerDashboardSortType,
    SelectedUnit
} from '../reviewer-dashboard.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { DisclosureCompleteFinalReviewRO } from '../../disclosure/coi-interface';
import { REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS, REVIEWER_DASHBOARD_ID_MAP } from '../reviewer-dashboard-constants';

@Injectable()
export class ReviewerDashboardService {

    deptReviewDetailsModalConfig = new DeptReviewModalConfig();
    disclosureConfigurationModalConfig = new DisclConfigurationModalConfig();
    personEligibilityModalConfig = new PersonEligibilityModalConfig();
    personNotificationSliderConfig = new PersonNotificationSliderConfig()
    personHistorySliderConfig = new PersonHistorySliderConfig();
    disclosureFetchConfig = new DisclosureFetchConfig();
    engagementSliderConfig = new EngagementSliderConfig();
    isAdvanceSearch = false;
    dashboardSearchValues = new ReviewerDashboardSearchValues();
    overviewDeptSearchValues = new ReviewerDashboardSearchValues();
    overviewHeaderSearchValues = new ReviewerDashboardSearchValues();
    reviewerDashboardServiceRo = new ReviewerDashboardRo();
    overviewDeptFetchServiceRO = new ReviewerDashboardRo();
    overviewHeaderFetchServiceRO = new ReviewerDashboardRo();
    retainedStatusFilters: string[] | null = null;
    sortCountObject = new ReviewerDashboardSortCountObj();
    isAdvanceSearchMade = false;
    sortType = new ReviewerDashboardSortType();
    isShowAdvanceSearchBox = false;
    deptOverviewUnitSearchText = '';
    $fetchOverviewDetails = new Subject();
    $fetchOverviewDepartment = new Subject();
    overviewUnitDetails = new SelectedUnit();
    isDisclosureListInitialLoad = true;

    constructor(private _http: HttpClient, private _router: Router, private _commonService: CommonService) {
    }

    resetOverviewVariables(): void {
        this.dashboardSearchValues = new ReviewerDashboardSearchValues();
        this.overviewDeptSearchValues = new ReviewerDashboardSearchValues();
        this.overviewHeaderSearchValues = new ReviewerDashboardSearchValues();
        this.overviewDeptFetchServiceRO = new ReviewerDashboardRo();
        this.overviewHeaderFetchServiceRO = new ReviewerDashboardRo();
        this.deptOverviewUnitSearchText = '';
        this.overviewUnitDetails = new SelectedUnit();
        this.isDisclosureListInitialLoad = true;
    }

    triggerOverviewDepartment(): void {
        this._commonService.setLoaderRestriction();
        this.$fetchOverviewDepartment.next({ unitDetails: this.overviewUnitDetails });
        this._commonService.removeLoaderRestriction();
    }

    triggerOverviewHeader(): void {
        this._commonService.setLoaderRestriction();
        this.$fetchOverviewDetails.next();
        this._commonService.removeLoaderRestriction();
    }

    getCOIAdminDashboard(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/getCOIAdminDashboard', params).pipe(catchError((err) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching COI Disclosure List failed. Please try again.');
            return of();
        }));
    }

    completeDisclosureReviews(disclosureNumberMap: DisclosureCompleteFinalReviewRO[]): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/completeDisclosureReviews', disclosureNumberMap);
    }

    getCOIReviewerDashboard(params: ReviewerDashboardRo): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/reviewerDashboard/fetch', params);
    }

    fetchReviewerDeptOverview(params: ReviewerDashboardRo): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/reviewerDashboard/departmentOverview/fetch', params);
    }

    getPersonDisclRequirementsDashboard(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/personDisclRequirementDashboard/fetch', params);
    }

    viewReviewerDashboardList(disclosureFetchConfig: DisclosureFetchConfig): void {
        this.retainedStatusFilters = null;
        sessionStorage.setItem('disclosureFetchConfig', JSON.stringify(disclosureFetchConfig));
        const { OPA_DELINQUENT, OPA_EXEMPT, OPA_ELIGIBLE } = REVIEWER_DASHBOARD_ID_MAP;
        if ([OPA_DELINQUENT, OPA_EXEMPT, OPA_ELIGIBLE].includes(disclosureFetchConfig?.uniqueId as REVIEWER_DASHBOARD_ID_MAP)) {
            this._router.navigate([REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.PERSON_LIST]);
        } else {
            this._router.navigate([REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.DISCLOSURE_LIST]);
        }
    }

    exportReviewerDashboardData(params: any): Observable<Blob> {
        return this._http.post(this._commonService.baseUrl + '/reviewerDashboard/export', params, { responseType: 'blob' });
    }

    getPersonDisclRequirement(personId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/personDisclRequirement/${personId}`);
    }

    updatePersonDisclRequirement(params): Observable<any> {
        return this._http.put(this._commonService.baseUrl + '/personDisclRequirement', params);
    }

    sendNotification(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/sendCommonNotification', params, { responseType: 'text' });
    }

    getMailPreviewById(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/mailPreview', params);
    }

    getPersonHistory(personId: any): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/personDisclRequirement/history/${personId}`);
    }

    getUnitWithRights(personId: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/getUnitWithRights/${personId}`);
    }

    getUserPreference(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/reviewerDashboard/userPreference`);
    }

    setUserPreference(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/reviewerDashboard/userPreference', params);
    }

    getWidgetLookups(sectionCode: string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/getWidgetLookups/v1/${sectionCode}`);
    }

    saveUserSelectedWidget(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/saveUserSelectedWidget', params);
    }

    deleteUserSelectedWidget(selectedWidgetId): Observable<any> {
        return this._http.delete(this._commonService.baseUrl + '/deleteUserSelectedWidget', {
            headers: new HttpHeaders().set('selectedWidgetId', selectedWidgetId.toString())
        });
    }

    updateWidgetSortOrder(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/updateWidgetSortOrder', params);
    }

    getPersonNotificationHistory(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/notificationHistory', params);
    }

}
