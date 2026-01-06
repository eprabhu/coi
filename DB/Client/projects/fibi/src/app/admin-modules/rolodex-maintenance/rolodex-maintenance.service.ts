
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class RolodexMaintenanceService {

  endpointSearchOptions: any = {
    contextField: '',
    formatString: '',
    path : ''
};

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  fetchRolodex( searchString) {
    return this._http.get( this._commonService.baseUrl + '/findRolodex' + '?searchString=' + searchString);
  }
  getRolodexData(rolodexId) {
    return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', {'rolodexId': rolodexId});
  }

  saveRolodexData(sponsor) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateRolodex', sponsor);
  }
  fetchRolodexData(params){
    return this._http.post(this._commonService.baseUrl + '/getAllRolodexes', params);
  }
  
  /**
   * @param  {} contextField
   * @param  {} formatString
   * @param  {} path
   *returns the endpoint search object with respect to the the inputs.
   * @param params will have fetchLimit as one of the values 
   * to specify limit of data to fetched,
   * it should be given inside params as {'fetchLimit' : requiredLimit}
   * requiredLimit can be either null or any valid number.
   * if no limit is specified default fetch limit 50 will be used.
   * if limit is null then full list will return, this may cause performance issue.
  */
  setSearchOptions(contextField, formatString, path, params ={}) {
    this.endpointSearchOptions.contextField = contextField;
    this.endpointSearchOptions.formatString = formatString;
    this.endpointSearchOptions.path = path;
    this.endpointSearchOptions.params = getParams(params);
    return JSON.parse(JSON.stringify(this.endpointSearchOptions));
  }

}
