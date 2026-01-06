import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../common/services/common.service';
import { CommonDataService } from './services/common-data.service';
import { ProgressReportService } from './services/progress-report.service';
import { forkJoin, Subscription } from 'rxjs';
import { AWARD_ERR_MESSAGE, COMMON_APPROVE_LABEL, COMMON_RETURN_LABEL, DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { deepCloneObject, fileDownloader, setFocusToElement } from '../common/utilities/custom-utilities';
import { environment } from '../../environments/environment';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import {concatUnitNumberAndUnitName} from '../common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';
import { AutoSaveService } from '../common/services/auto-save.service';
declare var $: any;

@Component({
    selector: 'app-progress-report',
    templateUrl: './progress-report.component.html',
    styleUrls: ['./progress-report.component.css']
})
export class ProgressReportComponent implements OnInit, OnDestroy {

    @ViewChild('moreOptionsBtn', { static: true }) moreOptions: ElementRef;

    deployMap = environment.deployUrl;
    result: any = {};
    progressReportId: number;
    requestObject: any = {};
    feedbackType = null;
    isEmptyCommentArea = false;
    uploadedFile: any = [];
    attachmentWarningMsg: any;
    actionType: any = null;
    $subscriptions: Subscription[] = [];
    isEditMode: boolean;
    isShowSaveButton: boolean;
    isModifiable = false;
    isHoldable = false;
    importedFile = [];
    isShowMoreOptions = false;
    validationMap = new Map();
    validationObject: any = {
        moduleCode: 16,
        subModuleCode: 0,
        moduleItemKey: '',
    };
    errorList: any[] = [];
    warningList: any[] = [];
    isValidationOnlyFlag = false;
    overallCommentList: any = [];
    isOverallCommentEmpty = false;
    isSaving = false;
    map = new Map();
    setFocusToElement = setFocusToElement;
    funderApprovalDateCopy: any;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    questionnaireList: any = [];
    COMMON_APPROVE_LABEL = COMMON_APPROVE_LABEL;
    COMMON_RETURN_LABEL = COMMON_RETURN_LABEL;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    constructor(private _route: ActivatedRoute,
        public _router: Router,
        private _progressReportService: ProgressReportService,
        public _commonData: CommonDataService,
        public _commonService: CommonService,
        private _navigationService: NavigationService,
        public autoSaveService: AutoSaveService) {
        this.trackCurrentUrlChange();
        document.addEventListener('mouseup', this.offClickHandler.bind(this));
    }

    ngOnInit(): void {
        this.getEditMode();
        this.autoSaveService.initiateAutoSave();
        this.getProgressReportData();
    }

    ngOnDestroy(): void {
        this.funderApprovalDateCopy = null;
        this.autoSaveService.stopAutoSaveEvent();
        subscriptionHandler(this.$subscriptions);
    }

    getEditMode(): void {
        this.$subscriptions.push(this._commonData.getEditMode().subscribe((data: boolean) => {
            this.isEditMode = data;
        }));
    }

    /**
     * keeps track of which tab current on, in order to show or hide overview save button.
     */
    trackCurrentUrlChange(): void {
        this.$subscriptions.push(
            this._router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.checkWhetherToShowSaveButton();
                }
            })
        );
    }

    /**
     * Only in Overview tab Save button needed, after edition (Edit Mode)
     */
    checkWhetherToShowSaveButton(): void {
        this.isShowSaveButton = ['overview', 'equipments'].some(tabName => this._router.url.includes(tabName));
    }

    submitReport(): void {
        this._commonData.isDataChange = false;
        if (!this.isSaving) {
            this.isSaving = true;
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._progressReportService.submitProgressReport(
                this.progressReportId, this.result.awardProgressReport.progressReportStatusCode).subscribe((res: any) => {
                this.setupProgressReportStoreData(res);
                this._commonData.progressReportTitle = res.awardProgressReport.title;
                this._progressReportService.$isQuestionnaireChange.next(true);
                this._commonService.isShowOverlay = false;
            }, err => {
                if (err.error && err.error.errorMessage  === 'Deadlock') {
                    this.showErrorMessage('Submitting Progress Report failed. Please try again.');
                } else if (err && err.status === 405) {
                    $('#invalidActionModal').modal('show');
                } else {
                    this.showErrorMessage(`Transaction is not completed due to an error.
                    ${AWARD_ERR_MESSAGE}`);
                }
                this.isSaving = false;
                this._commonService.isShowOverlay = false;
            },
                () => {
                    this.showSuccessMessage('Progress Report submitted successfully.');
                    this.isSaving = false;
                }));
        }
    }

    setupProgressReportStoreData(report): void {
        this.result.awardProgressReport = report.awardProgressReport;
        this.result.workflow = report.workflow;
        this.result.workflowList = report.workflowList;
        this.result.canApproveRouting = report.canApproveRouting;
        this.result.finalApprover = report.finalApprover;
        this.result.isApproved = report.isApproved;
        this.result.isFinalApprover = report.isFinalApprover;
        this.updateProgressReportStoreData();
    }

    updateProgressReportStoreData(): void {
        this._commonData.setProgressReportData(deepCloneObject(this.result));
    }

    getProgressReportData(): void {
        this.$subscriptions.push(this._commonData.getProgressReportData().subscribe((data: any) => {
            this.result = data;
            this.setProgressReportRights(this.result.availableRights);
            this.progressReportId = this.result.awardProgressReport.progressReportId;
            this.validationObject.moduleItemKey = this.progressReportId;
        }));
    }

    setProgressReportRights(availableRights: string[] = []): void {
        this.isModifiable = ['CREATE_PROGRESS_REPORT', 'MODIFY_PROGRESS_REPORT'].some(rule => availableRights.includes(rule));
        this.isHoldable = availableRights.includes('PROGRESS_REPORT_FLIP_STATUS');
    }

    /**
     * @param  {} files
     * Check file duplication ,if no duplication insert it into an array
     */
    fileDrop(files): void {
        this.attachmentWarningMsg = null;
        let dupCount = 0;
        for (let index = 0; index < files.length; index++) {
            if (this.uploadedFile.find(dupFile => dupFile.name === files[index].name) != null) {
                dupCount = dupCount + 1;
                this.attachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
            } else {
                this.uploadedFile.push(files[index]);
            }
        }
    }

    deleteFromUploadedFileList(index): void {
        this.uploadedFile.splice(index, 1);
    }

    /**
     * closes approve-disapprove modal
     * clear files and requestObject
     */
    closeApproveDisapproveModal(): void {
        $('#approveDisapproveReportModal').modal('hide');
        this.requestObject = {};
        this.uploadedFile = [];
    }

    /**
     * to make comments mandatory for returning in the route log is action type is R (Return)
     */
    validateWorkFlowRequest(): boolean {
        this.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
        this.isOverallCommentEmpty = this.requestObject.actionType === 'A' && this.overallCommentList.length && !this.feedbackType;
        return !this.isEmptyCommentArea && !this.isOverallCommentEmpty;
    }

    setReportWorFlowRequestObject(): void {
        this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
        this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
        this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.requestObject.progressReportId = this.progressReportId;
        this.requestObject.approverStopNumber = null;
        if (this.feedbackType) {
            const workFlowDetail = {
                moduleCode: 16,
                subModuleCode: 0,
                moduleItemKey: this.progressReportId,
                subModuleItemKey: 0,
                feedbackTypeCode: this.feedbackType.feedbackTypeCode,
                workflowFeedbackType: this.feedbackType
            };
            this.requestObject.workflowDetailExt = workFlowDetail;
        }
    }

    /**shows success toast based on approve or disapprove Progress Report*/
    showSuccessToast(): void {
        if (this.requestObject.actionType === 'A') {
            this.showSuccessMessage(`Progress Report ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
        } else if (this.requestObject.actionType === 'R') {
            this.showSuccessMessage(`Progress Report ${COMMON_RETURN_LABEL.toLowerCase()}ed successfully.`);
        }
    }

    /** approves or disapproves progress report with respect to action type and
     * set progress report object, latest workflow  and show toasters w.r.t
     * response ,
     */
    maintainReportWorkFlow(): void {
        this.setReportWorFlowRequestObject();
        if (this.validateWorkFlowRequest() && !this.isSaving) {
            this.isSaving = true;
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._progressReportService.maintainReportWorkFlow(this.requestObject, this.uploadedFile)
                .subscribe((data: any) => {
                    this.ReportWorkFlowActions(data);
                    this._progressReportService.$isQuestionnaireChange.next(true);
                    this.isSaving = false;
                    this._commonService.isShowOverlay = false;
                },
                    err => {
                        this.closeApproveDisapproveModal();
                        if (err.error && err.error.errorMessage  === 'Deadlock') {
                            this.showErrorMessage(
                                `Progress Report  ${COMMON_APPROVE_LABEL.toLowerCase()}/disapprove action failed. Please try again.`);
                        } else if (err && err.status === 405) {
                            $('#approveDisapproveReportModal').modal('hide');
                            $('#invalidActionModal').modal('show');
                        } else {
                            this.showErrorMessage(`Transaction is not completed due to an error.
                            ${AWARD_ERR_MESSAGE}`);
                        }
                        this.isSaving = false;
                        this._commonService.isShowOverlay = false;
                    },
                    () => {
                        this.showSuccessToast();
                        this.closeApproveDisapproveModal();
                        this.isSaving = false;
                    }));
        }
    }

    /**
     * @param  {} data
     * actions to perform in common for both waf enabled and disabled services after getting response data
     */
    ReportWorkFlowActions(data): void {
        this.setupProgressReportStoreData(data);
    }

    approveReport(): void {
        this.overallCommentList = [];
        const CURRENT_ROLE_CODE = this.getCurrentRoleCode();
        this.overallCommentList = this.result.workflowFeedbackTypes.filter(e => e.roleTypeCode === CURRENT_ROLE_CODE);
        this.requestObject = {};
        this.feedbackType = null;
        this.isEmptyCommentArea = false;
        this.isOverallCommentEmpty = false;
        this.requestObject.actionType = 'A';
        document.getElementById('route-log-btn').click();
    }

    getCurrentRoleCode(): void {
        if (this.result.workflow && this.result.workflow.workflowDetails && this.result.workflow.workflowDetails.length) {
            const CURRENT_ROUTE = this.result.workflow.workflowDetails.find(e => e.approvalStatusCode === 'W'
                && e.approverPersonId === this._commonService.getCurrentUserDetail('personID'));
            return CURRENT_ROUTE.roleTypeCode;
        }
    }

    disapproveReport(): void {
        this.overallCommentList = [];
        this.isEmptyCommentArea = false;
        this.isOverallCommentEmpty = false;
        this.requestObject = {};
        this.requestObject.actionType = 'R';
        document.getElementById('route-log-btn').click();
    }

    /**
     * Sets workflow status badge w.r.t workflow status code
     * statuses 1 => pending
     *          2 => revision requested
     *          3 => Approval in progress
     *          4 => Approved
     *          5 => Hold for funding agency review
     * @param statusCode
     */
    getProgressReportStatusBadge(statusCode: string): string {
        if (statusCode === '1') {
            return 'info';
        } else if (statusCode === '2') {
            return 'warning';
        } else if (statusCode === '4') {
            return 'success';
        } else {
            return 'info';
        }
    }

    initiateProgressReportSaveOnChild(): void {
        this.autoSaveService.commonSaveTrigger$.next(true);
    }

    backToProgressReportListClick(): void {
        this._router.navigate(['/fibi/dashboard/progressReportList']);
    }

    navigateUsingRedirectRoute(): void {
        this._commonData.progressReportTitle = this.result.awardProgressReport.title;
        this._commonData.isDataChange = false;
        this.redirectBasedOnQueryParam();
    }


      redirectBasedOnQueryParam() {
        this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
      }

    savePRFundingAgencyAction(type) {
        if ((type === 'H') || (type === 'C' && this.validateDates())) {
            this.performHoldActions(type);
        }
    }

    performHoldActions(actionType): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._progressReportService.performPRFundingAgencyAction(
                {
                    'actionType': actionType,
                    'progressReportId': this.progressReportId,
                    'funderApprovalDate': parseDateWithoutTimestamp(this.result.awardProgressReport.funderApprovalDate),
                    'progressReportStatusCode' : this.result.awardProgressReport.progressReportStatusCode,
                })
                .subscribe((data: any) => {
                    $('#HOLDConfirmProgressReportModal').modal('hide');
                    this.result.awardProgressReport.progressReportStatus = data.awardProgressReport.progressReportStatus;
                    this.result.awardProgressReport.progressReportStatusCode = data.awardProgressReport.progressReportStatusCode;
                    this.result.awardProgressReport.funderApprovalDate = data.awardProgressReport.funderApprovalDate;
                    this.updateProgressReportStoreData();
                    this.showSuccessMessage('Progress Report status updated successfully.');
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    if (err && err.status === 405) {
                        $('#HOLDConfirmProgressReportModal').modal('hide');
                        $('#invalidActionModal').modal('show');
                    } else {
                        this.showErrorMessage('Updating Progress Report status failed. Please try again.');
                    }
                }));
        }
    }

    addImportAttachment(file): void {
        if (file && file.length) {
            this.importedFile = file;
            this.validationMap.delete('noFileSelected');
        }
    }

    uploadTemplate(): void {
        if (this.importedFile.length) {
            $('#pr-import-modal').modal('hide');
            this.$subscriptions.push(
                this._progressReportService.addImportedAttachment(this.result.awardProgressReport.award.awardId,
                    this.progressReportId, this.importedFile)
                    .subscribe((data: any) => {
                        this.importedFile = [];
                        if (data) {
                            this.result = data;
                            this.updateProgressReportStoreData();
                            data.progressReportImported ? this.showSuccessMessage('Template imported successfully.') :
                            this.showSuccessMessage('The specified file not a valid template or contains no data to import.');
                        }
                    }, err => this.showErrorMessage('Importing from template failed . Please try again.')));
        } else {
            this.validationMap.set('noFileSelected', 'Please add an excel file template to import.');
        }
    }

    offClickHandler(event: any): void {
        if (!this.moreOptions.nativeElement.contains(event.target)) {
            this.isShowMoreOptions = false;
        }
    }

    showImportTemplateModal(): void {
        $('#pr-import-modal-confirm').modal('hide');
        $('#pr-import-modal').modal('show');
    }

    downloadProgressReportAsExcel(): void {
        if (this.progressReportId) {
            this.$subscriptions.push(this._progressReportService.downloadProgressReportAsExcel(this.progressReportId)
                .subscribe((data) => {
                    fileDownloader(data, this.getReportFileName(), 'xlsx');
                }, err => this.showErrorMessage('Failed to download excel, Please try again.')));
        }
    }

    setRequestObject() {
        return{
            'progressReportId' : this.progressReportId,
            'awardId' : this.result.awardProgressReport.awardId,
            'awardLeadUnitNumber' : this.result.awardProgressReport.award.leadUnitNumber
        };
    }

    downloadProgressReportAsZip(): void {
        if (this.progressReportId) {
            this.$subscriptions.push(this._progressReportService.downloadProgressReportAsZip(this.setRequestObject())
                .subscribe((data) => {
                    fileDownloader(data, this.getReportFileName(), 'zip');
                }, err => this.showErrorMessage('Failed to download zip, Please try again.')));
        }
    }

    getReportFileName(): string {
        return (this.result.awardProgressReport.reportClassCode === '2' ? 'Final_Report_#' : 'Progress_Report_#') + this.progressReportId;
    }

    /**
     * Validations before Submit are done here.
     * Checking whether all mandatory fields are filled or not.
     * validateViaServer() - this method is used to validate business rules.
     * isValidationOnlyFlag - flag to check whether Validate or Submit button is clicked,
     * for Validate button click this flag will be true.
     */
    public validateProgressReport(validation = false): void {
        this.resetValidations();
        this.checkIfMandatoryFieldsFilled();
        this.isValidationOnlyFlag = validation;
        this.errorList.length > 0 ?  $('#ValidateReportModal').modal('show') : this.validateViaServer();
    }

    private resetValidations(): void {
        this.warningList = [];
        this.errorList = [];
    }

    private checkIfMandatoryFieldsFilled(): void {
        if (!this.isOverviewMandatoryFieldsFilled()) {
            this.errorList.push({ validationMessage: 'Please complete the mandatory fields in the "Overview" section.' });
        }
    }

    private isOverviewMandatoryFieldsFilled(): boolean {
        const dataToValidate = {
            overviewFields: this.result.awardProgressReport.awardProgressReportAchievements,
            reportClassCode: this.result.awardProgressReport.reportClassCode,
            reportingPeriod: {reportStartDate: this.result.awardProgressReport.reportStartDate,
                reportEndDate: this.result.awardProgressReport.reportEndDate},
            dueDate: this.result.awardProgressReport.dueDate,
            title: this.result.awardProgressReport.title
        };
        return this._commonData.isOverviewTabFieldsValid(this.validationMap, dataToValidate);
    }

    private validateViaServer(): void {
        this.errorList = [];
        this.warningList = [];
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push((forkJoin(this._commonService.evaluateValidation(this.validationObject),
            this.validateQuestionnaire())).subscribe((res: any) => {
                this.isSaving = false;
                if (res[0] && res[0].length > 0) {
                    res[0].forEach(validationMsg => (validationMsg.validationType === 'VW') ?
                        this.warningList.push(validationMsg) : this.errorList.push(validationMsg));
                }
                if (this.isValidationOnlyFlag || this.errorList.length || this.warningList.length) {
                    $('#ValidateReportModal').modal('show');
                } else {
                    this._commonData.isDataChange ? $('#progress-report-submit-without-save-modal').modal('show')
                                                        : $('#SubmitReportModal').modal('show');

                }
            }, err => {
                this.showErrorMessage('Evaluating Progress Report failed. Please try again.');
                this.isSaving = false;
            }
            ));
        }
    }

    private validateQuestionnaire(): Promise<any> {
        return new Promise((resolve, reject) => {
            const list = [];
            const errorObject: any = { validationType: 'VE', validationMessage: '' };
            this.setQuestionnaireRequestObject(list);
            this.$subscriptions.push(
                forkJoin(...list).subscribe(data => {
                    this.questionnaireList = [];
                    data.forEach((d: any) => this.combineQuestionnaireList(d.applicableQuestionnaire));
                    const UnAnsweredQuestionnaireList = [];
                    if (this.questionnaireList && this.questionnaireList.length) {
                        this.questionnaireList.forEach(element => {
                            if (element.IS_MANDATORY === 'Y' && element.QUESTIONNAIRE_COMPLETED_FLAG !== 'Y') {
                                UnAnsweredQuestionnaireList.push(element.QUESTIONNAIRE_LABEL || element.QUESTIONNAIRE);
                            }
                        });
                        if (UnAnsweredQuestionnaireList.length) {
                            errorObject.validationMessage =
                                'Please complete the following mandatory questionnaire(s) in the "Questionnaire" section.'
                                + this.getUnAnsweredList(UnAnsweredQuestionnaireList);
                            this.errorList.push(errorObject);
                        }
                    }
                    resolve(true);
                }, error => {
                    this.showErrorMessage('Evaluating Progress Report failed. Please try again.');
                    reject();
                }));
        });
    }

    private combineQuestionnaireList(newList): void {
        this.questionnaireList = [...this.questionnaireList, ...newList];
    }

    private setQuestionnaireRequestObject(list): void {
        const requestObject: any = {};
        requestObject.moduleItemCode = 16;
        requestObject.moduleSubItemCode = 0;
        requestObject.moduleItemKey = this.result.awardProgressReport.progressReportId;
        requestObject.moduleSubItemKey = 0;
        requestObject.actionPersonName = this._commonService.getCurrentUserDetail('userName');
        requestObject.actionUserId = this._commonService.getCurrentUserDetail('personID');
        list.push(this.getApplicableQuestionnaire(requestObject));
    }

    private getApplicableQuestionnaire(requestObject): any {
        requestObject = deepCloneObject(requestObject);
        return this._progressReportService.getApplicableQuestionnaire(requestObject);
    }

    private getUnAnsweredList(list): string {
        let modifiedQuestionList = '<ol>';
        list.forEach(element => { modifiedQuestionList += `<li> ${element} </li>`; });
        return modifiedQuestionList + '</ol>';
    }

    private showErrorMessage(message: string): void {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

    private showSuccessMessage(message: string): void {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

    validateDates() {
        this.map.clear();
        if (!this.result.awardProgressReport.funderApprovalDate) {
          this.map.set('funderApprovalDate', 'Please pick a Funder Approval Date.');
        }
        return this.map.size ? false : true;
      }

    cancelFunderApprovalDate() {
        this.result.awardProgressReport.funderApprovalDate = this.funderApprovalDateCopy;
        this.map.clear();
    }

    convertFunderDate(): void {
        this.funderApprovalDateCopy = this.result.awardProgressReport.funderApprovalDate;
        this.result.awardProgressReport.funderApprovalDate = getDateObjectFromTimeStamp(this.result.awardProgressReport.funderApprovalDate);
    }

    reload() {
        window.location.reload();
    }

    public deleteProgressReport(): void {
        this.$subscriptions.push(this._progressReportService.deleteProgressReport(this.progressReportId)
        .subscribe((data: any) => {
            this._router.navigate(['fibi/dashboard/progressReportList']);
            this.showSuccessMessage('Progress Report deleted successfully.');
        }, err => {
            if (err && err.status === 405) {
                $('#deleteProgressReportModal').modal('hide');
                $('#invalidActionModal').modal('show');
            } else {
                this.showErrorMessage('Deleting Progress Report failed. Please try again.');
            }
        }));
    }

}
