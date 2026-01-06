/** last updated by Archana R on 10-12-2019 **/

import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { BusinessRuleService } from '../common/businessrule.service';
import { CreateFinalComponent } from '../create-final/create-final.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Rule, RuleSet } from '../create-final/rule-interfaces';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getCompleterOptionsForLeadUnitWithCustField } from '../../../common/services/completer.config';
import { mapModules, setCompleterOptions } from '../common/commonFunctions';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';

@Component({
	selector: 'app-create-first',
	templateUrl: './create-first.component.html',
	styleUrls: ['./create-first.component.css']
})
export class CreateFirstComponent implements OnInit, AfterViewInit, OnDestroy {

	@ViewChild(CreateFinalComponent, { static: false }) child;
	loadCreateFirst = false;
	loadCreateFinal = false;
	formControlValue = '';
	questionnaireFieldType: any;
	functionRvalueData: any;
	dataSource: any;
	viewQuestion = false;
	conditionalOperators: any;
	questionObject: any;
	questionId: 0;
	unitUsedForList: any = [
		{ id: 'N', name: 'Notification' },
		{ id: 'Q', name: 'Questionnaire' },
		{ id: 'R', name: 'Routing' },
		{ id: 'VE', name: 'Validation-Error' },
		{ id: 'VW', name: 'Validation-Warning' },
	  ];
	appliedList: any[];
	appliedListKeys: any[];
	result = '';
	isShowToast = false;
	ruleDefinitionResult: any = {};
	resultData: any = {};
	updatedUser: any;
	splittedExpressionList: string[] = [];
	ruleDefinition: any = {
		UPDATE_USER: '',
		createRuleAt: '',
		ruleIsUsedFor: '',
		ruleAppliedToModule: 0,
		ruleAppliedToSubModule: 0,
		ruleAppliedToForHtml: '',
		description: '',
		ruleAppliedToName: '',
		ruleIsUsedForToName: '',
		createRuleAtName: '',
		ruleIdForEdit: 0,
		totalNumberOfRuleset: 0,
		totalNumberofRules: 0,
		ruleExpression: [],
		mapId: 0,
		isActive: '',
		conditionType: '',
		ruleSummery: '',
		expressionIdList: [],
		isAllDataPopulated: false,
		isDirty: false,
		notificationId: 0,
		userMessage: '',
		updateRuleOrder: 'false',
		ruleEvaluationOrder: 0,
	};
	conditionOperator: any = [
		{ operator: 'Is Empty', name: 'Is Empty' },
        { operator: 'Is Not Empty', name: 'Is Not Empty' },
		{ operator: '=', name: 'Equal to' },
		{ operator: '!=', name: 'Not equal to' },
		{ operator: '>', name: 'Greater than' },
		{ operator: '<', name: 'Less than' },
		{ operator: '>=', name: 'Greater than or equal to' },
		{ operator: '<=', name: 'Less than or equal to' },
		{ operator: '', name: 'Contains' },
	];
	functionConditionOperator: any = [
		{ operator: '=', name: 'Equal to' }
	];
	checkRuleSet: RuleSet = { ruleSetNumber: 0, parentRuleNumber: 0, isLogicalAnd: true, condition: '', ruleSet: [], subRules: [] };
	completerUnitListOptions: any = {};
	$subscriptions: Subscription[] = [];
	map = new Map();
	completerModuleOptions: any = {};
	completerSubModuleOptions: any = {};
	completerUsageOption: any = {};
	searchFieldType: any;
	questionName: any;
	moduleList: any;

	constructor(private ruleService: BusinessRuleService, private router: Router,
		private activatedRoute: ActivatedRoute, private _commonService: CommonService, private _location: Location) { }

	ngAfterViewInit() {
		if (this.child !== undefined) {
			this.ruleDefinition = this.child.ruleDefinition;
			this.checkRuleSet = this.child.checkRuleSet;
		}
	}
	async ngOnInit() {
		await this.getBusinessRuleList();
		this.completerUsageOption = setCompleterOptions(this.unitUsedForList, 'name', 'name', 'name');
		this.map.clear();
		this.ruleDefinition.isDirty = false;
		this.updatedUser = this._commonService.getCurrentUserDetail('userName');
		this.getUnitList();
		this.ruleDefinition.UPDATE_USER = this.updatedUser;
		this.$subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
			this.ruleDefinition.ruleIdForEdit = params['ruleId'] === undefined ? 0 : params['ruleId'];
			this.ruleDefinition.ruleIdForEdit > 0 ? this.getBusinessRuleById() : this.createBusinessRule();
		}));
	}

	createBusinessRule() {
		if (!isEmptyObject(this.ruleService.filterData) && !this.loadCreateFinal) {
			this.setFilterData();
		}
		this.loadCreateFirst = true;
		this.ruleDefinition.isAllDataPopulated = true;
		this.ruleDefinition.totalNumberOfRuleset++;
		this.ruleDefinition.totalNumberofRules++;
		this.checkRuleSet.ruleSet = this.checkRuleSet.ruleSet.concat([{
			parentRuleNumber: 0, ruleSetNumber: 1, isLogicalAnd: true,
			condition: '', ruleSet: [], subRules: []
		}]);
		this.checkRuleSet.ruleSet[0].subRules = this.checkRuleSet.subRules.concat({
			conditionalOperators: this.conditionOperator,
			questionId: 0,
			viewQuestion: false,
			ruleDataSource: null,
			questionnaireFieldType: '',
			condition: '',
			isLogicalAnd: true,
			RULES_EXPERSSION_ID: 0,
			EXPRESSION_NUMBER: 1,
			PARENT_EXPRESSION_NUMBER: 0,
			EXPRESSION_TYPE_CODE: 'V',
			LVALUE: '',
			LVALUE_LABEL: '',
			QUESTION: '',
			CONDITION_OPERATOR: '',
			RVALUE: '',
			RVALUE_LABEL: '',
			UPDATE_USER: this.updatedUser
		});
	}

	getBusinessRuleById() {
		this.$subscriptions.push(this.ruleService.getBusinessRuleById(this.ruleDefinition.ruleIdForEdit)
			.subscribe(
				data => {
					this.ruleDefinitionResult = data;
					this.ruleService.filterData = JSON.parse(JSON.stringify(this.ruleDefinitionResult.businessRule.rule[0]));
					this.setRuleDefinitionValues();
					this.ruleService.filterData.RULE_TYPE = this.ruleDefinition.ruleIsUsedFor;
					this.ruleService.filterData.RULE_NAME = this.ruleDefinition.ruleIsUsedForToName;
					this.ruleDefinition.ruleExpression = this.ruleDefinitionResult.businessRule.ruleExpression;
					this.splittedExpressionList = this.ruleDefinitionResult.businessRule.rule[0].RULE_EXPRESSION.split(' ');
					this.splittedExpressionList = this.splittedExpressionList.filter(function (str) {
						return /\S/.test(str);
					});
					this.ruleDefinition.totalNumberOfRuleset = 0;
					this.ruleDefinition.isDirty = true;
					this.getFunctionValues();
				}));
	}

	getUnitList() {
		this.$subscriptions.push(this.ruleService.getUnitList().subscribe(
			data => {
				this.resultData = data;
				this.completerUnitListOptions = getCompleterOptionsForLeadUnitWithCustField(this.resultData.unitList);
				this.completerUnitListOptions.defaultValue = this.ruleService.filterData.UNIT_NUMBER ?
					this.ruleService.filterData.UNIT_NUMBER + '-' + this.ruleService.filterData.UNIT_NAME :
					null;
			}));
	}

	getBusinessRuleList() {
		this.$subscriptions.push(this.ruleService.getBusinessRuleList().subscribe(
			data => {
				this.resultData = data;
				this.moduleList = this.resultData.moduleSubmoduleList.filter(item => item.IS_ACTIVE === 'Y');
				if (!this.ruleService.filterData.moduleList) {
					this.ruleService.filterData.moduleList = mapModules(this.moduleList);
				}
				this.completerModuleOptions = setCompleterOptions(this.ruleService.filterData.moduleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
				this.completerSubModuleOptions = setCompleterOptions(this.ruleService.filterData.moduleIndex > -1 ?
					this.ruleService.filterData.moduleList[this.ruleService.filterData.moduleIndex].subModules
					: [], 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
				if (this.ruleService.filterData.moduleIndex > -1) {
					this.completerModuleOptions.defaultValue = this.ruleService.filterData.SUB_MODULE_CODE ?
						this.ruleService.filterData.submodule.moduleName : this.ruleService.filterData.MODULE_NAME;
					this.completerModuleOptions = Object.assign({}, this.completerModuleOptions);
					this.completerSubModuleOptions.defaultValue = this.ruleService.filterData.SUB_MODULE_CODE ?
						this.ruleService.filterData.MODULE_NAME : '';
					this.completerSubModuleOptions = Object.assign({}, this.completerSubModuleOptions);
				}
			}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}
	setFilterData() {
		this.completerUnitListOptions.defaultValue = this.ruleService.filterData.UNIT_NAME ?
			this.ruleService.filterData.UNIT_NAME + '-' + this.ruleService.filterData.UNIT_NAME :
			null;
		this.completerUnitListOptions = Object.assign({}, this.completerUnitListOptions);
		this.completerUsageOption.defaultValue = this.ruleService.filterData.RULE_NAME;
		this.completerUsageOption = Object.assign({}, this.completerUsageOption);
		this.onUnitSelect(this.ruleService.filterData);
		this.ruleDefinition.ruleIsUsedFor = this.ruleService.filterData.RULE_TYPE;
		this.ruleDefinition.ruleIsUsedForToName = this.ruleService.filterData.RULE_NAME;
		this.ruleDefinition.isDirty = true;
		this.ruleDefinition.isActive = true;
		if (this.ruleDefinition.ruleIsUsedFor === 'R') {
			this.ruleDefinition.updateRuleOrder = 'true';
		}
		this.ruleDefinition.ruleAppliedToModule = this.ruleService.filterData.MODULE_CODE;
		this.ruleDefinition.ruleAppliedToSubModule = this.ruleService.filterData.SUB_MODULE_CODE;
		this.ruleDefinition.ruleAppliedToForHtml = '' +
			((this.ruleService.filterData.MODULE_CODE * 10) + this.ruleService.filterData.SUB_MODULE_CODE) + '';
		this.ruleDefinition.ruleAppliedToName = this.ruleService.filterData.MODULE_NAME;
		this.$subscriptions.push(this.ruleService.getRuleDetailsList
			(this.ruleService.filterData.MODULE_CODE, this.ruleService.filterData.SUB_MODULE_CODE).subscribe(
				data => {
					this.ruleDefinition.conditionType = data;
				}));
		this.ruleDefinition.updateRuleOrder = 'true';
	}
	setRuleDefinitionValues() {
		this.ruleDefinition.description = this.ruleDefinitionResult.businessRule.rule[0].DESCRIPTION;
		this.ruleDefinition.ruleIsUsedFor = this.ruleDefinitionResult.businessRule.rule[0].RULE_TYPE;
		this.ruleDefinition.createRuleAt = this.ruleDefinitionResult.businessRule.rule[0].UNIT_NUMBER;
		this.ruleDefinition.ruleAppliedToName = this.ruleDefinitionResult.businessRule.rule[0].RULE_APPLIED_TO;
		this.ruleDefinition.ruleIsUsedForToName = this.unitUsedForList.filter(item => item.id === this.ruleDefinition.ruleIsUsedFor)[0].name;
		this.ruleDefinition.createRuleAtName = this.ruleDefinitionResult.businessRule.rule[0].UNIT_NAME;
		this.ruleDefinition.ruleAppliedToModule = this.ruleDefinitionResult.businessRule.rule[0].MODULE_CODE;
		this.ruleDefinition.userMessage = this.ruleDefinitionResult.businessRule.rule[0].USER_MESSAGE;
		this.ruleDefinition.ruleEvaluationOrder = this.ruleDefinitionResult.businessRule.rule[0].RULE_EVALUATION_ORDER;
		this.ruleDefinition.ruleAppliedToSubModule = this.ruleDefinitionResult.businessRule.rule[0].SUB_MODULE_CODE;
		this.ruleDefinition.ruleAppliedToForHtml = '' + ((this.ruleDefinition.ruleAppliedToModule * 10) +
			this.ruleDefinition.ruleAppliedToSubModule) + '';
		this.ruleDefinition.isActive = this.ruleDefinitionResult.businessRule.rule[0].IS_ACTIVE;
		this.ruleDefinition.mapId = this.ruleDefinitionResult.businessRule.rule[0].MAP_ID;
		this.ruleDefinition.notificationId = this.ruleDefinitionResult.businessRule.rule[0].NOTIFICATION_ID;
		this.$subscriptions.push(this.ruleService.getRuleDetailsList(this.ruleDefinition.ruleAppliedToModule,
			this.ruleDefinition.ruleAppliedToSubModule).subscribe(
				data => {
					this.ruleDefinition.conditionType = data;
					this.populateViewDataMain();
				}));
	}
	async populateViewDataMain() {
		await this.populateViewData(this.checkRuleSet, 0, '');
		this.ruleDefinition.isAllDataPopulated = true;

	}
	async populateViewData(ruleSet, elementIndex, condition) {
		if (elementIndex < this.splittedExpressionList.length) {
			const element = this.splittedExpressionList[elementIndex];
			elementIndex++;
			if (element === '(') {
				this.ruleDefinition.totalNumberOfRuleset++;
				this.setRuleSet(ruleSet, this.ruleDefinition.totalNumberOfRuleset, ruleSet.ruleSetNumber, condition);
				await this.populateViewData(ruleSet.ruleSet[ruleSet.ruleSet.length - 1], elementIndex, '');
			} else if (element === ')') {

				if (ruleSet.parentRuleNumber !== 0) {
					const parentNode = this.getParentNode(this.checkRuleSet, ruleSet);
					await this.populateViewData(parentNode, elementIndex, '');
				} else {
					await this.populateViewData(this.checkRuleSet, elementIndex, '');
				}
			} else if (element.startsWith('E')) {
				this.ruleDefinition.totalNumberofRules++;
				await this.setRule(ruleSet, element, condition);
				await this.populateViewData(ruleSet, elementIndex, '');
			} else {
				await this.populateViewData(ruleSet, elementIndex, element);
			}
		}
		setTimeout(() => {
			this.loadCreateFinal = true;
			this.loadCreateFirst = false;
		});
	}
	getParentNode(ruleList, child) {
		for (let i = 0; i < ruleList.ruleSet.length; i++) {
			const rule = ruleList.ruleSet[i];
			if (rule.ruleSetNumber === child.parentRuleNumber) {
				return rule;
			}
			if (rule.ruleSet.length > 0) {
				return this.getParentNode(rule, child);
			}
		}
	}
	setRuleSet(ruleSet, ruleSetNumber, parentNumber, condition) {
		ruleSet.ruleSet = ruleSet.ruleSet.concat([{
			parentRuleNumber: parentNumber, ruleSetNumber: ruleSetNumber,
			condition: condition,
			isLogicalAnd: condition === 'OR' ? false : true,
			ruleSet: [], subRules: []
		}]);
	}

	async setRule(ruleSet, element: string, condition: string) {
		const splittedElement = element.split('E');
		const expressionNumber = parseInt(splittedElement[1], 10);
		const currentExpression = this.ruleDefinition.ruleExpression.
			filter(rule => rule.EXPRESSION_NUMBER === expressionNumber);
		this.questionnaireFieldType = null;
		this.dataSource = null;
		this.questionId = 0;
		this.viewQuestion = false;
		await this.setDefaultType(currentExpression[0].EXPRESSION_TYPE_CODE, currentExpression[0].LVALUE);
		this.ruleDefinition.expressionIdList.push(currentExpression[0].RULES_EXPERSSION_ID);
		this.setSubRule(ruleSet, condition, currentExpression);
	}

	setSubRule(ruleSet, condition, currentExpression) {
		ruleSet.subRules = ruleSet.subRules.concat({
			conditionalOperators: this.conditionalOperators,
			questionId: this.questionId,
			viewQuestion: this.viewQuestion,
			ruleDataSource: this.dataSource,
			questionnaireFieldType: this.questionnaireFieldType,
			condition: condition,
			isLogicalAnd: condition === 'OR' ? false : true,
			RULES_EXPERSSION_ID: currentExpression[0].RULES_EXPERSSION_ID,
			EXPRESSION_NUMBER: currentExpression[0].EXPRESSION_NUMBER,
			PARENT_EXPRESSION_NUMBER: currentExpression[0].PARENT_EXPRESSION_NUMBER,
			EXPRESSION_TYPE_CODE: currentExpression[0].EXPRESSION_TYPE_CODE,
			LVALUE: currentExpression[0].LVALUE,
			LVALUE_LABEL: currentExpression[0].LVALUE_LABEL,
			QUESTION: this.questionName,
			CONDITION_OPERATOR: currentExpression[0].CONDITION_OPERATOR,
			RVALUE: currentExpression[0].RVALUE,
			RVALUE_LABEL: currentExpression[0].RVALUE_LABEL,
			UPDATE_USER: currentExpression[0].UPDATE_USER,
			EXPRESSION_ARGUMENTS: currentExpression[0].EXPRESSION_ARGUMENTS,
			FUNCTION_PARAMETERS: currentExpression[0].FUNCTION_PARAMETERS
		});
	}


	async setDefaultType(typeCode, expressionLValue) {
		if (typeCode === 'V') {
			this.conditionalOperators = this.conditionOperator;
			this.questionObject = this.ruleDefinition.conditionType.businessRuleDetails.ruleVariable.
				filter(item => item.VARIABLE_NAME === expressionLValue);
			this.questionId = 0;
			if (this.questionObject.length && this.questionObject[0].SHOW_LOOKUP === 'Y') {
				this.questionnaireFieldType = 'ShowLookUp';
				await this.getVariableList(this.questionObject[0].LOOKUP_WINDOW_NAME);
			} else if (this.questionObject.length && this.questionObject[0].SHOW_LOOKUP === 'N') {
				this.questionnaireFieldType = this.questionObject[0].LOOKUP_WINDOW_NAME == 'DATE' ? 'date' : 'HideLookUp';
			}
			this.viewQuestion = false;
		} else if (typeCode === 'Q') {
			await this.getQuestionDetailsById(expressionLValue);
			this.viewQuestion = true;
		} else if (typeCode === 'F') {
			this.conditionalOperators = this.functionConditionOperator;
			this.questionnaireFieldType = '';
			this.questionId = 0;
			this.viewQuestion = false;
		}
	}

	async getVariableList(lookUpWindowName) {
		await this.ruleService.getAsyncVariableList(lookUpWindowName).then(
			data => {
				this.resultData = data;
			});
	}
	async getQuestionDetailsById(number: any) {
		await this.ruleService.getAsyncQuestionDetailsById(Number(number)).then(
			data => {
				this.resultData = data;
				this.dataSource = this.resultData.businessRuleDetails.optionList;
				this.questionObject = this.resultData.businessRuleDetails.questionDetails && this.resultData.businessRuleDetails.questionDetails[0];
				if (this.questionObject) {
					this.questionnaireFieldType = this.questionObject.ANSWER_TYPE;
					this.searchFieldType = this.questionObject.LOOKUP_TYPE;
					this.questionName = this.questionObject.QUESTION;
				}
			}
		);
	}

	getFunctionValues() {
		this.functionRvalueData = [{ value: 'True' },
		{ value: 'False' }];
	}
	onRuleUsedSelectionChange(selectedItem) {
		if (selectedItem != null) {
			this.ruleDefinition.isDirty = true;
			this.ruleDefinition.ruleIsUsedFor = selectedItem.id;
			this.ruleDefinition.ruleIsUsedForToName = selectedItem.name;
			if (this.ruleDefinition.ruleIsUsedFor === 'R') {
				this.ruleDefinition.updateRuleOrder = 'true';
			}
		} else {
			this.ruleDefinition.ruleIsUsedFor = '';
			this.ruleDefinition.ruleIsUsedForToName = '';
		}
	}
	onRuleAppliedToSelectionChange(selectedItem) {
		if (selectedItem) {
			this.ruleDefinition.isDirty = true;
			this.ruleDefinition.ruleAppliedToModule = selectedItem.MODULE_CODE;
			this.ruleDefinition.ruleAppliedToSubModule = selectedItem.SUB_MODULE_CODE;
			this.ruleDefinition.ruleAppliedToForHtml = '' + ((selectedItem.MODULE_CODE * 10) + selectedItem.SUB_MODULE_CODE) + '';
			this.ruleDefinition.ruleAppliedToName = selectedItem.DESCRIPTION;
			this.$subscriptions.push(this.ruleService.getRuleDetailsList(selectedItem.MODULE_CODE, selectedItem.SUB_MODULE_CODE).subscribe(
				data => {
					this.ruleDefinition.conditionType = data;
				}));
			this.ruleDefinition.updateRuleOrder = 'true';
		} else {
			this.ruleDefinition.ruleAppliedToSubModule = 0;
			// tslint:disable-next-line:triple-equals
			this.ruleDefinition.ruleAppliedToName = mapModules(this.moduleList).find(ele =>
				ele.MODULE_CODE == this.ruleDefinition.ruleAppliedToModule).DESCRIPTION;
		}
	}
	onUnitSelect(selectedItem) {
		if (selectedItem) {
			this.ruleDefinition.isDirty = true;
			this.ruleDefinition.createRuleAt = selectedItem.UNIT_NUMBER;
			this.ruleDefinition.createRuleAtName = selectedItem.UNIT_NAME;
			this.ruleDefinition.updateRuleOrder = 'true';
		} else {
			this.ruleDefinition.isDirty = false;
			this.ruleDefinition.createRuleAt = null;
			this.ruleDefinition.createRuleAtName = null;
		}
	}
	onDescriptionChanged() {
		this.ruleDefinition.isDirty = true;
	}
	backToRuleList() {
		if (!this.ruleDefinition.isDirty) {
			this.navigateToRueList();
		} else {
			document.getElementById('updatebutton').click();
		}
	}
	navigateToRueList() {
		this._location.back();
	}

	/**
	 * Validates mandatory fields and proceeds to the next section.
	 */
	validateRuleDefinition() {
		this.checkMandatory();
		if (this.map.size < 1 && !this.isShowToast) {
			this.togglePage();
		}
	}

	checkMandatory() {
		this.map.clear();
		this.isShowToast = false;
		if (!this.ruleDefinition.createRuleAtName) {
			this.map.set('departmentName', 'department');
			this.completerUnitListOptions.errorMessage = 'Please choose the department where the rule is applicable at.';
		}
		if (!this.ruleDefinition.ruleIsUsedFor) {
			this.map.set('usedFor', 'use');
			this.completerUsageOption.errorMessage = 'Please choose the type where the rule is applicable for.';
		}
		if (!this.ruleDefinition.ruleAppliedToModule) {
			this.map.set('moduleName', 'module');
			this.completerModuleOptions.errorMessage = 'Please choose the module where the rule is applicable to.';
		}
		if (this.ruleDefinition.description.trim().length === 0){
			this.map.set('description', 'Please specify the rule description');
		}
		if (this.ruleDefinition.description.length > 200) {
			this.map.set('descriptionlength', 'The maximum description length is limited to 200 characters.');
		}
	}

	togglePage() {
		if (this.ruleDefinition.isAllDataPopulated) {
			window.scroll(0, 0);
			this.loadCreateFirst = !this.loadCreateFirst;
			this.loadCreateFinal = !this.loadCreateFinal;
		} else {
			document.getElementById('loadingButton').click();
		}
	}

	selectModule(event) {
		const SUBMODULELIST = (event && event.subModules) ? event.subModules.filter(item => item.IS_ACTIVE === 'Y') : [];
		this.completerSubModuleOptions = setCompleterOptions(SUBMODULELIST, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
		if (event) {
			this.onRuleAppliedToSelectionChange(event);
		} else {
			this.ruleDefinition.ruleAppliedToModule = 0;
			this.ruleDefinition.ruleAppliedToSubModule = 0;
			this.ruleDefinition.ruleAppliedToName = '';
			this.completerSubModuleOptions.defaultValue = '';
		}
	}
}
