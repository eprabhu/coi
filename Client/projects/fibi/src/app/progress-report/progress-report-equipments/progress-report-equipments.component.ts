import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ProgressReportService } from '../services/progress-report.service';
import { AutoSaveService } from '../../common/services/auto-save.service';
@Component({
  selector: 'app-progress-report-equipments',
  template: `<div id="progress-report-questionnaire">
    <app-view-questionnaire-list *ngIf="_commonData.progressReportSectionConfig['1607'].isActive"
    [configuration] = "configuration"
    [isShowSave]=false
    (QuestionnaireSaveEvent)= "getSaveEvent($event)"
    (QuestionnaireEditEvent) = "markQuestionnaireAsEdited($event)"
    [externalSaveEvent] = '_autoSaveService.autoSaveTrigger$'>
  </app-view-questionnaire-list></div>`,
})

export class ProgressReportEquipmentsComponent implements OnInit, OnDestroy {

  configuration: any = {
    moduleItemCode: 16,
    moduleSubitemCodes: [0],
    moduleSubItemKey: 0,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    isChangeWarning: true,
    enableViewMode: false,
    isEnableVersion: true,
  };
  $subscriptions: Subscription[] = [];

  constructor(private _route: ActivatedRoute,
    public _commonService: CommonService,
    private _progressReportService: ProgressReportService,
    public _commonData: CommonDataService,
    private _autoSaveService: AutoSaveService) { }

  ngOnInit() {
    this.configuration.moduleItemKey = this._route.snapshot.queryParamMap.get('progressReportId');
    this.checkQuestionnaireView();
    this.checkQuestionnarieMode();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** Sets toast message based on questionnaire save resposne
   * @param event
   */
  getSaveEvent(event) {
    event ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire saved successfully.') :
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Questionnaire failed. Please try again.');
  }

  checkQuestionnarieMode() {
    this.$subscriptions.push(this._progressReportService.$isQuestionnaireChange.subscribe((data: any) => {
      this.checkQuestionnaireView();
      this.configuration = Object.assign({}, this.configuration);
    }));
}

  /**
   * @param  {}
   * if edit mode for progress report is true enable viewmode for questionnarie should be false and viceversa
   */
  checkQuestionnaireView() {
    this.$subscriptions.push(this._commonData.getEditMode().subscribe((editMode: boolean) => {
      this.configuration.enableViewMode = !editMode;
    }));
  }

  markQuestionnaireAsEdited(changeStatus: boolean): void {
    this._commonData.isDataChange = changeStatus;
      this._autoSaveService.setUnsavedChanges('Questionnaire', 'progress-report-questionnaire', changeStatus, true);
  }
}
