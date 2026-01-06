import {
    Component,
    OnInit,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener,
    OnDestroy,
    OnChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants, SearchConstants } from '../../questionnaire.constants';
import * as _ from 'lodash';
import { CreateQuestionnaireService } from '../../services/create.service';
import { easeInOUt } from '../../services/animations';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { DEFAULT_DATE_FORMAT, EDITOR_CONFIURATION, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { removeUnwantedTags, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import {
    getEndPointOptionsForSponsor,
    getEndPointOptionsForLeadUnit,
    getEndPointOptionsForDepartment,
    getEndPointOptionsForOrganization,
    getEndPointOptionsForCountry,
    getEndPointOptionsForProfitCentre,
    getEndPointOptionsForGrandCode, getEndPointOptionsForCostCentre, getEndPointOptionsForFundCentre, getEndPointOptionsForClaimTemplate
} from '../../../../common/services/end-point.config';
import { Question } from '../../questionnaire.interface';

declare var $: any;
/**
 * refer maintenance/questionnaire-list component for understanding the query param handling
 * and what is it purpose
 */
@Component({
    selector: 'app-create-questionnaire',
    templateUrl: './create-questionnaire.component.html',
    styleUrls: ['./create-questionnaire.component.css'],
    animations: [easeInOUt],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateQuestionnaireComponent implements OnInit, OnDestroy, OnChanges {
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _createQuestionnaireService: CreateQuestionnaireService,
        private _changeRef: ChangeDetectorRef,
        public _commonService: CommonService,
        private _elasticConfig: ElasticConfigService
    ) { }
    @Input() questionnaire: any = {};
    @Input() commonValues: any = {};
    @Input() lookUpDetails: any;
    @Input() nodes: any = {};
    @Input() isFinal = false;
    @Input() businessRules: any = {};

    selectedQuestionIndex = 0;
    toDeleteData = {};
    editorConfig = EDITOR_CONFIURATION;
    public Editor = DecoupledEditor;
    parentDetails = '';
    isViewMode = false;
    deleteTypeFlag = null;
    deleteInQuestion = null;
    editIndex = 0;
    debounceTimer: any;
    $subscriptions: Subscription[] = [];
    defaultValueOptions: any = [];
    elasticSearchOptions: any = {};
    endPointSearchOptions: any = {};
    optionsArray: any = [];
    setFocusToElement = setFocusToElement;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    searchOptions = {};
    TABLE_COLUMN_LIMIT = 10;
    isRuleAvailable: boolean;
    searchText: string;
    tempQuestionnaireBusinessRuleId: any;
    questionToRemoveRuleId: any;
    isDesc = true;
    direction = 1;
    isShowSummaryModal = false;
    isShowRule = false;

    ngOnInit() {
        this.$subscriptions.push(
            this._activatedRoute.queryParams.subscribe((data: any) => {
                this.isViewMode = data.id && data.id.slice(0, 1) === 'T';
                if (data.id === undefined && this.questionnaire.questions.length === 0) {
                    this.addNewQuestion('G0');
                }
            })
        );
        this.addQuestionEvent();
        this.updateEditIndexEvent();
        this.setConditionBasedOptions('Radio');
    }

    ngOnChanges() {
        this.getDataForSearchAndLookUps();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.editIndex = null;
        this.scrollAnimate();
    }

    public onReady(editor) {
        editor.ui
            .getEditableElement()
            .parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
    }

    @HostListener('window:scroll') onWindowScroll() {
        this.scrollAnimate();
    }
    /**Animates the button as user scrolls if a question is enabled then editIndex will not be null.
     * if edit index is not available then default scroll to 100px. if conditions are used too avoid
     * errors caused by scrolling on other tabs and after save.
     */
    scrollAnimate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            let editIndexElm: HTMLElement;
            if (this.editIndex) {
                editIndexElm = document.getElementById(this.editIndex.toString());
            }
            if (editIndexElm) {
                document.getElementById('floater').style.top = editIndexElm.getBoundingClientRect().top + 'px';
            } else {
                const el = document.getElementById('floater');
                if (el) {
                    el.style.top = '100px';
                }
            }
        }, 250);
    }

    setFocusToNewQuestion() {
        setTimeout(() => {
            document.getElementById(this.editIndex.toString()).scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.getElementById('question' + this.editIndex.toString()).focus();
            this.scrollAnimate();
        });
    }

    configureSearchOptions(question: any, isSetDefultValue: boolean = true): void {
        this.searchOptions = {};
        const CONDITIONS = this.questionnaire.conditions.filter(condition => condition.QUESTION_ID === question.QUESTION_ID);
        CONDITIONS.forEach(condition => {
            if (question.ANSWER_TYPE === 'elastic' || question.ANSWER_TYPE === 'endpoint') {
                this.searchOptions[condition.QUESTION_CONDITION_ID] = this.getSearchOptionConfig(question.LOOKUP_TYPE);
                if (this.searchOptions[condition.QUESTION_CONDITION_ID]) {
                    this.searchOptions[condition.QUESTION_CONDITION_ID].contextField = question.LOOKUP_NAME;
                    condition.CONDITION_VALUE = isSetDefultValue ? condition.CONDITION_VALUE : null;
                    this.searchOptions[condition.QUESTION_CONDITION_ID].defaultValue = condition.CONDITION_VALUE;
                }
            }
        });
    }
    getSearchOptionConfig(lookUpType: string) {
        if (lookUpType === 'fibiperson') {
            return this._elasticConfig.getElasticForPerson();
        } else if (lookUpType === 'fibiproposal') {
            return this._elasticConfig.getElasticForProposal();
        } else if (lookUpType === 'awardfibi') {
            return this._elasticConfig.getElasticForAward();
        } else if (lookUpType === 'instituteproposal') {
            return this._elasticConfig.getElasticForIP();
        } else if (lookUpType === 'grantcall_elastic') {
            return this._elasticConfig.getElasticForGrantCall();
        } else if (lookUpType === 'fibirolodex') {
            return this._elasticConfig.getElasticForRolodex();
        } else if (lookUpType === 'sponsorName') {
            return getEndPointOptionsForSponsor();
        } else if (lookUpType === 'unitName') {
            return getEndPointOptionsForLeadUnit();
        } else if (lookUpType === 'fibiDepartment') {
            return getEndPointOptionsForDepartment();
        } else if (lookUpType === 'fibiOrganization') {
            return getEndPointOptionsForOrganization();
        } else if (lookUpType === 'fibiCountry') {
            return getEndPointOptionsForCountry();
        } else if (lookUpType === 'profitCenterName') {
            return getEndPointOptionsForProfitCentre();
        } else if (lookUpType === 'grantCodeName') {
            return getEndPointOptionsForGrandCode();
        } else if (lookUpType === 'costCenterName') {
            return getEndPointOptionsForCostCentre();
        } else if (lookUpType === 'fundCenterName') {
            return getEndPointOptionsForFundCentre();
        } else if (lookUpType === 'claimTemplateName') {
            return getEndPointOptionsForClaimTemplate();
        } 
    }

    /**
     * @param  {} groupName
     * @param  {} parentId
     * Creates a new question basic features for the question is added here
     * like questionId, groupName etc and updates the new questionID
     */
    configureNewQuestion(groupName, parentId) {
        this.commonValues.isQuestionEdited = true;
        groupName === 'G0'
            ? (Constants.newQuestion.SHOW_QUESTION = true)
            : (Constants.newQuestion.SHOW_QUESTION = false);
        Constants.newQuestion.GROUP_NAME = groupName;
        Constants.newQuestion.QUESTION_ID = this.commonValues.lastQuestionId;
        Constants.newQuestion.PARENT_QUESTION_ID = parentId;
        this.addOption(this.commonValues.lastQuestionId, null);
        this.commonValues.lastQuestionId++;
        this._changeRef.markForCheck();
        return Object.assign({}, Constants.newQuestion);
    }

    /**
     * subscribes to the event from add button Add new question is triggered on click.
     * You should unsubscribe on ngOnDestroy to avoid duplicate subscriptions
     */
    addQuestionEvent() {
        this.$subscriptions.push(
            this._createQuestionnaireService.addQuestionEvent.subscribe((data) => {
                this.addNewQuestion(data);
            })
        );
    }
    /**
     * subscribes to the event from tree which emits the current selected question.
     * You should unsubscribe on ngOnDestroy o avoid duplicate subscriptions
     */
    updateEditIndexEvent() {
        this.$subscriptions.push(
            this._createQuestionnaireService.updateSelectedQuestionId.subscribe((data: number) => {
                const question = this.questionnaire.questions.find((q) => q.QUESTION_ID === data);
                this.setFocusToNewQuestion();
                this.setLookUpDataOnLoad(data);
                this.configureSearchOptions(question);
                this.editIndex = data;
                this.setLimitIfTableQuestionType(question);
                this._changeRef.markForCheck();
            })
        );
    }

    /** This is to set the question data and its branches when user click on questionnaire tree from tabs
     *  other than 'Questions' tab.
     */
    setLookUpDataOnLoad(questionId: number): void {
        const question = this.questionnaire.questions.find((q) => q.QUESTION_ID === questionId);
        if (['elastic', 'endpoint'].includes(question.ANSWER_TYPE)) {
            this.setDefaultSearchValueOptions(question.LOOKUP_TYPE);
        }
        this.setConditionBasedOptions(question.ANSWER_TYPE);
    }
    /**
     * @param  {} questionId
     * @param  {} optionLabel
     * updates the QuestionnaireOptions in Questionnaire the basic details of option are added
     * the option number is calculated with QuestionnaireOptions array length and timeout is used to avoid errors
     */
    addOption(questionId, optionLabel) {
        this.commonValues.isQuestionEdited = true;
        let optionNumber = 1;
        if (this.questionnaire.options.length > 0) {
            optionNumber = this.questionnaire.options[this.questionnaire.options.length - 1].QUESTION_OPTION_ID + 1;
        }
        Constants.newOption.QUESTION_ID = questionId;
        Constants.newOption.QUESTION_OPTION_ID = optionNumber;
        Constants.newOption.OPTION_LABEL = optionLabel;
        this.questionnaire.options.push(Object.assign({}, Constants.newOption));
        setTimeout(() => {
            document.getElementById('option' + optionNumber).focus();
        });
    }

    private isLimitReached(questionId: number, limit: number): boolean {
        if (!limit) { return false; }
        return this.getQuestionOptions(questionId).length >= limit;
    }

    private getQuestionOptions(questionId: number) {
        return this.questionnaire.options.filter(option => option.QUESTION_ID === questionId);
    }

    setOptionLimit(question: Question, limit: number) {
        question.IS_LIMIT_REACHED = this.isLimitReached(question.QUESTION_ID, limit);
    }

    setLimitIfTableQuestionType(question: Question): void {
        if (question.ANSWER_TYPE === 'Table') {
            this.setOptionLimit(question, this.TABLE_COLUMN_LIMIT);
        }
    }

    updateOptionNumberToOptions(questionId: number): void {
        this.getQuestionOptions(questionId).forEach((option, index) => option.OPTION_NUMBER = (index + 1));
    }

    /**
     * WHY: to set answer's limit for question type table
     * HOW: logic is if empty,null or 0 then (null) unlimited answers, if any number then that much answer limit.
     * @param question
     */
    resetNoOfAnswerIfEmpty(question: Question) {
        if (question.NO_OF_ANSWERS >= 0) {
            // @ts-ignore
            const integer = Math.abs(Math.floor(question.NO_OF_ANSWERS));
            return question.NO_OF_ANSWERS = (isNaN(integer) || integer === 0) ? null : new Number(integer);
        }
        question.NO_OF_ANSWERS = null;
    }

    /**
     * @param  {} questionId
     * @param  {} index
     * creates a new Condition for a selected question and pushed into QuestionnaireCondition array of questionnaire
     */
    addBranching(questionId, index) {
        this.commonValues.isQuestionEdited = true;
        this.questionnaire.questions[index].HAS_CONDITION = 'Y';
        Constants.newCondition.QUESTION_CONDITION_ID = this.commonValues.lastConditionId;
        Constants.newCondition.QUESTION_ID = questionId;
        Constants.newCondition.GROUP_NAME = 'G' + this.commonValues.lastGroupName;
        this.commonValues.lastGroupName++;
        this.commonValues.lastConditionId++;
        this.questionnaire.conditions.push(Object.assign({}, Constants.newCondition));
        this.configureSearchOptions(this.questionnaire.questions[index], false);
    }
    /**
     * @param  {} index
     * @param  {} groupName
     * @param  {} parentId
     * Adds a new Child question to the selected question, child question is pushed just below the parent in array
     * A timeout is used to avoid error of navigating to question before creation
     */
    addConditionBasedQuestion(index, groupName, parentId) {
        this.questionnaire.questions.splice(index + 1, 0, this.configureNewQuestion(groupName, parentId));
        this._createQuestionnaireService.updateTree.next({
            parentId: parentId,
            questionId: this.commonValues.lastQuestionId,
            groupName: groupName,
        });
        const id = this.commonValues.lastQuestionId - 1;
        this.editIndex = id;
        this.setFocusToNewQuestion();
        this._createQuestionnaireService.updateSelectedQuestionId.next(this.editIndex);
    }
    /**
     * @param  {} groupName
     * Adds a base question(G0).A timeout is used to avoid error of navigating to question before creation
     */
    addNewQuestion(groupName) {
        this.questionnaire.questions.push(Object.assign({}, this.configureNewQuestion(groupName, null)));
        this._createQuestionnaireService.updateTree.next({
            questionId: this.commonValues.lastQuestionId,
            groupName: groupName,
        });
        this.editIndex = this.commonValues.lastQuestionId - 1;
        this.setFocusToNewQuestion();
        this._createQuestionnaireService.updateSelectedQuestionId.next(this.editIndex);
    }
    /**
     * @param  {} optionId
     * removes an option matching the optionNumber from QuestionnaireOptions
     */
    removeOption(option) {
        if (option.AC_TYPE === undefined || option.AC_TYPE === 'U') {
            this.questionnaire.deleteList.option.push(option.QUESTION_OPTION_ID);
            this.commonValues.isQuestionEdited = true;
        }
        _.remove(this.questionnaire.options, { QUESTION_OPTION_ID: option.QUESTION_OPTION_ID });
        const matchingConditions = _.filter(this.questionnaire.conditions, {
            CONDITION_VALUE: option.OPTION_LABEL,
            QUESTION_ID: option.QUESTION_ID,
        });
        if (matchingConditions) {
            _.forEach(matchingConditions, (condition) => {
                this.removeCondition(condition);
            });
        }
    }
    /**
     * @param  {} conditionId
     * removes a condition matching the conditionId
     */
    removeCondition(condition) {
        if (condition.AC_TYPE === undefined || condition.AC_TYPE === 'U') {
            this.commonValues.isQuestionEdited = true;
            this.questionnaire.deleteList.condition.push(condition.QUESTION_CONDITION_ID);
        }
        const matchingQuestions: any = _.filter(this.questionnaire.questions, { GROUP_NAME: condition.GROUP_NAME });
        if (matchingQuestions) {
            _.forEach(matchingQuestions, (question) => {
                this.removeQuestion(question);
            });
        }
        _.remove(this.questionnaire.conditions, { QUESTION_CONDITION_ID: condition.QUESTION_CONDITION_ID });
        const matchingConditions = _.find(this.questionnaire.conditions, { QUESTION_ID: condition.QUESTION_ID });
        if (!matchingConditions) {
            const question: any = _.find(this.questionnaire.questions, { QUESTION_ID: condition.QUESTION_ID });
            question.HAS_CONDITION = 'N';
        }
        this.editIndex = condition.QUESTION_ID;
    }
    /**
     * @param  {} questionId
     * Removes all options for a given questionId from QuestionnaireOptions
     */
    removeQuestionOptions(questionId) {
        _.remove(this.questionnaire.options, { QUESTION_ID: questionId });
    }
    /**
     * @param  {} questionId
     * removes all conditions for the a given questionId
     */
    removeQuestionConditions(questionId) {
        _.remove(this.questionnaire.conditions, { QUESTION_ID: questionId });
    }

    removeQuestion(question) {
        this.editIndex = null;
        if (question.AC_TYPE === undefined || question.AC_TYPE === 'U') {
            this.commonValues.isQuestionEdited = true;
            this.questionnaire.deleteList.question.push(question.QUESTION_ID);
        }
        _.remove(this.questionnaire.questions, { QUESTION_ID: question.QUESTION_ID });
        this.removeQuestionConditions(question.QUESTION_ID);
        this.removeQuestionOptions(question.QUESTION_ID);
        const childQuestionList: any = _.filter(this.questionnaire.questions, {
            PARENT_QUESTION_ID: question.QUESTION_ID,
        });
        _.forEach(childQuestionList, (childQuestion) => {
            this.removeQuestion(childQuestion);
        });
        this._createQuestionnaireService.updateTree.next({});
    }
    /**
     * @param  {} questionId
     * returns an array of options matching the given questionId
     */
    getOptions(questionId): any {
        return _.filter(this.questionnaire.options, { QUESTION_ID: questionId });
    }
    /**
     * @param  {} questionId
     * @param  {} questionType
     * for a given question looks for enabling branching .returns true if the length of matching
     * conditions is less than matching option for the given questionId or certain types which does not have options
     */
    enableBranching(questionId, questionType, lookUpType) {
        if (['Text', 'Textarea', 'Date'].includes(questionType)) {
            return true;
        } else if (['elastic', 'endpoint', 'SystemLookup', 'UserLookup'] && lookUpType) {
            return true;
        } else {
            const optionLength = _.filter(this.questionnaire.options, { QUESTION_ID: questionId }).length;
            const conditionLength = _.filter(this.questionnaire.conditions, { QUESTION_ID: questionId }).length + 1;
            if (optionLength >= conditionLength || conditionLength === 0) {
                return true;
            } else {
                return false;
            }
        }
    }
    /**
     * @param  {} questionType
     * @param  {} questionId
     * updates the questionnaireOptions for change in questionType.removes the existing questions and updates with default options
     */
    changeQuestionType(questionType, questionId, index) {
        this.questionnaire.questions[index].NO_OF_ANSWERS = 1;
        this.commonValues.isQuestionEdited = true;
        this.questionnaire.questions[index].HAS_CONDITION = null;
        const options = _.filter(this.questionnaire.options, { QUESTION_ID: questionId });
        _.forEach(options, (option) => {
            this.removeOption(option);
        });
        const matchingConditions = _.filter(this.questionnaire.conditions, { QUESTION_ID: questionId });
        _.forEach(matchingConditions, (condition) => {
            this.removeCondition(condition);
        });
        if (questionType === 'Radio' || questionType === 'Checkbox') {
            this.addOption(questionId, null);
        }
        if (questionType === 'Y/N') {
            ['Yes', 'No'].forEach((element) => {
                this.addOption(questionId, element);
            });
        }
        if (questionType === 'Y/N/NA') {
            ['Yes', 'No', 'N/A'].forEach((element) => {
                this.addOption(questionId, element);
            });
        }
        if (questionType === 'Table') {
            this.addOption(questionId, null);
            this.questionnaire.questions[index].NO_OF_ANSWERS = null;

        }
        if (['elastic', 'endpoint', 'SystemLookup', 'UserLookup'].includes(questionType)) {
            this.questionnaire.questions[index].LOOKUP_TYPE = null;
            this.questionnaire.questions[index].LOOKUP_NAME = null;
            this.questionnaire.questions[index].ANSWER_LENGTH = 0;
        }
        this.setConditionBasedOptions(this.questionnaire.questions[index].ANSWER_TYPE);
    }

    getDataForSearchAndLookUps(): void {
        const temp = this.lookUpDetails.map((item) => {
            const data: any = {};
            data.code = item.code;
            data.dataType = item.dataType;
            data.description = item.description;
            data.questionType = this.appendQuestionTypeForMapping(item);
            return data;
        });
        this.lookUpDetails = temp;
    }

    appendQuestionTypeForMapping(item: any): string {
        return item.dataType === '6'
            ? 'elastic'
            : item.dataType === '7'
                ? 'endpoint'
                : item.dataType === '8'
                    ? 'SystemLookup'
                    : 'UserLookup';
    }

    getFilteredDataBasedOnQuestionType(lookUpDetails: any, questionType: string): Array<any> {
        return lookUpDetails.filter((element) => element.questionType === questionType);
    }

    /**
     * @param  {} deleteData - data to be deleted
     * @param  {} deleteTypeFlag - who initiated the delete
     * a single modal is used for all delete conformation. "selected data" to delete and "from where" flag is set here
     * @param deleteInQuestion - used to calculate if ANSWER_TYPE = table column count limit reached or not functionality.
     */
    setDeleteData(deleteData, deleteTypeFlag, deleteInQuestion = null) {
        this.toDeleteData = deleteData;
        this.deleteTypeFlag = deleteTypeFlag;
        this.deleteInQuestion = deleteInQuestion;
    }
    /**
     *if the user confirms the delete and deletes according to the type(option,question or condition)
     */
    deleteAttribute() {
        if (this.deleteTypeFlag === 'question') {
            this.removeQuestion(this.toDeleteData);
        } else if (this.deleteTypeFlag === 'condition') {
            this.removeCondition(this.toDeleteData);
        } else if (this.deleteTypeFlag === 'option') {
            this.removeOption(this.toDeleteData);
            if (this.deleteInQuestion && this.deleteInQuestion.ANSWER_TYPE === 'Table') {
                this.deleteInQuestion.IS_LIMIT_REACHED = this.isLimitReached(this.deleteInQuestion.QUESTION_ID, this.TABLE_COLUMN_LIMIT);
                this.updateOptionNumberToOptions(this.deleteInQuestion.QUESTION_ID);
                this.deleteInQuestion = null;
            }
        }
        this.toDeleteData = {};
        this.deleteTypeFlag = null;
    }
    /**
     * @param  {} index
     * set ac_type to u if user changes
     */
    updateOptionACType(index) {
        this.commonValues.isQuestionEdited = true;
        if (this.questionnaire.options[index].AC_TYPE === undefined) {
            this.questionnaire.options[index].AC_TYPE = 'U';
        }
    }
    /**
     * @param  {} index
     * set ac_type to u if user changes
     */
    updateConditionACType(index) {
        this.commonValues.isQuestionEdited = true;
        if (this.questionnaire.conditions[index].AC_TYPE === undefined) {
            this.questionnaire.conditions[index].AC_TYPE = 'U';
        }
    }

    changeEditQuestion(questionId, id, question) {
        this.editIndex = questionId;
        this._createQuestionnaireService.updateSelectedQuestionId.next(questionId);
        this.scrollAnimate();
        if (question.ANSWER_TYPE === 'elastic' || question.ANSWER_TYPE === 'endpoint') {
            this.setDefaultSearchValueOptions(question.LOOKUP_TYPE);
        }
        this.getDataForSearchAndLookUps();
        this.setConditionBasedOptions(question.ANSWER_TYPE);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.focus();
            }
        }, 250);
    }

    setDefaultSearchValueOptions(lookUpType: string) {
        this.defaultValueOptions = [];
        switch (lookUpType) {
            case 'fibiperson':
                this.defaultValueOptions = SearchConstants.person;
                break;
            case 'fibirolodex' :
                this.defaultValueOptions = SearchConstants.rolodex;
                break;
            case 'fibiproposal':
                this.defaultValueOptions = SearchConstants.proposal;
                break;
            case 'awardfibi':
                this.defaultValueOptions = SearchConstants.award;
                break;
            case 'instituteproposal':
                this.defaultValueOptions = SearchConstants.instituteproposal;
                break;
            case 'grantcall_elastic':
                this.defaultValueOptions = SearchConstants.grantcallElastic;
                break;
            case 'sponsorName':
                this.defaultValueOptions = SearchConstants.sponsor;
                break;
            case 'unitName':
                this.defaultValueOptions = SearchConstants.leadUnit;
                break;
            case 'fibiDepartment':
                this.defaultValueOptions = SearchConstants.department;
                break;
            case 'fibiOrganization':
                this.defaultValueOptions = SearchConstants.organization;
                break;
            case 'fibiCountry':
                this.defaultValueOptions = SearchConstants.country;
                break;
            case 'profitCenterName':
                this.defaultValueOptions = SearchConstants.profitCenter;
                break;
            case 'grantCodeName':
                this.defaultValueOptions = SearchConstants.grantCodeName;
                break;
            case 'costCenterName':
                this.defaultValueOptions = SearchConstants.costCenter;
                break;
            case 'fundCenterName':
                this.defaultValueOptions = SearchConstants.fundCenter;
                break;
            case 'claimTemplateName':
                this.defaultValueOptions = SearchConstants.claimTemplate;
                break;
        }
    }

    checkForMultiSelect(value: number, question: any): void {
        question.ANSWER_LENGTH = value;
    }
    /**
     * @param  {any} question
     * Set all the available conditions to choose for selected question type.
     */
    setConditionBasedOptions(answerType: string): void {
        this.optionsArray = [];
        if (['Radio', 'Y/N', 'Y/N/NA', 'Checkbox', 'elastic', 'endpoint', 'SystemLookup', 'UserLookup'].includes(answerType)) {
            this.optionsArray.push('EQUALS', 'NOTEQUALS');
        } else if (['Text', 'Textarea'].includes(answerType)) {
            this.optionsArray.push('EQUALS', 'NOTEQUALS', 'CONTAINS');
        } else if (['Date'].includes(answerType)) {
            this.optionsArray.push('EQUALS', 'NOTEQUALS', 'GREATERTHAN', 'LESSTHAN');
        }
    }
    onSearchSelectEvent(event: any, question: any, condition: any): void {
        condition.CONDITION_VALUE = event ? event[question.LOOKUP_NAME] : null;
    }

    onLookupSelect(event: Array<any>, condition: any) {
        condition.CONDITION_VALUE = event.length ? event[0].description : null;
    }
    /**
     * @param  {} index
     * update the selected answer with dd/mm/yyyy format
     */
    setDateFormat(index: number, condition: any) {
        this.questionnaire.questions[index].AC_TYPE = this.setUpdateACType(this.questionnaire.questions[index].AC_TYPE);
        const oldDate = this.questionnaire.questions[index].ANSWERS[1];
        let newDate = new Date(this.questionnaire.questions[index].ANSWERS[1]);
        newDate = newDate.getDate() ? this.changeDateFormat(newDate) : oldDate ? oldDate : '';
        this.questionnaire.questions[index].ANSWERS[1] = newDate;
        condition.CONDITION_VALUE = parseDateWithoutTimestamp(condition.CONDITION_VALUE);
    }

    /**
     * @param  {} date coverts date to a specified format mm/dd//yyyy
     */
    changeDateFormat(date) {
        return (
            ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
        );
    }

    /**
     * @param  {} acType
     * sets acType for the question which is used in backend for identifying
     * updated answer or newly answered question
     */
    setUpdateACType(acType) {
        if (acType == null) {
            acType = 'I';
        } else if (acType === 'D') {
            acType = 'U';
        }
        return acType;
    }

    updateEditorContent(): void {
        this.questionnaire.questions[this.selectedQuestionIndex].DESCRIPTION =
            removeUnwantedTags(this.questionnaire.questions[this.selectedQuestionIndex].DESCRIPTION);
    }

    addBusinessRule(i: number): void {
        this.tempQuestionnaireBusinessRuleId = this.questionnaire.questions[i].RULE_ID ? this.questionnaire.questions[i].RULE_ID : null ;
        this.selectedQuestionIndex = i;
        this.isShowSummaryModal = false;
        this.isShowRule = true;
        this.searchText = '';
        this.getIsRuleAvailable(this.questionnaire.questions[i].RULE_ID);
    }

    getIsRuleAvailable(RULE_ID: number): void {
        this.isRuleAvailable = !!this.businessRules.find(ele => ele.RULE_ID === RULE_ID && ele.IS_ACTIVE === 'Y');
    }

    cancelAddBusinessRule(): void {
        this.questionnaire.questions[this.selectedQuestionIndex].RULE_ID = this.tempQuestionnaireBusinessRuleId;
        this.isShowRule = false;
        $('#viewBusinessRulesModal').modal('hide');
    }

    closeModal(event: any): void {
        this.isShowSummaryModal = event.closeModal;
        if (event.unlink) {
            this.questionToRemoveRuleId.RULE_ID = null;
        }
        this.questionToRemoveRuleId = {};
    }

    sortBy(property: string): void {
        this.isDesc = !this.isDesc;
        this.direction = this.isDesc ? 1 : -1;
    }

    setQuestionToRemoveRuleId(question: any): void {
        this.questionToRemoveRuleId = question;
        this.getIsRuleAvailable(question.RULE_ID);
    }

    addBusinessRuleValidation(): void {
        let isRuleNotDeleted = false;
        if (this.questionnaire.questions[this.selectedQuestionIndex].RULE_ID) {
            isRuleNotDeleted =
                !!this.businessRules.find(ele => ele.RULE_ID ===  this.questionnaire.questions[this.selectedQuestionIndex].RULE_ID);
        }
        if (isRuleNotDeleted && this.questionnaire.questions[this.selectedQuestionIndex].RULE_ID) {
            $('#viewBusinessRulesModal').modal('hide');
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select a Rule to add.');
        }
    }

}
