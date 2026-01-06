import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';

@Component({
  selector: 'app-questionnaire',
  template: `<div id="agreement-common-questionnaire"><app-view-questionnaire-list
  [configuration]="configuration" (QuestionnaireSaveEvent)="getSaveEvent($event)"
  (QuestionnaireEditEvent)="markQuestionnaireAsEdited($event)"
  [externalSaveEvent] = '_autoSaveService.autoSaveTrigger$'
  [isShowSave] = false [isShowCollapse]=true> </app-view-questionnaire-list></div>`
})
export class QuestionnaireComponent implements OnChanges {
  @Input() result: any = {};

  constructor(private _route: ActivatedRoute, private _commonDataService: AgreementCommonDataService,
    public _commonService: CommonService, public _autoSaveService: AutoSaveService) { }
  configuration: any = {
    moduleItemCode: 13,
    moduleSubitemCodes: [0],
    moduleItemKey: '',
    moduleSubItemKey: 0,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    enableViewMode: [],
    isEnableVersion: true,
    isChangeWarning: true
  };
  isShowQuestionnaire = true;

  ngOnChanges() {
    this.checkQuestionnaireView();
  }

  checkQuestionnaireView() {
    const isEditMode = !this._commonDataService.getSectionEditPermission('103');
    if (this.configuration.enableViewMode !== isEditMode ||
      this.configuration.moduleItemKey !== this.result.agreementHeader.agreementRequestId ||
      this.configuration.moduleSubitemCodes[0] !== parseInt(this.result.agreementHeader.agreementTypeCode, 10)) {
      this.setConfigurationObject();
    }
  }

  /**
   * this.configuration.moduleSubitemCodes  -> contains array of questionnaires in edit mode.
   * this.configuration.enableViewMode  -> contains array of questionnaires in view mode.
   */
  setConfigurationObject() {
    this.configuration.moduleItemKey = this.result.agreementHeader.agreementRequestId;
    this.configuration.enableViewMode = this.setViewModeArray();
    this.configuration.moduleSubitemCodes = this.setEditModeArray();
    this.configuration = JSON.parse(JSON.stringify(this.configuration));
  }

  setViewModeArray() {
    const isEditMode = this._commonDataService.getSectionEditPermission('103');
    if (isEditMode) {
      const VIEW_ARRAY = JSON.parse(JSON.stringify(this.getTypeCodesAsNumbers()));
      this.removeActiveTypeCode(VIEW_ARRAY);
      return VIEW_ARRAY.length ? VIEW_ARRAY : false;
    } else {
      return true;
    }
  }

  /** converts and return string of type code array into integer type code array */
  getTypeCodesAsNumbers() {
    return this.result.agreementTypeCodes.map((typeCode) => parseInt(typeCode, 10));
  }

  /** agreementStatusCode = '1'  -> 'in progress'.
   * Sets the moduleSubitemCodes array with the value of active subitem code if the agreement
   * status is 'in Progress' otherwise In questionnaires listing array,the questionnaires which are editable
   * will be listing at the last of list and view modes will come at he front.
   * If the agreement status is 'in Progress', the agreementTypeCodes array is always empty.
   */
  setEditModeArray() {
    if (this.result.agreementHeader.agreementStatus.agreementStatusCode === '1') {
      return [parseInt(this.result.agreementHeader.agreementTypeCode, 10)];
    } else {
      this.configuration.moduleSubitemCodes = JSON.parse(JSON.stringify(this.getTypeCodesAsNumbers()));
      this.removeActiveTypeCode(this.configuration.moduleSubitemCodes);
      this.configuration.moduleSubitemCodes.push(parseInt(this.result.agreementHeader.agreementTypeCode, 10));
      return this.configuration.moduleSubitemCodes;
    }
  }

  /** Finds the index of current agreement type code and removes that index from enableViewMode array
   * results in setting questionnaire of current type as edit mode and rest will be in view mode.
   */
  removeActiveTypeCode(array: any) {
    const index = array.indexOf(parseInt(this.result.agreementHeader.agreementTypeCode, 10));
    return index !== -1 ? array.splice(index, 1) : array;
  }

  getSaveEvent(event) {
    this.setUnsavedChanges(false);
  }

  markQuestionnaireAsEdited(changeStatus: boolean): void {
    this._commonDataService.isAgreementDataChange = changeStatus;
    this.setUnsavedChanges(changeStatus);
  }

  setUnsavedChanges(flag: boolean) {
    this._autoSaveService.setUnsavedChanges('Questionnaire', 'agreement-common-questionnaire', flag, true);
  }
}
