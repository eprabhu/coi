export interface BudgetStatus {
    budgetStatusCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface RateType {
    rateClassCode: string;
    rateTypeCode: string;
    description: string;
    isActive: boolean;
    rateClassDescription: string;
}

export interface UnderRecoveryRateType {
    rateClassCode: string;
    rateTypeCode: string;
    description: string;
    isActive: boolean;
    rateClassDescription: string;
}

export interface BudgetPeriod {
    budgetPeriodId: number;
    moduleItemCode?: any;
    moduleItemKey?: any;
    versionNumber?: any;
    budgetPeriod: number;
    endDate: any;
    startDate: any;
    totalCost: number;
    totalDirectCost: number;
    totalIndirectCost: number;
    updateTimeStamp: number;
    updateUser: string;
    periodLabel?: any;
    isObligatedPeriod?: any;
    subcontractCost: number;
    costSharingAmount: number;
    underRecoveryAmount: number;
    totalDirectCostLimit: number;
    totalCostLimit: number;
    comments?: any;
    totalOfTotalCost: number;
    totalModifiedDirectCost: number;
    underrecoveryAmount: number;
    totalInKind: number;
    budgetDetails: any;
}

export interface InstituteProposalBudgetHeader {
    budgetId: number;
    proposalId: number;
    moduleItemCode?: any;
    moduleItemKey?: any;
    versionNumber: number;
    moduleSequenceNumber?: any;
    obligatedTotal?: any;
    obligatedChange?: any;
    budgetStatusCode: string;
    budgetStatus: BudgetStatus;
    isAutoCalc: boolean;
    budgetTypeCode?: any;
    budgetType?: any;
    endDate: any;
    startDate: any;
    totalCost: number;
    totalDirectCost: number;
    totalIndirectCost: number;
    costSharingTypeCode: number;
    costSharingType: any;
    comments: string;
    campusFlag: string;
    createTimeStamp: number;
    createUser: string;
    createUserName: string;
    updateTimeStamp: number;
    updateUser: string;
    updateUserName: string;
    rateClassCode: string;
    rateTypeCode: string;
    anticipatedTotal?: any;
    rateType: RateType;
    budgetPeriods: BudgetPeriod[];
    totalSubcontractCost: number;
    isFinalBudget: boolean;
    costSharingAmount: number;
    underRecoveryAmount: number;
    residualFunds?: any;
    totalCostLimit?: any;
    modularBudgetFlag: boolean;
    submitCostSharingFlag: boolean;
    underRecoveryRateClassCode: string;
    underRecoveryRateTypeCode: string;
    underRecoveryRateType: UnderRecoveryRateType;
    isLatestVersion: boolean;
    isApprovedBudget: boolean;
    budgetTemplateTypeId?: any;
    onCampusRates?: any;
    offCampusRates?: any;
    totalModifiedDirectCost: number;
    totalInKind: number;
    totalOfTotalCost: number;

}

export class BudgetData {
    instProposal?: any;
    proposalId?: any;
    userName?: any;
    personId?: any;
    devProposalId?: any;
    devProposalIds?: any;
    statusCode?: any;
    statusCodes?: any;
    availableRights?: any;
    isFundingSupportDeclarationRequired: boolean;
    isReplaceAttachmentEnabled: boolean;
    sortBy?: any;
    reverse?: any;
    instituteProposalAttachments?: any;
    instituteProposalPersons?: any;
    instituteProposalResearchAreas?: any;
    instituteProposalSpecialReviews?: any;
    instituteProposalPerson?: any;
    instituteProposalSpecialReview?: any;
    instituteProposalResearchArea?: any;
    instituteProposalBudgetHeader: InstituteProposalBudgetHeader;
    instituteProposalAttachment?: any;
    instPropPersonId?: any;
    newIPPersonAttachments?: any;
    grantCallTypes?: any;
    proposalPersonRoles?: any;
    proposalAttachmentTypes?: any;
    proposalTypes?: any;
    awardTypes?: any;
    activityTypes?: any;
    instituteProposalKeyword?: any;
    instituteProposalKeywords?: any;
    reviewTypes?: any;
    specialReviewApprovalTypes?: any;
    researchTypes?: any;
    researchDescription?: any;
    multiDisciplinaryDescription?: any;
    instituteProposalActionTypes?: any;
    instituteProposalActionType?: any;
    instituteProposalActionLogs?: any;
    proposalAttachments?: any;
    isShowInKind: boolean;
    isShowCostShareAndUnderrecovery: boolean;
    budgetStatus: BudgetStatus[];
    rateTypes: RateType[];
    isShowModifiedDirectCost: boolean;
    isCampusFlagEnabled: boolean;
    overHeadRateTypeEnabled: boolean;
    description?: any;
    isAwarded?: any;
    proposalNumber?: any;
    isKeyPersonMerge: boolean;
    isSpecialReviewMerge: boolean;
    isBudgetMerge: boolean;
    disciplineClusters?: any;
    isShowBudgetOHRatePercentage: boolean;
    enableActivityGrantCallMapping?: any;
    commentType?: any;
    instituteProposalComment?: any;
    instituteProposalComments?: any;
    showBudgetOHRatePercentage: boolean;
    isBudgetVersionEnabled: boolean;
    isShowCostShareAndUnderRecovery: boolean;
    costSharingTypes: any;
    costShareTypeCode: number;
    enableCostShareStatus: boolean;
}
