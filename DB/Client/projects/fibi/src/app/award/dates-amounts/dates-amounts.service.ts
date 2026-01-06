import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class DatesAmountsService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  saveTransaction(transactionRequestData) {
    return this._http.post(this._commonService.baseUrl + '/saveTransactionDetails', {'awardAmountInfo' : transactionRequestData});
  }
  datesAmountsLookUpData(param) {
    return this._http.post(this._commonService.baseUrl + '/getAwardDatesAndAmount', param);
  }
  deleteAwardTransaction(requestData) {
    return this._http.post(this._commonService.baseUrl + '/deleteTransactionDetails', requestData);

  }
  getLinkedProposalInAward(params) {
    return this._http.post( this._commonService.baseUrl + '/getInstituteProposal', params );
  }
  saveTotalProjectCostInForeignCurrency(foreignCurrencyObject) {
    return this._http.post( this._commonService.baseUrl + '/saveTotalProjectCostInForeignCurrency', foreignCurrencyObject );
  }
}
