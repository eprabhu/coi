import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class BudgetService {

    httpOptions: any = {};
    navigationUrl: string;

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    fetchCostElement(searchString) {
        return this._http.get(this._commonService.baseUrl + '/findCostElement' + '?searchString=' + searchString);
    }

    addBudgetPeriod(param) {
        return this._http.post(this._commonService.baseUrl + '/addBudgetPeriod', param);
    }

    addSimpleBudgetPeriod(param) {
        return this._http.post(this._commonService.baseUrl + '/addSimpleBudgetPeriod', param);
    }

    copyBudgetPeriod(param) {
        return this._http.post(this._commonService.baseUrl + '/copyBudgetPeriod', param);
    }

    generateBudgetPeriod(param) {
        return this._http.post(this._commonService.baseUrl + '/generateBudgetPeriods', param);
    }

    deleteBudgetPeriod(param) {
        return this._http.post(this._commonService.baseUrl + '/deleteBudgetPeriod', param);
    }

    deleteSimpleBudgetLineItem(param) {
        return this._http.post(this._commonService.baseUrl + '/deleteSimpleBudgetLineItems', param);
    }

    deleteBudgetDetailLineItem(param) {
        return this._http.post(this._commonService.baseUrl + '/deleteBudgetLineItem', param);
    }

    applyRates(param) {
        return this._http.post(this._commonService.baseUrl + '/autoCalculate', param);
    }

    resetBudgetRates(param) {
        return this._http.post(this._commonService.baseUrl + '/resetBudgetRates', param);
    }

    getSyncBudgetRates(param) {
        return this._http.post(this._commonService.baseUrl + '/getSyncBudgetRates', param);
    }

    deletePersonLineItem(param) {
        return this._http.post(this._commonService.baseUrl + '/deletePersonnelLine', param);
    }

    fetchBudgetSummaryTable(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchBudgetSummaryTable', param);
    }

    fetchCostElementByCategories() {
        return this._http.get(this._commonService.baseUrl + '/fetchCostElementByCategories');
    }

    loadBudgetByProposalId(params) {
        return this._http.post(this._commonService.baseUrl + '/loadBudgetByProposalId', params);
    }

    createProposalBudget(params) {
        return this._http.post(this._commonService.baseUrl + '/createProposalBudget', params);
    }

    copyBudgetVersion(params) {
        return this._http.post(this._commonService.baseUrl + '/copyProposalBudget', params);
    }

    saveOrUpdateProposalBudget(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalBudget', params);
    }

    deleteBudgetVersion(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteBudgetHeader', params);
    }

    loadBudgetByBudgetId(params) {
        return this._http.post(this._commonService.baseUrl + '/loadBudgetByBudgetId', params);
    }

    loadSimpleBudgetByBudgetId(params) {
        return this._http.post(this._commonService.baseUrl + '/loadSimpleBudgetByBudgetId', params);
    }

    generateSimpleBudgetPeriods(params) {
        return this._http.post(this._commonService.baseUrl + '/generateSimpleBudgetPeriods', params);
    }

    /**Method to generate print for budget
       * @param proposalId - ID of proposal,
       * @param budgetId - ID of budget,
       * @param isBudgetSummaryPrint - whether its the print of Budget Summary tab (Y)
       * @param isDetailedBudgetPrint - whether its the print of Budget Detailed Budget tab (Y)
       * @param isSimpleBudgetPrint - whether its the print of Simple Budget tab (Y)
       */
    printBudget(proposalId, budgetId, isBudgetSummaryPrint, isDetailedBudgetPrint, isSimpleBudgetPrint, isPersonnelBudgetPrint) {
        const param = { proposalId, budgetId, isBudgetSummaryPrint, isDetailedBudgetPrint, isSimpleBudgetPrint, isPersonnelBudgetPrint };
        return this._http.post(this._commonService.baseUrl + '/generateBudgetReport', param, {
            responseType: 'blob'
        });
    }

    findCostElementsByParams(searchString, budgetCategoryCodes) {
        return this._http.post(this._commonService.baseUrl + '/findCostElementsByParams',
            { searchString: searchString ? searchString : '', budgetCategoryCodes: budgetCategoryCodes });
    }

    createApprovedProposalBudget(params) {
        return this._http.post(this._commonService.baseUrl + '/createApprovedProposalBudget', params);
    }

    generateBudgetSummaryExcelReport(proposalId, budgetId) {
        return this._http.get(this._commonService.baseUrl + '/generateBudgetSummaryExcelReport', {
            headers: new HttpHeaders().set('proposalId', proposalId.toString()).set('budgetId', budgetId.toString()),
            responseType: 'blob'
        });
    }

    generateProposalSimpleBudget(budgetId) {
        return this._http.get(this._commonService.baseUrl + '/generateProposalSimpleBudgetExcelReport', {
            headers: new HttpHeaders().set('budgetId', budgetId.toString()),
            responseType: 'blob'
        });
    }

    generateProposalDetailedBudget(budgetId) {
        return this._http.get(this._commonService.baseUrl + '/generateProposalDetailedBudgetExcelReport', {
            headers: new HttpHeaders().set('budgetId', budgetId.toString()),
            responseType: 'blob'
        });
    }

    updateProposalBudgetPeriods(proposalId, activityTypeCode, budgetId) {
        return this._http.post(this._commonService.baseUrl + '/updateProposalBudgetPeriods',
            {
                'proposalId': proposalId,
                'activityTypeCode': activityTypeCode,
                'budgetId': budgetId
            });
    }
}

