// Last updated by Greeshma on 19-05-2020
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { CommonDataService } from '../../../services/common-data.service';
import { compareDates, getDuration, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { ActivatedRoute, Router, GuardsCheckEnd } from '@angular/router';
import { OverviewService } from '../../../overview/overview.service';
import { CommonService } from '../../../../common/services/common.service';
import { AwardService } from '../../../services/award.service';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { getEndPointOptionsForSponsor, getEndPointOptionsForLeadUnit } from '../../../../common/services/end-point.config';

declare var $: any;

@Component({
  selector: 'app-award-details-edit',
  templateUrl: './award-details-edit.component.html',
  styleUrls: ['./award-details-edit.component.css']
})
export class AwardDetailsEditComponent implements OnInit, OnChanges, OnDestroy {

  @Input() result: any = {};
  @Input() map: any = {};
  @Input() lookupData: any = {};
  @Output() awardResults: EventEmitter<any> = new EventEmitter<any>();
  elasticSearchProposalOptions: any = {};
  leadUnitSearchOptions: any = {};
  sponsorSearchOptions: any = {};
  primeSponsorSearchOptions: any = {};
  keywordSearchOptions: any = {};
  piSearchOptions: any = {};
  warningMsgObj: any = {};
  award: any = {
    accountNumber: null,
    awardSequenceStatus: '',
    leadUnitNumber: null,
    sponsorCode: null,
    primeSponsorCode: null,
    title: '',
    awardStatus: {
      description: '',
      statusCode: ''
    },
    sponsor: { sponsorName: '' },
    leadUnit: { unitName: '' },
    awardTypeCode: null,
    activityTypeCode: null,
    accountTypeCode: null,
    statusCode: '',
    awardEffectiveDate: '',
    finalExpirationDate: null,
    beginDate: null,
    updateTimeStamp: '',
    workflowAwardStatusCode: '',
    awardWorkflowStatus: {},
    updateUser: ''
  };
  keywords: any = [];
  clearField: String;
  awardId: any;
  selectedKeyword: any;
  isAddKeywordToDatabase = false;
  clearKeywordField: String;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  isHighlighted = false;
  setFocusToElement = setFocusToElement;
  isExtensionEnabled = false;
  originalFinalExpirationDate = null;
  isEmployeeFlag = true;
  isNonEmployee;
  $subscriptions: Subscription[] = [];
  grantHttpOptions: any = {};
  clearGrantField;
  showGrantDetails = false;
  clearleadUnitField: String;
  isDateFieldChanged = false;
  isSaving = false;

  constructor(public _commonData: CommonDataService, public _commonService: CommonService,
    private _overviewService: OverviewService, private _activatedRoute: ActivatedRoute,
    private _awardService: AwardService, private _route: Router, private _elasticConfig: ElasticConfigService) { }

  ngOnInit() {
    this.map.clear();
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    if (!this.awardId) {
      this.award.statusCode = '3';
    }
    this.piSearchOptions = this._elasticConfig.getElasticForPerson();
    if (!this.result.awardResearchAreas) {
      this.result.awardResearchAreas = [];
    }
    this.setEndpointSearchOptions();
    this.isCondition();
    this.eventOnRouterNavigationEnd();
    if (!this.award.duration) {
     this.award.duration = '0 year(s) , 0 month(s) & 0 day(s)';
    }
    this.isProjectExtension();
    this.setGrantCallOptions();
    this.grantHttpOptions.defaultValue = this.setGrantCallDefaultValue();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * To trigger mandatory field on switching tabs
   * this event will fired by angular once guard check completes.
   * to enable subscription its used in onInit
   * refer https://angular.io/api/router/GuardsCheckEnd
   */
  eventOnRouterNavigationEnd() {
    this.$subscriptions.push(this._route.events.subscribe(event => {
      if (event instanceof GuardsCheckEnd) {
        this.checkMandatoryFilled();
      }
    }));
  }

  setGrantCallOptions() {
    this.grantHttpOptions = this._commonData.setHttpOptions('grantCallName',
      'grantCallId | grantCallName ', 'findGrantCall', '', { 'moduleCode': '1' });
  }

  grantCallSelectFunction(selectedGrantCall) {
    if (selectedGrantCall) {
        this.clearGrantField = 'false';
        this.award.grantHeaderId = selectedGrantCall.grantCallId;
        this.award.grantCallName = selectedGrantCall.grantCallName;
    } else {
      this.award.awardId ? this.unlinkGrantCallFromAward() : this.clearGrantCallData();
    }
    this._commonData.isAwardDataChange = true;
  }

  /**
   * for future purposes unlinking grantcall details like grant manager and overhead weiver
   */
  unlinkGrantCallFromAward() {
  if (!this.isSaving) {
    this.isSaving = true;
    this.$subscriptions.push(this._overviewService.unlinkGrantCallFromAward(
      { 'awardId': this.award.awardId, 'updateUser': this._commonService.getCurrentUserDetail('userName')})
      .subscribe(data => {
        this.isSaving = false;
        this.clearGrantCallData();
      }));
  }
  }
  clearGrantCallData() {
    this.result.award.grantHeaderId = null;
    this.result.award.grantCallName = null;
  }

  /**
   * Disable input fields during variation request project extension and set enpoint default value of
   * lead unit , sponsor and prime sponsor
   */
  isProjectExtension() {
    this.isExtensionEnabled = this.result.serviceRequest && this.result.serviceRequest.typeCode == '1' ? true : false;
    this.piSearchOptions.defaultValue = this.award.principalInvestigator;
    this.leadUnitSearchOptions.defaultValue = this.award.leadUnit.unitName;
    if (this.award.primeSponsorName) {
      this.primeSponsorSearchOptions.defaultValue = this.award.primeSponsorName;
    }
    this.sponsorSearchOptions.defaultValue = this.award.sponsorName ? this.award.sponsorName : '';
  }


  setGrantCallDefaultValue() {
    return this.result.award.grantCallName && this.result.award.grantHeaderId
           ? this.result.award.grantHeaderId + '-' + this.result.award.grantCallName
           : null;
  }

  ngOnChanges() {
    this.award = this.result.award || this.award;
    this.originalFinalExpirationDate = this.award.finalExpirationDate;
    this.sponsorSearchOptions = Object.assign({}, this.sponsorSearchOptions);
    this.sponsorSearchOptions.defaultValue = this.award.sponsorName ? this.award.sponsorName : '';
    this.grantHttpOptions = Object.assign({}, this.grantHttpOptions);
    this.grantHttpOptions.defaultValue = this.setGrantCallDefaultValue();
    if (this.award.awardId) {
      this.isHighlighted = this._commonData.checkSectionHightlightPermission('101');
    }
    if (this.award.principalInvestigator) {
      this.piSearchOptions = Object.assign({}, this.piSearchOptions);
      this.piSearchOptions.defaultValue = this.award.principalInvestigator;
    }
    if (this.award.leadUnit) {
      this.leadUnitSearchOptions = Object.assign({}, this.leadUnitSearchOptions);
      this.leadUnitSearchOptions.defaultValue = this.award.leadUnit.unitName;
    }
    if (this.award.primeSponsor) {
      this.primeSponsorSearchOptions = Object.assign({}, this.primeSponsorSearchOptions);
      this.primeSponsorSearchOptions.defaultValue = this.award.primeSponsorName;
    }
    if (this.award.awardKeywords) {
      this.keywords = this.award.awardKeywords;
    }
    this.getDuration();
    this.isProjectExtension();
  }

  /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
   *  This validation occurs before action(save or proceed).
  */
  dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
    this.map.delete(mappedString);
    if (!dateToCheck) {
      this.map.set(mappedString, validationMessage);
    }
  }

  setEndpointSearchOptions() {
    this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit();
    this.leadUnitSearchOptions.path = 'findDepartment';
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
    this.primeSponsorSearchOptions = getEndPointOptionsForSponsor();
    this.keywordSearchOptions = this._commonData.setSearchOptions('', 'description', 'findKeyWords');
  }
  /**
    * @param  {} value
    * To set person id and full name if an employee is selected from elastic search
    */
  setPIDetails(value) {
    this.leadUnitSearchOptions = Object.assign({}, this.leadUnitSearchOptions);
    if (value) {
      this.isNonEmployee = this.isEmployeeFlag ? false : true;
      this.award.principalInvestigatorId = this.isEmployeeFlag ? value.prncpl_id : value.rolodex_id;
      if (value.unit_number) {
        this.clearleadUnitField = new String('false');
        this.award.leadUnitNumber = value.unit_number;
        this.leadUnitSearchOptions.defaultValue = value.unit_name;
        this.map.delete('awardPi');
        this.map.delete('awardleadunit');
      }
    } else {
      this.award.principalInvestigatorId = null;
      this.clearLeadUnitField();
    }
  }
  isCondition() {
    this.$subscriptions.push(this._awardService.isMandatory.subscribe(() => {
      const condition = this.checkMandatoryFilled();
      this._awardService.isTrue = condition;
      return condition;
    }));
  }

  leadUnitChangeFunction(result) {
    if (result) {
      this.clearleadUnitField =  new String('false');
      this.map.delete('awardleadunit');
      this.award.leadUnitNumber = result.unitNumber;
      this.award.leadUnit = result;
    } else {
      this.award.leadUnitNumber = '';
    }
    this._commonData.isAwardDataChange = true;
  }

  sponsorChangeFunction(result) {
    if (result) {
      this.award.sponsorCode = result.sponsorCode;
      this.award.sponsor = result;
    } else {
      this.award.sponsorCode = '';
      this.award.sponsor = null;
    }
    this._commonData.isAwardDataChange = true;
  }

  primeSponsorChangeFunction(result) {
    if (result) {
      this.award.primeSponsorCode = result.sponsorCode;
      this.award.primeSponsor = result;
    } else {
      this.award.primeSponsorCode = null;
      this.award.primeSponsor = null;
    }
    this._commonData.isAwardDataChange = true;
  }

  /**
* restrict input field to numbers and show validation.
* @param event
*/
  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\.\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  checkMandatoryFilled() {
    this.awardValidation();
    const DATES = this.dateValidation(this.award.beginDate, this.award.finalExpirationDate);
    this.checkDateValidation(DATES);
    if (this.map.size > 0 || DATES === false) {
      return false;
    }
    return true;
  }
  checkDateValidation(DATES) {
    if (DATES) {
      this.warningMsgObj.dateWarningText = null;
    } else {
      this.warningMsgObj.dateWarningText = 'Please select a Final Expiration Date after Award Effective Date';
    }
  }

  awardValidation() {
    this.map.clear();
    if (!this.award.activityTypeCode || this.award.activityTypeCode === 'null') {
      this.map.set('activitypecode', 'activity');
    }
    if (!this.award.statusCode || this.award.statusCode === 'null') {
      this.map.set('statuscode', 'status');
    }
    if (!this.award.title) {
      this.map.set('awardtitle', 'title');
    }
    if (!this.award.awardId && !this.award.principalInvestigatorId) {
      this.map.set('awardPi', 'PI');
    }
    if (!this.award.awardId && !this.award.leadUnitNumber) {
      this.leadUnitSearchOptions.errorMessage = 'Please select a Lead Unit.';
      this.map.set('awardleadunit', 'leadunit');
    }
    if (!this.award.sponsorCode) {
      this.sponsorSearchOptions.errorMessage = 'Please select a Sponsor.';
      this.map.set('awardsponsorcode', 'sponsor');
    }
    if (!this.award.beginDate || this.award.beginDate === 'null') {
      this.map.set('awardBeginDate', 'startDate');
    }
    if (!this.award.finalExpirationDate || this.award.finalExpirationDate === 'null') {
      this.map.set('awardEndDate', 'EndDate');
    }
  }

  dateValidation(startDate, endDate) {
    this.warningMsgObj.specialReviewdateWarningMsg = null;
    if (endDate != null) {
      return (compareDates(startDate, endDate) === 1) ? false : true;
    }
    return true;
  }
  saveAward() {
    if (this.checkMandatoryFilled()) {
      this.updateAwardStatus(this.award.statusCode);
      if (this.award.beginDate) {
        this.award.beginDate = parseDateWithoutTimestamp(this.award.beginDate);
      }
      this.award.awardKeywords = this.keywords;
      if (this.award.finalExpirationDate) {
        this.award.finalExpirationDate = parseDateWithoutTimestamp(this.award.finalExpirationDate);
      }
      if (this.award.awardEffectiveDate) {
        this.award.awardEffectiveDate = parseDateWithoutTimestamp(this.award.awardEffectiveDate);
      }
      this.awardResults.emit({ 'award': this.award, 'nonEmployee': this.isNonEmployee });
    }
  }
  updateAwardStatus(awardStatus) {
    const statusObject = this.lookupData.awardStatus.find(el => el.statusCode === awardStatus);
    if (statusObject) {
      this.award.awardStatus.description = statusObject.description;
      this.award.awardStatus.statusCode = statusObject.statusCode;
    }
  }

  /* if keyword is selected from search results,that keyword object and its corresponding code is set to
  'scienceKeyword' and 'scienceKeywordCode' in keyword object and pushes to keywords array.
  if keyword which is added is a user defined one,then that keyword is set to 'keyword'in keyword object and
   pushes to keywords array. */
  keywordSelectFunction(event) {
    if (event) {
      this.selectedKeyword = event.description;
      this.checkDuplicateKeyword();
      if (!this.map.get('keyword')) {
        this.setKeywordObject(event);
      }
      this.clearKeywordField = new String('true');
    } else {
      this.setKeywordObject(event);
    }
    this.clearKeywordSearchBox();
    this._commonData.isAwardDataChange = true;
  }

  /* sets keyword object */
  setKeywordObject(event) {
    const keywordObject: any = {};
    keywordObject.scienceKeyword = event ? event : null;
    keywordObject.scienceKeywordCode = event ? event.code : null;
    keywordObject.keyword = event ? null : this.selectedKeyword;
    keywordObject.updateTimestamp = new Date().getTime();
    keywordObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    if (keywordObject.scienceKeywordCode) {
      this.keywords.push(keywordObject);
    }
  }

  /* to show add button for adding new keyword while search result of keyword is 'No results' */
  showAddKeywordFunction(event) {
    this.selectedKeyword = event.searchString;
  }

  /* checks for duplicate keyword in the list of keywords added.if duplication is found in user defined
  keywords which is added to this award,a modal is shown with a message
  'The keyword is already added in this award.Do you want to add this keyword to database for future use?'.
  if duplication is found in keywords selected from search results,a warning message 'keyword already added' is shown.
  if there is no duplication and user wands to add a new keyword which is not in database, a modal is shown with message
  'Do you want to add the keyword to database for future use?'. */
  checkDuplicateKeyword() {
    let dupKeywordObject = null;
    this.map.set('keyword', null);
    if (this.selectedKeyword) {
      if (this.keywords && this.keywords.length) {
        dupKeywordObject = this.keywords.find(dupKeyword =>
          (dupKeyword.scienceKeyword != null && dupKeyword.scienceKeyword.description.toLowerCase()
            === this.selectedKeyword.toLowerCase()) ||
          (dupKeyword.keyword != null && dupKeyword.keyword.toLowerCase() === this.selectedKeyword.toLowerCase()));
      }
      if (dupKeywordObject && (dupKeywordObject.scienceKeyword ||
        !this.map.get('keyword'))) {
        this.map.set('keyword', '* Keyword already added');
        this.clearKeywordField = new String('true');
      }
    } else {
      this.map.set('keyword', '* Add any keyword');
      this.clearKeywordField = new String('true');
    }
  }

  /* deletes keyword */
  deleteKeyword(id, index) {
    this.map.set('keyword', null);
    if (this.award.awardId) {
      this.$subscriptions.push(this._overviewService.deleteProposalKeyword({
        'awardId': this.award.awardId, 'awardKeywordId': id,
        'updateUser': this._commonService.getCurrentUserDetail('userName')
      }).subscribe(success => {
        this.actionsAfterKeywordDeletion(index);
      }));
    } else {
      this.keywords.splice(index, 1);
    } 
  }

  /**
   * if there is no duplicate warning, keyword is spliced from the array
   * @param  {} index
   * @param  {} data
   */
  actionsAfterKeywordDeletion(index) {
      this.keywords.splice(index, 1);
      this.selectedKeyword = '';
  }

  /* adds user defined keyword to database and delete the same keyword added in this particular award */
  addKeywordToDatabase(event) {
    if (event) {
      this.selectedKeyword = event.searchString;
      if(this.selectedKeyword){
        this.selectedKeyword = this.selectedKeyword.trim();
      }
      this.$subscriptions.push(this._overviewService.addScienceKeyword({
        'scienceKeyword': this.selectedKeyword,
        'userName': this._commonService.getCurrentUserDetail('userName')
      }).subscribe(data => {
        this.isAddKeywordToDatabase = true;
        this.checkKeywordExistInDatabase(data);
        this.clearKeywordField = new String('true');
        this.selectedKeyword = null;
      }));
    }
  }

  /* if keyword doesn't exist in database (data contains code), keyword is added to the proposal. Otherwise warning
   such as 'Keyword already exist in database' is shown */
   checkKeywordExistInDatabase(data) {
    if (data && data.code) {
      this.keywordSelectFunction(data);
    } else {
      this.map.set('keyword', '* Keyword already exist in database');
      this.isAddKeywordToDatabase = false;
    }
  }

  /* clears keyword search box */
  clearKeywordSearchBox() {
    this.isAddKeywordToDatabase = false;
    this.selectedKeyword = null;
  }

  getSearchValue(event) {
    this.selectedKeyword = event;
  }

  /* comparing award end and start dates */
  getDuration() {
    if (this.award.beginDate != null && this.award.finalExpirationDate != null &&
      (compareDates(this.award.beginDate, this.award.finalExpirationDate, 'dateObject', 'dateObject') === -1 ||
        compareDates(this.award.beginDate, this.award.finalExpirationDate, 'dateObject', 'dateObject') === 0)) {
      this.differenceBetweenDates(this.award.beginDate, this.award.finalExpirationDate);
    }
    const DATES = this.dateValidation(this.award.beginDate, this.award.finalExpirationDate);
    this.checkDateValidation(DATES);
  }
  /* finds duration between start date and end date */
  differenceBetweenDates(startDate, endDate) {
    const DATEOBJ = getDuration(startDate, endDate);
    this.award.duration = DATEOBJ.durInYears + ' year(s), ' + DATEOBJ.durInMonths + ' month(s) & ' + DATEOBJ.durInDays + ' day(s)';
  }

 /* warning message triggers only when budget is created
  */
  checkAwardDateExtension(): void {
    if ((this.result.isBudgetCreated) && (this.award.beginDate || this.award.finalExpirationDate)) {
        document.getElementById('award-date-extension-modal-button').click();
    }
  }

  /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
  changeMemberType() {
    this.award.principalInvestigatorId = null;
    this.piSearchOptions.defaultValue = '';
    this.clearLeadUnitField();
    (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
  }

  clearLeadUnitField() {
    this.award.leadUnitNumber = null;
    this.leadUnitSearchOptions.defaultValue = '';
    this.clearleadUnitField = new String('true');
  }

  /**setElasticPersonOption - Set Elastic search option for Fibi Person */
  setElasticPersonOption() {
    this.piSearchOptions = this._elasticConfig.getElasticForPerson();
  }
  /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
  setElasticRolodexOption() {
    this.piSearchOptions = this._elasticConfig.getElasticForRolodex();
  }
   /**
   * to unlink grantcall when the search box is empty
   * @param  {} event
   */
  emptyValidationKeyup(event) {
    if (!event.target.value) {
      this.unlinkGrantCallFromAward();
    }
  }

  setGrantDetailsValue(isShowModal) {
    this.showGrantDetails = isShowModal;
  }
}
