import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { environment } from '../../../../environments/environment';
import { LandingConfig } from '../user-home.interface';
import { Observable } from 'rxjs';

@Injectable()
export class UserHomeService {

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    landingConfig = new LandingConfig();

    getFaq(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/coiCustom/fetchFaqDetails', params);
    }

    getActiveDisclosure(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/getActiveDisclosures');
    }

    getMetaDataForLanding(): Promise<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Cache-Control', 'no-store');
        headers = headers.append('Pragma', 'no-cache');
        return this._http.get(environment.deployUrl + 'assets/landing/landing-config.json', { headers }).toPromise();
    }

    openRedirectionPath(navigateToUrl: string, navigateToUrlType: string): void {
        const BASE_URL = this.landingConfig.navigateToUrlTypes[navigateToUrlType] || '';
        window.open(`${BASE_URL}${navigateToUrl}`, '_blank');
    }

}
