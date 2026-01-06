import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/services/common.service';
import {Router} from '@angular/router';

@Injectable()
export class ProgressReportMilestonesService {

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) {
    }

    loadProgressReportMilestone(progressReportId: string) {
        return this._http.get(this._commonService.baseUrl + '/loadProgressReportMilestone/' + progressReportId);
    }

    saveOrUpdateProgressReportMilestone(param: any) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProgressReportMilestone', param);
    }
}
