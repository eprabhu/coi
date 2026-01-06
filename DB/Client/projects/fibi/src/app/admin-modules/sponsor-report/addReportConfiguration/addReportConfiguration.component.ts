import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SponsorReportService } from '../sponsor-report.service';
import { CommonService } from '../../../common/services/common.service';
import { Subject, Subscription } from 'rxjs';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { getEndPointOptionsForSponsor } from '../../../common/services/end-point.config';
import { ReportingRequirement } from '../sponsor-report-interface';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
declare var $: any;

@Component({
    selector: 'app-addReportConfiguration',
    templateUrl: './addReportConfiguration.component.html',
    styleUrls: ['./addReportConfiguration.component.css']
})
export class AddReportConfigurationComponent implements OnInit, OnDestroy {

    @Input() reportTermsLookup: any;
    @Output() addOrUpdate = new Subject();
    $subscriptions: Subscription[] = [];
    isAddReport = true;
    isEditReport = false;
    map = new Map();
    setFocusToElement = setFocusToElement;
    reportingEnds = 'onProjectEndDate';
    days = [];
    sponsorSearchOptions;
    sponsorFundingSchemes: any;
    sponsorClearField;
    reportingRequirementRO: ReportingRequirement = new ReportingRequirement();
    action: string;
    isViewMode: boolean;

    constructor(private _sponsorReportService: SponsorReportService, public _commonService: CommonService) {
    }

    ngOnInit() {
        this.sponsorSearchOptions = getEndPointOptionsForSponsor();
        this.modalAction();
    }

    // this function opens reporting requirement forms modal
    modalAction() {
        this.$subscriptions.push(this._sponsorReportService.$modalAction
            .subscribe((data: any) => {
                this.action = data.action;
                if (data.action === 'add') {
                    this.clearReportingRequirement();
                    this.reportingEnds = 'onProjectEndDate';
                    this.openModal();
                }
                if (data.action === 'update') {
                    this.setModalInputData(data);
                }
                if (data.action === 'view') {
                    this.setModalInputData(data);
                }
                this.isViewMode = data.action === 'view';
            }));
    }

    private setModalInputData(data: any) {
        this.getNumberOfDaysInMonth(data.reportData.month);
        this.setSaveObject(data);
        this.setReportingEnds();
        this.setDate();
        if (data.reportData.sponsor.sponsorCode) {
            this.sponsorSearchOptions.defaultValue = `${data.reportData.sponsor.sponsorCode} - ${data.reportData.sponsor.sponsorName}`;
            this.sponsorSearchOptions = JSON.parse(JSON.stringify(this.sponsorSearchOptions));
            this.fetchFundingScheme();
            this.fetchReportType('openModal');
        }
    }

    private setSaveObject(data: any) {
        this.reportingRequirementRO = new ReportingRequirement();
        this.reportingRequirementRO.sponsorReportId = data.reportData.sponsorReportId;
        this.reportingRequirementRO.reportClassCode = data.reportData.reportClassCode;
        this.reportingRequirementRO.reportCode = data.reportData.reportCode;
        this.reportingRequirementRO.frequencyCode = data.reportData.frequencyCode;
        this.reportingRequirementRO.frequencyBaseCode = data.reportData.frequencyBaseCode;
        this.reportingRequirementRO.useAsBaseDate = data.reportData.useAsBaseDate;
        this.reportingRequirementRO.endOnProjectEndDate = data.reportData.endOnProjectEndDate;
        this.reportingRequirementRO.customEndDate = data.reportData.customEndDate;
        this.reportingRequirementRO.endOnOccurrences = data.reportData.endOnOccurrences;
        this.reportingRequirementRO.sponsorCode = data.reportData.sponsorCode;
        this.reportingRequirementRO.month = data.reportData.month;
        this.reportingRequirementRO.baseDate = data.reportData.baseDate;
        this.reportingRequirementRO.day = data.reportData.day;
    }

    private setReportingEnds() {

        if (this.reportingRequirementRO.endOnProjectEndDate
            && this.reportingRequirementRO.endOnOccurrences === 0 && !this.reportingRequirementRO.customEndDate) {
            this.reportingEnds = 'onProjectEndDate';
        } else if (!this.reportingRequirementRO.endOnProjectEndDate
            && this.reportingRequirementRO.endOnOccurrences === 0 && this.reportingRequirementRO.customEndDate) {
            this.reportingEnds = 'onCustomEndDate';
        } else if (!this.reportingRequirementRO.endOnProjectEndDate
            && this.reportingRequirementRO.endOnOccurrences !== 0 && !this.reportingRequirementRO.customEndDate) {
            this.reportingEnds = 'after';
        }
    }

    private setDate() {
        if (this.reportingRequirementRO.baseDate) {
            this.reportingRequirementRO.baseDate = parseDateWithoutTimestamp(this.reportingRequirementRO.baseDate);
        }
        if (this.reportingRequirementRO.customEndDate) {
            this.reportingRequirementRO.customEndDate = parseDateWithoutTimestamp(this.reportingRequirementRO.customEndDate);

        }
    }

    openModal() {
        $('#addSponsorReports').modal('show');
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    fetchReportType(action = 'openModal') {
        if (this.reportingRequirementRO.reportClassCode && this.reportingRequirementRO.reportClassCode !== 'null') {
            this.$subscriptions.push(this._sponsorReportService.fetchReportTypeByReportClass(this.reportingRequirementRO.reportClassCode)
                .subscribe((data: any) => {
                    this.reportTermsLookup.reportList = data ? data : null;
                    if (action = 'openModal') {
                        this.openModal();
                    }
                }));
        } else {
            this.reportTermsLookup.reportList = null;
            this.reportingRequirementRO.reportCode = null;
        }

    }

    saveReport() {
        if (this.validateRepReq()) {
            this.setDate();
            this.$subscriptions.push(this._sponsorReportService.saveOrUpdateSponsorReport({ sponsorReport: this.reportingRequirementRO })
                .subscribe((data: any) => {
                    this.clearReportingRequirement();
                    this.addOrUpdate.next(data);
                    $('#addSponsorReports').modal('hide');
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reporting Requirement saved successfully.');
                },
                    (err) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save Reporting Requirement, Please try again.');
                    }
                ));
        }
    }

    fetchFundingScheme() {
        if (this.reportingRequirementRO.sponsorCode && this.reportingRequirementRO.sponsorCode !== 'null') {
            this.$subscriptions.push(
                this._sponsorReportService.fetchFundingSchemeBySponsor({ 'sponsorCode': this.reportingRequirementRO.sponsorCode })
                    .subscribe((data: any) => {
                        this.sponsorFundingSchemes = data.sponsorFundingSchemes ? data.sponsorFundingSchemes : null;
                    }));
        }
    }

    onSponsorSelect(event) {
        this.reportingRequirementRO.sponsorCode = (event == null) ? '' : event.sponsorCode;
        if (event == null) {
            this.sponsorFundingSchemes = null;
            this.reportingRequirementRO.fundingSchemeId = null;
        } else {
            this.fetchFundingScheme();
        }
    }

    onSelectReportingEnd(selectType: String) {
        switch (selectType) {
            case 'onProjectEndDate':
              this.reportingRequirementRO.endOnProjectEndDate = true;
              this.reportingRequirementRO.endOnOccurrences = 0;
              this.reportingRequirementRO.customEndDate = null;
              break;
            case 'onCustomEndDate':
              this.reportingRequirementRO.endOnProjectEndDate = false;
              this.reportingRequirementRO.endOnOccurrences = 0;
              break;
            case 'after':
              this.reportingRequirementRO.endOnProjectEndDate = false;
              this.reportingRequirementRO.customEndDate = null;
              break;
          }
      }

    clearReportingRequirement() {
        $('#addSponsorReports').modal('hide');
        this.reportingRequirementRO = new ReportingRequirement();
        this.sponsorSearchOptions.defaultValue = '';
        this.sponsorSearchOptions = JSON.parse(JSON.stringify(this.sponsorSearchOptions));
        this.reportingRequirementRO = JSON.parse(JSON.stringify(this.reportingRequirementRO));
        this.sponsorFundingSchemes = null;
        this.reportTermsLookup.reportList = null;
        this.map.clear();
    }

    validateRepReq() {
        this.map.clear();
        if (this.reportingEnds === 'onCustomEndDate' && !this.reportingRequirementRO.customEndDate) {
            this.map.set('awardEndsOn', 'Please enter reporting end date.');
        }
        if (this.reportingEnds === 'after' && this.reportingRequirementRO.endOnOccurrences === 0) {
            this.map.set('occurrence', 'Please enter number of occurrences.');
        }
        if (!this.reportingRequirementRO.sponsorCode) {
            this.map.set('sponsor', 'Please enter an sponsor.');
        }
        if (!this.reportingRequirementRO.reportClassCode) {
            this.map.set('reportClass', 'Please select an report class.');
        }
        if (!this.reportingRequirementRO.frequencyCode) {
            this.map.set('frequency', 'Please select an frequency.');
        }
        if (!this.reportingRequirementRO.frequencyBaseCode) {
            this.map.set('frequencyBase', 'Please select an frequency base.');
        }
        if (!this.reportingRequirementRO.baseDate && this.reportingRequirementRO.frequencyBaseCode === '6') {
            this.map.set('baseDate', 'Please select an base date.');
        }
        if (!this.reportingRequirementRO.day && this.reportingRequirementRO.frequencyBaseCode === '120') {
            this.map.set('day', 'Please select an day.');
        }
        if (!this.reportingRequirementRO.month && this.reportingRequirementRO.frequencyBaseCode === '120') {
            this.map.set('month', 'Please select an month.');
        }
        return this.map.size === 0;
    }

    getNumberOfDaysInMonth(month: number): void {
        this.days = [];
        this.reportingRequirementRO.day = null;
        let numberOfDays;
        if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
            numberOfDays = 31;

        } else if ([4, 6, 9, 11].includes(month)) {
            numberOfDays = 30;

        } else if (month === 2) {
            numberOfDays = 29;
        }
        this.days = Array.from({ length: numberOfDays }, (_, i) => i + 1);
    }
}
