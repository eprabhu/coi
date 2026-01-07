/** Updated by Aravind on 23-11-2019
 * Last updated by Saranya T Pillai on 26/11/2019
**/

import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { DatesAmountsService } from '../dates-amounts.service';
import { CommonDataService } from '../../services/common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { compareDates, getDateObjectFromTimeStamp, compareDatesWithoutTimeZone, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, AWARD_LABEL } from '../../../app-constants';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-dates-amounts-edit',
  templateUrl: './dates-amounts-edit.component.html',
  styleUrls: ['./dates-amounts-edit.component.css'],

})
export class DatesAmountsEditComponent implements OnInit, OnDestroy {

  awardTransactionTypes: any = [];
  instituteProposalList: any = [];
  awardAmountInfo: any = {
    awardAmountTransaction: {
      awardTransactionType: null,
      noticeDate: '',
      comments: '',
      sourceAwardNumber: null,
      destinationAwardNumber: null,
      fundingProposalNumber: null
    },
    currentFundEffectiveDate: '',
    obligationExpirationDate: '',
    obligatedChange: '',
    anticipatedChange: ''
  };
  warningMsg: any = [];
  amountWarningMsg: any = [];
  transactionList: any = [];
  obligatedAmount: any = 0;
  anticipatedAmount: any = 0;
  projectStartDate;
  projectEndDate;
  editIndex = null;
  transactionData;
  deleteIndex;
  map = new Map();
  transactionId = null;
  isTransactions = false;
  isTransactionHistory = false;
  pattern = /^[+-]?[0-9]{1,10}(\.\d+)?$/;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  sourceList: any = [];
  destinationList: any = [];
  @Output() selectedResult: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('commentOptions', { static: false }) commentOptions: ElementRef;
  awardNumber: any;
  setFocusToElement = setFocusToElement;
  viewComment: any = {};
  $subscriptions: Subscription[] = [];
  debounceTimer;
  sequenceNumber: any;
  @Input() datesAndAmountsData: any = {};
  awardId: any;
  isSaving: boolean = false;

  constructor(private _datesAmountsService: DatesAmountsService,
    public commonData: CommonDataService, public _commonService: CommonService,
    private _route: ActivatedRoute
  ) { document.addEventListener('mouseup', this.offClickHandler.bind(this)); }

  ngOnInit() {
    this.getAwardGeneralData();
    this.awardId = this._route.snapshot.queryParams['awardId'];
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
 * @param  {any} event
 * Hide more option dropdown on clicking
 */
  offClickHandler(event: any) {
    if (this.commentOptions) {
      if (!this.commentOptions.nativeElement.contains(event.target)) {
        this.viewComment = {};
      }
    }
  }
  enableOrDisableComment(index) {
    this.viewComment = {};
    this.viewComment[index] = true;
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this.commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardNumber = data.award.awardNumber;
        this.sequenceNumber = data.award.sequenceNumber;
        this.instituteProposalList = data.awardFundingProposals;
        this.projectStartDate = getDateObjectFromTimeStamp(this.commonData.beginDate);
        this.projectEndDate = getDateObjectFromTimeStamp(this.commonData.finalExpirationDate);
        if (data.award.awardId && this.datesAndAmountsData) {
          this.setDatesAndAmountsData(this.datesAndAmountsData);
        }
      }
    }));
  }

  getTransactionData() {
    this.$subscriptions.push(this._datesAmountsService.datesAmountsLookUpData(
      {
        'awardId': this.awardId,
        'awardNumber': this.awardNumber,
        'awardSequenceNumber': this.sequenceNumber
      })
      .subscribe((result: any) => {
        this.setDatesAndAmountsData(result);
      }));
  }

  setDatesAndAmountsData(result) {
    this.awardTransactionTypes = result.awardTransactionTypes;
    this.transactionList = result.awardAmountInfos;
    this.sourceList = result.sourceAccount;
    this.destinationList = result.destinationAccount;
    this.totalAmountCalculation();
  }

  /**sets the TRANSCATIONREQUESTDATA :- in the format needed to save transaction
   * if the validation returns an null warning message saves the transaction
   */
  saveTransaction() {
    this.validateTransactionData();
    if (!this.warningMsg.length && !this.amountWarningMsg.length && this.map.size === 0) {
      if (!this.isSaving) {
        this.setTransactionRequestObject();
        this.isSaving = true;
        this.$subscriptions.push(this._datesAmountsService.saveTransaction(this.awardAmountInfo)
          .subscribe((data: any) => {
            if (data.message) {
              this.warningMsg = [];
              this.warningMsg.push(data.message);
            } else {
              const toastMessage = 'Transaction ' + (this.awardAmountInfo.awardAmountInfoId ? 'updated' : 'added') + ' successfully.';
              this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMessage);
              this.updateAwardFunds();
              this.resetTransactionObject();
              $('#add-transaction-modal').modal('hide');
            }
            this.commonData.isAwardDataChange = false;
            this.isSaving = false;
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS,
              (this.awardAmountInfo.awardAmountInfoId ? 'Updating' : 'Saving') + ' Transaction failed. Please try again.');
            this.isSaving = false;
          }));
      }
    }
  }

  updateAwardFunds() {
    this.getTransactionData();
    this.totalAmountCalculation();
    this.selectedResult.emit(true);
  }
  /**
   * to set the request object for save or update
   */
  setTransactionRequestObject() {
    this.awardAmountInfo.awardAmountTransaction.transactionTypeCode =
      this.awardAmountInfo.awardAmountTransaction.awardTransactionType.awardTransactionTypeCode;
    this.setFundProposalDetails();
    this.awardAmountInfo.awardAmountTransaction.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.awardAmountInfo.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.awardAmountInfo.awardId = this.awardId;
    this.awardAmountInfo.awardNumber = this.awardNumber;
    this.setDateFormatWithoutTimeStamp();
  }

  setDateFormatWithoutTimeStamp() {
    this.awardAmountInfo.currentFundEffectiveDate = parseDateWithoutTimestamp(this.awardAmountInfo.currentFundEffectiveDate);
    this.awardAmountInfo.obligationExpirationDate = parseDateWithoutTimestamp(this.awardAmountInfo.obligationExpirationDate);
    this.awardAmountInfo.awardAmountTransaction.noticeDate =
      parseDateWithoutTimestamp(this.awardAmountInfo.awardAmountTransaction.noticeDate);
  }
  /**
   * @param  {} data
  * to set transaction data after save or update
   */
  setTransactionData(data) {
    if (this.editIndex !== null) {
      this.transactionId = this.editIndex;
      this.awardAmountInfo.awardAmountTransaction.awardTransactionType = null;
      this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber = null;
      this.awardAmountInfo.awardAmountTransaction.destinationAwardNumber = null;
      this.obligatedAmount = this.obligatedAmount - parseFloat(this.transactionList[this.editIndex].obligatedChange);
      this.anticipatedAmount = this.anticipatedAmount - parseFloat(this.transactionList[this.editIndex].anticipatedChange);
      this.transactionList.splice(this.editIndex, 1, data.awardAmountInfo);
    } else {
      this.transactionList.push(data.awardAmountInfo);
      this.transactionId = this.transactionList.length - 1;
    }
  }
  resetTransactionObject() {
    this.commonData.isAwardDataChange = false;
    this.awardAmountInfo.awardAmountTransaction = {};
    this.awardAmountInfo.awardAmountInfoId = '';
    this.awardAmountInfo.awardAmountTransaction.fundedProposalId = '';
    this.awardAmountInfo.awardAmountTransaction.fundingProposalNumber = null;
    this.awardAmountInfo.awardAmountTransaction.noticeDate = '';
    this.awardAmountInfo.awardAmountTransaction.comments = '';
    this.awardAmountInfo.currentFundEffectiveDate = '';
    this.awardAmountInfo.obligationExpirationDate = '';
    this.awardAmountInfo.obligatedChange = '';
    this.awardAmountInfo.anticipatedChange = '';
    this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber = null;
    this.awardAmountInfo.awardAmountTransaction.destinationAwardNumber = null;
    this.awardAmountInfo.awardAmountTransaction.awardTransactionType = null;
    if (this.editIndex !== null) {
      delete this.transactionList[this.editIndex].isEditable;
      this.editIndex = null;
    }
    this.map.clear();
    this.warningMsg = [];
    this.amountWarningMsg = [];
  }

  /**
   * Checks all required validations and date validations
   */
  validateTransactionData() {
    this.validateDateAndAmount();
    this.awardValidation();
  }

  validateDateAndAmount() {
      this.warningMsg = [];
      this.dateValidation();
      this.amountValidation();
  }

  awardValidation() {
    this.map.clear();
    if (this.awardAmountInfo.awardAmountTransaction.awardTransactionType === 'null' ||
      !this.awardAmountInfo.awardAmountTransaction.awardTransactionType) {
      this.map.set('transactionType', 'Please select Transaction Type');
    }
    if (this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber &&
      this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber ===
      this.awardAmountInfo.awardAmountTransaction.destinationAwardNumber) {
      this.map.set('destinationDuplication', 'Source and destination award can\'t be same');
    }
    if (this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber &&
      !this.awardAmountInfo.awardAmountTransaction.destinationAwardNumber) {
      this.map.set('destinationAward', 'Please select destination award');
    }
    if (this.awardAmountInfo.awardAmountTransaction.destinationAwardNumber &&
      !this.awardAmountInfo.awardAmountTransaction.sourceAwardNumber) {
      this.map.set('sourceAward', 'Please select source award');
    }
  }

  datesAndAmountMandatoryCheck() {
    this.awardAmountInfo.obligatedChange = this.awardAmountInfo.obligatedChange === '' ? 0 : this.awardAmountInfo.obligatedChange;
    this.awardAmountInfo.anticipatedChange = this.awardAmountInfo.anticipatedChange === '' ? 0 : this.awardAmountInfo.anticipatedChange;
    if (parseFloat(this.awardAmountInfo.obligatedChange) + parseFloat(this.obligatedAmount) >
      parseFloat(this.awardAmountInfo.anticipatedChange) + parseFloat(this.anticipatedAmount)) {
      this.amountWarningMsg.push('* Obligated change should be equal or lesser than Anticipated change');
    }
    if (this.awardAmountInfo.obligationExpirationDate) {
      if (compareDatesWithoutTimeZone(this.awardAmountInfo.obligationExpirationDate, this.projectEndDate) === 1) {
        this.amountWarningMsg.push(`* Choose an Obligation End Date on or before the ${AWARD_LABEL} End Date`);
      }
      if (compareDatesWithoutTimeZone(this.awardAmountInfo.obligationExpirationDate, this.projectStartDate) === -1) {
        this.amountWarningMsg.push(`* Choose an Obligation End Date between ${AWARD_LABEL} Start and End Dates`);
      }
    }
    if (this.awardAmountInfo.currentFundEffectiveDate) {
      if (compareDatesWithoutTimeZone(this.awardAmountInfo.currentFundEffectiveDate, this.projectStartDate) === -1) {
        this.amountWarningMsg.push(`* Choose an Obligation Start Date on or after the ${AWARD_LABEL} Start Date`);
      }
      if (compareDatesWithoutTimeZone(this.awardAmountInfo.currentFundEffectiveDate, this.projectEndDate) === 1) {
        this.amountWarningMsg.push(`* Choose an Obligation Start Date between ${AWARD_LABEL} Start and End Dates`);
      }
    }
  }

  amountValidation() {
    this.amountWarningMsg = [];
    if (this.awardAmountInfo.obligatedChange) {
      if (!this.pattern.test(this.awardAmountInfo.obligatedChange)) {
        this.amountWarningMsg.push('* Enter a valid Obligated change as 10 digits up to 2 decimal places.');
      }
    }
    if (this.awardAmountInfo.anticipatedChange) {
      if (!this.pattern.test(this.awardAmountInfo.anticipatedChange)) {
        this.amountWarningMsg.push('* Enter a valid Anticipated change as 10 digits up to 2 decimal places.');
      }
    }
    this.datesAndAmountMandatoryCheck();
  }

  dateValidation() {
    if (this.awardAmountInfo.obligationExpirationDate) {
      if (compareDates(this.awardAmountInfo.currentFundEffectiveDate, this.awardAmountInfo.obligationExpirationDate) === 1) {
        this.map.set('date', '* Please select an Obligation End Date after Obligation Start Date');
      } else {
        this.map.delete('date');
      }
    }
  }
  /**
   * @param  {} transaction
   * binds the selected row of values from transactionlist to awardinfo object to edit them
   */
  editTransaction(transaction, index) {
    this.map.clear();
    this.warningMsg = [];
    this.amountWarningMsg = []; 
    this.editIndex = index;
    this.awardAmountInfo = JSON.parse(JSON.stringify(transaction));
    transaction.isEditable = true;
    this.awardAmountInfo.awardAmountTransaction.noticeDate =
      getDateObjectFromTimeStamp(this.awardAmountInfo.awardAmountTransaction.noticeDate);
    this.awardAmountInfo.currentFundEffectiveDate = getDateObjectFromTimeStamp(this.awardAmountInfo.currentFundEffectiveDate);
    this.awardAmountInfo.obligationExpirationDate = getDateObjectFromTimeStamp(this.awardAmountInfo.obligationExpirationDate);
    this.awardAmountInfo.awardAmountTransaction.awardTransactionType = this.awardTransactionTypes.find
      (item => item.awardTransactionTypeCode === this.awardAmountInfo.awardAmountTransaction.transactionTypeCode);
    setTimeout(() => {
      document.getElementById('inputsectiontransaction').scrollIntoView({ block: 'end' });
    }, 0);
  }
  /**
   * calculates the total sum of obligation change and anticipated change
   */
  totalAmountCalculation() {
    this.obligatedAmount = 0;
    this.anticipatedAmount = 0;
    if (this.transactionList.length > 0) {
      this.transactionList.forEach(element => {
        this.obligatedAmount = this.obligatedAmount + (element.obligatedChange);
        this.anticipatedAmount = this.anticipatedAmount + (element.anticipatedChange);
      });
    } else {
      this.obligatedAmount = 0;
      this.anticipatedAmount = 0;
    }
  }

  deleteAwardTransaction(index) {
    this.$subscriptions.push(this._datesAmountsService.deleteAwardTransaction(
      { 'transactionId': this.transactionList[index].transactionId }
    ).subscribe((data: any) => {
        this.updateAwardFunds();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Transaction deleted successfully.');
      }, err => { 
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete Transaction. Please try again.'); 
      },));
  }

  setFundProposalDetails() {
    if (this.instituteProposalList && this.instituteProposalList.length) {
      const fundedProposal = this.instituteProposalList.find
      (item => item.proposal.proposalNumber === this.awardAmountInfo.awardAmountTransaction.fundingProposalNumber);
      if (fundedProposal) {
        this.awardAmountInfo.awardAmountTransaction.fundedProposalId = fundedProposal.proposalId;
      } else {
        this.awardAmountInfo.awardAmountTransaction.fundedProposalId = '';
        this.awardAmountInfo.awardAmountTransaction.fundingProposalNumber = null;
      }
    }
  }
}
