import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

export type EntityCreationUniqueFieldServices = 'validateDUNS' | 'validateUEI' | 'validateCAGE';
@Injectable()
export class EntityCreationService {

  constructor(private _http: HttpClient,
    private _commonService: CommonService) { }

  autoSaveService(changedRO) {
    return this._http.patch(this._commonService.baseUrl + '/entity/update', changedRO);
  }

  validateDUNS(dunsNumber: string, entityDetails: { entityId: string | number, entityNumber: string | number }) {
    return this._http.post(this._commonService.baseUrl + '/entity/dunsNumberExists', { dunsNumber: dunsNumber, ...entityDetails });
  }

  validateUEI(ueiNumber: string, entityDetails: { entityId: string | number, entityNumber: string | number }) {
    return this._http.post(this._commonService.baseUrl + '/entity/ueiNumberExists', { ueiNumber: ueiNumber, ...entityDetails });
  }

  validateCAGE(cageNumber: string, entityDetails: { entityId: string | number, entityNumber: string | number }) {
    return this._http.post(this._commonService.baseUrl + '/entity/cageNumberExists', { cageNumber: cageNumber, ...entityDetails });
  }

  addAdditionalAddress(additionalDetailsRO: any) {
    return this._http.post(this._commonService.baseUrl + '/entity/saveAdditionalAddresses', additionalDetailsRO);
  }

  updateAdditionalAddresses(additionalDetailsRO: any) {
    return this._http.patch(this._commonService.baseUrl + '/entity/updateAdditionalAddresses', additionalDetailsRO);
  }

}
