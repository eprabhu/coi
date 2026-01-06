/** Last updated by Arun Raj on 21-01-2021(Wednesday).
 * 'isSaving' - Flag to restrict multiple service calls on multi click.
*/
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { getEndPointOptionsForCountry } from '../../../../common/services/end-point.config';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { ActivatedRoute } from '@angular/router';
import { ProgressReportService } from '../../../../progress-report/services/progress-report.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form7',
  templateUrl: './progress-report-kpi-form7.component.html',
  styleUrls: ['./progress-report-kpi-form7.component.scss']
})
export class ProgressReportKpiForm7Component implements OnInit, OnDestroy  {
 @Input() kpiSummaryId: string;
 @Input() sectionCode: string;
 @Input() kpiCriteriaCode: string;
 @Input() title: string;
 @Input() isEditMode: boolean;
 @Input() isFormOpen = true;

  collaborationObject = {
    progressReportKPICollaborationProjects: {
      projectTitle: null, projectDescription: null, projectStartDate: null, projectEndDate: null,
      collaboratingOrganization: null, comments: null, companyUen: null, countryCode: null
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
    this.collaborationObject.progressReportKPICollaborationProjects = Object.assign({}, data);
    this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate =
           data.projectStartDate ? getDateObjectFromTimeStamp(data.projectStartDate) : null;
    this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate =
           data.projectEndDate ? getDateObjectFromTimeStamp(data.projectEndDate) : null;
    this.clearCountryField = new String('false');
    this.countrySearchOptions.defaultValue = data && data.country ? data.country.countryName : null;
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate =
                parseDateWithoutTimestamp(this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate);
    this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate =
                parseDateWithoutTimestamp(this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.collaborationObject.progressReportKPICollaborationProjects['progressReportId'] = this.progressReportId;
    this.collaborationObject.progressReportKPICollaborationProjects['kpiCollaborationProjectId'] = this.getKpiCollaborationProjectId();
    this.collaborationObject.progressReportKPICollaborationProjects['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.collaborationObject.progressReportKPICollaborationProjects['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.collaborationObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.getDatesWithoutTimeStamp();
  }

  /** Returns the unique kpiCollaborationProjectId if present, otherwise null.*/
  getKpiCollaborationProjectId() {
    return this.collaborationObject.progressReportKPICollaborationProjects['kpiCollaborationProjectId'] && this.editIndex !== null ?
           this.collaborationObject.progressReportKPICollaborationProjects['kpiCollaborationProjectId'] : null;
  }

  /**
   * @param  {} collaborationObject = this.collaborationObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiCollaborationForm(collaborationObject = this.collaborationObject) {
    this.setRequiredKpiObjects();
    if (this.kpiFormValidation() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(collaborationObject)
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
      this.progressReportDetails.push(data.progressReportKPICollaborationProjects);
    } else {
      this.progressReportDetails[this.editIndex] = data.progressReportKPICollaborationProjects;
    }
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.collaborationObject.progressReportKPICollaborationProjects.projectTitle) {
      this.map.set('projectTitle', 'title');
    }
    if (!this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate) {
      this.map.set('ProjectStartDate', 'startDate');
    }
    if (!this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate) {
      this.map.set('ProjectEndDate', '* Please pick a End Date.');
    } else {
      this.validateEndDate();
    }
    return this.map.size > 0 ? false : true;
  }

  /** Validates end date before save - restrict scenarios where start date is greater than end date.*/
  validateEndDate() {
    this.map.delete('ProjectEndDate');
    if (this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate &&
      this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate) {
      if (compareDates(this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate,
        this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate) === 1) {
        this.map.set('ProjectEndDate', '* Please select an end date after start date');
      }
    }
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.progressReportDetails[this.deleteIndex].kpiCollaborationProjectId;
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
    this.collaborationObject.progressReportKPICollaborationProjects.countryCode = event ? event.countryCode : null;
    this.collaborationObject.progressReportKPICollaborationProjects['country'] =  event ? event : null;
  }

  /** Clears all the fields - on modal close, on modal trigger. */
  clearFieldValues() {
    this.collaborationObject.progressReportKPICollaborationProjects.projectTitle = null;
    this.collaborationObject.progressReportKPICollaborationProjects.projectDescription = null;
    this.collaborationObject.progressReportKPICollaborationProjects.projectStartDate = null;
    this.collaborationObject.progressReportKPICollaborationProjects.projectEndDate = null;
    this.collaborationObject.progressReportKPICollaborationProjects.collaboratingOrganization = null;
    this.countrySearchOptions.defaultValue = null;
    this.collaborationObject.progressReportKPICollaborationProjects.companyUen = null;
    this.collaborationObject.progressReportKPICollaborationProjects.comments = null;
    this.clearCountryField = new String('true');
    this.map.clear();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
