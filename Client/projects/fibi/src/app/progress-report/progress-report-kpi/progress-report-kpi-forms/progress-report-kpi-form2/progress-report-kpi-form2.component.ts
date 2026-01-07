/**
 * Author: Ayush Mahadev R
 * Last updated: Ayush Mahadev R - 29/01/2021.
 */
import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ProgressReportKpiFormsService} from '../progress-report-kpi-forms.service';
import {ActivatedRoute} from '@angular/router';
import {subscriptionHandler} from '../../../../common/utilities/subscription-handler';
import {setFocusToElement} from '../../../../common/utilities/custom-utilities';
import {DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {getDateObjectFromTimeStamp, parseDateWithoutTimestamp} from '../../../../common/utilities/date-utilities';
import {CommonService} from '../../../../common/services/common.service';

declare var $: any;

@Component({
    selector: 'app-progress-report-kpi-form2',
    templateUrl: './progress-report-kpi-form2.component.html',
    styleUrls: ['./progress-report-kpi-form2.component.css']
})
export class ProgressReportKpiForm2Component implements OnInit, OnChanges, OnDestroy {

    @Input() kpiSummaryId;
    @Input() sectionCode;
    @Input() lookupData;
    @Input() kpiCriteriaCode;
    @Input() title;
    @Input() isEditMode = false;
    @Input() isFormOpen = true;

    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    progressReportId = null;
    formObject = {
        kpiTechnologyDisclosureId: null,
        titleOfPatent: '',
        coveringCountries: '',
        authorName: '',
        dateOffilling: '',
        dateOfAward: '',
        technologyDisclosureStatusCode: null,
        fillingOffice: '',
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
        entry.dateOffilling = getDateObjectFromTimeStamp(entry.dateOffilling);
        entry.dateOfAward = getDateObjectFromTimeStamp(entry.dateOfAward);
        this.formObject = entry;
        this.selectedIndex = index;
        $('#form-modal' + this.kpiSummaryId).modal('show');
    }

    /**
     * Checks if all mandatory fields are filled, returns true if all mandatory fields are filled.
     */
    kpiValidation() {
        this.formMap.clear();
        if (!this.formObject.titleOfPatent) {
            this.formMap.set('titleOfPatent', 'titleOfPatent');
        }
        if (!this.formObject.coveringCountries) {
            this.formMap.set('coveringCountries', 'coveringCountries');
        }
        if (!this.formObject.authorName) {
            this.formMap.set('authorName', 'authorName');
        }
        if (!this.formObject.dateOffilling) {
            this.formMap.set('dateOffilling', 'dateOffilling');
        }
        if (!this.formObject.technologyDisclosureStatusCode) {
            this.formMap.set('technologyDisclosureStatusCode', 'technologyDisclosureStatusCode');
        }
        if (!this.formObject.fillingOffice) {
            this.formMap.set('fillingOffice', 'fillingOffice');
        }
        return this.formMap.size <= 0;
    }

    getRequestObject() {
        const returnObject = {
            progressReportKPITechnologyDisclosure: {
                ...this.formObject,
                kpiSummaryId: this.kpiSummaryId,
                progressReportId: this.progressReportId,
                kpiCriteriaCode: this.kpiCriteriaCode
            },
            sectionCode: this.sectionCode
        };
        returnObject.progressReportKPITechnologyDisclosure.dateOffilling =
            parseDateWithoutTimestamp(returnObject.progressReportKPITechnologyDisclosure.dateOffilling);
        returnObject.progressReportKPITechnologyDisclosure.dateOfAward =
            parseDateWithoutTimestamp(returnObject.progressReportKPITechnologyDisclosure.dateOfAward);
        return returnObject;
    }

    processRequest() {
        if (this.kpiValidation() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportKpiFormsService
                .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: any) => {
                    if (this.selectedIndex === null) {
                        this.addEntryToList(res.progressReportKPITechnologyDisclosure);
                        if (!this.isFormOpen) {
                            this.isFormOpen = true;
                        }
                    } else {
                        this.updateEntryInList(res.progressReportKPITechnologyDisclosure, this.selectedIndex);
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
        publication.kpiTechnologyDisclosureStatus = this.kpiTechnologyDisclosureStatus(publication.technologyDisclosureStatusCode);
        this.summaryDetail.push(publication);
    }

    updateEntryInList(publication, index) {
        publication.kpiTechnologyDisclosureStatus = this.kpiTechnologyDisclosureStatus(publication.technologyDisclosureStatusCode);
        this.summaryDetail[index] = publication;
    }

    kpiTechnologyDisclosureStatus(technologyDisclosureStatusCode: string): any {
        const statusObject = this.lookupData.kpiTechnologyDisclosureStatus
            .find(status => status.technologyDisclosureStatusCode === technologyDisclosureStatusCode);
        return statusObject ? statusObject : {technologyDisclosureStatusCode: null, description: ''};
    }

    resetFormData() {
        this.formObject = {
            kpiTechnologyDisclosureId: null,
            titleOfPatent: '',
            coveringCountries: '',
            authorName: '',
            dateOffilling: '',
            dateOfAward: '',
            technologyDisclosureStatusCode: null,
            fillingOffice: '',
            comments: ''
        };
    }

    deleteEntry({kpiTechnologyDisclosureId}: any, index: number): void {
        this.$subscriptions.push(this._progressReportKpiFormsService
            .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiTechnologyDisclosureId)
            .subscribe((res: any) => {
                this.summaryDetail.splice(index, 1);
                this.selectedIndex = null;
                this.selectedEntry = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete.')));
    }

}
