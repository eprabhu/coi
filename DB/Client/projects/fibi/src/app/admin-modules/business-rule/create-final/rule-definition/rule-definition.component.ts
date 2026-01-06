import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { BusinessRuleService } from '../../common/businessrule.service';
import { ConditionalOperators, Rule, RuleDataSource, RuleSet, RuleTypeOptions, SearchOptions } from '../rule-interfaces';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';

@Component({
    selector: 'app-rule-definition',
    templateUrl: './rule-definition.component.html',
    styleUrls: ['./rule-definition.component.css']
})
export class RuleDefinitionComponent implements OnInit {

    @Input() singleRule: Rule;
    @Input() ruleSet: RuleSet;
    @Input() ruleDefinition: any;
    @Input() ruleIndex: number;
    @Input() subRuleIndex: number;
    @Output() viewQuestion: EventEmitter<any> = new EventEmitter<any>();
    @Output() viewFunctionParameters: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteRule: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitRule: EventEmitter<any> = new EventEmitter<any>();
    @Output() setQuestionAnswer: EventEmitter<any> = new EventEmitter<any>();


    typeUsedForRule: RuleTypeOptions[] = [
        { id: 'V', name: 'Variable' },
        { id: 'F', name: 'Function' },
        { id: 'Q', name: 'Question Answer' }
    ];
    proposalType: RuleTypeOptions[] = [
        { id: 'V', name: 'Valid' },
        { id: 'I', name: 'Invalid' }
    ];
    variableConditionOperator: ConditionalOperators[] = [
        { operator: 'Is Empty', name: 'Is Empty' },
        { operator: 'Is Not Empty', name: 'Is Not Empty' },
        { operator: '=', name: 'Equal to' },
        { operator: '!=', name: 'Not equal to' },
        { operator: '>', name: 'Greater than' },
        { operator: '<', name: 'Less than' },
        { operator: '>=', name: 'Greater than  or equal to' },
        { operator: '<=', name: 'Less than or equal to' },
        { operator: '', name: 'Contains' }
    ];
    dateConditionalOperators: ConditionalOperators[] = [
        { operator: 'Is Empty', name: 'Is Empty' },
        { operator: 'Is Not Empty', name: 'Is Not Empty' },
        { operator: '=', name: 'Equal to' },
        { operator: '>', name: 'Greater than' },
        { operator: '<', name: 'Less than' }
    ];

    functionConditionOperator: ConditionalOperators[] = [
        { operator: '=', name: 'Equal to' }
    ];

    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    expressionOptions: any = [];
    expressionClear: string;
    expressionPlaceholder: string;
    rValueOptions: any = [];
    rValueClear: String;
    rValuePlaceholder: string;

    constructor(private _ruleService: BusinessRuleService) { }

    ngOnInit() {
        this.setExpressionOptions();
        this.clearRValuesForEmptyOperators();
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'V') {
            const LOOKUP_WINDOW = this.findLookupWindow();
            if (LOOKUP_WINDOW) {
                if (this.singleRule.questionnaireFieldType === 'ShowLookUp') {
                    this.getVariableLookups(LOOKUP_WINDOW, this.singleRule);
                } else {
                    LOOKUP_WINDOW.LOOKUP_WINDOW_NAME === 'DATE' ? this.setDataForDate() : this.singleRule.questionnaireFieldType = 'HideLookUp';
                }
            }
        } else {
            this.setConditionalOptions(this.singleRule);
        }
    }

    setDataForDate() {
        this.singleRule.questionnaireFieldType = 'date';
        this.singleRule.conditionalOperators = this.dateConditionalOperators;
    }

    private findLookupWindow() {
        return this.ruleDefinition.conditionType.businessRuleDetails.ruleVariable.find(R => R.VARIABLE_NAME === this.singleRule.LVALUE);
    }

    checkFunctionParametersFilled(): boolean {
        const FUNCTION_PARAMETER_MODAL = document.getElementById('add-function-parameters');
        return this.singleRule.EXPRESSION_TYPE_CODE === 'F' &&
            this.singleRule.LVALUE && FUNCTION_PARAMETER_MODAL &&
            this.singleRule.FUNCTION_PARAMETERS &&
            this.singleRule.FUNCTION_PARAMETERS.length &&
            !this.singleRule.EXPRESSION_ARGUMENTS &&
            getComputedStyle(FUNCTION_PARAMETER_MODAL).display === 'none';
    }

    getSelectedQuestion() {
        this._ruleService.getQuestionDetailsById(Number(this.singleRule.LVALUE)).subscribe((data: any) => {
            this.singleRule.selectedQuestion = data.businessRuleDetails.questionDetails && data.businessRuleDetails.questionDetails[0];
            if (this.singleRule.selectedQuestion) {
                const selectedQuestionnaire = this.singleRule.selectedQuestion.QUESTIONNAIRE_NUMBER + ' ' + this.singleRule.selectedQuestion.QUESTIONNAIRE;
                this.singleRule.selectedQuestionnaire = selectedQuestionnaire ? selectedQuestionnaire : '';
                this.singleRule.QUESTIONNAIRE_DESCRIPTION = this.singleRule.selectedQuestionnaire;
                this.singleRule.ruleDataSource = data.businessRuleDetails.optionList;
                if (this.singleRule.selectedQuestion.ANSWER_TYPE === 'Checkbox') {
                    this.setCheckBoxType(this.singleRule.RVALUE);
                }
            }
        });
    }

    setCheckBoxType(rValue) {
        const CHECKED_LIST = rValue.split(',');
        CHECKED_LIST.forEach((option) => {
            const OPTION = this.singleRule.ruleDataSource.find(x => x.OPTION_LABEL === option);
            OPTION ? OPTION.isChecked = true : OPTION.isChecked = false;
        });
    }

    setExpressionOptions(): void {
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'Q') {
            this.expressionPlaceholder = 'Search Question';
            this.setQuestionValue();
            if (this.singleRule.LVALUE) {
                this.getSelectedQuestion();
            }
        }
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'F') {
            this.expressionPlaceholder = 'Search Function';
            this.expressionOptions = this.setFunctionOptions();
            if (this.singleRule.LVALUE) {
                this.singleRule.FUNCTION_DESCRIPTION = this.getFunctionDescription(this.singleRule.LVALUE);
            }
        }
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'V') {
            this.expressionPlaceholder = 'Search Variable';
            this.expressionOptions = this.setVariableOptions();
        }
    }

    getFunctionDescription(functionName: string): string {
        const FUNCTION = this.ruleDefinition.conditionType.businessRuleDetails.ruleFunction.find(
            (value: any) => value.FUNCTION_NAME === functionName);
        return FUNCTION ? FUNCTION.DESCRIPTION : '';
    }

    setQuestionValue() {
        if (this.singleRule.LVALUE && this.singleRule.QUESTION) {
            this.singleRule.QUESTION_NAME = this.singleRule.EXPRESSION_TYPE_CODE + this.singleRule.LVALUE + ' ' + this.singleRule.QUESTION;
            this.singleRule.CONDITION_OPERATOR = this.singleRule.CONDITION_OPERATOR;
        } else {
            this.singleRule.CONDITION_OPERATOR = '';
            this.singleRule.QUESTION_NAME = '';
            this.singleRule.QUESTIONNAIRE_DESCRIPTION = '';
            this.singleRule.questionnaireFieldType = '';
        }
    }

    setFunctionOptions(): SearchOptions {
        return {
            arrayList: this.ruleDefinition.conditionType.businessRuleDetails.ruleFunction,
            contextField: 'FUNCTION_NAME',
            filterFields: 'FUNCTION_NAME',
            formatString: 'FUNCTION_NAME',
            defaultValue: this.singleRule.LVALUE ? this.singleRule.LVALUE : ''
        };
    }

    setVariableOptions(): SearchOptions {
        return {
            arrayList: this.ruleDefinition.conditionType.businessRuleDetails.ruleVariable,
            contextField: 'DESCRIPTION',
            filterFields: 'VARIABLE_NAME',
            formatString: 'DESCRIPTION',
            defaultValue: this.singleRule.LVALUE_LABEL ? this.singleRule.LVALUE_LABEL : ''
        };
    }

    setConditionalOptions(rule: any): void {
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'Q') {
            rule.conditionalOperators = this.variableConditionOperator;
            rule.ruleDataSource = [];
        }
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'F') {
            rule.conditionalOperators = this.functionConditionOperator;
            rule.ruleDataSource = this.setRValueFunctionOptions();
            this.rValueOptions = this.setRValueFunctionOptions();
        }
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'V') {
            rule.conditionalOperators = this.variableConditionOperator;
            this.rValueOptions = this.setRValueVariableOptions(null);
        }
    }

    setRValueFunctionOptions(): SearchOptions {
        return {
            arrayList: [{ value: 'True' }, { value: 'False' }],
            contextField: 'value',
            filterFields: 'value',
            formatString: 'value',
            defaultValue: this.singleRule.RVALUE_LABEL ? this.singleRule.RVALUE_LABEL : ''
        };
    }

    setRValueVariableOptions(array: Array<any>): RuleDataSource {
        return {
            arrayList: array ? array : this.ruleDefinition.conditionType.businessRuleDetails.ruleVariable,
            contextField: 'RVALUE - DESCRIPTION',
            filterFields: 'RVALUE,DESCRIPTION',
            formatString: 'RVALUE - DESCRIPTION',
            defaultValue: this.singleRule.RVALUE_LABEL ? this.singleRule.RVALUE+' - '+ this.singleRule.RVALUE_LABEL : ''
        };
    }

    expressionSelect(value: any, rule: any): void {
        switch (this.singleRule.EXPRESSION_TYPE_CODE) {
            case 'F': this.OnFunctionSelected(value, rule); break;
            case 'V': this.onVariableSelected(value, rule); break;
        }
    }

    OnFunctionSelected(value: any, rule: any): void {
        this.ruleDefinition.isDirty = true;
        rule.LVALUE = value ? value.FUNCTION_NAME : '';
        rule.FUNCTION_DESCRIPTION = value ? value.DESCRIPTION : '';
        rule.FUNCTION_PARAMETERS = [];
        rule.viewQuestion = true;
        this.generateRuleSummery(null, null);
        this.openDataInModal();
    }

    onVariableSelected(value: any, rule: any): void {
        rule.CONDITION_OPERATOR = '';
        rule.conditionalOperators = this.variableConditionOperator;
        this.ruleDefinition.isDirty = true;
        rule.RVALUE_LABEL = '';
        rule.RVALUE = '';
        rule.LVALUE = value ? value.VARIABLE_NAME : '';
        rule.viewQuestion = true;
        if (value) {
            if (value.SHOW_LOOKUP === 'Y') {
                this.getVariableLookups(value, rule);
            } else if (value.SHOW_LOOKUP === 'N') {
                value.LOOKUP_WINDOW_NAME === 'DATE' ?  this.setDataForDate() :  rule.questionnaireFieldType = 'HideLookUp';
                this.generateRuleSummery(null, null);
            }
        }
    }

    getVariableLookups(value: any, rule: Rule): void {
        this.$subscriptions.push(this._ruleService.getVariableList(value.LOOKUP_WINDOW_NAME).subscribe(
            (data: any) => {
                rule.questionnaireFieldType = 'ShowLookUp';
                rule.ruleDataSource = this.setRValueVariableOptions(data.businessRuleDetails.lookUpDetails);
                this.rValueOptions = this.setRValueVariableOptions(data.businessRuleDetails.lookUpDetails);
                this.generateRuleSummery(null, null);
            }));
    }

    openDataInModal(): void {
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'F') {
            this.viewFunctionParameters.emit({
                'functionName': this.singleRule.LVALUE, 'ruleIndex': this.ruleIndex,
                'subRuleIndex': this.subRuleIndex, 'singleRule': this.singleRule
            });
        }
    }

    openQuestionsModal(isEditClicked) {
        isEditClicked = this.singleRule.QUESTION ? true : false;
        this.setQuestionAnswer.emit({
            'singleRule': this.singleRule,
            'ruleIndex': this.ruleIndex,
            'subRuleIndex': this.subRuleIndex,
            'openModal': true,
            'isEditClicked': isEditClicked
        });
    }

    deleteSubRule(): void {
        this.deleteRule.emit({ 'ruleSet': this.ruleSet, 'singleRule': this.singleRule });
    }

    generateRuleSummery(value: any, ruleValue: Rule): void {
        if (value) {
            if (this.singleRule.EXPRESSION_TYPE_CODE !== 'F') {
                ruleValue.RVALUE = value.RVALUE;
                ruleValue.RVALUE_LABEL = value.DESCRIPTION;
            } else {
                ruleValue.RVALUE = value.value;
                ruleValue.RVALUE_LABEL = value.value;
            }
        }
        this.ruleDefinition.isDirty = true;
        this.emitSubRule(ruleValue);
    }

    emitSubRule(ruleValue: Rule): void {
        this.emitRule.emit({
            'ruleValue': ruleValue, 'ruleIndex': this.ruleIndex,
            'subRuleIndex': this.subRuleIndex, 'singleRule': this.singleRule
        });
    }

    onChangeRValueCheckBox(selectedValue: string, rule: Rule): void {
        this.ruleDefinition.isDirty = true;
        rule.RVALUE = '';
        rule.RVALUE_LABEL = '';
        rule.ruleDataSource.forEach(element => {
            if (element.isChecked) {
                rule.RVALUE_LABEL = rule.RVALUE = rule.RVALUE.length > 0 ? rule.RVALUE + ',' + element.OPTION_LABEL : element.OPTION_LABEL;
            }
        });
        this.generateRuleSummery(null, null);
    }

    onChangeRValueRadio(selectedItem: any, rule: Rule): void {
        this.ruleDefinition.isDirty = true;
        rule.RVALUE = rule.RVALUE_LABEL = selectedItem.OPTION_LABEL;
        this.generateRuleSummery(null, null);
    }

    onChangeRValueSelectList(rule: Rule): void {
        this.ruleDefinition.isDirty = true;
        rule.RVALUE_LABEL = rule.RVALUE;
        this.generateRuleSummery(null, null);
    }

    onFunctionRValueSelected(event: any, rule: Rule): void {
        rule.RVALUE_LABEL = '';
        this.ruleDefinition.isDirty = true;
        rule.RVALUE = event.value;
        rule.RVALUE_LABEL = event.value;
        this.generateRuleSummery(null, null);
    }

    RuleCategorySelectionChange(selectedItem: RuleTypeOptions, rule: Rule): void {
        this.ruleDefinition.isDirty = true;
        rule.LVALUE = '';
        rule.RVALUE = '';
        rule.QUESTION = '';
        rule.RVALUE_LABEL = '';
        rule.LVALUE_LABEL = '';
        rule.CONDITION_OPERATOR = '';
        this.ruleDefinition.ruleSummery = '';
        rule.EXPRESSION_TYPE_CODE = selectedItem.id;
        this.setExpressionOptions();
        if (this.singleRule.EXPRESSION_TYPE_CODE === 'Q') {
            this.openQuestionsModal(false);
        }
        this.setConditionalOptions(rule);
        this.generateRuleSummery(null, null);
    }

    /**
     * @param  {} index
     * update the selected answer with dd/mm/yyyy format
     */
    setDateFormat(rule, date) {
        const oldDate = date;
        const newDate = this.singleRule.EXPRESSION_TYPE_CODE === 'Q' ? this.setDate(oldDate) : parseDateWithoutTimestamp(oldDate);
        rule.RVALUE_LABEL = rule.RVALUE = newDate;
        this.generateRuleSummery(null, null);
    }

    setDate (date) {
        const newDate = new Date(date);
        return newDate.getDate() ? this.changeDateFormat(newDate) : date ? date : '';
    }

    /**
     * @param  {} date coverts date to a specified format mm/dd//yyyy
     */
    changeDateFormat(date) {
        return (
            ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
        );
    }
    /** Method to clear Rvalues if condition operator is Empty/Not Empty, since it doesn't rvalues. */
    clearRValuesForEmptyOperators() {       
        if (['Is Empty','Is Not Empty'].includes(this.singleRule.CONDITION_OPERATOR)) {
            this.singleRule.RVALUE = '';
            this.singleRule.RVALUE_LABEL = '';
            this.rValueClear = new String('true');
        }
    }
}
