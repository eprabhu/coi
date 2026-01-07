import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ClausesService {

    endpointSearchOptions: any = {
        contextField: '',
        formatString: '',
        path : ''
    };

    constructor(private _http: HttpClient, private _commonService: CommonService) {

    }

    fetchAllClausesGroup() {
        return this._http.get(this._commonService.baseUrl + '/loadAllClauses');
    }

    addNewClausesGroup(request: any) {
        return this._http.post(this._commonService.baseUrl + '/addClausesGroup', request);
    }

    deleteClause(request: any) {
        return this._http.post(this._commonService.baseUrl + '/deleteClauses', request);
    }

    deleteAgreementType(request: any) {
        return this._http.post(this._commonService.baseUrl + '/unlinkClausesGroupToAgreementType', request);
    }

    addAgreementType(request: any) {
        return this._http.post(this._commonService.baseUrl + '/linkClausesGroupToAgreementType', request);
    }

    findClauses(request: any) {
        return this._http.post(this._commonService.baseUrl + '/findClauses', request);
    }

    addToClausesBank(clause: any) {
        return this._http.post(this._commonService.baseUrl + '/addToClausesBank', {'clausesBank': clause});
    }
    
    deleteClausesGroup(clausesGroupCode) {	
        return this._http.delete(`${this._commonService.baseUrl}/deleteClausesGroup/${clausesGroupCode}`);	
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
}
