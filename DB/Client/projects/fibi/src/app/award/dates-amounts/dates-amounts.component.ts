import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { OverviewService } from '../overview/overview.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { DatesAmountsService } from './dates-amounts.service';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-dates-amounts',
  templateUrl: './dates-amounts.component.html',
  styleUrls: ['./dates-amounts.component.css']
})
export class DatesAmountsComponent implements OnInit, OnDestroy {

  isDatesAndAmountEdit = false;
  awardId: any;
  awardCostDetails: any = [];
  foreignCurrencyObject: any = {
    awardId: '',
    currencyCode: null,
    totalCostInCurrency: ''
  };
  editCurrency = false;
  warningMsg = null;
  isModifyAward = false;
  result: any = {};
  isProjectCostActive = false;
  $subscriptions: Subscription[] = [];
  datesAndAmountsData: any;
  anticipatedModalType: string = null;
  isViewAnticipatedDistribution = false;

  constructor(public _commonData: CommonDataService, private _overviewService: OverviewService,
    private route: ActivatedRoute, public _commonService: CommonService,
    private _datesAmountsService: DatesAmountsService, ) { }

  ngOnInit() {
    this.awardId = this.route.snapshot.queryParams['awardId'];
    this.getPermissions();
    this.getAwardGeneralData();
    this.isProjectCostActive = !this.result.serviceRequest ? false : true;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getSectionEditableList();
        this.getAwardFunds();
        this.getTransactionData();
      }
    }));
  }


  getTransactionData() {
    this.$subscriptions.push(this._datesAmountsService.datesAmountsLookUpData(
      { 'awardId': this.result.award.awardId,
        'awardNumber': this.result.award.awardNumber,
        'awardSequenceNumber': this.result.award.sequenceNumber  })
      .subscribe((data: any) => {
        this.datesAndAmountsData = data;
      }));
  }
  /**
  * returns editable permission w.r.t section code
  */
  getSectionEditableList() {
    this.isDatesAndAmountEdit = this._commonData.getSectionEditableFlag('108');
  }

    async getPermissions() {
        this.isModifyAward = await this._commonData.checkDepartmentLevelRightsInArray('MODIFY_AWARD');
        this.isViewAnticipatedDistribution = this._commonData.awardSectionConfig['196'].isActive &&
            (this._commonData.checkDepartmentLevelRightsInArray('VIEW_ANTICIPATED_FUNDING_DISTRIBUTION') ||
            this._commonData.checkDepartmentLevelRightsInArray('MODIFY_ANTICIPATED_FUNDING_DISTRIBUTION'));
    }

  getAwardFunds() {
    this.$subscriptions.push(this._overviewService.getAwardFunds(
      {'awardId': this.awardId,'awardNumber': this.result.award.awardNumber }).subscribe((data: any) => {
      this.awardCostDetails = data;
      if(this.awardCostDetails.pendingAmountInfo) {
        this.foreignCurrencyObject.currencyCode = this.awardCostDetails.pendingAmountInfo.currencyCode;
        this.foreignCurrencyObject.totalCostInCurrency = this.awardCostDetails.pendingAmountInfo.totalCostInCurrency;
      }
    }));
  }

  saveForeignCurrency() {
    this.foreignCurrencyObject.awardId = this.awardId;
    this.foreignCurrencyObject.awardNumber = this.result.award.awardNumber;
    if (this.amountValidation() && this.foreignCurrencyObject.currencyCode) {
      this.$subscriptions.push(this._datesAmountsService.saveTotalProjectCostInForeignCurrency(this.foreignCurrencyObject)
        .subscribe((data: any) => {
          this.awardCostDetails = data;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Amount updated.');
          this.editCurrency = false;
          this.warningMsg = null;
        }));
    } else if (this.amountValidation() && !this.foreignCurrencyObject.currencyCode) {
      this.warningMsg = '* Please provide currency/amount.';
    }
  }
  /**
   *  validate amount as 9 digits up to 2 decimal places.
   */
  amountValidation() {
    this.warningMsg = null;
    const pattern = /^[+-]?[0-9]{1,9}(\.\d+)?$/;
    if (this.foreignCurrencyObject.totalCostInCurrency) {
      if (!pattern.test(this.foreignCurrencyObject.totalCostInCurrency)) {
        this.warningMsg = 'Enter a valid amount as 9 digits.';
      }
      return this.warningMsg ? false : true;
    }
  }
  /**
   * reassign currency code and amount on cancel click
   */
  cancelCurrency() {
    this.editCurrency = false;
    this.warningMsg = null;
    this.foreignCurrencyObject.currencyCode = this.awardCostDetails.currencyCode;
    this.foreignCurrencyObject.totalCostInCurrency = this.awardCostDetails.totalCostInCurrency;
  }

  updateAnticipatedDistributable(event?: string): void {
    this.anticipatedModalType = event;
  }

}
