import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { compareString } from '../../common/utilities/string-compare';
import { compareArray, compareStringArray } from '../../common/utilities/array-compare';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { compareDatesWithoutTimeZone, getDateStringFromTimeStamp, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
import { QuestionnaireCompareService } from './questionnaire-compare.service';
import { DateFormatPipeWithTimeZone } from './../pipes/custom-date.pipe';

/**
 * Written By Mahesh Sreenath V M
 * this component compares two different Questionnaire base on question number.
 * The data to be compared should be passed as input on a OBservable.
 * the Values must be attached on baseQuestionnaire and currentQuestionnaire respectively;
 * If both values are found then we will compare otherwise we will only show the the answers of base version
 * The data is passed as Observable so we need to subscribe top that event its basically done
 * because of relying on ngOnChanges always. RxJS has much better options and once i learn more i can use
 * pipe and do interesting things with change detection.
 * the work flow is basically on new value update
 * 1. update the show flag value on both questionnaire
 * 2. format the answers to an array.
 * 3. compare the question and answers of both questionnaire.
 */
@Component({
    selector: 'app-questionnaire-compare',
    templateUrl: './questionnaire-compare.component.html',
    styleUrls: ['./questionnaire-compare.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [QuestionnaireCompareService, DateFormatPipeWithTimeZone]
})
export class QuestionnaireCompareComponent implements OnInit, OnDestroy {

    @Input() questionnaireDetails: Observable<any>;
    questionnaire: any = {};
    base: any = {};
    current: any = {};
    comparedQuestionnaire: any = {};
    $subscriptions: Subscription[] = [];
    reviewSectionSubFields = ['COLUMN_1', 'COLUMN_2', 'COLUMN_3', 'COLUMN_4',
        'COLUMN_5', 'COLUMN_6', 'COLUMN_7', 'COLUMN_8', 'COLUMN_9', 'COLUMN_10'];
    headerDetails: any = {};
    questionnaireUpdateDetail = null;
    currentMethod = 'VIEW';

    constructor(private _CDRef: ChangeDetectorRef, private _questionnaireService: QuestionnaireCompareService,
                private _dateFormatPipe: DateFormatPipeWithTimeZone) { }

    ngOnInit() {
        this.getQuestionnaireDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /**updates of the feature - trigger questions based on linked business rule:
     * here we are using async/await to get response of business rule evaluation
     * since we need the SHOW_QUESTION flag before doing comparison we are
     * using async/await.
     * business rule is evaluated for base and current questionnaire
     * we are passing configuration details(module code, subModuleCode, moduleItemKey and subModuleItemKey)
     * from questionnaire-list component.
     * moduleItemKey is passed separately for base and current questionnaire.
     */

    getQuestionnaireDetails() {
        this.$subscriptions.push(this.questionnaireDetails.subscribe(async data => {
            const questionnaireDetail = JSON.parse(JSON.stringify(data));
            this.current = {};
            this.base = {};
            await this.updateQuestionnaireValues(questionnaireDetail);
            this.questionnaireUpdateDetail = this.getQuestionnaireUpdateDetail(questionnaireDetail);
            this.base.questions && this.current.questions ? this.compareQuestionnaires() : this.viewQuestionnaire()
            this._CDRef.detectChanges();
        }));
    }

    viewQuestionnaire() {
        this.currentMethod = 'VIEW';
        this.comparedQuestionnaire = this.base; 
    }

    async updateQuestionnaireValues(questionnaires: any) {
        if (questionnaires.baseQuestionnaire.questions) {
            this.questionnaire = questionnaires.baseQuestionnaire;
            questionnaires.configuration.moduleItemKey = questionnaires.moduleItemKeyList['base'];
            await this.loopQuestionnaire(questionnaires.baseQuestionnaire.questions, questionnaires);
            this.base = this.questionnaire;
        }
        if (questionnaires.currentQuestionnaire.questions) {
            this.questionnaire = questionnaires.currentQuestionnaire;
            questionnaires.configuration.moduleItemKey = questionnaires.moduleItemKeyList['current'];
            await this.loopQuestionnaire(questionnaires.currentQuestionnaire.questions, questionnaires);
            this.current = this.questionnaire;
        }
    }

   async loopQuestionnaire(questions, questionnaires) {
       for (const question of questions) {
            await this.showChildQuestions(question, questionnaires.configuration);
            // tslint:disable-next-line: triple-equals
            if (question.RULE_ID && question.GROUP_NAME == 'G0') {
                question.SHOW_QUESTION =
                                 await this.checkBusinessRule(question.RULE_ID, questionnaires.configuration);
             }
             this.setAnswers(question);
        }
    }

    checkBusinessRule(ruleId, configuration): any {
        const REQUEST_OBJECT = {
           'moduleItemCode': configuration.moduleCode,
           'moduleItemKey': configuration.moduleItemKey,
           'ruleId': ruleId,
           'moduleSubItemCode': configuration.submoduleCode,
           'moduleSubItemKey': configuration.subModuleItemKey
        };
    return new Promise((resolve, reject) => {
       this.$subscriptions.push(this._questionnaireService.evaluateBusinessRule(REQUEST_OBJECT)
       .subscribe((data: any) => {
           resolve(data.rulePassed);
       }));
    });
  }

    private setAnswers(question) {
        question.ANSWERS = this.getAnswers(question.ANSWERS, question.ANSWER_TYPE);
        this.getHeaders(question, question.ANSWER_TYPE);
    }

    /**
     * this function is little complex since  it does the complete comparison logic here.
     * We iterate through the base questionnaire and find if there is a matching question is found on the
     * Current questionnaire - based on question_Number since it will remain same with versioning.
     * First we check if the question should be shown based on showQuestion flag. if the question
     * should not be shown in base but its shown in current then its considered as removed.
     * this happens because questionnaire has child logic and change of answers will end up
     * adding/removing questions that need to be shown. to the above mentioned checking will make sure that
     * Such questions will not misplaced at the end of questionnaire list. Thus solving the issue
     * that child questions might show up in wrong order.
     * The final iteration of current questionnaire list is useless since all shown questions in questionnaire
     * should be finished on base questionnaire list iteration. Since I(mahesh) was not able to logically confirm
     * That scenario will never occur that piece of code is left alone.
     * IT will not create any performance or size impact.
     * status is set to show the entire question crd as green or red
     * -1:removed 1: added 0: on both versions. only the data of Status 0 is compared comparison is same as
     * everywhere else.
     * Dev note: This can be minified with conditional operator.
     * but since this if else ladder helps with readability it is used.
     * TAke feedback from IRB since they have additional questionnaire and remove the last loop if not necessary
     */
    compareQuestionnaires() {
        this.currentMethod = 'COMPARE';
        this.base.questions.forEach(question => {
            const INDEX = this.findInCurrentQuestionnaire(question);
            if (question.SHOW_QUESTION) {
                if (INDEX !== -1) {
                    const currentQuestion = this.current.questions[INDEX].QUESTION;
                    question.QUESTION = compareString(currentQuestion, question.QUESTION);
                    question.ANSWERS = this.compareAnswers(question, INDEX);
                    question.status = 0;
                    this.current.questions.splice(INDEX, 1);
                } else {
                    question.status = 1;
                }
            } else {
                if (INDEX !== -1 && this.current.questions[INDEX].SHOW_QUESTION) {
                    question.status = -1;
                    question.SHOW_QUESTION = true;
                    this.current.questions.splice(INDEX, 1);
                }
            }
        });
        this.current.questions.forEach(question => {
            if (question.SHOW_QUESTION) {
                question.status = -1;
                this.base.questions.push(question);
            }
        });
        this.comparedQuestionnaire = this.base;
    }

    private compareAnswers(question, INDEX) {
        const currentAnswers = this.current.questions[INDEX].ANSWERS || [];
        return question.ANSWER_TYPE === 'Table' ? this.compareTableAnswers(question.ANSWERS, currentAnswers)
            : this.compareSimpleAnswers(question.ANSWERS, currentAnswers);
    }

    private compareTableAnswers(answers, currentAnswers) {
        const CURRENT_ANSWER = JSON.parse(JSON.stringify(currentAnswers));
        answers = compareArray(answers, CURRENT_ANSWER, ['QUESTION_ID'], this.reviewSectionSubFields);
        return answers;
    }

    private compareSimpleAnswers(answers, currentAnswers) {
        return compareStringArray(answers, currentAnswers);
    }

    findInCurrentQuestionnaire(baseQuestion: any) {
        return this.current.questions.findIndex(q => q.QUESTION_NUMBER === baseQuestion.QUESTION_NUMBER);
    }

    private getAnswers(question: any, type: string): Array<any> {
        switch (type) {
            case 'Checkbox': return Object.keys(question).filter(k => k !== '1');
            case 'Table': return question ? question['1'] : [];
            case 'UserLookup': return Object.values(question).filter(Boolean).map((A: any) => A.description);
            case 'SystemLookup': return Object.values(question).filter(Boolean).map((A: any) => A.description);
            default: return Object.values(question).filter(Boolean);
        }
    }

    private getHeaders(question: any, type: string) {
        if (type === 'Table') {
            question.HEADERS = this.questionnaire.options.filter(O => O.QUESTION_ID === question.QUESTION_ID);
        }
    }

    async showChildQuestions(currentQuestion, configuration) {
        if (currentQuestion.HAS_CONDITION === 'Y') {
            const conditions = _.filter(this.questionnaire.conditions, { 'QUESTION_ID': currentQuestion.QUESTION_ID });
            for (const condition of conditions) {
                await this.findChildQuestion(currentQuestion, condition, configuration);
            }
        }
    }
    /**
     * @param  {} currentQuestion
     * @param  {} condition
     * for a given condition and current question looks in all questions and
     * finds its child questions
     * if question group and check answer returns true - set them as visible
     * if question group matches and check answer fails the set them as invisible
     */
    async findChildQuestion(currentQuestion, condition, configuration) {
        for (const question of this.questionnaire.questions) {
            if (condition.GROUP_NAME === question.GROUP_NAME && this.checkAnswer(currentQuestion, condition)) {
                if (question.RULE_ID) {
                    question.SHOW_QUESTION = await this.checkBusinessRule(question.RULE_ID, configuration);
                 } else {
                     question.SHOW_QUESTION = true;
                 }
            }
        }
    }

    /**
     * @param  {} question
     * @param  {} condition
     * for a given condition and  question - returns true
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
            result = this.checkLessThanCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'CONTAINS') {
            result = this.checkContainsCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'NOTEQUALS') {
            result = this.checkNotEqualCondition(question, condition);
        }
        return result;
    }

    /**
     * @param  {} question
     * @param  {} condition
     * return true if the question has a matching answer for the condition value
     */
    checkEqualCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS,  (answer, key) => {
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
            if (parseInt(answer, 10) > parseInt(condition.CONDITION_VALUE, 10)) {
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
    checkLessThanCondition(question, condition) {
        let result = false;
        _.forEach(question.ANSWERS, function (answer, key) {
            if (parseInt(answer, 10) < parseInt(condition.CONDITION_VALUE, 10)) {
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
    getQuestionnaireUpdateDetail(questionnaireDetail) {
        if (questionnaireDetail.currentQuestionnaireHeader.ANS_PERSON_FULL_NAME) {
                return compareString(this.concatLastUpdatedDetailString(questionnaireDetail.currentQuestionnaireHeader),
                    this.concatLastUpdatedDetailString(questionnaireDetail.baseQuestionnaireHeader));
        } else {
            return this.concatLastUpdatedDetailString(questionnaireDetail.baseQuestionnaireHeader);
        }
    }
    concatLastUpdatedDetailString(questionnaireHeader) {
        if (questionnaireHeader.ANS_PERSON_FULL_NAME) {
            const lastUpdatedDetailString = 'Last Updated By ' + questionnaireHeader.ANS_PERSON_FULL_NAME + ' on '
                + this._dateFormatPipe.transform(questionnaireHeader.ANS_UPDATE_TIMESTAMP, 'long');
            return lastUpdatedDetailString;
        } else {
            return null;
        }
    }
}
