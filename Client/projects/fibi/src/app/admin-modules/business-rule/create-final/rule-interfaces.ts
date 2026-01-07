export interface RuleSet {
    ruleSetNumber: number;
    parentRuleNumber: number;
    condition: string;
    isLogicalAnd: boolean;
    ruleSet: Array<RuleSet>;
    subRules: Array<Rule>;
}

export interface Rule {
    CONDITION_OPERATOR: string;
    EXPRESSION_NUMBER: number;
    EXPRESSION_TYPE_CODE: string;
    LVALUE: string;
    LVALUE_LABEL: string;
    PARENT_EXPRESSION_NUMBER: number;
    QUESTION: string;
    RULES_EXPERSSION_ID: number;
    RVALUE: string;
    RVALUE_LABEL: string;
    UPDATE_USER: string;
    condition: string;
    conditionalOperators: Array<ConditionalOperators>;
    isLogicalAnd: boolean;
    questionId: number;
    questionnaireFieldType: string;
    ruleDataSource: any;
    viewQuestion: boolean;
    EXPRESSION_ARGUMENTS?: Array<FunctionArgument>;
    FUNCTION_PARAMETERS?: Array<FunctionArgument>;
    FUNCTION_DESCRIPTION?: string;
    QUESTIONNAIRE_DESCRIPTION?: string;
    QUESTION_NAME?: string;
    selectedQuestion?: any;
    selectedQuestionnaire?: string;
}
export interface QueryBuilderConfig {
    addRuleSet?: (parent: RuleSet) => void;
}

export interface FunctionArgument {
    LOOKUP_TYPE: string;
    ARGUMENT_LABEL: string;
    DESCRIPTION: string;
    LOOKUP_WINDOW_NAME: string;
    VALUE_DESCRIPTION?: string;
    VALUE?: string;
    FUNCTION_NAME?: string;
    ARGUMENT_NAME?: string;
    BUSINESS_RULE_EXP_ARGS_ID?: number;
    RULES_EXPERSSION_ID: number;
    RULE_ID: number;
}

export interface BusinessRule {
    rule?: any;
    ruleExpression?: any;
    deletedRuleExpressionList?: any;
    deletedRuleExpressionArgs?: any;
}

export interface BusinessRuleDetails {
    ruleVariable?: any;
    ruleFunction?: any;
    ruleQuestion?: any;
    lookUpDetails?: any;
    questionDetails?: any;
    optionList?: any;
}

export class FunctionArgumentDetails {
    ruleId?: any;
    questionId?: any;
    moduleCode?: any;
    subModuleCode?: any;
    lookUpWindowName?: any;
    unitList?: any;
    notificationList?: any;
    moduleSubmoduleList?: any;
    deleteRuleList?: any;
    ruleEvaluationOrderList?: any;
    functionArguments: Array<FunctionArgument>;
    unitNumber?: any;
    ruleType?: any;
    functionName: string;
    businessRule: BusinessRule;
    businessRuleDetails: BusinessRuleDetails;
}

export class FunctionDetails {
    functionName: string;
    ruleIndex: number;
    singleRule: Rule;
    subRuleIndex: number;
}

export interface ConditionalOperators {
    name: string;
    operator: string;
}

export interface RuleTypeOptions {
    id: string;
    name: string;
}

export interface RuleDataSource {
    arrayList: Array<ArrayList>;
    contextField: string;
    defaultValue: string;
    filterFields: string;
    formatString: string;
    OPTION_LABEL?: string;
    isChecked?: boolean;
    QUESTION_NUMBER?: string;
}

export interface ArrayList {
    value: string;
}

export interface SearchOptions {
    arrayList: any;
    contextField: string;
    filterFields: string;
    formatString: string;
    defaultValue?: string;
}
