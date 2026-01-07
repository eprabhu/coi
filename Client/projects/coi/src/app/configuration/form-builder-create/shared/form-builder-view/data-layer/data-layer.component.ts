import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { CustomElement, CustomElementVO, FBConfiguration, FormBuilderSaveRO, QuestionnaireVO, SectionComponent, UpdatedQuestionnaire } from '../form-builder-interface';
import { FormBuilderService } from '../form-builder.service';
import { CommonService } from '../../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../../app-constants';
import {deepCloneObject, fileDownloader, isEmptyObject} from '../../../../../common/utilities/custom-utilities';
import { FormBuilderCreateService } from '../../../form-builder-create.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { HeaderService } from '../../../../../common/header/header.service';
import { Question } from '../../../../../shared/common.interface';

class CustomAnswer {
    customDataElementsId = null;
    customDataId = null;
    description = null;
    moduleItemCode = null;
    moduleItemKey = null;
    moduleSubItemCode = null;
    moduleSubItemKey = null;
    updateTimestamp = null;
    updateUser = null;
    value = null;
}

@Component({
    selector: 'app-data-layer',
    templateUrl: './data-layer.component.html',
    styleUrls: ['./data-layer.component.scss']
})
export class DataLayerComponent implements OnInit, OnDestroy {

    @Output() answerChangeEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output() updatedQuestionnaire: EventEmitter<UpdatedQuestionnaire> = new EventEmitter<UpdatedQuestionnaire>();
    @Input() component: SectionComponent;
    @Input() fbConfiguration: FBConfiguration;
    @Input() saveEventForChildComponent;
    @Input() isFormEditable: boolean;
    @Input() formBuilderId: number;
    $subscriptions: Subscription[] = [];
    private isCreatingFormQuestionHeader = false;
    private isCreatingFormElementHeader = false;
    private isCreatingTableHeader = false;
    private isSaving = false;

    constructor(
        private _formBuilderService: FormBuilderService,
        private _commonService: CommonService,
        private _formBuilderCreateService: FormBuilderCreateService,
        private readonly _headerService: HeaderService
    ) { }

    ngOnInit(): void {
        this.listenAutoSaveUpdate();
        this.$subscriptions.push(
            this._formBuilderCreateService.saveUpdateTrigger$.subscribe((res) => {
                if (res.componentId === this.component.componentId) {
                    if (this.component.componentType === 'QN') {
                         this.component.questionnaire.questionnaireAnswerHeaderId = res.questionnaire.questionnaireAnswerHeaderId;
                        this.component.questionnaire.questionnaire.questions.forEach(ele => {
                            const QUESTION = res.questionnaire.questionnaire.questions.find(ele2 => ele.QUESTION_ID === ele2.QUESTION_ID);
                            if (QUESTION) {
                                ele.AC_TYPE = QUESTION.AC_TYPE;
                            }
                        });
                    } else if (['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'CE', 'PT', 'AT', 'CR']
                        .includes(this.component.componentType)) {
                        this.component.customElement.customElements = res.customElement.customElements;
                        this.component = deepCloneObject(this.component);
                    }
                    this.saveEventForChildComponent.next({ eventType: 'SAVE_COMPLETE', data: res });
                    this.emitEditOrSaveAction('SAVE_COMPLETE', res);
                    if(!this._formBuilderCreateService.isAutoSaveEnabled) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Form saved successfully.');
                    } else {
                        this._formBuilderCreateService.isProcesingSavingQueue = false;
                        this._commonService.hideAutoSaveSpinner('SUCCESS');
                    }
                    this.setValidationList(res);
                }
            })
        );
    }

    private setValidationList(res: SectionComponent): void {
        let list = this._headerService.$globalPersistentEventNotifier.$formValidationList.getValue();
        if (!list.length) { return; }
        list = list.filter(element => {
            if (element.componentId !== this.component.componentId) {
                return true;
            }
            if (element.componentType === 'QN') {
                if (res.questionnaire?.questionnaireCompleteFlag === 'Y') {
                    return false;
                }
                if (element.questionnaire?.length) {
                    element.questionnaire = element.questionnaire.filter(q =>
                        !res.questionnaire?.questionnaire?.questions?.some(
                            (ansQ: Question) => ansQ.QUESTION_ID === q.questionId
                        )
                    );
                }
                return true;
            }
            return false;
        });
        this._headerService.$globalPersistentEventNotifier.$formValidationList.next(list);
    }

    listenAutoSaveUpdate() {
          this.$subscriptions.push(
            this._formBuilderCreateService.autoSaveUpdateTrigger$.subscribe((data) => {
                if (data.res.componentId === data.component.componentId) {
                    if (data.component.componentType === 'QN') {
                        data.component.questionnaire.questionnaireAnswerHeaderId = data.res.questionnaire.questionnaireAnswerHeaderId;
                        data.component?.questionnaire.questionnaire.questions.forEach(ele => {
                            const QUESTION = data.res.questionnaire.questionnaire.questions.find(ele2 => ele.QUESTION_ID === ele2.QUESTION_ID);
                            if (QUESTION) {
                                ele.AC_TYPE = QUESTION.AC_TYPE;
                            }
                        });
                    } else if (['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'CE', 'PT', 'AT', 'CR'].includes(data.component.componentType)) {
                        data.component.customElement.customElements.forEach((ele) => {
                            const CUS_ELEMT = data.res.customElement.customElements.find(ele2 => ele2.customDataElementId === ele.customDataElementId);
                            this.updateCustomElementAns(CUS_ELEMT, ele);
                        });
                    }
                }
            })
        );
    }

    updateCustomElementAns(result: any, request: any) {
        if (!request) return;
        const { dataType, answers } = request;
        if (dataType === 'CB') {
            this.filterRemovedAnswers(answers, result.answers);
            this.updateAnswerIdsFromResponse(result.answers, request);
            if (result.answers.length === 0) result.answers.push(new CustomAnswer());
            return;
        }
        if (dataType === 'AT') {
            request.attachments = result.attachments;
            return;
        }
        if (answers?.[0]) {
            answers[0].customDataId = result.answers?.[0]?.customDataId;
        }
    }

    /**
     * Function to remove answer that are deleted based on the API response
     */
    private filterRemovedAnswers(mainArray, responseAnswers): void {
        const SECOND_ARRAY_IDS = responseAnswers
            .map((item) => item.customDataId)
            .filter((id: number) => id !== null);

        mainArray.answers = mainArray?.filter((item: any) => {
            return item.customDataId === null || SECOND_ARRAY_IDS.includes(item.customDataId);
        });
    }

    /**
     * Function to update the id of each answer that are saved from the API response
     */
    private updateAnswerIdsFromResponse(responseAnswers, request): void {
        responseAnswers.forEach((answer: any) => {
            const DATA_TO_UPDATE = request.answers.find((answerInMainData: any) =>
                answerInMainData.value === answer.value || (!answerInMainData.value && !answerInMainData.customDataId)
            );

            if (DATA_TO_UPDATE && answer.customDataId) {
                if (!request.answers.some((answerInMainData: any) =>
                    answerInMainData.customDataId === answer.customDataId)) {
                    DATA_TO_UPDATE.customDataId = answer.customDataId;
                }
            }
        });
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        if (this._formBuilderCreateService.updateTimeout) {
            clearTimeout(this._formBuilderCreateService.updateTimeout);
        }
        this._formBuilderCreateService.isProcesingSavingQueue = false;
        this._formBuilderCreateService.dataLayerDetails = [];  
        this._formBuilderCreateService.childTableQuestionId = [];
    }

    saveEventsFromChild(data: CustomElementVO | QuestionnaireVO | any): void {
        const INDEX = this._formBuilderCreateService.dataLayerDetails.
            findIndex(dataLayerData => dataLayerData.component?.componentId === this.component?.componentId);
        if (INDEX !== -1) {
            this._formBuilderCreateService.dataLayerDetails.splice(INDEX, 1);
        }
        this._formBuilderCreateService.dataLayerDetails.push({
            data: data,
            component: this.component,
        });
        if (this._formBuilderCreateService.updateTimeout) {
            clearTimeout(this._formBuilderCreateService.updateTimeout);
        }
        this._formBuilderCreateService.updateTimeout = setTimeout(() => {
            const ROLIST = [];
            this._formBuilderCreateService.dataLayerDetails.forEach(detail => {
                if (detail?.data?.data && !isEmptyObject(detail.data.data)) {
                    const RO = this.prepareROForSave(detail['data'], detail['component']);
                    ROLIST.push(RO);
                }
            });
            if(this._formBuilderCreateService.isAutoSaveEnabled) {
                this._formBuilderCreateService.formQuestionsSaveQueue = [];
                this._formBuilderCreateService.formElementsSaveQueue = [];
                this._formBuilderCreateService.tableQuestionsQueue = [];
            }
            this.saveApiCall(ROLIST);
        }, 0);
    }

    private saveApiCall(ROList: FormBuilderSaveRO[]): void {
        this.$subscriptions.push(
            this._formBuilderService.saveFormComponent(ROList).subscribe((res: SectionComponent[]) => {
                this._formBuilderCreateService.formBuilderAnswerHeaderId = res?.[0]?.formBuilderAnswerHeaderId;
                this._formBuilderCreateService.dataLayerDetails = [];
                res?.forEach((sectionData) => {
                    this._formBuilderCreateService.saveUpdateTrigger$.next(sectionData);
                });
            }, err => {
                if(!this._formBuilderCreateService.isAutoSaveEnabled) {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in saving Form. Please try again.');
                } else {
                    this._formBuilderCreateService.isProcesingSavingQueue = false;
                    this._commonService.hideAutoSaveSpinner('ERROR');
                }
            }));
    }

    private autoSaveApiCall(ROList: FormBuilderSaveRO[], resetSaving = false): void {
        this._commonService.setLoaderRestriction();
        this._commonService.showAutoSaveSpinner();
        let API_RO = deepCloneObject(ROList);
        API_RO.forEach((ro: any) => {
            if (ro.customElement) {
                delete ro.customElement.component;
            }
            if (ro.questionnaire) {
                delete ro.questionnaire.component;
            }
        });
        this._formBuilderService.saveFormComponent(API_RO).subscribe((res: SectionComponent[]) => {
            if (resetSaving) {
                this.isSaving = false;
            }
            this._formBuilderCreateService.formBuilderAnswerHeaderId = res?.[0]?.formBuilderAnswerHeaderId;
            this._formBuilderCreateService.dataLayerDetails = [];
            this.handleAutoSaveSuccess(ROList, res);
        }, err => {
            if (resetSaving) {
                this.isSaving = false;
            }
            this.handleAutoSaveError(ROList);
        });
        this._commonService.removeLoaderRestriction();
    }

    handleAutoSaveSuccess(ROList, res) {
        res?.forEach((sectionData) => {
            const ELEMENT = ROList.find(ro => ro.componentId === sectionData?.componentId);
            let component;
            if(ELEMENT) {
                component =  ELEMENT.customElement ? ELEMENT.customElement.component : ELEMENT.questionnaire.component;
            }
            this._formBuilderCreateService.autoSaveUpdateTrigger$.next({res: sectionData, component: component});
        });
        ROList.forEach((roElement, index) => {
            this.resetQueueLock(roElement?.componentType);
            if (roElement?.componentType === 'QN') {
                roElement?.questionnaire?.questionnaire?.questions?.forEach(question => {
                    const QUESTION = res?.[index]?.questionnaire?.questionnaire?.questions.find(resQues => question.QUESTION_ID === resQues.QUESTION_ID);
                    if (QUESTION) {
                        question.AC_TYPE = QUESTION.AC_TYPE;
                        if (question.ANSWER_TYPE === 'Table') {
                            this.isCreatingTableHeader = false;
                            this.updateTableAnswers(question, QUESTION);
                        }
                    }
                });
            }
        });
        this._formBuilderCreateService.formQuestionsSaveQueue.forEach((ele) => {
            if(ele?.questionnaireId === res?.[0]?.questionnaire?.questionnaireId) {
                ele.questionnaireAnswerHeaderId = res?.[0]?.questionnaire?.questionnaireAnswerHeaderId;
            }
        });
        this._formBuilderCreateService.tableQuestionsQueue.forEach((ele) => {
            if(ele?.questionnaireId === res?.[0]?.questionnaire?.questionnaireId) {
                ele.questionnaireAnswerHeaderId = res?.[0]?.questionnaire?.questionnaireAnswerHeaderId;
            }
        });
        this.processFormElementsQueue();
        this.processFormQuestionsQueue();
        this.processTableQueue();
        if (!this._formBuilderCreateService.formElementsSaveQueue.length && 
            !this._formBuilderCreateService.formQuestionsSaveQueue.length && 
            !this._formBuilderCreateService.tableQuestionsQueue.length && !this._formBuilderCreateService.isProcesingSavingQueue) {
            this._commonService.hideAutoSaveSpinner('SUCCESS');
            this.saveEventForChildComponent.next({ eventType: 'SAVE_COMPLETE', data: res });
            this.emitEditOrSaveAction('SAVE_COMPLETE', res);
        }
    }
 
    handleAutoSaveError(ROList) {
        this._formBuilderCreateService.isProcesingSavingQueue = false;
        this._formBuilderCreateService.childTableQuestionId = [];
        this._formBuilderService.$formBuilderActionEvents.next({action: 'AUTO_SAVE_ERROR'});
        this.saveEventForChildComponent.next({ eventType: 'AUTO_SAVE_ERROR'});
        const HAS_ATTACHEMENT = ROList?.some(item => item.componentType === 'AT');
        if (!HAS_ATTACHEMENT) {
            this._commonService.hideAutoSaveSpinner('ERROR');
        } else {
            this._commonService.autoSaveSavingSpinner = 'HIDE';
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Attachment failed. Please try again.');
        }
        ROList.forEach(roElement => {
            this.resetQueueLock(roElement?.componentType);
            if (roElement?.componentType === 'QN') {
                 roElement?.questionnaire?.questionnaire?.questions?.forEach(ele2 => {
                    if (ele2.ANSWER_TYPE === 'Table') {
                        this._formBuilderCreateService.tableQuestionsQueue.push(roElement?.questionnaire);
                    } else {
                        this._formBuilderCreateService.formQuestionsSaveQueue.push(roElement?.questionnaire);
                    }
                });
            } else if (['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'CE', 'PT', 'AT', 'CR'].includes(roElement?.componentType)) {
                this._formBuilderCreateService.formElementsSaveQueue.push(roElement?.customElement);
            }
        });
    }

    prepareROForAutoSave(data: CustomElementVO | QuestionnaireVO | any, component?): FormBuilderSaveRO {
        const RO = new FormBuilderSaveRO();
        RO.formBuilderId = this.formBuilderId;
        RO.moduleItemCode = this.fbConfiguration.moduleItemCode;
        RO.moduleItemKey = this.fbConfiguration.moduleItemKey;
        RO.moduleSubItemCode = this.fbConfiguration.moduleSubItemCode;
        RO.moduleSubItemKey = this.fbConfiguration.moduleSubItemKey;
        RO.documentOwnerPersonId = this.fbConfiguration.documentOwnerPersonId;
        RO.componentId = data.data?.component?.componentId;
        RO.componentType = data.data?.component?.componentType;
        RO.formBuilderAnswerHeaderId = this._formBuilderCreateService.formBuilderAnswerHeaderId;
        switch (data.data?.component?.componentType) {
            case 'QN':
                RO.questionnaire = data.data;
                RO.files = data.data.files;
                delete RO.questionnaire.files;
                break;
            case 'CE':
            case 'SE':
            case 'NE':
            case 'DE':
            case 'CB':
            case 'RB':
            case 'ES':
            case 'AS':
            case 'SD':
            case 'UD':
            case 'PT':
            case 'CR':
            case 'AT':
                RO.customElement = data.data;
                break;
            case 'TE': RO.customElement = data.data; break;
            case 'PE': RO.programmedElement = data.data; break;
        }
        return RO;
    }

    prepareROForSave(data: CustomElementVO | QuestionnaireVO | any, component?): FormBuilderSaveRO {
        const RO = new FormBuilderSaveRO();
        RO.formBuilderId = this.formBuilderId;
        RO.moduleItemCode = this.fbConfiguration.moduleItemCode;
        RO.moduleItemKey = this.fbConfiguration.moduleItemKey;
        RO.moduleSubItemCode = this.fbConfiguration.moduleSubItemCode;
        RO.moduleSubItemKey = this.fbConfiguration.moduleSubItemKey;
        RO.documentOwnerPersonId = this.fbConfiguration.documentOwnerPersonId;
        RO.componentId = component ? component.componentId : this.component.componentId;
        RO.componentType = component ? component.componentType : this.component.componentType;
        RO.formBuilderAnswerHeaderId = this._formBuilderCreateService.formBuilderAnswerHeaderId;
        if(component.componentType === 'PE') {
            RO.componentRefId = component ? component.componentRefId : this.component.componentRefId;
        }
        switch (component ? component.componentType : this.component.componentType) {
            case 'QN':
                RO.questionnaire = data.data;
                RO.files = data.data.files;
                delete RO.questionnaire.files;
                break;
            case 'CE':
            case 'SE':
            case 'NE':
            case 'DE':
            case 'CB':
            case 'RB':
            case 'ES':
            case 'AS':
            case 'SD':
            case 'UD':
            case 'PT':
            case 'CR':
            case 'AT':
                RO.customElement = data.data;
                break;
            case 'TE': RO.customElement = data.data; break;
            case 'PE': RO.programmedElement = data.data; break;
        }
        return RO;
    }

    emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilderService.$formBuilderActionEvents.next({action: actionPerformed, actionResponse: event, component: this.component});
    }

    emitChanges(customElement: any) {
        const CUSTOM_ELEMENT_INDEX = this._formBuilderCreateService.formElementsSaveQueue.findIndex((q: any) => q.customElements[0].customDataElementId === customElement.customElements[0].customDataElementId);
        if(CUSTOM_ELEMENT_INDEX > -1) {
            this._formBuilderCreateService.formElementsSaveQueue.splice(CUSTOM_ELEMENT_INDEX, 1);
        }             
        customElement.component = this.component;
        this._formBuilderCreateService.formElementsSaveQueue.push(customElement);
        if (!this._formBuilderCreateService.isProcesingSavingQueue) {
            this.processFormElementsQueue();
        }
    }

    emitQuestionnaireChanges(questionnaire: any) {
        if (questionnaire.questionnaire.questions[0].ANSWER_TYPE === 'Table') {
            const TABLE_ELEMENT_INDEX = this._formBuilderCreateService.tableQuestionsQueue.findIndex((q: any) => q.questionnaire.questions[0].QUESTION_ID === questionnaire.questionnaire.questions[0].QUESTION_ID);
            if (TABLE_ELEMENT_INDEX > -1) {
                this._formBuilderCreateService.tableQuestionsQueue.splice(TABLE_ELEMENT_INDEX, 1);
            }
            questionnaire.component = this.component;
            this._formBuilderCreateService.tableQuestionsQueue.push(questionnaire);
            if (!this._formBuilderCreateService.isProcesingSavingQueue) {
                this.processTableQueue();
            }
        } else {
            const QUESTION_ELEMENT_INDEX = this._formBuilderCreateService.formQuestionsSaveQueue.findIndex((q: any) => q.questionnaire.questions[0].QUESTION_ID === questionnaire.questionnaire.questions[0].QUESTION_ID);
            if (QUESTION_ELEMENT_INDEX > -1) {
                this._formBuilderCreateService.formQuestionsSaveQueue.splice(QUESTION_ELEMENT_INDEX, 1);
            }
            questionnaire.component = this.component;
            this._formBuilderCreateService.formQuestionsSaveQueue.push(questionnaire);
            if (!this._formBuilderCreateService.isProcesingSavingQueue) {
                this.processFormQuestionsQueue();
            }
        }
    }

    private processFormElementsQueue() {
        if (!this._formBuilderCreateService.formElementsSaveQueue.length) {
            this._formBuilderCreateService.isProcesingSavingQueue = false;
            return;
        }
        this._formBuilderCreateService.isProcesingSavingQueue = true;

        if (this.isCreatingFormElementHeader) {
            return;
        }

        const queue = this._formBuilderCreateService.formElementsSaveQueue;
        const hasHeaderIds = this._formBuilderCreateService.formBuilderAnswerHeaderId;

        if (hasHeaderIds) {
            let ROLIST = [];
            queue.forEach(detail => {
                const RO = this.prepareROForAutoSave({ data: detail });
                ROLIST.push(RO);
            });
            this._formBuilderCreateService.formElementsSaveQueue = [];
            this.autoSaveApiCall(ROLIST);
        } else {
            this.isCreatingFormElementHeader = true;
            const first = queue.shift();
            this.autoSaveApiCall([this.prepareROForAutoSave({ data: first })]);
        }
    }

    private processFormQuestionsQueue() {
        if (!this._formBuilderCreateService.formQuestionsSaveQueue.length) {
            this._formBuilderCreateService.isProcesingSavingQueue = false;
            return;
        }
        this._formBuilderCreateService.isProcesingSavingQueue = true;
        if (this.isCreatingFormQuestionHeader) {
            return;
        }
        const queue = this._formBuilderCreateService.formQuestionsSaveQueue;
        const hasHeaderIds = this._formBuilderCreateService.formBuilderAnswerHeaderId && queue?.[0]?.questionnaireAnswerHeaderId;
        if (hasHeaderIds) {
            let ROLIST = [];
            queue.forEach(detail => {
                const RO = this.prepareROForAutoSave({ data: detail });
                ROLIST.push(RO);
            });
            this._formBuilderCreateService.formQuestionsSaveQueue = [];
            this.autoSaveApiCall(ROLIST);
        } else {
            this.isCreatingFormQuestionHeader = true;
            const first = queue.shift();
            this.autoSaveApiCall([this.prepareROForAutoSave({ data: first })]);
        }
    }

    private processTableQueue() { 
        if (!this._formBuilderCreateService.tableQuestionsQueue.length) {
            this._formBuilderCreateService.isProcesingSavingQueue = false;
            return;
        }
        this._formBuilderCreateService.isProcesingSavingQueue = true;        
        if (this.isCreatingTableHeader || this.isSaving) {
            return;
        }
        const queue = this._formBuilderCreateService.tableQuestionsQueue;
        const hasHeaderIds = this._formBuilderCreateService.formBuilderAnswerHeaderId && queue?.[0]?.questionnaireAnswerHeaderId;
        if (hasHeaderIds) {
            let ROLIST = [];
            queue.forEach(detail => {
                const QUESTION_ID = detail.questionnaire.questions[0].QUESTION_ID;
                if (this._formBuilderCreateService.childTableQuestionId.includes
                    (QUESTION_ID)) {
                    const QUESTION = this.component.questionnaire.questionnaire.questions.find
                        (qn => qn.QUESTION_ID === QUESTION_ID);
                    if (QUESTION.SHOW_QUESTION) {
                        let alreadyInsertedFlag = false;
                        detail.questionnaire.questions[0].ANSWERS[1].forEach(element => {
                            element.AC_TYPE = element.QUEST_TABLE_ANSWER_ID ? 'U' : 'I';
                            if (element.QUEST_TABLE_ANSWER_ID) {
                                alreadyInsertedFlag = true;
                            }
                        });
                        detail.questionnaire.questions[0].AC_TYPE = alreadyInsertedFlag ? 'U' : 'I';
                    } else {
                        detail.questionnaire.questions[0].AC_TYPE = 'D';
                        detail.questionnaire.questions[0].ANSWERS[1].forEach((element) => {
                            element.AC_TYPE = 'D';
                        });
                    }
                }
                const RO = this.prepareROForAutoSave({ data: detail });
                ROLIST.push(RO);
            });
            this._formBuilderCreateService.tableQuestionsQueue = [];
            this.isSaving = true;
            this.autoSaveApiCall(ROLIST, true);
        } else {
            this.isCreatingTableHeader = true;
            const first = queue.shift();
            this.autoSaveApiCall([this.prepareROForAutoSave({ data: first })]);
        }
    }

    private resetQueueLock(componentType: string) {
        switch (componentType) {
            case 'QN': {
                this.isCreatingFormQuestionHeader = false;
                this.isCreatingTableHeader = false;
                break;
            }
            case 'CE':
            case 'SE':
            case 'NE':
            case 'DE':
            case 'CB':
            case 'RB':
            case 'ES':
            case 'AS':
            case 'SD':
            case 'UD':
            case 'PT':
            case 'CR':
            case 'AT':
            case 'RT':
            case 'TE':
                this.isCreatingFormElementHeader = false;
                break;
        }
    }

    public downloadFormAttachment(attachment: any): void {
        this.$subscriptions.push(this._formBuilderService.downloadFormAttachment(attachment.attachmentId).subscribe((data: any) => {
            fileDownloader(data, attachment.fileName);
        }, error => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error while downloading attachment. Please try again.');
        }));
    }

    listenElementAction(event: any) {
        if (event.action === 'DOWNLOAD_ATTACHMENT') {
            this.downloadFormAttachment(event.data);
        }
    }

    emitAnswerChange(): void {
        this.answerChangeEvent.next();
    }

    emitUpdatedQuestionnaire(event: UpdatedQuestionnaire): void {
        this.updatedQuestionnaire.emit(event);
    }

    private updateTableAnswers(currentQuestion, questionFromRes) {
        const existingAnswers = currentQuestion.ANSWERS[1];
        const newAnswers = questionFromRes.ANSWERS[1];
        const answersToRemove = this.getAnswersToRemove(existingAnswers, newAnswers);
        const IS_CHILD_TABLE_QUESTION_SAVE = this._formBuilderCreateService.childTableQuestionId.findIndex(element => element === currentQuestion.QUESTION_ID);
        if (IS_CHILD_TABLE_QUESTION_SAVE !== -1) {
            currentQuestion.ANSWERS[1].forEach((element, index) => {
                if (newAnswers?.length) {
                    element.AC_TYPE = 'U';
                    element.QUEST_TABLE_ANSWER_ID = newAnswers[index].QUEST_TABLE_ANSWER_ID;
                } else {
                    element.AC_TYPE = null;
                    element.QUEST_TABLE_ANSWER_ID = null;
                }
            });
            this._formBuilderCreateService.childTableQuestionId.splice(IS_CHILD_TABLE_QUESTION_SAVE, 1);
        } else if (answersToRemove) {
            currentQuestion.ANSWERS[1] = this.filterDeletedItems(currentQuestion.ANSWERS[1], newAnswers);
        } else {
            this.updateQuestTableAnswerIds(currentQuestion, newAnswers);
            this.updateAcTypes(currentQuestion);
        }
    }

    /**
     * Filters out deleted items (`AC_TYPE = 'D'`).
     *
     * Rules:
     * - If auto-save is enabled → keep only if at least one COLUMN_X has a value AND the item exists in response.
     * - If auto-save is disabled → keep only if the item exists in response.
     * - Non-deleted items are always kept.
     *
     * @param sourceArray   Original items
     * @param responseArray Response items (for existence check)
     */
    filterDeletedItems(sourceArray, responseArray) {
        return sourceArray.filter(item => {
            if (item.AC_TYPE === 'D') {
                // Check if the QUEST_TABLE_ANSWER_ID exists in the response array
                const existsInResponse = responseArray.some(
                    refItem => refItem.QUEST_TABLE_ANSWER_ID === item.QUEST_TABLE_ANSWER_ID
                );
                if (this._formBuilderCreateService.isAutoSaveEnabled) {
                    // Auto-save ON → require at least one non-empty column for keeping the deleted row if user deleted via backspace
                    for (let i = 0; i < 10; i++) {
                        const COLUMN_NAME = 'COLUMN_' + (i + 1);
                        const COLUMN_VALE = (item[COLUMN_NAME] && item[COLUMN_NAME].trim()) || null;
                        if (COLUMN_VALE) {
                            return existsInResponse;
                        }
                    }
                } else {
                    // Auto-save OFF → If not found in the response array, remove this item
                    return existsInResponse;
                }
            }
            // If not, keep the item
            return true;
        });
    }

    /**
     * Function to assign the generated id for answered row based on the API response
     */
    private updateQuestTableAnswerIds(currentQuestion: any, newAnswers: any): void{
        newAnswers.forEach((newAnswer, rowIndex: number) => {
            currentQuestion.ANSWERS[1][rowIndex].QUEST_TABLE_ANSWER_ID = newAnswer.QUEST_TABLE_ANSWER_ID;
        });
    }

    /**
     * Function to update the AC_TYPE of each rows if they are in the autosave queue
     */
    private updateAcTypes(currentQuestion: any): void {
        currentQuestion.ANSWERS[1].forEach((answer) => {
            answer.AC_TYPE = answer.QUEST_TABLE_ANSWER_ID !== null
                ? (answer.AC_TYPE === 'I' ? 'U' : answer.AC_TYPE)
                : (answer.AC_TYPE === 'I' ? 'I' : null);
        });
    }

    /**
     * Function to check if there are any rows to delete from the table
     */
    private getAnswersToRemove(existingAnswers: any, newAnswers: any): boolean {
        const NEW_ANSWER_IDS = new Set(newAnswers.map(item => item.QUEST_TABLE_ANSWER_ID));
        return existingAnswers.some((item) =>
            item.AC_TYPE === 'D' && !NEW_ANSWER_IDS.has(item.QUEST_TABLE_ANSWER_ID)
        );
    }

}
