export interface ManpowerFeedRequestObject {
    startDate?: Date | string;
    endDate?: Date | string;
    interfaceStartDate?: Date | string;
    interfaceEndDate?: Date | string;
    awardNumber?: string;
    positionId?: string;
    itemsPerPage: number;
    currentPage: number;
    isDownload: boolean;
    personId?: string;
    budgetReferenceNumber?: string;
    tabName?: string;
    advancedSearch?: string;
    sortBy?: string;
    reverse?: string;
}

export interface ManpowerInterface {
    interfaceTypeCode: string;
    noOfRecords: number;
    lastSyncedOn: Date;
    manpowerInterfaceType: ManpowerInterfaceType;
}

export interface ManpowerInterfaceType {
    interfaceTypeCode: string;
    description: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: Date;
}

export interface AwardRetriggerListResponse {
    manpowerLogs: ManpowerLog[];
    pageCount: number;
    currentPage: number;
    itemsPerPage: number;
    isDownload: boolean;
    startDate: null;
    endDate: null;
    awardNumber: null;
    positionId: null;
    resourceUniqueId: string;
    workdayManpowerInterfaces: WorkdayManpowerInterface[];
    manpowerUserActions: ManpowerUserAction[];
    workdayInterfaceLogs: any;
    workdayInterfaceLogDtos: WorkdayInterfaceLogDtos[];
    advancedSearch: string;
}

export interface ManpowerUserAction {
    manpowerUserActionCode: string;
    manpowerUserAction: string;
    description: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: string | Date;
}

export interface ManpowerLog {
    manpowerLogId: number;
    workdayManpowerIntefaceId: null;
    awardNumber: string;
    requestParam: string;
    message: string;
    messageType: string;
    statusCode: number;
    interfaceTypeCode: string;
    isMailSent: string;
    updateTimeStamp: number;
    updateUser: string;
    errorDetailmessage: null | string;
    errorXPath: null | string;
    awardTitle: null | string;
}

export interface WorkdayManpowerInterface {
    workdayManpowerInterfaceId: number;
    awardManpowerResourceId: number;
    awardManpowerResource: AwardManpowerResource;
    awardManpowerId: number;
    awardManpower: AwardManpower;
    interfaceTypeCode: string;
    manpowerInterfaceType: Manpower;
    interfaceStatusCode: string;
    manpowerInterfaceStatus: Manpower;
    awardId: number;
    updateTimestamp: Date | string;
    updateUser: string;
    createUser: string;
    createTimestamp: Date | string;
    interfaceTimestamp: Date | string;
    resourceUniqueId: string;
    awardNumber: string;
    newPIPersonId: string;
    oldPIPersonId: string;
    endDateChange: Date | string;
    comments: string;
    manpowerUserActionCode: string;
    newAwardEndDate: Date | string;
    oldFreezeDate: Date | string;
    isCostAllocationCreate: string;
    oldSuperiorSupOrg: string;
    newSuperiorSupOrg: string;
}

export interface AwardManpower {
    awardManpowerId: number;
    awardId: number;
    awardNumber: string;
    sequenceNumber: number;
    manpowerTypeCode: string;
    budgetReferenceNumber: string;
    budgetReferenceTypeCode: string;
    budgetVersionNumber: number;
    approvedHeadCount: number;
    createUser: string;
    createTimestamp: number;
    updateTimestamp: number;
    updateUser: string;
    moduleCode: number;
    subModuleCode: number;
    awardManpowerResource: AwardManpowerResource[];
    manpowerType: string;
    sapCommittedAmount: number;
    budgetCategory: string;
    costElement: string;
    budgetAmount: number;
    expenseAmount: number;
    actualHeadCount: number;
}

export interface AwardManpowerResource {
    manpowerResourceId: number;
    awardManpowerId: number;
    personId: string;
    rolodexId: string;
    positionId: string;
    fullName: string;
    positionStatusCode: string;
    costAllocation: number;
    planCompensationTypeCode: string;
    manpowerPlanCompensationType: string;
    planJobProfileTypeCode: string;
    manpowerPlanJobProfileType: string;
    compensationGradeTypeCode: string;
    manpowerCompensationGradeType: string;
    jobProfileTypeCode: string;
    manpowerJobProfileType: any;
    planStartDate: Date | string;
    planEndDate: Date | string;
    planDuration: string;
    chargeStartDate: Date | string;
    chargeEndDate: Date | string;
    chargeDuration: string;
    committedCost: number;
    resourceTypeCode: string;
    manpowerResourceType: string;
    description: string;
    positionOwnedByAward: string;
    candidateTitleTypeCode: string;
    positionTriggerDate: Date | string;
    updateTimestamp: Date | string;
    updateUser: string;
    createUser: string;
    createTimestamp: Date | string;
    manpowerCandidateTitleType: string;
    manpowerPositionStatus: Manpower;
    plannedBaseSalary: number;
    plannedSalary: number;
    resourceUniqueId: string;
    awardNumber: string;
    moduleCode: number;
    subModuleCode: number;
    freezeDate: Date | string;
    upgradeTypeCode: string;
    manpowerUpgradeType: string;
    multiplierValueUsed: string;
    previousChargeEndDate: Date | string;
    previousChargeStartDate: Date | string;
    baseSalaryUsed: string;
    isRemainingCAFromWBS: string;
    manpower: string;
    department: string;
    personStatus: string;
    designation: string;
    awardManpower: string;
    payrollAmount: number;
    isResourceExitInWorkday: boolean;
    claimManpower: any;
    organization: string;
    accountNumber: string;
    candidateType: string;
    awardId: number;
    involvementFrom: Date | string;
    involvementTo: Date | string;
    dateOfBirth: Date | string;
    dateOfInactive: Date | string;
}

export interface Manpower {
    positionStatusCode?: string;
    description: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: number;
    interfaceStatusCode?: string;
    interfaceTypeCode?: string;
}

export interface WorkdayInterfaceLogDtos {
    awardId: number;
    workdayManpowerInterfaceId: number;
    awardTitle: string;
    errorMessage: string;
    messageType: string;
    interfaceTypeCode: number;
    interfaceTypeName: string;
    comments: string;
    userActionCode: number;
    awardNumber: string;
    manpowerLogId: number;
    userActionName: string;
    planStartDate: Date;
    planEndDate: Date;
    chargeStartDate: Date;
    chargeEndDate: Date;
    positionOwnedByAward: string;
    costAllocation: number;
    positionStatus: string;
    personFullName: string;
    positionId: string;
    personId: string;
    jobProfileType: string;
    budgetReferenceNumber: string;
    interfaceStatusCode: string;
    interfaceStatusName: string;
    resourceUniqueId: number;
    resourceName: string;
    manpowerInterfaceStatus: string;
    isReInterfaceNeeded: boolean;
}

export interface ManpowerLogDetailsReqObj {
    manpowerInterfaceTypeCode?: string;
    schedulerInterfaceFrom: string;
    schedulerInterfaceTo: string;
}
