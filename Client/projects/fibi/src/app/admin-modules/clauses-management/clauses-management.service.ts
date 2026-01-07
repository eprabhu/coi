import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ClausesManagementService {

  endpointSearchOptions: any = {
    contextField: '',
    formatString: '',
    path : ''
};
 constructor(private _http: HttpClient, private _commonService: CommonService) { }

 setSearchOptions(contextField, formatString, path) {
  this.endpointSearchOptions.contextField = contextField;
  this.endpointSearchOptions.formatString = formatString;
  this.endpointSearchOptions.path = path;
  return JSON.parse(JSON.stringify(this.endpointSearchOptions));
}
loadAllClausesBank() {
  return this._http.get(this._commonService.baseUrl + '/loadAllClausesBank');
}
addToClausesBank(clause: any) {
  return this._http.post(this._commonService.baseUrl + '/addToClausesBank', {'clausesBank': clause});
}
deleteClausesById(clause) {
  return this._http.post(this._commonService.baseUrl + '/deleteClausesById', clause);
}
}
