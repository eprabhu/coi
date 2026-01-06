import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TaskSideNavBarService } from './task-side-nav-bar.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonDataService } from '../services/common-data.service';
import { CommonService } from '../../common/services/common.service';
import { getSectionList } from '../../award/services/section-wise-utility';
import { NavigationService } from '../../common/services/navigation.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, COMMON_APPROVE_LABEL } from '../../app-constants';
import { AwardService } from '../services/award.service';

declare var $: any;

@Component({
  selector: 'app-task-side-nav-bar',
  templateUrl: './task-side-nav-bar.component.html',
  styleUrls: ['./task-side-nav-bar.component.css']
})
export class TaskSideNavBarComponent implements OnInit, OnDestroy {

  constructor(private _taskNavService: TaskSideNavBarService, public _commonData: CommonDataService,
    private _commonService: CommonService, public _navigationService: NavigationService,
    public _awardService: AwardService) { }

  $subscriptions: Subscription[] = [];
  awardData: any = {};
  taskDataList: any = [];
  taskList: any = [];
  taskFilterValues: any = [];
  isMaintainTask = false;
  validationObject: any = {};
  debounceTimer: any;
  taskAttachmentWarningMsg = null;
  approveModalUploadedFile = [];
  requestObject: any = {};
  modalAproveHeading: string;
  isEmptyCommentArea = false;
  operatinOnTask: any = {};
  filterStatusCode = null;
  isShowtaskNavBar = false;
  editableSectionNavigation: any = {};
  isSuccesToast = false;
  scrollHeight: number;
  isSaving = false;
  @ViewChild('awardNavOverlay', { static: true }) awardNavOverlay: ElementRef;

  ngOnInit() {
    this.showTaskNavBar();
    this.getPermissions();
    this.getTaskLookUpData();
    this.getAwardDetails();
    this.fetchTask();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getPermissions() {
    this.isMaintainTask = this._commonData.departmentLevelRights.includes('MAINTAIN_TASK');
  }

  getAwardDetails() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data;
      }
    }));
  }
  /**
   * To fetch all the task in that award
   */
  fetchTask() {
    this.$subscriptions.push(this._taskNavService.fetchTasksByParams({
      'moduleCode': 1,
      'subModuleCode': 2,
      'moduleItemKey': this.awardData.award.awardNumber,
      'personId': this._commonService.getCurrentUserDetail('personID'),
      'moduleItemId': this.awardData.award.awardId,
      'taskTabName': 'TASKS'
    }).subscribe((data: any) => {
      this.taskDataList = data.tasks;
      this.filterTaskByStatus(this.filterStatusCode);
      this._commonData.taskCount = data.taskCount;
    }));
  }

  /**
   * For getting the task status for filtering
   */
  getTaskLookUpData() {
    this.$subscriptions.push(this._taskNavService.getTaskLookUpData().subscribe((data: any) => {
      this.taskFilterValues = this.filterTaskStatus(data.taskStatusList);
    }));
  }
  /**
   * @param  {} taskStatusList : list of status
   * the task statuses with taskStatusCode 6 (Cancel) and 5 (Completed) are excluded as not included in task list
   */
  filterTaskStatus(taskStatusList) {
    return taskStatusList.filter(status => status.taskStatusCode != '6' && status.taskStatusCode != '5');
  }
  /**
   * @param  {} task
   * to check wether the logged in user is the pi of that task
   */
  isAssigneeCheck(task) {
    return (task.assigneePersonId === this._commonService.getCurrentUserDetail('personID'));
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
  /**
   * @param  {} task
   * for triggering the task complete modal or warning modal
   */
    triggerCompleteModal(task) {
        this.setTaskDetailsForDisplay(task);
        const validationRequest: any = {
            moduleCode: 1,
            subModuleCode: 2,
            moduleItemKey: this.awardData.award.awardId,
            subModuleItemKey: task.taskId
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
                    document.getElementById('confirm-btn-task_nav').click();
                }));
            }, 500);
        }
    }
  /**
   * @param  {} actionType
   * @param  {} task
   * to approve or reject the task which is in the route log
   */
  approveReturnTaskItem(actionType, task) {
    this.taskAttachmentWarningMsg = null;
    this.requestObject = {};
    this.isEmptyCommentArea = false;
    this.modalAproveHeading = actionType === 'A' ? COMMON_APPROVE_LABEL : 'Return';
    this.requestObject.actionType = actionType;
    this.setTaskWorFlowRequestObject(task);
    this.setTaskDetailsForDisplay(task);
  }
  /**
   * @param  {} task
   * for dispalying the details of the task on the modals
   */
  setTaskDetailsForDisplay(task) {
    this.operatinOnTask = task;
  }

  startTask() {
      if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(this._taskNavService.startTask({
          'taskId': this.operatinOnTask.taskId,
          'updateUser': this._commonService.getCurrentUserDetail('userName'),
          'personId': this._commonService.getCurrentUserDetail('personID'),
          'moduleItemId': this.awardData.award.awardId
        }).subscribe((data: any) => {
            this.operatinOnTask.sectionTypeCodes = data.sectionTypeCodes;
            this.setTaskData(this.operatinOnTask, data);
            this._commonData.taskCount = data.taskCount;
            this.isSaving = false;
          }, err => {
            this.showToast(HTTP_ERROR_STATUS, 'Starting Task failed. Please try again.', this.operatinOnTask);
            this.isSaving = false;
        }, () => {
            this.showToast(HTTP_SUCCESS_STATUS, 'Task started successfully.', this.operatinOnTask);
          }));
      }
  }

  completeTask() {
    this.$subscriptions.push(this._taskNavService.completeTask({
      'taskId': this.operatinOnTask.taskId,
      'moduleItemKey': this.awardData.award.awardNumber,
      'moduleItemId': this.awardData.award.awardId,
      'moduleCode': 1,
      'subModuleCode': 2,
      'updateUser': this._commonService.getCurrentUserDetail('userName'),
      'userName': this._commonService.getCurrentUserDetail('userName'),
      'personId': this._commonService.getCurrentUserDetail('personID'),
      'workflow': null,
      'endModuleSubItemKey': this.awardData.award.awardSequenceNumber,
      'leadUnitNumber': this.awardData.award.leadUnitNumber
    }).subscribe((data: any) => {
      this.operatinOnTask.sectionTypeCodes = [];
      this.setTaskData(this.operatinOnTask, data);
      this.isSaving = false;
    }, err => {
      this.showToast(HTTP_ERROR_STATUS, 'Completing Task failed. Please try again.', this.operatinOnTask);
      this.isSaving = false;
    }, () => {
      this.showToast(HTTP_SUCCESS_STATUS, 'Task completed successfully.', this.operatinOnTask);
    }));
  }

    cancelTask() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._taskNavService.cancelTask({
                'taskId': this.operatinOnTask.taskId, 'moduleItemId': this.awardData.award.awardId,
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'moduleCode': 1, 'subModuleCode': 2
            }).subscribe((data: any) => {
                this.operatinOnTask.sectionTypeCodes = [];
                this.setTaskData(this.operatinOnTask, data);
                this._commonData.taskCount = data.taskCount;
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, "Task rejected successfully.");
            }, err => {
                this.isSaving = false;
                this.showToast(HTTP_ERROR_STATUS, 'Cancelling Task failed. Please try again.', this.operatinOnTask);
            }, () => {
                this.showToast(HTTP_SUCCESS_STATUS, 'Task cancelled successfully.', this.operatinOnTask);
            }));
        }
    }

  /**
   * approves or reject task with respect to actiontype and
   * set task object, latest workflow  and show toasters w.r.t
   * response
   */
    maintainTaskWorkFlow() {
        this.validateReturnRequest();
        if (!this.isEmptyCommentArea && !this.isSaving) {
            this.isSaving = true;
            $('#approveRejectTaskModalFromNavBar').modal('hide');
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._taskNavService.maintainTaskWorkFlow(this.requestObject, this.approveModalUploadedFile)
                .subscribe((data: any) => {
                    this._commonService.isShowOverlay = false;
                    this.operatinOnTask.sectionTypeCodes = [];
                    this.setTaskData(this.operatinOnTask, data);
                    this._commonData.taskCount = data.taskCount;
                    this.isSaving = false;
                }, err => {
                    this.showToast(HTTP_ERROR_STATUS,
                        `${COMMON_APPROVE_LABEL.toLowerCase()}/disapprove Task failed. Please try again.`, this.operatinOnTask);
                    this._commonService.isShowOverlay = false;
                    this.isSaving = false;
                }, () => {
                    (this.requestObject.actionType === 'A') ?
                        this.showToast(HTTP_SUCCESS_STATUS,
                            `Task ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`, this.operatinOnTask) :
                        this.showToast(HTTP_SUCCESS_STATUS, 'Task rejected successfully.', this.operatinOnTask);
                    this.requestObject = {};
                    this.approveModalUploadedFile = [];
                }));
        }
    }
  /**
   * @param  {} task
   * for setting the request object for the task approve or reject operation
   */
  setTaskWorFlowRequestObject(task) {
    this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.requestObject.moduleItemId = this.awardData.award.awardId;
    this.requestObject.taskId = task.taskId;
    this.requestObject.moduleItemKey = this.awardData.award.awardNumber;
    this.requestObject.approverStopNumber = null;
    this.requestObject.leadUnitNumber = this.awardData.award.leadUnitNumber;
    this.requestObject.endModuleSubItemKey = this.awardData.award.awardSequenceNumber;
  }

  /**
   * to make commetns mandatory for returning in the routelog
   */
  validateReturnRequest() {
    this.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
  }

  closeApproveDisapproveModal() {
    $('#approveRejectTaskModalFromNavBar').modal('hide');
    this.requestObject = {};
    this.approveModalUploadedFile = [];
  }
  /**
   * @param  {} sectionTypeCodes
   * getting the editable section of the task
   */
  getEditableSections(sectionTypeCodes) {
    return getSectionList(sectionTypeCodes);
  }
  /**
   * @param  {} task
   * @param  {} data
   * for updating the task data for each operation
   */
  setTaskData(task, data) {
    task.taskStatus = data.task.taskStatus;
    task.taskStatusCode = data.task.taskStatusCode;
    task.canApproveRouting = data.canApproveRouting;
    this.awardData.sectionTypeCodes = data.sectionTypeCodes;
    this.awardData.taskCount = data.taskCount;
    this._commonData.setAwardData(this.awardData);
    this._awardService.isAwardActive.next(true);
    this.filterTaskByStatus(this.filterStatusCode);
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

  /**
   * @param  {} removeObjectIndex
   * @param  {} item
   * Delete uploaded attachment from array.If the file is DB, it will delete from backend using service call
   */
  deleteFromUploadedFileList(attachment) {
    const attachmentIndex = this.approveModalUploadedFile.indexOf(attachment);
    this.approveModalUploadedFile.splice(attachmentIndex, 1);
  }

  hideTaskNavBar() {
    if (!this.isSaving) {
        this._commonData.isShowtaskNavBar = false;
        this.operatinOnTask = {};
        this.showTaskNavBar();
    }
  }
  /**
   * @param  {boolean} condition
   * for setting the overlay
   */
  showTaskNavBar() {
    if (this._commonData.isShowtaskNavBar) {
      this.awardNavOverlay.nativeElement.style.display = 'block';
      this.scrollHeight = document.documentElement.scrollTop;
      document.documentElement.classList.add('cdk-global-scrollblock');
      document.documentElement.style.top  = - this.scrollHeight + 'px';
    } else {
      this.awardNavOverlay.nativeElement.style.display = 'none';
      document.documentElement.classList.remove('cdk-global-scrollblock');
      document.documentElement.scrollTop = this.scrollHeight;
    }
  }
  /**
   * @param  {} statusCode
   * for filtering the task list according to the condition
   */
  filterTaskByStatus(statusCode) {
    if (this.taskDataList) {
      this.taskList = statusCode ? this.taskDataList.filter(list => list.taskStatus.taskStatusCode
        == statusCode && list.taskStatus.taskStatusCode != '6' && list.taskStatus.taskStatusCode != '5') :
        this.taskDataList.filter(list => list.taskStatus.taskStatusCode != '6' &&
        list.taskStatus.taskStatusCode != '5');
    }
  }
  /**
   * @param  {} item
   * navigation to other sections
   */
  navigateToSection(item) {
    this.hideTaskNavBar();
    this._navigationService.navigateToDocumentRoutePath(item.routeName, item.documentId, this.awardData.award.awardId);
  }

  showToast(status, toastContent, task) {
    task.toastContent = toastContent;
    this.isSuccesToast = status === HTTP_SUCCESS_STATUS ? true : false;
    const toastEl = document.getElementById('task-nav-toast-' + task.taskId);
    toastEl.className = 'toast-visible col-12 py-2';
    toastEl.firstElementChild.className = status === HTTP_SUCCESS_STATUS ? 'success-toast' : 'danger-toast';
    setTimeout(() => {
      task.toastContent = null;
      toastEl.className = '';
      toastEl.firstElementChild.className = '';
    }, 3000);
  }

}
