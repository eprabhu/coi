import { CommonModalConfig } from "../../../../shared-components/common-modal/common-modal.interface";
import { TaskActionType } from "../../../shared/management-plan-constants";

export enum CmpTaskStatusCode {
    ASSIGNED = 1,
    IN_PROGRESS = 2,
    ON_HOLD = 3,
    COMPLETED = 4,
}

export interface CmpTaskQuestionsDto {
    cmpTaskQuestionId?: number;
    taskId?: number;
    question?: string;
    description?: string;
    createTimestamp?: number;
    createdBy?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    updateUserFullName?: string;
    createUserFullName?: string;
    actionType?: string;
    cmpTaskQuestionAnswers?: any[];
    orderNumber?: number;
    answer?: string;
    taskQuestionAnsId?: number;
}

export interface TaskQuestionAnswerSaveRequest {
    cmpTaskQuestionId: number;
    answer: string;
    taskQuestionAnsId?: number;
}

export interface CmpTaskWatchersDto {
    cmpTaskWatcherId?: number;
    watcherPersonId?: string;
    watcherPersonName?: string;
    taskId?: number;
    updateTimestamp?: number;
    updatedBy?: string;
    updateUserFullName?: string;
    actionType?: string;
}

export interface CmpTaskAttachmentDto {
    attachmentId?: number;
    taskId?: number;
    fileName?: string;
    contentType?: string;
    fileDataId?: string;
    versionNumber?: number;
    description?: string;
    documentId?: number;
    createTimestamp?: number;
    createdBy?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    updateUserFullName?: string;
    createUserFullName?: string;
    actionType?: string;
}

export interface CmpTaskCommentDto {
    commentId?: number;
    comment?: string;
}

export interface CmpTaskLookupValue {
    code: string | number;
    description: string;
}

export interface CmpTaskTypeLookup extends CmpTaskLookupValue {
    isActive?: boolean;
}

export interface TaskStatusLookup extends CmpTaskLookupValue {
    sortOrder?: number;
}

export interface CmpTaskStatus {
    sortOrder?: number;
    description?: string;
    taskStatusCode?: string | number;
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export interface CmpTaskDetails {
    taskId?: number;
    taskTypeCode?: string | number;
    cmpTaskType?: CmpTaskTypeLookup;
    taskStatusCode?: string | number;
    cmpTaskStatus?: CmpTaskStatus;
    assigneePersonId?: string | number;
    assigneePersonName?: string;
    assigneeFullName?: string;
    assignedOn?: number | string;
    description?: string;
    dueDate?: number | string;
    cmpId?: number;
    createTimestamp?: number;
    createdBy?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    updateUserFullName?: string;
    createUserFullName?: string;
    cmpTaskQuestions?: CmpTaskQuestionsDto[];
    cmpTaskWatchers?: CmpTaskWatchersDto[];
    cmpTaskAttachments?: CmpTaskAttachmentDto[];
    cmpTaskComments?: CmpTaskCommentDto[];
    moduleItemKey?: string | number;
    assignerPersonId?: string | number;
    assignerFullName?: string;
    isAssignee?: boolean; //this is used to check if the logged in user is assignee from frontend.
    isQuestionsExpanded?: boolean; //this is used to check if the questions are expanded from frontend.
}

export interface CmpTaskSaveRequest {
    taskId?: number | null;
    cmpId?: string | number;
    taskTypeCode: string | number;
    taskStatusCode: string | number;
    assigneePersonId: string | number;
    description: string;
    assignedOn: string;
    dueDate: string;
    cmpTaskQuestions?: CmpTaskQuestionsDto[];
}

export interface CmpTaskActionRequest {
    taskId: number;
    taskStatusCode: string | number;
    description?: string;
    cmpId?: string | number;
}

export class TaskCreateEditModalConfig {
    isShowModal: boolean = false;
    cmpTask: CmpTaskDetails | null;
    modalConfig = new CommonModalConfig('cmp-task-create-edit-modal', 'Create', 'Cancel', 'xl');
}

export class PersonTaskListModalConfig {
    isShowModal: boolean = false;
    modalConfig = new CommonModalConfig('task-initial-details-modal', '', 'Close', 'xl');
}

export interface CmpTaskForm extends Omit<CmpTaskDetails, 'assignedOn' | 'dueDate'> {
    assignedOn?: Date | string | number;
    dueDate?: Date | string | number;
    assigneePerson?: any;
}

export interface TaskCardActionEvent {
    action: TaskActionType,
    taskDetails: CmpTaskDetails
};

