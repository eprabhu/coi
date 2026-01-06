import { CommonService } from '../../../../common/services/common.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../../../services/common-data.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
declare var $: any;
@Component({
  selector: 'app-progress-report-kpi-form16',
  templateUrl: './progress-report-kpi-form16.component.html',
  styleUrls: ['./progress-report-kpi-form16.component.css']
})
export class ProgressReportKpiForm16Component implements OnInit, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() kpiCriteriaCode;
    @Input() title;
    @Input() isFormOpen = true;
    @Input() isEditMode: boolean;

    progressReportId = null;
    formObject = {
        type: '',
        date: null,
        kpiGrantSpecificId: null,
        comments: '',
    };
    isSaving = false;
    summaryDetail = [];
    mode = 'ADD';
    formMap = new Map();
    isDataFetched = false;
    selectedIndex = null;
    selectedEntry = null;
    $subscriptions: Subscription[] = [];
    helpText: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;

    constructor(private _commonService: CommonService,
                private _progressReportKpiFormsService: ProgressReportKpiFormsService,
                private _route: ActivatedRoute,
                private _commonDataService: CommonDataService) {
    }

    ngOnInit() {
        this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
        this.getIndividualKpiData();
        this.getHelpText();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnChanges(): void {
        if (this.kpiSummaryId && this.sectionCode && this.kpiCriteriaCode && (!this.isDataFetched)) {
            this.isDataFetched = true;
            this.getIndividualKpiData();
        }
    }

    getIndividualKpiData() {
        this.$subscriptions.push(this._progressReportKpiFormsService
            .loadProgressReportKPISummaryDetails(this.kpiSummaryId, this.sectionCode).subscribe((res: { summaryDetail }) => {
                this.summaryDetail = res.summaryDetail;
            }));
    }

    addEntry() {
        this.formMap.clear();
        this.mode = 'ADD';
        this.resetFormData();
        this.selectedIndex = null;
    }

    editKpi(grantSpecific, index: number) {
        this.formMap.clear();
        this.formObject = JSON.parse(JSON.stringify(grantSpecific));
        this.formObject.date = getDateObjectFromTimeStamp(this.formObject.date);
        this.selectedIndex = index;
        this.mode = 'EDIT';
        $('#form-modal' + this.kpiSummaryId).modal('show');
    }

    /**
     * Checks if all mandatory fields are filled, returns true if all mandatory fields are filled.
     */
    kpiValidation() {
        this.formMap.clear();
        if (!this.formObject.type) {
            this.formMap.set('type', 'type');
        }
        if (!this.formObject.date) {
            this.formMap.set('date', 'date');
        }
        return this.formMap.size <= 0;
    }

    getRequestObject() {
        return {
            progressReportKPIGrantSpecific: {
                ...this.formObject,
                date: parseDateWithoutTimestamp(this.formObject.date),
                kpiSummaryId: this.kpiSummaryId,
                progressReportId: this.progressReportId,
                kpiCriteriaCode: this.kpiCriteriaCode
            },
            sectionCode: this.sectionCode
        };
    }

    processRequest() {
        if (this.kpiValidation() && !this.isSaving) {
          this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: { progressReportKPIGrantSpecific }) => {
                    if (this.mode === 'ADD') {
                        this.addEntryToList(res.progressReportKPIGrantSpecific);
                        if (!this.isFormOpen) { this.isFormOpen = true; }
                    } else {
                        this.updateEntryInList(res.progressReportKPIGrantSpecific, this.selectedIndex);
                        this.selectedIndex = null;
                    }
                    this._commonService
                        .showToast(HTTP_SUCCESS_STATUS, 'Entry ' + (this.mode === 'ADD' ? 'added' : 'updated') + ' successfully.');
                    $('#form-modal' + this.kpiSummaryId).modal('hide');
                    this.isSaving = false;
                    this.resetFormData();
                }, err => {
                    this._commonService
                    .showToast(HTTP_ERROR_STATUS, 'Failed to ' + (this.mode === 'ADD' ? 'add' : 'update') + ' entry.');
                    this.isSaving = false;
                }));
        }
    }

    addEntryToList(grantSpecific) {
        this.summaryDetail.push(grantSpecific);
    }

    updateEntryInList(grantSpecific, index) {
        this.summaryDetail[index] = grantSpecific;
    }

    resetFormData() {
        this.formObject = {
            type: '',
            date: null,
            kpiGrantSpecificId: null,
            comments: ''
        };
    }

    deleteEntry({kpiGrantSpecificId}: any, index: number): void {
        if (!this.isSaving) {
          this.isSaving = true;
        this.$subscriptions.push(this._progressReportKpiFormsService
            .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiGrantSpecificId)
            .subscribe((res: any) => {
                this.summaryDetail.splice(index, 1);
                this.selectedIndex = null;
                this.selectedEntry = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
                this.isSaving = false;
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.')));
            this.isSaving = false;
    }}

    getHelpText() {
        if (this._commonDataService.helpText.length) {
            this.helpText = this._commonDataService.helpText;
        } else {
            this.$subscriptions.push(this._progressReportKpiFormsService
                .fetchHelpText({ 'moduleCode': 16, 'sectionCodes': [1063]  }).subscribe((res: any) => {
                    if (res) {
                        this.helpText = res;
                        this._commonDataService.helpText = this.helpText;
                    }}));
            }
        }

}
