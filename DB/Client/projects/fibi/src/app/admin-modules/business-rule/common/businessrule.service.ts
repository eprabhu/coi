import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class BusinessRuleService {
  constructor(private http: HttpClient, private _commonService: CommonService) { }

  public filterData: any = {};
  completerUnitListOptions: any = {};
  completerModuleListOptions: any = {};
  completerRuleListOptions: any = {};
  moduleSubModuleList: any;
  conditionsForList: any = [
    { id: 'N', name: 'Notification' },
    { id: 'Q', name: 'Questionnaire' },
    { id: 'R', name: 'Routing' },
    { id: 'VE', name: 'Validation-Error' },
    { id: 'VW', name: 'Validation-Warning' },
  ];

  getUnitList() {
    return this.http.get(this._commonService.baseUrl + '/getUnitList');
  }
  getBusinessRuleList() {
    return this.http.get(this._commonService.baseUrl + '/getBusinessRule');
  }
  getRuleList(params) {
    return this.http.post(this._commonService.baseUrl + '/getRuleList', params);
  }
  inActivateRule(params) {
    return this.http.post(this._commonService.baseUrl + '/inActivateRule', params);
  }
  getDashboardMapList() {
    return this.http.get(this._commonService.baseUrl + '/getMapList');
  }
  getMapDetailsById(mapId) {
    return this.http.post(this._commonService.baseUrl + '/getMapDetailsById', { 'mapId': mapId });
  }
  getRuleDetailsList(moduleCode, subModuleCode) {
    return this.http.post(this._commonService.baseUrl + '/getRuleDetails', { 'moduleCode': moduleCode, 'subModuleCode': subModuleCode });
  }
  insertBusinessRule(businessRule) {
    return this.http.post(this._commonService.baseUrl + '/insertBusinessRule', { businessRule });
  }
  updateBusinessRule(businessRule) {
    return this.http.post(this._commonService.baseUrl + '/updateBusinessRule', { businessRule });
  }
  getBusinessRuleById(ruleId) {
    return this.http.post(this._commonService.baseUrl + '/getBusinessRuleById', { 'ruleId': ruleId });
  }
  getVariableList(lookUpWindowName) {
    return this.http.post(this._commonService.baseUrl + '/getByRuleVariable', { 'lookUpWindowName': lookUpWindowName });
  }
  getQuestionDetailsById(questionNumber) {
    return this.http.post(this._commonService.baseUrl + '/getQuestionsById', { 'questionNumber': questionNumber });
  }
  getAsyncQuestionDetailsById(questionNumber) {
    return this.http.post(this._commonService.baseUrl + '/getQuestionsById', { 'questionNumber': questionNumber }).toPromise();
  }
  getAsyncVariableList(lookUpWindowName) {
    return this.http.post(this._commonService.baseUrl + '/getByRuleVariable', { 'lookUpWindowName': lookUpWindowName }).toPromise();
  }
  getNotificationLists() {
    return this.http.get(this._commonService.baseUrl + '/getNotificationList');
  }
  updateRuleEvaluationOrder(metaRuleList) {
    return this.http.post(this._commonService.baseUrl + '/updateRuleEvaluationOrder', { 'ruleEvaluationOrderList': metaRuleList });
  }

  getAllRuleList() {
    return this.http.get(this._commonService.baseUrl + '/getAllRuleList');
  }

  getFunctionParameters(functionName: string): Observable<any> {
    return this.http.post(this._commonService.baseUrl + '/getFunctionParameters', { 'functionName': functionName });
  }

  getQuestionnaireList(moduleCode: string): Observable<any> {
    return this.http.post(this._commonService.baseUrl + '/getActiveQuestions', { 'moduleCode': moduleCode });
  }

  deleteBusinessRule(ruleId) {
    return this.http.delete(`${this._commonService.baseUrl}/businessRule/${ruleId}`, {responseType: 'text'});
  }

  createMetaRule(condition, param, ruleEmpty, parentNodeNumber) {
    return this.http.post(this._commonService.baseUrl + '/saveOrUpdateMetaRule', {
      'metaRuleAvailable': ruleEmpty,
      'nodeCondition': condition,
      'metaRule': param,
      'parentNodeNumber': parentNodeNumber
    });
  }

  getMetaRuleList(params) {
    return this.http.post(this._commonService.baseUrl + '/fetchMetaRulesByParams', params);
  }

  deleteMetaRule(deleteObject) {
    return this.http.post(this._commonService.baseUrl + '/deleteMetaRuleNode',
    {
      'metaRuleId': deleteObject.metaRuleId,
      'metaRuleDetailId': deleteObject.metaRuleDetailId,
      'parentNodeNumber': deleteObject.parentNodeNumber,
      'nodeCondition': deleteObject.condition,
      'isRootNode': deleteObject.isRootNode
    });
  }
}

