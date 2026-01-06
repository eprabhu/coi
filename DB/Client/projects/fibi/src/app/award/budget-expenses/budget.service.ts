// Last updated by Remya on 14-11-2019
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class BudgetService {
  httpOptions: any = {};
  isPeriodOperationsTrigger = new Subject();

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

/** sets endpoint search options
  * @param params will have fetchLimit as one of the values 
  * to specify limit of data to fetched,
  * it should be given inside params as {'fetchLimit' : requiredLimit}
  * requiredLimit can be either null or any valid number.
  * if no limit is specified default fetch limit 50 will be used.
  * if limit is null then full list will return, this may cause performance issue.
*/
  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = getParams(params);    
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

  deleteLineItem(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardBudgetLineItem', param);
  }

  printBudget(proposalId) {
    return this._http.get(this._commonService.baseUrl + '/printBudgetPdfReport', {
      headers: new HttpHeaders().set('proposalId', proposalId.toString()),
      responseType: 'blob'
    });
  }

  getSalaryofSelectedPerson(param) {
    return this._http.post(this._commonService.baseUrl + '/getPersonMonthySalaryForJobCode', param);
  }

  deletePersonLineItem(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardBudgetPersonnelLine', param);
  }

  createAwardBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/createAwardBudget', params);
  }
  saveOrUpdateAwardBudgetOverView(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardBudgetOverView', params);
  }

  saveOrUpdateAwardBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardBudget', params);
  }

  saveOrUpdateAwardBudgetLineItem(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardBudgetLineItem', params);
  }

  loadBudgetByAwardId(params) {
    return this._http.post(this._commonService.baseUrl + '/loadBudgetByAwardId', params);
  }

  loadAwardBudgetVersionsByAwardId(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardBudgetVersionsByAwardId', params);
  }

  getDevProposalBudgetByAwardId(params) {
    return this._http.post(this._commonService.baseUrl + '/getDevProposalBudgetByAwardId', params);
  }

  importProposalBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/importProposalBudget', params);
  }

  getBudgetExpenseData(params) {
    return this._http.post(this._commonService.baseUrl + '/loadExpenseDetailsByAwardId', params);
  }

  getTransactionDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchExpenditureTransactions', params);
  }

  saveCommittedBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/updateCommittedAmount', params);
  }

  getCommittedAmountList(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchExpenseDetailsExtByParams', params);
  }

  getTimeLogDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchPersonLogDetails', params);
  }

  datesAmountsLookUpData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getAwardDatesAndAmount', { 'awardId': awardId });
  }

  deleteAwardExpenseDetailsExtById(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardExpenseDetailsExtById', params);
  }

  addAwardBudgetPeriod(param) {
    return this._http.post(this._commonService.baseUrl + '/addAwardBudgetPeriod', param);
  }

  saveOrUpdateAwardBudgetPeriod(param) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardBudgetPeriod', param);
  }

  deleteAwardBudgetPeriod(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardBudgetPeriod', param);
  }

  copyAwardBudgetPeriod(param) {
    return this._http.post(this._commonService.baseUrl + '/copyAwardBudgetPeriod', param);
  }

  generateAwardBudgetPeriods(param) {
    return this._http.post(this._commonService.baseUrl + '/generateAwardBudgetPeriods', param);
  }

  generateAwardBudgetReport(budgetId, awardId, isBudgetSummaryPrint, isDetailedBudgetPrint) {
    const params = { budgetId, awardId, isBudgetSummaryPrint, isDetailedBudgetPrint };
    return this._http.post(this._commonService.baseUrl + '/generateAwardBudgetReport', params, {
      responseType: 'blob'
    });
  }

  fetchAwardBudgetSummaryTable(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAwardBudgetSummaryTable', params);
  }

  loadAwardExpensePersonDetails(param) {
    return this._http.post(this._commonService.baseUrl + '/loadAwardExpensePersonDetails', param);
  }

  loadExpenseDetailsBasedOnCostElement(param) {
    return this._http.post(this._commonService.baseUrl + '/loadExpenseDetailsBasedOnCostElement', param);
  }

  resetAwardBudgetRates(param) {
    return this._http.post(this._commonService.baseUrl + '/resetAwardBudgetRates', param);
  }

  getSyncAwardBudgetRates(param) {
    return this._http.post(this._commonService.baseUrl + '/getSyncAwardBudgetRates', param);
  }

  applyAwardBudgetRates(param) {
    return this._http.post(this._commonService.baseUrl + '/applyAwardBudgetRates', param);
  }

  generateAwardDetailedBudget(budgetId) {
    return this._http.get(this._commonService.baseUrl + '/generateAwardDetailedBudgetExcelReport', {
      headers: new HttpHeaders().set('budgetId', budgetId.toString()),
      responseType: 'blob'
    });
  }

  generateAwardBudgetSummaryReport(budgetId, awardId) {
    return this._http.get(this._commonService.baseUrl + '/generateAwardBudgetSummaryExcelReport', {
      headers: new HttpHeaders().set('budgetId', budgetId.toString())
                                .set('awardId', awardId.toString()),
      responseType: 'blob'
    });
  }

  deleteAwardBudgetNonPersonnelSubItem(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardBudgetNonPersonnelLine', param);
  }

  generateExpenseDetailedBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/exportExpenseTrackingDatas', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  getBudgetRevenueData(params) {
    return this._http.post(this._commonService.baseUrl + '/loadRevenueDetailsByParams', params);
  }

  getRevenueTransactionDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchRevenueTransactions', params);
  }

  fetchAllBudgetFundType() {
    return this._http.get(this._commonService.baseUrl + '/fetchAllBudgetFundType');
  }

  generateRevenueExpensePurchasePDFReport(params) {
    return this._http.post(this._commonService.baseUrl + '/generateAwardExpensePDFReport', params,
    {responseType: 'blob' });
  }

  generateRevenueExpensePurchaseExcelReport(params) {
    return this._http.post(this._commonService.baseUrl + '/generateAwardExpenseExcelReport', params,
    {responseType: 'blob' });
  }

  loadSubmittedClaimsForAward(params) {
    return this._http.post(this._commonService.baseUrl + '/loadSubmittedClaimsForAward', params);
  }
}
