import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { SharedComponentModule } from '../../../../../shared-components/shared-component.module';
import { DATE_PLACEHOLDER } from '../../../../../../app/app-constants';
import { parseDateWithoutTimestamp } from '../../../../../../app/common/utilities/date-utilities';
import { ModalActionEvent } from '../../../../../../app/shared-components/common-modal/common-modal.interface';
import { closeCommonModal, deepCloneObject } from '../../../../../../app/common/utilities/custom-utilities';
import { CmpTaskDetails, CmpTaskQuestionsDto, CmpTaskStatusCode, TaskCreateEditModalConfig, CmpTaskForm } from '../task.interface';
import { EndPointOptions } from '../../../../../../app/shared-components/shared-interface';
import { ElasticConfigService } from '../../../../../../app/common/services/elastic-config.service';
import { ManagementPlanTaskService } from '../management-plan-task.service';
import { MAX_TASK_QUESTIONS } from '../../../../shared/management-plan-constants';

@Component({
    selector: 'app-task-create-edit-modal',
    standalone: true,
    templateUrl: './task-create-edit-modal.component.html',
    styleUrls: ['./task-create-edit-modal.component.scss'],
    imports: [CommonModule, FormsModule, SharedModule, SharedComponentModule]
})
export class TaskCreateEditModalComponent implements OnInit, OnChanges {

    @Input() createEditModalConfig = new TaskCreateEditModalConfig();
    @Output() saved = new EventEmitter<{ formValue: any, isEdit: boolean }>();

    CmpTaskForm: CmpTaskForm = {};
    taskTypeStatusOption = 'CMP_TASK_TYPE#TASK_TYPE_CODE#false#false';
    selectedLookUpList: any[] = [];
    mandatoryList = new Map<string, string>();
    dateValidationMap = new Map<string, string>();
    datePlaceHolder = DATE_PLACEHOLDER;
    advSearchPersonClearField: string;
    elasticPersonSearchOptions: EndPointOptions = {};
    cmpTaskDetails: CmpTaskDetails | null = null;
    maxTaskQuestions = MAX_TASK_QUESTIONS;

    constructor(private _elasticConfig: ElasticConfigService,
        public managementPlanTaskService: ManagementPlanTaskService
    ) { }

    get visibleQuestions(): CmpTaskQuestionsDto[] {
        return (this.CmpTaskForm.cmpTaskQuestions || []).filter(q => q.actionType !== 'D');
    }

    ngOnInit(): void {
        this.setSearchOptions();
        this.cmpTaskDetails = this.createEditModalConfig.cmpTask;
        this.createEditModalConfig.modalConfig.namings.primaryBtnName = this.cmpTaskDetails?.taskId ? 'Update' : 'Create';
        this.initializeForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['cmpTask'] && changes['cmpTask'].currentValue) {
            this.initializeForm();
        }
    }

    private setSearchOptions(): void {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    private initializeForm(): void {
        if (this.cmpTaskDetails?.taskId) {
            this.CmpTaskForm = deepCloneObject(this.cmpTaskDetails);
            this.CmpTaskForm.assignedOn = this.cmpTaskDetails.assignedOn ? new Date(this.cmpTaskDetails.assignedOn) : new Date();
            this.CmpTaskForm.dueDate = this.cmpTaskDetails.dueDate ? new Date(this.cmpTaskDetails.dueDate) : null;
            this.elasticPersonSearchOptions.defaultValue = this.cmpTaskDetails.assigneePersonName;
            this.CmpTaskForm.assigneePerson = this.cmpTaskDetails.assigneePersonId ? { prncpl_id: this.cmpTaskDetails.assigneePersonId, full_name: this.cmpTaskDetails.assigneeFullName } : null;
            this.selectedLookUpList['TASK_TYPE_CODE'] = this.cmpTaskDetails.cmpTaskType ? [this.cmpTaskDetails.cmpTaskType] : [];
        } else {
            this.CmpTaskForm = {
                taskTypeCode: null,
                assigneePersonId: null,
                assigneePerson: null,
                assignedOn: new Date(),
                dueDate: null,
                description: '',
                cmpTaskQuestions: []
            };
            this.selectedLookUpList = [];
        }
    }

    private createOrEditModalSubmit(): void {
        this.checkMandatoryFields();
        this.validateDates();
        if (this.mandatoryList.size || this.dateValidationMap.size) {
            return;
        }
        const formValue = this.getMappedPayload();
        this.saved.emit({ formValue, isEdit: !!this.cmpTaskDetails?.taskId });
    }

    private onAssigneeCleared(): void {
        this.CmpTaskForm.assigneePerson = null;
        this.CmpTaskForm.assigneePersonId = undefined;
        this.CmpTaskForm.assigneeFullName = undefined;
        this.CmpTaskForm.assigneePersonName = undefined;
    }

    private getMappedPayload() {
        const QUESTIONS = (this.CmpTaskForm.cmpTaskQuestions || [])
            .filter((q: CmpTaskQuestionsDto) => (!!q.question?.trim() && q.actionType !== 'D') || q.actionType === 'D')
            .map((q: CmpTaskQuestionsDto) => ({
                ...q,
                question: q.question?.trim()
            }));
        return {
            taskId: this.cmpTaskDetails?.taskId || undefined,
            taskTypeCode: this.CmpTaskForm.taskTypeCode,
            assigneePersonId: this.CmpTaskForm.assigneePersonId,
            description: this.CmpTaskForm.description?.trim(),
            assignedOn: parseDateWithoutTimestamp(this.CmpTaskForm.assignedOn),
            dueDate: parseDateWithoutTimestamp(this.CmpTaskForm.dueDate),
            taskStatusCode: this.cmpTaskDetails?.taskStatusCode || CmpTaskStatusCode.ASSIGNED,
            cmpTaskQuestions: QUESTIONS
        };
    }

    private checkMandatoryFields(): void {
        this.mandatoryList.clear();
        if (!this.CmpTaskForm.taskTypeCode) {
            this.mandatoryList.set('taskTypeCode', 'Task type is required.');
        }
        if (!this.CmpTaskForm.assigneePersonId) {
            this.mandatoryList.set('assigneePerson', 'Assignee is required.');
        }
        this.validateDates();
    }

    private validateDates(): void {
        this.dateValidationMap.clear();
        const START = parseDateWithoutTimestamp(this.CmpTaskForm.assignedOn);
        const END = parseDateWithoutTimestamp(this.CmpTaskForm.dueDate);
        if (START && END && new Date(END).getTime() < new Date(START).getTime()) {
            this.dateValidationMap.set('endDate', 'Due date cannot be earlier than Assigned On.');
        }
    }

    private closeAndReset(): void {
        closeCommonModal(this.createEditModalConfig.modalConfig.namings.modalName);
        setTimeout(() => {
            this.managementPlanTaskService.taskCreateEditModalConfig = new TaskCreateEditModalConfig();
            this.resetForm();
        }, 200);
    }

    private resetForm(): void {
        this.CmpTaskForm = {};
        this.elasticPersonSearchOptions.defaultValue = '';
        this.selectedLookUpList = [];
        this.mandatoryList.clear();
        this.dateValidationMap.clear();
    }

    addQuestion(): void {
        if (!this.CmpTaskForm.cmpTaskQuestions) {
            this.CmpTaskForm.cmpTaskQuestions = [];
        }
        if (this.visibleQuestions.length >= this.maxTaskQuestions) {
            return;
        }
        this.CmpTaskForm.cmpTaskQuestions.push({ question: '' });
    }

    removeQuestion(question: CmpTaskQuestionsDto): void {
        if (question.cmpTaskQuestionId) {
            question.actionType = 'D';
        } else {
            const INDEX = this.CmpTaskForm.cmpTaskQuestions?.indexOf(question);
            if (INDEX !== undefined && INDEX > -1) {
                this.CmpTaskForm.cmpTaskQuestions?.splice(INDEX, 1);
            }
        }
    }

    selectedPersonName(event: any): void {
        if (!event) {
            this.onAssigneeCleared();
            return;
        }
        this.CmpTaskForm.assigneePerson = event;
        this.CmpTaskForm.assigneePersonId = event?.prncpl_id;
        this.CmpTaskForm.assigneeFullName = event?.full_name;
        this.CmpTaskForm.assigneePersonName = event?.full_name;
    }

    taskModalAction(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            this.createOrEditModalSubmit();
        } else {
            this.closeAndReset();
        }
    }

    onLookupSelect(event: any, property: string): void {
        this.selectedLookUpList[property] = event;
        if (property === 'TASK_TYPE_CODE') {
            const SELECTED = Array.isArray(event) && event.length ? event[0] : null;
            this.CmpTaskForm.taskTypeCode = SELECTED?.code || SELECTED?.taskTypeCode || null;
            this.mandatoryList.delete('taskTypeCode');
        }
    }

    onDateChange(): void {
        this.validateDates();
        this.mandatoryList.delete('startDate');
        this.mandatoryList.delete('endDate');
    }
}


