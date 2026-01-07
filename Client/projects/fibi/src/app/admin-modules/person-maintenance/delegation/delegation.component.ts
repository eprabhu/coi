import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { PersonMaintenanceService } from '../person-maintenance.service';
import { compareDates, compareDatesWithoutTimeZone, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-delegation',
  templateUrl: './delegation.component.html',
  styleUrls: ['./delegation.component.css']
})
export class DelegationComponent implements OnInit {

  map = new Map();
  elasticSearchOptions: any = {};
  selectedMemberObject: any = {};
  isPersonCard = false;
  $subscriptions: Subscription[] = [];
  myDelegationList: any = [];
  clearField: String;
  isviewMode = false
  isShowCancelButton = false
  isPersonViewMode = false
  delegation: any = {
    delegationId: '',
    delegatedBy: '',
    delegatedTo: '',
    effectiveDate: '',
    endDate: '',
    delegationStatusCode: '',
    comment: '',
    createTimestamp: '',
    createUser: '',
    delegationStatus: ''
  }
  delegationId: string;
  delegationPersonId: any;
  delegatedByPersonId: any;
  delegatedByPerson: any;
  delegationAcceptObject: any = {};
  setFocusToElement = setFocusToElement;
  delegationCopyData: any = {};
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  isMaintainDelegation = false;

  constructor(private _elasticService: ElasticConfigService, public _personService: PersonMaintenanceService, private _activeRoute: ActivatedRoute,
    private _commonService: CommonService) { }


  ngOnInit() {
    this.map.clear();
    this._personService.isPersonEditOrView = true;
    this.delegationPersonId = this._activeRoute.snapshot.queryParamMap.get('personId');
    this.delegatedByPersonId = this._commonService.getCurrentUserDetail('personID');
    this.getDelegationData();
    this.elasticSearchOptions = this._elasticService.getElasticForPerson();
  }

  selectedPersonData(event: any) {
    this.isPersonCard = false;
    if (event) {
      this.isPersonCard = true;
      this.setDetailsFromElastic(event);
    } else {
      this.delegation.delegatedTo = ''
      this.elasticSearchOptions.defaultValue = ''
      }
    this.map.delete('personfullname');
  }

  setDetailsFromElastic(value: any) {
    this.selectedMemberObject.fullName = value.full_name;
    this.selectedMemberObject.prncpl_id = value.prncpl_id;
    this.selectedMemberObject.designation = value.primary_title ? value.primary_title : value.designation;
    this.selectedMemberObject.email = value.email_addr ? value.email_addr : (value.email_address ? value.email_address : null);
    this.selectedMemberObject.phoneNumber = value.phone_nbr ? value.phone_nbr : (value.phone_number ? value.phone_number : null);
    this.selectedMemberObject.isExternalUser = value.external == "Y" ? true : false;
    this.selectedMemberObject.homeUnit = value.unit_name;
  }

  getDelegationData() {
    this.map.clear();
    this.$subscriptions.push(this._personService.getDelegationData(this.delegationPersonId).subscribe((data: any) => {
      // this.delegationCopyData = JSON.parse(JSON.stringify(data));
      this._personService.personDisplayCard = data.person,
      this.setDelegationResponseData(data),
      this.isMaintainDelegation = data.isMaintainDelegationRightExist;
    }));
  }
  setDelegationResponseData(data) {
    if (data.delegation && data.delegation.delegationStatusCode != 'X') {
      this.elasticSearchOptions.defaultValue = data.delegation.delegatedToPerson.fullName;
      this.delegation.delegatedBy = data.delegation.delegatedByPerson.fullName;
      this.delegation.delegatedTo = data.delegation.delegatedToPerson.fullName;
      this.delegation.effectiveDate = data.delegation.effectiveDate;
      this.delegation.endDate = data.delegation.endDate;
      this.delegation.delegationStatusCode = data.delegation.delegationStatusCode;
      this.delegation.comment = data.delegation.comment;
      this.delegationId = data.delegation.delegationId;
      this.isviewMode = data.delegation.delegationId ? true : false || data.isMaintainDelegationRightExist;
      this.isPersonViewMode = data.delegation.delegationId ? true : false;
      this.delegation.createTimestamp = data.delegation.createTimestamp;
      this.delegation.createUser = data.delegation.createUser;
      this.delegatedByPerson = data.delegation.delegatedToPerson.personId;
      this.delegation.delegationStatus = data.delegation.delegationStatus.description;
      this.clearField = new String('false');
      this.setDateValue()
    }
    if (data.delegations) {
      this.myDelegationList = data.delegations;
    }
  }
  setDateValue() {
    this.delegation.effectiveDate = this.delegation.effectiveDate ? getDateObjectFromTimeStamp(this.delegation.effectiveDate) : null;
    this.delegation.endDate = this.delegation.endDate ? getDateObjectFromTimeStamp(this.delegation.endDate) : null;
  }

  setDelegationData(type) {
    const DELEGATION_LIST: any = {};
    DELEGATION_LIST.delegationId = this.delegationId;
    DELEGATION_LIST.delegatedBy = this._activeRoute.snapshot.queryParamMap.get('personId');
    DELEGATION_LIST.delegatedTo = this.selectedMemberObject.prncpl_id ? this.selectedMemberObject.prncpl_id : this.delegatedByPerson;
    DELEGATION_LIST.effectiveDate = parseDateWithoutTimestamp(this.delegation.effectiveDate);
    DELEGATION_LIST.endDate = parseDateWithoutTimestamp(this.delegation.endDate);
    DELEGATION_LIST.delegationStatusCode = type;
    DELEGATION_LIST.comment = this.delegation.comment ? this.delegation.comment : null;
    DELEGATION_LIST.createTimestamp = this.delegation.createTimestamp ? this.delegation.createTimestamp : null;
    DELEGATION_LIST.createUser = this.delegation.createUser ? this.delegation.createUser : null;
    return DELEGATION_LIST;
  }

  saveOrUpdateDeligationData(type) {
    this.map.clear();
    this.delegationPersonId = this._activeRoute.snapshot.queryParamMap.get('personId');
    if ((type === 'R' && this.validateMandatoryFields() && this.validateDates()) || type === 'X') {
      this.saveOrUpdateDeligation(type);
    }
  }

  saveOrUpdateDeligation(type) {
    this.$subscriptions.push(this._personService.saveOrUpdateDeligation({ "personId": this.delegationPersonId, "delegation": this.setDelegationData(type), 
    "previousDelegatedToPersonId": this.delegatedByPerson}).subscribe((data: any) => {
      if (data) {
        type === 'R' ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Delegation Requested successfully.') :
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Delegation Removed successfully.');
        this.isPersonCard = false;
        this.isviewMode = true;
        this.delegationId = (type === 'X') ? null : this.delegationId;
        this.delegationCopyData = null;
        this.resetAllDelegationData();
        this.setDelegationResponseData(data);
      }
    }));
  }


  /**
   * 'A' Accept Status
   * 'D' Deny Status
   * 'X' Delete Status
   */
  updateDeligationStatus() {
    this.$subscriptions.push(this._personService.updateDeligationStatus({ "personId": this.delegationPersonId, "delegationId": this.delegationAcceptObject.delegateId, "delegationStatusCode": this.delegationAcceptObject.statusCode }).subscribe((data: any) => {
      if (data) {
        if(this.delegationAcceptObject.statusCode == 'A'){
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Delegation accepted successfully.')
        }else if (this.delegationAcceptObject.statusCode == 'D'){
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Delegation denied successfully.'); 
       } else if (this.delegationAcceptObject.statusCode == 'X')
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Delegation deleted successfully.');
        } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Delegation updation failed. Please try again.');
      }
      this.setDelegationResponseData(data);
    }));
  }

  validateMandatoryFields() {
    this.map.clear();
    this.delegation.delegatedTo = this.selectedMemberObject.prncpl_id ? this.selectedMemberObject.prncpl_id : this.delegatedByPerson
    if (!this.delegation.delegatedTo || !this.elasticSearchOptions.defaultValue) {
      this.elasticSearchOptions.errorMessage = 'Please provide a Person name.';
      this.map.set('personfullname', this.elasticSearchOptions.errorMessage);
    }
    if (this.delegation.delegatedTo == this.delegationPersonId) {
      this.elasticSearchOptions.errorMessage = 'Please select a different Person name.';
      this.map.set('personfullname', this.elasticSearchOptions.errorMessage);
    }
    return this.map.size ? false : true;
  }

  validateDates() {
    this.map.clear();
    if (!this.delegation.effectiveDate) {
      this.map.set('effectiveDate', 'Please provide a Start Date.');
    }
    if (this.delegation.endDate) {
      if (!((compareDates(this.delegation.effectiveDate, this.delegation.endDate) === 1) ? false : true)) {
        this.map.set('endDate', 'Please provide an End Date after Delegation Effective Date.');
      }
    }
    if (this.delegation.effectiveDate && compareDatesWithoutTimeZone(this.delegation.effectiveDate, new Date()) === -1) {
      this.map.set('effectiveDate', 'Effective On cannot be a past date.');
    }
    return this.map.size ? false : true;
  }
  delegationAcceptChecking(statusCode, delegateId, index) {
    this.delegationAcceptObject.statusCode = statusCode;
    this.delegationAcceptObject.delegateId = delegateId;
    this.delegationAcceptObject.index = index;
  }

  resetAllDelegationData() {
    this.delegation.delegatedBy = "";
    this.delegation.delegatedTo = "";
    this.delegation.effectiveDate = "";
    this.delegation.endDate = "";
    this.delegation.delegationStatusCode = "";
    this.delegation.comment = "";
    this.elasticSearchOptions.defaultValue = this.isPersonViewMode ? this.elasticSearchOptions.defaultValue : "";
    this.delegationId = this.delegationId ? this.delegationId : "";
    this.delegation.delegationStatusCode = "";
    this.delegation.createTimestamp = "";
    this.delegation.createUser = "";
    this.delegatedByPerson = this.isPersonViewMode ? this.delegatedByPerson : null;
    this.delegation.delegationStatus = "";
    this.isviewMode = false;
    this.isPersonCard = false;
    this.map.clear();
    this.clearField = this.isPersonViewMode ? (new String('false')) : (new String('true'));
  }

  editDelegation() {
    this.isviewMode=false;
    this.isPersonViewMode = true;
    this.isShowCancelButton=true;
    this.delegationCopyData = { ...this.delegation };
  }

  cancelDelegationEdit() {
    this.map.clear();
    this.isviewMode = true;
    this.isPersonViewMode = false;
    this.isShowCancelButton = false;
    this.delegation = { ...this.delegationCopyData };
    this.delegationCopyData = null;
    this.selectedMemberObject = {};
    this.elasticSearchOptions.defaultValue = this.delegation.delegatedTo;
  }
}


