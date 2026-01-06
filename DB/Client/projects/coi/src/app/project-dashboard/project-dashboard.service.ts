import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../common/services/common.service';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { CoiProjectOverviewRequest, NameObject, NotificationHistoryRO, SortCountObj } from './project-dashboard.interface';

@Injectable()

export class ProjectDashboardService {


    projectOverviewRequestObject = new CoiProjectOverviewRequest();
    isAdvanceSearch: any;
    sortCountObject: SortCountObj = new SortCountObj();
    sort: any;
    notificationSliderData: any;
    projectDefaultValues = new NameObject();

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getLookupDataForProposalStatus() {
        return this._http.get(this._commonService.baseUrl + '/project/getProjectStatusLookup/Proposal');
    }

    getCOIProjectOverviewDetails(projectOverviewRequestObject: any): Observable<any> {
        const url = `${this._commonService.baseUrl}/project/fetchDashbaord`;
        return this._http.post<any>(url, projectOverviewRequestObject).pipe(
            catchError((err) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching COI Project overview List failed. Please try again.');
                return of({ projects: [], updatedTimestamp: null });
            }));
    }

    getDefaultProjectCount(projectOverviewRequestObject: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/project/fetchDashboardCount', projectOverviewRequestObject);
    }


    addProjectOverviewComment(params: any) {
        return this._http.post(this._commonService.baseUrl + '/project/saveComment', params, { responseType: 'text' });
    }

    getProjectOverviewComments(params) {
        return this._http.post(this._commonService.baseUrl + '/project/fetchComment', params);
    }

    updateProjectOverviewComment(params: any) {
        return this._http.patch(this._commonService.baseUrl + '/project/updateComment', params, { responseType: 'text' });
    }

    deleteProjectOverviewComments(CommentId) {
        return this._http.delete(`${this._commonService.baseUrl}/project/deleteComment/${CommentId}`, { responseType: 'text' });
    }

    projectCommentsResolve(commentId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/project/resolveProjectComment/${commentId}`, { responseType: 'text' });
    }

    sendNotification(params) {
        return this._http.post(this._commonService.baseUrl + '/projectPersonNotify', params, { responseType: 'text' });
    }

    getMailPreviewById(params) {
        return this._http.post(this._commonService.baseUrl + '/mailPreview', params);
    }

    loadProjectMandatoryHistory(awardId: any) {
        return this._http.get(`${this._commonService.baseUrl}/project/fetchCoiProjectAwardHistory/${awardId}`);
    }

    setDisclosureToMandatory(prams) {
        return this._http.put(this._commonService.baseUrl + '/project/updateAwardDisclosureValidationFlag', prams);
    }

    getLookupDataForAwardStatus() {
        return this._http.get(this._commonService.baseUrl + '/project/getProjectStatusLookup/Award');
    }

    getAllSentNotifications(reqObj: NotificationHistoryRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/project/fetchProjectNotificationHistory', reqObj);
    }

}
