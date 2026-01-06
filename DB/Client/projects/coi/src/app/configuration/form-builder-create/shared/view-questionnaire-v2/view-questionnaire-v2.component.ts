import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { QuestionnaireService } from '../view-questionnaire/questionnaire.service';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { easeIn } from '../../../../common/utilities/animations';
import { deepCloneObject, scrollIntoView, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { TableAnswer } from '../view-questionnaire/questionnaire.interface';
import { compareDatesWithoutTimeZone, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { HEADER, Questionnaire, QuestionnaireVO } from './questionnaire-interface';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { DATE_PLACEHOLDER } from '../../../../app-constants';
import { AutoSaveRequestQuestionnaireData, OptionRequestObject, QuestionnaireRequestObject, QuestionRequestObject } from '../../../../shared/view-questionnaire/questionnaire.interface';
import {SectionComponent, UpdatedQuestionnaire} from '../form-builder-view/form-builder-interface';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { getEndPointOptionsForCostCentre, getEndPointOptionsForCountry, getEndPointOptionsForDepartment, getEndPointOptionsForFundCentre, 
    getEndPointOptionsForGrandCode, getEndPointOptionsForLeadUnit, getEndPointOptionsForOrganization, getEndPointOptionsForProfitCentre, 
    getEndPointOptionsForSponsor } from '../../../../../../../fibi/src/app/common/services/end-point.config';
import { EDITOR_CONFIURATION } from '../../../../../../../fibi/src/app/app-constants';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import { debounceTime } from 'rxjs/operators';
import { Question } from '../../../../shared/common.interface';
declare var $: any;

@Component({
    selector: 'app-view-questionnaire-v2',
    templateUrl: './view-questionnaire-v2.component.html',
    styleUrls: ['./view-questionnaire-v2.component.scss'],
    animations: [easeIn],
    providers: [QuestionnaireService],
})
export class ViewQuestionnaireV2Component implements OnInit, OnChanges, OnDestroy {
    @Input() isViewMode: boolean;
    @Input() questionnaireVO = new QuestionnaireVO();
    @Output() questionnaireSaveEvent = new EventEmitter<any>();
    @Output() questionnaireEditEvent = new EventEmitter<any>();
    @Output() answerChangeEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output() emitChanges = new EventEmitter<any>();
    @Input() externalEvent: Observable<any>;
    @Input() isShowSave = false;
    @Input() isShowQuestionnaireDock = true;
    @Input() saveButtonLabel: string;
    @Input() component: SectionComponent;
    @Output() updatedQuestionnaireWithChild = new EventEmitter<UpdatedQuestionnaire>();
    debounceRequiredType = ['Table', 'Text', 'Textarea'];


    questionnaire = new Questionnaire();
    searchObjectMapping = {
        'fibiperson': 'prncpl_id',
        'awardfibi': 'award_number',
        'fibiproposal': 'proposal_id',
        'instituteproposal': 'proposal_id',
        'grantcall_elastic': 'grant_header_id',
        'sponsorName': 'sponsorCode',
        'unitName': 'unitNumber',
        'fibiOrganization': 'organizationId',
        'fibiCountry': 'countryCode',
        'fibiDepartment': 'unitNumber',
        'grantCodeName': 'grantCode',
        'costCenterName': 'costCenterCode',
        'fundCenterName': 'fundCenterCode',
        'profitCenterName': 'profitCenterCode'
    };
    setFocusToElement = setFocusToElement;
    attachmentIndex = null;
    requestObject: any = {};
    filesArray = [];
    conditions = [];
    tempFiles = [];
    result: any = {};
    showHelpMsg = [];
    helpMsg = [];
    $subscriptions: Subscription[] = [];
    isSaving = false;
    unAnsweredQuestions: any = [];
    uniqueIdFromUnAnsweredQuestions: any = [];
    currentIndex = -1;
    isShowLeftArrow = false;
    highlight = 0;
    isQuestionnaireInfo = true;
    scrollIntoView = scrollIntoView;
    uploadedFile = [];
    searchOptions: any = {};
    clearElasticField: any;
    clearEndPointField: any;
    lookUpOptions: any = {};
    lookUpValues = {};
    IsEnableACTypeChecking = false;
    isShowLimiterInTable: any = {};
    isDataChanged = false;
    datePlaceHolder = DATE_PLACEHOLDER;
    private questionnaireRequestData = new QuestionnaireRequestObject();
    tempQuestionnaire = [];
    uniqueId = new Date().getTime().toString();
    isSaveResponseEvent = false;
    allQuestionnaireOptions = [];
    editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
    modifiedAttachmentIds: number[] = [];
    private $debounceTimer = new Subject<Question>();
    private focusTimeoutId: any;
    isAllQuestionMandatory = false;

    constructor(
        private _questionnaireService: QuestionnaireService,
        public _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        private _CDRef: ChangeDetectorRef,
        public readonly formBuilderCreateService: FormBuilderCreateService
    ) {
    }

    ngOnInit() {
        this.autoSaveEvent();
        this.setupQuestionDebounce();
    }
    /**
    * this Event subscribes to the auto save trigger generated on save click on top basically
    * what happens is when a save click happen this will let this component know when
    * user click the general save button.
    */
    autoSaveEvent() {
        if (this.externalEvent) {
            this.$subscriptions.push(this.externalEvent.subscribe((event: any) => {
                if (event.eventType === 'EXTERNAL_SAVE' && this.isDataChanged) {
                    this.saveQuestionnaireExternal();
                } else if (event.eventType === 'SAVE' && this.isDataChanged) {
                    this.saveQuestionnaire();
                } else if (event.eventType === 'SAVE_COMPLETE') {
                    this.isDataChanged = false;
                }
            }));
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        if (this.focusTimeoutId) {
            clearTimeout(this.focusTimeoutId);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.requestObject.questionnaireId = this.questionnaireVO.questionnaireId;
        this.requestObject.questionnaireAnswerHeaderId = this.questionnaireVO.questionnaireAnswerHeaderId || '';
        if (this.requestObject.questionnaireId) {
            this.IsEnableACTypeChecking = false;
            this.getQuestionnaire();
            this.modifiedAttachmentIds = [];
        }
        /**
         * Run only when `isViewMode` input value changes.
         * - If `isViewMode` is true, filter out table rows that do not have a `QUEST_TABLE_ANSWER_ID`.
         * - This prevents showing placeholder/unsaved rows when switching to view mode.
         */
        if (changes['isViewMode'] && changes['isViewMode'].currentValue !== changes['isViewMode'].previousValue) {
            if (this.isViewMode) {
                this.questionnaire?.questions.forEach((quest: Question) => {
                    if (quest?.ANSWER_TYPE === 'Table') {
                        quest.ANSWERS['1'] = quest.ANSWERS['1'].filter(
                            (row: TableAnswer) => row.QUEST_TABLE_ANSWER_ID && row.AC_TYPE !== null && row.AC_TYPE !== 'D'
                        );
                    }
                });
            }
        }
    }

    getQuestionnaire() {
        this.isSaveResponse()
        if (this.isSaveResponseEvent) {
            this.questionnaireVO.questionnaireAnswerHeaderId = this.questionnaireVO.questionnaireAnswerHeaderId;
            this.tempQuestionnaire = [];
            this.IsEnableACTypeChecking = true;
            this.filterTableAnsweType(this.questionnaireVO);
            this.filterAttachmentTypes(this.questionnaireVO);
        } else {
            this.questionnaire = this.questionnaireVO.questionnaire;
            this.allQuestionnaireOptions = deepCloneObject(this.questionnaireVO.questionnaire.options);
            this.questionnaire.questions.forEach((question: Question) => {
                this.setDataForSearchAnswerTypes(question);
                this.showChildQuestions(question);
                this.ifQuestionTypeTablePrepareData(question);
                if (question.RULE_ID && question.GROUP_NAME === 'G0') {
                    this.checkBusinessRule(question.RULE_ID, question);
                }
            });
            this.updatedQuestionnaireWithChild.emit({ componentId: this.component.componentId, questionnaire: this.questionnaire });
            if (this.requestObject.newQuestionnaireId) {
                this.questionnaireSaveEvent.emit({ status: 'SUCCESS' });
            }
            this.highlight = this.questionnaire.questions[0].QUESTION_ID;
            this.findUnAnsweredQuestions();
            this.checkAllQuestionMandatory();
            this.IsEnableACTypeChecking = true;
            this.showHelpMsg = [];
            this._CDRef.markForCheck();
        }
    }

    private checkAllQuestionMandatory(): void {
        this.isAllQuestionMandatory = this.component?.isMandatory === 'Y' && !this.formBuilderCreateService.checkForMandatoryQuestions(this.questionnaire.questions);
    }

    private ifQuestionTypeTablePrepareData(question: Question): void {
        if (question.ANSWER_TYPE === 'Table') {
            question.HEADERS = this.questionnaire.options.filter(o => o.QUESTION_ID === question.QUESTION_ID);
            if (!(question.ANSWERS && question.ANSWERS['1'])) {
                question.ANSWERS = { 1: [] };
            }
            if (!this.isViewMode) {
                this.setAddRow(question);
                this.setIsAnsweredFlag(question);
            }
        }
    }

    gotoTextArea(questionId: number, answerIndex: number, headerIndex: number): void {
        if (!this.isViewMode) {
            const TEXT_AREA = document.getElementById('answer' + questionId + answerIndex + headerIndex);
            if (TEXT_AREA) { TEXT_AREA.focus(); }
        }
    }

    addNewAnswerRow(question: Question): void {
        question.ANSWERS['1'].push(new TableAnswer());
        this.addOrderNumber(question);
        this.focusTimeoutId = setTimeout(() => {
            document.getElementById( 'answer' + question.QUESTION_ID + (question.ANSWERS['1'].length - 1) + '0')?.focus();
        }, 50);
    }

    addOrderNumber(question: Question): void {
        let visibleAnswers = 0;
        question.ANSWERS['1'].forEach((answer: TableAnswer) => {
            if (answer.AC_TYPE !== 'D' || this.formBuilderCreateService.isAutoSaveEnabled) {
                this.addOrderNumberIfDifferent(answer, visibleAnswers);
                visibleAnswers++;
            }
        });
        this.setAddRow(question, visibleAnswers);
    }

    private addOrderNumberIfDifferent(answer: TableAnswer, visibleAnswers: number): void {
        if (answer.ORDER_NUMBER !== visibleAnswers) {
            answer.ORDER_NUMBER = visibleAnswers;
            if (answer.QUEST_TABLE_ANSWER_ID !== null) {
                answer.AC_TYPE = 'U';
            }
        }
    }

    setAddRow(question: Question, visibleAnswers: number | null = null): void {
        visibleAnswers = (visibleAnswers == null && question.ANSWERS['1']) ?
            this.getVisibleAnswers(question).length : (visibleAnswers || 0);
        if (visibleAnswers === 1 && question.NO_OF_ANSWERS === 1) {
            question.is_add_row = false;
            question.IS_NO_VISIBLE_ANSWERS = false;
        } else {
            question.is_add_row = (visibleAnswers < question.NO_OF_ANSWERS) || question.NO_OF_ANSWERS === null;
            question.IS_NO_VISIBLE_ANSWERS = visibleAnswers === 0;
        }
    }

    private getVisibleAnswers(question: Question) {
        if (this.formBuilderCreateService.isAutoSaveEnabled) {
            return question.ANSWERS['1'];
        }
        return question.ANSWERS['1'].filter(answer => answer.AC_TYPE !== 'D');
    }

    /**
     * Checks whether all columns in the answer have no value.
     *
     * @param question - The question object containing HEADERS
     * @param answer - The answer object with column values
     * @returns true if every column is empty or null, otherwise false
     */
    hasNoColumnValues(question: any, answer: any): boolean {
        return question.HEADERS.every((_: any, i: number) => {
            const columnName = 'COLUMN_' + (i + 1);
            const columnValue = answer[columnName]?.trim() || null;
            return !columnValue;
        });
    }

    deleteAnswer(question: Question, answer: TableAnswer, answerIndex: number): void {
        if (answer.QUEST_TABLE_ANSWER_ID === null || (this.formBuilderCreateService.isAutoSaveEnabled && this.hasNoColumnValues(question, answer))) {
            question.ANSWERS['1'].splice(answerIndex, 1);
            this.addOrderNumber(question);
            this.setIsAnsweredFlag(question);
        } else {
            this.markQuestionnaireAsChanged(true);
            answer.AC_TYPE = 'D';
            this.setAddRow(question);
            this.updateUnansweredCountForTableType(answer, question);
            this.saveQuestionnaireNewObject(question);
        }
    }

    updateTableAnswerAcType(question: Question, answer: TableAnswer, answerIndex: number, columnHeaderIndex: number): void {
        this.isShowLimiterInTable[`${answerIndex}_${columnHeaderIndex}`] = false;
        this.markQuestionnaireAsChanged(true);
        if (answer.QUEST_TABLE_ANSWER_ID === null) {
            answer.AC_TYPE = 'I';
        } else {
            if (this.formBuilderCreateService.isAutoSaveEnabled) {
                const HAS_EMPTY_COLUMN = this.hasNoColumnValues(question, answer);
                answer.AC_TYPE = HAS_EMPTY_COLUMN ? 'D' : 'U';
            } else {
                answer.AC_TYPE = 'U';
            }
        }
        this.updateUnansweredCountForTableType(answer, question);
        this.saveQuestionnaireNewObject(question);
    }

    /**
     * Updates the table's `IS_ANSWERED` flag based on its rows.
     *
     * AC_TYPE meanings:
     * - null      → New entry (not yet saved)
     * - 'D'       → Deleted row
     * - undefined → Saved row (not modified)
     * - 'I'       → Inserted row
     * - 'U'       → Updated row
     *
     * Rules:
     * - Skip rows with `AC_TYPE = 'D'` (deleted rows).
     * - If no valid rows remain → unanswered.
     * - If any valid row is incomplete → unanswered.
     * - Otherwise → answered.
     *
     * @param answer   A table row answer (kept for context).
     * @param question The question object containing table headers and row answers.
     */
    private updateUnansweredCountForTableType(answer: TableAnswer, question: Question): void {
        const FILTERED_LIST = question.ANSWERS['1']?.filter((row: TableAnswer) => row.AC_TYPE !== null && row.AC_TYPE !== 'D');
        const HAS_ANY_INCOMPLETE_ROW = !FILTERED_LIST?.length || FILTERED_LIST?.some((row: TableAnswer) => {
            return !this.isTableRowAnswered(row, question.HEADERS.length);
        });
        question.IS_ANSWERED = !HAS_ANY_INCOMPLETE_ROW;
    }

    /**
     * Checks and set all rows if its "answered" and sets question to completed/answered depending on rows complete.
     * @param question
     */
    setIsAnsweredFlag(question: Question): void {
        if (!question.ANSWERS['1'] || question.ANSWERS['1'].length === 0) {
            question.IS_ANSWERED = false;
        } else {
            let isQuestionAnswered = false;
            const NO_OF_COLUMNS = question.HEADERS.length;
            question.ANSWERS['1'].forEach((answer: TableAnswer) => {
                const IS_ROW_ANSWERED = this.isTableRowAnswered(answer, NO_OF_COLUMNS);
                answer.isAnswered = IS_ROW_ANSWERED;
                if (IS_ROW_ANSWERED && !isQuestionAnswered) {
                    isQuestionAnswered = true;
                }
            });
            question.IS_ANSWERED = isQuestionAnswered;
        }
    }

    /**
     * Checks if table answer(table row) has any columns filled with data
     * @param answerRow
     * @param noOfColumns
     */
    isTableRowAnswered(answerRow: TableAnswer, noOfColumns: number = 10): boolean {
        if (answerRow.AC_TYPE === 'D') { return this.formBuilderCreateService.isAutoSaveEnabled; }
         let filledCount = 0;
        for (let i = 0; i < noOfColumns; i++) {
            const COLUMN_NAME = 'COLUMN_' + (i + 1);
            const COLUMN_VALUE = (answerRow[COLUMN_NAME] && answerRow[COLUMN_NAME].trim()) || null;
            if (COLUMN_VALUE) {
                 filledCount++;
            }
        }
        return filledCount === noOfColumns;
    }

    setDataForSearchAnswerTypes(question: any): void {
        if (['SystemLookup', 'UserLookup'].includes(question.ANSWER_TYPE)) {
            this.setDataForLookUpTypes(question);
        }
        if (['elastic', 'endpoint'].includes(question.ANSWER_TYPE)) {
            this.setOptionsForElasticAndEndPoint(question);
        }
    }

    /**
     * @param  {any} question
     * Here if the ANSWER_LENGTH = 1, then the user can select multiple values from lookup.
     * Otherwise only single value can be selected.
     */
    setDataForLookUpTypes(question: any): void {
        this.lookUpOptions[question.QUESTION_ID] =
            // tslint:disable-next-line:triple-equals
            question.ANSWER_LENGTH == 1 ? question.LOOKUP_TYPE + '#true#true' : question.LOOKUP_TYPE;
        this.lookUpValues[question.QUESTION_ID] = this.getAnswerCount(question.ANSWERS)
            ? Object.values(question.ANSWERS)
            : [];
    }

    setOptionsForElasticAndEndPoint(question: any): void {
        if (question.ANSWER_TYPE === 'elastic') {
            this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE] = this.getElasticConfig(question, question.LOOKUP_TYPE);
        } else {
            this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE] = this.getEndPointConfig(question, question.LOOKUP_TYPE);
        }
        if (this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE]) {
            this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = question.ANSWERS[1];
            this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].contextField = question.LOOKUP_NAME;
        }
    }

    /**
     * @param  {any} event
     * @param  {any} question
     * Since the Answers received from the backend is of the form- code, description, we are mapping the selected
     * event to that form.
     */
    onSelectLookUpValue(event: any, question: any): void {
        if (event) {
            const TEMP = event.map((item) => {
                const LOOK_UP: any = {};
                LOOK_UP.code = item.code;
                LOOK_UP.description = item.description;
                return LOOK_UP;
            });
            question.ANSWERS = { ...TEMP };
            this.showChildQuestions(question);
            this.saveQuestionnaireNewObject(question);
        }
    }

    getElasticConfig(question, lookUpType) {
        switch (lookUpType) {
            case 'fibiperson':
                question.placeHolder = 'Search for person';
                return this._elasticConfig.getElasticForPerson();
            case 'fibirolodex':
                question.placeHolder = 'Search for non-employee';
                return this._elasticConfig.getElasticForRolodex();
            case 'fibiproposal':
                question.placeHolder =
                    // tslint:disable-next-line: max-line-length
                    'Search: Proposal ID, Title, Principal Investigator, Category, Proposal Type, Status of Proposal, Sponsor, Proposal Lead Unit';
                return this._elasticConfig.getElasticForProposal();
            case 'awardfibi':
                question.placeHolder =
                    'Search: Award#, Account No, Title, Lead Unit, Sponsor, Principal Investigator, Award Status, Title of Grant Call';
                return this._elasticConfig.getElasticForAward();
            case 'instituteproposal':
                question.placeHolder = 'Search: Proposal ID, Title, Principal Investigator, Category, Type, Status,Sponsor';
                return this._elasticConfig.getElasticForIP();
            case 'grantcall_elastic': question.placeHolder =
                // tslint:disable-next-line: max-line-length
                'Search: Grant Call ID, Title of Grant Call, Type of Grant, Grant Call Status, Name of Funding Agency, Name of Funding Scheme';
                return this._elasticConfig.getElasticForGrantCall();
            default:
                question.placeHolder = 'Search for elastic';
                break;
        }
    }

    getEndPointConfig(question, lookUpType) {
        switch (lookUpType) {
            case 'sponsorName':
                question.placeHolder = 'Search for sponsor';
                return getEndPointOptionsForSponsor();
            case 'unitName':
                question.placeHolder = 'Search for unit';
                return getEndPointOptionsForLeadUnit();
            case 'fibiDepartment':
                question.placeHolder = 'Search for department';
                return getEndPointOptionsForDepartment();
            case 'fibiOrganization':
                question.placeHolder = 'Search for organization';
                return getEndPointOptionsForOrganization();
            case 'fibiCountry':
                question.placeHolder = 'Search for country';
                return getEndPointOptionsForCountry();
            case 'profitCenterName':
                question.placeHolder = 'Search for profit center';
                return getEndPointOptionsForProfitCentre();
            case 'grantCodeName':
                question.placeHolder = 'Search for grant code';
                return getEndPointOptionsForGrandCode();
            case 'costCenterName':
                question.placeHolder = 'Search for cost center';
                return getEndPointOptionsForCostCentre();
            case 'fundCenterName':
                question.placeHolder = 'Search for fund center';
                return getEndPointOptionsForFundCentre();
            default:
                question.placeHolder = 'Search for endpoint';
                break;
        }
    }

    findUnAnsweredQuestions(): void {
        this.uniqueIdFromUnAnsweredQuestions = this.questionnaire.questions
            .filter((question) => {
                if (!question.SHOW_QUESTION) return false;
                if (this.isAllQuestionMandatory || this.component?.isMandatory === 'N') {
                    return !this.getAnswerCount(question.ANSWERS, question);
                }
                return question.IS_MANDATORY === 'Y' && !this.getAnswerCount(question.ANSWERS, question);
            })
            .map((q) => q.QUESTION_ID);
    }

    getAnswerCount(answer, question: Question | null = null): boolean {
        if (!answer) { return true; }
        if (question && question.ANSWER_TYPE === 'Table') {
            return question.IS_ANSWERED;
        } else {
            return Object.values(answer).filter(Boolean).length === 0 ? false : true;
        }
    }

    showChildQuestions(currentQuestion: Question) {
        if (this.IsEnableACTypeChecking) {
            currentQuestion.AC_TYPE = this.setUpdateACType(currentQuestion);
            if(!this.formBuilderCreateService.isAutoSaveEnabled || (this.formBuilderCreateService.isAutoSaveEnabled && !this.debounceRequiredType.includes(currentQuestion.ANSWER_TYPE))) {
                this.markQuestionnaireAsChanged(true);
            }
        }
        if (currentQuestion.HAS_CONDITION === 'Y') {
            this.conditions = this.questionnaire.conditions.filter(C => C.QUESTION_ID === currentQuestion.QUESTION_ID);
            this.conditions.forEach((condition) => {
                this.findChildQuestion(currentQuestion, condition);
            });
             this.checkAllQuestionMandatory();
        }
    }

    updateUnAnsweredQuestions(currentQuestion) {
        if (this.checkForMatchingQuestionId(currentQuestion) && this.getAnswerCount(currentQuestion.ANSWERS)) {
            this.removeFromUnAnsweredList(currentQuestion.QUESTION_ID);
        } else {
            if (!this.getAnswerCount(currentQuestion.ANSWERS)) {
                this.uniqueIdFromUnAnsweredQuestions.push(currentQuestion.QUESTION_ID);
            }
        }
    }

    removeFromUnAnsweredList(questionId) {
        this.uniqueIdFromUnAnsweredQuestions.splice(this.uniqueIdFromUnAnsweredQuestions.indexOf(questionId), 1);
    }

    /**
     * @param  {} currentQuestion
     * Returns true if question id of currentQuestion matches with question id from unanswered question list.
     */
    checkForMatchingQuestionId(currentQuestion) {
        return !!this.uniqueIdFromUnAnsweredQuestions.find((id) => id === currentQuestion.QUESTION_ID);
    }

    /**
     * @param  {} currentQuestion
     * hides the question if the parents answer changed and update the answer to empty {}
     */
    hideChildQuestion(currentQuestion: Question) {
        const CONDITIONS = this.questionnaire.conditions.filter(C => C.QUESTION_ID === currentQuestion.QUESTION_ID);
        CONDITIONS.forEach((condition) => {
            this.questionnaire.questions.forEach((question) => {
                if (condition.GROUP_NAME === question.GROUP_NAME) {
                    question.AC_TYPE = this.setDeleteACType(question.AC_TYPE);
                    question.SHOW_QUESTION = false;
                    // question.ANSWERS        = {};
                    if (question.HAS_CONDITION === 'Y') {
                        this.hideChildQuestion(question);
                    }
                }
            });
        });
    }
    /**
     * @param  {} num
     * returns a array for a given number
     */
    getArray(num) {
        return new Array(num);
    }

    /**
     * @param  {} acType
     * sets acType for the question which is used in backend for identifying
     * updated answer or newly answered question
     */
    setUpdateACType(question) {
        const IS_ANSWERED = this.getAnswerCount(question.ANSWERS);
        let acType = question.AC_TYPE;
        if (IS_ANSWERED && acType == null) {
            acType = 'I';
        } else if (IS_ANSWERED && acType === 'D') {
            acType = 'U';
        } else if (!IS_ANSWERED && acType === 'U') {
            acType = 'D';
        }
        return acType;
    }
    /**
     * @param  {} acType
     * sets acType for the question to "D" which is used in backend for identifying
     * deleting previously answered question
     */
    setDeleteACType(acType) {
        if (acType === 'U') {
            acType = 'D';
        } else if (acType === 'I') {
            acType = null;
        }
        return acType;
    }
    /**
     * @param  {} question
     * @param  {} condition
     * for a given condtion and  question - returns true
     * if any of the answer matches the condition value otherwise false
     * different logic for different type of the conditions
     */
    checkAnswer(question, condition) {
        let result = false;
        if (condition.CONDITION_TYPE === 'EQUALS') {
            result = this.checkEqualCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'GREATERTHAN') {
            result = this.checkGreaterThanCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'LESSTHAN') {
            result = this.checkLesserThanCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'CONTAINS') {
            result = this.checkContainsCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'NOTEQUALS') {
            result = this.checkNotEqualCondition(question, condition);
        }
        return result;
    }
    /**
     * @param  {} currentQuestion
     * @param  {} condition
     * for a given condition and current question looks in all questions and
     * finds its child questions
     * if question group and check answer returns true - set them as visible
     * if question group matches and check answer fails the set them as invisible
     */
    findChildQuestion(currentQuestion, condition) {
        this.questionnaire.questions.forEach((question) => {
            if (condition.GROUP_NAME === question.GROUP_NAME && this.checkAnswer(currentQuestion, condition)) {
                if (question.RULE_ID) {
                    this.checkBusinessRule(question.RULE_ID, question);
                } else {
                    question.SHOW_QUESTION = true;
                }
                question.AC_TYPE = this.setUpdateACType(question);
                this.showChildQuestions(question);
            } else if (condition.GROUP_NAME === question.GROUP_NAME && !this.checkAnswer(currentQuestion, condition)) {
                question.SHOW_QUESTION = false;
                question.AC_TYPE = this.setDeleteACType(question.AC_TYPE);
                if (question.HAS_CONDITION === 'Y') {
                    this.hideChildQuestion(question);
                    this.checkAllQuestionMandatory();
                }
            }
        });
    }
    /**
     * @param  {} question
     * @param  {} condition
     * return true if the question has a matching answer for the condition value
     */
    checkEqualCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, (answer, key) => {
            if (question.ANSWER_TYPE === 'Checkbox') {
                if ((answer === true || answer === 'true') && condition.CONDITION_VALUE === key) {
                    result = true;
                    return false;
                }
            } else if (question.ANSWER_TYPE === 'SystemLookup' || question.ANSWER_TYPE === 'UserLookup') {
                if (this.checkAnyMatchingAnswer(question, condition)) {
                    result = true;
                    return true;
                } else {
                    result = false;
                    return false;
                }
            } else if (question.ANSWER_TYPE === 'Date') {
                if (answer && compareDatesWithoutTimeZone(answer, condition.CONDITION_VALUE) === 0) {
                    result = true;
                    return true;
                } else {
                    result = false;
                    return false;
                }
            } else {
                if (condition.CONDITION_VALUE === answer) {
                    result = true;
                    return false;
                }
            }
        });
        return result;
    }

    /**
     * @param  {any} question
     * @param  {any} condition
     * @returns boolean
     * here .trim() is used to remove the trailing space in val.description
     */
    checkAnyMatchingAnswer(question: any, condition: any): boolean {
        return !!Object.values(question.ANSWERS).filter(Boolean)
            .find((val: any) => val.description.trim() === condition.CONDITION_VALUE);
    }

    /**
     * @param question
     * @param condition
     * returns true if the question answer is not present in the answer. the non answered condition
     * is also considered as true
     * this can be divided into other small functions due to time pressure :(
     * these if if else can be avoided if with ternary operators properly.
     * @self FIX this once u are free
     */
    checkNotEqualCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, (answer, key) => {
            if (question.ANSWER_TYPE === 'Checkbox') {
                const ANSWERS = Object.keys(question.ANSWERS);
                if ((ANSWERS.length === 1 && ANSWERS.includes('1')) || Object.values(question.ANSWERS).every(a => !a)) {
                    result = false;
                    return false;
                } else {
                    result = question.ANSWERS[condition.CONDITION_VALUE] ? false : true;
                    return false;
                }
            } else if (question.ANSWER_TYPE === 'SystemLookup' || question.ANSWER_TYPE === 'UserLookup') {
                if (condition.CONDITION_VALUE !== answer.description) {
                    result = true;
                    return false;
                }
            } else if (question.ANSWER_TYPE === 'Date') {
                if (answer && compareDatesWithoutTimeZone(answer, condition.CONDITION_VALUE) !== 0) {
                    result = true;
                    return true;
                } else {
                    result = false;
                    return false;
                }
            } else {
                if (answer && condition.CONDITION_VALUE !== answer) {
                    result = true;
                    return false;
                }
            }
        });
        return result;
    }
    /**
     * @param  {} question
     * @param  {} condition
     * return true if the question has a greater value as answer for the condition value
     */
    checkGreaterThanCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, function (answer, key) {
            if (question.ANSWER_TYPE === 'Date') {
                if (answer && compareDatesWithoutTimeZone(answer, condition.CONDITION_VALUE) === 1) {
                    result = true;
                    return true;
                } else {
                    result = false;
                    return false;
                }
            } else if (parseInt(answer, 10) > parseInt(condition.CONDITION_VALUE, 10)) {
                result = true;
                return false;
            }
        });
        return result;
    }
    /**
     * @param  {} question
     * @param  {} condition
     * return true if the question has a lesser value as answer for the condition value
     */
    checkLesserThanCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, function (answer, key) {
            if (question.ANSWER_TYPE === 'Date') {
                if (answer && compareDatesWithoutTimeZone(answer, condition.CONDITION_VALUE) === -1) {
                    result = true;
                    return true;
                } else {
                    result = false;
                    return false;
                }
            } else if (parseInt(answer, 10) < parseInt(condition.CONDITION_VALUE, 10)) {
                result = true;
                return false;
            }
        });
        return result;
    }

    checkContainsCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, function (answer, key) {
            if (question.ANSWER_TYPE === 'SystemLookup' || question.ANSWER_TYPE === 'UserLookup') {
                if (answer && answer.description.includes(condition.CONDITION_VALUE)) {
                    result = true;
                    return false;
                }
            } else if (answer.includes(condition.CONDITION_VALUE)) {
                result = true;
                return false;
            }
        });
        return result;
    }
    /**
     * @param  {} index
     * update the selected answer with dd/mm/yyyy format
     */
    setDateFormat(index: number, question: any) {
        this.questionnaire.questions[index].AC_TYPE = this.setUpdateACType(this.questionnaire.questions[index]);
        const OLD_DATE = this.questionnaire.questions[index].ANSWERS[1];
        let newDate = new Date(this.questionnaire.questions[index].ANSWERS[1]);
        newDate = newDate.getDate() ? this.changeDateFormat(newDate) : OLD_DATE ? OLD_DATE : '';
        this.questionnaire.questions[index].ANSWERS[1] = newDate;
        this.showChildQuestions(question);
        this.updateUnAnsweredQuestions(this.questionnaire.questions[index]);
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
     * pushes the files to the file list once user confirms the attachment upload
     */
    addFileToArray() {
        if (this.tempFiles.length >= 1) {
            const QUESTION = this.questionnaire?.questions?.[this.attachmentIndex];
            if (!QUESTION?.AC_TYPE || QUESTION?.AC_TYPE === 'D') {
                QUESTION.AC_TYPE = 'I';
            }
            if (QUESTION?.AC_TYPE === 'U' && !this.modifiedAttachmentIds.includes(QUESTION?.QUESTION_ID)) {
                this.modifiedAttachmentIds.push(QUESTION?.QUESTION_ID);
            }
            this.removeDuplicateFile(this.questionnaire.questions[this.attachmentIndex].QUESTION_ID, null);
            this.questionnaire.questions[this.attachmentIndex].ANSWERS[1] = this.tempFiles[0].fileName;
            this.updateUnAnsweredQuestions(this.questionnaire.questions[this.attachmentIndex]);
            this.filesArray.push(this.tempFiles[0]);
            this.tempFiles = [];
            this.markQuestionnaireAsChanged(true);
            this.saveQuestionnaireNewObject(this.questionnaire.questions[this.attachmentIndex])

        }
    }
    
    onDateChange(question: any) {
        question.ANSWERS[1] = parseDateWithoutTimestamp(question.ANSWERS[1]); // normalize date
    }

    /**
     * @param  {} questionId
     * removes duplicate entry for files
     */
    removeDuplicateFile(questionId, index) {
        if (this.filesArray.length > 0) {
            _.remove(this.filesArray, { questionId: questionId });
        }
        if (index !== null) {
            this.uploadedFile = [];
            this.questionnaire.questions[index].ANSWERS[1] = '';
            this.questionnaire.questions[index].AC_TYPE = 'D';
            this.updateUnAnsweredQuestions(this.questionnaire.questions[index]);
            this.markQuestionnaireAsChanged(true);
            this.saveQuestionnaireNewObject(this.questionnaire.questions[index]);
        }
    }
    /**
     * @param  {} file
     * add file to temporarylist
     */
    addFileToTempFiles(file) {
        /* not a complete fix @verify mahesh */
        if (file[0]) {
            this.tempFiles = [];
            this.tempFiles.push({
                attachment: file[0],
                questionId: this.questionnaire.questions[this.attachmentIndex].QUESTION_ID,
                fileName: file[0].name,
                type: file[0].type,
            });
            if (this._commonService.isWafEnabled) {
                this.uploadedFile = [];
                this.uploadedFile.push(file[0]);
            }
        }
    }

    /**
     * Remove rows which was only added in view and not present in db.
     * @param spliceIndices
     * @param allAnswers
     */
    removeUnsavedRows(spliceIndices: number[], allAnswers: TableAnswer[]): void {
        if (spliceIndices.length) {
            spliceIndices.sort((a, b) => b - a).forEach(index => allAnswers.splice(index, 1));
        }
    }

    /**
     * Figure out which rows need to be deleted from db and which rows to delete from view only.
     * @param allAnswers
     * @param headersLength
     * @param spliceIndices
     */
    prepareUnsavedRows(allAnswers: TableAnswer[], headersLength: number, spliceIndices: number[], question: Question): void {
        allAnswers.forEach((answer: TableAnswer, index: number) => {
            if (!answer.isAnswered) {
                let filledCount = 0;
                for (let i = 0; i < question.HEADERS.length; i++) {
                    const COLUMN_NAME = 'COLUMN_' + (i + 1);
                    const COLUMN_VALUE = (answer[COLUMN_NAME] && answer[COLUMN_NAME].trim()) || null;
                    if (COLUMN_VALUE) {
                        filledCount++;
                    }
                }
                if (filledCount == 0) {
                    spliceIndices.push(index);
                }
            }
        });
    }

    deleteUnAnsweredTableRows(): void {
        if (!this.formBuilderCreateService.isAutoSaveEnabled) {
            this.questionnaire.questions.forEach((question: Question) => {
                const ALL_ANSWERS = question.ANSWERS['1'] || [];
                if (question.ANSWER_TYPE === 'Table' && ALL_ANSWERS.length) {
                    const SPLICE_INDICES = [];
                    const HEADERS_LENGTH = question.HEADERS.length;
                    this.prepareUnsavedRows(ALL_ANSWERS, HEADERS_LENGTH, SPLICE_INDICES, question);
                    this.removeUnsavedRows(SPLICE_INDICES, ALL_ANSWERS);
                    this.addOrderNumber(question);
                }
            });
        }
    }

    saveQuestionnaire() {
        this.deleteUnAnsweredTableRows();
        this.findUnAnsweredQuestions();
        this.questionnaireVO.questionnaireCompleteFlag = this.checkQuestionnaireCompletion();
        if (this.isSaving === false) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._questionnaireService.saveQuestionnaire(this.questionnaireVO, this.filesArray).subscribe(
                    (data: any) => {
                        this.saveActions(data);
                    },
                    (err) => {
                        this.questionnaireVO = err.error;
                        this.questionnaire = this.questionnaireVO.questionnaire;
                        this.isSaving = false;
                        this.questionnaireSaveEvent.emit({ status: 'ERROR' });
                    },
                    () => { }
                )
            );
        }
    }

    saveQuestionnaireExternal() {
        if (this.isDataChanged) {
            this.deleteUnAnsweredTableRows();
            this.findUnAnsweredQuestions();
            this.questionnaireVO.questionnaireCompleteFlag = this.checkQuestionnaireCompletion();
            this.questionnaireVO.files = this.filesArray;
            if (this.tempQuestionnaire.length) {
                const QUESTION_IDS = this.tempQuestionnaire.map(question => question.QUESTION_ID);
                const QUESTIONNAIRE_TO_SAVE = [];
                const TRANSFORMED_DATA = this.tempQuestionnaire.map(element => this.setQuestionData(element));
                QUESTIONNAIRE_TO_SAVE.push(...TRANSFORMED_DATA);
                const QUESTIONNAIRE = this.createQuestionnaireBatch(QUESTIONNAIRE_TO_SAVE, QUESTION_IDS);
                this.setQuestionnaireData(QUESTIONNAIRE);
            }
            this.questionnaireSaveEvent.emit({ status: 'EXTERNAL_SAVE', data: this.questionnaireRequestData });
        }
    }
    /**
     * @param  {} data
     * actions to perform in common for both waf enabled or disabled services after getting response data
     */
    saveActions(data) {
        this.questionnaireVO = data;
        this.questionnaire = data.questionnaire;
        this.lookUpValues = {};
        this.isSaving = false;
        this.questionnaire.questions.forEach((question) => {
            if (['SystemLookup', 'UserLookup'].includes(question.ANSWER_TYPE)) {
                this.setDataForLookUpTypes(question);
            }
        });
        this.markQuestionnaireAsChanged(false);
        if (
            this.questionnaireVO.hasOwnProperty('questionnaireAnswerHeaderId') &&
            this.questionnaireVO.questionnaireAnswerHeaderId != null
        ) {
            this.questionnaireSaveEvent.emit({ status: 'SUCCESS' });
        }
    }

    /**checks whether the questionnaire is complete and sets the flag */
    checkQuestionnaireCompletion() {
        return this.uniqueIdFromUnAnsweredQuestions.length === 0 ? 'Y' : 'N';
    }

    /** assigns help link message of a question
     * sets no help message if help message is not available
     * @param helpMsg
     */
    getHelpLink(helpMsg: string, helpLink: string, index: number) {
        this.showHelpMsg[index] = !this.showHelpMsg[index];
        this.helpMsg[index] = this.addDescription(helpMsg);
        this.helpMsg[index] = this.addHelpLinkToDescription(this.helpMsg[index], helpLink);
    }

    addDescription(helpMsg: string) {
        return helpMsg ? helpMsg : '';
    }

    addHelpLinkToDescription(helpMsg: string, helpLink: string) {
        if (helpLink) {
            let LINK =
                helpMsg + 'For more information, you can check out the <a href ="HELP_LINK" target="_blank">link</a>';
            LINK = LINK.replace('HELP_LINK', helpLink);
            return LINK;
        } else {
            return helpMsg;
        }
    }

    /**downloads file added
     */
    downloadAttachment(attachmentId, attachmentName) {
        this.$subscriptions.push(
            this._questionnaireService.downloadAttachment(attachmentId).subscribe(
                (data: any) => {
                    const A = document.createElement('a');
                    const BLOB = new Blob([data], { type: data.type });
                    A.href = URL.createObjectURL(BLOB);
                    A.download = attachmentName;
                    A.id = 'attachment';
                    document.body.appendChild(A);
                    A.click();
                    A.remove();
                }, error => console.log('Error downloading the file.', error)));
    }

    onSearchSelectEvent(event: any, question: any): void {
        if (event) {
            question.ANSWERS[1] = event[question.LOOKUP_NAME];
            question.ANSWER_LOOKUP_CODE = event[this.searchObjectMapping[question.LOOKUP_TYPE]]
                ? event[this.searchObjectMapping[question.LOOKUP_TYPE]] : null;
        } else {
            this.clearValues(question);
        }
        this.showChildQuestions(question);
        this.saveQuestionnaireNewObject(question);
    }

    clearValues(question: any): void {
        question.ANSWERS[1] = '';
        this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = '';
        question.ANSWER_LOOKUP_CODE = null;
    }

    markQuestionnaireAsChanged(status: boolean): void {
        if (this.isDataChanged !== status) {
            this.isDataChanged = status;
            this.questionnaireEditEvent.emit(status);
        }
    }

    private checkBusinessRule(ruleId, question): any {
        const REQUEST_OBJECT = {
            'moduleItemCode': this.questionnaireVO.moduleItemCode,
            'moduleItemKey': this.questionnaireVO.moduleItemKey,
            'ruleId': ruleId,
            'moduleSubItemCode': this.questionnaireVO.moduleSubItemCode,
            'moduleSubItemKey': this.questionnaireVO.moduleSubItemKey
        };
        this.$subscriptions.push(this._questionnaireService.evaluateBusinessRule(REQUEST_OBJECT)
            .subscribe((data: any) => {
                question.SHOW_QUESTION = data.rulePassed;
            }));
    }

    public saveQuestionnaireNewObject(question): void {
        this.markQuestionnaireAsChanged(true);
        if (question.ANSWER_TYPE == "Attachment") {
            this.autoSaveAttachmentType(question)
        }
        if (this.tempQuestionnaire.length) {
            this.checkAndRemoveExistingQuestions(this.tempQuestionnaire, question)
        } else {
            this.tempQuestionnaire.push(question);
        }
        this.emitAnswerChangeEvent(question);
    }

    private emitAnswerChangeEvent(question: any): void {
        this.answerChangeEvent.emit();
        if (this.formBuilderCreateService.isAutoSaveEnabled) {
            if (this.debounceRequiredType.includes(question.ANSWER_TYPE) && this.isDataChanged) {
                this.$debounceTimer.next(question);
            } else if (!this.debounceRequiredType.includes(question.ANSWER_TYPE)) {
                this.emitDataChangeV2(question);
            }
        }
    }
    
    private setupQuestionDebounce(): void {
        this.$subscriptions.push(
            this.$debounceTimer.pipe(debounceTime(500)).subscribe((question: Question) => {
                this.emitDataChangeV2(question);
            })
        );
    }

    emitDataChangeV2(question) {
        if(this.formBuilderCreateService.isAutoSaveEnabled) {
            this.deleteUnAnsweredTableRows();
            this.findUnAnsweredQuestions();
            this.questionnaireVO.questionnaireCompleteFlag = this.checkQuestionnaireCompletion();
            this.questionnaireVO.files = this.filesArray;
            const TRANSFORMED_DATA = this.setQuestionData(question);
            const QUESTIONNAIRE = this.createQuestionnaireBatch([TRANSFORMED_DATA], [question.QUESTION_ID]);
            this.setQuestionnaireData(QUESTIONNAIRE);
            this.emitChanges.next(this.questionnaireRequestData);
            this.checkForChildQuestions(this.questionnaireRequestData);
        }
    }

    checkForChildQuestions(questionnaireRequestData: QuestionnaireRequestObject): void {
        const CHILD_DATA = this.questionnaire?.questions?.filter(questionFromList => questionFromList.PARENT_QUESTION_ID === questionnaireRequestData?.questionnaire.questions[0].QUESTION_ID);
        if (CHILD_DATA && CHILD_DATA?.length !== 0) {
            CHILD_DATA?.forEach(childQuestion => {
                if(childQuestion?.AC_TYPE !== undefined) {
                    if (childQuestion.ANSWER_TYPE === 'Table') {
                        if (childQuestion.ANSWERS[1]?.length) {
                            this.formBuilderCreateService.childTableQuestionId.push(childQuestion.QUESTION_ID);
                            this.emitDataChangeV2(childQuestion);
                        }
                    } else {
                        this.emitDataChangeV2(childQuestion);
                    }
                }
            });
        }
    }

    private setQuestionnaireData(questionAnswerData: AutoSaveRequestQuestionnaireData): void {
        const { questionnaireId, moduleItemKey, moduleSubItemKey, moduleItemCode, moduleSubItemCode, header } = this.questionnaireVO;
        this.questionnaireRequestData = {
            questionnaireId,
            moduleItemKey,
            moduleSubItemKey,
            moduleItemCode,
            moduleSubItemCode,
            header,
            questionnaireCompleteFlag: this.checkQuestionnaireCompletion(),
            questionnaireAnswerHeaderId: this.questionnaireVO.questionnaireAnswerHeaderId || null,
            questionnaire: questionAnswerData,
            files: this.filesArray
        };
    }

    private createQuestionnaireBatch(questionsToSave: QuestionRequestObject[], questionsIdsToSave: number[])
        : { questions: QuestionRequestObject[], options: OptionRequestObject[] } {
        const options = this.allQuestionnaireOptions
            .filter((option: HEADER) => questionsIdsToSave.includes(option.QUESTION_ID))
            .map((option: HEADER) => ({
                QUESTION_ID: option.QUESTION_ID,
                OPTION_LABEL: option.OPTION_LABEL,
            }));

        return {
            questions: questionsToSave,
            options,
        };
    }

    private setQuestionData(question: Question): QuestionRequestObject {
        const DATA = new QuestionRequestObject();
        const FIELDS = ['QUESTION_ID', 'AC_TYPE', 'ANSWERS', 'ANSWER_TYPE', 'NO_OF_ANSWERS', 'ANSWER_LOOKUP_CODE', 'EXPLANATION', 'QUESTIONNAIRE_ANSWER_ID', 'ATTACHMENT_ID'];
        FIELDS.forEach((field: string) => DATA[field] = question[field]);
        if (question.ANSWER_TYPE === 'Table') {
            this.addOrderNumber(question);
        }
        this.filterAnsweredExplanation(DATA, null);
        return DATA;
    }

    //  This function fliters explanations that exist for answers only
    private filterAnsweredExplanation(question: any, i: number): void {
        if (['Radio', 'Y/N/NA', 'Y/N', 'Checkbox'].includes(question.ANSWER_TYPE) && Object.keys(question.EXPLANATION).length > 0) {
            const OPTIONS = this.questionnaireVO.questionnaire.options.filter((opt) => opt.REQUIRE_EXPLANATION == 'Y' && opt.QUESTION_ID == question.QUESTION_ID);
            for (const key in question.EXPLANATION) {
                if (question.ANSWER_TYPE === 'Checkbox' && !question.ANSWERS[key]) {
                    delete question.EXPLANATION[key];
                } else if (question.ANSWER_TYPE !== 'Checkbox' && !OPTIONS.find(opt => opt.OPTION_LABEL == question.ANSWERS[1])) {
                    delete question.EXPLANATION[1];
                }
            };
        }
    }

    private checkAndRemoveExistingQuestions(array, question) {
        const DUPLICATE_QUESTIONNAIRE_INDEX = array.findIndex((q) => q.QUESTION_ID == question.QUESTION_ID);
        if (DUPLICATE_QUESTIONNAIRE_INDEX >= 0) {
            array.splice(DUPLICATE_QUESTIONNAIRE_INDEX, 1);
        }
        array.push(question);
    }

    showAttachmentModal() {
        $('#AttachmentModal' + this.uniqueId).modal('show');

    }

    private autoSaveAttachmentType(data: Question): void {
        const QUESTIONNAIRE = {
            questions: [this.setQuestionData(data)],
            options: [],
        };
        this.setQuestionnaireData(QUESTIONNAIRE);
    }

    // To diffentiate save response and ititial load
    isSaveResponse() {
        if (this.externalEvent) {
            this.$subscriptions.push(this.externalEvent.subscribe((event: any) => {
                if (event.eventType === 'SAVE_COMPLETE') {
                    this.isSaveResponseEvent = true;
                }
            }));
        }
    }

    filterTableAnsweType(saveResponse): void {
        const TABLE_QUESTIONS =
        saveResponse?.questionnaire?.questions.filter((ques) => ques.ANSWER_TYPE == 'Table');
        const TABLE_QUESTIONNAIRE_IDS =
        TABLE_QUESTIONS.map((x) => x.QUESTION_ID);
        TABLE_QUESTIONNAIRE_IDS.forEach(element => {
        const EXISTING_QUESTIONS =
        this.questionnaire.questions.filter((x) => x.QUESTION_ID == element);
        this.updateTableWithResponse(TABLE_QUESTIONS, EXISTING_QUESTIONS);
        });
    }

    updateTableWithResponse(tableQuestions, existingQuestions): void {
        tableQuestions.forEach((element) => {
            existingQuestions.forEach(existingQues => {
                if (existingQues.QUESTION_ID === element.QUESTION_ID) {
                    existingQues.ANSWERS = element.ANSWERS;
                }
            });

        });
    }

    filterAttachmentTypes(saveResponse): void {
        const ATTACHMENT_QUESTIONS =
        saveResponse?.questionnaire?.questions.filter((ques) => ques.ANSWER_TYPE == 'Attachment');
        const ATTACHMENT_IDS = ATTACHMENT_QUESTIONS.map((x) => x.QUESTION_ID);
        ATTACHMENT_IDS.forEach(element => {
        const EXISTING_QUESTIONS =
        this.questionnaire.questions.filter((x) => x.QUESTION_ID == element);
        this.updateAttachmentWithResponse(ATTACHMENT_QUESTIONS, EXISTING_QUESTIONS);
        });
    }

    updateAttachmentWithResponse(attachmentQuestions, existingQuestions): void {
        attachmentQuestions.forEach((element) => {
            existingQuestions.forEach(existingQues => {
                if (existingQues.QUESTION_ID === element.QUESTION_ID) {
                    existingQues.AC_TYPE = element.AC_TYPE;
                    existingQues.QUESTIONNAIRE_ANSWER_ID = element.QUESTIONNAIRE_ANSWER_ID;
                    existingQues.ATTACHMENT_ID = element.ATTACHMENT_ID;
                }
            });

        });
        this._CDRef.markForCheck();
    }

    onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    /**
     * Function to check if there is a change in previous value and the new value
     * - Updates the ng model data
    */
    public storePreviousValueAndUpdate(data: any, key: string | number, newValue: string): void {
        this.isDataChanged = data[key]?.trim() !== newValue.trim();
        data[key] = newValue.trim();
    }
    
}
