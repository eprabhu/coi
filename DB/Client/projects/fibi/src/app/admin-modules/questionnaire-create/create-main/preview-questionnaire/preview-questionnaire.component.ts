import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';
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
} from '../../../../common/services/end-point.config';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { easeIn } from '../../services/animations';
import { compareDatesWithoutTimeZone } from '../../../../common/utilities/date-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { TableAnswer } from '../../questionnaire.interface';

@Component({
    selector: 'app-preview-questionnaire',
    templateUrl: './preview-questionnaire.component.html',
    styleUrls: ['./preview-questionnaire.component.css'],
    animations: [easeIn],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewQuestionnaireComponent implements OnInit {
    constructor(private _elasticConfig: ElasticConfigService, public _commonService: CommonService) { }
    @Input() questionnaire: any = {};
    @Input() lookUpDetails: any;
    conditions = [];
    showHelpMsg = [];
    helpMsg = [];
    searchOptions: any = {};
    clearElasticField: any;
    clearEndPointField: any;
    lookUpOptions: any = {};
    lookUpValues = {};
    setFocusToElement = setFocusToElement;
    datePlaceHolder = DEFAULT_DATE_FORMAT;

    ngOnInit() {
        const tempLabels: any = {};
        this.questionnaire.questions.forEach((question) => {
            if (!tempLabels[question.GROUP_NAME]) {
                // question.SHOW_LABEL = true;
                tempLabels[question.GROUP_NAME] = question.GROUP_NAME;
            }
            question.ANSWERS = {};
            this.ifQuestionTypeTablePrepareData(question);
            this.setDataForSearchAnswerTypes(question);
            this.showChildQuestions(question);
        });
    }

    private ifQuestionTypeTablePrepareData(question) {
        if (question.ANSWER_TYPE === 'Table') {
            question.ANSWERS['1'] = [];
            question.HEADERS = this.questionnaire.options.filter(o => o.QUESTION_ID === question.QUESTION_ID);
            if ((question.ANSWERS && question.ANSWERS['1'] && question.ANSWERS['1'].length === 0) || !question.ANSWERS) {
                question.ANSWERS['1'] = [];
            }
            this.setAddRow(question);
        }
    }

    gotoTextArea(questionId, answerIndex, headerIndex) {
        document.getElementById('answer' + questionId + answerIndex + headerIndex).focus();
    }

    addNewAnswerRow(question): void {
        question.ANSWERS['1'].push(new TableAnswer());
        this.setAddRow(question);
    }

    setAddRow(question, visibleAnswers = null) {
        visibleAnswers = (visibleAnswers == null && question.ANSWERS['1']) ?
            question.ANSWERS['1'].filter(answer => answer.AC_TYPE !== 'D').length : (visibleAnswers || 0);
        if (visibleAnswers === 1 && question.NO_OF_ANSWERS === 1) {
            question.is_add_row = false;
            question.IS_NO_VISIBLE_ANSWERS = false;
        } else {
            question.is_add_row = (visibleAnswers < question.NO_OF_ANSWERS) || question.NO_OF_ANSWERS === null;
            question.IS_NO_VISIBLE_ANSWERS = visibleAnswers === 0;
        }
    }

    deleteAnswer(question, answer, answerIndex: number): void {
        question.ANSWERS['1'].splice(answerIndex, 1);
        this.setAddRow(question);
    }

    setDataForSearchAnswerTypes(question: any): void {
        if (['elastic', 'endpoint'].includes(question.ANSWER_TYPE)) {
            this.setOptionsForElasticAndEndPoint(question);
        }
        if (['SystemLookup', 'UserLookup'].includes(question.ANSWER_TYPE)) {
            this.setDataForLookUpTypes(question);
        }
    }

    getAnswerCount(answer): boolean {
        return Object.values(answer).filter(Boolean).length === 0 ? false : true;
    }

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

    /**
     * @param  {} currentQuestion
     * finds the child question of the currently answered question
     */
    showChildQuestions(currentQuestion) {
        if (currentQuestion && currentQuestion.HAS_CONDITION === 'Y') {
            this.conditions = _.filter(this.questionnaire.conditions, { QUESTION_ID: currentQuestion.QUESTION_ID });
            this.conditions.forEach((condition) => {
                this.findChildQuestion(currentQuestion, condition);
            });
        }
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
                    question.SHOW_QUESTION = false;
                    question.ANSWERS = {};
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
     * updated answer or newly answered question I - Inser U - update D- delete
     */
    setacType(acType) {
        if (acType == null) {
            acType = 'I';
        } else if (acType === 'D') {
            acType = 'U';
        } else if (acType === 'U') {
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
            result = this.checkGreathanCondition(question, condition);
        } else if (condition.CONDITION_TYPE === 'LESSTHAN') {
            result = this.checkLessthanCondition(question, condition);
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
                question.SHOW_QUESTION = true;
            } else if (condition.GROUP_NAME === question.GROUP_NAME && !this.checkAnswer(currentQuestion, condition)) {
                question.SHOW_QUESTION = false;
                question.ANSWERS = {};
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
                // tslint:disable-next-line:triple-equals
                if (answer && compareDatesWithoutTimeZone(answer, condition.CONDITION_VALUE) == 0) {
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
        return !!Object.values(question.ANSWERS)
            .filter(Boolean)
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
    checkGreathanCondition(question, condition) {
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
    checkLessthanCondition(question, condition) {
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
    /**
     * @param  {} question
     * @param  {} condition
     * return true if the question has condition value in answer string
     */
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
    /** assigns help link message of a question
     * sets no help message if help mesag is not available
     * @param helpMsg
     */
    getHelpLink(helpMsg: string, helpLink: string, index: number) {
        this.showHelpMsg[index] = !this.showHelpMsg[index];
        this.helpMsg[index] = helpMsg || 'No help message availabe!';
        this.helpMsg[index] = this.addHelpLinkToDescription(this.helpMsg[index], helpLink);
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

    onSearchSelectEvent(event: any, question: any): void {
        if (event) {
            question.ANSWERS[1] = event[question.LOOKUP_NAME];
        } else {
            this.clearValues(question);
        }
        this.showChildQuestions(question);
    }

    clearValues(question: any): void {
        question.ANSWERS[1] = '';
        this.searchOptions[question.QUESTION_ID + question.ANSWER_TYPE].defaultValue = '';
    }

    /**
     * @param  {} index
     * update the selected answer with dd/mm/yyyy format
     */
    setDateFormat(index, question: any) {
        this.questionnaire.questions[index].AC_TYPE = this.setUpdateACType(this.questionnaire.questions[index].AC_TYPE);
        const oldDate = this.questionnaire.questions[index].ANSWERS[1];
        let newDate = new Date(this.questionnaire.questions[index].ANSWERS[1]);
        newDate = newDate.getDate() ? this.changeDateFormat(newDate) : oldDate ? oldDate : '';
        this.showChildQuestions(question);
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
}
