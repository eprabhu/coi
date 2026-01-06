/**
 * Author: Ayush Mahadev R
 * Last updated: Ayush Mahadev R - 29/01/2021.
 */
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../common/services/common.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-progress-report-kpi-form1',
    templateUrl: './progress-report-kpi-form1.component.html',
    styleUrls: ['./progress-report-kpi-form1.component.css']
})
export class ProgressReportKpiForm1Component implements OnInit, OnChanges, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() lookupData;
    @Input() kpiCriteriaCode;
    @Input() title;
    @Input() isEditMode = false;
    @Input() isFormOpen = true;

    progressReportId = null;
    formObject = {
        kpiImpactPublicationId: null,
        titleOfArticle: '',
        journalName: '',
        publisher: '',
        authorName: '',
        publicationStatusCode: null,
        publicationDate: null,
        pageNo: '',
        impactFactor: '',
        year: '',
        fundingAcknowledgement: '',
        comments: '',
    };
    summaryDetail = [];
    formMap = new Map();
    isDataFetched = false;
    selectedIndex = null;
    selectedEntry = null;
    isReadMore: any = {publisher: [], authorName: []};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
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
        this.formMap.clear();
        this.formObject = JSON.parse(JSON.stringify(publication));
        this.formObject.publicationDate = getDateObjectFromTimeStamp(this.formObject.publicationDate);
        this.selectedIndex = index;
        $('#form-modal' + this.kpiSummaryId).modal('show');
    }

    /**
     * Checks if all mandatory fields are filled, returns true if all mandatory fields are filled.
     */
    kpiValidation() {
        this.formMap.clear();
        if (!this.formObject.titleOfArticle) {
            this.formMap.set('titleOfArticle', 'titleOfArticle');
        }
        if (!this.formObject.journalName) {
            this.formMap.set('journalName', 'journalName');
        }
        if (!this.formObject.publisher) {
            this.formMap.set('publisher', 'publisher');
        }
        if (!this.formObject.authorName) {
            this.formMap.set('authorName', 'authorName');
        }
        if (!this.formObject.publicationStatusCode) {
            this.formMap.set('publicationStatusCode', 'publicationStatusCode');
        }
        if (!this.formObject.publicationDate) {
            this.formMap.set('publicationDate', 'publicationDate');
        }
        if (!this.formObject.pageNo) {
            this.formMap.set('pageNo', 'pageNo');
        }
        if (!this.formObject.impactFactor) {
            this.formMap.set('impactFactor', 'impactFactor');
        }
        if (!this.formObject.year) {
            this.formMap.set('year', 'year');
        }
        if (!this.formObject.fundingAcknowledgement) {
            this.formMap.set('fundingAcknowledgement', 'fundingAcknowledgement');
        }
        return this.formMap.size <= 0;
    }

    getRequestObject() {
        return {
            progressReportKPIImpactPublications: {
                ...this.formObject,
                publicationDate: parseDateWithoutTimestamp(this.formObject.publicationDate),
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
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: { progressReportKPIImpactPublications }) => {
                    if (this.selectedIndex === null) {
                        this.addEntryToList(res.progressReportKPIImpactPublications);
                        if (!this.isFormOpen) { this.isFormOpen = true; }
                    } else {
                        this.updateEntryInList(res.progressReportKPIImpactPublications, this.selectedIndex);
                    }
                    this._commonService
                        .showToast(HTTP_SUCCESS_STATUS, 'Entry ' + (this.selectedIndex === null ? 'added' : 'updated') + ' successfully.');
                    this.selectedIndex = null;
                    $('#form-modal' + this.kpiSummaryId).modal('hide');
                    this.resetFormData();
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to ' + (this.selectedIndex === null ? 'add' : 'update') + ' entry.')
                    this.isSaving = false;
                }));
        }
    }

    addEntryToList(publication) {
        publication.kpiPublicationStatus = this.getKpiPublicationStatus(publication.publicationStatusCode);
        this.summaryDetail.push(publication);
    }

    updateEntryInList(publication, index) {
        publication.kpiPublicationStatus = this.getKpiPublicationStatus(publication.publicationStatusCode);
        this.summaryDetail[index] = publication;
    }

    getKpiPublicationStatus(publicationStatusCode: string): any {
        const statusObject = this.lookupData.kpiPublicationStatus.find(status => status.publicationStatusCode === publicationStatusCode);
        return statusObject ? statusObject : {publicationStatusCode: null, description: ''};
    }

    resetFormData() {
        this.formObject = {
            kpiImpactPublicationId: null,
            titleOfArticle: '',
            journalName: '',
            publisher: '',
            authorName: '',
            publicationStatusCode: null,
            publicationDate: null,
            pageNo: '',
            impactFactor: '',
            year: '',
            fundingAcknowledgement: '',
            comments: ''
        };
    }

    deleteEntry({kpiImpactPublicationId}: any, index: number): void {
        this.$subscriptions.push(this._progressReportKpiFormsService
            .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiImpactPublicationId).subscribe((res: any) => {
                this.summaryDetail.splice(index, 1);
                this.selectedIndex = null;
                this.selectedEntry = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.')));
    }

}
