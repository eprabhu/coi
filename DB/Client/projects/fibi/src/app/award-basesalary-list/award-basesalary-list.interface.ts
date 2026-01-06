export class SearchHeader {
    awardNumber: string;
    accountNumber: string;
    personId: string;
}

export interface ClaimManpower {
    claimManpowerId?: any;
    claimNumber?: any;
    claimId?: any;
    awardManpowerId?: any;
    awardManpowerResourceId?: any;
    personId?: any;
    isGrantUsed?: any;
    sourceOfFunding?: any;
    isApprovedForForeignStaff?: any;
    dateOfApproval?: any;
    isJobReqPHDQualification?: any;
    percntgeTimeSpentOnProg?: any;
    institution?: any;
    nationalityWaiverDesc?: any;
    updateUser?: any;
    updateTimeStamp?: any;
    jobReqPHDQualificationValue?: any;
    grantUsedValue?: any;
    approvedForForeignStaff?: any;
}

export interface AwardBaseSalaryList {
    manpowerResourceId?: any;
    awardManpowerId?: any;
    personId: string;
    rolodexId?: any;
    positionId: string;
    fullName: string;
    emailAddress: string;
    positionStatusCode?: any;
    costAllocation: number;
    planCompensationTypeCode?: any;
    manpowerPlanCompensationType?: any;
    planJobProfileTypeCode?: any;
    manpowerPlanJobProfileType?: any;
    compensationGradeTypeCode?: any;
    manpowerCompensationGradeType?: any;
    jobProfileTypeCode?: any;
    manpowerJobProfileType?: any;
    planStartDate?: any;
    planEndDate?: any;
    planDuration?: any;
    chargeStartDate: number;
    chargeEndDate: number;
    chargeDuration?: any;
    committedCost?: any;
    resourceTypeCode?: any;
    manpowerResourceType?: any;
    description?: any;
    positionOwnedByAward?: any;
    candidateTitleTypeCode?: any;
    positionTriggerDate?: any;
    updateTimestamp?: any;
    updateUser?: any;
    createUser?: any;
    createTimestamp?: any;
    manpowerCandidateTitleType?: any;
    manpowerPositionStatus?: any;
    plannedBaseSalary: number;
    plannedSalary: number;
    resourceUniqueId?: any;
    awardNumber: string;
    moduleCode?: any;
    subModuleCode?: any;
    freezeDate?: any;
    upgradeTypeCode?: any;
    manpowerUpgradeType?: any;
    multiplierValueUsed: number;
    previousChargeEndDate?: any;
    previousChargeStartDate?: any;
    baseSalaryUsed: string;
    isRemainingCAFromWBS?: any;
    manpower?: any;
    department?: any;
    personStatus?: any;
    designation?: any;
    awardManpower?: any;
    payrollAmount: number;
    isResourceExitInWorkday: boolean;
    claimManpower: ClaimManpower;
    organization?: any;
    accountNumber: string;
    candidateType?: any;
    awardId?: any;
    involvementFrom?: any;
    involvementTo?: any;
    dateOfBirth?: any;
    dateOfInactive?: any;
    budgetReferenceNumber?: any;
    positionStatus?: any;
    submitUser?: any;
    workdayManpowerInterfaceId?: any;
    piName?: any;
    leadUnit?: any;
}

export class PersonDetails {
    fullName: string;
    personId: string;
}
