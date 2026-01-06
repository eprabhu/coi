import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class PaymentService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getAwardPaymentAndInvoices() {
        return this._http.get(this._commonService.baseUrl + '/getAwardPaymentAndInvoices');
    }
    saveAwardPaymentAndInvoices(param) {
        return this._http.post(this._commonService.baseUrl + '/saveAwardPaymentAndInvoices', param);
    }
}
