/**
 * Author: Ayush Mahadev R
 * Last updated: Ayush Mahadev R - 29/01/2021.
 */
import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {Subscription} from 'rxjs';
import {CommonService} from '../../../../common/services/common.service';
import {ProgressReportKpiFormsService} from '../progress-report-kpi-forms.service';
import {ActivatedRoute} from '@angular/router';
import {subscriptionHandler} from '../../../../common/utilities/subscription-handler';
import {getDateObjectFromTimeStamp, parseDateWithoutTimestamp} from '../../../../common/utilities/date-utilities';
import {setFocusToElement} from '../../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-progress-report-kpi-form4',
    templateUrl: './progress-report-kpi-form4.component.html',
    styleUrls: ['./progress-report-kpi-form4.component.css']
})
export class ProgressReportKpiForm4Component implements OnInit, OnChanges, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() kpiCriteriaCode;
    @Input() title;
    @Input() isEditMode = false;
    @Input() isFormOpen = true;

    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    progressReportId = null;
    formObject = {
        kpiConferencePresentationId: null,
        nameOfPresenter: '',
        title: '',
        conferenceTitle: '',
        organiser: '',
        conferenceLocation: '',
        date: '',
        comments: '',
    };
    summaryDetail = [];
    formMap = new Map();
    isDataFetched = false;
    selectedIndex = null;
    selectedEntry = null;
    $subscriptions: Subscription[] = [];
    isSaving = false;

    constructor(private _commonService: CommonService,
                private _progressReportKpiFormsService: ProgressReportKpiFormsService,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
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
        this.resetFormData();
        this.selectedIndex = null;
    }

    editKpi(publication, index: number) {
        const entry = JSON.parse(JSON.stringify(publication));
        entry.date = getDateObjectFromTimeStamp(entry.date);
        this.formObject = entry;
        this.selectedIndex = index;
        $('#form-modal' + this.kpiSummaryId).modal('show');
    }

    /**
     * Checks if all mandatory fields are filled, returns true if all mandatory fields are filled.
     */
    kpiValidation() {
        this.formMap.clear();
        if (!this.formObject.nameOfPresenter) {
            this.formMap.set('nameOfPresenter', 'nameOfPresenter');
        }
        if (!this.formObject.title) {
            this.formMap.set('title', 'title');
        }
        if (!this.formObject.conferenceTitle) {
            this.formMap.set('conferenceTitle', 'conferenceTitle');
        }
        if (!this.formObject.organiser) {
            this.formMap.set('organiser', 'organiser');
        }
        if (!this.formObject.conferenceLocation) {
            this.formMap.set('conferenceLocation', 'conferenceLocation');
        }
        if (!this.formObject.date) {
            this.formMap.set('date', 'date');
        }
        return this.formMap.size <= 0;
    }

    getRequestObject() {
        const returnObject = {
            progressReportKPIConferencePresentation: {
                ...this.formObject,
                kpiSummaryId: this.kpiSummaryId,
                progressReportId: this.progressReportId,
                kpiCriteriaCode: this.kpiCriteriaCode
            },
            sectionCode: this.sectionCode
        };
        returnObject.progressReportKPIConferencePresentation.date =
            parseDateWithoutTimestamp(returnObject.progressReportKPIConferencePresentation.date);
        return returnObject;
    }

    processRequest() {
        if (this.kpiValidation() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: any) => {
                    if (this.selectedIndex === null) {
                        this.addEntryToList(res.progressReportKPIConferencePresentation);
                        if (!this.isFormOpen) {
                            this.isFormOpen = true;
                        }
                    } else {
                        this.updateEntryInList(res.progressReportKPIConferencePresentation, this.selectedIndex);
                    }
                    this._commonService
                        .showToast(HTTP_SUCCESS_STATUS, 'Entry ' + (this.selectedIndex === null ? 'added' : 'updated') + ' successfully.');
                    this.selectedIndex = null;
                    $('#form-modal' + this.kpiSummaryId).modal('hide');
                    this.resetFormData();
                    this.isSaving = false;
                }, err => {
                    this._commonService
                    .showToast(HTTP_ERROR_STATUS, 'Failed to ' + (this.selectedIndex === null ? 'add' : 'update') + ' entry.');
                    this.isSaving = false;
                }));
        }
    }

    addEntryToList(publication) {
        this.summaryDetail.push(publication);
    }

    updateEntryInList(publication, index) {
        this.summaryDetail[index] = publication;
    }

    resetFormData() {
        this.formObject = {
            kpiConferencePresentationId: null,
            nameOfPresenter: '',
            title: '',
            conferenceTitle: '',
            organiser: '',
            conferenceLocation: '',
            date: '',
            comments: ''
        };
    }

    deleteEntry({kpiConferencePresentationId}: any, index: number): void {
        this.$subscriptions.push(this._progressReportKpiFormsService
            .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiConferencePresentationId)
            .subscribe((res: any) => {
                this.summaryDetail.splice(index, 1);
                this.selectedIndex = null;
                this.selectedEntry = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.')));
    }

}
