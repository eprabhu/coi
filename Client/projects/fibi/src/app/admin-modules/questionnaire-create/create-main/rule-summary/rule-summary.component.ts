import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CreateQuestionnaireService } from '../../services/create.service';

declare var $: any;

@Component({
	selector: 'app-rule-summary',
	templateUrl: './rule-summary.component.html',
	styleUrls: ['./rule-summary.component.css']
})
export class RuleSummaryComponent implements OnInit, OnDestroy, OnChanges {

	@Input() ruleId: any;
	@Input() isShowModalView: boolean;
	@Input() isViewMode: boolean;
	@Input() isRuleAvailable: boolean;
	@Output() emitCloseModal: EventEmitter<any> = new EventEmitter<any>();

	$subscriptions: Subscription[] = [];
	description = '';
	ruleDefinitionResult: any = {};
	ruleDefinition: any = {};
	errorMessage: any;

	constructor(private ruleService: CreateQuestionnaireService, private _changeRef: ChangeDetectorRef) { }

	ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges) {
		// tslint:disable-next-line: triple-equals
		if (changes.ruleId && changes.ruleId.currentValue != changes.ruleId.previousValue) {
			this.openRule(this.ruleId);
		}
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	private openRule(ruleId): void {
		this.errorMessage = '';
		if (this.isRuleAvailable) {
			// tslint:disable-next-line: radix
			this.$subscriptions.push(this.ruleService.getBusinessRuleById(parseInt(ruleId))
				.subscribe(data => {
						this.ruleDefinitionResult = data;
						let splittedExpressionList = this.ruleDefinitionResult.businessRule.rule[0].RULE_EXPRESSION.split(' ');
						splittedExpressionList = splittedExpressionList.filter(str => /\S/.test(str));
						this.ruleDefinition.description = this.ruleDefinitionResult.businessRule.rule[0].DESCRIPTION;
						this.ruleDefinition.ruleAppliedToName = this.ruleDefinitionResult.businessRule.rule[0].RULE_APPLIED_TO;
						this.ruleDefinition.createRuleAtName = this.ruleDefinitionResult.businessRule.rule[0].UNIT_NAME;
						this.ruleDefinition.ruleIsUsedForToName = 'Questionnaire';
						this.populateRuleSummery(splittedExpressionList, this.ruleDefinitionResult.businessRule.ruleExpression);
						if (this.isShowModalView) {
							$('#viewRuleSummary').modal('show');
						}
						this._changeRef.markForCheck();
					}));
		} else {
			// tslint:disable-next-line: max-line-length
			this.errorMessage = 'The business rule that was associated with the question had been deactivated or removed. Please either add a new business rule to the question or unlink the business rule from the question.';
			if (this.isShowModalView) {
				$('#viewRuleSummary').modal('show');
			}
			this._changeRef.markForCheck();
		}
	}

	private populateRuleSummery(splittedExpressionList, ruleExpression): void {
		for (let index = 0; index < splittedExpressionList.length; index++) {
			if (splittedExpressionList[index].startsWith('E')) {
				const splittedElement = splittedExpressionList[index].split('E');
				const expressionNumber = parseInt(splittedElement[1], 10);
				const currentExpression = ruleExpression.filter(rule => rule.EXPRESSION_NUMBER === expressionNumber);
				if (currentExpression[0].EXPRESSION_TYPE_CODE === 'Q') {
					splittedExpressionList[index] = currentExpression[0].QUESTION + ' ' + '<span class=color-black>' +
						currentExpression[0].CONDITION_OPERATOR
						+ '</span>' + ' ' + currentExpression[0].RVALUE_LABEL;
				} else {
					splittedExpressionList[index] = currentExpression[0].LVALUE + this.getParameterValues(currentExpression[0])
						+ '<span class=color-black>' + currentExpression[0].CONDITION_OPERATOR
						+ '</span>' + ' ' + currentExpression[0].RVALUE_LABEL;
				}
			} else {
				splittedExpressionList[index] = '<span class=color-black>' + splittedExpressionList[index] + '</span>';
			}
		}
		this.ruleDefinition.summary = splittedExpressionList.join(' ');
	}

	unlinkOrCloseModal(type): void {
		this.emitCloseModal.emit({ 'closeModal': false, 'unlink': type === 'unlink' });
	}

	private getParameterValues(subRule: any): string {
		if (!subRule.EXPRESSION_ARGUMENTS || !subRule.EXPRESSION_ARGUMENTS.length) {
			return ' ';
		}
		let parameters = ' (';
		subRule.EXPRESSION_ARGUMENTS.forEach((element, index) => {
			parameters += ` ${element.ARGUMENT_LABEL} - ${element.VALUE_DESCRIPTION ? element.VALUE_DESCRIPTION : 'undefined'}
    <span class=color-black>${index !== subRule.EXPRESSION_ARGUMENTS.length - 1 ? ', ' : ''}</span>`;
		});
		parameters += ') ';
		return parameters;
	}

	openConfirmation(type): void {
		if (type === 'u') {
			$('#confirmDeleteModal').modal('show');
		} else {
			$('#viewRuleSummary').modal('show');
		}
	}
}
