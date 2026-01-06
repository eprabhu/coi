/** last updated by Archana R on 25-02-2020 **/

import { Component, OnInit, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { BusinessRuleService } from '../common/businessrule.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RuleSet } from './rule-interfaces';
import { Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { QuestionAnswer } from '../common/questionAnswer';
import { mapModules } from '../common/commonFunctions';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { AuditLogService } from '../../../common/services/audit-log.service';

declare var $: any;

@Component({
    selector: 'app-create-final',
    templateUrl: './create-final.component.html',
    styleUrls: ['./create-final.component.css'],
    providers: [AuditLogService,
    { provide: 'moduleName', useValue: 'BUSINESS_RULE' }],
})
export class CreateFinalComponent implements OnInit, OnDestroy {
    @Input() checkRuleSet: RuleSet;
    @Input() ruleDefinition: any;
    @Input() moduleList: any;
    @Input() rule: any;
    @Output() toggle: EventEmitter<string> = new EventEmitter<string>();

    RuleExpression = '';
    businessRule = {
        rule: [{
            DESCRIPTION: '',
            RULE_ID: 0,
            RULE_TYPE: 'V',
            RULE_CATEGORY: '',
            UPDATE_USER: '',
            UNIT_NUMBER: '',
            MODULE_CODE: '',
            SUB_MODULE_CODE: '',
            IS_ACTIVE: 'Y',
            RULE_EXPRESSION: '',
            MAP_ID: 0,
            NOTIFICATION_ID: 0,
            USER_MESSAGE: '',
            UPDATE_RULE_ORDER: 'false',
            RULE_EVALUATION_ORDER: 0,
        }],
        ruleExpression: [],
        deletedRuleExpressionList: []
    };
    mapDescription = '';
    mapId = '';
    validationText = '';
    mapUnit = '';
    showEmptySetValidation = false;
    questionDetails: any = {};
    questionId: any;
    resultReturns: any = {};
    stopGroupList: any[];
    stopGroupListKeys: any[];
    deletedRuleNumberList = [];
    ruleSetId = 0;
    ruleData: any = {
        rule: {},
        expressionList: []
    };
    result: any = {};
    mapDetails: any = {};
    mapList = [];
    notificationList = [];
    isFirstLogicalConditionAdded = true;
    isFirstRuleSetConditionRemoved = true;
    isChildRuleSetConditionFound = true;
    updatedUser: any;
    ruleIdForEdit: 0;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isSaving = false;
    functionParameterData: Subject<any> = new Subject();
    isShowQuestionModal = false;
    questionnaireModalValues: QuestionAnswer;
    moduleName = '';
    before: any;
 
    constructor(private _auditLogService: AuditLogService, private ruleService: BusinessRuleService,
        private _location: Location,
        private _commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private datePipe: DateFormatPipeWithTimeZone) { }

    ngOnInit() {
        this.updatedUser = this._commonService.getCurrentUserDetail('userName');
        this.ruleDefinition.isDirty = false;
        // tslint:disable-next-line: triple-equals
        if (this.ruleDefinition.ruleAppliedToSubModule != 0) {
            this.moduleName = mapModules(this.moduleList).find
                // tslint:disable-next-line: triple-equals
                (ele => ele.MODULE_CODE == this.ruleDefinition.ruleAppliedToModule).DESCRIPTION;
        }
        this.ruleDefinition.ruleSummery = '';
        this.populateSummery(this.checkRuleSet);
        this.getMapList();
        this.getNotificationList();
        this.ruleDefinition.ruleSummery = this.ruleDefinition.ruleSummery.replace(/  +/g, ' ');
        this.before = this.prepareAuditLog();
        this.$subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
            this.ruleIdForEdit = !params['ruleId'] ? 0 : params['ruleId'];
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    addRuleSet(child) {
        this.ruleDefinition.isDirty = true;
        this.ruleDefinition.totalNumberOfRuleset++;
        if (child !== undefined) {
            const defaultCondition = this.ruleDefinition.totalNumberofRules > 0 ? 'AND' : '';
            child.ruleSet = child.ruleSet.concat([{
                parentRuleNumber: child.ruleSetNumber,
                ruleSetNumber: this.ruleDefinition.totalNumberOfRuleset,
                condition: defaultCondition,
                isLogicalAnd: true,
                ruleSet: [],
                subRules: []
            }]);
            this.addRule(child.ruleSet[child.ruleSet.length - 1]);
        } else {
            const defaultCondition = this.checkRuleSet.ruleSet.length > 0 ? 'AND' : '';
            this.checkRuleSet.ruleSet = this.checkRuleSet.ruleSet.concat([{
                parentRuleNumber: 0,
                ruleSetNumber: this.ruleDefinition.totalNumberOfRuleset, isLogicalAnd: true,
                condition: defaultCondition, ruleSet: [], subRules: []
            }]);
            this.addRule(this.checkRuleSet.ruleSet[this.checkRuleSet.ruleSet.length - 1]);

        }
        this.generateRuleSummery(null, null);
    }

    addRule(data) {
        this.ruleDefinition.isDirty = true;
        this.ruleDefinition.totalNumberofRules++;
        const defaultCondition = data.subRules.length > 0 ? 'AND' : '';
        data.subRules = data.subRules.concat({
            questionId: 0,
            viewQuestion: false,
            conditionalOperators: null,
            ruleDataSource: null,
            questionnaireFieldType: '',
            condition: defaultCondition,
            isLogicalAnd: true,
            RULES_EXPERSSION_ID: 0,
            EXPRESSION_NUMBER: this.ruleDefinition.totalNumberofRules,
            PARENT_EXPRESSION_NUMBER: 0,
            EXPRESSION_TYPE_CODE: 'V',
            LVALUE: '',
            CONDITION_OPERATOR: '',
            RVALUE: '',
            RVALUE_LABEL: '',
            UPDATE_USER: this.updatedUser,
        });
        if (defaultCondition === '' && data.condition === '') {
            this.setConditionForRuleSet(data);
            data.condition = '';
        }
        this.generateRuleSummery(null, null);
    }

    deleteSubRule(event: any): void {
        this.deleteRule(event.ruleSet, event.singleRule);
    }

    functionParameters(event: any) {
        this.functionParameterData.next(event);
    }

    deleteRule(RulesSet, rule) {
        this.ruleDefinition.isDirty = true;
        this.ruleDefinition.totalNumberofRules--;
        RulesSet.subRules = RulesSet.subRules.filter((r) => r !== rule);
        if (rule.RULES_EXPERSSION_ID > 0) {
            this.deletedRuleNumberList.push(rule.RULES_EXPERSSION_ID);
        }
        if (this.ruleDefinition.totalNumberofRules === 1) {
            this.resetAllCondition();
        } else if (RulesSet.condition === '' && rule.condition === '') {
            this.isFirstLogicalConditionAdded = false;
            this.resetCondition();
        }
        if (RulesSet.subRules.length === 0) {
            this.deleteRuleSet(RulesSet);
        }
        this.generateRuleSummery(null, null);
    }

    deleteRuleSet(child) {
        this.ruleDefinition.isDirty = true;
        this.ruleDefinition.totalNumberOfRuleset--;
        this.storeDeletedRuleNumber(child.subRules);
        this.ruleDefinition.totalNumberofRules = this.ruleDefinition.totalNumberofRules - child.subRules.length;
        this.deleteChildRuleSetNumber(child);
        if (child.parentRuleNumber === 0) {
            this.checkRuleSet.ruleSet = this.checkRuleSet.ruleSet.filter(rule => rule.ruleSetNumber !== child.ruleSetNumber);
        } else {
            const parentNode = this.getParentNode(this.checkRuleSet, child);
            parentNode.ruleSet = parentNode.ruleSet.filter((r) => r !== child);
        }
        this.updateRuleSetNumber(this.checkRuleSet, child);
        if (this.ruleDefinition.totalNumberOfRuleset === 1 || child.condition === '') {
            this.isFirstRuleSetConditionRemoved = false;
            this.isChildRuleSetConditionFound = false;
            this.updateRuleSetCondition(this.getChildRuleSetCondition(this.checkRuleSet, child.ruleSetNumber));
        }
        this.generateRuleSummery(null, null);
    }
    deleteAllRuleSet() {
        this.ruleDefinition.isDirty = true;
        this.checkRuleSet.ruleSet = [];
        this.ruleDefinition.totalNumberOfRuleset = 0;
        this.ruleDefinition.totalNumberofRules = 0;
        this.deletedRuleNumberList = this.ruleDefinition.expressionIdList;
        this.generateRuleSummery(null, null);
    }
    deleteChildRuleSetNumber(child) {
        for (let index = 0; index < child.ruleSet.length; index++) {
            const rule = child.ruleSet[index];
            this.ruleDefinition.totalNumberOfRuleset--;
            this.storeDeletedRuleNumber(rule.subRules);
            this.ruleDefinition.totalNumberofRules = this.ruleDefinition.totalNumberofRules - rule.subRules.length;
            this.updateRuleSetNumber(this.checkRuleSet, rule);
            if (rule.ruleSet.length > 0) {
                this.deleteChildRuleSetNumber(rule);
            }

        }
    }
    storeDeletedRuleNumber(rules) {
        rules.forEach(rule => {
            if (rule.RULES_EXPERSSION_ID > 0) {
                this.deletedRuleNumberList.push(rule.RULES_EXPERSSION_ID);
            }
        });
    }
    getParentNode(ruleList, child) {
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const rule = ruleList.ruleSet[index];
            if (rule.ruleSetNumber === child.parentRuleNumber) {
                return rule;
            }
            if (rule.ruleSet.length > 0) {
                return this.getParentNode(rule, child);
            }
        }
    }
    updateRuleSetNumber(ruleList, child) {
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const rule = ruleList.ruleSet[index];
            if (rule.ruleSetNumber > child.ruleSetNumber) {
                rule.ruleSetNumber = rule.ruleSetNumber - 1;
            }
            if (rule.parentRuleNumber > child.ruleSetNumber) {
                rule.parentRuleNumber = rule.parentRuleNumber - 1;
            }
            if (rule.ruleSet.length > 0) {
                this.updateRuleSetNumber(rule, child);
            }
        }
    }
    resetAllCondition() {
        for (let index = 0; index < this.checkRuleSet.subRules.length; index++) {
            const nextRule = this.checkRuleSet.subRules[index];
            nextRule.condition = '';
        }
        this.updateCondition(this.checkRuleSet);
    }
    resetCondition() {
        for (let index = 0; index < this.checkRuleSet.subRules.length; index++) {
            const nextRule = this.checkRuleSet.subRules[index];
            if (!this.isFirstLogicalConditionAdded) {
                this.isFirstLogicalConditionAdded = nextRule.condition === '' ? false : true;
                nextRule.condition = '';

            }
        }
        if (!this.isFirstLogicalConditionAdded) {
            this.setFirstLogicalCondition(this.checkRuleSet);
        }
    }
    setConditionForRuleSet(ruleList) {
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const nextRule = ruleList.ruleSet[index];
            nextRule.condition = nextRule.condition === '' ? 'AND' : nextRule.condition;
            if (nextRule.ruleSet.length > 0) {
                this.setConditionForRuleSet(nextRule);
            }
        }
    }
    setFirstLogicalCondition(ruleList) {
        if (!this.isFirstLogicalConditionAdded) {
            this.isFirstLogicalConditionAdded = ruleList.condition === '' ? false : true;
            ruleList.condition = '';
        }

        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            if (!this.isFirstLogicalConditionAdded) {
                const nextRuleSet = ruleList.ruleSet[index];
                this.isFirstLogicalConditionAdded = nextRuleSet.condition === '' ? false : true;
                nextRuleSet.condition = '';
                for (let j = 0; j < nextRuleSet.subRules.length; j++) {
                    const rule = nextRuleSet.subRules[j];
                    if (!this.isFirstLogicalConditionAdded) {
                        this.isFirstLogicalConditionAdded = rule.condition === '' ? false : true;
                        rule.condition = '';
                    }
                }
                if (nextRuleSet.ruleSet.length > 0) {
                    this.setFirstLogicalCondition(nextRuleSet);
                }
            }
        }
    }
    updateCondition(ruleList) {
        ruleList.condition = '';
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const nextRuleSet = ruleList.ruleSet[index];
            nextRuleSet.condition = '';
            for (let j = 0; j < nextRuleSet.subRules.length; j++) {
                const rule = nextRuleSet.subRules[j];
                rule.condition = '';
            }
            if (nextRuleSet.ruleSet.length > 0) {
                this.updateCondition(nextRuleSet);
            }

        }
    }
    getChildRuleSetCondition(ruleList, ruleSetNumber) {
        if (!this.isChildRuleSetConditionFound) {
            if (ruleList.ruleSetNumber === ruleSetNumber) {
                this.isChildRuleSetConditionFound = true;
                return ruleList;
            }

            if (!this.isChildRuleSetConditionFound) {
                for (let index = 0; index < ruleList.ruleSet.length; index++) {
                    const nextRuleSet = ruleList.ruleSet[index];
                    if (nextRuleSet.ruleSetNumber === ruleSetNumber) {
                        this.isChildRuleSetConditionFound = true;
                        return nextRuleSet;
                    }
                    if (nextRuleSet.ruleSet.length > 0) {
                        this.getChildRuleSetCondition(nextRuleSet, ruleSetNumber);
                    }

                }
            }
        }
    }
    updateRuleSetCondition(ruleList) {
        if (!this.isFirstRuleSetConditionRemoved && ruleList !== undefined) {
            if (ruleList.subRules.length > 0) {
                ruleList.condition = '';
                this.isFirstRuleSetConditionRemoved = true;
                return;
            } else {
                ruleList.condition = '';
            }
            if (!this.isFirstRuleSetConditionRemoved) {
                for (let index = 0; index < ruleList.ruleSet.length; index++) {
                    const nextRuleSet = ruleList.ruleSet[index];
                    if (nextRuleSet.subRules.length > 0) {
                        nextRuleSet.condition = '';
                        this.isFirstRuleSetConditionRemoved = true;
                        break;
                    } else {
                        nextRuleSet.condition = '';
                    }
                    if (nextRuleSet.ruleSet.length > 0) {
                        this.updateRuleSetCondition(nextRuleSet);
                    }

                }
            }
        }
    }

    changeLogicalOperator(event, rule, ruleSet) {
        this.ruleDefinition.isDirty = true;
        if (rule.condition === '') {
            ruleSet.isLogicalAnd = !ruleSet.isLogicalAnd;
            ruleSet.condition = ruleSet.isLogicalAnd ? 'AND' : 'OR';
        } else {
            rule.isLogicalAnd = !rule.isLogicalAnd;
            rule.condition = rule.isLogicalAnd ? 'AND' : 'OR';
        }
        this.generateRuleSummery(null, null);
    }

    generateRuleSummery(value, ruleValue) {
        if (value) {
            ruleValue.RVALUE = value.originalObject.RVALUE;
        }
        this.ruleDefinition.isDirty = true;
        this.ruleDefinition.ruleSummery = '';
        this.populateSummery(this.checkRuleSet);
        this.ruleDefinition.ruleSummery = this.ruleDefinition.ruleSummery.replace(/  +/g, ' ');
    }

    getEmittedRule(event: any) {
        if (event) {
            const RULE_SET = this.checkRuleSet.ruleSet[event.ruleIndex];
            RULE_SET.subRules[event.subRuleIndex] = event.singleRule;
            this.generateRuleSummery(null, event.ruleValue);
        }
    }

    onActivateOrDeactivateRule(isActive) {
        this.showEmptySetValidation = false;
        const VALIDATION = this.checkValidation();
        if (VALIDATION) {
            this.businessRule.ruleExpression = [];
            /* IS_ACTIVE- To set button label as 'activate' when isActive = 'N'  */
            this.businessRule.rule[0].IS_ACTIVE = isActive === 'N' ? 'Y' : 'N';
            this.validationText = '';
            this.saveRule();
        }
    }

    saveClick() {
        this.showEmptySetValidation = false;
        const VALIDATION = this.checkValidation();
        if (VALIDATION) {
            if (this.ruleDefinition.isActive === 'N') {
                this.businessRule.rule[0].IS_ACTIVE = 'N';
            }
            this.businessRule.ruleExpression = [];
            this.validationText = '';
            this.saveRule();
        }
    }

    checkValidation() {
        if (this.ruleDefinition.ruleIsUsedForToName === 'Routing' && this.ruleDefinition.mapId === 0) {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Please specify a Route Map.');
            return false;
        } else if (this.ruleDefinition.ruleIsUsedForToName === 'Notification' && this.ruleDefinition.notificationId === 0) {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Please specify a notification.');
            return false;
        } else if (this.ruleDefinition.description.trim().length === 0) {
            this.validationText = 'Please specify a description for rule.';
            return false;
        } else {
            return true;
        }
    }

    saveConfirmClick() {
        this.businessRule.ruleExpression = [];
        this.businessRule.rule[0].IS_ACTIVE = 'N';
        this.showEmptySetValidation = false;
        this.saveRule();
    }

    saveRule() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.setRuleValues();
            if (!this.showEmptySetValidation) {
                this.saveOrUpdateRule();
            } else if (this.showEmptySetValidation) {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Please specify at least one rule in Build a Rule section.');
                this.isSaving = false;
            }
        }
    }
    /** set rule values for saving the rule.
     */
    setRuleValues() {
        this.businessRule.rule[0].DESCRIPTION = this.ruleDefinition.description;
        this.businessRule.rule[0].RULE_ID = Number(this.ruleDefinition.ruleIdForEdit);
        this.businessRule.rule[0].RULE_TYPE = this.ruleDefinition.ruleIsUsedFor;
        this.businessRule.rule[0].RULE_CATEGORY = 'R';
        this.businessRule.rule[0].UNIT_NUMBER = this.ruleDefinition.createRuleAt;
        this.businessRule.rule[0].UPDATE_USER = this.ruleDefinition.UPDATE_USER;
        this.businessRule.rule[0].MODULE_CODE = this.ruleDefinition.ruleAppliedToModule;
        this.businessRule.rule[0].SUB_MODULE_CODE = this.ruleDefinition.ruleAppliedToSubModule;
        this.businessRule.rule[0].USER_MESSAGE = this.ruleDefinition.userMessage;
        this.ruleService.filterData = JSON.parse(JSON.stringify(this.businessRule.rule[0]));
        this.ruleService.filterData.RULE_NAME = this.ruleDefinition.ruleIsUsedForToName;
        this.ruleService.filterData.UNIT_NAME = this.ruleDefinition.createRuleAtName;
        this.ruleService.filterData.MODULE_NAME = this.ruleDefinition.ruleAppliedToName;
        this.ruleService.filterData.RULE_APPLIED_TO = this.ruleDefinition.ruleAppliedToName;
        this.businessRule.rule[0].MAP_ID = this.ruleDefinition.mapId === 0 ? null : parseInt(this.ruleDefinition.mapId, 10);
        this.businessRule.rule[0].NOTIFICATION_ID = this.ruleDefinition.notificationId === 0 ?
            0 : parseInt(this.ruleDefinition.notificationId, 10);
        this.businessRule.rule[0].UPDATE_RULE_ORDER = this.ruleDefinition.updateRuleOrder;
        this.businessRule.rule[0].UPDATE_USER = this.updatedUser;
        this.businessRule.rule[0].RULE_EVALUATION_ORDER = this.ruleDefinition.ruleEvaluationOrder;
        this.businessRule.rule[0].RULE_EXPRESSION = '';
        this.ruleSetId = 0;
        this.populateResult(this.checkRuleSet, 0);
        this.showEmptySetValidation = this.ruleDefinition.totalNumberOfRuleset === 0 ? true : this.showEmptySetValidation;
        this.businessRule.rule[0].RULE_EXPRESSION = this.businessRule.rule[0].RULE_EXPRESSION.replace(/  +/g, ' ');
    }

    private prepareAuditLog(): any {
        let auditLogObj = {
            'Module': this.ruleDefinition.ruleAppliedToSubModule != 0 ? this.moduleName : this.ruleDefinition.ruleAppliedToName,
            'Submodule': this.ruleDefinition.ruleAppliedToName,
            'Used For': this.ruleDefinition.ruleIsUsedForToName,
            'Unit': this.ruleDefinition.createRuleAtName,
            'Description': this.ruleDefinition.description,
            'IS_ACTIVE': this.ruleDefinition.isActive,
            'Condition': this.ruleDefinition.ruleSummery.replaceAll(/<[^>]*>/g, ''),
            'Validation_MSG': this.ruleDefinition.userMessage ?  this.ruleDefinition.userMessage : '--NONE',
            'Map_Name': '',
            'Notification': ''
        }
        return auditLogObj;   
    }

    private getMapName(mapId): string {
        return this.mapList.find(ele => ele.MAP_ID == mapId).DESCRIPTION; 
    }

    private getNotificationName(notificationId): string {
        return this.notificationList.find(ele => ele.NOTIFICATION_TYPE_ID == notificationId).DESCRIPTION; 
    }

    saveOrUpdateRule() {
        if (this.ruleDefinition.ruleIdForEdit > 0) {
            this.businessRule.deletedRuleExpressionList = this.deletedRuleNumberList;
            this.$subscriptions.push(this.ruleService.updateBusinessRule(this.businessRule).subscribe(
                data => {
                    this.navigateToRuleList();
                    this.removeDataSourceFromRules();
                    this.saveAuditLog('U');
                    this.isSaving = false;
                },
                err => {
                    this.isSaving = false;
                }));
        } else {
            this.$subscriptions.push(this.ruleService.insertBusinessRule(this.businessRule).subscribe(
                (data: any) => {
                    this.navigateToRuleList();
                    this.saveAuditLog('I');
                    this.isSaving = false;
                },
                err => {
                    this.isSaving = false;
                }));
        }
    }

    private saveAuditLog(acType): void {
        let after = this.prepareAuditLog();
        after.Map_Name = this.ruleDefinition.mapId ? this.getMapName(this.ruleDefinition.mapId) : '--NONE--';
        after.Notification = this.ruleDefinition.notificationId ? this.getNotificationName(this.ruleDefinition.notificationId) : '--NONE--';
        this._auditLogService.saveAuditLog(acType, acType === 'I' ? {} : this.before, after, 'BUSINESS_RULE', Object.keys(after), this.ruleDefinition.ruleIdForEdit);
    }

    navigateToRuleList() {
        this._location.back();
    }
    populateResult(ruleList, parentId) {
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const ruleSet = ruleList.ruleSet[index];
            if (ruleSet.ruleSet.length === 0 && ruleSet.subRules.length === 0) {
                this.showEmptySetValidation = true;
            }
            this.businessRule.rule[0].RULE_EXPRESSION += ' ' + this.clearSpanFromCondition(ruleSet.condition) + ' (';
            ruleSet.subRules.forEach(subRule => {
                if ((!(['Is Empty', 'Is Not Empty'].includes(subRule.CONDITION_OPERATOR)))
                    && (subRule.LVALUE === null || subRule.LVALUE === '' || subRule.RVALUE_LABEL === null ||
                    subRule.RVALUE_LABEL === '' || subRule.CONDITION_OPERATOR === null || subRule.CONDITION_OPERATOR === '')) {
                    this.showEmptySetValidation = true;
                }
                this.ruleSetId++;
                subRule.condition = subRule.condition === '' ? this.clearSpanFromCondition(subRule.condition) : ' '
                    + this.clearSpanFromCondition(subRule.condition);
                this.businessRule.rule[0].RULE_EXPRESSION += this.clearSpanFromCondition(subRule.condition) +
                    ' E' + this.ruleSetId;
                subRule.EXPRESSION_NUMBER = this.ruleSetId;
                subRule.PARENT_EXPRESSION_NUMBER = parentId;
                this.businessRule.ruleExpression.push(subRule);
            });
            if (ruleSet.ruleSet.length > 0) {
                this.populateResult(ruleSet, this.ruleSetId);
            }
            this.businessRule.rule[0].RULE_EXPRESSION += ' )';
        }
    }

    clearSpanFromCondition(condition) {
        let refinedCondition = '';
        refinedCondition = condition.includes('AND') ? ' AND' : (condition.includes('OR') ? ' OR' : '');
        return refinedCondition;
    }

    removeDataSourceFromRules() {
        this.businessRule.ruleExpression.forEach(subRule => {
            subRule.ruleDataSource = null;
            subRule.conditionalOperators = null;
        });
    }

    populateSummery(ruleList) {
        for (let index = 0; index < ruleList.ruleSet.length; index++) {
            const ruleSet = ruleList.ruleSet[index];
            this.ruleDefinition.ruleSummery += ' ' + ruleSet.condition + '<span class=color-black> (</span>';
            ruleSet.subRules.forEach(subRule => {
                subRule.condition = subRule.condition === '' ? subRule.condition : '' + subRule.condition;
                subRule.condition = subRule.condition.length > 1 ? '<span class=color-black>'
                    + subRule.condition + '</span>' : subRule.condition;
                if (subRule.EXPRESSION_TYPE_CODE === 'Q' && subRule.ruleDataSource) {
                    if (['Is Empty','Is Not Empty'].includes(subRule.CONDITION_OPERATOR)) {
                        this.ruleDefinition.ruleSummery += ' ' + subRule.condition + ' ' + subRule.QUESTION + ' ' +
                        '<span class=color-black>' + subRule.CONDITION_OPERATOR + '</span>';
                    } else {
                        this.ruleDefinition.ruleSummery += ' ' + subRule.condition + ' ' + subRule.QUESTION + ' ' +
                        '<span class=color-black>' + subRule.CONDITION_OPERATOR + '</span>' + ' ' + subRule.RVALUE + '-' + subRule.RVALUE_LABEL;
                    }
                    subRule.ruleDataSource.forEach(datasource => {
                        if (subRule.RVALUE_LABEL.includes(datasource.OPTION_LABEL)) {
                            datasource.isChecked = true;
                        }
                    });
                } else {
                    if (subRule.EXPRESSION_TYPE_CODE == 'V' && subRule.questionnaireFieldType == 'date' && subRule.RVALUE_LABEL) {
                        const dateObject = getDateObjectFromTimeStamp(subRule.RVALUE_LABEL);
                        this.ruleDefinition.ruleSummery += ' ' + subRule.condition + ' ' + subRule.LVALUE + this.getParameterValues(subRule) +
                            '<span class=color-black>' + subRule.CONDITION_OPERATOR + '</span>' + ' ' + this.datePipe.transform(dateObject);
                    } else if (subRule.EXPRESSION_TYPE_CODE == 'V' && (['Is Empty','Is Not Empty'].includes(subRule.CONDITION_OPERATOR))) {
                        this.ruleDefinition.ruleSummery += ' ' + subRule.condition + ' ' + subRule.LVALUE + this.getParameterValues(subRule) +
                            '<span class=color-black>' + subRule.CONDITION_OPERATOR + '</span>';
                    } else {
                        this.ruleDefinition.ruleSummery += ' ' + subRule.condition + ' ' + subRule.LVALUE + this.getParameterValues(subRule) +
                            '<span class=color-black>' + subRule.CONDITION_OPERATOR + '</span>' + ' '+ subRule.RVALUE + '-' + subRule.RVALUE_LABEL;
                    }
                }
            });
            if (ruleSet.ruleSet.length > 0) {
                this.populateSummery(ruleSet);
            }
            this.ruleDefinition.ruleSummery += '<span class=color-black> )</span>';
        }
    }

    getParameterValues(subRule: any): string {
        if (!subRule.EXPRESSION_ARGUMENTS || !subRule.EXPRESSION_ARGUMENTS.length) {
            return ' ';
        }
        let parameters = ' (';
        subRule.EXPRESSION_ARGUMENTS.forEach((element, index) => {
            parameters += ` ${element.ARGUMENT_LABEL} - ${element.VALUE_DESCRIPTION ? element.VALUE_DESCRIPTION : 'undefined'} <span class=color-black>${index !== subRule.EXPRESSION_ARGUMENTS.length - 1 ? ', ' : ''}</span>`;
        });
        parameters += ') ';
        return parameters;
    }

    backToRuleList() {
        if (!this.ruleDefinition.isDirty) {
            this._location.back();
        } else {
            document.getElementById('update-button').click();
        }
    }

    getMapList() {
        this.$subscriptions.push(this.ruleService.getDashboardMapList().subscribe(
            data => {
                this.result = data;
                this.mapList = this.result.mapMaintenance.map;
                this.before.Map_Name = this.ruleDefinition.mapId ? this.getMapName(this.ruleDefinition.mapId) : '--NONE--';
            }));
    }
    getNotificationList() {
        this.$subscriptions.push(this.ruleService.getNotificationLists().subscribe(
            data => {
                this.result = data;
                this.notificationList = this.result.notificationList;
                this.before.Notification = this.ruleDefinition.notificationId ? this.getNotificationName(this.ruleDefinition.notificationId) : '--NONE--';
            }));
    }

    viewMap(mapId) {
        this.$subscriptions.push(this.ruleService.getMapDetailsById(mapId).subscribe(
            data => {
                this.resultReturns = data;
                this.mapDescription = this.resultReturns.mapDetails.mapList[0].DESCRIPTION;
                this.mapId = this.resultReturns.mapDetails.mapList[0].MAP_ID;
                this.mapUnit = this.resultReturns.mapDetails.mapList[0].UNIT_NAME;
                this.resultReturns.mapDetails.mapDetailList.sort(function (firstMap, secondMap) {
                    return firstMap.APPROVAL_STOP_NUMBER - secondMap.APPROVAL_STOP_NUMBER;
                });
                this.stopGroupList = this.groupBy(this.resultReturns.mapDetails.mapDetailList, 'APPROVAL_STOP_NUMBER');
                this.stopGroupListKeys = Object.keys(this.stopGroupList);
            }));
    }

    onMapSelectionChanged(mapId) {
        this.ruleDefinition.isDirty = true;
        this.viewMap(mapId);
    }

    groupBy(jsonData, key) {
        return jsonData.reduce(function (objResult, item) {
            (objResult[item[key]] = objResult[item[key]] || []).push(item);
            return objResult;
        }, {});
    }

    /**
     * set selected question and its tab in Questionnaire modal
     * it will be triggered while selecting edit icon or question answer option. 
     */
    setQuestionAnswer(event) {
        this.questionnaireModalValues = event;
        this.isShowQuestionModal = event.openModal;
    }

    /**
     * updating rule with currently selected question details from questionnaire modal
     * @param event 
     */
    updateRule(event) {
        if (event) {
            const RULE_SET = this.checkRuleSet.ruleSet[event.ruleIndex];
            event.singleRule.QUESTION_NAME = event.singleRule.EXPRESSION_TYPE_CODE + event.singleRule.LVALUE + ' ' + event.singleRule.QUESTION;
            RULE_SET.subRules[event.subRuleIndex] = event.singleRule;
            this.generateRuleSummery(null, event.singleRule);
            this.isShowQuestionModal = false;
        }
    }

    closeModal(event) {
        this.isShowQuestionModal = false;
    }

}
