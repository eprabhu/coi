import {CommonService} from '../../common/services/common.service';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable()
export class InvoiceService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    loadClaimInvoiceSummary(claimId: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadClaimInvoiceSummary/${claimId}`);
    }

    loadClaimInvoice(claimId: any): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/loadClaimInvoice/' + claimId);
    }

    loadClaimInvoiceLookups(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/loadClaimInvoiceLookups/');
    }

    saveOrUpdateClaimInvoice(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimInvoice', params);
    }

    loadClaimInvoiceSapResponse(claimId: number, sequenceNumber: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadClaimInvoiceSapResponse/${claimId}/${sequenceNumber}`);
    }
}
