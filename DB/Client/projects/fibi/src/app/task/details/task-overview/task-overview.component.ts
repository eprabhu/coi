import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavigationService } from '../../../common/services/navigation.service';
import { DetailsService } from '../details.service';
import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, AWARD_LABEL, COMMON_APPROVE_LABEL, AWARD_ERR_MESSAGE } from '../../../app-constants';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonDataService } from '../../../award/services/common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { getSectionList } from '../../../award/services/section-wise-utility';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AwardService } from '../../../award/services/award.service';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { fileDownloader, setFocusToElement } from '../../../common/utilities/custom-utilities';

declare var $: any;
@Component({
  selector: 'app-task-overview',
  templateUrl: './task-overview.component.html',
  styleUrls: ['./task-overview.component.css'],
  providers: [WafAttachmentService]
})
export class TaskOverviewComponent implements OnInit, OnDestroy {

  taskId: any;
  taskDetails: any = {
    taskTypeCode: null,
    assigneePersonId: null,
    moduleCode: 1,
    moduleItemKey: null,
    moduleItemId: null,
    startModuleSubItemKey: '',
    endModuleSubItemKey: null,
    createUser: this._commonService.getCurrentUserDetail('userName'),
    updateTimeStamp: null,
    updateUser: this._commonService.getCurrentUserDetail('userName'),
    taskAttachments: []
  };
  taskAttachments: any = [];
  uploadedFile = [];
  updateUser = this._commonService.getCurrentUserDetail('userName');
  lookupData: any = {};
  taskTypeCode = null;
  clearField: String;
  elasticSearchOptions: any = {};
  attachmentWarningMsg = null;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  isError = false;
  mandatoryList = new Map();
  warningMessage = new Map();
  isEditMode = false;
  isMaintainTask = false;
  isAssignee = false;
  isEditAssignee = false;
  departmentRights: any = [];
  reassignObject: any = {};
  canApproveRouting: any;
  taskAttachmentWarningMsg = null;
  approveModalUploadedFile = [];
  requestObject: any = {};
  modalAproveHeading: string;
  $subscriptions: Subscription[] = [];
  awardSequenceNumber: any;
  sectionEditableList: any = [];
  result: any = {};
  isShowNotfication = false;
  workflowAwardStatusCode: any;
  leadUnitNumber: any;
  isEmptyCommentArea = false;
  taskTypeObject = null;
  validationObject: any = {};
  debounceTimer: any;
  setFocusToElement = setFocusToElement;
  isSaving = false;
  isTaskFromSameModuleId = false;
  createTaskValidations: any = [];

  constructor(
      private _detailsService: DetailsService,
      private _activatedRoute: ActivatedRoute,
      public _navigationService: NavigationService,
      private _elasticConfig: ElasticConfigService,
      public _commonData: CommonDataService,
      public _commonService: CommonService,
      private _awardService: AwardService,
      private _router: Router,
      private _wafAttachmentService: WafAttachmentService
) { }

  ngOnInit() {
    this.taskDetails.taskTypeCode = null;
    this.departmentRights = this._commonData.departmentLevelRights;
    this.getPermissions();
    this.getAwardDetails();
    this.isRouteLogBypassedOdAlternateApproverAdded();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    this._detailsService.taskAwardId = null;
  }

    getAwardDetails() {
        this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
            if (data) {
                this.result = data;
                this.taskDetails.moduleItemKey = data.award.awardNumber;
                this.taskDetails.moduleItemId = data.award.awardId;
                this.leadUnitNumber = data.award.leadUnit.unitNumber;
                this.awardSequenceNumber = data.award.sequenceNumber;
                this.workflowAwardStatusCode = data.award.awardWorkflowStatus.workflowAwardStatusCode;
                this.getTaskDetailsFromRoute();
            }
        }));
    }

    private getTaskDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            this.showManualLoader(true);
            this.taskId = params['taskId'];
            this.initialDataLoad();
        }));
    }

    showManualLoader(condition: boolean) {
        this._commonService.isManualLoaderOn = condition;
        this._commonService.isShowOverlay = condition;
    }

  /**
   * to check the right maintain_task is peresent
   */
  getPermissions() {
    this.isMaintainTask = this.departmentRights.find(element => element === 'MAINTAIN_TASK') ? true : false;
  }

  /**
   * Fetch a single task details using a service call
   */
  fetchTaskDetails(triggerChangeData) {
    this.$subscriptions.push(this._detailsService.loadTaskDetailsById(
      {
        'taskId': this.taskId,
        'moduleItemId': this.taskDetails.moduleItemId,
        'moduleItemKey': this.taskDetails.moduleItemKey,
        'moduleCode': 1,
        'subModuleCode': 2,
        'personId': this._commonService.getCurrentUserDetail('personID')
      }).subscribe((data: any) => {
        this.taskDetails = data.task;
        this._detailsService.taskAwardId = data.task.moduleItemId;
        this.isTaskFromSameModuleId = this.checkStatusBasedOnTaskTypeAndModuleId();
        this.viewSwitching();
        this.taskAttachments = data.task.taskAttachments;
        this.canApproveRouting = data.canApproveRouting;
        this.setDateValue();
        this.isShowNotficationButton();
        this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
        this.elasticSearchOptions.defaultValue = this.taskDetails.assigneeFullName;
        if (!triggerChangeData) {
          document.getElementById('task-comment').click();
        }
        this.isAssigneeCheck();
        if (data.sectionTypeCodes) {
          this.getEditableSections(data.sectionTypeCodes);
        }
        this.showManualLoader(false);
      }, err => {
        this.showManualLoader(false);
        if (err.status === 403) {
            this._commonService.forbiddenModule = '1';
            this._router.navigate(['/fibi/error/403']);
        }
      }));
  }
  /**
   * workflow status of award
   * 2 - Approval In Progress
   * 3 - Active
   */
  initialDataLoad() {
    this.$subscriptions.push(this._detailsService.getTaskLookUpData().subscribe((data: any) => {
      this.lookupData = data;
      if (['2', '3'].includes(this.workflowAwardStatusCode)) {
        this.lookupData.taskTypes = this.lookupData.taskTypes.filter(taskType => taskType.isReviewTask === 'Y');
      } else {
        this.lookupData.taskTypes = this.lookupData.taskTypes.filter(taskType =>
          this.filterByAwardTaskTypeMappings(taskType.awardTaskTypeMappings));
      }
      this.taskId ? this.fetchTaskDetails('') : this.showManualLoader(false);
    }, err => {
        this.showManualLoader(false);
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching lookups failed. Please try again.');
    }));
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    if (!this.taskId) {
      this.taskDetails.startDate = new Date(new Date().setHours(0, 0, 0, 0));
    }
  }
  filterByAwardTaskTypeMappings(taskTypeMaps) {
    // tslint:disable:triple-equals
    let taskFilterdMap = null;
    if (this.result.award.serviceRequestType && this.result.award.awardDocumentTypeCode == 3) {
      taskFilterdMap = taskTypeMaps.find(documentType =>
        documentType.awardDocumentTypeCode === this.result.award.awardDocumentType.awardDocumentTypeCode &&
        documentType.typeCode == this.result.award.serviceRequestType.typeCode
      );
    } else {
      taskFilterdMap = taskTypeMaps.find(documentType =>
        documentType.awardDocumentTypeCode === this.result.award.awardDocumentType.awardDocumentTypeCode
      );
    }
    return taskFilterdMap;
  }

  /**
   * 1 - satuscode value "open"
   * 2 - satuscode value "review in progress"
   * for switching the view of task
   */
  viewSwitching() {
    this.isEditMode = this.isMaintainTask && this.taskDetails
    && ['1', '2'].includes(this.taskDetails.taskStatusCode) && this.isTaskFromSameModuleId ? true : false;
  }

  checkStatusBasedOnTaskTypeAndModuleId(): boolean {
    if (this.taskDetails.taskType.isReviewTask === 'Y') {
      return true;
    }
    return this.result.award.awardId == this.taskDetails.moduleItemId ? true : false;
  }

  /**
   * to check the whether the logged in person is assignee of the task
   */
  isAssigneeCheck() {
    this.isAssignee = (this.taskDetails.assigneePersonId === this._commonService.getCurrentUserDetail('personID'));
  }

  /**
   * @param  {} result
   * Elastics search result function
   */
  selectedPerson(result) {
    this.taskDetails.assigneePersonId = result ? result.prncpl_id : null;
  }

  isRouteLogBypassedOdAlternateApproverAdded() {
    this.$subscriptions.push(this._detailsService.isTaskBypassOrAlternateApproverTrigger.subscribe((data: any) => {
      if (data) {
        this.fetchTaskDetails(data);
      }
    }));
  }

  /**
   * @param  {} statusCode
   * Sets award status badge w.r.t status code
   * 1- Open
   * 2- In Progress
   * 3- Review In Progress
   * 4- Returned (to assignee)
   * 5- Completed
   * 6- Cancel
   */
  getBadgeByStatusCode(statusCode) {
    if (statusCode === '5') {
      return 'success';
    } else if (statusCode === '4' || statusCode === '6') {
      return 'danger';
    } else if (statusCode === '2' || statusCode === '3') {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /** Dates validating method */
  datesValidation() {
    let isDatesValid = true;
    this.warningMessage.clear();
    isDatesValid = this.startDateValidation(isDatesValid) && this.dueDateValidation(isDatesValid);
    return isDatesValid;
  }

  /**
   * @param  {} isDatesValid
   * validates the start date if not porvided and validates it with award final expiration date.
   */
  startDateValidation(isDatesValid) {
    if (!this.taskDetails.startDate) {
      isDatesValid = false;
      this.warningMessage.set('startDateWarningText', '* Please select a start date');
    }
    return isDatesValid;
  }

  /**
   * @param  {} isDatesValid
   * validates the due date if not porvided and validates it with award final expiration date.
   */
  dueDateValidation(isDatesValid) {
    if (!this.taskDetails.dueDate && compareDates(this.taskDetails.dueDate, this._commonData.finalExpirationDate) === 0) {
      isDatesValid = false;
      this.warningMessage.set('dueDateWarningText', '* Please select an end date');
    } else {
      if (compareDates(this.taskDetails.startDate, this.taskDetails.dueDate) === 1) {
        isDatesValid = false;
        this.warningMessage.set('dueDateWarningText', '* Please select a due date after start date');
      }
    }
    return isDatesValid;
  }

  /**
   * @param  {} files
   * Pepare attachments array of objects for backend service
   */
  prepareAttachment(files) {
    this.attachmentWarningMsg = null;
    let dupCount = 0;
    for (const index of files) {
      if (this.checkDuplicateFiles(index)) {
        dupCount = dupCount + 1;
      } else {
        this.uploadedFile.push(index);
      }
    }
    if (dupCount > 0) {
      this.attachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
    }
  }
  /**
   * @param  {} index
   * checks for file duplication
   */
  checkDuplicateFiles(index) {
    return this.taskAttachments.find(dupFile => dupFile.fileName === index.name &&
      dupFile.mimeType === index.type) != null;
  }

  /**
   * to check is already persent attachments
   */
  filterNewAttachments() {
    this.taskDetails.taskAttachments = this.taskDetails.taskAttachments.filter(item => item.attachmentId);
    this.taskAttachments = this.taskAttachments.filter(item => !item.attachmentId);
  }

  /**
   * @param  {} removeObjectIndex
   * @param  {} item
   * Delete uploaded attachment from array.If the file is DB, it will delete from backend using service call
   */
  deleteFromUploadedFileList(attachment) {
    this.attachmentWarningMsg = null;
    const attachmentIndex = this.taskAttachments.indexOf(attachment);
    if (!attachment.attachmentId) {
      this.removeAttachment(attachmentIndex);
    } else {
      this.$subscriptions.push(this._detailsService.deleteTaskAttachment({ 'taskAttachmentId': attachment.attachmentId })
        .subscribe((data: any) => { },
          err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Delete Attachments failed. Please try again.'); },
          () => {
            this.removeAttachment(attachmentIndex);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
          }));
    }
  }
  /**
   * @param  {} index :
   */
  removeAttachment(index) {
    this.taskAttachments.splice(index, 1);
    this.uploadedFile.splice(index, 1);
  }

  /**
   * @param  {} attachment
   * Download attachments using service call
   */
  downloadAttachments(attachment) {
    this.$subscriptions.push(this._detailsService.downloadTaskAttachment(attachment.attachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
      }));
  }

  /**
 * Validations for Task type, assignee person & dates
 */
  fieldValidations() {
    this.clearField = new String('false');
    this.isError = false;
    this.mandatoryList.clear();
    this.warningMessage.clear();
    if (!this.taskDetails.taskTypeCode || this.taskDetails.taskTypeCode === 'null') {
      this.mandatoryList.set('taskType', '* Please enter Task Type');
    }
    if (!this.taskDetails.assigneePersonId || this.taskDetails.assigneePersonId === '') {
      this.mandatoryList.set('assigneePerson', '* Please enter Assignee');
      this.isError = true;
      this.clearField = new String('true');
    } else {
      this.datesValidation();
    }
  }

  setNewAttachments() {
    const newAttachments = [];
    this.uploadedFile.forEach(e => {
      newAttachments.push({
        'fileName': e.name,
        'mimeType': e.type,
        'updateUser': this.taskDetails.updateUser,
        'lastUpdateUserFullName': this._commonService.getCurrentUserDetail('fullName'),
      });
    });
    return newAttachments;
  }

  /**
   * Function for save task.
   */
  saveTask() {
    this.attachmentWarningMsg = null;
    this.fieldValidations();
    this.taskDetails.startDate = parseDateWithoutTimestamp(this.taskDetails.startDate);
    this.taskDetails.dueDate = parseDateWithoutTimestamp(this.taskDetails.dueDate);
    let isTaskExist = false;
    const isTaskDetailsDatesValid = this.datesValidation();
    if (this.taskDetails.taskTypeCode && isTaskDetailsDatesValid && !this.isError && !this.isSaving) {
      this.showManualLoader(true);
      this.taskDetails.startModuleSubItemKey = this.awardSequenceNumber;
      if (!this._commonService.isWafEnabled) {
        this.isSaving = true;
        this.$subscriptions.push(this._detailsService.saveTask(
          this.taskDetails, this.setNewAttachments(), this.updateUser, this.uploadedFile,
          this.taskId, this.leadUnitNumber).subscribe((data: any) => {
            isTaskExist = this.checkTaskExist(data);
            this.isSaving = false;
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS,( this.taskId?'Updating ':'Saving ')+ 'Task failed. Please try again.');
            this.isSaving = false;
            this.showManualLoader(false);
          }, () => {
            this.showTaskSaveResponse(isTaskExist);
            this.isSaving = false;
            this.showManualLoader(false);
          }));
      } else {
        this.saveTaskForWaf();
      }
    }
  }

  checkTaskExist(data) {
    if (!data.isTaskExist) {
      if (!this.taskId) {
        this.result.taskCount = data.taskCount;
      }
      this.setTaskCommonData(data);
      return false;
    }
    return true;
  }

  showTaskSaveResponse(isTaskExist) {
    if (isTaskExist) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Task already exists.');
    } else {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, "Task " + (this.taskId ? 'updated ' : 'saved ') + 'successfully.');
      this._router.navigate(['/fibi/award/task'],
        {
          queryParams: {
            'awardId': this.taskDetails.moduleItemId,
            'taskId': null
          }
        });
    }
  }

  /** If there are attachment, calls the 'saveAttachment' function with parameters in waf service for splitting attachment,returns data.
   * Otherwise calls saveWafRequest function in wafAttachmentService*/
  async saveTaskForWaf() {
    const requestForWaf: any = {
      task: this.taskDetails,
      updateUser: this.updateUser,
      subModuleCode: 2,
      moduleCode: 1,
      personId: this._commonService.getCurrentUserDetail('personID'),
      leadUnitNumber: this.leadUnitNumber
    };
    const requestSetAtRemaining = {
      taskAttachments: [],
    };
    if (this.uploadedFile.length > 0) {
      const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
        '/saveOrUpdateTaskForWAF', 'task', this.taskAttachments);
      this.checkTaskSaved(data);
    } else {
      requestForWaf.taskAttachments = this.taskAttachments;
      this._wafAttachmentService.saveWafRequest(requestForWaf, '/saveOrUpdateTaskForWAF').then((data: any) => {
        this.checkTaskSaved(data);
      }).catch(error => {
        this.checkTaskSaved(error);
      });
    }
  }
  /**
   * @param  {} data
   * if data doesn't contains error, saves faq details, otherwise shows error toast
   */
  checkTaskSaved(data) {
    if (data && !data.error) {
      const isTaskExist = this.checkTaskExist(data);
      this.showTaskSaveResponse(isTaskExist);
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for saving task');
    }
  }

  /**
   * to set the object to reassign the object
   */
  reAssigningTaskObject() {
    this.reassignObject.taskId = this.taskId;
    this.reassignObject.updateUser = this.updateUser;
    this.reassignObject.newAssigneePersonId = this.taskDetails.assigneePersonId;
    this.reassignObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.reassignObject.moduleItemId = this.taskDetails.moduleItemId;
    this.reassignObject.moduleItemKey = this.taskDetails.moduleItemKey;
    this.reassignObject.moduleCode = 1;
    this.reassignObject.subModuleCode = 2;
  }

  reAssignTask() {
    this.reAssigningTaskObject();
    this.fieldValidations();
    let isTaskExist = false;
    if (this.taskDetails.assigneeFullName && !this.isError) {
      this.$subscriptions.push(this._detailsService.reAssignTask(this.reassignObject).subscribe((data: any) => {
        isTaskExist = data.isTaskExist;
        if (!isTaskExist) {
            this.setTaskCommonData(data);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person Re-assigned successfully');
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Task already exists');
            this.changeBackAssigneeName();
          }
          this.isEditAssignee = false;
      }, _err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error re-assigning person! Please try again.'); }));
    }
  }
  /**
   * for changing the elastic back to the original when we reassign task
   */
  changeBackAssigneeName() {
    this.elasticSearchOptions.defaultValue = this.taskDetails.assigneeFullName;
  }

  setDateValue() {
    if (this.isEditMode) {
      this.taskDetails.startDate = this.taskDetails.startDate ? getDateObjectFromTimeStamp(this.taskDetails.startDate) : null;
      this.taskDetails.dueDate = this.taskDetails.dueDate ? getDateObjectFromTimeStamp(this.taskDetails.dueDate) : null;
    }
  }

  startTask() {
    this.$subscriptions.push(this._detailsService.startTask({
      'taskId': this.taskId,
      'updateUser': this.updateUser,
      'personId': this._commonService.getCurrentUserDetail('personID'),
      'moduleItemId': this.taskDetails.moduleItemId
    })
      .subscribe((data: any) => {
        this.setTaskCommonData(data);
      }));
  }

  completeTask() {
    this.$subscriptions.push(this._detailsService.completeTask({
      'taskId': this.taskId,
      'moduleItemKey': this.taskDetails.moduleItemKey,
      'moduleItemId': this.taskDetails.moduleItemId,
      'moduleCode': 1,
      'subModuleCode': 2,
      'updateUser': this._commonService.getCurrentUserDetail('userName'),
      'userName': this._commonService.getCurrentUserDetail('userName'),
      'personId': this._commonService.getCurrentUserDetail('personID'),
      'workflow': null,
      'endModuleSubItemKey': this.awardSequenceNumber,
      'leadUnitNumber': this.leadUnitNumber
    }).subscribe((data: any) => {
      this.result.taskCount = data.taskCount;
      this.setTaskCommonData(data);
      this.isSaving = false;
      this._detailsService.isTaskRouteChangeTrigger.next(true);
      document.getElementById('task-route').click();
    }));
  }

  cancelTask() {
    this.$subscriptions.push(this._detailsService.cancelTask({
      'taskId': this.taskId, 'updateUser': this.updateUser
      , 'moduleItemId': this.taskDetails.moduleItemId,
      'moduleCode': 1, 'subModuleCode': 2
    }).subscribe((data: any) => {
      this.result.taskCount = data.taskCount;
      this.setTaskCommonData(data);
      this.isEditMode = false;
      this._router.navigate(['/fibi/award/task'],
        {
          queryParams: {
            'awardId': this.taskDetails.moduleItemId,
            'taskId': null
          }
        });
      this._commonService.showToast(HTTP_SUCCESS_STATUS, "Task rejected successfully.");
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Rejecting task failed. Please try again.');
    }));
  }

  setTaskCommonData(data) {
    this.taskDetails = data.task;
    this.isAssigneeCheck();
    this.viewSwitching();
    this.setDateValue();
    this.isShowNotficationButton();
    this.getEditableSections(data.sectionTypeCodes);
    this.canApproveRouting = data.canApproveRouting;
    this.result.sectionTypeCodes = data.sectionTypeCodes;
    this._commonData.setAwardData(this.result);
    this._awardService.isAwardActive.next(true);
  }

  /**
   * @param  {} files
   * Check file duplication ,if no duplication insert it into an array
   */
  fileDrop(files) {
    this.taskAttachmentWarningMsg = null;
    let dupCount = 0;
    for (const index of files) {
      if (this.approveModalUploadedFile.find(dupFile => dupFile.name === index.name) != null) {
        dupCount = dupCount + 1;
      } else {
        this.approveModalUploadedFile.push(index);
      }
    }
    if (dupCount > 0) {
      this.taskAttachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
    }
  }

  deleteFromApproveModalUploadedFile(index) {
    this.approveModalUploadedFile.splice(index, 1);
    this.taskAttachmentWarningMsg = null;
  }

  approveTaskItem() {
    this.taskAttachmentWarningMsg = null;
    this.requestObject = {};
    this.isEmptyCommentArea = false;
    this.modalAproveHeading = COMMON_APPROVE_LABEL;
    this.requestObject.actionType = 'A';
  }

  rejectTaskItem() {
    this.taskAttachmentWarningMsg = null;
    this.requestObject = {};
    this.isEmptyCommentArea = false;
    this.modalAproveHeading = 'Return';
    this.requestObject.actionType = 'R';
  }

  setTaskWorFlowRequestObject() {
    this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.requestObject.moduleItemId = this.taskDetails.moduleItemId;
    this.requestObject.taskId = this.taskDetails.taskId;
    this.requestObject.moduleItemKey = this.taskDetails.moduleItemKey;
    this.requestObject.approverStopNumber = null;
    this.requestObject.leadUnitNumber = this.leadUnitNumber;
    this.requestObject.endModuleSubItemKey = this.awardSequenceNumber;
  }

  /**
   * approves or reject task with respect to actiontype and
   * set task object, latest workflow  and show toasters w.r.t
   * response
   */
  maintainTaskWorkFlow() {
    this.setTaskWorFlowRequestObject();
    this.validateReturnRequest();
    if (!this.isEmptyCommentArea && !this.isSaving) {
      this.isSaving = true;
      this._commonService.isShowOverlay = true;
      this.$subscriptions.push(this._detailsService.maintainTaskWorkFlow(this.requestObject, this.approveModalUploadedFile)
        .subscribe((data: any) => {
          this.taskDetails = data.task;
          this._commonService.isShowOverlay = false;
          this.setDateValue();
          this.getEditableSections(data.sectionTypeCodes);
          this.canApproveRouting = data.canApproveRouting;
          this.isSaving = false;
          this._detailsService.isTaskRouteChangeTrigger.next(true);
          if (this.requestObject.actionType === 'R') {
            this.result.taskCount = data.taskCount;
            this.setTaskCommonData(data);
          }
        },
          err => {
            $('#approveDisapproveTaskModal').modal('hide');
            this.closeApproveDisapproveModal();
            this._commonService.isShowOverlay = false;
            if (err.error && err.error.errorMessage  === 'Deadlock') {
              this._commonService.showToast(HTTP_ERROR_STATUS,
                `${COMMON_APPROVE_LABEL.toLowerCase()}/disapprove Task failed. Please try again.`);
            } else {
              this._commonService.showToast(HTTP_ERROR_STATUS,`Action cannot be completed due to a system error.
                ${AWARD_ERR_MESSAGE} for assistance.`);
            } 
            this.isSaving = false;
          },
          () => {
            $('#approveDisapproveTaskModal ').modal('hide');
            if (this.requestObject.actionType === 'A') {
              this._commonService.showToast(HTTP_SUCCESS_STATUS, `Task ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
            } else if (this.requestObject.actionType === 'R') {
              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Task rejected successfully.');
            }
            this.closeApproveDisapproveModal();
            this.isSaving = false;
          }));
    }
  }
  /**
   * to make commetns mandatory for returning in the routelog
   */
  validateReturnRequest() {
    this.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
  }

  closeApproveDisapproveModal() {
    $('#approveRejectTaskModal').modal('hide');
    this.requestObject = {};
    this.approveModalUploadedFile = [];
  }

  getEditableSections(sectionTypeCodes) {
    this.sectionEditableList = getSectionList(sectionTypeCodes);
  }

  notifyAssignee() {
    this.$subscriptions.push(this._detailsService.notifyTaskAssignee({
      'taskId': this.taskDetails.taskId,
      'assigneePersonId': this.taskDetails.assigneePersonId,
      'moduleCode': 1,
      'moduleItemId': this.taskDetails.moduleItemId,
      'subModuleCode': 2,
      'taskTypeCode': this.taskDetails.taskTypeCode,
      'taskStatusCode': this.taskDetails.taskStatusCode,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe(data => {
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Notification sending failed');
    },
      () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification sent');
      }
    ));
  }
  /**
   * Show/Hide notification icon
   * 1- Open
   * 2- In Progress
   */
  isShowNotficationButton() {
    this.isShowNotfication = this.taskId && this.isMaintainTask &&
      !(this.taskDetails.assigneePersonId === this._commonService.getCurrentUserDetail('personID')) &&
      ['1', '2'].includes(this.taskDetails.taskStatus.taskStatusCode);
  }

    setTaskDescription() {
        this.taskTypeObject = this.lookupData.taskTypes.find(ele => ele.taskTypeCode == this.taskDetails.taskTypeCode) || null;
        this.taskDetails.taskType = this.taskTypeObject;
        this.taskDetails.taskTypeCode = this.taskTypeObject ? this.taskTypeObject.taskTypeCode : null;
        this.taskDetails.description = this.taskTypeObject ? this.taskTypeObject.instruction : null;
    }

  /**
   * Evaluate businness rule validation before complete
   * task by passing module and submodule code and key
   * and display the validation on a modal
   */
  triggerCompleteModal() {
    const validationRequest: any = {
      moduleCode: 1,
      subModuleCode: 2,
      moduleItemKey: this.taskDetails.moduleItemId,
      subModuleItemKey: this.taskId,
    };
    this.validationObject.errorList = [];
    this.validationObject.warningList = [];
    if (!this.isSaving) {
        this.isSaving = true;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.$subscriptions.push(this._commonService.evaluateValidation(validationRequest).subscribe((data: any) => {
            this.validationObject.validationMsg = data;
            if (this.validationObject.validationMsg.length > 0) {
              this.validationObject.validationMsg.forEach(element => {
                (element.validationType === 'VW') ?
                  this.validationObject.warningList.push(element) : this.validationObject.errorList.push(element);
              });
            }
            document.getElementById('confirm-btn').click();
          }));
        }, 500);
      }
    }

  validateCreateTasks() {
    this.$subscriptions.push(this._detailsService.validateCreateTask(this.taskDetails).subscribe((data: any) => {
      this.createTaskValidations = data;
      this.createTaskValidations.length ? $('#validateStartTask').modal('show') : this.saveTask();
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in validating task');
    }));
  }

  checkErrorExistsInCreation() {
    return this.createTaskValidations.some(e => e.type == 'E');
  }
}
