import { CommonService } from '../../common/services/common.service';
import { DEFAULT_DATE_FORMAT } from '../../app-constants';
import { NavigationService } from '../../common/services/navigation.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProgressReportListService } from './progress-report-list.service';
import { openInNewTab, pageScroll, setFocusToElement } from '../../common/utilities/custom-utilities';
import { itemAnim } from '../../common/utilities/animations';
import { Router } from '@angular/router';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { getEndPointOptionsForAwardNumber } from '../../common/services/end-point.config';
import {concatUnitNumberAndUnitName} from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-progress-report-list',
    templateUrl: './progress-report-list.component.html',
    styleUrls: ['./progress-report-list.component.css'],
    animations: [itemAnim]
})
export class ProgressReportListComponent implements OnInit, OnDestroy {

    DEFAULT_DATE_FORMAT = DEFAULT_DATE_FORMAT;
    result: any = {};
    sortCountObject: any = {};
    progressReportRequestList: any = [];
    isEmployeeFlag = true;
    sortMap: any = {};
    advSearchClearField: String;
    clearFieldLeadUnit: String;
    elasticPersonSearchOptions: any = {};
    leadUnitSearchOptions: any = {};
    $subscriptions: Subscription[] = [];
    $prList = new Subject();
    tempDashboardObject: any = {
        property1: '',
        property2: '',
        property3: '',
        property4: '',
        property5: '',
        property13: '',
        fullName: '',
        unitName: ''
    };
    createReportDetails: any = {
        dueDate: null,
        awardNumber: null,
        reportClassCode: null,
        awardId: null,
        reportStartDate: null,
        reportEndDate: null
    };
    isAdhoc = false;
    selectedAwardDetails: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    awardSearchHttpOptions: any = {};
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    constructor(public _progressReportListService: ProgressReportListService,
        private _elasticConfig: ElasticConfigService,
        private _navigationService: NavigationService,
        public _commonService: CommonService) {
    }

    ngOnInit() {
        this.setDashboardTab();
        this.loadDashboard();
        this.setSortProperties();
        this.setElasticPersonOptions();
        this.setLeadUnitSearchOptions();
        this.checkForAdvanceSearch();
        this.fetchDataIfNotCompletedTabIsSelected(this._progressReportListService.dashboardRequestObject.tabName);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setAwardEndPointObject() {
        this.createReportDetails.awardId = null;
        this.createReportDetails = JSON.parse(JSON.stringify(this.createReportDetails));
        this.awardSearchHttpOptions = getEndPointOptionsForAwardNumber();
    }

    /** Check if previous url includes fibi/progress-report, if not then clear Advanced Search fields */
    checkForAdvanceSearch() {
        if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/progress-report')) {
            document.getElementById('collapseProgressReport').classList.add('show');
            this.fetchDashboardDataToTempObject();
            this.setDefaultValueForCustomLibrarySearch();
            this._progressReportListService.dashboardRequestObject.advancedSearch = 'A';
        } else {
            this.clearAdvanceSearchField();
        }
    }

    /** temparory object is used other than using the same service object here because
     * If user provide a field in Advanced Search and without clicking on search button user choose a record from the list,
     * In this case when clicks on back icon and comes to dashboard list, previously done search list result should be displayed.
     * Logic : save new search criteria only if search button is clicked.
     */
    fetchDashboardDataToTempObject() {
        this.tempDashboardObject.property1 = this._progressReportListService.dashboardRequestObject.property1 ?
            this._progressReportListService.dashboardRequestObject.property1 : '';
        this.tempDashboardObject.property2 = this._progressReportListService.dashboardRequestObject.property2 ?
            this._progressReportListService.dashboardRequestObject.property2 : '';
        this.tempDashboardObject.property3 = this._progressReportListService.dashboardRequestObject.property3 ?
            this._progressReportListService.dashboardRequestObject.property3 : '';
        this.tempDashboardObject.property4 = this._progressReportListService.dashboardRequestObject.property4 ?
            this._progressReportListService.dashboardRequestObject.property4 : '';
        this.tempDashboardObject.property5 = this._progressReportListService.dashboardRequestObject.property5 ?
            this._progressReportListService.dashboardRequestObject.property5 : '';
        this.tempDashboardObject.property13 = this._progressReportListService.dashboardRequestObject.property13 ?
            this._progressReportListService.dashboardRequestObject.property13 : '';
        this.tempDashboardObject.fullName = this._progressReportListService.dashboardRequestExtraData.fullName ?
            this._progressReportListService.dashboardRequestExtraData.fullName : '';
        this.tempDashboardObject.unitName = this._progressReportListService.dashboardRequestExtraData.unitName ?
            this._progressReportListService.dashboardRequestExtraData.unitName : '';
        this.isEmployeeFlag = this._progressReportListService.dashboardRequestExtraData.isEmployeeFlag;
        (this.isEmployeeFlag) ? this.setElasticPersonOptions() : this.setElasticRolodexOption();
    }

    isAdvancedSearchMade() {
        if (this._progressReportListService.dashboardRequestObject.property1 ||
            this._progressReportListService.dashboardRequestObject.property2 ||
            this._progressReportListService.dashboardRequestObject.property3 ||
            this._progressReportListService.dashboardRequestObject.property4 ||
            this._progressReportListService.dashboardRequestObject.property5 ||
            this._progressReportListService.dashboardRequestObject.property13) {
            return true;
        } else {
            return false;
        }
    }

    /* Setting default value for end-point, elastic search */
    setDefaultValueForCustomLibrarySearch() {
        this.leadUnitSearchOptions.defaultValue = this._progressReportListService.dashboardRequestExtraData.unitName;
        this.elasticPersonSearchOptions.defaultValue = this._progressReportListService.dashboardRequestExtraData.fullName;
    }

    setDashboardTab() {
        this._progressReportListService.dashboardRequestObject.tabName = sessionStorage.getItem('currentProgressReportDashboardTab')
            ? sessionStorage.getItem('currentProgressReportDashboardTab') : 'PENDING_PR';
    }

    loadDashboard() {
        this.$subscriptions.push(this.$prList.pipe(
            switchMap(() =>
            this._progressReportListService.getProgressReportDashBoardList(this._progressReportListService.dashboardRequestObject)))
            .subscribe((data: any) => {
                this.result = data || [];
                if (this.result) {
                    this.progressReportRequestList = this.result.progressReportViews;
                }
            }));
    }

    setSortProperties() {
        this.resetSortObject();
        this.sortCountObject = (Object.entries(this._progressReportListService.sortCountObject).length === 0) ?
            this.sortCountObject : this._progressReportListService.sortCountObject;
        this.sortMap = (Object.entries(this._progressReportListService.dashboardRequestObject.sort).length === 0) ?
            this.sortMap : this._progressReportListService.dashboardRequestObject.sort;
    }

    resetSortObject() {
        this.sortMap = {};
        this.sortCountObject = {};
    }

    setCurrentTab(tabName: string) {
        this._progressReportListService.dashboardRequestObject.tabName = tabName;
        if (tabName === 'AWARD_QUALIFIED') {
            this._progressReportListService.dashboardRequestObject.property2 = '';
            this.tempDashboardObject.property2 = '';
        }
        sessionStorage.setItem('currentProgressReportDashboardTab', this._progressReportListService.dashboardRequestObject.tabName);
        this.progressReportRequestList = [];
        this.resetSortObject();
        this.clearAdvanceSearchField();
        this.fetchDataIfNotCompletedTabIsSelected(tabName);
        this._progressReportListService.dashboardRequestObject.currentPage = 1;
    }

    setLeadUnitSearchOptions() {
        this.leadUnitSearchOptions = this._progressReportListService.setHttpOptions('unitName', 'unitName', 'findDepartment', '', null);
    }

    navigateToReport(report: any, index: number) {
        if (this._progressReportListService.dashboardRequestObject.tabName !== 'AWARD_QUALIFIED') {
            openInNewTab('progress-report/overview?', ['progressReportId'], [report.progressReportId]);
        }
    }

    sortResult(sortFieldBy) {
        if (!this.sortCountObject.hasOwnProperty(sortFieldBy)) {
            this.sortCountObject[sortFieldBy] = 0;
        }
        this.sortCountObject[sortFieldBy]++;
        this._progressReportListService.dashboardRequestObject.sortBy = sortFieldBy;
        if (this.sortCountObject[sortFieldBy] < 3) {
            if (this._progressReportListService.dashboardRequestObject.sortBy === sortFieldBy) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
            }
        } else {
            this.sortCountObject[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this._progressReportListService.dashboardRequestObject.sort = this.sortMap;
        this._progressReportListService.sortCountObject = this.sortCountObject;
        this.$prList.next();
    }

    actionsOnPageChange(event) {
        this._progressReportListService.dashboardRequestObject.currentPage = event;
        this.$prList.next();
        pageScroll('pageScrollToTop');
    }

    clearAdvanceSearchField() {
        this._progressReportListService.dashboardRequestObject.property1 = '';
        this._progressReportListService.dashboardRequestObject.property2 = '';
        this._progressReportListService.dashboardRequestObject.property3 = '';
        this._progressReportListService.dashboardRequestObject.property4 = '';
        this._progressReportListService.dashboardRequestObject.property5 = '';
        this._progressReportListService.dashboardRequestObject.property13 = '';
        this._progressReportListService.dashboardRequestExtraData.unitName = '';
        this._progressReportListService.dashboardRequestExtraData.fullName = '';
        this._progressReportListService.dashboardRequestExtraData.isEmployeeFlag = true;
        this._progressReportListService.dashboardRequestObject.advancedSearch = 'L';
        this.clearFieldLeadUnit = new String('true');
        this.advSearchClearField = new String('true');

        this.tempDashboardObject.property1 = '';
        this.tempDashboardObject.property2 = '';
        this.tempDashboardObject.property3 = '';
        this.tempDashboardObject.property4 = '';
        this.tempDashboardObject.property5 = '';
        this.tempDashboardObject.property13 = '';
        this.tempDashboardObject.unitName = '';
        this.tempDashboardObject.fullName = '';
        this.isEmployeeFlag = true;
        this.setElasticPersonOptions();
    }

    /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
    changeMemberType() {
        this.advSearchClearField = new String('true');
        this.elasticPersonSearchOptions.defaultValue = '';
        (this.isEmployeeFlag) ? this.setElasticPersonOptions() : this.setElasticRolodexOption();
    }

    /**setElasticPersonOption - Set Elastic search option for Fibi Person */
    setElasticPersonOptions() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
    setElasticRolodexOption() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForRolodex();
    }

    setLeadUnitForAdvancedSearch(event) {
        (event) ? this.tempDashboardObject.property4 = event.unitNumber : this.tempDashboardObject.property4 = '';
        this.tempDashboardObject.unitName = event ? event.unitName : '';
    }

    /**
     * @param  {} event
     * if a person is employee then sets prncpl_id  to the json object otherwise sets rolodex_id.
     */
    selectedFilter(event) {
        this.tempDashboardObject.property3 = event ? this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id : '';
        this.tempDashboardObject.fullName = event ? event.full_name : '';
    }

    emptyValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this.tempDashboardObject.property3 = '';
        }
    }

    searchUsingAdvancedOptions() {
        if (this.isAdvancedSearchMade()) {
            this._progressReportListService.dashboardRequestObject.advancedSearch = 'A';
        } else {
            this._progressReportListService.dashboardRequestObject.advancedSearch = 'L';
        }
        this._progressReportListService.dashboardRequestObject.currentPage = 1;
        this.$prList.next();
    }

    setAdvanceSearchValuesToServiceObject() {
        this._progressReportListService.dashboardRequestObject.property1 = this.tempDashboardObject.property1 || '';
        this._progressReportListService.dashboardRequestObject.property2 = this.tempDashboardObject.property2 || '';
        this._progressReportListService.dashboardRequestObject.property3 = this.tempDashboardObject.property3 || '';
        this._progressReportListService.dashboardRequestObject.property4 = this.tempDashboardObject.property4 || '';
        this._progressReportListService.dashboardRequestObject.property5 = this.tempDashboardObject.property5 || '';
        this._progressReportListService.dashboardRequestObject.property13 = this.tempDashboardObject.property13 ?
                parseDateWithoutTimestamp(this.tempDashboardObject.property13) : '';
        this._progressReportListService.dashboardRequestExtraData.fullName = this.tempDashboardObject.fullName || '';
        this._progressReportListService.dashboardRequestExtraData.unitName = this.tempDashboardObject.unitName || '';
        this._progressReportListService.dashboardRequestExtraData.isEmployeeFlag = this.isEmployeeFlag;
    }

    setCreateModalData(qualifiedAward: any): void {
        const {
            title, dueDate, awardNumber, reportClassCode, awardId, reportStartDate, awardStartDate, reportTrackingId,
            reportEndDate, accountNumber, fullName: principalInvestigator, sponsor: sponsorName, unitName
        } = qualifiedAward;
        this.createReportDetails = {
            title, dueDate, awardNumber, reportClassCode, awardId, reportStartDate,
            reportEndDate, reportTrackingId , reportLabel: qualifiedAward.reportClassDescription
        };
        this.selectedAwardDetails = {title, awardNumber, accountNumber, principalInvestigator, sponsorName, unitName, awardStartDate};
    }

    private fetchDataIfNotCompletedTabIsSelected(currentTab: string): void {
        const isCompletedTab = currentTab === 'COMPLETED_PR';
        const isAwardQualifiedTab = currentTab === 'AWARD_QUALIFIED';
        if (!isCompletedTab || this._progressReportListService.dashboardRequestObject.advancedSearch === 'A') {
            this.removeSortFieldIfNotAvailable(isCompletedTab, isAwardQualifiedTab);
            this.$prList.next();
        }
        this.toggleAdvanceSearchSection(currentTab);
    }

    private removeSortFieldIfNotAvailable(isCompletedTab: boolean, isAwardQualifiedTab: boolean): void {
        // tslint:disable:no-unused-expression
        !isCompletedTab && delete this.sortMap['submittedDate'];
        !isAwardQualifiedTab && delete this.sortMap['reportType'];
    }

    private toggleAdvanceSearchSection(currentTab: string): void {
        if (currentTab === 'COMPLETED_PR' || this._progressReportListService.dashboardRequestObject.advancedSearch === 'A') {
            document.getElementById('collapseProgressReport').classList.add('show');
        } else {
            document.getElementById('collapseProgressReport').classList.remove('show');
        }
    }
}

