/**
 * written by Mahesh Sreenath V M
 * optimized the code to support multiple module and moved to shared modules
 *
 * takes three inputs
 * @Input() questionnaireDetails - details of questionnaire like answer_header_id,questionnaire_id etc
 * @Input() moduleDetails - module_code module_item_key, module_item_code etc
 * @Input() isViewMode - boolean enables view mode  in the questionnaire
 *  @Input() iShowSave - boolean value to show and hide save button.
 * @Input() externalSaveEvent - an observable that triggers save on new values triggers.
 *
 * @Output() questionnaireSaveEvent = emits an event on save will return
 * {status: 'SUCCESS', data:questionnaireDetails} on successful save
 * {status: 'ERROR', data:questionnaireDetails} on failure;
 *
 * questionnaire details will have updated details regarding the questionnaire like questionnaire_answer_header_id,
 * QUESTIONNAIRE_COMPLETED_FLAG etc;
 * happy coding:)
 **/
import {
    Component,
    OnInit,
    Input,
    OnChanges,
    Output,
    EventEmitter,
    OnDestroy,
    ChangeDetectorRef,
    ElementRef,
    ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import {QuestionnaireService} from './questionnaire.service';
import {CommonService} from '../../common/services/common.service';
import {Subscription, Observable, Subject} from 'rxjs';
import {easeIn} from '../../../../../fibi/src/app/common/utilities/animations';
import {scrollIntoView, setFocusToElement} from '../../../../../fibi/src/app/common/utilities/custom-utilities';
import {subscriptionHandler} from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import {
    AttachmentData, AutoSaveRequestQuestionnaireData,
    AutoSaveResponse, HEADER, OptionRequestObject,
    Question,
    QuestionnaireRequestObject, QuestionRequestObject,
    TableAnswer
} from './questionnaire.interface';
import {
    getEndPointOptionsForClaimTemplate,
    getEndPointOptionsForCostCentre,
    getEndPointOptionsForCountry,
    getEndPointOptionsForDepartment,
    getEndPointOptionsForFundCentre,
    getEndPointOptionsForGrandCode,
    getEndPointOptionsForLeadUnit,
    getEndPointOptionsForOrganization,
    getEndPointOptionsForProfitCentre,
    getEndPointOptionsForSponsor
} from '../../../../../fibi/src/app/common/services/end-point.config';
import {
    compareDatesWithoutTimeZone,
    getDateObjectFromTimeStamp
} from '../../../../../fibi/src/app/common/utilities/date-utilities';
import {DATE_PLACEHOLDER, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../app-constants';
import {ElasticConfigService} from '../../common/services/elastic-config.service';
import {jumpToSection} from '../../common/utilities/custom-utilities';
import {debounceTime} from 'rxjs/operators';

declare const $: any;

@Component({
    selector: 'app-view-questionnaire',
    templateUrl: './view-questionnaire.component.html',
    styleUrls: ['./view-questionnaire.component.scss'],
    animations: [easeIn],
    providers: [QuestionnaireService],
})
export class ViewQuestionnaireComponent implements OnInit, OnChanges, OnDestroy {
    @Input() questionnaireDetails: any = {};
    @Input() moduleDetails: any = {};
    @Input() isViewMode: boolean;
    @Output() questionnaireSaveEvent = new EventEmitter<any>();
    @Output() questionnaireEditEvent = new EventEmitter<any>();
    @Input() externalSaveEvent: Observable<any>;
    @Input() isShowSave = true;
    @Input() isShowQuestionnaireDock = true;
    @Input() saveButtonLabel: string;
    // @Output() flagUpdationEvent = new EventEmitter<any>();
    @Input() isQuestionnaireValidateMode = false;
    @ViewChild('dockBoxIcon') dockBoxIcon: ElementRef<HTMLElement>;
    @Input() isAutoSaveEnabled = false;
    @Output() isAPIRequestPending = new EventEmitter<boolean>();
    @Output() isLoadQuestionnaireDetails = new EventEmitter<boolean>(false);

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
        'profitCenterName': 'profitCenterCode',
        'claimTemplateName': 'claimTemplateCode'
    };
    setFocusToElement = setFocusToElement;
    questionnaire: any = {};
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
    isShowDock = true;
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
    isSaveClicked = false;
    datePlaceHolder = DATE_PLACEHOLDER;
    isRadioExplanationRequired = {};
    public debounceRequired = true;
    private questionnaireRequestData = new QuestionnaireRequestObject();
    private autoSaveQuestionsQueue: Question[] = [];
    private autoSaveTableQuestionsQueue: Question[] = [];
    private isProcessingQuestionsQueue = false;
    private isProcessingTableQuestionsQueue = false;
    private $questionSubject = new Subject<Question>();
    private isDataChanged = false;
    private isDataChangedDateField = false;
    private hasPendingAPIs = false;
    private whetherCustomFieldInAPIQueue: Record<number, boolean> = {};
    questionValidationMap = new Map();
    totalQuestionCount = 0;
    totalAnsweredQuestions = 0;
    showSkipMandatoryInfo = false;
    isUserTriggerValidation = false;

    constructor(
        private _questionnaireService: QuestionnaireService,
        public _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        private _CDRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.setupQuestionDebounce();
        this.autoSaveEvent();
    }

    /**
     * this Event subscribes to the auto save trigger generated on save click on top basically
     * what happens is when a save click happen this will let this component know when
     * user click the general save button.
     */
    autoSaveEvent() {
        if (this.externalSaveEvent) {
            this.$subscriptions.push(this.externalSaveEvent.subscribe(_event => {
                    if (this.isQuestionnaireValidateMode) {
                        this.addAnimationToDockBox();
                    }
                    !this.isViewMode && this.questionnaireDetails.isChanged && this.saveQuestionnaire();
                }
            ));
        }
    }

    ngOnDestroy() {
        this._commonService.isPreventDefaultLoader = false;
        subscriptionHandler(this.$subscriptions);
    }

    ngOnChanges() {
        this.requestObject.questionnaireId = this.questionnaireDetails.QUESTIONNAIRE_ID;
        this.requestObject.questionnaireAnswerHeaderId = this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID || '';
        this.requestObject.newQuestionnaireId = (!this.isViewMode && this.questionnaireDetails.NEW_QUESTIONNAIRE_ID) || '';
        if (this.requestObject.questionnaireId) {
            this.IsEnableACTypeChecking = false;
            this.questionValidationMap.clear();
            this.getQuestionnaire();
        }
    }

    getQuestionnaire() {
        this.$subscriptions.push(
            this._questionnaireService.getQuestionnaire(this.requestObject).subscribe((data) => {
                this.result = data;
                this.result.moduleItemCode = this.questionnaireDetails.MODULE_ITEM_CODE;
                this.result.moduleSubItemCode = this.questionnaireDetails.MODULE_SUB_ITEM_CODE;
                this.result.moduleSubItemKey = this.moduleDetails.moduleSubItemKey;
                this.result.moduleItemKey = this.moduleDetails.moduleItemKey;
                this.result.actionUserId = this.moduleDetails.personId;
                this.result.actionPersonName = this.moduleDetails.currentUser;
                this.questionnaire = this.result.questionnaire;
                this.isQuestionnaireInfo = true;
                this.prepareQuestionaire();
                if (this.requestObject.newQuestionnaireId) {
                    this.emitCopiedQuestionnaireDetails();
                }
                this.highlight = this.questionnaire.questions[0].QUESTION_ID;
                this.findUnAnsweredQuestions();
                this.IsEnableACTypeChecking = true;
                this.showHelpMsg = [];
                this._CDRef.markForCheck();
                if (this.questionnaire && this.isQuestionnaireValidateMode) {
                    this.isLoadQuestionnaireDetails.emit(true);
                }
            })
        );
    }


    private prepareQuestionaire() {
        this.questionnaire.questions.forEach((question: Question) => {
            this.setDataForSearchAnswerTypes(question);
            this.showChildQuestions(question);
            this.ifQuestionTypeTablePrepareData(question);
            if (question.RULE_ID && question.GROUP_NAME === 'G0') {
                this.checkBusinessRule(question.RULE_ID, question);
            }
            this.setExplanationForRadio(question);
        });
    }

    private setExplanationForRadio(qns: Question): void {
        if (qns.ANSWERS[1] && ['Radio', 'Y/N/NA', 'Y/N'].includes(qns.ANSWER_TYPE)) {
            let selectedOption = this.questionnaire.options.find((opt) => {
                return (opt.OPTION_LABEL == qns.ANSWERS[1]) && (opt.QUESTION_ID == qns.QUESTION_ID) && opt.REQUIRE_EXPLANATION == 'Y'
            });
            if (selectedOption) {
                this.isRadioExplanationRequired[qns.QUESTION_ID] = true;
            }
        }
    }

    private canSaveQuestionnaire(): boolean {
        const HAS_MANDATORY_QUESTIONNAIRE = this.questionnaireDetails.IS_MANDATORY === 'Y' && this.questionnaire.questions.some(quest => quest?.SHOW_QUESTION && quest?.IS_MANDATORY === 'Y');
        return !this.uniqueIdFromUnAnsweredQuestions.length && this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG === 'N' && HAS_MANDATORY_QUESTIONNAIRE;
    }

    emitCopiedQuestionnaireDetails() {
        this.questionnaireDetails.QUESTIONNAIRE_ID = this.result.questionnaireId;
        this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID = this.result.questionnaireAnswerHeaderId;
        this.questionnaireDetails.NEW_QUESTIONNAIRE_ID = this.result.newQuestionnaireId;
        this.questionnaireSaveEvent.emit({status: 'SUCCESS', data: this.questionnaireDetails});
        this.markQuestionnaireAsChanged(true);
    }

    private ifQuestionTypeTablePrepareData(question: Question): void {
        if (question.ANSWER_TYPE === 'Table') {
            question.HEADERS = this.questionnaire.options.filter(o => o.QUESTION_ID === question.QUESTION_ID);
            if (!(question.ANSWERS && question.ANSWERS['1'])) {
                question.ANSWERS = {1: []};
            }
            if (!this.isViewMode) {
                this.setAddRow(question);
                this.setIsAnsweredFlag(question);
            }
        }
    }

    gotoTextArea(questionId: number, answerIndex: number, headerIndex: number): void {
        if (!this.isViewMode) {
            const textarea = document.getElementById('answer' + questionId + answerIndex + headerIndex);
            if (textarea) {
                textarea.focus();
            }
        }
    }

    addNewAnswerRow(question: Question): void {
        question.ANSWERS['1'].push(new TableAnswer());
        this.addOrderNumber(question);
    }

    addOrderNumber(question: Question): void {
        let visibleAnswers = 0;
        question.ANSWERS['1'].forEach((answer: TableAnswer) => {
            if (answer.AC_TYPE !== 'D' && (this.isAutoSaveEnabled ? answer.isAnswered : true)) {
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
        return question.ANSWERS['1'].filter(answer => answer.AC_TYPE !== 'D');
    }

    deleteTableRow(question: Question, answer: TableAnswer, answerIndex: number): void {
        if (answer.QUEST_TABLE_ANSWER_ID === null) {
            question.ANSWERS['1'].splice(answerIndex, 1);
            this.addOrderNumber(question);
            this.setIsAnsweredFlag(question);
            this.findUnAnsweredQuestions();
        } else {
            if (this.isAutoSaveEnabled) {
                // If autosave is enabled we show a warning model when we try to delete a saved row
                $('#deleteRowModal').modal('show');
                $('#row-delete-row-del-btn').off('click').on('click', () => {
                    answer.AC_TYPE = 'D';
                    this.setAddRow(question);
                    this.updateUnansweredCountForTableType(answer, question);
                    this.autoSave(question);
                    $('#deleteRowModal').modal('hide');
                });
            } else {
                answer.AC_TYPE = 'D';
                this.setAddRow(question);
                this.updateUnansweredCountForTableType(answer, question);
            }
        }
    }

    updateTableAnswerAcType(question: Question, answer: TableAnswer, answerIndex: number, columnHeaderIndex: number): void {
        this.isShowLimiterInTable[`${answerIndex}_${columnHeaderIndex}`] = false;
        this.markQuestionnaireAsChanged(true);
        if (answer.QUEST_TABLE_ANSWER_ID === null) {
            answer.AC_TYPE = 'I';
        } else {
            answer.AC_TYPE = 'U';
        }
        this.updateUnansweredCountForTableType(answer, question);
    }

    /**
     * sets table is answered/ completed flag depending upon the row's is answered/completed flag.
     * @param answer
     * @param question
     */
    private updateUnansweredCountForTableType(answer: TableAnswer, question: Question): void {
        const isRowAnswered = this.isTableRowAnswered(answer, question.HEADERS.length);
        const isQuestionAnswered = question.IS_ANSWERED;
        answer.isAnswered = isRowAnswered;
        if (!isRowAnswered && isQuestionAnswered) {
            const anyRowAnswered = this.getVisibleAnswers(question).some((ans: TableAnswer) => ans.isAnswered);
            if (!anyRowAnswered) {
                question.IS_ANSWERED = false;
            }
        } else if (isRowAnswered && !isQuestionAnswered) {
            question.IS_ANSWERED = true;
        }
        this.findUnAnsweredQuestions();
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
            const noOfColumns = question.HEADERS.length;
            question.ANSWERS['1'].forEach((answer: TableAnswer) => {
                const isRowAnswered = this.isTableRowAnswered(answer, noOfColumns);
                answer.isAnswered = isRowAnswered;
                if (isRowAnswered && !isQuestionAnswered) {
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
        if (answerRow.AC_TYPE === 'D') {
            return false;
        }
        let isAnswered = false;
        for (let i = 0; i < noOfColumns; i++) {
            const columnName = 'COLUMN_' + (i + 1);
            const columnValue = (answerRow[columnName] && answerRow[columnName].trim()) || null;
            if (columnValue) {
                isAnswered = true;
                break;
            }
        }
        return isAnswered;
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
        this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = question.ANSWERS[1];
        this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].contextField = question.LOOKUP_NAME;
    }

    /**
     * @param  {any} event
     * @param  {any} question
     * Since the Answers received from the backend is of the form- code, description, we are mapping the selected
     * event to that form.
     */
    onSelectLookUpValue(event: any, question: any): void {
        if (event) {
            const temp = event.map((item) => {
                const lookUp: any = {};
                lookUp.code = item.code;
                lookUp.description = item.description;
                return lookUp;
            });
            // To check if there is a change in data and whether to save it
            const isChangeInData = JSON.stringify(question.ANSWERS) !== JSON.stringify({...temp});
            question.ANSWERS = {...temp};
            this.showChildQuestions(question);
            if (isChangeInData) {
                this.autoSave(question);
            }
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
            case 'grantcall_elastic':
                question.placeHolder =
                    // tslint:disable-next-line: max-line-length
                    'Search: Grant Call ID, Title of Grant Call, Type of Grant, Grant Call Status, Name of Funding Agency, Name of Funding Scheme';
                return this._elasticConfig.getElasticForGrantCall();
            default :
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
            case 'claimTemplateName':
                question.placeHolder = 'Search for claim template name';
                return getEndPointOptionsForClaimTemplate();
            default :
                question.placeHolder = 'Search for endpoint';
                break;
        }
    }

    // updateFlagValue() {
    //   if (this.uniqueIdFromUnAnsweredQuestions.length === 0 &&
    //      this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG === 'N') {
    //       this.flagUpdationEvent.emit(this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = 'Y');
    //   } else if (this.uniqueIdFromUnAnsweredQuestions.length !== 0) {
    //     this.flagUpdationEvent.emit(this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = 'N');
    //   }
    // }

    findUnAnsweredQuestions() {
        this.totalQuestionCount = 0;
        this.uniqueIdFromUnAnsweredQuestions = [];
        this.questionnaire.questions.forEach((question) => {
             if (question?.SHOW_QUESTION) {
                this.totalQuestionCount++;
                if (question.IS_MANDATORY === 'Y' && !this.getAnswerCount(question.ANSWERS, question)) {
                    this.uniqueIdFromUnAnsweredQuestions.push(question.QUESTION_ID);
                }}
        });
        // this.updateFlagValue();
        this.getTotalAnsweredCount();
    }

    getAnswerCount(answer, question: Question | null = null): boolean {
        if (!answer) {
            return true;
        }
        if (question && question.ANSWER_TYPE === 'Table') {
            return question.IS_ANSWERED;
        } else {
            return Object.values(answer).filter(Boolean).length === 0 ? false : true;
        }
    }

    /**
     * @param  {} currentQuestion
     * finds the child question of the currently answered question
     */
    showChildQuestions(currentQuestion) {
        if (this.IsEnableACTypeChecking) {
            currentQuestion.AC_TYPE = this.setUpdateACType(currentQuestion);
            this.markQuestionnaireAsChanged(true);
        }
        if (currentQuestion.HAS_CONDITION === 'Y') {
            this.conditions = _.filter(this.questionnaire.conditions, {QUESTION_ID: currentQuestion.QUESTION_ID});
            this.conditions.forEach((condition) => {
                this.findChildQuestion(currentQuestion, condition);
            });
        }
        this.findUnAnsweredQuestions();
    }

    updateUnAnsweredQuestions(currentQuestion) {
        if (this.checkForMatchingQuestionId(currentQuestion) && this.getAnswerCount(currentQuestion.ANSWERS)) {
            this.removeFromUnAnsweredList(currentQuestion.QUESTION_ID);
        } else {
            if (currentQuestion.IS_MANDATORY === 'Y' && !this.getAnswerCount(currentQuestion.ANSWERS)) {
                this.uniqueIdFromUnAnsweredQuestions.push(currentQuestion.QUESTION_ID);
            }
        }
        this.getTotalAnsweredCount();
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
     * @param  {} id
     * scrolls to the position of the question as per id passed.
     * For checkbox and radio type answers, it scrolls to the question whereas for text and textarea,
     * it scrolls to the position of question and focus on the field too.
     */
    goToCorrespondingUnAnsweredQuestion(id) {
        this.highlight = id;
        scrollIntoView('ques_' + id);
        const ansID = document.getElementById('ans_' + id);
        this.setFocusToFields(ansID);
    }


    goToUnAnsweredQuestionOnValidation(id) {
        this.highlight = id;
        const SECTION_ID = 'ques_' + id;
        const OFFSET_TOP = document.getElementById('COI-DISCLOSURE-HEADER')?.getBoundingClientRect().height + 100;
        jumpToSection(SECTION_ID, OFFSET_TOP);
        const ansID = document.getElementById('ans_' + id);
        this.setFocusToFields(ansID);
    }

    /**
     * @param  {} answerID
     * focuses on answer fields of type 'text' and 'textarea'.
     */
    setFocusToFields(answerID) {
        if (answerID) {
            setTimeout(() => {
                answerID.focus();
            }, 50);
        }
    }

    /**
     * @param  {} direction
     * changes the position of focus from the current position to the position passed.
     */
    moveToNextUnansweredQuestion(direction) {
        direction === 'RIGHT' ? this.showNextQuestion() : this.showPreviousQuestion();
    }

    /** Navigates the position of unanswered question towards right. */
    showNextQuestion() {
        this.currentIndex = this.currentIndex + 1;
        if (this.currentIndex > this.uniqueIdFromUnAnsweredQuestions.length - 1) {
            this.currentIndex = 0;
        }
        this.goToUnAnsweredQuestionOnValidation(this.uniqueIdFromUnAnsweredQuestions[this.currentIndex]);
    }

    /** Navigates the position of unanswered question towards left. */
    showPreviousQuestion() {
        this.currentIndex = this.currentIndex - 1;
        if (this.currentIndex < 0) {
            this.currentIndex = this.uniqueIdFromUnAnsweredQuestions.length - 1;
        }
        this.goToUnAnsweredQuestionOnValidation(this.uniqueIdFromUnAnsweredQuestions[this.currentIndex]);
    }

    /**
     * @param  {} currentQuestion
     * hides the question if the parents answer changed and update the answer to empty {}
     */
    hideChildQuestion(currentQuestion) {
        const conditions: any = _.filter(this.questionnaire.conditions, {QUESTION_ID: currentQuestion.QUESTION_ID});
        conditions.forEach((condition) => {
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
                // question.ANSWERS = {};
                if (question.HAS_CONDITION === 'Y') {
                    this.hideChildQuestion(question);
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
        const oldDate = this.questionnaire.questions[index].ANSWERS[1];
        let newDate = new Date(this.questionnaire.questions[index].ANSWERS[1]);
        newDate = newDate.getDate() ? this.changeDateFormat(newDate) : oldDate ? oldDate : '';
        this.questionnaire.questions[index].ANSWERS[1] = newDate;
        this.showChildQuestions(question);
        this.updateUnAnsweredQuestions(this.questionnaire.questions[index]);
        if (this.isDataChangedDateField && this.isAutoSaveEnabled) {
            this.isDataChangedDateField = false;
            this.autoSave(question);
        }
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
            if (this.questionnaire.questions[this.attachmentIndex].AC_TYPE == null) {
                this.questionnaire.questions[this.attachmentIndex].AC_TYPE = 'I';
            }
            if (this.questionnaire.questions[this.attachmentIndex].AC_TYPE === 'D') {
                this.questionnaire.questions[this.attachmentIndex].AC_TYPE = 'I';
            }
            this.removeDuplicateFile(this.questionnaire.questions[this.attachmentIndex].QUESTION_ID, null);
            this.questionnaire.questions[this.attachmentIndex].ANSWERS[1] = this.tempFiles[0].fileName;
            this.updateUnAnsweredQuestions(this.questionnaire.questions[this.attachmentIndex]);
            this.filesArray.push(this.tempFiles[0]);
            this.tempFiles = [];
            this.markQuestionnaireAsChanged(true);
            if (this.isAutoSaveEnabled) {
                this.addToQuestionsQueue(this.questionnaire.questions[this.attachmentIndex]);
            }
        }
    }

    /**
     * @param  {} questionId
     * removes duplicate entry for files
     */
    removeDuplicateFile(questionId, index) {
        if (this.filesArray.length > 0) {
            _.remove(this.filesArray, {questionId: questionId});
        }
        if (index !== null) {
            this.uploadedFile = [];
            this.questionnaire.questions[index].ANSWERS[1] = '';
            this.questionnaire.questions[index].AC_TYPE = 'D';
            this.updateUnAnsweredQuestions(this.questionnaire.questions[index]);
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
    prepareUnsavedRows(allAnswers: TableAnswer[], headersLength: number, spliceIndices: number[]): void {
        allAnswers.forEach((answer: TableAnswer, index: number) => {
            if (!answer.isAnswered) {
                if (answer.QUEST_TABLE_ANSWER_ID === null) {
                    spliceIndices.push(index);
                } else {
                    answer.AC_TYPE = 'D';
                }
            }
        });
    }

    prepareQNR(): void {
        this.questionnaire.questions.forEach((question: Question, i) => {
            this.deleteUnAnsweredTableRows(question);
            this.filterAnsweredExplanation(question, i);
        });
    }

    private deleteUnAnsweredTableRows(question: Question) {
        const allAnswers = question.ANSWERS['1'] || [];
        if (question.ANSWER_TYPE === 'Table' && allAnswers.length) {
            const spliceIndices = [];
            const headersLength = question.HEADERS.length;
            this.prepareUnsavedRows(allAnswers, headersLength, spliceIndices);
            this.removeUnsavedRows(spliceIndices, allAnswers);
            this.addOrderNumber(question);
        }
    }

    saveQuestionnaire() {
        if (!this.externalSaveEvent) {
            this.addAnimationToDockBox();
        }
        this.prepareQNR();
        this.result.questionnaireCompleteFlag = this.checkQuestionnaireCompletion();
        /* isSaving flag is used for  avoiding mutiple service call. */
        if (this.isSaving === false) {
            this.isSaving = true;
            if (!this._commonService.isWafEnabled) {
                this.$subscriptions.push(
                    this._questionnaireService.saveQuestionnaire(this.result, this.filesArray).subscribe(
                        (data: any) => {
                            this.saveActions(data);
                            if (this.isUserTriggerValidation) { this.validateMandatoryQuestions(); }
                        },
                        (err) => {
                            this.result = err.error;
                            if (this.result && this.result.questionnaire) {
                                this.questionnaire = this.result.questionnaire;
                            }
                            this.isSaving = false;
                            this.questionnaireSaveEvent.emit({status: 'ERROR', data: this.questionnaireDetails});
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in saving questionnaire. Please try again.');
                        },
                        () => {
                        }
                    )
                );
            }
        }
    }

    //  This function filters explanations that exist for answers only
    private filterAnsweredExplanation(question: any, i: number): void {
        if (['Radio', 'Y/N/NA', 'Y/N', 'Checkbox'].includes(question.ANSWER_TYPE) && Object.keys(question.EXPLANATION).length > 0) {
            const options = this.result.questionnaire.options.filter((opt) => opt.REQUIRE_EXPLANATION == 'Y'
                && opt.QUESTION_ID == question.QUESTION_ID);
            for (const key in question.EXPLANATION) {
                if (question.ANSWER_TYPE === 'Checkbox' && !question.ANSWERS[key]) {
                    delete question.EXPLANATION[key];
                } else if (question.ANSWER_TYPE !== 'Checkbox' && !options.find(opt => opt.OPTION_LABEL == question.ANSWERS[1])) {
                    delete question.EXPLANATION[1];
                }
            }
        }
    }

    /** if attachment is uploaded, sets parameters and calls saveAttachment function in wafAttachmentService.
     * Otherwise calls saveWafRequest function in wafAttachmentService.
     */
    /**
     * @param  {} data
     * if data doesn't contains error, questionnaire gets saved, otherwise shows error.
     */
    checkSavedOrNot(data) {
        if (data && !data.error) {
            this.saveActions(data);
            this.uploadedFile = [];
        } else {
            this.questionnaireSaveEvent.emit({status: 'ERROR', data: this.questionnaireDetails});
            this.isSaving = false;
        }
    }

    /**
     * @param  {} data
     * actions to perform in common for both waf enabled or disabled services after getting response data
     */
    saveActions(data) {
        this.result = data;
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
            this.result.hasOwnProperty('questionnaireAnswerHeaderId') &&
            this.result.questionnaireAnswerHeaderId != null
        ) {
            this.requestObject.questionnaireAnswerHeaderId = this.result.questionnaireAnswerHeaderId;
            this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID = this.result.questionnaireAnswerHeaderId;
            this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = this.result.questionnaireCompleteFlag;
            this.questionnaireDetails.TRIGGER_POST_EVALUATION = this.result.header.TRIGGER_POST_EVALUATION;
            this.questionnaireDetails.ANS_UPDATE_TIMESTAMP = this.result.header.ANS_UPDATE_TIMESTAMP;
            if (this.result.asyncData === 'Y') {
                this.prepareQuestionaire()
                this.highlight = this.questionnaire.questions[0].QUESTION_ID;
                this.findUnAnsweredQuestions();
                this._commonService.showToast(HTTP_ERROR_STATUS,
                    'This questionnaire already has saved responses. If you proceed, your new answers will overwrite the current ones. Please review the existing responses before continuing.', 15000);
                this.questionnaireSaveEvent.emit({status: 'UPDATE', data: this.questionnaireDetails});
            } else {
                this.questionnaireSaveEvent.emit({status: 'SUCCESS', data: this.questionnaireDetails});
            }
        }
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire saved successfully.');
    }

    /**checks whether the questionnaire is complete and sets the flag */
    checkQuestionnaireCompletion() {
         if (this.questionnaireDetails.IS_MANDATORY === 'Y') {
            return this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = !this.uniqueIdFromUnAnsweredQuestions.length ? 'Y' : 'N';
        } else {
            const QUESTIONS = this.questionnaire.questions.filter(quest => quest?.SHOW_QUESTION);
            return this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = QUESTIONS.every(ele => this.getAnswerCount(ele.ANSWERS, ele)) ? 'Y' : 'N';
        }
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
            this._questionnaireService.downloadAttachment(attachmentId, this.moduleDetails.moduleItemCode).subscribe(
                (data: any) => {
                    const a = document.createElement('a');
                    const blob = new Blob([data], {type: data.type});
                    a.href = URL.createObjectURL(blob);
                    a.download = attachmentName;
                    a.id = 'attachment';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }, error => console.log('Error downloading the file.', error)));
    }

    onSearchSelectEvent(event: any, question: any): void {
        if (event) {
            question.ANSWERS[1] = event[question.LOOKUP_NAME];
            question.ANSWER_LOOKUP_CODE = event[this.searchObjectMapping[question.LOOKUP_TYPE]]
                ? event[this.searchObjectMapping[question.LOOKUP_TYPE]] : null;
            this.showChildQuestions(question);
            this.autoSave(question);
        } else {
            // To check if there is a change in data and whether to save it
            let isChangeInData = false;
            if (question.ANSWER_LOOKUP_CODE) {
                isChangeInData = true;
            }
            this.clearValues(question);
            this.showChildQuestions(question);
            if (isChangeInData) {
                this.autoSave(question);
            }
        }
    }

    clearValues(question: any): void {
        question.ANSWERS[1] = '';
        this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = '';
        question.ANSWER_LOOKUP_CODE = null;
    }

    markQuestionnaireAsChanged(status: boolean): void {
        if (this.isAutoSaveEnabled || this.questionnaireDetails.isChanged !== status) {
            this.questionnaireDetails.isChanged = status;
            this.questionnaireEditEvent.emit(status);
        }
    }

    private checkBusinessRule(ruleId, question): any {
        const REQUEST_OBJECT = {
            'moduleItemCode': this.questionnaireDetails.MODULE_ITEM_CODE,
            'moduleItemKey': this.moduleDetails.moduleItemKey,
            'ruleId': ruleId,
            'moduleSubItemCode': this.questionnaireDetails.MODULE_SUB_ITEM_CODE,
            'moduleSubItemKey': this.moduleDetails.moduleSubItemKey
        };
        this.$subscriptions.push(this._questionnaireService.evaluateBusinessRule(REQUEST_OBJECT)
            .subscribe((data: any) => {
                question.SHOW_QUESTION = data.rulePassed;
                this.findUnAnsweredQuestions();
            }));
    }

    checkExplanationRequired(option: any, question: any): void {
        this.isRadioExplanationRequired[option.QUESTION_ID] = option.REQUIRE_EXPLANATION == 'Y';
        if (question.EXPLANATION[1]) {
            question.EXPLANATION[1] = '';
        }
    }

    /**
     * Function to set the JSON data of questionnaire for autosave
     */
    private setQuestionnaireData(questionAnswerData: AutoSaveRequestQuestionnaireData): void {
        const {
            questionnaireId,
            moduleItemKey,
            moduleSubItemKey,
            moduleItemCode,
            moduleSubItemCode,
            header
        } = this.result;
        this.questionnaireRequestData = {
            questionnaireId,
            moduleItemKey,
            moduleSubItemKey,
            moduleItemCode,
            moduleSubItemCode,
            header,
            questionnaireCompleteFlag: this.checkQuestionnaireCompletion(),
            questionnaireAnswerHeaderId: this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID || null,
            questionnaire: questionAnswerData,
        };
    }

    /**
     * Function to set the JSON data of questions in the questionnaire for autosave
     */
    private setQuestionData(question: Question): QuestionRequestObject {
        const data = new QuestionRequestObject();
        const fields = ['QUESTION_ID', 'AC_TYPE', 'ANSWERS', 'ANSWER_TYPE', 'NO_OF_ANSWERS', 'ANSWER_LOOKUP_CODE', 'EXPLANATION'];
        fields.forEach((field: string) => data[field] = question[field]);
        if (question.ANSWER_TYPE === 'Table') {
            this.addOrderNumber(question);
        }
        this.filterAnsweredExplanation(data, null);
        return data;
    }

    /**
     * Function for initiating autosave
     * - only works if isAutoSaveEnabled is true
     * - debounce: For text fields if there is a change from previous value
     * then the API call will be triggered only after 500ms
     * - questions to be saved will be added to the queue
     */
    public autoSave(question: Question, debounce = false): void {
        if (!this.isAutoSaveEnabled || this.isViewMode) {
            return;
        }

        if (debounce && this.isDataChanged) {
            this.$questionSubject.next(question);
        } else if (!debounce) {
            this.addToQuestionsQueue(question);
        }
    }

    /**
     * Function for setting subscription to a subject variable that emits observable on data change in text fields
     * - questions to be saved will be added to the queue
     * - has a debounce time of 500ms before pushing into the queue
     * - answers of question type 'Table' will be pushed into another queue
     */
    private setupQuestionDebounce(): void {
        this.$subscriptions.push(
            this.$questionSubject.pipe(
                debounceTime(500)
            ).subscribe((question: Question) => {
                if (question.ANSWER_TYPE === 'Table') {
                    this.addToTableQuestionsQueue(question);
                } else {
                    this.addToQuestionsQueue(question);
                }
            })
        );
    }

    /**
     * Function for adding questions of type table to the queue
     * - add the question to the queue only if it's not already present
     * - The queue will be processed only if there is no current queue being processed
     * the queue for other question types is not active, or this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID has a value
     */
    private addToTableQuestionsQueue(question: Question): void {
        const questionExists = this.autoSaveTableQuestionsQueue.some((q: Question) => q.QUESTION_ID === question.QUESTION_ID);

        if (!questionExists) {
            this.autoSaveTableQuestionsQueue.push(question);

            const canProcessQueue = !this.isProcessingTableQuestionsQueue &&
                (this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID || !this.isProcessingQuestionsQueue);

            if (canProcessQueue) {
                this.processTableQuestionsQueue();
            }
        }
    }

    /**
     * Function for adding questions of  all type except table to the queue
     * - add the question to the queue only if it's not already present
     * - The queue will be processed only if there is no current queue being processed
     * or this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID has a value
     */
    private addToQuestionsQueue(question: Question): void {
        const questionExists = this.autoSaveQuestionsQueue.some((q: Question) => q.QUESTION_ID === question.QUESTION_ID);

        if (!questionExists) {
            this.autoSaveQuestionsQueue.push(question);

            const canProcessQueue = !this.isProcessingQuestionsQueue;

            if (canProcessQueue) {
                this.processQuestionsQueue();
            }
        }
    }

    /**
     * Function to create a questionnaire data based on the required format
     */
    private createQuestionnaire(questionToSave: Question): {
        questions: QuestionRequestObject[],
        options: OptionRequestObject[]
    } {
        const options = this.result.questionnaire.options
            .filter((option: HEADER) => option.QUESTION_ID === questionToSave.QUESTION_ID)
            .map((option: HEADER) => ({
                QUESTION_ID: option.QUESTION_ID,
                OPTION_LABEL: option.OPTION_LABEL,
            }));

        return {
            questions: [this.setQuestionData(questionToSave)],
            options
        };
    }

    /**
     * Function to create a batch of questionnaire data based on the required format
     */
    private createQuestionnaireBatch(questionsToSave: QuestionRequestObject[], questionsIdsToSave: number[])
        : { questions: QuestionRequestObject[], options: OptionRequestObject[] } {
        const options = this.result.questionnaire.options
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

    /**
     * Function for processing the queue of questions of type table
     * - first question from the queue is taken and converted to the required format and sent to autosave API
     * - questions of type table follows a queuing approach until the queue is empty
     */
    private processTableQuestionsQueue(): void {
        if (!this.autoSaveTableQuestionsQueue.length) {
            this.isProcessingTableQuestionsQueue = false;
            return;
        }

        this.isProcessingTableQuestionsQueue = true;
        this.checkIfPendingAPIs();

        const questionToSave = this.autoSaveTableQuestionsQueue.shift();
        const questionnaire = this.createQuestionnaire(questionToSave);

        this.autoSaveNonAttachmentType(questionnaire);
    }

    /**
     * Function for processing the queue of questions of all type except table
     * - follows a mix of queuing and batching approach
     * - queiuing approach is followed until 'this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID' has a value
     * - After 'this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID' gets a value
     * rest of the questions in the queue will be sent as a single batch
     */
    private processQuestionsQueue(): void {
        if (!this.autoSaveQuestionsQueue.length) {
            this.isProcessingQuestionsQueue = false;
            return;
        }

        this.isProcessingQuestionsQueue = true;
        this.checkIfPendingAPIs();

        if (this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID) {
            this.processBatchQuestions();
        } else {
            this.processSingleQuestion();
        }
    }

    /**
     * Function for processing a batch of questions
     * - questions of type attachment has a separate API
     * - batch of questions is taken and converted to the required format and sent to autosave API
     */
    private processBatchQuestions(): void {
        const questionsToSave = [];
        const questionsIdsToSave = [];

        while (this.autoSaveQuestionsQueue.length > 0) {
            const questionToSave = this.autoSaveQuestionsQueue.shift();
            if (!this.whetherCustomFieldInAPIQueue[questionToSave.QUESTION_ID]) {
                this.whetherCustomFieldInAPIQueue[questionToSave.QUESTION_ID] = true;
                if (questionToSave.ANSWER_TYPE === 'Attachment') {
                    this.autoSaveAttachmentType(questionToSave);
                } else {
                    questionsIdsToSave.push(questionToSave.QUESTION_ID);
                    questionsToSave.push(this.setQuestionData(questionToSave));
                }
            } else {
                this.autoSaveQuestionsQueue.unshift(questionToSave);
            }
        }

        if (questionsToSave.length > 0) {
            const questionnaireBatch = this.createQuestionnaireBatch(questionsToSave, questionsIdsToSave);
            this.autoSaveNonAttachmentType(questionnaireBatch);
        }
    }

    /**
     * Function for processing a single question
     * - questions of type attachment has a separate API
     * - question is taken and converted to the required format and sent to autosave API
     */
    private processSingleQuestion(): void {
        const questionToSave = this.autoSaveQuestionsQueue.shift();
        if (questionToSave.ANSWER_TYPE === 'Attachment') {
            this.autoSaveAttachmentType(questionToSave);
        } else {
            const questionnaire = this.createQuestionnaire(questionToSave);
            this.autoSaveNonAttachmentType(questionnaire);
        }
    }

    /**
     * Function for autosaving all types of question except attachment
     * - questions in the queue and its associated options are taken and passed to API
     */
    autoSaveNonAttachmentType(questionnaire: AutoSaveRequestQuestionnaireData) {
        this.setQuestionnaireData(questionnaire);
        this._commonService.isPreventDefaultLoader = true;

        this.$subscriptions.push(
            this._questionnaireService.autoSaveQuestionnaire(this.questionnaireRequestData).subscribe(
                (res: AutoSaveResponse) => this.handleAutoSaveResponse(res),
                () => this.handleError()
            )
        );
    }

    /**
     * Function for autosaving attachment files
     * - The questions to be saved and its associated options are taken and added as form data key
     * - File to be saved is added as form data key
     */
    private autoSaveAttachmentType(data: Question): void {
        const questionnaire = {
            questions: [this.setQuestionData(data)],
            options: [],
        };
        this.setQuestionnaireData(questionnaire);

        const fileItem = this.filesArray.find((file: AttachmentData) => file.questionId === data.QUESTION_ID);
        const formData = new FormData();
        if (fileItem) {
            formData.append(fileItem.questionId, fileItem.attachment, fileItem.attachment.name);
        }
        formData.append('formDataJson', JSON.stringify(this.questionnaireRequestData));

        this._commonService.isPreventDefaultLoader = true;
        this.$subscriptions.push(
            this._questionnaireService.autoSaveQuestionnaireAttachment(formData).subscribe(
                (res: AutoSaveResponse) => {
                    this.handleAutoSaveResponse(res);
                },
                () => this.handleError()
            )
        );
    }

    /**
     * Function to handle autosave API response
     * - if the response and current questionnaire selected id does not match we do not perform any below operations
     */
    private handleAutoSaveResponse(res: AutoSaveResponse) {
        if (res.questionnaireId !== this.questionnaireDetails.QUESTIONNAIRE_ID) {
            return;
        }

        this._commonService.isPreventDefaultLoader = false;
        this.updateQuestionnaireDetails(res);

        if (res.asyncData === 'Y') {
            this.handleAsyncData(res);
        } else {
            this.updateQuestions(res);
            this.questionnaireSaveEvent.emit({status: 'SUCCESS', data: this.questionnaireDetails});
            this.processQuestionsQueue();
            this.processTableQuestionsQueue();
        }
        if (this.isUserTriggerValidation) { this.validateMandatoryQuestions(); }
        this.checkIfPendingAPIs();
        if (!this.hasPendingAPIs) {
            this._commonService.hideAutoSaveSpinner('SUCCESS');
        }
    }

    /**
     * Function to update the questionnaire details based on the API response
     */
    private updateQuestionnaireDetails(res: AutoSaveResponse) {
        this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID = res.questionnaireAnswerHeaderId;
        this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG = res.questionnaireCompleteFlag;
        this.questionnaireDetails.TRIGGER_POST_EVALUATION = res.header.TRIGGER_POST_EVALUATION;
        this.questionnaireDetails.ANS_UPDATE_TIMESTAMP = res.header.ANS_UPDATE_TIMESTAMP;
        this.result.questionnaireAnswerHeaderId = res.questionnaireAnswerHeaderId;
        this.result.header = res.header;
    }

    /**
     * Function to handle asynchronous data
     * - A toast message will be shown to the user to let him know the case
     * - The answers will be taken from the API response and be filled automatically
     */
    private handleAsyncData(res: AutoSaveResponse) {
        this.saveActions(res);
        this._commonService.showToast(
            HTTP_ERROR_STATUS,
            'This questionnaire already has saved responses. If you proceed, your new answers will overwrite the current ones. Please review the existing responses before continuing.',
            15000
        );
        this.questionnaireSaveEvent.emit({status: 'UPDATE', data: this.questionnaireDetails});
        this.whetherCustomFieldInAPIQueue = {};
        this.clearAutoSaveQueues();
    }

    /**
     * Function to update question details based on the API response
     * - AC_TYPE will be updated based on the API response
     */
    private updateQuestions(res: AutoSaveResponse) {
        const questionIndexMap = new Map<number, number>();

        // Create a map of QUESTION_ID to index
        this.questionnaire.questions.forEach((qn: Question, index: number) => {
            questionIndexMap.set(qn.QUESTION_ID, index);
        });

        // Update questions based on response
        res.questionnaire.questions.forEach((questionFromRes: Question) => {
            const index = questionIndexMap.get(questionFromRes.QUESTION_ID);
            if (index !== undefined) {
                this.questionnaire.questions[index].AC_TYPE = questionFromRes.AC_TYPE;
                this.whetherCustomFieldInAPIQueue[questionFromRes.QUESTION_ID] = false;

                if (questionFromRes.ANSWER_TYPE === 'Table') {
                    this.updateTableAnswers(this.questionnaire.questions[index], questionFromRes, index);
                }
            }
        });
    }

    /**
     * Function to update questions of type table
     */
    private updateTableAnswers(currentQuestion: Question, questionFromRes: Question, index: number) {
        const existingAnswers = currentQuestion.ANSWERS[1];
        const newAnswers = questionFromRes.ANSWERS[1];

        const answersToRemove = this.getAnswersToRemove(existingAnswers, newAnswers);

        if (answersToRemove) {
            this.questionnaire.questions[index].ANSWERS[1] = newAnswers;
        } else {
            this.updateQuestTableAnswerIds(currentQuestion, newAnswers);
            this.updateAcTypes(currentQuestion, questionFromRes);
        }
    }

    /**
     * Function to check if there are any rows to delete from the table
     */
    private getAnswersToRemove(existingAnswers: TableAnswer[], newAnswers: TableAnswer[]): boolean {
        const newAnswersIds = new Set(newAnswers.map(item => item.QUEST_TABLE_ANSWER_ID));
        return existingAnswers.some((item: TableAnswer) =>
            item.AC_TYPE === 'D' && !newAnswersIds.has(item.QUEST_TABLE_ANSWER_ID)
        );
    }

    /**
     * Function to assign the generated id for answered row based on the API response
     */
    private updateQuestTableAnswerIds(currentQuestion: Question, newAnswers: TableAnswer[]) {
        newAnswers.forEach((newAnswer: TableAnswer, rowIndex: number) => {
            currentQuestion.ANSWERS[1][rowIndex].QUEST_TABLE_ANSWER_ID = newAnswer.QUEST_TABLE_ANSWER_ID;
        });
    }

    /**
     * Function to update the AC_TYPE of each rows if they are in the autosave queue
     */
    private updateAcTypes(currentQuestion: Question, questionFromRes: Question) {
        const isQuestionInQueue = this.autoSaveTableQuestionsQueue.some(
            (item: Question) => item.QUESTION_ID === questionFromRes.QUESTION_ID);

        currentQuestion.ANSWERS[1].forEach((answer: TableAnswer) => {
            if (!isQuestionInQueue) {
                answer.AC_TYPE = null;
            } else {
                answer.AC_TYPE = answer.QUEST_TABLE_ANSWER_ID !== null
                    ? (answer.AC_TYPE === 'I' ? 'U' : answer.AC_TYPE)
                    : (answer.AC_TYPE === 'I' ? 'I' : null);
            }
        });
    }

    /**
     * Function to handle error condition if any of the autosave APIs fail
     * - Error toast will be shown to the user
     */
    private handleError() {
        this._commonService.isPreventDefaultLoader = false;
        this.questionnaireSaveEvent.emit({status: 'ERROR', data: this.questionnaireDetails});
        this._commonService.hideAutoSaveSpinner('SUCCESS');// need to use 'ERROR' after implementing retry feature.
        this.whetherCustomFieldInAPIQueue = {};
        this.clearAutoSaveQueues();
    }

    /**
     * Function to clear all autosave queues
     */
    private clearAutoSaveQueues() {
        this.autoSaveQuestionsQueue = [];
        this.autoSaveTableQuestionsQueue = [];
        this.isProcessingQuestionsQueue = false;
        this.isProcessingTableQuestionsQueue = false;
        this.hasPendingAPIs = false;
        this.isAPIRequestPending.emit(this.hasPendingAPIs);
    }

    /**
     * Function to check if there is any pending APIs of autosave
     */
    private checkIfPendingAPIs(): void {
        this.hasPendingAPIs = this.isProcessingQuestionsQueue || this.isProcessingTableQuestionsQueue;
        this.isAPIRequestPending.emit(this.hasPendingAPIs);
    }

    /**
     * Function to delete the attachment file
     * - If autosave is enabled we show a warning model when we try to delete an attachment
     */
    public deleteAttachment(question: Question, indexQuestion: number): void {
        if (this.isAutoSaveEnabled) {
            $('#deleteAttachmentModal').modal('show');
            $('#attach-delete-attach-del-btn')
                .off('click')
                .on('click', () => {
                    this.markQuestionnaireAsChanged(true);
                    this.removeDuplicateFile(question.QUESTION_ID, indexQuestion);
                    this.addToQuestionsQueue(question);
                    $('#deleteAttachmentModal').modal('hide');
                });
        } else {
            this.markQuestionnaireAsChanged(true);
            this.removeDuplicateFile(question.QUESTION_ID, indexQuestion);
        }
    }

    /**
     * Function to update flag that indicates whether there is a change in date field
     * - data will be of type Moment
     */
    public updateDateChangeFlag(data: any, oldDate: string): void {
        const newDate = this.changeDateFormat(new Date(data));
        this.isDataChangedDateField = oldDate !== newDate;
    }

    /**
     * Function to check if there is a change in previous value and the new value
     * - Updates the ng model data
     */
    public storePreviousValueAndUpdate(data: any, key: string | number, newValue: string): void {
        this.isDataChanged = data[key]?.trim() !== newValue.trim();
        data[key] = newValue.trim();
    }

    /**
     * Function to track the answers by index for TABLE type question
     */
    public answerIndex(index: number): number {
        return index;
    }


    validateMandatory() {
        if (this.questionnaire.questions.length > 0) {
            const question = this.firstUnAnsweredQuestion(this.questionnaire.questions);
            if (question) {
                this.currentIndex = 0;
                setTimeout(() => {
                    this.goToUnAnsweredQuestionOnValidation(question.QUESTION_ID);
                }, 500);
            }
        }
    }

    firstUnAnsweredQuestion(questions: any[]): any {
        return questions.find((question: any) => question.SHOW_QUESTION === true && !this.getAnswerCount(question.ANSWERS, question));
    }

    addAnimationToDockBox() {
        this.isSaveClicked = true;
        this.animateBox();
    }

    animateBox() {
        if (this.dockBoxIcon) {
            this.dockBoxIcon.nativeElement.classList.remove('wobble');
            this.dockBoxIcon.nativeElement.parentElement.parentElement.classList.remove('pulse');
        }

        setTimeout(() => {
            if (this.dockBoxIcon && this.isSaveClicked && this.uniqueIdFromUnAnsweredQuestions.length > 0) {
                this.dockBoxIcon.nativeElement.classList.add('wobble');
                this.dockBoxIcon.nativeElement.parentElement.parentElement.classList.add('pulse');
            }
        }, 10);
    }

    /**---------------------------------------------------question validation functionality starting--------------------------------------------------- 
     * Author - Mohamed Fazil
    */

    /**
    * Validates all mandatory questions in the questionnaire.
    * - Ensures that each visible mandatory question have answer.
    * - Triggers focus/highlight on the first invalid question (if any).
    *
    * @returns true if there are validation errors (missing answers), false otherwise.
    */
    validateMandatoryQuestions(): boolean {
        this.isUserTriggerValidation = true;
        this.questionValidationMap.clear();
        this.questionnaire.questions.forEach(question => {
            if (question?.SHOW_QUESTION && question?.IS_MANDATORY === 'Y' && !this.getAnswerCount(question.ANSWERS, question)) {
                this.questionValidationMap.set(`validateQuestion-${question.QUESTION_ID}`, question.QUESTION_ID);
            }
        });
        if (this.questionValidationMap.size) this.setFocusElement();
        return this.questionValidationMap.size > 0;
    }

   /**
   * Scrolls into view and highlights the first invalid mandatory question.
   */
    private setFocusElement() {
        const ID = this.questionValidationMap.values().next().value;
        if (ID && this.questionValidationMap.size) {
            setTimeout(() => {
                this.goToCorrespondingUnAnsweredQuestion(ID);
            });
        }
    }

    /**
    * Determines whether to show the info card on questionnaire can skip.
    * - Info card is shown when the questionnaire is *not* mandatory,
    *   but it contains individual mandatory questions.
    */
    showInfoCard(): boolean {
        return this.questionnaireDetails?.IS_MANDATORY === 'N' && this.questionnaire.questions?.some(quest => quest?.SHOW_QUESTION && quest?.IS_MANDATORY === 'Y');
    }

    private getTotalAnsweredCount() {
        this.showSkipMandatoryInfo = this.showInfoCard();
        this.totalAnsweredQuestions = this.questionnaire.questions.filter(quest => quest?.SHOW_QUESTION && this.getAnswerCount(quest.ANSWERS, quest))?.length;
    }

    /**---------------------------------------------------question validation functionality ending--------------------------------------------------- */

}
