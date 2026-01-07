import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { ProgressReportService } from '../../../../progress-report/services/progress-report.service';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form8',
  templateUrl: './progress-report-kpi-form8.component.html',
  styleUrls: ['./progress-report-kpi-form8.component.scss']
})
export class ProgressReportKpiForm8Component implements OnInit, OnDestroy {
  @Input() kpiSummaryId: string;
  @Input() sectionCode: string;
  @Input() kpiCriteriaCode: string;
  @Input() title: string;
  @Input() awardDetails;
  @Input() isEditMode: boolean;
  @Input() isFormOpen = true;

  studentObject = {
    progressReportKPIUndergraduateStudent: {
      nameOfStudent: null, citizenship: null, currentStatusCode: null, dateOfJoining: null,
      dateOfLeaving: null, comments: null
    }
  };

  progressReportId = '';
  isSaving = false;
  studentDetails: any = [];
  editIndex: number = null;
  deleteIndex: number;
  map = new Map();
  lookUpData: any = [];
  underGraduateStudentId = null;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];

  constructor(public _kpiFormService: ProgressReportKpiFormsService, public _commonService: CommonService,
    private _activeRoute: ActivatedRoute, public _progressReportService: ProgressReportService) { }

  ngOnInit() {
    this.progressReportId = this._activeRoute.snapshot.queryParamMap.get('progressReportId');
    this.getGeneralKpiDetails();
    this.getLookUpValues();
  }

  /** Fetches all the Kpi details. This will persist all the values on tab switch or page reload. */
  getGeneralKpiDetails() {
    this.$subscriptions.push(this._kpiFormService.loadProgressReportKPISummaryDetails(this.kpiSummaryId, this.sectionCode)
      .subscribe((data: any) => {
        this.studentDetails = data.summaryDetail;
      }));
  }

  /** Fetches the lookup values for Student current status. */
  getLookUpValues() {
    this.$subscriptions.push(this._kpiFormService.loadProgressReportKPILookups().subscribe((data: any) => {
      this.lookUpData = data.kpiManpowerDevelopmentCurrentStatus;
    }));
  }

  /**
    * @param  {any} data
    * @param  {number} index
    * Binds all the values in the modal based on its corresponding index.
    * Here getDateObjectFromTimeStamp() is used to get date object from its timestamp.
    */
  editKpiStudentGraduationForm(data: any, index: number) {
    this.editIndex = index;
    this.studentObject.progressReportKPIUndergraduateStudent = Object.assign({}, data);
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfJoining =
      data.dateOfJoining ? getDateObjectFromTimeStamp(data.dateOfJoining) : null;
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfLeaving =
      data.dateOfLeaving ? getDateObjectFromTimeStamp(data.dateOfLeaving) : null;
  }

  /** Removes timestamp from project start and end dates for passing it to backend. */
  getDatesWithoutTimeStamp() {
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfJoining =
      parseDateWithoutTimestamp(this.studentObject.progressReportKPIUndergraduateStudent.dateOfJoining);
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfLeaving =
      parseDateWithoutTimestamp(this.studentObject.progressReportKPIUndergraduateStudent.dateOfLeaving);
  }

  /**
   * @param  {any} code
   * Sets the corresponding status object depends on changing the status dropdown.
   */
  getStatusObjectOnChange(code: any) {
    this.studentObject.progressReportKPIUndergraduateStudent['kpiManpowerDevelopmentCurrentStatus'] = this.getCurrentStatusObject(code);
  }

  /**
   * @param  {} code
   * returns the full object contains the current status on dropdown change.
   */
  getCurrentStatusObject(code) {
    return this.lookUpData.find(element => element.currentStatusCode === code);
  }

  /** Prepare the required objects for Save/Update actions other than assigned from html. */
  setRequiredKpiObjects() {
    this.studentObject.progressReportKPIUndergraduateStudent['progressReportId'] = this.progressReportId;
    this.studentObject.progressReportKPIUndergraduateStudent['kpiSummaryId'] = this.kpiSummaryId ? this.kpiSummaryId : null;
    this.studentObject.progressReportKPIUndergraduateStudent['kpiCriteriaCode'] = this.kpiCriteriaCode ? this.kpiCriteriaCode : null;
    this.studentObject.progressReportKPIUndergraduateStudent['kpiUnderGraduateStudId'] = this.getKpiUnderGraduateStudentId();
    this.studentObject['sectionCode'] = this.sectionCode ? this.sectionCode : null;
    this.getDatesWithoutTimeStamp();
  }

  /** Returns the unique kpiUnderGraduateStudId if present, otherwise null. */
  getKpiUnderGraduateStudentId() {
    return this.studentObject.progressReportKPIUndergraduateStudent['kpiUnderGraduateStudId'] && this.editIndex !== null ?
           this.studentObject.progressReportKPIUndergraduateStudent['kpiUnderGraduateStudId'] : null;
  }

  /**
   * @param  {} studentObject = this.studentObject
   * Saves the added entry to DB and lists in table.
   */
  addToKpiStudentGraduationForm(studentObject = this.studentObject) {
    this.setRequiredKpiObjects();
    if (this.kpiFormValidation() && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService.saveOrUpdateKPISummaryDetails(studentObject)
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
      this.studentDetails.push(data.progressReportKPIUndergraduateStudent);
    } else {
      this.studentDetails[this.editIndex] = data.progressReportKPIUndergraduateStudent;
    }
  }

  /** Validates the mandatory fields before Save.*/
  kpiFormValidation() {
    this.map.clear();
    if (!this.studentObject.progressReportKPIUndergraduateStudent.nameOfStudent) {
      this.map.set('nameOfStudent', 'nameOfStudent');
    }
    if (!this.studentObject.progressReportKPIUndergraduateStudent.dateOfJoining) {
      this.map.set('dateOfJoining', 'dateOfJoining');
    }
    if (!this.studentObject.progressReportKPIUndergraduateStudent.currentStatusCode) {
      this.map.set('currentStatusCode', 'currentStatusCode');
    } else {
      this.validateDate();
    }
    return this.map.size > 0 ? false : true;
  }

  /**
   * Validates end date before save - restrict scenarios where start date is greater than end date
   * Restricted both joining and leaving dates within award start and end dates.
   */
  private validateDate(): void {
    const {dateOfJoining, dateOfLeaving} = this.studentObject.progressReportKPIUndergraduateStudent;
    if (dateOfJoining && dateOfLeaving) {
      if (this.isDate1AfterThanDate2(dateOfJoining, dateOfLeaving)) {
        this.map.set('dateOfLeaving', '* Please select date of leaving after date of joining');
      }
    }
    if (this.awardDetails.beginDate && this.awardDetails.finalExpirationDate) {
      if (dateOfJoining && (this.isDateBeforeAwardStartDate(dateOfJoining) || this.isDateAfterAwardEndDate(dateOfJoining))) {
        this.map.set('dateOfJoining', ' * Please select a date between Award Effective Date and Award Final Date');
      }
      if (dateOfLeaving && (this.isDateBeforeAwardStartDate(dateOfLeaving) || this.isDateAfterAwardEndDate(dateOfLeaving))) {
        this.map.set('dateOfLeaving', ' * Please select a date between Award Effective Date and Award Final Date');
      }
    }
  }

  private isDate1AfterThanDate2 = (date1: any, date2: any): boolean =>
      (compareDates(getDateObjectFromTimeStamp(date1), getDateObjectFromTimeStamp(date2)) === 1)

  private isDateAfterAwardEndDate(date: any): boolean {
    return this.isDate1AfterThanDate2(date, this.awardDetails.finalExpirationDate);
  }

  private isDateBeforeAwardStartDate(date: any): boolean {
    return this.isDate1AfterThanDate2(this.awardDetails.beginDate, date);
  }

  /** Deletes the corresponding entry from DB based on index. */
  deleteFromKpiForm() {
    const DELETE_ID = this.studentDetails[this.deleteIndex].kpiUnderGraduateStudId;
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._kpiFormService
          .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, DELETE_ID)
          .subscribe((data: any) => {
            this.studentDetails.splice(this.deleteIndex, 1);
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
    this.studentObject.progressReportKPIUndergraduateStudent.nameOfStudent = null;
    this.studentObject.progressReportKPIUndergraduateStudent.citizenship = null;
    this.studentObject.progressReportKPIUndergraduateStudent.currentStatusCode = null;
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfJoining = null;
    this.studentObject.progressReportKPIUndergraduateStudent.dateOfLeaving = null;
    this.studentObject.progressReportKPIUndergraduateStudent.comments = null;
    this.map.clear();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
