import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../../../common/services/common.service';

@Injectable()
export class InvoiceLineItemService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    saveOrUpdateClaimInvoiceDetail(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimInvoiceDetail', params);
    }

    deleteClaimInvoiceDetail(invoiceDetailId) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteClaimInvoiceDetail/${invoiceDetailId}`);
    }

}
