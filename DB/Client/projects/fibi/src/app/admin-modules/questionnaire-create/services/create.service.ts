import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject ,  BehaviorSubject, of } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class CreateQuestionnaireService {

  constructor(private http: HttpClient, private _commonService: CommonService) {
    this.getModuleLookup();
  }

  addQuestionEvent = new Subject();
  updateTree  = new Subject();
  updateSelectedQuestionId = new Subject();
  $moduleLookup = new BehaviorSubject<any>([]);
  before: any;
  isGeneralDetailsChanged = false;

  getSystemLookupDetails(dataTypeCode) {
    return this.http.post(this._commonService.baseUrl + '/getSystemLookupByCustomType', { 'dataTypeCode': dataTypeCode });
  }

  getQuestionnaireList() {
    return this.http.post(this._commonService.baseUrl + '/showAllQuestionnaire', {});
  }

  saveQuestionnaireList(data) {
     return this.http.post(this._commonService.baseUrl + '/configureQuestionnaire', data);
  }

  getRuleList(data) {
    return this.http.post(this._commonService.baseUrl + '/getBusinessRuleForQuestionnaire', data);
  }

  activateQuestionnaire(questionnaireId) {
    return this.http.post(this._commonService.baseUrl + '/activateQuestionnaire', {'questionnaireId': questionnaireId,
                          'actionPersonName': this._commonService.getCurrentUserDetail('userName'), 'updateTimestamp': new Date().getTime() });
  }

  deactivateQuestionnaire(questionnaireId) {
    return this.http.post(this._commonService.baseUrl + '/deactivateQuestionnaire', {'questionnaireId': questionnaireId,
    'actionPersonName': this._commonService.getCurrentUserDetail('userName'), 'updateTimestamp': new Date().getTime() });
  }

  copyQuestionnaire(data) {
    return this.http.post(this._commonService.baseUrl + '/copyQuestionnaire', {'questionnaireId': data});
  }

  getQuestionnaireListByModule(params) {
    return this.http.post(this._commonService.baseUrl + '/getQuestionnaireListByModule', params);
  }

  getModuleLookup() {
    this.http.get(this._commonService.baseUrl + '/getModuleList')
    .subscribe((data: any) => {
      const moduleList = mapModules(data.moduleList);
      this.$moduleLookup.next(moduleList);
    });
  }

  updateQuestionnaireSortOrder(params) {
    return this.http.post(this._commonService.baseUrl + '/updateQuestionnaireSortOrder',  params);
  }

  getBusinessRuleById(ruleId) {
    return this.http.post(this._commonService.baseUrl + '/getBusinessRuleById', { 'ruleId': ruleId });
  }
}

export function setCompleterOptions(dataList: Array<any>, contextField: string, filterFields: string, formatString: string) {
  const completerOptions: any = {};
  completerOptions.arrayList = dataList || [];
  completerOptions.contextField = contextField;
  completerOptions.filterFields = filterFields;
  completerOptions.formatString = formatString;
  return JSON.parse(JSON.stringify(completerOptions));
}

function mapModules(list: Array<any>): Array<any> {
  const MODULES = list.filter(el => !el.SUB_MODULE_CODE);
  MODULES.forEach(m => m.subModules = findSubModules(list, m.MODULE_CODE));
  return MODULES;
}

function findSubModules(list , code): Array<any> {
  const SUB_MODULES = list.filter(l => l.MODULE_CODE === code && l.SUB_MODULE_CODE);
  return SUB_MODULES;
}
