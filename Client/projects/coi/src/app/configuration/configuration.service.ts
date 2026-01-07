import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../common/services/common.service';

@Injectable()
export class ConfigurationService {

    constructor( private _http: HttpClient,
                 private _commonService: CommonService) {
    }

    syncEntityToGraphDB() {
        return this._http.post(window.location.origin + '/graph-connect/coi/v1/import', {});
    }

}
