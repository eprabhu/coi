import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ProgressReportService } from '../services/progress-report.service';
import { CommonDataService } from '../services/common-data.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { deepCloneObject, setFocusToElement } from '../../common/utilities/custom-utilities';
import {
    compareDates,
    getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../../common/utilities/date-utilities';
import { AutoSaveService } from '../../common/services/auto-save.service';


@Component({
    selector: 'app-progress-report-overview',
    templateUrl: './progress-report-overview.component.html',
    styleUrls: ['./progress-report-overview.component.css']
})
export class ProgressReportOverviewComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    progressReportDetails: any = {};
    futurePlansNSummaryData: any = [];
    tempFuturePlansNSummaryData: any = [];
    isEditMode: boolean;
    isAwardDetailsCollapsed = true;
    validationMap = new Map();
    reportClassCode;
    reportingPeriod: any = {};
    tempReportingPeriod: any = {};
    isFuturePlanUpdating = false;
    warningMessage = '';

    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;

    constructor(private _route: ActivatedRoute,
                public _commonData: CommonDataService,
                public _ProgressReportService: ProgressReportService,
                public commonService: CommonService,
                private _autoSaveService: AutoSaveService) {
    }

    ngOnInit() {
        this.getFuturePlansNSummaryDetails();
        this.triggerAutoSaveEvent();
        this.getEditMode();
        this._commonData.progressReportTitle = this.progressReportDetails.awardProgressReport.title;
        this._autoSaveService.initiateAutoSave();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.stopAutoSaveEvent();
    }

    triggerAutoSaveEvent() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(event =>
            this.validateAndSaveSummaryAndReportingPeriod()
        ));
    }

    /**
     * this.progressReportDetails {} variable used to show award details in html.
     * futurePlansNSummaryData [] used to pass Future Plans and Summary of Progress to child component.
     */
    getFuturePlansNSummaryDetails() {
        this.$subscriptions.push(this._commonData.getProgressReportData().subscribe((data: any) => {
            if (data && data.awardProgressReport) {
                this.progressReportDetails = deepCloneObject(data);
                this.reportClassCode = this.progressReportDetails.awardProgressReport.reportClassCode;
                this.futurePlansNSummaryData = deepCloneObject(data.awardProgressReport.awardProgressReportAchievements);
                this.tempFuturePlansNSummaryData = deepCloneObject(data.awardProgressReport.awardProgressReportAchievements);
            }
        }));
    }

    setTempReportingPeriod(reportStartDate, reportEndDate, title) {
        this.tempReportingPeriod = {reportStartDate, reportEndDate, title};
    }

    setReportingPeriod(): void {
        if (!this.isEditMode || this.isFuturePlanUpdating) {
            return;
        }
        const {reportStartDate, reportEndDate} = this.progressReportDetails.awardProgressReport;
        const title = this.progressReportDetails.awardProgressReport.title;
        this.setTempReportingPeriod(reportStartDate, reportEndDate, title);
        this.reportingPeriod.reportStartDate = getDateObjectFromTimeStamp(reportStartDate);
        this.reportingPeriod.reportEndDate = getDateObjectFromTimeStamp(reportEndDate);
        this.reportingPeriod.title = this.progressReportDetails.awardProgressReport.title;
    }

    async validateAndSaveSummaryAndReportingPeriod() {
        const dataToValidate = {
            overviewFields: this.futurePlansNSummaryData,
            reportClassCode: this.reportClassCode,
            reportingPeriod: this.reportingPeriod,
            dueDate: this.progressReportDetails.awardProgressReport.dueDate,
            title: this.progressReportDetails.awardProgressReport.title
        };
        if (this._commonData.isOverviewTabFieldsValid(this.validationMap, dataToValidate) && this._commonData.isDataChange) {
            await this.UpdateFuturePlanNSummary();
            this.updateReportingPeriod();
        }
    }

    /**
     * futurePlansNSummaryData is Input to child component which show Future Plans and Summary Of Progress
     * Any changes will be reflected in the variable.
     * Why - since same component is used for showing both Future Plans and Summary of Progress,
     * click on 'Save' button in  parent component will trigger
     * two times.
     */
    async UpdateFuturePlanNSummary() {
        this.isFuturePlanUpdating = true;
        return new Promise((resolve, _reject) => {
            this.$subscriptions.push(this._ProgressReportService
                .updateProgressReportAchievements(this.getFuturePlanNSummaryRequestObj())
                .subscribe((progressReport: any) => {
                    this.progressReportDetails.awardProgressReport.awardProgressReportAchievements = this.futurePlansNSummaryData;
                    this.progressReportDetails.awardProgressReport.updateTimeStamp = progressReport.updateTimeStamp;
                    this.progressReportDetails.awardProgressReport.updatedPersonName = progressReport.updateUser;
                    this._commonData.setProgressReportData(this.progressReportDetails);
                    this.setUnsavedChanges(false);
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Overview successfully saved');
                    this.isFuturePlanUpdating = false;
                    resolve(true);
                }, err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save overview! Please try again');
                    this.isFuturePlanUpdating = false;
                    resolve(true);
                }));
        });
    }

    updateReportingPeriod(): void {
        this.$subscriptions.push(this._ProgressReportService
            .updateProgressReportDates(this.getReportingPeriodRequestObj())
            .subscribe((res: any) => {
                if (res) {
                    this.progressReportDetails.awardProgressReport.reportStartDate = res.reportStartDate;
                    this.progressReportDetails.awardProgressReport.reportEndDate = res.reportEndDate;
                    this.progressReportDetails.awardProgressReport.title = res.title;
                    this.progressReportDetails.awardProgressReport.updateTimeStamp = res.updateTimeStamp;
                    this.progressReportDetails.awardProgressReport.updatedPersonName = res.updateUser;
                    this._commonData.setProgressReportData(this.progressReportDetails);
                    this._commonData.progressReportTitle = res.title;
                    this.setUnsavedChanges(false);
                    if (this.warningMessage) {
                        this.warningMessage = '';
                    }
                }
            }));
    }

    /**
     * response will be updated fields,
     * futurePlansNSummaryData object is updated with new saved values after saving.
     */

    getEditMode() {
        this.$subscriptions.push(this._commonData.getEditMode().subscribe((data: boolean) => {
            this.isEditMode = data;
            this.setReportingPeriod();
        }));
    }

    cancelSave() {
        this.validationMap = new Map();
        this.setUnsavedChanges(false);
        this.futurePlansNSummaryData = deepCloneObject(this.tempFuturePlansNSummaryData);
        this.progressReportDetails.awardProgressReport.reportEndDate = this.tempReportingPeriod.reportEndDate;
        this.progressReportDetails.awardProgressReport.reportStartDate = this.tempReportingPeriod.reportStartDate;
        this.progressReportDetails.awardProgressReport.title = this.tempReportingPeriod.title;
        this.setReportingPeriod();
    }

    checkStartDateOverlapping(): void {
        this.setUnsavedChanges(true);
        if (this.reportingPeriod.reportStartDate && this.progressReportDetails.awardProgressReport.award.beginDate) {
            if (this.isStartDateBeforeAwardDate()) {
                this.warningMessage = ' Warning: Selected start date is before award start date.';
            } else if (this.isStartDateBeforePreviousReportEndDate()) {
                this.warningMessage = ' Warning: A report with selected date already exist.';
            } else {
                this.warningMessage = '';
            }
        }
    }

    private isStartDateBeforePreviousReportEndDate() {
        return compareDates(
            this.reportingPeriod.reportStartDate,
            getDateObjectFromTimeStamp(this.progressReportDetails.awardProgressReport.lastReportEndDate)
        ) === -1;
    }

    private isStartDateBeforeAwardDate() {
        return compareDates(
            this.reportingPeriod.reportStartDate,
            getDateObjectFromTimeStamp(this.progressReportDetails.awardProgressReport.award.beginDate)
        ) === -1;
    }

    private getFuturePlanNSummaryRequestObj() {
        return {
            progressReportId: this.progressReportDetails.awardProgressReport.progressReportId,
            awardProgressReportAchievements: this.futurePlansNSummaryData
        };
    }

    private getReportingPeriodRequestObj() {
        return {
            progressReportId: this.progressReportDetails.awardProgressReport.progressReportId,
            reportStartDate: parseDateWithoutTimestamp(this.reportingPeriod.reportStartDate),
            reportEndDate: parseDateWithoutTimestamp(this.reportingPeriod.reportEndDate),
            title: this._commonData.progressReportTitle
        };
    }

    setUnsavedChanges(flag: boolean) {
        this._commonData.isDataChange = flag;
        this._autoSaveService.setUnsavedChanges('Reporting Period', 'reporting-period', flag, true);
        if (!flag) {
            this._autoSaveService.setUnsavedChanges('Summary Of Progress', 'summary-of-progress', flag, true);
            this._autoSaveService.setUnsavedChanges('Future Plans', 'future-plans', flag, true);
        }
    }

}
