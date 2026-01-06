import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, AWARD_LABEL } from '../../app-constants';
import { openInNewTab, setFocusToElement } from '../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { ProgressReportCreateService } from './progress-report-create.service';
import { getEndPointOptionsForAwardNumber } from '../../common/services/end-point.config';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

declare var $: any;

@Component({
    selector: 'app-progress-report-create-modal',
    templateUrl: './progress-report-create-modal.component.html',
    styleUrls: ['./progress-report-create-modal.component.css'],
    providers: [ProgressReportCreateService]
})
export class ProgressReportCreateModalComponent implements OnInit, OnDestroy, OnChanges {

    @Input() createReportDetails: any = {
        title: null,
        dueDate: null,
        awardNumber: null,
        reportClassCode: null,
        awardId: null,
        reportStartDate: null,
        reportEndDate: null,
    };
    @Input() selectedAwardDetails: any = {};
    @Input() isAdhoc = false;
    @Input() uniqueId = 1;

    @Output() reportCreated: EventEmitter<number | null> = new EventEmitter<number | null>();
    @Output() createdProgressReport: EventEmitter<{} | null> = new EventEmitter<{} | null>();

    isSaving = false;
    warningMessage = '';
    isReportCreatable = true;
    createModalFormMap = new Map();
    awardSearchHttpOptions: any = {};
    prevReportEndDate: any;
    awardStartDate: any;
    $subscriptions: Subscription[] = [];
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    awardLabel = AWARD_LABEL;
    reportLabel: any;
    lookUp: any;


    constructor(private _progressReportCreateService: ProgressReportCreateService, public _commonService: CommonService) {
    }

    ngOnInit() {
        this.setAwardEndPointObject();
        this.getProgressReportLookUpData();
    }

    getProgressReportLookUpData() {
        this.$subscriptions.push(this._progressReportCreateService.getProgressReportLookUpData()
            .subscribe((result: any) => {
                this.lookUp = result;
            }));
    }

    ngOnChanges(changes: SimpleChanges) {
        this.convertTimestampsIfExistsAndOpenModal(changes);
        if (this.createReportDetails && this.createReportDetails.reportClassCode) {
            let reportType = this.lookUp.reportTypes.find((x) => x.reportCode == this.createReportDetails.reportCode);
            reportType = reportType ? ` - ${reportType.report.description}` : '';
            let reportClass = this.lookUp.reportClassList.find((x) => x.reportClassCode == this.createReportDetails.reportClassCode).description;
            this.reportLabel = `${reportClass}${reportType}`;
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    showModal(): void {
        $('#create-progress-final-modal' + this.uniqueId).modal('show');
    }

    createReport(): void {
        if (this.isReportCreatable && this.isFieldsValid()) {
            this.createProgressReport(this.createReportDetails, this.isAdhoc);
        }
    }

    clearCreateReportModalDetails(): void {
        this.setAwardEndPointObject();
        this.createModalFormMap.clear();
        this.selectedAwardDetails = {};
        this.createReportDetails.awardId = null;
        this.createReportDetails.awardNumber = null;
        this.createReportDetails.reportStartDate = null;
        this.createReportDetails.reportEndDate = null;
        this.createReportDetails.dueDate = null;
        this.createReportDetails.frequencyCode = null;
        // if (!this.isAdhoc) {
        //     
        // }
        this.createReportDetails.reportClassCode = null;
        this.createReportDetails.reportTrackingId = null;
        this.createReportDetails.sequenceNumber = null;
        this.isReportCreatable = true;
        this.awardStartDate = null;
        this.prevReportEndDate = null;
        this.warningMessage = '';
    }

    setAwardDetails(event): void {
        if (this.isAdhoc && !this.createReportDetails.reportClassCode) {
            this.createModalFormMap.set('reportClass', '* Please provide report class.');
            this.awardSearchHttpOptions.defaultValue = '';
            this.awardSearchHttpOptions = JSON.parse(JSON.stringify(this.awardSearchHttpOptions));

        } else {
            this.selectedAwardDetails = event || {};
            this.createReportDetails.title = (event && event.awardId) ? event.title : null;
            this.createReportDetails.awardId = (event && event.awardId) ? event.awardId : null;
            this.createReportDetails.awardNumber = (event && event.awardNumber) ? event.awardNumber : null;
            this.awardSearchHttpOptions.defaultValue = this.createReportDetails.awardNumber;
            this.awardSearchHttpOptions = JSON.parse(JSON.stringify(this.awardSearchHttpOptions));
            this.checkIfInProgressReportExist();
        }
    }

    checkStartDateOverlapping(): void {
        if (compareDates(this.createReportDetails.reportStartDate, this.awardStartDate) === -1) {
            this.warningMessage = ' Warning: Selected start date is before award start date.';
        } else if (compareDates(this.createReportDetails.reportStartDate, this.prevReportEndDate) === -1) {
            this.warningMessage = ' Warning: A report with selected date already exist.';
        } else {
            this.warningMessage = '';
        }
    }

    private convertTimestampsIfExistsAndOpenModal(changes: SimpleChanges): void {
        if ('createReportDetails' in changes) {
            this.convertDueDate();
            this.checkIfInProgressReportExist(true);
        }
    }

    private convertDueDate(): void {
        if (this.isATimestamp(this.createReportDetails.dueDate)) {
            this.createReportDetails.dueDate = getDateObjectFromTimeStamp(this.createReportDetails.dueDate);
        }
    }

    private isATimestamp(timestamp: any): boolean {
        if (!timestamp) {
            return false;
        }
        return ['string', 'number'].includes(typeof timestamp);
    }

    private isFieldsValid(): boolean {
        this.createModalFormMap.clear();
        if (!this.createReportDetails.awardId) {
            this.createModalFormMap.set('award', '* Please add an award.');
        }
        if (this.isAdhoc && !this.createReportDetails.reportClassCode) {
            this.createModalFormMap.set('reportClass', '* Please provide report class.');
        }
        if (!this.createReportDetails.reportStartDate) {
            this.createModalFormMap.set('reportStartDate', '* Please provide start date.');
        }
        if (!this.createReportDetails.reportEndDate) {
            this.createModalFormMap.set('reportEndDate', '* Please provide end date.');
        }
        if (!this.createReportDetails.dueDate) {
            this.createModalFormMap.set('dueDate', '* Please provide due date.');
        }
        if (this.createReportDetails.reportStartDate && this.createReportDetails.dueDate) {
            this.validateIfStartDateIsBeforeDueDate();
        }
        if (this.createReportDetails.reportStartDate && this.createReportDetails.reportEndDate) {
            this.validateIfStartDateIsBeforeEndDate();
        }
        return this.createModalFormMap.size <= 0;
    }

    private validateIfStartDateIsBeforeEndDate(): void {
        if (compareDates(this.createReportDetails.reportStartDate, this.createReportDetails.reportEndDate) === 1) {
            this.createModalFormMap.set('reportEndDate', '* End date should be after start date.');
        }
    }

    private validateIfStartDateIsBeforeDueDate(): void {
        if (compareDates(this.createReportDetails.reportStartDate, this.createReportDetails.dueDate) === 1) {
            this.isAdhoc ? this.createModalFormMap.set('dueDate', '* Due date should be after start date.') :
                this.createModalFormMap.set('reportStartDate', '* Start date should be before due date.');
        }
    }

    private createProgressReportRequestObject(
        {
            uniqueId,title, awardId, awardNumber, sequenceNumber, dueDate, reportClassCode,
            reportTrackingId, reportStartDate, reportEndDate, frequencyCode
        }) {
        return {
            awardProgressReport: {
                title,
                awardId,
                awardNumber,
                sequenceNumber,
                reportStartDate: parseDateWithoutTimestamp(reportStartDate),
                reportEndDate: parseDateWithoutTimestamp(reportEndDate),
                dueDate: parseDateWithoutTimestamp(dueDate),
                reportClassCode,
                awardReportTrackingId: reportTrackingId,
                uniqueId
            },
            frequencyCode
        };
    }

    private createProgressReport(report: any, isAdhocCreation: boolean): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const requestObject = this.createProgressReportRequestObject(report);
            this.$subscriptions.push(this._progressReportCreateService.saveOrUpdateProgressReport(requestObject).subscribe((res: any) => {
                if (res.status) {
                    document.getElementById('createModalClose').click();
                    const progressReportId = res.awardProgressReport.progressReportId;
                    this.reportCreated.emit(progressReportId);
                    this.createdProgressReport.emit(res.awardProgressReport);
                    openInNewTab('progress-report/overview?', ['progressReportId'], [progressReportId]);
                } else {
                    isAdhocCreation ? this.createModalFormMap.set('award', res.message) :
                        this._commonService.showToast(HTTP_ERROR_STATUS, res.message);
                }
                this.isSaving = false;
            }, err => {
                this.isSaving = false;
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to create report');
            }));
        }
    }

    private setAwardEndPointObject(): void {
        this.createReportDetails.awardId = null;
        this.awardSearchHttpOptions = getEndPointOptionsForAwardNumber();
    }

    private checkIfInProgressReportExist(showModal = false): void {
        if (this.createReportDetails.awardNumber && this.createReportDetails.awardId && this.createReportDetails.reportClassCode) {
            this._progressReportCreateService
                .getAwardProgressReportStartDate(this.createReportDetails)
                .subscribe((res: any) => {
                    this.isReportCreatable = !Boolean(res.inProgressPRExist);
                    if (!this.isReportCreatable && showModal) {
                        return this._commonService.showToast(HTTP_ERROR_STATUS,
                            'A report is already in progress for this award. Hence unable to create');
                    }
                    this.isReportCreatable ?
                        this.createModalFormMap.delete('award') :
                        this.createModalFormMap.set('award', '*A report is already in progress for this award. Hence unable to create');
                    const defaultSelectedStartDate = res.reportStartDate ? res.reportStartDate : res.awardStartDate;
                    this.awardStartDate = getDateObjectFromTimeStamp(res.awardStartDate);
                    this.prevReportEndDate = getDateObjectFromTimeStamp(defaultSelectedStartDate);
                    this.createReportDetails.reportStartDate = getDateObjectFromTimeStamp(defaultSelectedStartDate);
                    this.createReportDetails.reportEndDate = getDateObjectFromTimeStamp(res.reportEndDate);
                    this.warningMessage = '';
                    if (showModal) { this.showModal(); }
                }, err => {
                    if (showModal) { this.showModal(); }
                });
        } else {
            this.selectedAwardDetails = {};
        }
    }

}
