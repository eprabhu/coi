/** Last updated by Aravind  on 12-12-2019 */

import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { getCurrentTimeStamp, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CostSharingService } from '../cost-sharing.service';
import { setFocusToElement, validatePercentage, inputRestrictionForAmountField } from '../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { HTTP_SUCCESS_STATUS, AWARD_LABEL, HTTP_ERROR_STATUS } from '../../../app-constants';
declare var $: any;

@Component({
  selector: 'app-cost-sharing-edit',
  templateUrl: './cost-sharing-edit.component.html',
  styleUrls: ['./cost-sharing-edit.component.css']
})
export class CostSharingEditComponent implements OnInit, OnChanges, OnDestroy {
  costshare: any = {
    awardId: '',
    awardNumber: '',
    sequenceNumber: '',
    projectPeriod: '',
    costSharePercentage: '',
    costShareTypeCode: '',
    source: '',
    destination: '',
    commitmentAmount: '',
    verificationDate: '',
    costShareMet: '',
    comments: '',
    updateTimestamp: '',
    updateUser: ''
  };
  type = '';
  organizationSum = 0;
  commitmentSum = 0;
  costShareMetSum = 0;
  @Input() map: any = {};
  @Input() result: any = {};
  costShareData: any = [];
  isCostShareEdit = true;
  @Input() costShareResult: any = {};
  removeCostShareId: string;
  currency: any;
  index: any;
  isCostSharesWidgetOpen = false;
  isPercentageValueErrorMsg = null;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  isSaving = false;
  @Output() selectedResult: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _costShareService: CostSharingService,
    public _commonService: CommonService,
    public _commonData: CommonDataService,
  ) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
  }
  ngOnChanges() {
    if (this.costShareResult.awardCostShares) {
      this.costShareData = this.costShareResult.awardCostShares;
      this.costShareSum();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
   * @param {} value
   */
  limitKeypress(value) {
    this.isPercentageValueErrorMsg = null;
    this.isPercentageValueErrorMsg = validatePercentage(value) ? validatePercentage(value) : null;
  }

  /**
 * @param  {} typeId
 * get Id's and return type as SAVE if id is null, otherwise return type as UPDATE
 */
  getType(typeId) {
    this.type = (typeId != null) ? 'UPDATE' : 'SAVE';
    return this.type;
  }

  checkMandatoryFilled() {
    this.map.clear();
    if (!this.costshare.costShareTypeCode || this.costshare.costShareTypeCode === 'null') {
      this.map.set('costsharetypecode', 'costShareType');
    }
    if (!this.costshare.projectPeriod || this.costshare.projectPeriod === 'null') {
      this.map.set('costshareprojectperiod', 'Please select a fiscal year.');
    }
    if (this.costshare.costSharePercentage) {
      this.limitKeypress(this.costshare.costSharePercentage);
    }
    if (this.costshare.commitmentAmount) {
      this.inputDigitRestriction(this.costshare.commitmentAmount, 'commitmentAmount');
    }
    if (this.costshare.costShareMet) {
      this.inputDigitRestriction(this.costshare.costShareMet, 'costShareMet');
    }
    this.validYear();
  }

  inputDigitRestriction(field: any, key: string) {
    this.map.delete(key);
    if (inputRestrictionForAmountField(field)) {
      this.map.set(key, inputRestrictionForAmountField(field));
    }
  }

  setCostShareObject() {
    this.costshare.updateTimestamp = getCurrentTimeStamp();
    this.costshare.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.costshare.awardId = this.result.award.awardId;
    this.costshare.awardNumber = this.result.award.awardNumber;
    this.costshare.sequenceNumber = this.result.award.sequenceNumber;
    this.setDateFormatWithoutTimeStamp();
  }

  setDateFormatWithoutTimeStamp() {
    this.costshare.verificationDate = parseDateWithoutTimestamp(this.costshare.verificationDate);
  }

  addCostShare() {
    this.checkMandatoryFilled();
    if (this.map.size < 1 && this.isPercentageValueErrorMsg == null && !this.isSaving && this._commonData.isAwardDataChange) {
      this.isSaving = true;
      this.setCostShareObject();
      this.$subscriptions.push(this._costShareService.addCostShare({
        'awardCostShare': this.costshare, 'updateType': this.getType(this.costshare.awardCostShareId),
        'awardId': this.result.award.awardId
      }).subscribe((data: any) => {
        this.costshare = data.awardCostShare;
        if (this.type === 'SAVE') {
          this.costShareData.push(this.costshare);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost Share added successfully.');
        } else {
          this.costShareData.splice(this.index, 1, this.costshare);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost Share updated successfully.');
        }
        this.costShareSum();
        this.costshare = {};
        this.isCostShareEdit = true;
        this.costshare.costShareTypeCode = '';
        this.selectedResult.emit(true);
        this.setupAwardStoreData(this.costShareData);
        this._commonData.isAwardDataChange = false;
        this.isSaving = false;
        $('#add-subcontract-modal').modal('hide');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, (this.isCostShareEdit ? 'Adding ' : 'Updating ') + 'Cost Share failed. Please try again.');
        this.isSaving = false;
      }));
    } else {
      if (!this.isCostShareEdit && this.map.size < 1 && !this.isSaving && this.isPercentageValueErrorMsg == null ) {
      this.isSaving = true;
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost Share updated successfully.');
      this.clearCostShareData();
      $('#add-subcontract-modal').modal('hide');
      this.isSaving = false;
      }
    }
  }
  validYear() {
    if (this.costshare.projectPeriod) {
      const awardStartDate = getDateObjectFromTimeStamp(this._commonData.beginDate);
      const awardEndDate = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
      if (awardStartDate.getFullYear() > this.costshare.projectPeriod
        || awardEndDate.getFullYear() < this.costshare.projectPeriod) {
        this.map.set('costshareprojectperiod', `Choose a Fiscal year between ${AWARD_LABEL} Start and End Dates.`);
      } else {
        this.map.delete('costshareprojectperiod');
      }
    }
  }

  costShareSum() {
    this.commitmentSum = 0;
    this.costShareMetSum = 0;
    this.costShareData.forEach(element => {
      this.commitmentSum = this.commitmentSum + element.commitmentAmount;
      this.costShareMetSum = this.costShareMetSum + element.costShareMet;
    });
  }

  editCostShare(index: any) {
    this.isCostShareEdit = false;
    this.map.clear();
    this.index = index;
    scrollIntoView('award-type');
    this.costshare = JSON.parse(JSON.stringify(this.costShareData[index]));
    if (this.costshare.verificationDate) {
      this.costshare.verificationDate = getDateObjectFromTimeStamp(this.costshare.verificationDate);
    }
  }

  /**
   * @param  {} costShareTypeCode
   * get cost share type code and returns corresponding type description to the table list
   */
  getCostshareTypes(costShareTypeCode) {
    if (this.costShareResult.costShareTypes && costShareTypeCode) {
      let costShareType: any = {};
      costShareType = this.costShareResult.costShareTypes.find(type => type.costShareTypeCode === costShareTypeCode);
      return (costShareType) ? costShareType.description : null;
    }
  }

  deleteCostShare() {
    if (this.removeCostShareId != null) {
      this.$subscriptions.push(this._costShareService.deleteCostShare({
        'personId': this._commonService.getCurrentUserDetail('personID'), 'awardCostShareId': this.removeCostShareId,
        'awardId': this.result.award.awardId, 'updateUser': this._commonService.getCurrentUserDetail('userName')
      }).subscribe(data => {
        this.costShareData.splice(this.index, 1);
        this.costShareSum();
        this.selectedResult.emit(true);
        this.setupAwardStoreData(this.costShareData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost Share deleted successfully.');
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Cost Share failed. Please try again.');
      }));
    }
  }

  /**
   * @param  {} data
   * setup award common data the values that changed after the service call need to be updatedinto the store.
   * every service call wont have all the all the details as reponse so
   * we need to cherry pick the changes and update them to the store.
   */
  setupAwardStoreData(data) {
    this.result.awardCostShares = data;
    this.updateAwardStoreData();
  }
  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  clearCostShareData() {
    this.costshare = {};
     this.isCostShareEdit  = true;
     this.costshare.costShareTypeCode = '';
     this.map.clear();
  }
}
