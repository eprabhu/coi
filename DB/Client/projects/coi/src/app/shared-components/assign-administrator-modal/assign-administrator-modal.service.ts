import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AssignAdministratorModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getAdminDetails(moduleCode) {
        return this._http.get(this._commonService.baseUrl + '/adminGroup/adminPersons/' + moduleCode);
    }

    getPersonGroup(personId: any, moduleCode: any) {
          const headers = new HttpHeaders({'personId': personId.toString(),'moduleCode': moduleCode.toString()});
          return this._http.get(this._commonService.fibiUrl + '/getPersonGroup', { headers });
    }

    assignAdmin(path: string, params) {
        let url: string;
        switch (path) {
            case 'OPA_DISCLOSURES':
                url = this._commonService.baseUrl + '/opa/assignAdmin';
                break;
            case 'CONSULTING_DISCLOSURES':
                url = this._commonService.baseUrl + '/consultingDisclosure/assignAdmin';
                break;
            case 'TRAVEL_DISCLOSURES':
                url = this._commonService.baseUrl + '/travel/assignAdmin';
                break;
            case 'DISCLOSURES':
                url = this._commonService.baseUrl + `/fcoiDisclosure/assignAdmin`;
                break;
            case 'DECLARATIONS':
                url = this._commonService.baseUrl + `/declaration/assignAdmin`;
                break;
            default:
                url = this._commonService.baseUrl + `/${path}/assignAdmin`;
        }

        return this._http.patch(url, params);
    }


}
