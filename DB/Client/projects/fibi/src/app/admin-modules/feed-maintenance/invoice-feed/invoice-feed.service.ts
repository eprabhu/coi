import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceAdvanceSearch } from './invoice-feed';
import { CommonService } from '../../../common/services/common.service';
import { Subject } from 'rxjs/internal/Subject';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class InvoiceFeedService {
    sapFileProcessInfoText = new Subject<any>();
    $invoiceFileProcess = new BehaviorSubject(false);

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getInvoiceClaimFeedDashboard(param: InvoiceAdvanceSearch): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/getSapClaimFeedDashboard/`, param);
    }

    getInvoiceBatchFeedAttachment(batchId): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/exportInvoiceGeneratedAttachments',
            { 'batchId': batchId }, { responseType: 'blob' });
    }

    /**
 * @param userActionsList
 * This will set info text for SAP File Response process action (Action code : 8)
 * which will be called from child modules of Batch Details, Pending Feeds and Batch History.
 */
    invoiceFileProcessInfoText(userActionsList) {
        const sapActionObj = userActionsList && userActionsList.length ?
            userActionsList.find(action => action.userActionCode === '8') : null;
        sapActionObj ? this.sapFileProcessInfoText.next(sapActionObj.description) : this.sapFileProcessInfoText.next(null);
    }

    manualResponseProcess() {
        return this._http.get(`${this._commonService.baseUrl}/processClaimInvoiceFeedResponse`);
    }

    getSapBatchFeedAttachment(param) {
        return this._http.post(this._commonService.baseUrl + '/exportSapGeneratedAttachments', param, {
            responseType: 'blob'
        });
    }

    generateBatch(param) {
        return this._http.post(this._commonService.baseUrl + '/fastIntegration', param);
    }

    reTrigger(batchId) {
        return this._http.post(this._commonService.baseUrl + '/sapFeedReTrigger', batchId);
    }

    invoiceRevision(param) {
        return this._http.post(this._commonService.baseUrl + '/claimInvoiceNotifyPI', param);
    }

    getInvoiceDetails(invoiceId: number, batchId: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadClaimInvoiceLog/${invoiceId}/${batchId}`);
    }

    updateClaimInvoiceFeedStatus(param) {
        return this._http.post(this._commonService.baseUrl + '/updateClaimInvoiceFeedStatus', param);
    }

    reInterfaceClaimSapFeed(param) {
        return this._http.post(this._commonService.baseUrl + '/reInterfaceClaimSapFeed', param);
    }

    processClaimInvoiceSapFeed(param) {
        return this._http.post(this._commonService.baseUrl + '/processClaimInvoiceSapFeed', param);
    }

    exportClaimInvoiceAttachments(param) {
        return this._http.post(this._commonService.baseUrl + '/exportClaimInvoiceAttachments', param, {
            responseType: 'blob'
        });
    }

    exportInvoiceFeedReport(param: any) {
        return this._http.post(this._commonService.baseUrl + '/generateInvoiceFeedReport', param, {
          observe: 'response',
          responseType: 'blob'
        });
    }

}
