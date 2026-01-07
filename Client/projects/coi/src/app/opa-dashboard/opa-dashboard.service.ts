import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../common/services/common.service';
import { HTTP_ERROR_STATUS, OPA_MODULE_CODE } from '../app-constants';
import { COIReviewCommentsSliderConfig, FetchReviewCommentRO } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { MANAGE_OPA_DISCLOSURE_COMMENT, MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT, OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP, OPA_GENERAL_COMMENTS, OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT, MANAGE_OPA_RESOLVE_COMMENTS } from '../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from '../shared-components/coi-review-comments/coi-review-comments.interface';
import { LookUpClass } from '../common/services/coi-common.interface';

@Injectable()
export class OpaDashboardService {

    isAdvanceSearch = false;
    sort: any;
    opaRequestObject: OPADashboardRequest = new OPADashboardRequest();
    sortCountObject: SortCountObj = new SortCountObj();
    searchDefaultValues: NameObject = new NameObject();
    rolesList = [{ code: "1", description: "Faculty", dataType: null }, { code: "2", description: "Staff", dataType: null }];
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();

    constructor(private _http: HttpClient,
        private _commonService: CommonService) { }

    getOPADashboard(params: OPADashboardRequest): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/opa/dashboard', params).pipe(catchError((err) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching OPA Disclosure List failed. Please try again.');
            return of();
        }));
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const DEFAULT_CHECK_BOX_CONFIG = [];
        const IS_OPA_REVIEWER = this._commonService.isOPAReviewer;
        const CAN_MAINTAIN_COMMENTS = this._commonService.getAvailableRight(MANAGE_OPA_DISCLOSURE_COMMENT) || IS_OPA_REVIEWER;
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this._commonService.getAvailableRight(MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT) || IS_OPA_REVIEWER;
        const CAN_RESOLVE_COMMENTS = this._commonService.getAvailableRight(MANAGE_OPA_RESOLVE_COMMENTS);
        const DISCLOSURE_OWNER = commentDetails?.documentOwnerPersonId === this._commonService.getCurrentUserDetail('personID');
        if (CAN_MAINTAIN_PRIVATE_COMMENTS) {
            DEFAULT_CHECK_BOX_CONFIG.push({
                label: 'Private',
                defaultValue: false,
                values: {
                    true: { isPrivate: true },
                    false: { isPrivate: false },
                },
            });
        }
        this.reviewCommentsSliderConfig = {
            // for card config
            ...reviewCommentsCardConfig,
            checkboxConfig: reviewCommentsCardConfig?.hasOwnProperty('checkboxConfig') ? reviewCommentsCardConfig?.checkboxConfig : DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.hasOwnProperty('isEditMode') ? reviewCommentsCardConfig?.isEditMode : true,
            reviewCommentsSections: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...commentDetails,
            moduleCode: OPA_MODULE_CODE,
            isShowAllComments: commentDetails?.componentTypeCode === OPA_GENERAL_COMMENTS?.commentTypeCode,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            canResolveComments: CAN_RESOLVE_COMMENTS,
            isDocumentOwner: DISCLOSURE_OWNER,
            sortOrder: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
            isReviewer: IS_OPA_REVIEWER
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    getAdminDetails(moduleCode: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/adminGroup/adminPersons/${moduleCode}`);
    }

    getOpaDashboardTabCount(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/opa/getOPADashboardTabCount', params);
    }

}

export class OPADashboardRequest {
    tabType = "MY_REVIEWS";
    filterType = null;
    pageNumber = 20;
    currentPage = 1;
    sort: any = { 'updateTimeStamp': 'desc' };
    unitIdentifier = null;
    submissionTimestamp = null;
    expirationDate = null;
    dispositionStatusCodes = [];
    reviewStatusCodes = [];
    adminPersonIds = [];
    opaDisclosureTypes = [];
    designationStatusCodes = [];
    personIdentifier = null;
    entityIdentifier = null;
    isFaculty = null;
    periodStartDate = null;
    periodEndDate = null;
    freeTextSearchFields = [];
    advancedSearch = 'L';
    constructor(tabName?) {
        this.tabType = tabName ? tabName : 'MY_REVIEWS';
    }
}

export class SortCountObj {
    createTimestamp = 0;
    person = 0;
    submissionTimestamp = 0;
    updateTimeStamp = 2;
    dispositionStatus = 0;
    disclosureStatus = 0;
    homeUnitName = 0;
    expirationDate = 0;
}

export class NameObject {
    departmentName = '';
    personName = '';
    entityName = '';
}

export interface OPAAdminDashboardResolvedData {
    lookupArrayForAdministrator: LookUpClass[];
}
