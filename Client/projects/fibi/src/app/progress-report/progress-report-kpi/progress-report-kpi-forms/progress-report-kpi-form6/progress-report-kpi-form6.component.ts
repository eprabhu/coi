import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { getEndPointOptionsForCountry } from '../../../../common/services/end-point.config';
import { convertToValidAmount, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportService } from '../../../../progress-report/services/progress-report.service';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form6',
  templateUrl: './progress-report-kpi-form6.component.html',
  styleUrls: ['./progress-report-kpi-form6.component.scss']
})
export class ProgressReportKpiForm6Component implements OnInit, OnDestroy {
  @Input() kpiSummaryId: string;
  @Input() sectionCode: string;
  @Input() kpiCriteriaCode: string;
  @Input() title: string;
  @Input() isEditMode: boolean;
  @Input() isFormOpen = true;

  cashFundingObject = {
    progressReportKPICashFunding: {
      nameOfCompany: null, countryCode: null, dateOfContribution: null, companyUen: null,
      amount: null, comments: null
    }
  };
  progressReportDetails: any = [];
  map = new Map();
  isSaving = false;
  editIndex: number = null;
  deleteIndex: number;
  countrySearchOptions: any = {};
  progressReportId = '';
  clearCountryField: String;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];

  constructor(public _kpiFormService: ProgressReportKpiFormsService, public _commonService: CommonService,
    private _activeRoute: ActivatedRoute, public _progressReportService: ProgressReportService) { }

  ngOnInit() {
    this.countrySearchOptions = getEndPointOptionsForCountry();
    this.progressReportId = this._activeRoute.snapshot.queryParamMap.get('progressReportId');
    this.getGeneralKpiDetails();
  }

  /** Fetches all the Kpi details. This will persist all the values on tab switch or page reload. */
  getGeneralKpiDetails() {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.loadProgressReportKPISummaryDetails(this.kpiSummaryId, this.sectionCode)
      .subscribe((data: any) => {
        this.progressReportDetails = data.summaryDetail;
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }

  /**
   * @param  {any} data
   * @param  {number} index
   * Binds all the values in the modal based on its corresponding index.
   * Here getDateObjectFromTimeStamp() is used to get date object from its timestamp.
   */
  editKpiCollaborationForm(data: any, index: number) {
    this.editIndex = index;
    this.cashFundingObject.progressReportKPICashFunding = Object.assign({}, data);
    this.cashFundingObject.progressReportKPICashFunding.dateOfContribution =
           data.dateOfContribution ? getDateObjectFromTimeStamp(data.dateOfContribution) : null;
    this.clearCountryField = new String('false');
    this.countrySearchOptions.defaultValue = data && data.country ? data.country.countryName : null;
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.cashFundingObject.progressReportKPICashFunding.dateOfContribution =
                parseDateWithoutTimestamp(this.cashFundingObject.progressReportKPICashFunding.dateOfContribution);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.cashFundingObject.progressReportKPICashFunding['progressReportId'] = this.progressReportId;
    this.cashFundingObject.progressReportKPICashFunding['kpiCashFundingId'] = this.getKpiCashFundingId();
    this.cashFundingObject.progressReportKPICashFunding['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.cashFundingObject.progressReportKPICashFunding['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.cashFundingObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.cashFundingObject.progressReportKPICashFunding.amount =
                                     convertToValidAmount(this.cashFundingObject.progressReportKPICashFunding.amount);
    this.getDatesWithoutTimeStamp();
  }

  /** Returns the unique kpiCashFundingId if present, otherwise null.*/
  getKpiCashFundingId() {
    return this.cashFundingObject.progressReportKPICashFunding['kpiCashFundingId'] && this.editIndex !== null ?
           this.cashFundingObject.progressReportKPICashFunding['kpiCashFundingId'] : null;
  }

  /**
   * @param  {} cashFundingObject = this.cashFundingObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiCashFundingForm(cashFundingObject = this.cashFundingObject) {
    this.setRequiredKpiObjects();
    if (!this.isSaving && this.kpiFormValidation()) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(cashFundingObject)
        .subscribe((data: any) => {
          this.pushDataToArray(data);
          this.editIndex == null ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry added successfully.') :
                                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry updated successfully.');
          this.isSaving = false;
          this.editIndex = null;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to add entry.');
          this.isSaving = false;
          this.editIndex = null;
        }));
      $('#kpi-form' + this.kpiSummaryId).modal('hide');
    }
  }

  /**
   * @param  {any} data
   * Pushes the data into the array depends on Add/Update actions. For adding a new entry, just pushes the data into the array
   * and while updating, pushes the data into that particular index.
   */
  pushDataToArray(data: any) {
    if (this.editIndex == null) {
      this.progressReportDetails.push(data.progressReportKPICashFunding);
    } else {
      this.progressReportDetails[this.editIndex] = data.progressReportKPICashFunding;
    }
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.progressReportDetails[this.deleteIndex].kpiCashFundingId;
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService
          .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, DELETE_ID)
          .subscribe((data: any) => {
              this.progressReportDetails.splice(this.deleteIndex, 1);
              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
              this.isSaving = false;
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.');
            this.isSaving = false;
          }));
    }
  }

  /**
   * @param  {any} event
   * Sets the corresponding country object and country code before Save.
   */
  countryChangeFunction(event: any) {
    this.countrySearchOptions.defaultValue = event && event.country ? event.country.countryName : null;
    this.cashFundingObject.progressReportKPICashFunding.countryCode = event ? event.countryCode : null;
    this.cashFundingObject.progressReportKPICashFunding['country'] =  event ? event : null;
  }

  /** Clears all the fields - on modal close, on modal trigger. */
  clearFieldValues() {
    this.cashFundingObject.progressReportKPICashFunding.nameOfCompany = null;
    this.cashFundingObject.progressReportKPICashFunding.countryCode = null;
    this.cashFundingObject.progressReportKPICashFunding.dateOfContribution = null;
    this.cashFundingObject.progressReportKPICashFunding.companyUen = null;
    this.cashFundingObject.progressReportKPICashFunding.amount = null;
    this.countrySearchOptions.defaultValue = null;
    this.cashFundingObject.progressReportKPICashFunding.comments = null;
    this.clearCountryField = new String('true');
    this.map.clear();
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.cashFundingObject.progressReportKPICashFunding.dateOfContribution) {
      this.map.set('dateOfContribution', 'dateOfContribution');
    }
    return this.map.size > 0 ? false : true;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
