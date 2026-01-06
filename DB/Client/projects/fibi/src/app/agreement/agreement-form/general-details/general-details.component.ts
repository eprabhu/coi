import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { openInNewTab, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { AgreementService } from '../../agreement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';


@Component({
  selector: 'app-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.css'],
})
export class GeneralDetailsComponent implements OnInit, OnChanges, OnDestroy {

  @Output() updateAgreementData = new EventEmitter();

  result: any = {};
  map = new Map();
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  agreementTypeList: any = [];
  clearLeadUnitField;
  unitHttpOptions: any = {};
  isGeneralDetailsFormChanged = true;
  fieldsModeArray: any = [];
  currencySymbol;
  isAgreementAdministrator = false;
  istypeEditable = false;
  isApplicationAdministrator = false;
  negotiationLookup: any;
  moduleCode: any = '';
  elasticSearchOption: any = {};
  clearField: String;
  agreementAssociationDetail: any = {};
  agreementRequestId: string;
  placeHolderValue: string;
  moduleArray: any = [];
  deleteModuleItemKey: any = {};
  deleteModuleCode: any;
  acType: string;
  deleteIndex: any;
  isViewMode = false;
  isPI: boolean;
  moduleItemKey: any;
  moduleAssociationObject: any = {};
  moduleAssociationObjectArray: any = [];
  isAlreadyLinked: boolean;
  isShowProjectAssociations = true;
  isGroupAdministrator: any;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(public _commonService: CommonService, private _agreementService: AgreementService,
    private _router: Router, public _commonAgreementData: AgreementCommonDataService,
    private _autoSaveService: AutoSaveService, private _route: ActivatedRoute,
    private _elasticService: ElasticConfigService) { }

  ngOnInit() {
    this.unitHttpOptions = getEndPointOptionsForDepartment();
    this.getAgreementGeneralData();
    this.autoSaveEvent();
    this.elasticSearchOption.defaultValue = '';
    this.result.agreementHeader.currencyCode = !this.result.agreementHeader.currencyCode ? 'USD'
      : this.result.agreementHeader.currencyCode;
    this.setCurrencySymbol();
    if (this._route.snapshot.queryParamMap.get('triageId')) {
      this.agreementValidation();
    }
  }

  ngOnChanges() { }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data && !this._commonAgreementData.isAgreementDataChange) {
        this.result = JSON.parse(JSON.stringify(data));
        this.onInit();
        this.moduleArray = this.result.agreementAssociationDetails || [];
        if (this.result.agreementAssociationDetails) { this.checkForAccountNumber(this.result.agreementAssociationDetails); }
        this.isViewMode = this.checkForviewMode();
        this.updateDateValues();
      }
    }));
  }

  /**  Setting initial value for various fields. */
  onInit() {
    this.getPermissions();
    this.getAgreementTypeList(this.result.agreementHeader.categoryCode);
    if (this.result.agreementHeader.agreementRequestId) {
      this.setCurrencySymbol();
    } else if (this._route.snapshot.queryParamMap.get('typeCode')) {
      this.result.agreementHeader.categoryCode = this._route.snapshot.queryParamMap.get('categoryCode');
      this.getAgreementTypeList(this.result.agreementHeader.categoryCode);
      this.result.agreementHeader.agreementTypeCode = this._route.snapshot.queryParamMap.get('typeCode');
    }
    this.unitHttpOptions.defaultValue = this.result.agreementHeader.unit ?
        concatUnitNumberAndUnitName(this.result.agreementHeader.unit.unitNumber, this.result.agreementHeader.unit.unitName) : null;
    this.setDatesFromTimeStamp();
    this.checkFieldsEditable();
  }

  /**
  * this Event subscribes to the auto save trigger generated on save click on top basically
  * what happens is when a save click happen this will let this component know when
  * user click the general save button.
  */
  autoSaveEvent() {
    this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(event => this.saveAgreement()));
  }

  /** Checks empty negotiation basic details validation */
  agreementValidation() {
    this.map.clear();
    if (!this.result.agreementHeader.agreementStatusCode ||
      this.result.agreementHeader.agreementStatusCode === 'null') {
      this.map.set('status', '* Please select Agreement Status');
    }
    if (!this.result.agreementHeader.agreementTypeCode ||
      this.result.agreementHeader.agreementTypeCode === 'null') {
      this.map.set('type', '* Please select Agreement Type');
    }
    if (!this.result.agreementHeader.categoryCode ||
      this.result.agreementHeader.categoryCode === 'null') {
      this.map.set('category', '* Please select Agreement Category');
    }
    if (!this.result.agreementHeader.title) {
      this.map.set('title', '* Please provide a Title');
    }
    if (!this.result.agreementHeader.startDate) {
      this.map.set('startDate', '* Please provide a Start Date');
    }
    if (!this.result.agreementHeader.endDate) {
      this.map.set('endDate', '* Please provide an End Date');
    }
    if (!this.result.agreementHeader.unitNumber) {
      this.map.set('leadUnit', '* Please provide a Lead Unit');
    }
    this.dateValidation();
  }

  /** Validates start date and end date */
  dateValidation() {
    if (this.result.agreementHeader.startDate && this.result.agreementHeader.endDate) {
      const START_DATE = new Date(this.result.agreementHeader.startDate);
      const END_DATE = new Date(this.result.agreementHeader.endDate);
      this.map.delete('checkendDate');
      if (START_DATE > END_DATE) {
        this.map.set('checkendDate', 'Please select the End Date after Start Date');
      }
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  setDatesFromTimeStamp() {
    this.result.agreementHeader.startDate = getDateObjectFromTimeStamp(this.result.agreementHeader.startDate);
    this.result.agreementHeader.endDate = getDateObjectFromTimeStamp(this.result.agreementHeader.endDate);
  }

  /** Returns true if the gives right is in the list of available rights. */
  async getPermissions() {
    this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
    this.isGroupAdministrator = await this._commonService.checkPermissionAllowed('VIEW_ADMIN_GROUP_AGREEMENT');
    this.isShowProjectAssociations =  this.checkForProjectAssociation();
    this.istypeEditable = this.checkTypeEditable();
  }

  checkForProjectAssociation() {
    return ((!this.isAgreementAdministrator && !this.isGroupAdministrator) &&
      this._route.snapshot.queryParamMap.get('triageId') &&
      this.moduleArray.length === 0) ? false : true
  }

  checkTypeEditable() {
    return this.isAgreementAdministrator || this.isGroupAdministrator || !this._commonService.isTriageQuestionnaireRequired;
  }

  /** Sets currency symbol from selected currency format */
  setCurrencySymbol() {
    if (this.result.agreementHeader.currencyCode) {
      this.currencySymbol = this.getCurrencyObject().currencySymbol;
    }
  }

  /**
   * genericInfo section code-100
   * Field Codes =>Title - 1000,Category- 1001,Type of Agreement-1002,Start Date-1003,End Date-1004
   * Lead Unit-1005,Currency-1006,Contract Value-1007,Contract Amount In Words-1008,Description-1009.
   * getSectionEditPermission() returns true for edit mode, otherwise view mode.
   * For any new field, It should be added manually in the FIELDS array.
   */
  checkFieldsEditable() {
    this.fieldsModeArray = [];
    const FIELDS = ['1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009'];
    FIELDS.forEach(element => {
      this.fieldsModeArray.push(!this._commonAgreementData.getSectionEditPermission('100', element));
    });
  }

  /** Returns currency object of selected currency format */
  getCurrencyObject() {
    return this.result.currencies.find(currency => currency.currencyCode === this.result.agreementHeader.currencyCode);
  }

  /**
   * @param  {} event
   * @param  {} data
   * limit the comment when comment length reaches 4000 characters
   */
  limitComment(event, data) {
    if (event.target.value.length > '4000') {
      data = event.target.value = event.target.value.slice(0, 4000);
    }
  }

  checkForTypeChange() {
    this.result.isTypeChanged = (this.isApplicationAdministrator && this.checkForAgreementStatus()) ? true : false;
  }

  /** agreementStatusCode === '1' -> In progress*/
  checkForAgreementStatus() {
    return this.result.agreementHeader.agreementStatus.agreementStatusCode !== '1' ? true : false;
  }

  /** Saves the agreement general details and navigates to agreement form. */
  saveAgreement() {
    this.checkForTypeChange();
    if (this.isGeneralDetailsFormChanged) {
      if (this.checkMandatoryFilled()) {
        this._commonAgreementData.isAgreementDataChange = false;
        this.isGeneralDetailsFormChanged = false;
        this.setAgreementObject();
        this.proceedToAgreementForm();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement created successfully.')
      } else {
        this._autoSaveService.errorEvent(
          { name: 'General Info', documentId: 'agreement-basic-details', type: 'VALIDATION' });
      }
    }
  }

  proceedToAgreementForm() {
    this.isPI = this._route.snapshot.queryParamMap.get('triageId') ? true : false;
    this.$subscriptions.push(this._agreementService.saveAgreementDetails
      (this.result.agreementHeader, this.result.isTypeChanged, this.moduleAssociationObjectArray, this.isPI)
      .subscribe((data: any) => {
        this.setCommonDateValues(data);
        this.setupAgreementStoreData(data);
        this.loadAgreementNegotiation(data);
        this.isPI = false;
        this.moduleAssociationObjectArray = [];
        this._commonAgreementData.isAgreementDataChange = false;
        this.isGeneralDetailsFormChanged = false;
        this.moduleArray = data.agreementAssociationDetails;
        this.setUnSaveChanges(false);
        this._router.navigate(['fibi/agreement/form'], { queryParams: { agreementId: data.agreementHeader.agreementRequestId } });
      }, err => {
        if (!this.result.agreementHeader.agreementRequestId) {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Create Agreement action failed. Please try again.');
        }
        this._autoSaveService.errorEvent(
          { name: 'General Info', documentId: 'agreement-basic-details', type: 'API' });
      }));
  }

  /**
   * set nogotiation lookup values
   * @param data
   */
  loadAgreementNegotiation(data) {
    this.$subscriptions.push(this._agreementService.loadAgreementNegotiation(
      {
        'agreementRequestId': data.agreementHeader.agreementRequestId,
        'negotiationId': data.agreementHeader.negotiationId
      }).subscribe(
        (negotiationData: any) => {
          this.negotiationLookup = negotiationData;
          this._agreementService.$getNegotiationLookUp.next(this.negotiationLookup);
        }));
  }

  setAgreementObject() {
    if (!this.result.agreementHeader.agreementRequestId && (this.isAgreementAdministrator || this.isGroupAdministrator)) {
      this.result.agreementHeader.adminName = this._commonService.getCurrentUserDetail('fullName');
      this.result.agreementHeader.adminPersonId = this._commonService.getCurrentUserDetail('personID');
    }
    this.result.agreementHeader.createUser =
      !this.result.agreementHeader.agreementRequestId ?
        this._commonService.getCurrentUserDetail('userName') : this.result.agreementHeader.createUser;
    this.result.agreementHeader.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.setDateToTimeObject(this.result.agreementHeader);
    this.result.agreementHeader.agreementType = this.result.agreementTypes.find(type =>
      (type.agreementTypeCode === this.result.agreementHeader.agreementTypeCode));
  }

  setDateToTimeObject(dateObject) {
    dateObject.startDate = dateObject.startDate ? parseDateWithoutTimestamp(dateObject.startDate) : null;
    dateObject.endDate = dateObject.endDate ? parseDateWithoutTimestamp(dateObject.endDate) : null;
  }

  setCommonDateValues(data) {
    this._commonAgreementData.startDate = data.agreementHeader.startDate;
    this._commonAgreementData.endDate = data.agreementHeader.endDate;
  }

  setupAgreementStoreData(data) {
    this.updateParameterFlags(data);
    this.result.agreementHeader = data.agreementHeader;
    this.result.availableRights = data.availableRights;
    this.result.agreementClausesGroup = data.agreementClausesGroup;
    this.result.agreementTypeCodes = data.agreementTypeCodes;
    this.result.agreementAssociationDetails = data.agreementAssociationDetails;
    this.result.agreementSponsors = data.agreementSponsors;
    this.result.agreementPeoples = data.agreementPeoples;
    this.setDatesFromTimeStamp();
    this._commonAgreementData.setAgreementData(this.result);
  }

  updateParameterFlags(data: any) {
    this.result.isShowAgreementSupport = data.isShowAgreementSupport;
    this.result.isShowAgreementNotifyAction = data.isShowAgreementNotifyAction;
  }
  
  /** Check if validation of agreement basic information fails */
  checkMandatoryFilled() {
    this.agreementValidation();
    return this.map.size > 0 ? false : true;
  }

  leadUnitSelectFunction(result) {
    if (result) {
      this.result.agreementHeader.unitNumber = result.unitNumber;
      this.result.agreementHeader.unit = result;
    } else {
      this.result.agreementHeader.unitNumber = null;
      this.result.agreementHeader.unit = null;
    }
    this.setUnSaveChanges(true);
  }

  /**
   * @param categoryCode
   * sets agreementType drop down list w.r.t category chosen.
   */
  getAgreementTypeList(categoryCode) {
    this.agreementTypeList = this.result.agreementTypes.filter(type => (type.categoryCode === categoryCode));
  }

  /**
   * set elastic search options and placeholder based on the radio selected
   */
  setElasticSearchOption() {
    this.clearField = new String('true');
    this.elasticSearchOption.defaultValue = '';
    this.isGeneralDetailsFormChanged = true;
    if (this.moduleCode === '1') {
      this.elasticSearchOption = this._elasticService.getElasticForAward();
      this.placeHolderValue = 'Search: Award#, Account No, Title, Lead Unit, Sponsor, Principal Investigator, Status';
    } else if (this.moduleCode === '2') {
      this.elasticSearchOption = this._elasticService.getElasticForIP();
      this.placeHolderValue = 'Search: Institute Proposal#, Title, Principal Investigator, Category, Type, Status,Sponsor';
    } else if (this.moduleCode === '3') {
      this.elasticSearchOption = this._elasticService.getElasticForProposal();
      this.placeHolderValue = 'Search: Development Proposal#, Proposal No, Title, Sponsor, Principal Investigator, Status';
    } else {
      this.elasticSearchOption = this._elasticService.getElasticForAgreement();
      this.placeHolderValue = 'Search: Agreement#, Agreement No, Title, Lead Unit, Sponsor, Principal Investigator, Status';
    }
  }

  /**
   *check whether the moduel is already linked.
   */
  checkDuplicate(moduleItemKey) {
    this.isAlreadyLinked = false;
    this.moduleArray.forEach(module => {
      if (module.moduleItemKey == moduleItemKey) {
        this.isAlreadyLinked = true;
      }
    });
  }

  /**
   * selecting modules for linking from elastic search
   * @param event
   */
  selectModuleFromElastic(event) {
    this.agreementAssociationDetail = {};
    this.moduleAssociationObject = {};
    if (event) {
      this.setModuleAssociationObject(event);
      this.agreementAssociationDetail.moduleCode = this.moduleCode;
      this.checkDuplicate(this.agreementAssociationDetail.moduleItemKey);
      !this.isAlreadyLinked ? this.linkModulesToAgreement(event)
        : this._commonService.showToast(HTTP_ERROR_STATUS, 'Module already linked.');
      this.moduleCode = '';
    }
  }

  /**
   * set values for moduleItemKey and moduleCode in module request object
   * and agreementAssociationDetail object values
   * based on advanced search result.
   * @param event
   */
  setModuleAssociationObject(event) {
    if (event) {
      if (this.moduleCode === '1') {
        this.agreementAssociationDetail.moduleItemKey = event.award_number;
        this.agreementAssociationDetail.moduleItemId = event.award_id;
        this.setValuesFromLinkedAssociation(event);
        !this.result.agreementHeader.agreementRequestId ? this.moduleAssociationObject.moduleItemKey = event.award_id
          : this.moduleItemKey = event.award_id;
      } else if (this.moduleCode === '2') {
        this.agreementAssociationDetail.moduleItemKey = event.proposal_number;
        this.agreementAssociationDetail.moduleItemId = event.proposal_id;
        this.setValuesFromLinkedAssociation(event);
        !this.result.agreementHeader.agreementRequestId ? this.moduleAssociationObject.moduleItemKey = event.proposal_id
          : this.moduleItemKey = event.proposal_id;
      } else if (this.moduleCode === '3') {
        this.agreementAssociationDetail.moduleItemKey = event.proposal_id;
        this.agreementAssociationDetail.moduleItemId = event.proposal_id;
        this.setValuesFromLinkedAssociation(event);
        !this.result.agreementHeader.agreementRequestId ? this.moduleAssociationObject.moduleItemKey = event.proposal_id
          : this.moduleItemKey = event.proposal_id;
      } else {
        this.agreementAssociationDetail.moduleItemId = event.agreement_request_id;
        !this.result.agreementHeader.agreementRequestId ? this.moduleAssociationObject.moduleItemKey = event.agreement_request_id
          : this.moduleItemKey = event.agreement_request_id;
        this.setValuesFromLinkedAgreement(event);
      }
    }
  }

  /**
   * linking external modules with agreement.
   * @param event
   */
  linkModulesToAgreement(event) {
    if (!this.result.agreementHeader.agreementRequestId) {
      this.validateAndSetInitialValue();
      this.moduleAssociationObject.moduleCode = this.moduleCode;
      this.moduleAssociationObjectArray.push(this.moduleAssociationObject);
      this.moduleArray.push(this.agreementAssociationDetail);
    } else {
      this.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this.acType = 'I';
      this.linkModuleAndUpdateValues(event);
    }
  }

  validateAndSetInitialValue() {
    let canFillForm = (this.checkForEmptyFields() && !this.moduleArray.length);
    if (!this.result.agreementHeader.startDate && canFillForm) {
      this.result.agreementHeader.startDate = this.agreementAssociationDetail.startDate ?
                                              getDateObjectFromTimeStamp(this.agreementAssociationDetail.startDate) : '';
    }
    if (!this.result.agreementHeader.endDate && canFillForm) {
      this.result.agreementHeader.endDate = this.agreementAssociationDetail.endDate ?
                                            getDateObjectFromTimeStamp(this.agreementAssociationDetail.endDate) : '';
    }
    if (!this.result.agreementHeader.title && canFillForm) {
      this.setInitialUnitValue();
      this.result.agreementHeader.title = this.agreementAssociationDetail.title;
    }
  }

  checkForEmptyFields() {
    return (!this.result.agreementHeader.title && !this.result.agreementHeader.startDate && !this.result.agreementHeader.endDate);
  }
  
  /**
   * getting default unit values.
   * @param event
   */
  setInitialUnitValue() {
    let unitNumber: any;
    this.moduleCode === '13' ? unitNumber = this.agreementAssociationDetail.leadUnitName :
      unitNumber = this.agreementAssociationDetail.leadUnitNumber;
    if (unitNumber) {
      this._agreementService.findDepartment(unitNumber).subscribe((data: any) => {
        if (data.length > 0) {
          this.result.agreementHeader.unitNumber = data[0].unitNumber;
          this.result.agreementHeader.unit = data[0];
          this.clearLeadUnitField = new String('false');
          this.unitHttpOptions.defaultValue = concatUnitNumberAndUnitName(data[0].unitNumber, data[0].unitName);
          this.map.delete('leadUnit');
        }
      });
    }
  }

  updateAgreementStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonAgreementData.setAgreementData(this.result);
  }

  updateDateValues() {
    this.result.agreementHeader.startDate = getDateObjectFromTimeStamp(this._commonAgreementData.startDate);
    this.result.agreementHeader.endDate = getDateObjectFromTimeStamp(this._commonAgreementData.endDate);
  }
  /**
   * linking external module with agreement and update module array.
   * @param event
   */
  linkModuleAndUpdateValues(event) {
    if (event) {
      this.$subscriptions.push
        (this._agreementService.linkModuleToAgreement(this.moduleCode, this.moduleItemKey, this.agreementRequestId, this.acType)
          .subscribe((data: any) => {
            this.checkForAccountNumber(data.agreementAssociationDetails);
            this.updateValuesAfterLink(data);
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Link association in Agreement action failed. Please try again.');
          }));
    }
  }

  /**
   * account number of linked award is checked for whitespace
   * if there is an empty string with whitespace (example: str = " ") 
   * trim() function will remove it and it will be str1 =""
   * @param agreementAssociationDetails
   */
  checkForAccountNumber(agreementAssociationDetails) {
    agreementAssociationDetails.forEach((module) => {
      if (module.moduleCode == 1) {
        module.accountNumber = module.accountNumber ? module.accountNumber.trim() : module.accountNumber;
      }
    });
  }

  /**
   * 
   * @param data 
   * update result with new values after linking module.
   */
  updateValuesAfterLink(data) {
    this.moduleArray = data.agreementAssociationDetails;
    this.result.agreementAssociationDetails = this.moduleArray;
    this.result.agreementHeader = data.agreementHeader;
    this.setCommonDateValues(data);
    this.unitHttpOptions.defaultValue = this.result.agreementHeader.unit ? this.result.agreementHeader.unit.unitName : null;
    this.result.agreementHeader.currencyCode = !this.result.agreementHeader.currencyCode ? 'USD'
      : this.result.agreementHeader.currencyCode;
    this.setCurrencySymbol();
    this.map.clear();
    this.result.agreementPeoples = data.agreementPeoples;
    this.result.agreementSponsors = data.agreementSponsors;
    this.updateAgreementStoreData();
    this.setDatesFromTimeStamp();
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Module linked successfully.');
  }

  setValuesFromLinkedAssociation(event) {
    this.agreementAssociationDetail.piName = this.moduleCode == 1 ? event.pi_name : 
                                             (this.moduleCode == 2 ? event.pi_full_name : event.full_name);
    this.agreementAssociationDetail.leadUnitNumber = event.lead_unit_number;
    this.agreementAssociationDetail.leadUnitName = event.lead_unit_name;
    this.agreementAssociationDetail.title = event.title;
    this.agreementAssociationDetail.status = event.status;
    this.agreementAssociationDetail.startDate = event.start_date;
    this.agreementAssociationDetail.endDate = event.end_date;
    this.agreementAssociationDetail.sponsorCode = event.sponsor_code;
    this.agreementAssociationDetail.sponsorName = event.sponsor;
    this.agreementAssociationDetail.documentNumber = event.document_number;
    this.agreementAssociationDetail.accountNumber = event.account_number ? event.account_number.trim() : event.account_number;
  }

  /**
    * set values when the event is Agreement
    */
  setValuesFromLinkedAgreement(event) {
    this.agreementAssociationDetail.moduleItemKey = event.agreement_request_id;
    this.agreementAssociationDetail.piName = event.principal_person_full_name;
    this.agreementAssociationDetail.leadUnitName = event.unit_name;
    this.agreementAssociationDetail.title = event.title;
    this.agreementAssociationDetail.status = event.agreement_status;
    this.agreementAssociationDetail.startDate = event.agreement_start_date;
    this.agreementAssociationDetail.endDate = event.agreement_end_date;
    this.agreementAssociationDetail.sponsorName = event.sponsor_name;
  }

  /**
   *deleting/unliknking the modules linked to the agreement.
   */
  deleteLinkedModules() {
    if (this.result.agreementHeader.agreementRequestId) {
      this.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this.acType = 'D';
      this._agreementService.linkModuleToAgreement(this.deleteModuleCode, this.deleteModuleItemKey, this.agreementRequestId, this.acType).
        subscribe((data: any) => {
          this.moduleArray = data.agreementAssociationDetails;
          this.result.agreementAssociationDetails = data.agreementAssociationDetails;
          this.updateAgreementStoreData();
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Module unlinked successfully.');
        });
    } else {
      this.deleteBeforeSavingAgreement();
    }
  }

  /**
   * removing linked modules from array before creating the agreement.
   */
  deleteBeforeSavingAgreement() {
    this.moduleAssociationObjectArray.forEach((module, index) => {
      if (module.moduleItemKey === this.deleteModuleItemKey) {
        this.moduleAssociationObjectArray.splice(index, 1);
      }
    });
    this.moduleArray.splice(this.deleteIndex, 1);
    this.isGeneralDetailsFormChanged = true;
  }

  /**
   * check whether the agreement status is not in readytoexecute,finalized,
   * terminated,transferred or abandoned.
   */
  checkForviewMode() {
    return this.result.agreementHeader.agreementStatus.canAssociate;     
  }

  /**
   * get the basic url and appending the required url base on the module selected.
   * @param moduleCode
   * @param documentNo
   * @param moduleItemKey
   */

  goToExternalLink(moduleCode: any, id: any, agreementId) {
    if (moduleCode == 1) {
      openInNewTab('award/overview?', ['awardId'], [id]);
    } else if (moduleCode == 2) {
      openInNewTab('instituteproposal/overview?', ['instituteProposalId'], [id]);
    } else if (moduleCode == 13) {
      openInNewTab('agreement/form?', ['agreementId'], [agreementId]);
    } else {
      openInNewTab('proposal?', ['proposalId'], [id]);
    }
  }

  setUnSaveChanges(changesAvailable) {
    this._autoSaveService.setUnsavedChanges('General Info', 'agreement-basic-details', changesAvailable, true );
    this._commonAgreementData.isAgreementDataChange = changesAvailable;
    this.isGeneralDetailsFormChanged = changesAvailable;
  }
}
