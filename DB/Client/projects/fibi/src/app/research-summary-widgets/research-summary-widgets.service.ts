import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from './../common/services/common.service';

@Injectable()
export class ResearchSummaryWidgetsService {

  widgetLookUpList: any = [];
  financialYear: any;
  selectedSponsorCodes: any = [];
  isSponsorSelected: boolean;
  selectedSponsorGroupId: any;
  selectedSponsorName: any = [];
  selectedSponsorGroupName = '';
  selectedFromDate: Date;
  selectedToDate: Date;
  selectedDailyCheckFromDate: Date;
  selectedDailyCheckToDate: Date;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getResearchSummaryDatasByWidget(params) {
    return this._http.post(this._commonService.baseUrl + '/getResearchSummaryDatasByWidget', params);
  }

  getQuestionResults() {
    return this._http.post(this._commonService.baseUrl + '/showUnansweredQuestions', {'limit': 6});
  }

  getActionList(inboxObj) {
    return this._http.post(this._commonService.baseUrl + '/showInbox', inboxObj);
  }

  openUnreadInbox(inboxId) {
    return this._http.post(this._commonService.baseUrl + '/markAsReadInboxMessage', { 'inboxId': inboxId });
  }

  getWidgetLookups() {
    return this._http.get(this._commonService.baseUrl + '/getWidgetLookups');
  }

  saveUserSelectedWidget(params) {
    return this._http.post(this._commonService.baseUrl + '/saveUserSelectedWidget', params);
  }

  deleteUserSelectedWidget(selectedWidgetId) {
    return this._http.delete(this._commonService.baseUrl + '/deleteUserSelectedWidget', {
      headers: new HttpHeaders().set('selectedWidgetId', selectedWidgetId.toString())
    });
  }

  updateWidgetSortOrder(params) {
    return this._http.post(this._commonService.baseUrl + '/updateWidgetSortOrder', params);
  }

  getAllQuickLinksOrEvents() {
    return this._http.get(this._commonService.baseUrl + '/getAllQuickLinksOrEvents');
  }

  getAwardDepartmentPieChart(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardDepartmentPieChart', params);
  }

  getAwardsByDepartment(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardsByDepartment', params);
  }

  /**
   * @param  {number} widgetId :id which is in the table for widget lookups
   * returns the widget description which is shown in the top right of widget
   */
  getWidgetDescription(widgetId: number): any {
    return this.widgetLookUpList.find((widget: any) => widget.widgetId === widgetId);
  }

  getSumOfColumn(list: any[], index: number): number {
    let sum = 0;
    list.forEach(element => { sum += element[index] ? element[index] : 0; });
    return sum;
  }

  getCurrentFinancialYear() {
    if (this.financialYear) {
      return this.financialYear;
    }
    const today = new Date();
    return this.financialYear = (today.getMonth() + 1) <= 3 ? today.getFullYear() - 1 : today.getFullYear();
  }

  getAgreementSummary(isAdmin) {
    return this._http.post(this._commonService.baseUrl + '/getAgreementSummary', {
      'personId': this._commonService.getCurrentUserDetail('personID'), 'isAdmin': isAdmin
    });
  }

  getUnitWithRights(personId: number) {
    return this._http.get(`${this._commonService.baseUrl}/getUnitWithRights/${personId}`);
  }

}
