import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { forkJoin, Subscription } from 'rxjs';
import { GrantCommonDataService } from '../../services/grant-common-data.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { IndicationOfInterestService } from '../indication-of-interest.service';

@Component({
  selector: 'app-ioi-questionnaire',
  templateUrl: './ioi-questionnaire.component.html',
  styleUrls: ['./ioi-questionnaire.component.css']
})
export class IoiQuestionnaireComponent implements OnInit {
  result: any = {};
  questionnaire: any;
  applicableQuestionnaire: any;
  questionnaireDetails: any = {};
  moduleDetails: any = {};
  selectedQuestionaire = 'null';
  grantIOIQuestionnaireId = null;
  $subscriptions: Subscription[] = [];
  warningMessage = new Map();
  isSaving = false;

  configuration: any = {
    moduleItemCode: null,
    moduleSubitemCodes: [1],
    moduleItemKey: '',
    moduleSubItemKey: 0,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    enableViewMode: false,
    isChangeWarning: true,
    isEnableVersion: true,
    questionnaireNumbers: []
  };

  constructor(private _commonService: CommonService, private _commonData: GrantCommonDataService,
    public _ioiService: IndicationOfInterestService) { }

  ngOnInit() {
    this.getGrantCallGeneralData();
    this.ioiQuestionnaireSelect();
    this.configuration.moduleItemKey = this.result.grantCall.grantCallId;
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  ioiQuestionnaireSelect() {
    this.$subscriptions.push(forkJoin([this.loadQuestionnaire(), this.ioiQuestionnairesFetch()])
      .subscribe((data: any) => {
        this.applicableQuestionnaire = data[1].applicableQuestionnaire;
        if (data[0].grantQuestionnaire != null) {
          this.grantIOIQuestionnaireId = data[0].grantQuestionnaire.grantIOIQuestionnaireId;
          this.questionnaireDetails.QUESTIONNAIRE_ID = this.getQuestionnaireIdForNumber(data[0].grantQuestionnaire.questionnaireId);
          this.moduleDetails.moduleSubItemCode = 1;
          this.moduleDetails.moduleSubItemKey = 0;
          this.moduleDetails.moduleItemCode = 15;
          this.moduleDetails.moduleItemKey = this.result.grantCall.grantCallId;
          this.questionnaireDetails = Object.assign({}, this.questionnaireDetails);
          this.selectedQuestionaire = data[0].grantQuestionnaire.questionnaireId;
        }
      }));
  }

  getQuestionnaireIdForNumber(qnrNumber) {
    // tslint:disable-next-line:triple-equals
    const questionnaire = this.applicableQuestionnaire.find(Q => Q.QUESTIONNAIRE_NUMBER == qnrNumber);
    if (questionnaire) {
      return questionnaire.QUESTIONNAIRE_ID;
    }
  }

  /* service for saving the questionnaire*/
  ioiQuestionnairesFetch() {
    return this._ioiService.getApplicableQuestionnaire({
      'moduleSubItemCode': 1, 'moduleSubItemKey': 0,
      'moduleItemCode': 15, 'moduleItemKey': this.result.grantCall.grantCallId,
      'questionnaireMode': 'ACTIVE'
    });
  }

  /* loads the questionnaire */
  loadQuestionnaire() {
    return this._ioiService.loadQuestionnaireByGrantCallId({
      'grantCallId': this.result.grantCall.grantCallId
    });
  }

  /* saving the questionnaire in ioi */
  saveOrUpdateGrantCallIOIQuestionnaire(): void {
    if (this.validateQuestionnaire() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._ioiService.saveOrUpdateGrantCallIOIQuestionnaire({
        'grantQuestionnaire': {
          'grantCallId': this.result.grantCall.grantCallId,
          'questionnaireId': this.selectedQuestionaire,
          'grantIOIQuestionnaireId': this.grantIOIQuestionnaireId,
          'updateUser': this._commonService.getCurrentUserDetail('userName')
        }
      }).subscribe((data: any) => {
        if (data !== null) {
          this.grantIOIQuestionnaireId = data.grantIOIQuestionnaireId;
          this.result.grantCall.grantCallIOIQuestionnaire = data;
          this.updateGrantCallStoreData();
          this.isSaving = false;
        }
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding IOI questionnaire failed. Please try again.');
        this.isSaving = false;
      },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'IOI Questionnaire added successfully.');
          this.isSaving = false;
        }));
    }
  }

  updateGrantCallStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setGrantCallData(this.result);
  }

  /** Shows a validation toast if we click the Save button without selecting a questionnaire. */
  validateQuestionnaire(): boolean {
    this.warningMessage.clear();
    if (this.selectedQuestionaire === 'null') {
      this.warningMessage.set('questionnaireWarningText', '* Please select a Questionnaire');
    }
    return (this.warningMessage.size === 0) ? true : false;
  }

  /* changes the questionnaire if there is a change in questinnaire*/
  questionnaireChange() {
    this.warningMessage.clear();
    this.questionnaireDetails.QUESTIONNAIRE_ID = this.getQuestionnaireIdForNumber(this.selectedQuestionaire);
    this.questionnaireDetails = Object.assign({}, this.questionnaireDetails);
  }

  getSaveEvent(event) {
    event ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Your IOI Questionnaire saved successfully.') :
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving IOI Questionnaire failed. Please try again.');
  }
}
