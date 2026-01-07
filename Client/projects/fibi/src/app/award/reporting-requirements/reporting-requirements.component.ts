import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { CommonDataService } from '../services/common-data.service';
import { Subject, Subscription } from 'rxjs';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { ReportingRequirementsService } from './reporting-requirements.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { fileDownloader, setFocusToElement } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { parseDateWithoutTimestamp, compareDates } from '../../common/utilities/date-utilities';
import { AwardReport, AwardReportTracking, DataChange, ReportClass, FilterRO } from './reporting-requirements-interface';
import { debounceTime } from 'rxjs/operators';
declare var $;

@Component({
    selector: 'app-reporting-requirements',
    templateUrl: './reporting-requirements.component.html',
    styleUrls: ['./reporting-requirements.component.css'],
})
export class ReportingRequirementsComponent implements OnInit, OnDestroy, AfterViewInit {

    clearField: string;
    awardData: any;
    elasticSearchOptions: any;
    elasticPersonSearchOptions: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isDetailsOpen = [];
    isReplaceAttachmentEnabled = false;
    isEditEnabledForSection = false;
    selectedIndex;
    isModifiable = false;
    allReports: AwardReport[];
    isEdit: boolean;
    filterRO = new FilterRO();
    unFilteredReports: AwardReport[] = [];
    reportTrackingObject: AwardReportTracking = new AwardReportTracking();
    isActiveReport: boolean;
    createReportDetails: any = {
        dueDate: null,
        awardNumber: null,
        reportClassCode: null,
        awardId: null,
        reportStartDate: null,
        reportEndDate: null,
        reportCode: null
    };
    searchDateChange: any;
    reportTermsLookup: any;
    manageOnActiveAward: any = false;
    currentDueDate;
    isHelpTextEnable = false;
    topOffSet: number;
    reportLabel: any;
    uniqueComponentId: any;
    setDataToChild: Subject<DataChange> = new Subject();
    uploadedFiles: any = [];
    debounce = new Subject();

    constructor(private _reportTermsService: ReportingRequirementsService,
        public _commonService: CommonService,
        public _commonData: CommonDataService,
        private _elasticConfig: ElasticConfigService) {
    }

    ngOnInit() {
        this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
            if (data) {
                this.awardData = data.award;
                this.getReportTermsLookUp();
                this.setPermissions();
            }
            this.setElasticOptions();
        }));
        this.debounceFn();
    }

    debounceFn() {
        this.$subscriptions.push(this.debounce.pipe(debounceTime(500)).subscribe((e) => this.filterAllReports()));
    }

    ngAfterViewInit() {
        const header = document.getElementById('stickyAwardHeader').clientHeight;
        const nav = document.getElementById('fibiStickyMainHeader').clientHeight;
        this.topOffSet = header + nav;
    }

    getReportLabel(trackingId, data) {
        const result = data.find(item => {
            const tracking = item.awardReportTracking;
            return tracking.find(subItem => subItem.awardReportTrackingId === trackingId);
        });
        const reportName = result.reportName ? `- ${result.reportName}` : '';
        return result ? `${result.reportClass.description}  ${reportName}` : null;
    }

    // this function opens up the modal from actions in the list
    setDataToModal(data): void {
        switch (data.flag) {
            case 'nonProgressReport':
                this.setDataToNonProgressReportModal(data);
                break;
            case 'dueDate':
                this.setDataToDueDateModal(data);
                break;
            case 'progressReport':
                this.setDataToProgressReportModal(data);
                break;
            case 'deleteTracking':
                this.setDataToDeleteTrackingModal(data);
                break;
        }
    }
    private setDataToDeleteTrackingModal(data: any) {
        this.reportLabel = this.getReportLabel(data.data.awardReportTrackingId, this.unFilteredReports);
        this.reportTrackingObject = data.data;
        this.uniqueComponentId = data.uniqueComponentId;
        $('#deleteTracking').modal('show');
    }

    clearModalDataForNonProgressReport() {
        this.reportTrackingObject = null;
        this.uploadedFiles = [];
    }

    private setDataToProgressReportModal(data: any) {
        this.reportLabel = this.getReportLabel(data.data.trackingObj.awardReportTrackingId, this.unFilteredReports);
        this.reportTrackingObject = data.data.trackingObj;
        this.uniqueComponentId = data.uniqueComponentId;
        this.reportTrackingObject.dueDate = parseDateWithoutTimestamp(this.reportTrackingObject.dueDate);
        this.createProgressReportRequestObject(this.reportTrackingObject,
            data.data.reportClassCode, data.data.frequency, data.data.reportCode);
    }

    private setDataToDueDateModal(data: any) {
        this.reportLabel = this.getReportLabel(data.data.awardReportTrackingId, this.unFilteredReports);
        this.reportTrackingObject = data.data;
        this.uniqueComponentId = data.uniqueComponentId;
        this.reportTrackingObject.dueDate = this.currentDueDate = parseDateWithoutTimestamp(this.reportTrackingObject.dueDate);
        $('#dueDateEditModal').modal('show');
    }

    private setDataToNonProgressReportModal(data: any) {
        this.uploadedFiles = [];
        this.reportLabel = this.getReportLabel(data.data.awardReportTrackingId, this.unFilteredReports);
        this.reportTrackingObject = data.data;
        this.reportTrackingObject.activityDate = parseDateWithoutTimestamp(this.reportTrackingObject.activityDate);
        this.elasticSearchOptions.defaultValue = data.data.preparerName;
        this.elasticSearchOptions = JSON.parse(JSON.stringify(this.elasticSearchOptions));
        this.uniqueComponentId = data.uniqueComponentId;
        if (this.reportTrackingObject.awardReportTrackingFile) {
            this.uploadedFiles[0] = {
                name: this.reportTrackingObject.awardReportTrackingFile.fileName
            };
        }
        $('#nonProgressReportCreateModal').modal('show');
    }

    createProgressReportRequestObject({ awardId, awardNumber, sequenceNumber, dueDate, awardReportTrackingId, uniqueId },
        reportClassCode, frequencyCode, reportCode) {
        this.createReportDetails = {
            title: this.awardData.title,
            dueDate, reportTrackingId: awardReportTrackingId, sequenceNumber,
            awardNumber, reportClassCode, awardId, reportStartDate: null, reportEndDate: null, frequencyCode, reportCode, uniqueId
        };
    }

    runPostReportCreationProcesses(progressReport: {} | null): void {
        this.updateSearchData(
            {
                data: {
                    reportTracking: {
                        awardReportTrackingId: this.reportTrackingObject.awardReportTrackingId
                    },
                    progressReport: progressReport,
                }
                , flag: 'progressReport'
            });
        this.setDataChangeForChild(progressReport, 'progressReport');
    }

    saveReportTrackingDetails(reportTracking: AwardReportTracking) {
        this.setDataChangeForChild({ reportTracking, file: this.uploadedFiles }, 'saveTracking');
    }

    selectedPerson(event: any) {
        if (event !== null) {
            this.reportTrackingObject.preparerId = event.prncpl_id;
            this.reportTrackingObject.preparerName = event.full_name;
        } else {
            this.reportTrackingObject.preparerId = null;
            this.reportTrackingObject.preparerName = '';
        }
    }

    /**
    * statusCode = 5 : Closed Award status.
    */
    checkIfReportIsActive({ awardSequenceStatus = '', awardStatus = { statusCode: null } }) {
        if (awardSequenceStatus && awardStatus.statusCode) {
            const inactiveStatuses = ((awardSequenceStatus !== 'ACTIVE') ||
                (awardSequenceStatus === 'ACTIVE' && awardStatus.statusCode === '5'));
            this.isActiveReport = !inactiveStatuses;
        }
    }

    /**
   * @param  {number} index
   * function adds animation to the delete confirmation
   */
    deleteElement(): void {
        this.cancelPerviousDelete();
        const period = document.getElementById(`addedAttachment`);
        period.style.display = 'none';
        const deleteConfirmation = document.getElementById(`delete-confirmation`);
        deleteConfirmation.style.display = 'table-row';
        deleteConfirmation.classList.add('flip-top');
    }

    cancelPerviousDelete(): void {
        const existingDeleteConfirmation = document.querySelector('.flip-top');
        if (existingDeleteConfirmation) {
            this.cancelDeleteElement();
        }
    }
    /**
     * @param  {number} index
     * function adds animation to the delete confirmation on cancelling the delete operation
     */
    cancelDeleteElement(): void {
        const deleteConfirmation = document.getElementById(`delete-confirmation`);
        deleteConfirmation.style.display = 'none';
        deleteConfirmation.classList.remove('flip-top');
        const period = document.getElementById(`addedAttachment`);
        period.style.display = 'table-row';
        period.classList.add('flip-bottom');
    }

    addReportAttachment(files: any) {
        this.uploadedFiles = files;
    }

    deleteAttachment(): void {
        if (this.reportTrackingObject.awardReportTrackingFile) {
            this.setDataChangeForChild({ reportTracking: this.reportTrackingObject }, 'deleteAttachment');
        } else {
            this.uploadedFiles = [];
        }
    }

    downloadReportAttachment(attachment: any): void {
        this.$subscriptions.push(this._reportTermsService.downloadAwardReportTrackingAttachment(attachment.awardReportTrackingFileId)
            .subscribe(data => {
                fileDownloader(data, attachment.fileName);
            }, _err =>
                this._commonService
                    .showToast(HTTP_ERROR_STATUS, 'Downloading reporting requirement attachment failed. Please try again.')));
    }

    getReportTermsLookUp(): void {
        if (this.awardData.awardId) {
            this.$subscriptions.push(this._reportTermsService.reportsTermsLookUpData(this.awardData.awardId)
                .subscribe((result: any) => {
                    this.reportTermsLookup = result;
                    this.reportTermsLookup.frequencyBaseList =
                        this.reportTermsLookup.frequencyBaseList.filter(item => item.frequencyBaseCode !== '120');
                }));
            this.getReportsData();
        }
    }

    async setPermissions(): Promise<any> {
        this.isEdit = this._commonData.getSectionEditableFlag('109');
        if (this.awardData.awardSequenceStatus === 'PENDING') {
            this.isModifiable = true;
        } else {
            this.isModifiable = await this._commonService.checkPermissionAllowed('MAINTAIN_REPORTING_REQUIREMENTS');
        }

    }

    /**  Loads the reporting requirement list. */
    getReportsData(): void {
        this.$subscriptions.push(this._reportTermsService.reportsData(this.awardData.awardId)
            .subscribe((data: any) => {
                this.allReports = data.awardReportTerms || [];
                this.setAdhocProgressReport(data);
                this.groupByReportClassAndReportCode();
                this.unFilteredReports = JSON.parse(JSON.stringify(this.allReports));
                this.isEditEnabledForSection = data.isEditEnabledForSection;
                this.isReplaceAttachmentEnabled = data.isReplaceAttachmentEnabled;
                this.setIsManageOnActive(data);
                this.isHelpTextEnable = !this.isEditEnabledForSection;
            }));
    }

    private setIsManageOnActive(data: any) {
        if (this.awardData.awardSequenceStatus === 'ACTIVE' && data.manageInActiveAward) {
            this.manageOnActiveAward = this._commonService.checkPermissionAllowed('MAINTAIN_REPORTING_REQUIREMENTS');
        } else {
            this.manageOnActiveAward = false;
        }
    }

    /**  This function appends ADHOC report(report created from progress report module) into this report list according to report class*/
    private setAdhocProgressReport(data: any): void {
        data.adhocReportTrackings.forEach((tracking) => {
            let term;
            if (tracking.awardProgressReport) {
                term = this.allReports.find((el) => {
                    return el.reportClassCode == tracking.awardProgressReport.reportClassCode &&
                        (el.reportCode == '' || el.reportCode == null);
                });
                if (term) {
                    term.awardReportTracking.push(tracking);
                } else {
                    const newTerm = this.createNewReportTerm(tracking.awardProgressReport.reportClassCode);
                    newTerm.awardReportTracking.push(tracking);
                    this.allReports.push(newTerm);
                }
            }
        });
    }

    createNewReportTerm(reportClassCode): AwardReport {
        const awardReport = new AwardReport();
        awardReport.reportClassCode = reportClassCode;
        awardReport.reportClass = this.setReportClassForNewTerm(reportClassCode);
        return awardReport;
    }

    private setReportClassForNewTerm(reportClassCode: any) {
        const label = this.reportTermsLookup.reportClassList.find((el) => el.reportClassCode == reportClassCode);
        const reportClass = new ReportClass();
        reportClass.reportClassCode = reportClassCode;
        reportClass.description = label.description || '';
        reportClass.attachmentOrReport = 'R';
        reportClass.copyReport = false;
        reportClass.isActive = true;
        return reportClass;
    }

    // this function groups report trackings according to report class and report code
    private groupByReportClassAndReportCode(): void {
        this.sortReportClassByUpdateTimeStamp(this.allReports);
        const mergedReports = {};
        this.allReports.forEach((report) => {
            const key = `${report.reportClassCode}-${report.reportCode}`;
            if (mergedReports[key]) {
                mergedReports[key].awardReportTracking.push(...report.awardReportTracking);
            } else {
                mergedReports[key] = report;
            }
            const sortedTracking = this.sortAwardReportTracking(mergedReports[key].awardReportTracking);
            this.setSequentialStopForReportClass(sortedTracking, report);
        });
        this.allReports = Object.values(mergedReports);
    }

    private sortReportClassByUpdateTimeStamp(allReports: AwardReport[]) {
        allReports.sort((a: any, b: any) => {
            if (compareDates(a.updateTimestamp, b.updateTimestamp)) {
                return -1;
            } else {
                return 1;
            }
        });
    }

    filterAllReports(): void {
        const unFilteredReports: AwardReport[] = JSON.parse(JSON.stringify(this.unFilteredReports));
        this.allReports = unFilteredReports;
        if (this.filterRO.reportClassCode) {
            this.filterByReportClass(unFilteredReports);
        }
        if (this.filterRO.startDate && this.filterRO.endDate) {
            this.filterByStartDateAndEndDate();
        }
        if (this.filterRO.status) {
            this.filterByStatus();
        }
    }

    private filterByStatus(): void {
        this.allReports.forEach((el) => {
            el.awardReportTracking = el.awardReportTracking.filter((x) => {
                if (x.awardProgressReport) {
                    return x.awardProgressReport.progressReportStatus.description == this.filterRO.status;
                } else {
                    return this.reportTermsLookup.reportStatusList
                        .find((y) => y.statusCode == x.statusCode).description == this.filterRO.status;
                }
            });
        });
        this.allReports = JSON.parse(JSON.stringify(this.allReports));
    }

    private filterByStartDateAndEndDate(): void {
        const start = this.filterRO.startDate.startOf('day').toDate();
        const end = this.filterRO.endDate.startOf('day').toDate();
        this.allReports.forEach((el) => {
            el.awardReportTracking = el.awardReportTracking.filter((x) => {
                const dueDate = new Date(x.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return start <= dueDate && dueDate <= end;
            });
        });
        this.allReports = JSON.parse(JSON.stringify(this.allReports));
    }

    private filterByReportClass(unFilteredReports: AwardReport[]): void {
        this.allReports = unFilteredReports.filter((el) => {
            return el.reportClassCode == this.filterRO.reportClassCode;
        });
    }

    clearSearch() {
        this.allReports = JSON.parse(JSON.stringify(this.unFilteredReports));
    }

    /**
     * this function sets sequential report creation
     *  **/
    setSequentialStopForReportClass(awardReportTracking: AwardReportTracking[], report: AwardReport): void {
        if (report.reportClass.attachmentOrReport === 'R' || report.reportClass.attachmentOrReport === 'E') {
            this.setCreateReportForAllTrackings(awardReportTracking, false);
            report.reportClass.copyReport ?
                this.setSequentialStops(awardReportTracking) : this.setCreateReportForAllTrackings(awardReportTracking, true);
        }
    }
    private setSequentialStops(awardReportTracking: any) {
        const isProgressReportPresent =
            awardReportTracking.some(item => item.progressReportId && !item.awardReportTrackingFile && item.awardReportTermsId != null);
        isProgressReportPresent ?
            this.setCreateReportOnNextSequentialStep(awardReportTracking) : this.setCreateReportOnInitialStep(awardReportTracking);
    }

    private setCreateReportForAllTrackings(awardReportTracking: any, flag) {
        awardReportTracking.forEach(element => {
            element.createProgressReport = flag;
        });
    }

    private setCreateReportOnInitialStep(awardReportTracking: any) {
        const firstIndexWithoutReport = awardReportTracking
            .findIndex(item => !item.progressReportId && !item.awardReportTrackingFile && item.awardReportTermsId);
        if (firstIndexWithoutReport >= 0) {
            awardReportTracking[firstIndexWithoutReport].createProgressReport = true;
        }
    }

    setCreateReportOnNextSequentialStep(awardReportTracking) {
        const lastIndexWithoutProgressReport = this.getLastIndexWithoutProgressReport(awardReportTracking);
        if (lastIndexWithoutProgressReport >= 0) {
            this.setCreateReportAtLastIndexWithoutReport(awardReportTracking, lastIndexWithoutProgressReport);
        } else {
            return null;
        }
    }

    /**
   * progressReportStatusCode : 4 => Approved.
   */
    private setCreateReportAtLastIndexWithoutReport(awardReportTracking: any, lastIndexWithoutProgressReport: any) {
        const isApprovedReport = this.checkApprovedReport(awardReportTracking);
        awardReportTracking[lastIndexWithoutProgressReport].createProgressReport = isApprovedReport;
    }

    private checkApprovedReport(awardReportTracking: any) {
        const lastIndexWithProgressReport = this.getLastIndexWithReport(awardReportTracking);
        return awardReportTracking[lastIndexWithProgressReport].awardProgressReport.progressReportStatus.progressReportStatusCode === '4';
    }

    private getLastIndexWithoutProgressReport(awardReportTracking: any) {
        const lastIndexWithProgressReport = this.getLastIndexWithReport(awardReportTracking);
        const lastIndexWithoutProgressReport = awardReportTracking
            .findIndex((item, i) => lastIndexWithProgressReport < i
                && !item.progressReportId && !item.awardReportTrackingFile && item.awardReportTermsId);
        return lastIndexWithoutProgressReport;
    }

    private getLastIndexWithReport(awardReportTracking: any) {
        return awardReportTracking
            .findLastIndex(item => item.progressReportId && !item.awardReportTrackingFile && item.awardReportTermsId);
    }

    /**
    * this function sorts report tracking by due dates.
    */
    sortAwardReportTracking(list: any[]): any[] {
        list.sort((a: any, b: any) => {
            let first: any, second: any;
            first = new Date(a.dueDate);
            second = new Date(b.dueDate);
            if (first < second) {
                return -1;
            }
            if (first > second) {
                return 1;
            }
            return 0;
        });
        return list;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setElasticForRecipients() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    deleteReport(deleteReportList: AwardReport) {
        this.$subscriptions.push(this._reportTermsService.maintainReports({
            'awardReport': deleteReportList,
            'acType': 'D'
        }).subscribe((data: any) => {
            this.selectedIndex = null;
            this.updateSearchData({ data: deleteReportList, flag: 'deleteReport' });
            this.allReports = JSON.parse(JSON.stringify(this.allReports));
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Report deleted successfully.');
        }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete report, Please try again.')));
    }

    setElasticOptions() {
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    /**  this method sync the search variable in this component
    when any crud action is performed in the child component('reporting-requirement-detail-component)'
    so that search works properly when any data is changed
    */
    updateSearchData(e): void {
        this.syncReports(this.unFilteredReports, e);
        this.syncReports(this.allReports, e);
    }

    syncReports(reports: AwardReport[], action: any): void {
        action.flag === 'deleteReport' ? this.deleteAllTrackings(action, reports) : this.updateTrackingInParent(reports, action);
    }

    private updateTrackingInParent(reports: AwardReport[], action: any) {
        reports.forEach((report) => {
            const index = report.awardReportTracking
                .findIndex((x) => x.awardReportTrackingId === action.data.reportTracking.awardReportTrackingId);
            if (index >= 0) {
                switch (action.flag) {
                    case 'save':
                        this.saveReportTrackingInParent(report, index, action);
                        break;
                    case 'delete':
                        report.awardReportTracking.splice(index, 1);
                        break;
                    case 'deleteAttachment':
                        this.deleteAttachmentInParent(report, index);
                        break;
                    case 'progressReport':
                        this.addProgressReportInParent(report, index, action);
                        break;
                }
            }
        });
    }

    private saveReportTrackingInParent(report: AwardReport, index: number, action: any) {
        report.awardReportTracking.splice(index, 1, action.data.reportTracking);
        const files = action.data.reportTracking.awardReportTrackingFiles;
        if (files && files[0]) {
            report.awardReportTracking[index].awardReportTrackingFile = files[0];
        }
        this.sortAwardReportTracking(report.awardReportTracking);
        this.setSequentialStopForReportClass(report.awardReportTracking, report);
        this.allReports = JSON.parse(JSON.stringify(this.allReports));
    }

    private addProgressReportInParent(report: AwardReport, index: number, action: any) {
        report.awardReportTracking[index].awardProgressReport = action.data.progressReport;
        report.awardReportTracking[index].progressReportId = action.data.progressReport.progressReportId;
        this.setSequentialStopForReportClass(report.awardReportTracking, report);
        this.allReports = JSON.parse(JSON.stringify(this.allReports));
    }

    private deleteAttachmentInParent(report: AwardReport, index: number) {
        report.awardReportTracking[index].awardReportTrackingFile = null;
        this.reportTrackingObject.awardReportTrackingFile = null;
        this.setSequentialStopForReportClass(report.awardReportTracking, report);
        this.allReports = JSON.parse(JSON.stringify(this.allReports));
        this.uploadedFiles = [];
    }

    private deleteAllTrackings(action: any, reports: AwardReport[]) {
        const { reportClassCode, reportCode } = action.data;
        const index = reports.findIndex((el) => el.reportClassCode === reportClassCode && el.reportCode === reportCode);
        if (index !== -1) {
            reports[index].awardReportTracking = reports[index].awardReportTracking.filter((el) => {
                return el.awardReportTrackingFile || el.awardProgressReport || el.statusCode !== '1';
            });
            if (reports[index].awardReportTracking.length === 0) {
                reports.splice(index, 1);
            }
        }
    }

    toggleReportDetails(index: number) {
        this.isDetailsOpen[index] = !this.isDetailsOpen[index];
        if (this.isDetailsOpen[index]) {
            this.selectedIndex = index;
        } else {
            this.selectedIndex = null;
        }
    }

    deleteReportTracking(): void {
        this.setDataChangeForChild({ reportTracking: this.reportTrackingObject }, 'deleteTracking');
    }

    setDataChangeForChild(data, flag): void {
        this.setDataToChild.next(new DataChange(data, flag, this.uniqueComponentId));
    }

    openAddReportingRequirementModal(): void {
        $('#addReports').modal('show');
    }
}
