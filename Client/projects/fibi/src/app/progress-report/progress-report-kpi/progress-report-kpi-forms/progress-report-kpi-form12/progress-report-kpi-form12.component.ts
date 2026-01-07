import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { getEndPointOptionsForCountry } from '../../../../common/services/end-point.config';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportService } from '../../../services/progress-report.service';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form12',
  templateUrl: './progress-report-kpi-form12.component.html',
  styleUrls: ['./progress-report-kpi-form12.component.scss']
})
export class ProgressReportKpiForm12Component implements OnInit, OnDestroy {
  @Input() kpiSummaryId: string;
  @Input() sectionCode: string;
  @Input() kpiCriteriaCode: string;
  @Input() title: string;
  @Input() isEditMode: boolean;
  @Input() isFormOpen = true;

   liscenceObject = {
     progressReportKPILicenses: {
      nameOfLicense: null, startDate: null, companyUen: null, licensingPeriod: null,
      detailsOfLicense: null, comments: null
     }
   };
   progressReportDetails: any = [];
   map = new Map();
   isSaving = false;
   editIndex: number;
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
    this.liscenceObject.progressReportKPILicenses = Object.assign({}, data);
    this.liscenceObject.progressReportKPILicenses.startDate =
           data.startDate ? getDateObjectFromTimeStamp(data.startDate) : null;
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.liscenceObject.progressReportKPILicenses.startDate =
                parseDateWithoutTimestamp(this.liscenceObject.progressReportKPILicenses.startDate);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.liscenceObject.progressReportKPILicenses['progressReportId'] = this.progressReportId;
    this.liscenceObject.progressReportKPILicenses['kpiLicenseId'] = this.getKpiCollaborationProjectId();
    this.liscenceObject.progressReportKPILicenses['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.liscenceObject.progressReportKPILicenses['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.liscenceObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.getDatesWithoutTimeStamp();
  }

  /** Returns the unique kpiLicenseId if present, otherwise null.*/
  getKpiCollaborationProjectId() {
    return this.liscenceObject.progressReportKPILicenses['kpiLicenseId'] && this.editIndex !== null ?
           this.liscenceObject.progressReportKPILicenses['kpiLicenseId'] : null;
  }

  /**
   * @param  {} liscenceObject = this.liscenceObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiLicenseForm(liscenceObject = this.liscenceObject) {
    this.setRequiredKpiObjects();
    if (this.kpiFormValidation() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(liscenceObject)
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
      this.progressReportDetails.push(data.progressReportKPILicenses);
    } else {
      this.progressReportDetails[this.editIndex] = data.progressReportKPILicenses;
    }
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.liscenceObject.progressReportKPILicenses.nameOfLicense) {
      this.map.set('nameOfLicense', 'nameOfLicense');
    }
    if (!this.liscenceObject.progressReportKPILicenses.startDate) {
      this.map.set('startDate', 'startDate');
    }
    if (!this.liscenceObject.progressReportKPILicenses.licensingPeriod) {
      this.map.set('licensingPeriod', 'licensingPeriod');
    }
    if (!this.liscenceObject.progressReportKPILicenses.detailsOfLicense) {
      this.map.set('detailsOfLicense', 'detailsOfLicense');
    }
    return this.map.size > 0 ? false : true;
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.progressReportDetails[this.deleteIndex].kpiLicenseId;
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService
          .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, DELETE_ID).subscribe((data: any) => {
              this.progressReportDetails.splice(this.deleteIndex, 1);
              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
              this.isSaving = false;
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.');
            this.isSaving = false;
          }));
    }
  }

  /** Clears all the fields - on modal close, on modal trigger. */
  clearFieldValues() {
    this.liscenceObject.progressReportKPILicenses.nameOfLicense = null;
    this.liscenceObject.progressReportKPILicenses.startDate = null;
    this.liscenceObject.progressReportKPILicenses.companyUen = null;
    this.liscenceObject.progressReportKPILicenses.licensingPeriod = null;
    this.liscenceObject.progressReportKPILicenses.detailsOfLicense = null;
    this.liscenceObject.progressReportKPILicenses.comments = null;
    this.map.clear();
  }

  inputRestriction(event: any) {
    const pattern = /^\d+$/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
