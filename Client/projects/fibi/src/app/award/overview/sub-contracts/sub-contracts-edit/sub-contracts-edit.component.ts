/** Last updated by Aravind  on 18-11-2019 */

import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { OverviewService } from '../../../overview/overview.service';
import { CommonDataService } from '../../../services/common-data.service';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { scrollIntoView, inputRestrictionForAmountField } from '../../../../common/utilities/custom-utilities';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { convertToValidAmount } from '../../../../common/utilities/custom-utilities';
declare var $: any;

@Component({
  selector: 'app-sub-contracts-edit',
  templateUrl: './sub-contracts-edit.component.html',
  styleUrls: ['./sub-contracts-edit.component.css']
})
export class SubContractsEditComponent implements OnInit, OnChanges, OnDestroy {

  organizationSum = 0;
  subcontracts: any = {
    awardId: '',
    awardNumber: '',
    organizationId: '',
    sequenceNumber: '',
    amount: '',
  };
  @Input() result: any = {};
  type: string;
  isSubContract = true;
  organizationName = '';
  subContractData: any = [];
  index: any;
  clearField: String;
  organizationSearchOptions: any = {};
  removeSubcontractId: string;
  isShowCollapse = true;
  currency;
  map = new Map();
  isHighlighted = false;
  $subscriptions: Subscription[] = [];
  newOrganizationName = {organizationId: null,
                        organizationName : '',
                        isActive : true};
  isSaving = false;

  constructor(private _overviewService: OverviewService, private _commonData: CommonDataService,
    public _commonService: CommonService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    this.map.clear();
    this.organizationSearchOptions = this._commonData.setSearchOptions('organizationName', 'organizationName', 'findOrganizations');

  }
  ngOnChanges() {
    if (this.result.awardSubContracts) {
      this.subContractData = this.result.awardSubContracts;
      this.subContractSum();
      this.isHighlighted = this._commonData.checkSectionHightlightPermission('112');
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  addSubcontract() {
    this.subcontracts.awardId = this.result.award.awardId;
    this.subcontracts.awardNumber = this.result.award.awardNumber;
    if (this.checkMandatoryFilled() && !this.isSaving) {
      this.isSaving = true;
      this.subcontracts.amount = convertToValidAmount(this.subcontracts.amount);
      const acType = this.getType(this.subcontracts.awardApprovedSubawardId);
      this.$subscriptions.push(this._overviewService.addSubcontract({
        'subContract': this.subcontracts, 'updateType': acType
      }).subscribe((data: any) => {
        this.subcontracts = data.subContract;
        this.isSubContract = true;
        this.subcontracts.organization = {};
        this.subcontracts.organization.organizationName = this.organizationName;
        (this.type === 'SAVE') ? this.subContractData.push(this.subcontracts) :
          this.subContractData.splice(this.index, 1, this.subcontracts);
        this.subContractSum();
        this.subcontracts = {};
        this.clearSubcontract();
        this.setupAwardStoreData(this.subContractData);
        this.isSaving = false;
      }, err => {
        this.isSaving = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, acType === 'SAVE' ? 'Adding Sub Contract failed. Please try again.' : 'Updating Sub Contract failed. Please try again.');
      }, () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, acType === 'SAVE' ? 'Sub Contract added successfully.' : 'Sub Contract updated successfully.');
        $('#add-subcontract-modal').modal('hide');
      }));
    }
  }
  checkMandatoryFilled() {
    this.subContractValidation();
    return this.map.size > 0 ? false : true;
  }
  subContractValidation() {
    this.map.clear();
    if (!this.organizationName) {
      this.organizationSearchOptions.errorMessage = 'Please select an organization.';
      this.map.set('organization', 'organization');
    }
    if (!this.subcontracts.amount) {
      this.map.set('amount', 'amount');
    }
    if (this.subcontracts.amount) {
      this.inputDigitRestriction(this.subcontracts.amount, 'subContractAmount');
    }
  }

  inputDigitRestriction(field: any, key: string) {
    this.map.delete(key);
    if (inputRestrictionForAmountField(field)) {
      this.map.set(key, inputRestrictionForAmountField(field));
    }
  }

  subContractSum() {
    this.organizationSum = 0;
    this.subContractData.forEach(element => {
      this.organizationSum = this.organizationSum + parseFloat(element.amount);
    });
  }
  clearSubcontract() {
    this.map.clear();
    this.organizationSearchOptions.defaultValue = '';
    this.organizationName = '';
    this.clearField = new String('true');
    this.subcontracts = {};
  }
  editSubContract(index: any) {
    this.clearField = new String('false');
    this.index = index;
    this.subcontracts = Object.assign({}, this.subContractData[index]);
    this.organizationSearchOptions = Object.assign({}, this.organizationSearchOptions);
    this.organizationSearchOptions.defaultValue = this.organizationName = this.subcontracts.organization.organizationName;
    scrollIntoView('award-subcontract-percent-effort');
  }

  deleteSubcontract() {
    if (this.removeSubcontractId != null) {
      this.$subscriptions.push(this._overviewService.deleteSubcontract({
        'personId': this._commonService.getCurrentUserDetail('personID'), 'awardSubawardId': this.removeSubcontractId,
        'awardId': this.result.award.awardId, 'updateUser': this._commonService.getCurrentUserDetail('userName')
      }).subscribe(data => {
        this.subContractData.splice(this.index, 1);
        this.subContractSum();
        this.setupAwardStoreData(this.subContractData);
      },
      err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Sub Contract failed. Please try again.'); },
      () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Sub Contract deleted successfully.');
      }));
    }
  }
  /**
   * @param  {} typeId
   * get Id's and return type as SAVE if id is null, otherwise return type as UPDATE
   */
  getType(typeId) {
    this.type = (typeId != null) ? 'UPDATE' : 'SAVE';
    return this.type;
  }
  organizationChangeFunction(result) {
    if (result) {
      this.subcontracts.organizationId = result.organizationId;
      this.organizationName = result.organizationName;
    } else {
      this.subcontracts.organizationId = '';
      this.organizationName = '';
    }
  }
  /**
     * @param  {} data
     * setup award common data the values that changed after the service call need to be updatedinto the store.
     * every service call wont have all the all the details as reponse so
     * we need to cherry pick the changes and update them to the store.
     */
  setupAwardStoreData(data) {
    this.result.awardSubContracts = data;
    this.updateAwardStoreData();
  }
  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

    /**
   * @param
   * sets value for newly added organisation
   */
  newOrganizationSelect(organizationAddEvent) {
    this.subcontracts.organizationId = null;
    this.newOrganizationName.organizationName = organizationAddEvent.searchString;
    this.organizationName = this.newOrganizationName.organizationName;
    this.subcontracts.organization = this.newOrganizationName;
  }
}
