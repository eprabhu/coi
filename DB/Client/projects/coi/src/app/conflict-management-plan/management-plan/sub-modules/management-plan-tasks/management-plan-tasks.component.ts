import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedComponentModule } from '../../../../shared-components/shared-component.module';
import { SharedModule } from '../../../../../app/shared/shared.module';
import { CommonModalConfig, ModalActionEvent } from '../../../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, openCommonModal } from '../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ManagementPlanTaskService } from './management-plan-task.service';
import {
    CmpTaskDetails, CmpTaskActionRequest, CmpTaskStatusCode, CmpTaskQuestionsDto,
    TaskQuestionAnswerSaveRequest, TaskCreateEditModalConfig,
    CmpTaskSaveRequest
} from './task.interface';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { TaskCreateEditModalComponent } from './task-create-edit-modal/task-create-edit-modal.component';
import { DataStoreEvent, GlobalEventNotifier } from '../../../../common/services/coi-common.interface';
import { FormsModule } from '@angular/forms';
import { ManagementPlanService } from '../../services/management-plan.service';
import { MAINTAIN_CMP_RIGHTS, TASK_STATUS_BADGE, TASK_STATUS_CODES, TaskActionType } from '../../../shared/management-plan-constants';
import { ManagementPlanStoreData } from '../../../shared/management-plan.interface';

@Component({
    selector: 'app-management-plan-tasks',
    templateUrl: './management-plan-tasks.component.html',
    styleUrls: ['./management-plan-tasks.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        TaskCreateEditModalComponent,
        FormsModule
    ],
})
export class ManagementPlanTasksComponent implements OnInit, OnDestroy {

    cmpTasks: CmpTaskDetails[] = [];
    isLoading = false;
    isSaving = false;
    cmpId: string | number;
    currentUserId: string;
    selectedTask: CmpTaskDetails | null = null;
    pendingAction: { type: TaskActionType, task: CmpTaskDetails } | null = null;
    isAssignee = false;
    cmpTaskStatusBadge = TASK_STATUS_BADGE;
    cmpTaskStatusCodes = TASK_STATUS_CODES;
    deleteModalConfig = new CommonModalConfig('cmp-task-delete-modal', 'Delete', 'Cancel');
    statusModalConfig = new CommonModalConfig('cmp-task-status-modal', 'Confirm', 'Cancel');
    hasCmpMaintainRight = false;
    private loggedPersonTaskList: CmpTaskDetails[] = [];
    private $subscriptions: Subscription[] = [];
    private questionSavers = new Map<number, Subject<string>>();
    private activeSaveCount = 0;

    constructor(
        private _activatedRoute: ActivatedRoute,
        public managementPlanTaskService: ManagementPlanTaskService,
        public commonService: CommonService,
        private _managementPlanDataStore: ManagementPlanDataStoreService,
        private _managementPlanService: ManagementPlanService
    ) { }

    ngOnInit(): void {
        this.currentUserId = this.commonService.getCurrentUserDetail('personID');
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        this.listenToStore();
        this.listenGlobalEventNotifier();
        this.hasCmpMaintainRight = this.commonService.getAvailableRight(MAINTAIN_CMP_RIGHTS);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        this.cmpId = MANAGEMENT_PLAN?.plan?.cmpId;
        if (storeEvent.action === 'REFRESH') {
            this.fetchTasks();
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'TRIGGER_USER_CMP_ACTIONS') {
                    if (['TRIGGER_CREATE_TASK_MODAL'].includes(event?.content?.actionType)) {
                        this.openCreateTaskModal();
                    }
                    if (['TRIGGER_SCROLL_TO_TASK'].includes(event?.content?.actionType)) {
                        this.scrollToTask(event?.content?.taskId);
                    }
                }
            })
        );
    }

    private fetchTasks(): void {
        if (!this.cmpId) { return; }
        this.isLoading = true;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.managementPlanTaskService.fetchTasks(this.cmpId).subscribe({
                next: (data: any) => {
                    this.cmpTasks = data || [];
                    this.cmpTasks.forEach(ele => {
                        if (ele) {
                            ele.isAssignee = this._managementPlanDataStore.checkLoggedInUserIsAssignee(ele);
                            if (ele.isAssignee && (String(ele.cmpTaskStatus?.taskStatusCode) === String(this.cmpTaskStatusCodes.IN_PROGRESS))) {
                                ele.isQuestionsExpanded = true;
                            }
                            if (ele.cmpTaskQuestions) {
                                ele.cmpTaskQuestions.forEach(q => {
                                    if (!q.cmpTaskQuestionAnswers || !q.cmpTaskQuestionAnswers.length) {
                                        q.cmpTaskQuestionAnswers = [{ answer: '', taskQuestionAnsId: null }];
                                    }
                                });
                            }
                        }
                    });
                    this.loggedPersonTaskList = this.cmpTasks.filter(ele => ele.assigneePersonId === this.currentUserId);
                    this.updateDataStore();
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Unable to fetch tasks.');
                }
            })
        );
        this.commonService.removeLoaderRestriction();
    }

    private updateDataStore(): void {
        this._managementPlanDataStore.updateStore(['cmpTaskList'], { cmpTaskList: this.cmpTasks });
        this._managementPlanDataStore.updateStore(['loggedPersonTaskList'], { loggedPersonTaskList: this.loggedPersonTaskList });
    }

    private performDelete(): void {
        if (!this.pendingAction?.task?.taskId) { return; }
        this.isSaving = true;
        this.$subscriptions.push(
            this.managementPlanTaskService.deleteTask(this.pendingAction.task.taskId).subscribe({
                next: () => {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Task deleted successfully');
                    this.closeActionModals();
                    this.fetchTasks();
                },
                error: () => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Unable to delete task');
                    this.isSaving = false;
                },
                complete: () => { this.isSaving = false; }
            })
        );
    }

    private performStatusAction(): void {
        if (!this.pendingAction?.task?.taskId) { return; }
        const STATUS_CODE = this.getStatusCodeForAction(this.pendingAction.type);
        const REQUEST: CmpTaskActionRequest = {
            taskId: this.pendingAction.task.taskId,
            cmpId: this.cmpId,
            taskStatusCode: STATUS_CODE,
            description: this.pendingAction.task.description || ''
        };
        this.isSaving = true;
        this.$subscriptions.push(
            this.managementPlanTaskService.performTaskAction(REQUEST).subscribe({
                next: () => {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Task status updated');
                    this.closeActionModals();
                    this.fetchTasks();
                },
                error: () => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update task status');
                    this.isSaving = false;
                },
                complete: () => { this.isSaving = false; }
            })
        );
    }

    private getStatusPrimaryLabel(type: TaskActionType): string {
        switch (type) {
            case 'START': return 'Start';
            case 'HOLD': return 'Hold';
            case 'COMPLETE': return 'Complete';
            default: return 'Confirm';
        }
    }

    private getStatusCodeForAction(type: TaskActionType): CmpTaskStatusCode {
        switch (type) {
            case 'START': return CmpTaskStatusCode.IN_PROGRESS;
            case 'HOLD': return CmpTaskStatusCode.ON_HOLD;
            case 'COMPLETE': return CmpTaskStatusCode.COMPLETED;
            default: return CmpTaskStatusCode.ASSIGNED;
        }
    }

    private setCmpId(): void {
        const ROUTE_CMP_ID = this._activatedRoute.snapshot.paramMap.get('CMP_ID');
        const STORE_CMP_ID = this._managementPlanDataStore.getData()?.plan?.cmpId;
        this.cmpId = ROUTE_CMP_ID || STORE_CMP_ID;
    }

    private listenToStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe(() => {
                const CMP_ID = this._managementPlanDataStore.getData()?.plan?.cmpId;
                if (CMP_ID && String(CMP_ID) !== String(this.cmpId)) {
                    this.cmpId = CMP_ID;
                    this.fetchTasks();
                }
            })
        );
    }

    private closeActionModals(): void {
        closeCommonModal(this.deleteModalConfig.namings.modalName);
        closeCommonModal(this.statusModalConfig.namings.modalName);
        setTimeout(() => {
            this.pendingAction = null;
            this.isSaving = false;
            this.selectedTask = null;
        });
    }

    private scrollToTask(taskId: any): void {
        if (taskId) {
            setTimeout(() => {
                const ELEMENT = document.getElementById(`task-${taskId}`);
                if (ELEMENT) {
                    ELEMENT.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    openCreateTaskModal(): void {
        this.selectedTask = null;
        this.managementPlanTaskService.taskCreateEditModalConfig.isShowModal = true;
        this.managementPlanTaskService.taskCreateEditModalConfig.cmpTask = null;
        setTimeout(() => {
            openCommonModal(this.managementPlanTaskService.taskCreateEditModalConfig.modalConfig.namings.modalName);
        });
    }

    openEditTask(task: CmpTaskDetails): void {
        this.selectedTask = task;
        this.managementPlanTaskService.taskCreateEditModalConfig.isShowModal = true;
        this.managementPlanTaskService.taskCreateEditModalConfig.cmpTask = task;
        setTimeout(() => {
            openCommonModal(this.managementPlanTaskService.taskCreateEditModalConfig.modalConfig.namings.modalName);
        });
    }

    confirmDelete(task: CmpTaskDetails): void {
        this.pendingAction = { type: 'DELETE', task };
        setTimeout(() => {
            openCommonModal(this.deleteModalConfig.namings.modalName);
        });
    }

    confirmStatusChange(task: CmpTaskDetails, type: TaskActionType): void {
        this.pendingAction = { type, task };
        const MODAL_NAME = this.statusModalConfig.namings.modalName;
        this.statusModalConfig.namings.primaryBtnName = this.getStatusPrimaryLabel(type);
        setTimeout(() => {
            openCommonModal(MODAL_NAME);
        });
    }

    onDeleteModalAction(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            this.performDelete();
        } else {
            this.closeActionModals();
        }
    }

    onStatusModalAction(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            this.performStatusAction();
        } else {
            this.closeActionModals();
        }
    }

    handleFormSubmit(event: { formValue: CmpTaskSaveRequest; isEdit: boolean }): void {
        if (!this.cmpId) {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'CMP identifier missing.');
            return;
        }
        this.isSaving = true;
        const PAYLOAD = {
            ...event.formValue,
            cmpId: this.cmpId,
        };
        this.$subscriptions.push(
            this.managementPlanTaskService.saveTask(PAYLOAD).subscribe({
                next: () => {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, `Task ${event.isEdit ? 'updated' : 'created'} successfully`);
                    closeCommonModal(this.managementPlanTaskService.taskCreateEditModalConfig.modalConfig.namings.modalName);
                    this.managementPlanTaskService.taskCreateEditModalConfig = new TaskCreateEditModalConfig();
                    this.fetchTasks();
                },
                error: () => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Unable to save task');
                    this.isSaving = false;
                },
                complete: () => { this.isSaving = false; }
            })
        );
    }

    handleAnswerChange(question: CmpTaskQuestionsDto, answer: string): void {
        if (!question?.cmpTaskQuestionId) { return; }
        if (!this.questionSavers.has(question.cmpTaskQuestionId)) {
            const SUBJECT = new Subject<string>();
            this.questionSavers.set(question.cmpTaskQuestionId, SUBJECT);
            this.$subscriptions.push(
                SUBJECT.pipe(debounceTime(1000),
                    switchMap(ans => {
                        this.activeSaveCount++;
                        this.commonService.showAutoSaveSpinner();
                        const PAYLOAD: TaskQuestionAnswerSaveRequest = {
                            cmpTaskQuestionId: question.cmpTaskQuestionId,
                            answer: ans,
                            taskQuestionAnsId: question?.cmpTaskQuestionAnswers?.[0]?.taskQuestionAnsId
                        };
                        return this.managementPlanTaskService.saveQuestionAns(PAYLOAD);
                    })
                ).subscribe({
                    next: (res: any) => {
                        this.activeSaveCount--;
                        if (this.activeSaveCount === 0) {
                            this.commonService.hideAutoSaveSpinner('SUCCESS');
                            this._managementPlanService.triggerManagementPlanActions('FORM_SAVE_COMPLETE', res);
                        }
                        if (res?.taskQuestionAnsId && question.cmpTaskQuestionAnswers?.[0]) {
                            question.cmpTaskQuestionAnswers[0].taskQuestionAnsId = res.taskQuestionAnsId;
                        }
                    },
                    error: () => {
                        this.activeSaveCount--;
                        this.commonService.hideAutoSaveSpinner('SUCCESS');
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Error saving answer');
                    }
                })
            );
        }
        this.questionSavers.get(question.cmpTaskQuestionId).next(answer);
    }
}

