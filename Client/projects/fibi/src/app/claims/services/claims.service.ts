import { Injectable } from '@angular/core';
import { BehaviorSubject, of as observableOf, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ClaimsService {
    isRouteChangeTrigger = new Subject();
    isDurationChangeTrigger = new Subject();

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }

    loadClaimDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/loadClaimDetails', params).pipe(
            catchError(error => {
                console.log('Retrieval error', error);
                if (error.status === 403) {
                    // name is given based on the values assigned in forbidden component please refer forbidden.component.ts
                    this._commonService.forbiddenModule = '14';
                    this._router.navigate(['/fibi/error/403']);
                    return observableOf(null);
                } else {
                    this._router.navigate(['/fibi/dashboard/claim-list']);
                    return observableOf(null);
                }
            }));
    }

    submitClaim(award) {
        return this._http.post(this._commonService.baseUrl + '/submitClaim', award);
    }

    maintainClaimWorkFlow(requestObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(requestObject));
        approveFormData.append('moduleCode', '14');
        approveFormData.append('subModuleCode', '0');
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', approveFormData);
    }

    exportClaimReport(params) {
        return this._http.post(this._commonService.baseUrl + '/generateClaimReport', params, {
            observe: 'response',
            responseType: 'blob'
        });
    }

    performFOActions(params) {
        return this._http.post(this._commonService.baseUrl + '/performClaimFOActions', params);
    }

    saveOrUpdateClaim(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaim', params);
    }

    evaluateClaimIndirectCost(claimId: any) {
        return this._http.get(`${this._commonService.baseUrl}/evaluateClaimIndirectCost/${claimId}`);
    }

    deleteClaimDetail(params){
        return this._http.post(this._commonService.baseUrl + '/deleteClaimDetail', {'claimId': params.claimId,
          'awardLeadUnitNumber': params.unitNumber, 'awardId': params.awardId, 'claimStatusCode': params.claimStatusCode});
      }

      resyncClaimDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/resyncClaimDetail', params);
    }
}
