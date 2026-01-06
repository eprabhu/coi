import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { CommonDataService } from '../../../services/common-data.service';
import { compareDates, parseDateWithoutTimestamp, getDateObjectFromTimeStamp } from '../../../../common/utilities/date-utilities';
import { SpecialApprovalService } from '../special-approval.service';
import { setFocusToElement, inputRestrictionForAmountField } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import {HTTP_SUCCESS_STATUS ,HTTP_ERROR_STATUS} from '../../../../app-constants';
@Component({
  selector: 'app-special-approval-edit',
  templateUrl: './special-approval-edit.component.html',
  styleUrls: ['./special-approval-edit.component.css']
})
export class SpecialApprovalEditComponent implements OnInit, OnDestroy {
  awardApprovedEquipment: any = {};
  awardAprovedForeignTravel: any = {};
  frequencyBaseTypeMsg: string = null;
  warningMsg: any = {};
  type: any;
  acType: any;
  index: any = {};
  specialType: string;
  awardData: any;
  specialForeignTravel: any = [];
  specialEquipment: any = [];
  reportTermsLookup: any = {};
  isSpecialApproval = true;
  foreignTravelSum = 0;
  equipmentSum = 0;
  totalSum = 0;
  currency;
  map = new Map();
  isApproval = false;
  isForeignTravel = false;
  setFocusToElement = setFocusToElement;
  equipmentIndex;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _specialApprovalService: SpecialApprovalService, public _commonService: CommonService,
    private _commonData: CommonDataService) { }

  ngOnInit() {
    this.type = 'foreignTravel';
    this.awardAprovedForeignTravel.travellerName = '';
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data.award;
        if (this.awardData.awardId) {
          this.$subscriptions.push(this._specialApprovalService.reportsTermsLookUpData(this.awardData.awardId)
            .subscribe((result: any) => {
              this.reportTermsLookup = result;
              this.specialForeignTravel = this.reportTermsLookup.awardAprovedForeignTravelList;
              this.specialEquipment = this.reportTermsLookup.awardApprovedEquipmentList;
              this.specialApprovalSum();
            }));
        }
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  checkSpecialApprovalMandatoryFilled() {
    this.foreignTravelValidation();
    const DATES = this.dateValidation(this.awardAprovedForeignTravel.startDate, this.awardAprovedForeignTravel.endDate);
    this.warningMsg.dateWarningText = DATES ? null : '* Please select an end date after start date';
    if (this.map.size > 0 || DATES === false) {
      return false;
    }
    return true;
  }
  dateValidation(startDate, endDate) {
    this.warningMsg.dateWarningText = null;
    if (endDate && endDate !== undefined) {
      return (compareDates(startDate, endDate) === 1) ? false : true;
    } else { return true; }
  }
  foreignTravelValidation() {
    this.map.clear();
    if (!this.awardAprovedForeignTravel.travellerName || this.awardAprovedForeignTravel.travellerName === 'null') {
      this.map.set('traveler', 'Please select a traveller name');
    }
    if (!this.awardAprovedForeignTravel.startDate || this.awardAprovedForeignTravel.startDate === 'null') {
      this.map.set('startDate', 'Please pick a start date');
    }
     if (!this.awardAprovedForeignTravel.amount || this.awardAprovedForeignTravel.amount === 'null') {
      this.map.set('foreignamount', 'Please enter an amount');
    }
    if (this.awardAprovedForeignTravel.amount) {
      this.inputDigitRestriction(this.awardAprovedForeignTravel.amount, 'amount');
    }
  }
  equipmentValidation() {
    this.map.clear();
    if (!this.awardApprovedEquipment.amount) {
      this.map.set('equipmentamount', 'Please enter an amount');
    }
    if (!this.awardApprovedEquipment.item || (this.awardApprovedEquipment.item && !this.awardApprovedEquipment.item.trim())) {
      this.map.set('item', 'Please select an item');
    }
    if (this.awardApprovedEquipment.amount) {
      this.inputDigitRestriction(this.awardApprovedEquipment.amount, 'vendorAmount');
    }
  }

  inputDigitRestriction(field: any, key: string) {
    this.map.delete(key);
    if (inputRestrictionForAmountField(field)) {
      this.map.set(key, inputRestrictionForAmountField(field));
    }
  }
  /**
   * when a traveller name selected, assigns rolodexId or personId by checking non employee flag value.
   */
  reportTermsTravellerChange() {
    let travelerObject: any = {};
    if (this.reportTermsLookup.awardForeignTravellerList && this.awardAprovedForeignTravel.travellerName) {
      travelerObject = this.reportTermsLookup.awardForeignTravellerList.find(traveler =>
        traveler.fullName === this.awardAprovedForeignTravel.travellerName);
      (travelerObject.nonEmployeeFlag) ? this.awardAprovedForeignTravel.rolodexId = travelerObject.awardPersonId :
        this.awardAprovedForeignTravel.personId = travelerObject.awardPersonId;
    }
  }
  /**
   * @param  {} typeId
   * get Id's and return actype as SAVE if id is null, otherwise return type as UPDATE
   */
  getType(typeId) {
    this.acType = (typeId != null) ? 'U' : 'I';
    return this.acType;
  }

  addForeignTravel() {
    if (this.checkSpecialApprovalMandatoryFilled() && !this.isSaving) {
      this.isSaving = true;
      this.specialForeignTravel = this.specialForeignTravel ? this.specialForeignTravel : [];
      this.awardAprovedForeignTravel = this.addAwardDetails(this.awardAprovedForeignTravel);
      this.awardAprovedForeignTravel.startDate = parseDateWithoutTimestamp(this.awardAprovedForeignTravel.startDate);
      this.awardAprovedForeignTravel.endDate = parseDateWithoutTimestamp(this.awardAprovedForeignTravel.endDate);
      this.$subscriptions.push(this._specialApprovalService.addSpecialApproval({
        'awardAprovedForeignTravel': this.awardAprovedForeignTravel,
        'acType': this.getType(this.awardAprovedForeignTravel.awardApprovedForiegnTravelId)
      }).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, "Foreign Traveler added successfully.")
        this.awardAprovedForeignTravel = data.awardAprovedForeignTravel;
        (this.acType === 'I') ? this.specialForeignTravel.push(this.awardAprovedForeignTravel) :
          this.specialForeignTravel.splice(this.index.specialApprovalIndex, 1, this.awardAprovedForeignTravel);
        this.specialApprovalSum();
        this.isSpecialApproval = true;
        this.awardAprovedForeignTravel = {};
        this.awardAprovedForeignTravel.travellerName = '';
        this.isSaving = false;
      }, err => { this.isSaving = false; 
        this._commonService.showToast(HTTP_ERROR_STATUS, "Adding Foreign Traveler failed. Please try again.")}));
    }
  }
  addEquipment() {
    this.equipmentValidation();
    if (this.map.size < 1 && !this.isSaving) {
      this.isSaving = true;
      this.specialEquipment = this.specialEquipment ? this.specialEquipment : [];
      this.awardApprovedEquipment = this.addAwardDetails(this.awardApprovedEquipment);
      this.$subscriptions.push(this._specialApprovalService.addSpecialApproval({
        'awardApprovedEquipment': this.awardApprovedEquipment,
        'acType': this.getType(this.awardApprovedEquipment.awardApprovedEquipmentId)
      }).subscribe((data: any) => {
        this.awardApprovedEquipment = data.awardApprovedEquipment;
        (this.acType === 'I') ? this.specialEquipment.push(this.awardApprovedEquipment) :
          this.specialEquipment.splice(this.equipmentIndex, 1, this.awardApprovedEquipment);
        this.specialApprovalSum();
        this.isSpecialApproval = true;
        this.awardApprovedEquipment = {};
        this.isSaving = false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, "Equipment added successfully.");
      }, err => { this.isSaving = false; 
        this._commonService.showToast(HTTP_ERROR_STATUS, "Adding Equipment failed. Please try again.");}));
    }
  }
  /**
   * @param  {} reportsData
   * common function for setting award details.
   */
  addAwardDetails(reportsData) {
    reportsData.awardId = this.awardData.awardId;
    reportsData.awardNumber = this.awardData.awardNumber;
    reportsData.sequenceNumber = this.awardData.sequenceNumber;
    reportsData.updateUser = this._commonService.getCurrentUserDetail('userName');
    return reportsData;
  }
  editForeignTravel(index: any) {
    this.type = 'foreignTravel';
    this.index.specialApprovalIndex = index;
    this.awardAprovedForeignTravel = Object.assign({}, this.specialForeignTravel[index]);
    this.awardAprovedForeignTravel.startDate = getDateObjectFromTimeStamp(this.awardAprovedForeignTravel.startDate);
    this.awardAprovedForeignTravel.endDate = getDateObjectFromTimeStamp(this.awardAprovedForeignTravel.endDate);
  }
  editEquipment(index: any) {
    this.type = 'equipment';
    this.equipmentIndex = index;
    this.awardApprovedEquipment = Object.assign({}, this.specialEquipment[index]);
  }
  /**
 * calculate the total sum of foreign travel amount and equipment amount.
 */
  specialApprovalSum() {
    this.foreignTravelSum = 0;
    this.equipmentSum = 0;
    if (this.specialForeignTravel) {
    this.specialForeignTravel.forEach(element => {
      element.amount =  parseFloat((element.amount).toFixed(2));
      this.foreignTravelSum = this.foreignTravelSum + element.amount;
      });
    }
    if (this.specialEquipment) {
    this.specialEquipment.forEach(element => {
      element.amount =  parseFloat((element.amount).toFixed(2));
      this.equipmentSum = this.equipmentSum + element.amount; });
    this.totalSum = this.foreignTravelSum + this.equipmentSum;
    }
  }
  deleteForeignTravel(removeForeignTravelId: any) {
    this.index.specialApprovalIndex = removeForeignTravelId;
    this.$subscriptions.push(this._specialApprovalService.addSpecialApproval(
      { 'awardAprovedForeignTravel': this.specialForeignTravel[this.index.specialApprovalIndex], 'acType': 'D' })
      .subscribe(data => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, "Foreign Traveler deleted successfully.")
        this.specialForeignTravel.splice(this.index.specialApprovalIndex, 1);
        this.specialApprovalSum();
      },err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Foreign Traveler failed. Please try again.');
      }));
  }
  deleteEquipment(removeEquipmentId) {
    this.equipmentIndex = removeEquipmentId;
    this.$subscriptions.push(this._specialApprovalService.addSpecialApproval(
      { 'awardApprovedEquipment': this.specialEquipment[this.equipmentIndex], 'acType': 'D' })
      .subscribe(data => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, "Equipment deleted successfully.");
        this.specialEquipment.splice(this.equipmentIndex, 1);
        this.specialApprovalSum();
      },err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Equipment failed. Please try again.');
      }));
  }
}
