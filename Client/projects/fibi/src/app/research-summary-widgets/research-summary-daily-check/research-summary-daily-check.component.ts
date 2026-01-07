import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { compareDates, isValidDateFormat, parseDateWithoutTimestamp } from './../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { NavigationService } from '../../common/services/navigation.service';
import { setFocusToElement } from '../../common/utilities/custom-utilities'


@Component({
  selector: 'app-research-summary-daily-check',
  templateUrl: './research-summary-daily-check.component.html',
  styleUrls: ['./research-summary-daily-check.component.css'],
  animations: [fadeDown]
})
export class ResearchSummaryDailyCheckComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  summaryData: any = {};
  isShowLoader = false;
  widgetDescription: any;
  unitNumber: String = '';
  helpInfo = true;
  isInboxInfo = true;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  fromDate: any;
  toDate: any;
  dateValidationMap: Map<string, string> = new Map();
  startDate: any;
  endDate: any;
  unitName = '';
  descentFlag = null;
  DEFAULT_DATE_FORMAT = DEFAULT_DATE_FORMAT;
  fromDateValidationMap: boolean;
  toDateValidationMap: boolean;
  setFocusToElement = setFocusToElement;

  constructor(public _commonService: CommonService, private _router: Router,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _navigationService: NavigationService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(33);
    this.setDefaultWidgetDates();
    this.getSelectedUnit();
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
      if (data) {
        this.unitNumber = data.unitNumber;
        this.unitName = data.unitName;
        this.descentFlag = data.descentFlag;
      } else {
        this.unitNumber = '';
        this.unitName = '';
      }
      this.getResearchSummaryTable();
    }));
  }

  getResearchSummaryTable() {
    if (this.widgetDateValidation()) {
      this.isShowLoader = true;
      const fromDate = parseDateWithoutTimestamp(this.fromDate);
      const toDate = parseDateWithoutTimestamp(this.toDate);
      const REQUEST_DATA = {
        isAdmin: this._commonService.getCurrentUserDetail('unitAdmin'),
        unitNumber: this.unitNumber,
        tabName: 'RESEARCH_SUMMARY_BY_DEADLINE_DATE',
        startDate: fromDate,
        endDate: toDate,
        descentFlag: this.descentFlag
      };
      this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget(REQUEST_DATA)
        .subscribe((data: any) => {
          this.summaryData = data.widgetDatas || [];
          this.isShowLoader = false;
          this.startDate = this.fromDate;
          this.endDate = this.toDate;
        }, err => { this.isShowLoader = false; }));
    }
  }

  getDetailedResearchSummary(summaryLabel, count) {
    if (count !== 0) {
      this.setDateToService();
      this._router.navigate(['/fibi/expanded-widgets/research-summary-list'],
        { queryParams: this.getQueryParams(summaryLabel) });
    }
  }

  getQueryParams(summaryLabel) {
    const QUERY_PARAMS = {
      summaryIndex: '',
      summaryHeading: '',
      fromDate: parseDateWithoutTimestamp(this.startDate),
      toDate: parseDateWithoutTimestamp(this.endDate),
      UN: this.unitNumber,
      DF: this.descentFlag
    };

    switch (summaryLabel) {
      case 'Approval In Progress Proposals': QUERY_PARAMS.summaryIndex = 'PROPOSAL_APPROVAL_IN_PROGRESS_BY_DEADLINE_DATE';
        QUERY_PARAMS.summaryHeading = 'Approval In Progress Proposals'; break;
      case 'In Progress Proposals': QUERY_PARAMS.summaryIndex = 'PROPOSAL_INPROGRESS_BY_DEADLINE_DATE';
        QUERY_PARAMS.summaryHeading = 'In Progress Proposals'; break;
      case 'Submitted Proposals': QUERY_PARAMS.summaryIndex = 'PROPOSAL_SUBMITTED_BY_DEADLINE_DATE';
        QUERY_PARAMS.summaryHeading = 'Submitted Proposals'; break;
      case 'Total': QUERY_PARAMS.summaryIndex = 'PROPOSAL_RESEARCH_SUMMARY_BY_DEADLINE_DATE';
        QUERY_PARAMS.summaryHeading = 'All Proposals'; break;
      default: QUERY_PARAMS.summaryIndex = 'RESEARCH_SUMMARY_BY_DEADLINE_DATE';
        QUERY_PARAMS.summaryHeading = 'All Proposals By Deadline'; break;
    }
    return QUERY_PARAMS;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  widgetDateValidation(): boolean {
    this.dateValidationMap.clear();
    if (this.toDate != null) {
      if (compareDates(this.fromDate, this.toDate, 'dateObject', 'dateObject') === 1) {
        this.dateValidationMap.set('endDate', '* Please select to date after from date');
        this.summaryData = [];
      }
    }
    return this.dateValidationMap.size === 0 ? true : false;
  }

  setDefaultWidgetDates() {
    const IS_PREV_URL = this._navigationService.previousURL.includes('/fibi/expanded-widgets/research-summary-list');
    if (IS_PREV_URL &&
      (this._researchSummaryWidgetService.selectedDailyCheckFromDate || this._researchSummaryWidgetService.selectedDailyCheckToDate)) {
      this.toDate = this._researchSummaryWidgetService.selectedDailyCheckToDate;
      this.fromDate = this._researchSummaryWidgetService.selectedDailyCheckFromDate;
    } else {
      const currentDate = this.getSystemDate();
      this.fromDate = currentDate;
      this.toDate = currentDate;
      this.setDateToService();
    }
  }

  setDateToService() {
    this._researchSummaryWidgetService.selectedDailyCheckFromDate = this.fromDate;
    this._researchSummaryWidgetService.selectedDailyCheckToDate = this.toDate;
  }

  getSystemDate() {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  checkForValidFormat(event, dateType) {
    dateType === 'fromDate' ? this.fromDateValidationMap = false :
      this.toDateValidationMap = false;
    if (isValidDateFormat(event)) {
      this.getResearchSummaryTable();
    } else {
      dateType === 'fromDate' ? this.fromDateValidationMap = true :
        this.toDateValidationMap = true;
    }
  }

  clearDateOnValidation(id) {
    if (this.toDateValidationMap) {
      this.toDate = this.getSystemDate();
      this.toDateValidationMap = false;
    }
    if (this.fromDateValidationMap) {
      this.fromDate = this.getSystemDate();
      this.fromDateValidationMap = false;
    }
    setTimeout(() => {
      document.getElementById(id).click();
    });  
  }

}

