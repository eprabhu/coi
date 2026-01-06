import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CustomElementService } from './custom-element.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT } from '../../app-constants';
import { Observable, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import {
  getEndPointOptionsForLeadUnit, getEndPointOptionsForSponsor, getEndPointOptionsForDepartment,
  getEndPointOptionsForOrganization, getEndPointOptionsForCountry, getEndPointOptionsForGrandCode,
  getEndPointOptionsForProfitCentre, getEndPointOptionsForFundCentre, getEndPointOptionsForCostCentre,
   getEndPointOptionsForMappedClaimTemplate
} from '../../common/services/end-point.config';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { DatePipe } from '@angular/common';

class CustomAnswer {
  columnId = null;
  customDataElementsId = null;
  customDataId = null;
  description = null;
  moduleItemCode = null;
  moduleItemKey = null;
  moduleSubItemCode = null;
  moduleSubItemKey = null;
  updateTimestamp = null;
  updateUser = null;
  value = null;
  versionNumber = null;
}
@Component({
  selector: 'app-custom-element',
  templateUrl: './custom-element.component.html',
  styleUrls: ['./custom-element.component.css']
})
export class CustomElementComponent implements OnInit, OnInit, OnDestroy {

  @Input() moduleItemKey;
  @Input() moduleCode;
  @Input() viewMode;
  @Output() dataChangeEvent = new EventEmitter<boolean>();
  @Input() externalSaveEvent: Observable<any>;
  @Input() isShowSave = true;
  @Input() isShowCollapse = false;
  customElements: any = [];
  result: any = {};
  isLength = false;
  isType = false;
  isEmpty = false;
  isCheckBoxEmpty = false;
  isRadioEmpty = false;
  radioEmptyFlag;
  checkEmptyFlag;
  isValueEmpty: any = [];
  checkEmpty: any = [];
  radioEmpty: any = [];
  validationId: any = [];
  lengthValidationId: number;
  numberValidationId: number;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  $subscriptions: Subscription[] = [];
  elasticSearchOptions: any = {};
  endPointSearchOptions: any = {};
  setFocusToElement = setFocusToElement;
  parseDateWithoutTimestamp = parseDateWithoutTimestamp;
  isSaving = false;
  isDataChange = false;
  isShowOtherInfo = true;
  collapseViewMore = {};
  selectedCheckBoxValues = [];

  searchObjectMapping = {
    'fibiperson': 'prncpl_id',
    'awardfibi': 'award_number',
    'fibiproposal': 'proposal_id',
    'instituteproposal': 'proposal_id',
    'grantcall_elastic': 'grant_header_id',
    'sponsorName': 'sponsorCode',
    'unitName': 'unitNumber',
    'fibiOrganization': 'organizationId',
    'fibiCountry': 'countryCode',
    'fibiDepartment': 'unitNumber',
    'grantCodeName': 'grantCode',
    'costCenterName': 'costCenterCode',
    'fundCenterName': 'fundCenterCode',
    'profitCenterName': 'profitCenterCode',
    'claimTemplateName': 'claimTemplateCode'
  };

  constructor(private _customService: CustomElementService, public _commonService: CommonService,
    private _elasticConfig: ElasticConfigService, private _autoSaveService: AutoSaveService) { }

  ngOnInit() {
    this.$subscriptions.push(this._customService.getCustomData(this.moduleCode, this.moduleItemKey)
      .subscribe(data => {
        this.result = data || [];
        if (this.result) {
          this.customElements = this.result.customElements;
          this.setDefaultValues(this.customElements);
        }
      }));
      this.autoSaveEvent();
  }

  collapseViewMoreOption(id: number, flag: boolean): void {
    this.collapseViewMore[id] = !flag;
}

  /**
 * @param  {} customElementList
 * sets the default value if any based on fieldType.
 */
  setDefaultValues(customElementList) {
    customElementList.forEach(element => {
      switch (element.filterType) {
        case 'Elastic Search': this.setElasticOptions(element); break;
        case 'Autosuggest': this.setEndpointOptions(element); break;
        default: element.answers.findIndex(item => item.value = item.value ? item.value : element.defaultValue);
      }
    });
  }

   /**
  * this Event subscribes to the auto save trigger generated on save click on top basically
  * what happens is when a save click happen this will let this component know when
  * user click the general save button.
  */
    autoSaveEvent() {
      if (this.externalSaveEvent) {
        this.$subscriptions.push(this.externalSaveEvent.subscribe(_event => this.isDataChange && this.saveCustomData()));
      }
    }

  setElasticOptions(object) {
    switch (object.lookupArgument) {
      case 'fibiproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
        this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
        this.elasticSearchOptions[object.columnName].contextField =
             object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
        break;
      case 'fibiperson': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForPerson();
        this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
        this.elasticSearchOptions[object.columnName].contextField =
             object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
        break;
      case 'awardfibi': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForAward();
        this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
        this.elasticSearchOptions[object.columnName].contextField =
             object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
        break;
      case 'instituteproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
        this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
        this.elasticSearchOptions[object.columnName].contextField =
             object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
        break;
      case 'grantcall_elastic': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForGrantCall();
        this.elasticSearchOptions[object.columnName].contextField =
             object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
        this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        break;
      default: break;
    }
  }

  setEndpointOptions(object) {
    switch (object.lookupArgument) {
      case 'sponsorName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForSponsor();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'unitName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForLeadUnit();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'fibiDepartment': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForDepartment();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'fibiOrganization': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForOrganization();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'fibiCountry': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCountry();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'profitCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForProfitCentre();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'grantCodeName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForGrandCode();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'costCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCostCentre();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'fundCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForFundCentre();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      case 'claimTemplateName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForMappedClaimTemplate();
        this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : null;
        this.endPointSearchOptions[object.columnName].contextField =
             object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
        break;
      default: break;
    }
  }
  setSearchFilterValue(data, answer, list) {
    if (data) {
      switch (list.filterType) {
        case 'Autosuggest':
          answer.value = data[this.searchObjectMapping[list.lookupArgument]] ? data[this.searchObjectMapping[list.lookupArgument]] : null;
          answer.description = data[list.defaultValue];
          break;
        case 'Elastic Search':
          answer.description = data[list.defaultValue];
          answer.value = data[this.searchObjectMapping[list.lookupArgument]] ? data[this.searchObjectMapping[list.lookupArgument]] : null;
          break;
      }
    } else {
      answer.value = '';
      answer.description = '';
    }
    this.emitDataChange();
  }

  onLookupSelect(data, answer) {
    answer.value = data.length ? data[0].code : '';
    answer.description = data.length ? data[0].description : '';
    this.emitDataChange();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} customField
   * @param  {} event
   * @param  {} list
   * @param  {} id
   * check null,length and type validations on ngmodel chanage
   */
  checkValidation(customField, event, list, id) {
    if (event.target.value.length < list.dataLength) {
      this.isLength = false;
    } else {
      this.lengthValidationId = id;
      this.isLength = true;
      customField.value = event.target.value = event.target.value.slice(0, list.dataLength);
    }
    if (list.filterType === 'Number' && event.keyCode >= 65 && event.keyCode <= 90) {
      this.isType = true;
      this.numberValidationId = id;
      customField.value = event.target.value.slice(0, 0);
    } else {
      this.isType = false;
    }
  }
  /**
   * check mandatory validation.
   *  datatypecription and corresponding type codes are listed below.
   * 1-String, 2-Number, 3-Date, 4-Check Box, 5-Radio Button, 6-Elastic Search, 7-End Point Search, 8-System Lookup, 9-User Lookup
   */
  checkMandatory() {
    this.checkEmptyFlag = false;
    this.radioEmptyFlag = false;
    this.customElements.forEach((field, index) => {
      if (field.filterType !== 'Radio Button' && field.filterType !== 'Check Box') {
        const INDEX = field.answers.findIndex(item => (item.value === null || item.value === ''));
        if (INDEX >= 0 && field.isRequired === 'Y') {
          this.isValueEmpty[index] = false;
          this.validationId[index] = index;
        } else {
          this.isValueEmpty[index] = true;
        }
      }
      this.checkEmptyFlag = false;
      this.radioEmptyFlag = false;
      if (field.filterType === 'Check Box' && field.isRequired === 'Y') {
        this.checkEmptyFlag = field.answers.find(item => item.description) ? false : true;
      }
      if (this.checkEmptyFlag === true) {
        this.checkEmpty[index] = false;
        this.validationId[index] = index;
      } else {
        this.checkEmpty[index] = true;
      }
      if (field.filterType === 'Radio Button' && field.isRequired === 'Y') {
        this.radioEmptyFlag = field.answers.find(item => item.value !== null && item.value !== '') ? false : true;
      }
      if (this.radioEmptyFlag === true) {
        this.radioEmpty[index] = false;
        this.validationId[index] = index;
      } else {
        this.radioEmpty[index] = true;
      }
    });
  }

  saveCustomData() {
    this.checkMandatory();
    if ((this.isValueEmpty.filter(item => item === false).length !== 0) ||
      (this.checkEmpty.filter(check => check === false).length !== 0) || (this.radioEmpty.filter(radio => radio === false).length !== 0)) {
      this.isEmpty = true;
    } else {
      this.isEmpty = false;
    }
    if (this.isEmpty === false && this.checkEmptyFlag === false && this.radioEmptyFlag === false) {
      this.isLength = false;
      const CUSTOMDATA: any = {};
      CUSTOMDATA.updateTimestamp = new Date().getTime();
      CUSTOMDATA.moduleItemKey = this.moduleItemKey;
      CUSTOMDATA.moduleCode = this.moduleCode;
      CUSTOMDATA.customElements = this.customElements;
      if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(this._customService.saveCustomData(CUSTOMDATA)
          .subscribe(data => {
            this.result = data || [];
            if (this.result !== null) {
              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Other Information(s) saved successfully.');
              this.customElements = this.result.customElements;
              this.isRadioEmpty = true;
              this.isDataChange = false;
              this.changeCheckBoxValues();
              this.dataChangeEvent.emit(false);
            }
            this.isSaving = false;
          }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Other Information(s) failed. Please try again.');
                this.isSaving = false;
            }));
      }
    } else {
        if (this.externalSaveEvent) {
            this._autoSaveService.errorEvent(
                { name: 'Other Information', documentId: 'custom-element-body', type: 'VALIDATION' });
        }
    }
  }

  emitDataChange() {
    if (!this.isDataChange) {
      this.isDataChange = true;
      this.dataChangeEvent.emit(this.isDataChange);
    }
  }

  /**
   * here checked answers are pushed into answers array
   * and unchecked answers value and description are set to null
   * if a checked value is unchecked and checked without saving in between
   * save request will have 2 objects one with customDataId and value & desc removed(for delete),
   * other with value in description & value with customDataId null for insert.
   * We are not using same id in this case to avoid complex code logic.
   */
  setAnswerForCheckBox(list: any, event: boolean, option: any) {
    if (event) {
        const CUSTOM_ANSWER = new CustomAnswer();
        CUSTOM_ANSWER.value = option.customDataOptionId;
        CUSTOM_ANSWER.description = option.optionName;
        list.answers.push(CUSTOM_ANSWER);
    } else {
     this.removeAnswer(list, option);
    }
  }

  private removeAnswer(list: any, option: any) {
    const ANSWER = list.answers.find(ele => ele.value === option.customDataOptionId);
    ANSWER.description = null;
    ANSWER.value = null;
  }

  private changeCheckBoxValues() {
    this.customElements.forEach(customElement => {
      if (customElement.filterType === 'Check Box') {
         customElement.answers = customElement.answers.filter(ele => ele.customDataId != null);
      }
    });
  }

  checkIsSelected(answers: Array<any>, optionId: string) {
    return answers.find(ele => ele.value === optionId) ? true : false;
  }

}
