import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { fileDownloader, openInNewTab } from '../../../common/utilities/custom-utilities';
import { Subject, Subscription } from 'rxjs';
import { ReportingRequirementsService } from '../reporting-requirements.service';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonDataService } from '../../services/common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AwardReport, AwardReportTracking, AwardReportTrackingFile, DataChange } from '../reporting-requirements-interface';

declare var $;
@Component({
    selector: 'app-reporting-requirement-details',
    templateUrl: './reporting-requirement-details.component.html',
    styleUrls: ['./reporting-requirement-details.component.css']
})
export class ReportingRequirementDetailsComponent implements OnChanges, OnDestroy, OnInit {

    @Input() reportStatusList = [];
    @Input() awardReport: AwardReport;
    @Input() awardData;
    @Input() isEditMode;
    @Input() isEditEnabledForSection;
    @Input() manageOnActiveAward;
    @Output() updateDataForSearch: any = new EventEmitter();
    @Output() setDataToModal: any = new EventEmitter();
    @Input() uniqueComponentId;
    @Input() dataChange: Subject<DataChange>;
    reportTrackingList: AwardReportTracking = new AwardReportTracking();
    isReplaceAttachment = false;
    isDeleteAttachment = false;
    attachmentVersions = [];
    fileName;
    isModifiable = false;
    isReportCreatable = false;
    isActiveReport = false;
    validateMap = new Map();
    isSaving = false;
    childReport: AwardReport = new AwardReport();
    $subscriptions: Subscription[] = [];
    hasRight: boolean;
    isExpandComment: any = [];

    constructor(public _commonService: CommonService,
        private _commonData: CommonDataService,
        private _reportTermsService: ReportingRequirementsService) {

    }

    ngOnInit(): void {
        this.getDataFromParent();
    }

    /**
    * Restricting to external data changes happening on childReport.(add/edit report changes)
    */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.awardReport && changes.awardReport.currentValue) {
            this.childReport = JSON.parse(JSON.stringify(this.awardReport));
            this.convertTimestampToDate();
            this.childReport.awardReportTracking = this.childReport.awardReportTracking;
            this.setPermissions();
            this.checkIfReportIsActive(this.awardData);
        }
    }

    getDataFromParent() {
        this.$subscriptions.push(this.dataChange.subscribe((data) => {
            if (data.uniqueComponentId === this.uniqueComponentId) {
                this.parentEventHandler(data);
            }
        }));
    }

    expandComment(i) {
        this.isExpandComment[i] = !this.isExpandComment[i];
    }

    getStatus(code) {
        const status = this.reportStatusList.find((el) => el.statusCode == code);
        if (status) {
            return status.description;
        }
        return '';
    }

    /**
    * this function sets colour for status badge, need to make css class and add here for future use
    */
    getColorForStatus(code: string, isProgressReport): string {
        if (isProgressReport) {
            if (code === '4') {
                return 'approved-status';
            }
            if (code === '1') {
                return 'inProgress-status';
            }
            return 'inProgress-status';
        } else {
            if (code === '1') {
                return 'pending-status';
            }
            return 'inProgress-status';
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

    setPermissions() {
        this.isModifiable = (this.awardData.awardSequenceStatus === 'PENDING') ? true :
            this._commonData.checkDepartmentLevelRightsInArray('MAINTAIN_REPORTING_REQUIREMENTS');
        this.isReportCreatable = this._commonData.checkDepartmentLevelRightsInArray('CREATE_PROGRESS_REPORT');
        this.hasRight = this._commonData.checkDepartmentLevelRightsInArray('MAINTAIN_REPORTING_REQUIREMENTS');
    }

    convertTimestampToDate() {
        this.childReport.awardReportTracking.forEach(element => {
            element.dueDate = getDateObjectFromTimeStamp(element.dueDate);
            element.activityDate = getDateObjectFromTimeStamp(element.activityDate);
        });
    }

    downloadReportAttachment(attachment: any) {
        this.$subscriptions.push(this._reportTermsService.downloadAwardReportTrackingAttachment(attachment.awardReportTrackingFileId)
            .subscribe(data => {
                fileDownloader(data, attachment.fileName);
            }, _err => this._commonService.showToast(HTTP_ERROR_STATUS,
                'Downloading reporting requirement attachment failed. Please try again.')));
    }

    navigateToReport(progressReportId: any) {
        openInNewTab('progress-report/overview?', ['progressReportId'], [progressReportId]);
    }

    openFormModalForNonProgressReport(trackingObj: AwardReportTracking): void {
        this.reportTrackingList = JSON.parse(JSON.stringify(trackingObj));
        this.sendDataForModal(this.reportTrackingList, 'nonProgressReport');
    }

    openDueDateEditModal(trackingObj: AwardReportTracking): void {
        this.reportTrackingList = JSON.parse(JSON.stringify(trackingObj));
        this.sendDataForModal(this.reportTrackingList, 'dueDate');
    }

    openCreateProgressReportModal(trackingObj: AwardReportTracking): void {
        this.reportTrackingList = JSON.parse(JSON.stringify(trackingObj));
        const data = {
            trackingObj: JSON.parse(JSON.stringify(trackingObj)),
            reportClassCode: this.childReport.reportClassCode,
            reportCode: this.childReport.reportCode,
            frequency: this.childReport.frequencyCode
        };
        this.sendDataForModal(data, 'progressReport');
    }

    sendDataForModal(data, flag): void {
        this.setDataToModal.next(new DataChange(data, flag, this.uniqueComponentId));
    }

    deleteTrackingModal(trackingObj: AwardReportTracking): void {
        this.reportTrackingList = JSON.parse(JSON.stringify(trackingObj));
        this.sendDataForModal(JSON.parse(JSON.stringify(trackingObj)), 'deleteTracking');
    }

    /**
    * this function calls apis for delete tracking, save tracking, delete attachment, progress report and updates this component
    */
    parentEventHandler(action): void {
        switch (action.flag) {
            case 'deleteTracking':
                this.deleteReportTracking(action.data.reportTracking);
                break;
            case 'saveTracking':
                this.saveReportTrackingDetails(action.data);
                break;
            case 'deleteAttachment':
                this.deleteAttachment(action.data);
                break;
            case 'progressReport':
                this.updateProgressReport(action.data);
                break;
        }
    }

    deleteReportTracking(reportTracking): void {
        const reqObj = {
            awardReportTrackingId: reportTracking.awardReportTrackingId,
            awardNumber: this.awardData.awardNumber,
            uniqueId: reportTracking.uniqueId,
            awardId: this.awardData.awardId
        };
        this.$subscriptions.push(this._reportTermsService
            .deleteReportTracking(reqObj).subscribe((res: any) => {
                if (res.existInActive !== 'true') {
                    this.updateDataForSearch.emit({
                        data: { reportTracking: { awardReportTrackingId: reportTracking.awardReportTrackingId } },
                        flag: 'delete'
                    });
                    const index = this.childReport.awardReportTracking.
                        findIndex((x) => x.awardReportTrackingId === reportTracking.awardReportTrackingId);
                    this.childReport.awardReportTracking.splice(index, 1);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry deleted successfully.');
                    return null;
                } else {
                    $('#activeDataExist').modal('show');
                }
            },
                err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete entry. Please try again.'))
        );
    }

    saveReportTrackingDetails(data): void {
        if (this.isEditMode && (!this.validateReportingReq(data.reportTracking) || this.isSaving)) {
            return null;
        }
        this.isSaving = true;
        const requestObject = this.setDateFormat(data.reportTracking);
        requestObject.awardReportTermsId = data.reportTracking.awardReportTermsId;
        requestObject.createProgressReport = data.reportTracking.createProgressReport;
        const formData = new FormData();
        if (data.file[0] && data.file[0] instanceof Blob ) {
            this.setAttachmentToRequestObject(data, requestObject, formData);
        }
        formData.append('formDataJson', JSON.stringify({
            awardReportTracking: requestObject,
        }));
        this.$subscriptions.push(this._reportTermsService.saveOrUpdateReportTracking(
            formData
        ).subscribe( (res: any) => {
            this.isSaving = false;
            this.updateDataForSearch.emit({ data: { reportTracking: res.awardReportTracking}, flag: 'save' });
            this.updateReportList(res.awardReportTracking.awardReportTrackingId, res);
            $('#nonProgressReportCreateModal').modal('hide');
            $('#dueDateEditModal').modal('hide');
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entry saved successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save entry, Please try again.');
            this.isSaving = false;
        }));
    }

    private setAttachmentToRequestObject(data: any, requestObject: AwardReportTracking, formData: FormData) {
        const awardReportTrackingFiles: AwardReportTrackingFile[] = [];
        const awardReportTrackingFile: AwardReportTrackingFile = this.getReportTrackingFile(data);
        awardReportTrackingFiles.push(awardReportTrackingFile);
        requestObject.awardReportTrackingFiles = awardReportTrackingFiles;
        formData.append('files', data.file[0], data.file[0].name);
    }

    private getReportTrackingFile(data: any): AwardReportTrackingFile {
        return {
            awardReportTermsId: data.reportTracking.awardReportTermsId,
            awardReportTrackingId: data.reportTracking.awardReportTrackingId,
            awardId: this.awardData.awardId,
            awardNumber: this.awardData.awardNumber,
            sequenceNumber: this.awardData.sequenceNumber,
            fileName: data.file[0] ? data.file[0].name : null,
            contentType: data.file[0] ? data.file[0].type : null,
            versionNumber: data.reportTracking.awardReportTrackingFile
                ? data.reportTracking.awardReportTrackingFile.versionNumber || null : null,
            uniqueId: data.reportTracking.uniqueId
        };
    }

    private updateReportList(awardReportTrackingId: number, data: any): void {
        const index = this.childReport.awardReportTracking.findIndex((x) => x.awardReportTrackingId === awardReportTrackingId);
        this.childReport.awardReportTracking[index] = data.awardReportTracking;
    }

    validateReportingReq(reportTrackingList: any): boolean {
        this.validateMap.clear();
        if (!reportTrackingList.dueDate) {
            this.validateMap.set('dueDate', 'Please enter a due date');
            return false;
        }
        return true;
    }

    setDateFormat(reportTrackingList: AwardReportTracking): AwardReportTracking {
        return {
            ...reportTrackingList,
            dueDate: parseDateWithoutTimestamp(reportTrackingList.dueDate),
            activityDate: parseDateWithoutTimestamp(reportTrackingList.activityDate),
        };
    }

    deleteAttachment(data): void {
        this.$subscriptions.push(this._reportTermsService.deleteReportTrackingAttachment(this.generateDeleteRO(data.reportTracking))
        .subscribe( (res: any) => {
                this.updateDataForSearch.emit({
                    data: { reportTracking: {awardReportTrackingId: res.awardReportTrackingId} },
                    flag: 'deleteAttachment'
                });
                this.removeAttachmentFromModalReference();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment Deleted successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to Delete Attachment. Please try again.');
        }));
    }

    private removeAttachmentFromModalReference() {
        this.reportTrackingList.awardReportTrackingFile = null;
        this.reportTrackingList.awardReportTrackingFiles = [];
    }

    private generateDeleteRO(reportTracking): AwardReportTracking {
        return reportTracking;
    }

    updateProgressReport(progressReport): void {
        const index = this.childReport.awardReportTracking
            .findIndex((x) => x.awardReportTrackingId === this.reportTrackingList.awardReportTrackingId);
        if (index !== -1) {
            this.childReport.awardReportTracking[index].progressReportId = progressReport.progressReportId;
            this.childReport.awardReportTracking[index].awardProgressReport = progressReport;
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
