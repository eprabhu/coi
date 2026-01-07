import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class SettingsServiceService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    migrateAttachmentData() {
        return this._http.post(this._commonService.baseUrl + '/attachmentDataMigration', {});
    }
    fastIntegration(reqObj) {
        return this._http.post(this._commonService.baseUrl + '/fastIntegration', reqObj);
    }
    fastIntegrationResponceProcessing() {
        return this._http.get(this._commonService.baseUrl + '/fastIntegrationResponceProcessing');
    }
    fastIntegrationExpenseTransactionRTProcessing() {
        return this._http.get(this._commonService.baseUrl + '/fastIntegrationExpenseTransactionRTProcessing');
    }
    fastIntegrationRevenueTransactionRTProcessing(processingType) {
        return this._http.get(this._commonService.baseUrl + '/fastIntegrationRevenueTransactionRTProcessing' +
        '?processingType=' + processingType);
    }
    exportExpenseTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportExpenseTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportLevelTwoExpenseTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportLevelTwoExpenseTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportLevelOneExpenseTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportLevelOneExpenseTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportSapFeedReport(batchId) {
        return this._http.get(this._commonService.baseUrl + '/exportSapFeedReport', {
            headers: new HttpHeaders().set('batchId', batchId.toString()),
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportRevenueTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportRevenueTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportLevelOneRevenueTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportLevelOneRevenueTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    exportLevelTwoRevenueTransactionReport() {
        return this._http.get(this._commonService.baseUrl + '/exportLevelTwoRevenueTransactionReport', {
            observe: 'response',
            responseType: 'blob'
        });
    }
    grantCallAttachmentDataMigration() {
        return this._http.post(this._commonService.baseUrl + '/grantCallAttachmentDataMigration', {});
    }
    dailySynchronization() {
        return this._http.get(this._commonService.orcidUrl + '/dailySynchronization');
    }
    workDayManpower() {
        return this._http.get(this._commonService.baseUrl + '/getManpowerDetails');
    }
    workDayCitizenship() {
        return this._http.get(this._commonService.baseUrl + '/getNationalityDetails');
    }
    workDayCostAllocation() {
        return this._http.get(this._commonService.baseUrl + '/assignCostAllocation');
    }
    workDayTermination() {
        return this._http.get(this._commonService.baseUrl + '/getWorkdayTerminations');
    }
    workDayLongLeave() {
        return this._http.get(this._commonService.baseUrl + '/getWorkdayLongLeave');
    }
    workDayCostReconciliation() {
        return this._http.get(this._commonService.baseUrl + '/getCostingAllocationReconciliation');
    }
    workDaycClosePosition() {
        return this._http.get(this._commonService.baseUrl + '/closePosition');
    }
    workDayJobProfile() {
        return this._http.get(this._commonService.baseUrl + '/getWorkdayJobProfile');
    }
    exportManpowerDetails() {
        return this._http.get(this._commonService.baseUrl + '/exportManpowerDetails');
    }
    getJobProfileChanges() {
        return this._http.get(this._commonService.baseUrl + '/getJobProfileChanges');
    }
    getStudentIcsIntegration(DateProcessed) {
        return this._http.post(this._commonService.baseUrl + '/claimStudentTravelIntegration',DateProcessed);
    }
    encryptMigrationCitizenshipNationality() {
        return this._http.get(this._commonService.baseUrl + '/encryptAllMigratedCitizenshipNationality');
    }
    updateClaimDuration() {
        return this._http.get(this._commonService.baseUrl + '/updateClaimDuration');
    }
    claimInvoiceSapIntegration() {
        return this._http.get(this._commonService.baseUrl + '/claimInvoiceSapIntegration');
    }
    processClaimInvoiceFeedResponse() {
        return this._http.get(this._commonService.baseUrl + '/processClaimInvoiceFeedResponse');
    }
    ardpBudgetIntegration() {
        return this._http.get(this._commonService.baseUrl + '/ardpBudgetIntegration');
    }
    scopusIntegration() {
        return this._http.get(this._commonService.baseUrl + '/scopusIntegration');
    }

    profitCenter() {
        return this._http.get(this._commonService.baseUrl + '/getProfitCenterApiDetails');
    }

    fundCenter() {
        return this._http.get(this._commonService.baseUrl + '/getFundCenterApiDetails');
    }
    costCenter() {
        return this._http.get(this._commonService.baseUrl + '/getCostCenterApiDetails');
    }
    grantCode() {
        return this._http.get(this._commonService.baseUrl + '/getGrantCodeApiDetails');
    }
    positionStatusApi() {
        return this._http.get(this._commonService.baseUrl + '/positionStatusApi');
    }

    costAllocation() {
        return this._http.get(this._commonService.baseUrl + '/costAllocation');
    }

    costAllocationWithManualDates(param) {
        return this._http.post(this._commonService.baseUrl + '/costAllocationWithManualDates',param);
    }

    updateFeedStatusManually(awardNumber: string) {
        return this._http.get(`${this._commonService.baseUrl}/updateFeedStatusManually/${awardNumber}`);
    }    
}
