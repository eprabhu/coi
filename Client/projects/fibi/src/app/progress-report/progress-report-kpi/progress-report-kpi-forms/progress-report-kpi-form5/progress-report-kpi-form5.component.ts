import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { convertToValidAmount, inputRestrictionForAmountField, setFocusToElement, getSponsorSearchDefaultValue } from '../../../../common/utilities/custom-utilities';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { getEndPointOptionsForSponsor } from '../../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form5',
  templateUrl: './progress-report-kpi-form5.component.html',
  styleUrls: ['./progress-report-kpi-form5.component.css']
})
export class ProgressReportKpiForm5Component implements OnInit, OnDestroy {
  @Input() kpiSummaryId: string;
  @Input() sectionCode: string;
  @Input() kpiCriteriaCode: string;
  @Input() title: string;
  @Input() isEditMode: boolean;
  @Input() isFormOpen = true;

  competitiveObject = {
    progressReportKPICompetitiveGrants: {
      projectTitle: null, projectStartDate: null, projectEndDate: null,
      nameOfGrantReceived: null, projectReferenceNo: null, sponsorCode: null, recipientOfGrant: null,
      hostInsitution: null, directCost: null, indirectCost: null, comments: null
    }
  };
  progressReportDetails: any = [];
  map = new Map();
  isSaving = false;
  editIndex: number = null;
  deleteIndex: number;
  sponsorSearchOptions: any = {};
  progressReportId = '';
  clearFundingAgency: String;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];

  constructor(public _kpiFormService: ProgressReportKpiFormsService, public _commonService: CommonService,
    private _activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
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
    this.map.clear();
    this.editIndex = index;
    this.competitiveObject.progressReportKPICompetitiveGrants = Object.assign({}, data);
    this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate =
           data.projectStartDate ? getDateObjectFromTimeStamp(data.projectStartDate) : null;
    this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate =
           data.projectEndDate ? getDateObjectFromTimeStamp(data.projectEndDate) : null;
    this.sponsorSearchOptions.defaultValue = data && data.sponsor.sponsorName ? data.sponsor.sponsorName : null;
    this.clearFundingAgency = new String('false');
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate =
                parseDateWithoutTimestamp(this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate);
    this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate =
                parseDateWithoutTimestamp(this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.competitiveObject.progressReportKPICompetitiveGrants['progressReportId'] = this.progressReportId;
    this.competitiveObject.progressReportKPICompetitiveGrants['kpiCompetitiveGrantsId'] = this.getKpiCompetitiveGrantsId();
    this.competitiveObject.progressReportKPICompetitiveGrants['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.competitiveObject.progressReportKPICompetitiveGrants['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.competitiveObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.getDatesWithoutTimeStamp();
  }

  /** Returns the unique kpiCompetitiveGrantsId if present, otherwise null.*/
  getKpiCompetitiveGrantsId() {
    return this.competitiveObject.progressReportKPICompetitiveGrants['kpiCompetitiveGrantsId'] && (this.editIndex !== null) ?
           this.competitiveObject.progressReportKPICompetitiveGrants['kpiCompetitiveGrantsId'] : null;
  }

  /**
   * @param  {} competitiveObject = this.competitiveObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiCompetitiveForm(competitiveObject = this.competitiveObject) {
    this.setRequiredKpiObjects();
    if (this.kpiFormValidation() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(competitiveObject)
        .subscribe((data: any) => {
          this.pushDataToArray(data);
          this.editIndex === null ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry added successfully.') :
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
    if (this.editIndex === null) {
      this.progressReportDetails.push(data.progressReportKPICompetitiveGrants);
    } else {
      this.progressReportDetails[this.editIndex] = data.progressReportKPICompetitiveGrants;
    }
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.projectTitle) {
      this.map.set('projectTitle', 'title');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate) {
      this.map.set('ProjectStartDate', 'startDate');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate) {
      this.map.set('projectEndDate', '* Please pick a End Date.');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.nameOfGrantReceived) {
      this.map.set('nameOfGrantReceived', 'nameOfGrantReceived');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.projectReferenceNo) {
      this.map.set('projectReferenceNo', 'projectReferenceNo');
    }
    if (!this.sponsorSearchOptions.defaultValue) {
      this.map.set('sponsorCode', 'sponsorCode');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.recipientOfGrant) {
      this.map.set('recipientOfGrant', 'recipientOfGrant');
    }
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.hostInsitution) {
      this.map.set('hostInsitution', 'hostInsitution');
    }
    this.competitiveObject.progressReportKPICompetitiveGrants.directCost =
        this.amountValidation(this.competitiveObject.progressReportKPICompetitiveGrants.directCost, 'directCost');
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.directCost &&
        this.competitiveObject.progressReportKPICompetitiveGrants.directCost !== 0) {
      this.map.set('directCost', 'directCost');
    }
    this.competitiveObject.progressReportKPICompetitiveGrants.indirectCost =
        this.amountValidation(this.competitiveObject.progressReportKPICompetitiveGrants.indirectCost, 'indirectCost');
    if (!this.competitiveObject.progressReportKPICompetitiveGrants.indirectCost &&
        this.competitiveObject.progressReportKPICompetitiveGrants.indirectCost !== 0) {
      this.map.set('indirectCost', 'indirectCost');
    }
    this.validateEndDate();
    return this.map.size > 0 ? false : true;
  }

  /** Clears all the fields - on modal close, on modal trigger. */
  clearFieldValues() {
    this.competitiveObject.progressReportKPICompetitiveGrants.projectTitle = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.nameOfGrantReceived = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.projectReferenceNo = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.sponsorCode = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.recipientOfGrant = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.hostInsitution = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.directCost = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.indirectCost = null;
    this.competitiveObject.progressReportKPICompetitiveGrants.comments = null;
    this.clearFundingAgency = new String('true');
    this.map.clear();
  }

  /** Validates end date before save - restrict scenarios where start date is greater than end date.*/
  validateEndDate() {
    this.map.delete('ProjectEndDate');
    if (this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate &&
      this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate) {
      if (compareDates(this.competitiveObject.progressReportKPICompetitiveGrants.projectStartDate,
        this.competitiveObject.progressReportKPICompetitiveGrants.projectEndDate) === 1) {
        this.map.set('ProjectEndDate', '* Please select an end date after start date');
      }
    }
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.progressReportDetails[this.deleteIndex].kpiCompetitiveGrantsId;
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
  sponsorChangeFunction(event: any) {
    this.sponsorSearchOptions.defaultValue = event ? getSponsorSearchDefaultValue(event) : null;
    this.competitiveObject.progressReportKPICompetitiveGrants.sponsorCode = event ? event.sponsorCode : null;
    this.competitiveObject.progressReportKPICompetitiveGrants['sponsor'] = event ? event : null;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  amountValidation(fieldValue: number, fieldName: string): number {
    fieldValue = convertToValidAmount(fieldValue);
    this.map.delete(fieldName);
    if (inputRestrictionForAmountField(fieldValue)) {
      this.map.set(fieldName, 'true');
    }
    return fieldValue;
  }

}
