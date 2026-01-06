import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { CoiProjectOverviewRequest, CoiDashboardRequest, NameObject, SortCountObj, CoiDashboardDisclosures, CmpDashboardRequest } from './admin-dashboard.interface';
import { COIReviewCommentsSliderConfig } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { DisclosureCompleteFinalReviewRO } from '../disclosure/coi-interface';

@Injectable()
export class AdminDashboardService {

    isAdvanceSearch = false;
    coiRequestObject = new CoiDashboardRequest();
    searchDefaultValues: NameObject = new NameObject();
    sortCountObject: SortCountObj = new SortCountObj();
    projectOverviewRequestObject = new CoiProjectOverviewRequest();
    cmpRequestObject = new CmpDashboardRequest();
    filterTypes = [
        {
            id: 'coi-adm-dash-filter-all',
            value: 'ALL',
            label: 'All',
        },
        {
            id: 'coi-adm-dash-filter-no-eng',
            value: 'NO_CONFLICT_WITHOUT_ENGAGEMENTS',
            label: 'No Conflict Without Engagements',
        },
        {
            id: 'coi-adm-dash-filter-no-proj',
            value: 'NO_CONFLICT_WITHOUT_PROJECTS',
            label: 'No Conflict Without Projects',
        },
        {
            id: 'coi-adm-dash-filter-no-proj-eng',
            value: 'NO_CONFLICT_WITHOUT_PROJECTS_AND_ENGAGEMENTS',
            label: 'No Conflict Without Projects and Engagements',
        },
    ];
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getCOIAdminDashboard(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/getCOIAdminDashboard', params).pipe(catchError((err) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching COI Disclosure List failed. Please try again.');
            return of();
        }));
    }

    startCOIReview(coiReviewId: number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/startCOIReview`, { coiReview: { coiReviewId } });
    }

    completeCOIReview(coiReviewId: number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/completeCOIReview`, { coiReview: { coiReviewId } });
    }

    loadCoiReviewComments(req: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/loadCoiReviewComments', req);
    }

    getAdminDashboardTabCount(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/getAdminDashboardTabCount', params);
    }

    addCOIReviewComment(params: any): Observable<any> {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(this._commonService.baseUrl + '/addCOIReviewComment', formData);
    }

    completeDisclosureReviews(disclosureNumberMap: DisclosureCompleteFinalReviewRO[]): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/completeDisclosureReviews', disclosureNumberMap);
    }

    getLookupDataForProposalStatus(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/project/getProjectStatusLookup/Proposal');
    }

    getCmpAdminDashboard(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/cmp/adminDashboard', params).pipe(catchError((err) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching COI Disclosure List failed. Please try again.');
            return of();
        }));
    }

}

