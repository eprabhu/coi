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
 import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
 import * as _ from 'lodash';
 import { QuestionnaireService } from './questionnaire.service';
 import { setFocusToElement, scrollIntoView } from '../../common/utilities/custom-utilities';
 import { CommonService } from '../../common/services/common.service';
 import { Subscription, Observable} from 'rxjs';
 import { subscriptionHandler } from '../../common/utilities/subscription-handler';
 import { WafAttachmentService } from '../../common/services/waf-attachment.service';
 import { ElasticConfigService } from '../../common/services/elastic-config.service';
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
     getEndPointOptionsForSponsor,
 } from '../../common/services/end-point.config';
 import { easeIn } from '../../common/utilities/animations';
 import { compareDatesWithoutTimeZone } from '../../common/utilities/date-utilities';
 import { Question, TableAnswer } from './questionnaire.interface';
 @Component({
     selector: 'app-view-questionnaire',
     templateUrl: './view-questionnaire.component.html',
     styleUrls: ['./view-questionnaire.component.css'],
     animations: [easeIn],
     providers: [QuestionnaireService, WafAttachmentService],
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
     // @Output() flagUpdationEvent = new EventEmitter<any>();

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
         'claimTemplateName' : 'claimTemplateCode'
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

     constructor(
         private _questionnaireService: QuestionnaireService,
         public _commonService: CommonService,
         private _wafAttachmentService: WafAttachmentService,
         private _elasticConfig: ElasticConfigService,
         private _CDRef: ChangeDetectorRef
     ) { }

     ngOnInit() {
         this.autoSaveEvent();
     }
     /**
     * this Event subscribes to the auto save trigger generated on save click on top basically
     * what happens is when a save click happen this will let this component know when
     * user click the general save button.
     */
     autoSaveEvent() {
         if (this.externalSaveEvent) {
            this.$subscriptions.push(this.externalSaveEvent.subscribe(_event =>
                !this.isViewMode && this.questionnaireDetails.isChanged && this.saveQuestionnaire()
            ));
         }
     }

     ngOnDestroy() {
         subscriptionHandler(this.$subscriptions);
     }

     ngOnChanges() {
         this.requestObject.questionnaireId = this.questionnaireDetails.QUESTIONNAIRE_ID;
         this.requestObject.questionnaireAnswerHeaderId = this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID || '';
         this.requestObject.newQuestionnaireId = (!this.isViewMode && this.questionnaireDetails.NEW_QUESTIONNAIRE_ID) || '';
         if (this.requestObject.questionnaireId) {
             this.IsEnableACTypeChecking = false;
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
                 this.questionnaire.questions.forEach((question: Question) => {
                     this.setDataForSearchAnswerTypes(question);
                     this.showChildQuestions(question);
                     this.ifQuestionTypeTablePrepareData(question);
                     this.ifQuestionTypeTablePrepareData(question);
                     if (question.RULE_ID && question.GROUP_NAME === 'G0') {
                        this.checkBusinessRule(question.RULE_ID, question);
                     }
                 });
                 if (this.requestObject.newQuestionnaireId) {
                     this.emitCopiedQuestionnaireDetails();
                 }
                 this.highlight = this.questionnaire.questions[0].QUESTION_ID;
                 this.findUnAnsweredQuestions();
                 this.IsEnableACTypeChecking = true;
                 this.showHelpMsg = [];
                 this._CDRef.markForCheck();
             })
         );
     }

     emitCopiedQuestionnaireDetails() {
         this.questionnaireDetails.QUESTIONNAIRE_ID = this.result.questionnaireId;
         this.questionnaireDetails.QUESTIONNAIRE_ANS_HEADER_ID = this.result.questionnaireAnswerHeaderId;
         this.questionnaireDetails.NEW_QUESTIONNAIRE_ID = this.result.newQuestionnaireId;
         this.questionnaireSaveEvent.emit({ status: 'SUCCESS', data: this.questionnaireDetails });
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
             const textarea =  document.getElementById('answer' + questionId + answerIndex + headerIndex);
             if (textarea) { textarea.focus(); }
         }
    }

    addNewAnswerRow(question: Question): void {
        question.ANSWERS['1'].push(new TableAnswer());
        this.addOrderNumber(question);
    }

    addOrderNumber(question: Question): void {
        let visibleAnswers = 0;
        question.ANSWERS['1'].forEach((answer: TableAnswer) => {
            if (answer.AC_TYPE !== 'D') {
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

     deleteAnswer(question: Question, answer: TableAnswer, answerIndex: number): void {
        if (answer.QUEST_TABLE_ANSWER_ID === null) {
            question.ANSWERS['1'].splice(answerIndex, 1);
            this.addOrderNumber(question);
            this.setIsAnsweredFlag(question);
            this.findUnAnsweredQuestions();
        } else {
            answer.AC_TYPE = 'D';
            this.setAddRow(question);
            this.updateUnansweredCountForTableType(answer, question);
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
        if (answerRow.AC_TYPE === 'D') { return false; }
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
             question.ANSWERS = { ...temp };
             this.showChildQuestions(question);
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
            case 'grantcall_elastic':                question.placeHolder =
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
                question.placeHolder =  'Search for sponsor';
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
         this.uniqueIdFromUnAnsweredQuestions = [];
         this.questionnaire.questions.forEach((question) => {
             if (question.SHOW_QUESTION === true && !this.getAnswerCount(question.ANSWERS, question)) {
                 this.uniqueIdFromUnAnsweredQuestions.push(question.QUESTION_ID);
             }
         });
         // this.updateFlagValue();
     }

     getAnswerCount(answer, question: Question | null = null): boolean {
         if (!answer) { return true; }
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
             this.conditions = _.filter(this.questionnaire.conditions, { QUESTION_ID: currentQuestion.QUESTION_ID });
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
         this.goToCorrespondingUnAnsweredQuestion(this.uniqueIdFromUnAnsweredQuestions[this.currentIndex]);
     }

     /** Navigates the position of unanswered question towards left. */
     showPreviousQuestion() {
         this.currentIndex = this.currentIndex - 1;
         if (this.currentIndex < 0) {
             this.currentIndex = this.uniqueIdFromUnAnsweredQuestions.length - 1;
         }
         this.goToCorrespondingUnAnsweredQuestion(this.uniqueIdFromUnAnsweredQuestions[this.currentIndex]);
     }

     /**
      * @param  {} currentQuestion
      * hides the question if the parents answer changed and update the answer to empty {}
      */
     hideChildQuestion(currentQuestion) {
         const conditions: any = _.filter(this.questionnaire.conditions, { QUESTION_ID: currentQuestion.QUESTION_ID });
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
         }
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

     deleteUnAnsweredTableRows(): void {
         this.questionnaire.questions.forEach((question: Question) => {
             const allAnswers = question.ANSWERS['1'] || [];
             if (question.ANSWER_TYPE === 'Table' && allAnswers.length) {
                 const spliceIndices = [];
                 const headersLength = question.HEADERS.length;
                 this.prepareUnsavedRows(allAnswers, headersLength, spliceIndices);
                 this.removeUnsavedRows(spliceIndices, allAnswers);
                 this.addOrderNumber(question);
             }
         });
     }

     saveQuestionnaire() {
         this.deleteUnAnsweredTableRows();
         this.result.questionnaireCompleteFlag = this.checkQuestionnaireCompletion();
         /* isSaving flag is used for  avoiding mutiple service call. */
         if (this.isSaving === false) {
             this.isSaving = true;
             if (!this._commonService.isWafEnabled) {
                 this.$subscriptions.push(
                     this._questionnaireService.saveQuestionnaire(this.result, this.filesArray).subscribe(
                         (data: any) => {
                             this.saveActions(data);
                         },
                         (err) => {
                             this.result = err.error;
                             this.questionnaire = this.result.questionnaire;
                             this.isSaving = false;
                             this.questionnaireSaveEvent.emit({ status: 'ERROR', data: this.questionnaireDetails });
                         },
                         () => { }
                     )
                 );
             } else {
                 this.saveQuestionnaireWaf();
             }
         }
     }
     /** if attachment is uploaded, sets parameters and calls saveAttachment function in wafAttachmentService.
      * Otherwise calls saveWafRequest function in wafAttachmentService.
      */
     async saveQuestionnaireWaf() {
         this.result.personId = this._commonService.getCurrentUserDetail('personID');
         if (this.uploadedFile.length > 0) {
             const data = await this._wafAttachmentService.saveAttachment(
                 this.result,
                 null,
                 this.uploadedFile,
                 '/saveQuestionnaireForWaf',
                 null,
                 null
             );
             this.checkSavedOrNot(data);
         } else {
             this.result.fileName = null;
             this.result.fileTimestamp = null;
             this.result.remaining = null;
             this.result.length = 0;
             this.result.fileContent = null;
             this.result.contentType = null;
             this._wafAttachmentService
                 .saveWafRequest(this.result, '/saveQuestionnaireForWaf')
                 .then((data) => {
                     this.checkSavedOrNot(data);
                 })
                 .catch((error) => {
                     this.checkSavedOrNot(error);
                 });
         }
     }
     /**
      * @param  {} data
      * if data doesn't contains error, questionnaire gets saved, otherwise shows error.
      */
     checkSavedOrNot(data) {
         if (data && !data.error) {
             this.saveActions(data);
             this.uploadedFile = [];
         } else {
             this.questionnaireSaveEvent.emit({ status: 'ERROR', data: this.questionnaireDetails });
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
             this.questionnaireSaveEvent.emit({ status: 'SUCCESS', data: this.questionnaireDetails });
         }
     }

     /**checks whether the questionnaire is complete and sets the flag */
     checkQuestionnaireCompletion() {
         return (this.questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG =
             this.uniqueIdFromUnAnsweredQuestions.length === 0 ? 'Y' : 'N');
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
                     const a = document.createElement('a');
                     const blob = new Blob([data], { type: data.type });
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
         } else {
             this.clearValues(question);
         }
         this.showChildQuestions(question);
     }

     clearValues(question: any): void {
         question.ANSWERS[1] = '';
         this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = '';
         question.ANSWER_LOOKUP_CODE = null;
     }

     markQuestionnaireAsChanged(status: boolean): void {
         if (this.questionnaireDetails.isChanged !== status) {
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
 }
