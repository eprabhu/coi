import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class AgreementClausesService {

  endpointSearchOptions: any = {
    contextField: '',
    formatString: '',
    path : ''
  };


  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  loadAgreementClausesByAgreementId(params: any) {
    return this._http.post(this._commonService.baseUrl + '/loadAgreementClausesByAgreementId', params);
  }
  /**
    * @param  {} contextField
    * @param  {} formatString
    * @param  {} path
    *returns the endpoint search object with respect to the the inputs.
    */
   setSearchOptions(contextField, formatString, path) {
    this.endpointSearchOptions.contextField = contextField;
    this.endpointSearchOptions.formatString = formatString;
    this.endpointSearchOptions.path = path;
    return JSON.parse(JSON.stringify(this.endpointSearchOptions));
  }

  saveOrUpdateAgreementClauses(request: any) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAgreementClauses', request);
  }

  deleteAgreementClauses(request: any) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementClauses', request);
  }

  deleteAgreementGroup(request: any) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementGroup', request);
  }
}
