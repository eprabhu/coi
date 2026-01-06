/**Last updated by Prem Kumar P on 25/01/2021
 * section Code 4 - Manpower Development
 */

import { ActivatedRoute } from '@angular/router';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import {
    compareDates,
    getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

declare var $: any;

@Component({
    selector: 'app-progress-report-kpi-form3',
    templateUrl: './progress-report-kpi-form3.component.html',
    styleUrls: ['./progress-report-kpi-form3.component.css']
})
export class ProgressReportKpiForm3Component implements OnInit, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() lookupData;
    @Input() title;
    @Input() awardDetails;
    @Input() isEditMode;
    @Input() isFormOpen: Boolean = true;
    @Input() kpiCriteriaCode;

    summaryDetail = [];
    progressReportId = null;
    kpiManPowerDevForm = {
        kpiManpowerDevelopmentId: null,
        nameOfStudent: '',
        citizenship: '',
        currentStatusCode: null,
        dateEnrolled: null,
        dateGraduated: null,
        dateOfJoining: null,
        dateOfLeaving: null,
        comments: '',
    };
    mode = 'ADD';
    isSaving = false;
    selectedKPIIndexForDelete = null;
    selectedKPIForDelete = null;
    selectedKPIIndexForEdit = null;
    formMap = new Map();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];


    constructor(private _progressReportKpiFormsService: ProgressReportKpiFormsService, private _route: ActivatedRoute, public _commonService: CommonService) {
    }

    ngOnInit() {
        this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
        this.getIndividualKpiData();
    }

    ngOnDestroy(): void {
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

    clearDefaultValues() {
        this.formMap.clear();
        this.mode = 'ADD';
        this.resetkpiManPowerDevForm();
        this.selectedKPIIndexForEdit = null;
    }

    resetkpiManPowerDevForm() {
        this.kpiManPowerDevForm = {
            kpiManpowerDevelopmentId: null,
            nameOfStudent: '',
            citizenship: '',
            currentStatusCode: null,
            dateEnrolled: null,
            dateGraduated: null,
            dateOfJoining: null,
            dateOfLeaving: null,
            comments: '',
        };
    }

    deleteSelectedKPI() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode,
                    this.selectedKPIForDelete.kpiManpowerDevelopmentId)
                .subscribe((res: any) => {
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

    /** Save or Edit KPI details got from Add / Edit modal.*/
    processRequest() {
        if (this.kpiValidation() && !this.isSaving) {
            this.getDatesWithoutTimeStamp();
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((response: any) => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry added Successfully');
                    this.addToSummaryDetailsArray(response.progressReportKPIManpowerDevelopment);
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to Add entry');
                    this.isSaving = false;
                }));
            $('#manpower-form-modal' + this.kpiSummaryId).modal('hide');
        }
    }

    /** Removes timestamp from dates for passing it to backend. */
    getDatesWithoutTimeStamp() {
        this.kpiManPowerDevForm.dateEnrolled = this.kpiManPowerDevForm.dateEnrolled ? parseDateWithoutTimestamp(this.kpiManPowerDevForm.dateEnrolled) : null;
        this.kpiManPowerDevForm.dateGraduated = this.kpiManPowerDevForm.dateGraduated ? parseDateWithoutTimestamp(this.kpiManPowerDevForm.dateGraduated) : null;
        this.kpiManPowerDevForm.dateOfJoining = this.kpiManPowerDevForm.dateOfJoining ? parseDateWithoutTimestamp(this.kpiManPowerDevForm.dateOfJoining) : null;
        this.kpiManPowerDevForm.dateOfLeaving = this.kpiManPowerDevForm.dateOfLeaving ? parseDateWithoutTimestamp(this.kpiManPowerDevForm.dateOfLeaving) : null;
    }

    /** Check if all mandatory fields are added. */
    kpiValidation() {
        this.formMap.clear();
        if (!this.kpiManPowerDevForm.nameOfStudent) {
            this.formMap.set('nameOfStudent', '* Please provide Name of Student.');
        }
        if (!this.kpiManPowerDevForm.currentStatusCode) {
            this.formMap.set('currentStatusCode', '* Please provide Current Status');
        }
        if (!this.kpiManPowerDevForm.dateOfJoining) {
            this.formMap.set('dateOfJoining', '* Please provide Date of Joining this Project');
        }
        this.validateDates();
        return this.formMap.size <= 0;
    }

    /**
     * Date Validations
     * Date of Joining should be between Award Begin Date and final expiration date. Date of Joining should be before date of Leaving.
     * Date Enrolled should be before Date Graducated/ Resigned.
     * getDateObjectFromTimeStamp is used to get Data Object without time zone.
     */
    validateDates() {
        if (this.kpiManPowerDevForm.dateOfJoining && (compareDates(getDateObjectFromTimeStamp(this.awardDetails.beginDate), this.kpiManPowerDevForm.dateOfJoining) === 1 ||
            compareDates(this.kpiManPowerDevForm.dateOfJoining, getDateObjectFromTimeStamp(this.awardDetails.finalExpirationDate)) === 1)) {
            this.formMap.set('dateOfJoining', ' * Please select a date between Award Effective Date and Award Final Date');
        }
        if (this.kpiManPowerDevForm.dateOfLeaving && (compareDates(getDateObjectFromTimeStamp(this.awardDetails.beginDate), this.kpiManPowerDevForm.dateOfLeaving) === 1 ||
            compareDates(this.kpiManPowerDevForm.dateOfLeaving, getDateObjectFromTimeStamp(this.awardDetails.finalExpirationDate)) === 1)) {
            this.formMap.set('dateOfLeaving', ' * Please select a date between Award Effective Date and Award Final Date');
        }
        if ((this.kpiManPowerDevForm.dateOfJoining && this.kpiManPowerDevForm.dateOfLeaving) &&
            (compareDates(this.kpiManPowerDevForm.dateOfJoining, this.kpiManPowerDevForm.dateOfLeaving) === 1)) {
            this.formMap.set('dateOfJoining', ' * Date of joining should be before date of leaving.');
        }
        if (this.kpiManPowerDevForm.dateEnrolled && this.kpiManPowerDevForm.dateOfJoining) {
            if (compareDates(this.kpiManPowerDevForm.dateEnrolled, this.kpiManPowerDevForm.dateOfJoining) === 1) {
                this.formMap.set('dateEnrolled', ' * Date Enrolled should be on or before Date of Joining this Project');
            }
        }
        if (this.kpiManPowerDevForm.dateEnrolled && this.kpiManPowerDevForm.dateGraduated) {
            if (compareDates(this.kpiManPowerDevForm.dateEnrolled, this.kpiManPowerDevForm.dateGraduated) === 1) {
                this.formMap.set('dateEnrolled', ' * Date Enrolled should be before Date Graduated/Resigned date.');
            }
        }
    }

    /**
     * @param  {any} kpiData
     * Pushes the data into the summaryDetail array depends on Add/Update actions. For adding a new entry, just pushes the data into the array
     * and while updating, pushes the data into that particular index.
     */
    addToSummaryDetailsArray(kpiData) {
        kpiData.kpiManpowerDevelopmentCurrentStatus = this.getKpiUpdatedStatus(kpiData.currentStatusCode);
        this.mode === 'ADD' ? this.summaryDetail.push(kpiData) : this.summaryDetail[this.selectedKPIIndexForEdit] = kpiData;
    }

    /** If statusCode is changed then its corresponding status has to be found from lookupdata */
    getKpiUpdatedStatus(updatedStatusCode) {
        const STATUS_OBJECT = this.lookupData.kpiManpowerDevelopmentCurrentStatus.find(status => status.currentStatusCode === updatedStatusCode);
        return STATUS_OBJECT ? STATUS_OBJECT : null;
    }

    getRequestObject() {
        return {
            progressReportKPIManpowerDevelopment: {
                ...this.kpiManPowerDevForm,
                kpiSummaryId: this.kpiSummaryId,
                progressReportId: this.progressReportId,
                kpiCriteriaCode: this.kpiCriteriaCode
            },
            sectionCode: this.sectionCode
        };
    }

    /** Edit KPI
     * @param selectedKPI
     * @param kpiIndex
     */

    editKPI(selectedKPI, kpiIndex) {
        this.kpiManPowerDevForm = JSON.parse(JSON.stringify(selectedKPI));
        this.kpiManPowerDevForm.dateEnrolled = getDateObjectFromTimeStamp(this.kpiManPowerDevForm.dateEnrolled);
        this.kpiManPowerDevForm.dateGraduated = getDateObjectFromTimeStamp(this.kpiManPowerDevForm.dateGraduated);
        this.kpiManPowerDevForm.dateOfJoining = getDateObjectFromTimeStamp(this.kpiManPowerDevForm.dateOfJoining);
        this.kpiManPowerDevForm.dateOfLeaving = getDateObjectFromTimeStamp(this.kpiManPowerDevForm.dateOfLeaving);
        this.selectedKPIIndexForEdit = kpiIndex;
        this.mode = 'EDIT';
        $('#manpower-form-modal' + this.kpiSummaryId).modal('show');
    }
}
