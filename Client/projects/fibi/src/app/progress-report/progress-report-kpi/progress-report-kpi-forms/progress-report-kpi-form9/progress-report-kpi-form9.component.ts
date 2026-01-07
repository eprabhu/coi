import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { getEndPointOptionsForCountry } from '../../../../common/services/end-point.config';
import { convertToValidAmount, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form9',
  templateUrl: './progress-report-kpi-form9.component.html',
  styleUrls: ['./progress-report-kpi-form9.component.scss']
})
export class ProgressReportKpiForm9Component implements OnInit, OnDestroy {
  @Input() kpiSummaryId: string;
  @Input() sectionCode: string;
  @Input() kpiCriteriaCode: string;
  @Input() title: string;
  @Input() isEditMode: boolean;
  @Input() isFormOpen = true;

  contributionObject = {
    progressReportKPIInkindContributions: {
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
    private _activeRoute: ActivatedRoute) { }

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
    this.contributionObject.progressReportKPIInkindContributions = Object.assign({}, data);
    this.contributionObject.progressReportKPIInkindContributions.dateOfContribution =
           data.dateOfContribution ? getDateObjectFromTimeStamp(data.dateOfContribution) : null;
    this.clearCountryField = new String('false');
    this.countrySearchOptions.defaultValue = data && data.country ? data.country.countryName : null;
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.contributionObject.progressReportKPIInkindContributions.dateOfContribution =
                parseDateWithoutTimestamp(this.contributionObject.progressReportKPIInkindContributions.dateOfContribution);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.contributionObject.progressReportKPIInkindContributions['progressReportId'] = this.progressReportId;
    this.contributionObject.progressReportKPIInkindContributions['kpiInkindContributionId'] = this.getKpiInkindContributionId();
    this.contributionObject.progressReportKPIInkindContributions['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.contributionObject.progressReportKPIInkindContributions['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.contributionObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.getDatesWithoutTimeStamp();
    this.contributionObject.progressReportKPIInkindContributions.amount =
                                            convertToValidAmount(this.contributionObject.progressReportKPIInkindContributions.amount);
  }

  /** Returns the unique kpiInkindContributionId if present, otherwise null.*/
  getKpiInkindContributionId() {
    return this.contributionObject.progressReportKPIInkindContributions['kpiInkindContributionId'] && this.editIndex !== null ?
           this.contributionObject.progressReportKPIInkindContributions['kpiInkindContributionId'] : null;
  }

  /**
   * @param  {} contributionObject = this.contributionObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiInKindContributionForm(contributionObject = this.contributionObject) {
    this.setRequiredKpiObjects();
    if (this.kpiFormValidation() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(contributionObject)
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
      this.progressReportDetails.push(data.progressReportKPIInkindContributions);
    } else {
      this.progressReportDetails[this.editIndex] = data.progressReportKPIInkindContributions;
    }
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.contributionObject.progressReportKPIInkindContributions.dateOfContribution) {
      this.map.set('dateOfContribution', 'dateOfContribution');
    }
    if (!this.contributionObject.progressReportKPIInkindContributions.nameOfCompany) {
      this.map.set('nameOfCompany', 'nameOfCompany');
    }
    if (!this.countrySearchOptions.defaultValue) {
      this.map.set('country', 'country');
    }
    return this.map.size > 0 ? false : true;
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.progressReportDetails[this.deleteIndex].kpiInkindContributionId;
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
    this.contributionObject.progressReportKPIInkindContributions.countryCode = event ? event.countryCode : null;
    this.contributionObject.progressReportKPIInkindContributions['country'] =  event ? event : null;
  }

  /** Clears all the fields - on modal close, on modal trigger. */
  clearFieldValues() {
    this.contributionObject.progressReportKPIInkindContributions.nameOfCompany = null;
    this.contributionObject.progressReportKPIInkindContributions.countryCode = null;
    this.contributionObject.progressReportKPIInkindContributions.dateOfContribution = null;
    this.contributionObject.progressReportKPIInkindContributions.companyUen = null;
    this.contributionObject.progressReportKPIInkindContributions.amount = null;
    this.countrySearchOptions.defaultValue = null;
    this.contributionObject.progressReportKPIInkindContributions.comments = null;
    this.clearCountryField = new String('true');
    this.map.clear();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
