export interface MetaRuleDetails {
    metaRuleDetailId: number;
    metaRuleId: number;
    nodeNumber: number;
    ruleId: number;
    parentNode: number;
    nextNode: string;
    nodeIfTrue: string;
    nodeIfFalse: string;
    updateTimestamp: any;
    updateUser: any;
}

export class MetaRule {
    metaRuleId: any = null;
    unitNumber: any = null;
    metaRuleType: any = null;
    description: any = null;
    moduleCode: any = null;
    subModuleCode: any = null;
    updateTimestamp: any = null;
    updateUser: any = null;
    isEmptyRules: boolean;
    metaRuleDetails: MetaRuleDetails[];
}

export class DeleteObject {
    isChildAvailable: boolean;
    ruleName: string;
    metaRuleDetailId: number;
    metaRuleId: number;
    condition: string;
    parentNodeNumber: number;
    isRootNode: boolean;
}

export class SelectedCriteria {
    unitNumber: any = null;
    unitName: any = null;
    moduleCode: any = null;
    moduleName: any = null;
    subModuleCode: any = null;
    ruleCode: any = null;
    ruleName: any = null;
    ruleId: any;
    showActive:string;
}
