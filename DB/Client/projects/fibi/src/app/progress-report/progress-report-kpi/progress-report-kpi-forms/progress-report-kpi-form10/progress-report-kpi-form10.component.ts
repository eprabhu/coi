/** 
 * Last Updated by Prem Kumar on 27/01/2021
 * Form 10: Number of Technologies Deployed
 * Section code: 16 */

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { getEndPointOptionsForCountry } from '../../../../common/services/end-point.config';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form10',
  templateUrl: './progress-report-kpi-form10.component.html',
  styleUrls: ['./progress-report-kpi-form10.component.css']
})
export class ProgressReportKpiForm10Component implements OnInit, OnDestroy {

  @Input() kpiSummaryId;
  @Input() sectionCode;
  @Input() title;
  @Input() isEditMode;
  @Input() isFormOpen: Boolean = true;
  @Input() kpiCriteriaCode;

  summaryDetail = [];
  progressReportId = null;
  countrySearchOptions: any = {};
  kpiTechDeployedForm = {
    kpiTechnologiesDeployedId: null,
    nameOfCompany: '',
    countryCode: '',
    dateOfDeploying: null,
    companyUen: null,
    detailsOfTechnology: null,
    comments: '',
  };
  formMap = new Map();
  selectedKPIForDelete = null;
  selectedKPIIndexForDelete = null;
  selectedKPIIndexForEdit =  null;
  clearCountryField: String;
  isSaving = false;
  mode = 'ADD';
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  constructor(private _route: ActivatedRoute, private _progressReportKpiFormsService: ProgressReportKpiFormsService, public _commonService: CommonService) { }

  ngOnInit() {
    this.countrySearchOptions = getEndPointOptionsForCountry();
    this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
    this.getIndividualKpiData();

  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** Fetch all KPI list with this.kpiSummaryId and this.sectionCode */
  getIndividualKpiData() {
    if (this.kpiSummaryId && this.sectionCode) {
      this.$subscriptions.push(this._progressReportKpiFormsService
        .loadProgressReportKPISummaryDetails(this.kpiSummaryId, this.sectionCode).subscribe((res: any) => {
          this.summaryDetail = res.summaryDetail;
        }));
    }
  }

  resetDefaultValues(){
    this.formMap.clear();
    this.mode = 'ADD';
    this.resetkpiManPowerDevForm();
    this.clearCountryField = new String('true');
    this.selectedKPIIndexForEdit = null;
  }

  resetkpiManPowerDevForm() {
    this.kpiTechDeployedForm = {
      kpiTechnologiesDeployedId: null,
      nameOfCompany: '',
      countryCode: '',
      dateOfDeploying: null,
      companyUen: null,
      detailsOfTechnology: null,
      comments: '',
    };
  }
  /** Save or Edit KPI details got from Add / Edit modal.*/
  processRequest() {
    if (this.kpiValidation() && !this.isSaving) {
      this.getDatesWithoutTimeStamp();
      this.isSaving = true;
      this.$subscriptions.push(this._progressReportKpiFormsService
        .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((response: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry added successfully');
          this.addToSummaryDetailsArray(response.progressReportKPITechnologiesDeployed);
          this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to Add entry');
          this.isSaving = false;
        }));
      $('#no-Of-Tech-Deployed-form-modal' + this.kpiSummaryId).modal('hide');
    }
  }

  /** Check if all mandatory fields are added. */
  kpiValidation() {
    this.formMap.clear();
    if (!this.kpiTechDeployedForm.dateOfDeploying) {
      this.formMap.set('dateOfDeploying', '* Please provide Date of Deploying');
    }
    if (!this.kpiTechDeployedForm.nameOfCompany) {
      this.formMap.set('nameOfCompany', '* Please provide Name of Company Deploying');
    }
    if (!this.kpiTechDeployedForm.countryCode) {
      this.formMap.set('countryCode', '* Please provide Country of Company');
    }
    if (!this.kpiTechDeployedForm.detailsOfTechnology) {
      this.formMap.set('detailsOfTechnology', '* Please provide Details of Technologies Deployed');
    }
    return this.formMap.size <= 0;
  }

  /** Removes timestamp from dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.kpiTechDeployedForm.dateOfDeploying = parseDateWithoutTimestamp(this.kpiTechDeployedForm.dateOfDeploying);
  }

  getRequestObject() {
    return {
      progressReportKPITechnologiesDeployed: {
        ...this.kpiTechDeployedForm,
        kpiSummaryId: this.kpiSummaryId,
        progressReportId: this.progressReportId,
        kpiCriteriaCode: this.kpiCriteriaCode
      },
      sectionCode: this.sectionCode
    };
  }

  /**
   * @param  {any} kpiData
   * Pushes the data into the summaryDetail array depends on Add/Update actions. For adding a new entry, just pushes the data into the array
   * and while updating, pushes the data into that particular index.
   */
  addToSummaryDetailsArray(kpiData) {
    this.mode === 'ADD' ?  this.summaryDetail.push(kpiData) : this.summaryDetail[this.selectedKPIIndexForEdit] = kpiData;
  }

  /** Edit KPI
   * @param selectedKPI
   * @param kpiIndex
   */
  editKPI(selectedKPI, kpiIndex){
    this.kpiTechDeployedForm = JSON.parse(JSON.stringify(selectedKPI));
    this.kpiTechDeployedForm.dateOfDeploying = getDateObjectFromTimeStamp(this.kpiTechDeployedForm.dateOfDeploying) || null;
    this.selectedKPIIndexForEdit = kpiIndex;
    this.mode = 'EDIT';
    this.clearCountryField = new String('false');
    this.countrySearchOptions.defaultValue = selectedKPI.country && selectedKPI.country.countryName ? selectedKPI.country.countryName : null;
    $('#no-Of-Tech-Deployed-form-modal' + this.kpiSummaryId).modal('show');
  }

  /**
   * @param  {any} event
   * Sets the corresponding country code before Save.
   */
  countryChangeFunction(event: any) {
    this.countrySearchOptions.defaultValue = event && event.countryName ? event.countryName : null;
    this.kpiTechDeployedForm.countryCode = event && event.countryCode ? event.countryCode : null;
    this.kpiTechDeployedForm['country'] =  event ? event : null;
  }

  deleteSelectedKPI() {
    if(!this.isSaving) { 
      this.isSaving = true;
      this.$subscriptions.push(this._progressReportKpiFormsService
        .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, this.selectedKPIForDelete.kpiTechnologiesDeployedId).subscribe((res: any) => {
            this.summaryDetail.splice(this.selectedKPIIndexForDelete, 1);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully');
            this.selectedKPIIndexForDelete = null;
            this.selectedKPIForDelete = null;
            this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete');
          this.isSaving = false;
        }));
    }
  }
}
