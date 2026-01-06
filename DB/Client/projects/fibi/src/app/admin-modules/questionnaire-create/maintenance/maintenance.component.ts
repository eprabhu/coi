import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CreateQuestionnaireService } from '../services/create.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AuditLogService } from '../../../common/services/audit-log.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  providers: [AuditLogService,
	{ provide: 'moduleName', useValue: 'QUESTIONNAIRE' }]
})
export class MaintenanceComponent implements OnInit, OnDestroy {

  questionnaireList: Array<any> = [];
  questionnaireListByModule: Array<any> = [];
  $subscriptions: Subscription[] = [];
  selectedQuestionnaireId: number;
  currentTab = 'MAINTENANCE';
  moduleList: Array<any> = [];
  helpInfo = false;

  constructor(private _createQuestionnaireService: CreateQuestionnaireService,
    private _commonService: CommonService, private _auditLogService: AuditLogService,
    private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getAllQuestionnaireList(true);
    this.getModuleLookup();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAllQuestionnaireList(forceRequest) {
    this.updateCurrentTab('MAINTENANCE');
    if (!this.questionnaireList.length || forceRequest) {
      this.$subscriptions.push(this._createQuestionnaireService.getQuestionnaireList()
        .subscribe((data: any) => this.questionnaireList = data.questionnaireList));
    }
  }

  getModuleLookup() {
    this.$subscriptions.push(this._createQuestionnaireService.$moduleLookup
      .subscribe((data: any) => {
        this.moduleList = data.filter(item => item.IS_ACTIVE === 'Y');
      }));
  }

  getQuestionnaireListByModule(requestObject: Object) {
    this.$subscriptions.push(this._createQuestionnaireService.getQuestionnaireListByModule(requestObject)
      .subscribe((data: any) => this.questionnaireListByModule = data.questionnaireList));
  }

  updateQuestionnaireStatus(event) {
    event.status === 'Y' ? this.activateQuestionnaire(event.index, event.questionId, event.listType) :
      this.deActivateQuestionnaire(event.index, event.questionId, event.listType);
  }

  activateQuestionnaire(index: number, questionnaireId: number, list: string) {
    let before = {'Questionnaire Id': this[list][index].PENDING_QUESTIONNAIRE_ID, 'Questionnaire Name': this[list][index].QUESTIONNAIRE_LABEL , 'IS_FINAL' : 'N'};
    this.$subscriptions.push(this._createQuestionnaireService.activateQuestionnaire(questionnaireId).subscribe((data) => {
      setTimeout(() => this[list][index].IS_FINAL = 'Y',
        this[list][index].ACTIVE_QUESTIONNAIRE_VERSION = this[list][index].PENDING_QUESTIONNAIRE_VERSION,
        this[list][index].PENDING_QUESTIONNAIRE_VERSION = null,
        this[list][index].ACTIVE_QUESTIONNAIRE_ID = this[list][index].PENDING_QUESTIONNAIRE_ID,
        this[list][index].PENDING_QUESTIONNAIRE_ID = null,
        this[list][index].ACTIVE_ANSWERED_COUNT = this[list][index].PENDING_ANSWERED_COUNT,
        this[list][index].PENDING_ANSWERED_COUNT = null,
        this[list][index].UPDATE_TIMESTAMP = new Date().getTime(),
        this[list][index].UPDATE_USER = this._commonService.getCurrentUserDetail('fullName'), 200);
        let after = {'Questionnaire Id': this[list][index].ACTIVE_QUESTIONNAIRE_ID, 'Questionnaire Name': this[list][index].QUESTIONNAIRE_LABEL , 'IS_FINAL' : 'Y'};
        this._auditLogService.saveAuditLog('U', before, after, null, Object.keys(after), this[list][index].QUESTIONNAIRE_NUMBER);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire activated successfully.');
    }));
  }

  deActivateQuestionnaire(index: number, questionnaireId: number, list: string) {
    let before = {'Questionnaire Id': this[list][index].ACTIVE_QUESTIONNAIRE_ID, 'Questionnaire Name': this[list][index].QUESTIONNAIRE_LABEL , 'IS_FINAL' : 'Y'};
    this.$subscriptions.push(this._createQuestionnaireService.deactivateQuestionnaire(questionnaireId).subscribe((data) => {
      setTimeout(() => this[list][index].IS_FINAL = 'N',
        this[list][index].PENDING_QUESTIONNAIRE_VERSION = this[list][index].ACTIVE_QUESTIONNAIRE_VERSION,
        this[list][index].ACTIVE_QUESTIONNAIRE_VERSION = null,
        this[list][index].PENDING_QUESTIONNAIRE_ID = this[list][index].ACTIVE_QUESTIONNAIRE_ID,
        this[list][index].ACTIVE_QUESTIONNAIRE_ID = null,
        this[list][index].PENDING_ANSWERED_COUNT = this[list][index].ACTIVE_ANSWERED_COUNT,
        this[list][index].ACTIVE_ANSWERED_COUNT = null,
        this[list][index].UPDATE_TIMESTAMP = new Date().getTime(),
        this[list][index].UPDATE_USER = this._commonService.getCurrentUserDetail('fullName'), 200);
        let after = {'Questionnaire Id': this[list][index].PENDING_QUESTIONNAIRE_ID, 'Questionnaire Name': this[list][index].QUESTIONNAIRE_LABEL , 'IS_FINAL' : 'N'};
        this._auditLogService.saveAuditLog('U', before, after, null, Object.keys(after), this[list][index].QUESTIONNAIRE_NUMBER);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire deactivated successfully.');
    }));
  }

  openQuestionnaire(event) {
    this.selectedQuestionnaireId = event.questionnaireId;
    /* parseInt conversion is applied because count may occur as  string and Integer */
    if (!(parseInt(event.answerCount, 0))) {
      this.navigateToCreate(event.questionnaireId, event.viewMode, event.version);
    } else {
      document.getElementById('confirmEditModalButton').click();
    }
  }

  navigateToCreate(questionnaireId: number = null, viewMode = 'T', version = 'F') {
    this._router.navigate(['../create'],
      { queryParams: { id: this.appendValuesToQueryParams(questionnaireId, viewMode, version) }, relativeTo: this._activatedRoute });
  }

  appendValuesToQueryParams(questionnaireId: number, viewMode = 'T', version = 'F') {
    return questionnaireId ? viewMode + version + questionnaireId : null;
  }

  confirmCopyQuestionnaire(questionnaireId) {
    this.selectedQuestionnaireId = questionnaireId;
    document.getElementById('confirmCopyQuestionnaire').click();
  }

  copyQuestionnaire(questionnaireId) {
    let before = {};
    this.$subscriptions.push(this._createQuestionnaireService.copyQuestionnaire(questionnaireId)
      .subscribe((data: any) => {
        const questionnaireObject = {
          questionnaireId: data.questionnaireId,
          answerCount: 0,
          viewMode: 'F',
          version: 'F'
        };
        let after = this.prepareAuditLogObject(data.header);
        this._auditLogService.saveAuditLog('I', before, after, null, Object.keys(after), data.QUESTIONNAIRE_NUMBER);
        this.openQuestionnaire(questionnaireObject);
      }));
  }

  prepareAuditLogObject(qnrDetails) {
    return {
      'questionnaire title': qnrDetails.QUESTIONNAIRE_NAME,
			'questionnaire description': qnrDetails.QUESTIONNAIRE_DESCRIPTION,
			'QUESTIONNAIRE_VERSION': qnrDetails.QUESTIONNAIRE_VERSION,
			'IS_FINAL': qnrDetails.IS_FINAL
    };
  }

  updateCurrentTab(currentTab) {
    this.currentTab = currentTab;
  }
}
