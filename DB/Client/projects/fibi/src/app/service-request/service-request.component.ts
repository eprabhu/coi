import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { AWARD_ERR_MESSAGE, COMMON_APPROVE_LABEL, COMMON_RETURN_LABEL, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { AutoSaveService } from '../common/services/auto-save.service';
import { CommonService } from '../common/services/common.service';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import {
    AdminGroup, AssignRequest, CompleterOptions, PrintTemplates, ServiceRequest, ServiceRequestRoot,
    UserSelectedTemplate,
    ValidationObject, Watcher, WorkflowList
} from './service-request.interface';
import { CommonDataService } from './services/common-data.service';
import { ServiceRequestService } from './services/service-request.service';
import { concatUnitNumberAndUnitName, fileDownloader } from '../common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';
declare var $: any;

@Component({
    selector: 'app-service-request',
    templateUrl: './service-request.component.html',
    styleUrls: ['./service-request.component.css']
})
export class ServiceRequestComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    adminGroups: AdminGroup[];
    workflowList: WorkflowList[];
    validationObject: ValidationObject = new ValidationObject();
    assignRequest: AssignRequest = new AssignRequest();
    watcherList: Watcher[];
    canApproveRouting: string;

    adminGroupsCompleterOptions: CompleterOptions = new CompleterOptions();
    categoryClearFiled: String;
    personElasticOptions: any = {};
    personClearField: String;

    attachmentWarning: string;
    uploadedFile: any = [];
    newAttachments: any = [];
    submitComment: any;

    errorList: any[] = [];
    warningList: any[] = [];
    questionnaireList: any = [];
    isValidationOnlyFlag = false;

    assignMap = new Map();
    requestObject: any = {};

    isSaving = false;
    isWatcherAlreadyAdded = false;

    canSubmitServiceRequest = false;
    canAssignServiceRequest = false;
    canResolveServiceRequest = false;
    canRejectServiceRequest = false;
    canModifyServiceRequest = false;
    isShowMoreOptions = false;
    printTemplates: PrintTemplates[] = [];
    userSelectedTemplate: UserSelectedTemplate[] = [];
    isChecked = {};
    validationMap = new Map();
    isDownloading = false;

    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;

    constructor(
        private _router: Router,
        public autoSaveService: AutoSaveService,
        public _serviceRequestService: ServiceRequestService,
        public _commonData: CommonDataService,
        private _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        private _navigationService: NavigationService
    ) {
        document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
    }

    // The function is used for closing nav dropdown at mobile screen
    offClickMainHeaderHandler(event: any) {
        if (window.innerWidth < 992) {
            const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
            if (!this.mainHeaders.nativeElement.contains(event.target)) {
                if (ELEMENT.classList.contains('show')) {
                    document.getElementById('responsiveCollapse').click();
                }
            }
        }
    }

    ngOnInit() {
        this.canShowSave();
        this.getServiceRequestDetails();
        this.getGeneralDetails();
        this.loadLookups();
        this.autoSaveService.initiateAutoSave();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._serviceRequestService.isServiceRequestDataChange = false;
        this.autoSaveService.stopAutoSaveEvent();
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                this.getGeneralDetails();
            })
        );
    }

    private getGeneralDetails(): void {
        const DATA: any = this._commonData.getData(['serviceRequest', 'workflowList',
            'serviceRequestWatchers', 'canApproveRouting']);
        this.serviceRequest = DATA.serviceRequest;
        this.loadLookups();
        this.workflowList = DATA.workflowList || [];
        this.watcherList = DATA.serviceRequestWatchers;
        this.canApproveRouting = DATA.canApproveRouting;
        this.validationObject.moduleItemKey = this.serviceRequest.serviceRequestId;
        this._serviceRequestService.serviceRequestTitle = this.serviceRequest.subject;
        this.setAssigningOptions();
        this.getPermission();
    }

    private loadLookups() {
        if (this.canAssignServiceRequest && this.serviceRequest.serviceRequestId && [4].includes(this.serviceRequest.statusCode)) {
            this.$subscriptions.push(
                this._serviceRequestService.loadLookups().subscribe((data: any) => {
                    this.adminGroups = data.adminGroups || [];
                    this.setAdminGroupOptions();
                })
            );
        }
    }

    private setAssigningOptions(): void {
        this.personElasticOptions = this._elasticConfig.getElasticForPerson();
    }

    private setAdminGroupOptions(): void {
        this.adminGroupsCompleterOptions = {
            arrayList: this.getActiveAdminGroups(),
            contextField: 'adminGroupName',
            filterFields: 'adminGroupName',
            formatString: 'adminGroupName',
            defaultValue: ''
        };
    }

    private getActiveAdminGroups(): AdminGroup[] {
        return this.adminGroups.filter(element => element.isActive === 'Y');
    }

    groupSelect(event): void {
        this.assignRequest.adminGroupId = event ? event.adminGroupId : null;
    }

    private getPermission(): void {
        this.canSubmitServiceRequest = this._commonData.checkDepartmentRight('SUBMIT_SERVICE_REQUEST');
        this.canAssignServiceRequest = this._commonData.checkDepartmentRight('ASSIGN_SERVICE_REQUEST');
        this.canResolveServiceRequest = this._commonData.checkDepartmentRight('RESOLVE_SERVICE_REQUEST');
        this.canRejectServiceRequest = this._commonData.checkDepartmentRight('RETURN_SERVICE_REQUEST');
        this.canModifyServiceRequest = this._commonData.canUserEdit();
    }

    navigateToServiceRequestList(): void {
        this._router.navigate(['/fibi/dashboard/serviceRequestList']);
    }
    /**
   * this initiates the save trigger on the autoSave service which in place
   * initiates the save on all child components who have subscribed into this event
   */
    initiateSaveInChildComponents(): void {
        this.autoSaveService.commonSaveTrigger$.next(true);
    }

    navigateUsingRedirectRoute(): void {
        this.updateServiceTitle();
        this._serviceRequestService.isServiceRequestDataChange = false;
        this.redirectBasedOnQueryParam();
    }

    redirectBasedOnQueryParam() {
        this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
    }

    private updateServiceTitle() {
        if (this._serviceRequestService.serviceRequestTitle !== this.serviceRequest.subject) {
            this._serviceRequestService.serviceRequestTitle = this.serviceRequest.subject;
        }
    }

    getStatusCode(statusCode: number): string {
        if (statusCode === 1) {
            return 'info';
        } else if (statusCode === 2) {
            return 'warning';
        } else if (statusCode === 5) {
            return 'success';
        } else if ([3, 7].includes(statusCode)) {
            return 'danger';
        } else {
            return 'info';
        }
    }

    submitServiceRequest(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.prepareUploadAttachments();
            this.$subscriptions.push(
                this._serviceRequestService.submitServiceRequest(
                    this.serviceRequest.serviceRequestId,
                    this.setSubmitRequest()
                ).subscribe((data: any) => {
                    this.updateAdminGroup(data);
                    this.updateStore(data);
                    this.updateServiceTitle();
                    this.clearSubmit();
                    this.isSaving = false;
                    this.showSuccessMessage('Service Request submitted successfully.');
                }, err => {
                    this.isSaving = false;
                    if (err.error && err.error.errorMessage  === 'Deadlock') {
                        this.showErrorMessage('Submit Service Request failed. Please try again.');
                    }else if (err && err.status === 405) {
                        $('#submit-approve-service-request').modal('hide');
                        $('#invalidActionModal').modal('show');
                    } else {
                        this.showErrorMessage(`Transaction is not completed due to an error.
                        ${AWARD_ERR_MESSAGE}`);
                    }
                })
            );
        }
    }

    private updateAdminGroup(data: ServiceRequestRoot): void {
        this.serviceRequest.adminGroup = data.serviceRequest.adminGroup;
        this.serviceRequest.adminGroupId = data.serviceRequest.adminGroupId;
    }

    private prepareUploadAttachments(): void {
        this.uploadedFile.forEach(file => {
            this.prepareAttachment(file);
        });
    }

    private setSubmitRequest(): any {
        return {
            comment: this.setComment(),
            attachment: this.newAttachments,
            uploadedFile: this.uploadedFile,
            serviceRequestStatus: this.serviceRequest.statusCode
        };
    }

    private updateStore(data): void {
        this.updateServiceRequestStatus(data);
        this._commonData.updateStoreData({
            serviceRequest: this.serviceRequest,
            workflow: data.workflow,
            workflowList: data.workflowList,
            canApproveRouting: data.canApproveRouting,
            finalApprover: data.finalApprover,
            availableRights: data.availableRights,
            isApproved: data.isApproved,
            isFinalApprover: data.isFinalApprover,
            serviceRequestWatchers: data.serviceRequestWatchers,
            serviceRequestStatusHistories: data.serviceRequestStatusHistories
        });
    }

    private updateServiceRequestStatus(data: ServiceRequestRoot): void {
        if (data.serviceRequest.statusCode) {
            this.serviceRequest.serviceRequestStatus = data.serviceRequest.serviceRequestStatus;
            this.serviceRequest.statusCode = data.serviceRequest.statusCode;
        }
    }

    clearSubmit() {
        this.newAttachments = [];
        this.uploadedFile = [];
        this.submitComment = null;
        $('#submit-approve-service-request').modal('hide');
    }

    fileDrop(uploadedFiles): void {
        let dupCount = 0;
        for (const file of uploadedFiles) {
            if (this.checkDuplicateFiles(file)) {
                dupCount = dupCount + 1;
            } else {
                this.uploadedFile.push(file);
            }
        }
        if (dupCount > 0) {
            this.attachmentWarning = '* ' + dupCount + ' File(s) already added';
        }
    }

    private checkDuplicateFiles(index) {
        return this.newAttachments.find(dupFile => dupFile.fileName === index.name &&
            dupFile.mimeType === index.type) || this.newAttachments.find(dupFile => dupFile.fileName === index.name &&
                dupFile.mimeType === index.type) != null;
    }

    private prepareAttachment(file): void {
        this.newAttachments.push({
            'fileName': file.name
        });
    }

    deleteFromUploadedFileList(index: number): void {
        this.uploadedFile.splice(index, 1);
        this.newAttachments.splice(index, 1);
    }

    submitRequest(): void {
        $('#validate-service-request').modal('hide');
        $('#submit-approve-service-request').modal('show');
    }

    validateViaServer(): void {
        if (this._serviceRequestService.isServiceRequestDataChange) {
            $('#service-request-submit-change-confirmation').modal('show');
            return;
        }
        this.errorList = [];
        this.warningList = [];
        this.$subscriptions.push(forkJoin(
            this._commonService.evaluateValidation(this.validationObject),
            this.validateQuestionnaire()
        ).subscribe((res: any) => {
            if (res[0] && res[0].length > 0) {
                res[0].forEach(validationMsg => (validationMsg.validationType === 'VW') ?
                    this.warningList.push(validationMsg) : this.errorList.push(validationMsg));
            }
            (this.isValidationOnlyFlag || this.errorList.length || this.warningList.length) ?
                $('#validate-service-request').modal('show') : $('#submit-approve-service-request').modal('show');
        }, err => {
            this.showErrorMessage('Evaluating Service Request failed. Please try again.');
        }));
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
                    this.showErrorMessage('Evaluating Service Request failed. Please try again.');
                    reject();
                }));
        });
    }

    private combineQuestionnaireList(newList): void {
        this.questionnaireList = [...this.questionnaireList, ...newList];
    }

    private setQuestionnaireRequestObject(list): void {
        const requestObject: any = {};
        requestObject.moduleItemCode = 20;
        requestObject.moduleSubItemCode = this.serviceRequest.serviceRequestType.typeCode;
        requestObject.moduleItemKey = this.serviceRequest.serviceRequestId;
        requestObject.moduleSubItemKey = 0;
        requestObject.actionPersonName = this._commonService.getCurrentUserDetail('userName');
        requestObject.actionUserId = this.getCurrentPersonId();
        list.push(this.getApplicableQuestionnaire(requestObject));
    }

    private getCurrentPersonId() {
        return this._commonService.getCurrentUserDetail('personID');
    }

    private getApplicableQuestionnaire(requestObject): any {
        requestObject = JSON.parse(JSON.stringify(requestObject));
        return this._serviceRequestService.getApplicableQuestionnaire(requestObject);
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

    approveServiceRequest(): void {
        this.requestObject = {};
        this.requestObject.actionType = 'A';
        $('#submit-approve-service-request').modal('show');
    }

    disapproveServiceRequest(): void {
        this.requestObject = {};
        this.requestObject.actionType = 'R';
        $('#submit-approve-service-request').modal('show');
    }

    private setReportWorFlowRequestObject(): void {
        this.isSaving = true;
        this._commonService.isShowOverlay = true;
        this.requestObject.personId = this.getCurrentPersonId();
        this.requestObject.workFlowPersonId = this.getCurrentPersonId();
        this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.requestObject.serviceRequestId = this.serviceRequest.serviceRequestId;
        this.requestObject.approveComment = this.submitComment;

    }

    /**shows success toast based on approve or disapprove Service request*/
    private showSuccessToast(): void {
        if (this.requestObject.actionType === 'A') {
            this.showSuccessMessage(`Service Request ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
        } else if (this.requestObject.actionType === 'R') {
            this.showSuccessMessage(`Service Request ${COMMON_RETURN_LABEL.toLowerCase()}ed successfully.`);
        }
    }

    /** approves or disapproves service request with respect to action type and
     * set service request object, latest workflow  and show toasters w.r.t
     * response ,
     */
    maintainReportWorkFlow(): void {
        if (!this.isSaving) {
            this.setReportWorFlowRequestObject();
            this.$subscriptions.push(this._serviceRequestService.maintainReportWorkFlow(this.requestObject, this.uploadedFile)
                .subscribe((data: any) => {
                    this.updateStore(data);
                    this._commonService.isShowOverlay = false;
                    this.isSaving = false;
                    this.showSuccessToast();
                    this.closeApproveDisapproveModal();
                }, err => {
                    this.closeApproveDisapproveModal();
                    if (err.error && err.error.errorMessage  === 'Deadlock') {
                        this.showErrorMessage(`Service Request ${COMMON_APPROVE_LABEL.toLowerCase()}/${COMMON_RETURN_LABEL.toLowerCase()} action failed. Please try again.`);
                    } else if  (err && err.status === 405) {
                            $('#invalidActionModal').modal('show');
                     } else {
                        this.showErrorMessage(`Transaction is not completed due to an error.
                        ${AWARD_ERR_MESSAGE}`);
                    }
                    this._commonService.isShowOverlay = false;
                    this.isSaving = false;
                }));
        }
    }

    closeApproveDisapproveModal(): void {
        this.requestObject = {};
        this.clearSubmit();
    }

    setPersonDetails(event): void {
        this.assignRequest.assigneePersonId = event ? event.prncpl_id : null;
        this.assignRequest.assigneePersonName = event ? event.full_name : null;
    }

    assignToMe(): void {
        this.personClearField = new String('false');
        this.assignRequest.assigneePersonId = this.getCurrentPersonId();
        this.assignRequest.assigneePersonName = this._commonService.getCurrentUserDetail('fullName');
        this.personElasticOptions.defaultValue = this._commonService.getCurrentUserDetail('fullName');
    }

    showAssignMe(): boolean {
        return this.serviceRequest.assigneePersonId !== this.getCurrentPersonId() &&
            this.assignRequest.assigneePersonId !== this.getCurrentPersonId();
    }

    assignServiceRequest(): void {
        if (this.isSaving || !this.validateAssign()) {
            return;
        }
        this.isSaving = true;
        this.setAssignHeader();
        this.$subscriptions.push(
            this._serviceRequestService.assignReviewer(this.assignRequest, this.uploadedFile, this.newAttachments)
                .subscribe((data: any) => {
                    this.updateAssignee(data);
                    this.updateAdminGroup(data);
                    this.updateStore(data);
                    this.navigateToOverview();
                    this.assignSuccessToast();
                    this.clearAssign();
                    this.isSaving = false;
                }, err => {
                    if (err && err.status === 405) {
                        $('#assign-service-request').modal('hide');
                        $('#invalidActionModal').modal('show');
                    } else {
                        this.assignErrorToast();
                        this.isSaving = false;
                    }
                })
        );

    }

    private updateAssignee(data: ServiceRequestRoot) {
        this.serviceRequest.assigneePersonId = data.serviceRequest.assigneePersonId;
        this.serviceRequest.assigneePersonName = data.serviceRequest.assigneePersonName;
    }

    private validateAssign(): boolean {
        this.assignMap.clear();
        if (!this.assignRequest.adminGroupId && !this.assignRequest.assigneePersonId && !this.assignRequest.isReturnServiceRequest) {
            this.assignMap.set('assign', 'Please assign to any group or person');
        }
        return this.assignMap.size === 0 ? true : false;
    }

    private setAssignHeader(): void {
        this.assignRequest.serviceRequestId = this.serviceRequest.serviceRequestId;
        this.assignRequest.serviceRequestComment = this.setComment();
        this.prepareUploadAttachments();
        this.prepareServiceRequestHistory();
        if (this.assignRequest.adminGroupId === this.serviceRequest.adminGroupId) {
            this.assignRequest.adminGroupId = null;
        }
    }

    private prepareServiceRequestHistory(): void {
        if (this.assignRequest.adminGroupId && this.assignRequest.adminGroupId !== this.serviceRequest.adminGroupId) {
            this.getChangedFields({ 'adminGroupId': 'previousAdminGroupId' });
        }
        if (this.assignRequest.assigneePersonId && this.assignRequest.assigneePersonId !== this.serviceRequest.assigneePersonId) {
            this.getChangedFields({
                'assigneePersonId': 'previousAssigneePersonId',
                'assigneePersonName': 'previousAssigneePersonName'
            });
        }
        if (this.assignRequest.serviceRequestHistory.assigneePersonId || this.assignRequest.serviceRequestHistory.adminGroupId) {
            this.assignRequest.serviceRequestHistory.serviceRequestId = this.serviceRequest.serviceRequestId;
        } else {
            this.assignRequest.serviceRequestHistory = null;
        }
    }

    private assignSuccessToast(): void {
        this.assignRequest.isReturnServiceRequest ?
            this.showSuccessMessage('Service Request returned successfully.') :
            this.showSuccessMessage('Service Request assigned successfully.');
    }

    private assignErrorToast(): void {
        this.assignRequest.isReturnServiceRequest ?
            this.showErrorMessage('Returning Service Request failed. Please try again.') :
            this.showErrorMessage('Assigning Service Request failed. Please try again.');
    }

    clearAssign(): void {
        this.assignRequest = new AssignRequest();
        this.personClearField = new String('true');
        this.categoryClearFiled = new String('true');
        $('#assign-service-request').modal('hide');
        this.assignMap.clear();
        this.submitComment = null;
        this.uploadedFile = [];
        this.newAttachments = [];
    }

    resolveServiceRequest(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.prepareUploadAttachments();
            this.$subscriptions.push(
                this._serviceRequestService.resolveServiceRequest(
                    this.serviceRequest.serviceRequestId, this.setComment(), this.uploadedFile, this.newAttachments
                ).subscribe((data: any) => {
                    this.updateStore(data);
                    this.navigateToOverview();
                    this.showSuccessMessage('Service Request resolved successfully.');
                    this.clearResolve();
                    this.isSaving = false;
                }, err => {
                    if (err && err.status === 405) {
                        $('#resolve-service-request').modal('hide');
                        $('#invalidActionModal').modal('show');
                    } else {
                        this.showErrorMessage('Resolving Service Request failed. Please try again.');
                    }
                    this.isSaving = false;
                })
            );
        }
    }

    clearResolve() {
        this.newAttachments = [];
        this.uploadedFile = [];
        this.submitComment = null;
        $('#resolve-service-request').modal('hide');
    }

    private navigateToOverview(): void {
        this._router.navigate(['fibi/service-request/overview'],
            {
                queryParams: { serviceRequestId: this.serviceRequest.serviceRequestId }
            });
    }

    private setComment() {
        return this.submitComment ?
            {
                comments: this.submitComment,
                isPrivateComment: false
            }
            : null;
    }

    private getChangedFields(changedKeys): void {
        const KEYS = Object.keys(changedKeys);
        KEYS.forEach((key) => {
            this.assignRequest.serviceRequestHistory[key] = this.assignRequest[key];
            this.assignRequest.serviceRequestHistory[changedKeys[key]] = this.serviceRequest[key];
        });
    }

    checkLoggedUserIsWatcher(): void {
        this.isWatcherAlreadyAdded = this.watcherList.find((ele) => ele.watcherPersonId === this.getCurrentPersonId()) ? true : false;
    }


    showWatcherValidation(): void {
        if (!this.isWatcherAlreadyAdded) {
            return;
        }
        const watcherWarning = document.getElementById('watcher-warning');
        watcherWarning.style.setProperty('display', 'block', 'important');
        setTimeout(() => {
            watcherWarning.style.setProperty('display', 'none', 'important');
        }, 3000);
    }

    canShowSave(): boolean {
        return this.canModifyServiceRequest &&
            (document.URL.includes('questionnaire') || document.URL.includes('overview'));
    }

    getPrintTemplates() {
        if (this.printTemplates.length) {
            $('#printServiceRequestModal').modal('show');
            return null;
        }
        this.$subscriptions.push(this._serviceRequestService.getLetterTemplates().subscribe(
            (res: any) => {
                this.printTemplates = res.data || [];
                $('#printServiceRequestModal').modal('show');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching print templates failed. Please try again.');
            }
        ));
    }

    closePrintModal() {
        $('#printServiceRequestModal').modal('hide');
        this.userSelectedTemplate = [];
        this.isChecked = {};
    }

    selectedTemplates(isChecked: any, template: any) {
        if (isChecked) {
            this.userSelectedTemplate.push(template);
        } else {
            const INDEX = this.userSelectedTemplate.findIndex(element =>
                element.letterTemplateTypeCode === template.letterTemplateTypeCode);
            this.userSelectedTemplate.splice(INDEX, 1);
        }
    }

    initiateDownload() {
        if (this.userSelectedTemplate.length) {
            const fileTypeCondition =  this.userSelectedTemplate.length === 1 ? this.userSelectedTemplate[0].printFileType : 'zip';
            this.printSR(fileTypeCondition);
        } else {
            this.validationMap.set('selectTemplate', 'Please select one template');
        }
    }
// Accepted file type Doc or Pdf
    printSR(fileType: string) {
        if (!this.isDownloading) {
            this.isDownloading = true;
            this.$subscriptions.push(this._serviceRequestService
                .printServiceRequest({
                    'serviceRequestId': this.serviceRequest.serviceRequestId,
                    'letterTemplateTypeCodes': this.setTypeCodeArray()
                }).subscribe(
                    fileData => {
                        this.closePrintModal();
                        this.parsePrintedPage(fileData, fileType);
                        this.isDownloading = false;
                    }, (err) => {
                        this.closePrintModal();
                        setTimeout(() => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Printing Service Request failed. Please try again.');
                        }, 500);
                        this.isDownloading = false;
                    }

                ));
        }
    }

    reload() {
        window.location.reload();
    }

    setTypeCodeArray() {
        return this.userSelectedTemplate.map(template => template.letterTemplateTypeCode);
    }

    parsePrintedPage(fileData, fileType: string) {
        const fileName = 'Service request_' + this.serviceRequest.serviceRequestId;
        fileDownloader(fileData, fileName, fileType);
    }

}
