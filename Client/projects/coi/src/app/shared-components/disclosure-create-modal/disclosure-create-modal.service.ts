import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { FCOIDisclosureCreateRO, FcoiReviseRO } from '../shared-interface';
import { Observable } from 'rxjs';

@Injectable()
export class DisclosureCreateModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    reviseFcoiDisclosure(reviseObject: FcoiReviseRO) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/reviseDisclosure', reviseObject);
    }

    createInitialDisclosure(params: FCOIDisclosureCreateRO) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure`, params);
    }

    getCoiProjectTypes() {
        return this._http.get(this._commonService.baseUrl + '/getCoiProjectTypes');
    }

    syncFCOIDisclosure(disclosureId: number | string, disclosureNumber: number | string) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/sync`, { disclosureId, disclosureNumber });
    }

    checkIfDisclosureAvailable(moduleCode: any, moduleItemKey: any) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/validate', {
            moduleCode: moduleCode,
            moduleItemKey: moduleItemKey,
            personId: this._commonService.getCurrentUserDetail('personID')
        });
    }

    checkFinancialEngagementCreated() {
        return this._http.get(this._commonService.baseUrl + '/fcoiDisclosure/checkFinancialEngagementCreated');
    }

    checkEligibleForDisclCreation(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/fcoiDisclosure/checkDisclCreationEligibility');
    }
}
