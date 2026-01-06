import { CommonService } from './../../../../common/services/common.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProgressReportKpiFormsService } from '../progress-report-kpi-forms.service';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';

declare var $: any;

@Component({
  selector: 'app-progress-report-kpi-form14',
  templateUrl: './progress-report-kpi-form14.component.html',
  styleUrls: ['./progress-report-kpi-form14.component.css']
})
export class ProgressReportKpiForm14Component implements OnInit, OnDestroy {

  @Input() kpiSummaryId;
  @Input() sectionCode;
  @Input() kpiCriteriaCode;
  @Input() title;
  @Input() isFormOpen = true;
  @Input() isEditMode: boolean;

  setFocusToElement = setFocusToElement;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  progressReportId = null;
  formObject = {
    kpiHealthSpecificOutcomeId: null,
    dateEstablished: null,
    title: null,
    numberOfLifeYears: null,
    comments: '',
  };
  isSaving = false;
  summaryDetail = [];
  mode = 'ADD';
  map = new Map();
  isDataFetched = false;
  selectedIndex = null;
  selectedEntry = null;
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

  editKpi(healthSpecificOutcomes, index: number) {
      this.formObject = JSON.parse(JSON.stringify(healthSpecificOutcomes));
      this.formObject.dateEstablished = getDateObjectFromTimeStamp(this.formObject.dateEstablished);
      this.selectedIndex = index;
      this.mode = 'EDIT';
      $('#form-modal' + this.kpiSummaryId).modal('show');
  }

  /**
   * Checks if anyone field is filled.to avoid all are null entry
   */
  kpiValidation() {
      this.map.clear();
      if (!this.formObject.dateEstablished) {
          this.map.set('dateEstablished', 'dateEstablished');
      }
      return this.map.size <= 0;
  }

  getRequestObject() {
      return {
          progressReportKPIHealthSpecificOutcomes: {
              ...this.formObject,
              kpiSummaryId: this.kpiSummaryId,
              progressReportId: this.progressReportId,
              kpiCriteriaCode: this.kpiCriteriaCode
          },
          sectionCode: this.sectionCode
      };
  }

  processRequest() {
    this.formObject.dateEstablished = parseDateWithoutTimestamp(this.formObject.dateEstablished);
      if (this.kpiValidation() && !this.isSaving) {
          this.isSaving = true;
          this.$subscriptions.push(this._progressReportKpiFormsService
              .saveOrUpdateKPISummaryDetails(this.getRequestObject()).subscribe((res: { progressReportKPIHealthSpecificOutcomes }) => {
                  if (this.mode === 'ADD') {
                      this.addEntryToList(res.progressReportKPIHealthSpecificOutcomes);
                      if (!this.isFormOpen) { this.isFormOpen = true; }
                  } else {
                      this.updateEntryInList(res.progressReportKPIHealthSpecificOutcomes, this.selectedIndex);
                      this.selectedIndex = null;
                  }
                  this._commonService
                      .showToast(HTTP_SUCCESS_STATUS, 'Entry ' + (this.mode === 'ADD' ? 'added' : 'updated') + ' successfully.');
                  $('#form-modal' + this.kpiSummaryId).modal('hide');
                  this.isSaving = false;
                  this.resetFormData();
              }, err => this._commonService
                  .showToast(HTTP_ERROR_STATUS, 'Failed to ' + (this.mode === 'ADD' ? 'add' : 'update') + ' entry.')));
          this.isSaving = false;
      }
  }

  addEntryToList(healthSpecificOutcomes) {
      this.summaryDetail.push(healthSpecificOutcomes);
  }

  updateEntryInList(healthSpecificOutcomes, index) {
      this.summaryDetail[index] = healthSpecificOutcomes;
  }

  resetFormData() {
      this.formObject = {
        kpiHealthSpecificOutcomeId: null,
        dateEstablished: '',
        title: null,
        numberOfLifeYears: null,
        comments: '',
      };
  }

  deleteEntry({ kpiHealthSpecificOutcomeId }: any, index: number): void {
      if (!this.isSaving) {
          this.isSaving = true;
          this.$subscriptions.push(this._progressReportKpiFormsService
              .deleteKPISummaryDetail(this.kpiSummaryId, this.sectionCode, kpiHealthSpecificOutcomeId)
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

