import { CommonService } from './../../../../common/services/common.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { ActivatedRoute } from '@angular/router';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';

declare var $: any;
@Component({
    selector: 'app-progress-report-kpi-form15',
    templateUrl: './progress-report-kpi-form15.component.html',
    styleUrls: ['./progress-report-kpi-form15.component.css']
})
export class ProgressReportKpiForm15Component implements OnInit, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() kpiCriteriaCode;
    @Input() title;
    @Input() isFormOpen = true;
    @Input() isEditMode: boolean;

    setFocusToElement = setFocusToElement;
    progressReportId = null;
    formObject = {
        kpiPostDocsEmployedId: null,
        employmentStartDate: null,
        employeeName: null,
        nationality: null,
        permanentResidence: null,
        comments: '',
        identificationNumber: '',
    };
    isSaving = false;
    summaryDetail = [];
    mode = 'ADD';
    map = new Map();
    isDataFetched = false;
    selectedIndex = null;
    selectedEntry = null;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService,
        private _progressReportKpiFormsService: ProgressReportKpiFormsService,
        private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
        this.getIndividualKpiData();
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
        this.map.clear();
        this.mode = 'ADD';
        this.resetFormData();
        this.selectedIndex = null;
    }

    editKpi(grantSpecific, index: number) {
        this.formObject = JSON.parse(JSON.stringify(grantSpecific));
        this.formObject.employmentStartDate = getDateObjectFromTimeStamp(this.formObject.employmentStartDate);
        this.selectedIndex = index;
        this.mode = 'EDIT';
        $('#form-modal' + this.kpiSummaryId).modal('show');
    }

    /**
     * Checks if anyone field is filled.to avoid all are null entry
     */
    kpiValidation() {
        this.map.clear();
        if (!this.formObject.employmentStartDate) {
            this.map.set('employmentStartDate', 'employmentStartDate');
        }
        return this.map.size <= 0;
    }

    getRequestObject() {
        return {
            progressReportKPIPostDocsEmployed: {
                ...this.formObject,
                kpiSummaryId: this.kpiSummaryId,
                progressReportId: this.progressReportId,
                kpiCriteriaCode: this.kpiCriteriaCode
            },
            sectionCode: this.sectionCode
        };
    }

    processRequest() {
        this.formObject.employmentStartDate = parseDateWithoutTimestamp(this.formObject.employmentStartDate);
        if (this.kpiValidation() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: { progressReportKPIPostDocsEmployed }) => {
                    if (this.mode === 'ADD') {
                        this.addEntryToList(res.progressReportKPIPostDocsEmployed);
                        if (!this.isFormOpen) { this.isFormOpen = true; }
                    } else {
                        this.updateEntryInList(res.progressReportKPIPostDocsEmployed, this.selectedIndex);
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
            kpiPostDocsEmployedId: null,
            employmentStartDate: '',
            employeeName: null,
            nationality: null,
            permanentResidence: null,
            comments: '',
            identificationNumber: '',
        };
    }

    deleteEntry({ kpiPostDocsEmployedId }: any, index: number): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiPostDocsEmployedId)
                .subscribe((res: any) => {
                    this.summaryDetail.splice(index, 1);
                    this.selectedIndex = null;
                    this.selectedEntry = null;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
                    this.isSaving = false;
                }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.')));
            this.isSaving = false;
        }
    }
}
