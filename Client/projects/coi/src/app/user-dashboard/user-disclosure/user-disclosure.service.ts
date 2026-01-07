import {Injectable} from '@angular/core';
import {CommonService} from "../../common/services/common.service";
import {HttpClient} from "@angular/common/http";
import { Observable } from 'rxjs';
import { COIReviewCommentsSliderConfig } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { SortCountObj } from './user-disclosure-interface';
import { DeclarationAdminDashboardRO, DeclarationAdminDashboard } from '../../declarations/declaration.interface';
import { CmpCard } from '../../conflict-management-plan/shared/management-plan.interface';

@Injectable()
export class UserDisclosureService {

    dashboardRequestObject = {
        tabName: 'IN_PROGRESS_DISCLOSURES',
        isDownload: false,
        filterType: 'ALL',
        pageNumber: 20,
        currentPage: 1,
        property2: '',
        sort: { 'updateTimeStamp': 'desc' }
    };
    sortCountObject: SortCountObj = new SortCountObj();

    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();

    constructor(private _commonService: CommonService, private _http: HttpClient) {
    }

    getCOIDashboard(param) {
        return this._http.post(this._commonService.baseUrl + '/getCOIDashboard', param);
    }

    getCOIDashboardCount(param) {
        return this._http.post(this._commonService.baseUrl + '/getTabCount', {
            "advancedSearch": "L",
            "pageNumber": 2,
            "sort": {
                "createTimestamp": "asc"
            },
            "filterType": "ALL",
            "isDownload": false
        });
    }

    getDisclosureHistory(param) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/historyDashboard',param);
    }

    fetchDeclarations(declarationDashboardData: DeclarationAdminDashboardRO): Observable<DeclarationAdminDashboard> {
        return this._http.post<DeclarationAdminDashboard>(`${this._commonService.baseUrl}/declaration/dashboard/getDashboardData`, { declarationDashboardData });
    }

    fetchReporterCmp(params: any): Observable<any> {
        return this._http.post<any>(`${this._commonService.baseUrl}/cmp/reporterDashboard`, params);
    }
}
