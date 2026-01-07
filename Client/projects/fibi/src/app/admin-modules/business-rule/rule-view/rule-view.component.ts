import { Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';

import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BusinessRuleService } from '../common/businessrule.service';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';

declare var $: any;
@Component({
  selector: 'app-rule-view',
  templateUrl: './rule-view.component.html',
  styleUrls: ['./rule-view.component.css']
})
export class RuleViewComponent implements OnInit, OnDestroy {

  @Input() ruleId: any;
  @Output() emitCloseModal: EventEmitter<any> = new EventEmitter<any>();

  $subscriptions: Subscription[] = [];
  description = '';
  ruleDefinitionResult: any = {};
  ruleDefinition: any = {};
  mapName = '';
  lookupWindowName = null;

  constructor(private ruleService: BusinessRuleService, private datePipe: DateFormatPipeWithTimeZone ) { }

  ngOnInit() {
    this.openRule(this.ruleId);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  openRule(ruleId) {
    this.$subscriptions.push(this.ruleService.getBusinessRuleById(ruleId)
      .subscribe(
        data => {
              this.ruleDefinitionResult = data;
              this.lookupWindowName = this.ruleDefinitionResult.businessRule.ruleExpression[0].LOOKUP_WINDOW_NAME;
              let splittedExpressionList = this.ruleDefinitionResult.businessRule.rule[0].RULE_EXPRESSION.split(' ');
              splittedExpressionList = splittedExpressionList.filter(function (str) {
                return /\S/.test(str);
              });
              this.ruleDefinition.description = this.ruleDefinitionResult.businessRule.rule[0].DESCRIPTION;
              this.ruleDefinition.ruleAppliedToName = this.ruleDefinitionResult.businessRule.rule[0].RULE_APPLIED_TO;
              this.mapName = this.ruleDefinitionResult.businessRule.rule[0].MAP_DESCRIPTION;
              this.ruleDefinition.createRuleAtName = this.ruleDefinitionResult.businessRule.rule[0].UNIT_NAME;
              this.getRuleAppliedTo();
              this.getRuleTypeName();
              this.populateRuleSummery(splittedExpressionList, this.ruleDefinitionResult.businessRule.ruleExpression);
              $('#viewRuleModal').modal('show');
        }));
  }

  populateRuleSummery(splittedExpressionList, ruleExpression) {
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
              if (this.lookupWindowName === 'DATE' && currentExpression[0].EXPRESSION_TYPE_CODE === 'V') {
                const dateObject = getDateObjectFromTimeStamp(currentExpression[0].RVALUE_LABEL);
                splittedExpressionList[index] = currentExpression[0].LVALUE + this.getParameterValues(currentExpression[0])
                    + '<span class=color-black>' + currentExpression[0].CONDITION_OPERATOR
                    + '</span>' + ' ' + this.datePipe.transform(dateObject);
              } else if ((['V','Q'].includes(currentExpression[0].EXPRESSION_TYPE_CODE))
                          && (['Is Empty','Is Not Empty'].includes(currentExpression[0].CONDITION_OPERATOR))) {
                splittedExpressionList[index] = currentExpression[0].LVALUE + this.getParameterValues(currentExpression[0])
                    + '<span class=color-black>' + currentExpression[0].CONDITION_OPERATOR + '</span>';
              } else {
                splittedExpressionList[index] = currentExpression[0].LVALUE + this.getParameterValues(currentExpression[0])
                    + '<span class=color-black>' + currentExpression[0].CONDITION_OPERATOR
                    + '</span>' + ' ' + currentExpression[0].RVALUE_LABEL;
              }
            }
        } else {
            splittedExpressionList[index] = '<span class=color-black>' + splittedExpressionList[index] + '</span>';
        }
    }
    this.ruleDefinition.summary = splittedExpressionList.join(' ');
  }

  getRuleAppliedTo() {
    this.ruleDefinition.ruleIsUsedForToName = this.ruleService.conditionsForList.filter(item => item.id ===
      this.ruleDefinitionResult.businessRule.rule[0].RULE_TYPE)[0].name;
  }

  getRuleTypeName() {
    this.ruleDefinition.ruleTypeName = (this.ruleDefinitionResult.businessRule.rule[0].RULE_TYPE === 'VE' ||
            this.ruleDefinitionResult.businessRule.rule[0].RULE_TYPE === 'VW') ? 'Validation' : this.ruleDefinition.ruleIsUsedForToName;
  }

  closeModal() {
    this.emitCloseModal.emit(false);
  }

  getParameterValues(subRule: any): string {
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

}
