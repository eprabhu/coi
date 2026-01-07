import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { BusinessRuleService } from '../../common/businessrule.service';
import { Question, QuestionAnswer } from '../../common/questionAnswer';
import { Rule } from '../rule-interfaces';

declare var $: any;

@Component({
	selector: 'app-question-answer',
	templateUrl: './question-answer.component.html',
	styleUrls: ['./question-answer.component.css']
})
export class QuestionAnswerComponent implements OnInit {

	@Input() questionnaireModalValues: QuestionAnswer;
	@Input() moduleCode: Number;
	@Output() updateRule: EventEmitter<any> = new EventEmitter<any>();
	@Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

	selectedQuestion: Number;
	selectedQuestionnaire: string;
	$subscriptions: Subscription[] = [];
	questionnaires: Array<string>;
	questionsList: Question;
	questionErrorMessage = false;
	questionnaireErrorMessage = false;

	constructor(private _ruleService: BusinessRuleService) { }

	ngOnInit(): void {
		this.selectedQuestion = (this.questionnaireModalValues.singleRule.selectedQuestion && this.questionnaireModalValues.isEditClicked) ? this.questionnaireModalValues.singleRule.selectedQuestion.QUESTION_ID : null;
		$('#questionsModal').modal('show');
		this.getQuestions();
	}

	private getQuestions(): void {
		this.$subscriptions.push(this._ruleService.getQuestionnaireList(this.moduleCode.toString()).subscribe((data: any) => {
			if (data) {
				this.questionsList = data.businessRuleDetails.ruleQuestion || {};
				this.questionnaires = Object.keys(data.businessRuleDetails.ruleQuestion);
				this.checkQuestionnaireAvailable();
			}
		}));
	}

	async updateQuestionnaireModalValues(): Promise<void> {
		if (this.selectedQuestion && !this.questionErrorMessage && !this.questionnaireErrorMessage) {
			this.questionnaireModalValues.singleRule.selectedQuestionnaire = this.selectedQuestionnaire;
			this.questionnaireModalValues.singleRule.selectedQuestion = this.questionsList[this.selectedQuestionnaire].find(question => question.QUESTION_ID == this.selectedQuestion) || this.questionnaireModalValues.singleRule.selectedQuestion;
			this.questionnaireModalValues.singleRule = await this.updateQuestionRule(this.questionnaireModalValues.singleRule.selectedQuestion, this.questionnaireModalValues.singleRule);
			this.updateRule.emit(this.questionnaireModalValues);
		} else {
			this.close();
		}
	}

	private async updateQuestionRule(value: any, rule: any): Promise<Rule> {
		if (value) {
			rule.RVALUE = '';
			rule.RVALUE_LABEL = '';
			rule.CONDITION_OPERATOR = '';
			rule.LVALUE = rule.questionId = value.QUESTION_NUMBER;
			rule.LVALUE = rule.LVALUE.toString();
			rule.questionnaireFieldType = value.ANSWER_TYPE;
			rule.QUESTIONNAIRE_DESCRIPTION = value.QUESTIONNAIRE;
			rule.QUESTION = value.QUESTION;
			rule.EXPRESSION_TYPE_CODE = 'Q';
			await this.getQuestionDetailsById(value.QUESTION_NUMBER, rule);
			rule.viewQuestion = true;
		}
		return rule;
	}

	private async getQuestionDetailsById(number, rule): Promise<void> {
		const DATA: any = await this._ruleService.getAsyncQuestionDetailsById(Number(number));
		rule.ruleDataSource = DATA.businessRuleDetails.optionList;
		rule.selectedQuestion.QUESTIONNAIRE_NUMBER = DATA.businessRuleDetails.questionDetails ? DATA.businessRuleDetails.questionDetails[0].QUESTIONNAIRE_NUMBER : rule.selectedQuestion.QUESTIONNAIRE_NUMBER;
	}

	private checkQuestionnaireAvailable(): void {
		let isQuestionnaireAvailable = false;
		if (this.questionnaireModalValues.singleRule.selectedQuestionnaire) {
			this.selectedQuestionnaire = this.questionnaires.find(ele => this.findQuestionnaire(ele));
			isQuestionnaireAvailable = this.selectedQuestionnaire ? true : false;
		}
		this.selectedQuestionnaire = (isQuestionnaireAvailable && this.questionnaireModalValues.isEditClicked) ? this.selectedQuestionnaire : this.questionnaires[0];
		this.checkQuestionAvailable(isQuestionnaireAvailable);
	}

	/**
	 * @param questionnaireName has questionnaireNumber in it.
	 * selected questionnaire is found by comparing 
	 * questionnaire number from questionnaireName
	 * with selectedQuestion question number.
	 */
	private findQuestionnaire(questionnaireName: string): string {
		if(this.questionnaireModalValues.singleRule.selectedQuestion.QUESTIONNAIRE_NUMBER == questionnaireName.split(' ')[0]) {
			return questionnaireName;
		}
	}

	private checkQuestionAvailable(isQuestionnaireAvailable: boolean): void {
		if (isQuestionnaireAvailable) {
			let isQuestionAvailable: boolean;
			isQuestionAvailable = !!this.questionsList[this.selectedQuestionnaire].find((question) => question.QUESTION_ID == this.selectedQuestion);
			this.questionErrorMessage = (!isQuestionAvailable && this.questionnaireModalValues.isEditClicked) ? true : false;
			this.questionnaireErrorMessage = false;
		} else {
			this.questionnaireErrorMessage = (this.questionnaireModalValues.isEditClicked) ? true : false;
			this.questionErrorMessage = false;
		}
	}

	close(): void {
		this.closeModal.emit(false);
	}

	ngOnDestroy(): void { 
		subscriptionHandler(this.$subscriptions);
	}

}

