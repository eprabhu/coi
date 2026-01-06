import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class ClaimListService {
  sortCountObject: any = {};
  dashboardRequestObject: any = {
    property1: '',
    property2: '',
    property3: '',
    property4: '',
    property5: '',
    property6: '',
    property7: '',
    property8: [],
    property9: '',
    property10: '',
    property11: [],
    property12: '',
    property13: '',
    pageNumber: 20,
    sort: {},
    tabName: 'PENDING_CLAIMS',
    advancedSearch: 'L',
    sortBy: '',
    currentPage: 1
};
sponsorAdvanceSearchDefaultValue = '';

/** For setting default Value of elastic, end point  in advance search */
dashboardRequestExtraData = {
  leadUnit: '',
  fullName: '',
  finOfficerFullName: '',
  preparerFullName: '',
  isEmployeeFlag: true
};

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getClaimDashBoardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiClaimDashBoard', params);
  }
  saveOrUpdateClaim(params, type) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaim', {'claim': params, acType: type});
  }


  deleteClaimDetail(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteClaimDetail', {'claimId': params.claimId,
      'awardLeadUnitNumber': params.unitNumber, 'awardId': params.awardId, 'claimStatusCode': params.claimStatusCode});
  }

}
