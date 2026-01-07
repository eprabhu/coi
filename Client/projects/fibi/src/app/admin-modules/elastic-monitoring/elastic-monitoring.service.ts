import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class ElasticMonitoringService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    $elasticMonitoringDetails = new BehaviorSubject<object>(null);


    getQueueMatrixDetails() {
        return this._http.get(this._commonService.baseUrl + '/queueMatrixDetails');
    }

    getLogstashStatus() {
        return this._http.get(this._commonService.baseUrl + '/getLogstashStatus', { responseType: 'text' });
    }

    getBulkLogstashSync(bulkSyncModule) {
        return this._http.get(this._commonService.baseUrl + `/bulkLogstashSync/${bulkSyncModule}`);
    }

    getElasticErrorDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/elasticErrorDetails', params);
    }

}
