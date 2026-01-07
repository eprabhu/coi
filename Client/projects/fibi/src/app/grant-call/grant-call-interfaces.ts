export class PointOfContact {
    fullName: string;
    email: string;
    mobile: string;
    designation: string;
    personId: number;
    grantContactId: number;
    isEmployee: boolean;
    grantCallId: number;
    rolodexId: number;
}

export interface GrantCallCategory {
    categoryCode: number;
    description: string;
    updateUser: string;
    updateTimestamp: number;
}

export interface GrantCallType {
    grantTypeCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    categoryCode: number;
    grantCallCategory: GrantCallCategory;
    isActive: boolean;
}

export interface GrantCallStatus {
    grantStatusCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface SponsorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface SponsorType2 {
    code: string;
    description: string;
    isActive: boolean;
}

export interface UnitAdministratorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface UnitAdministrator {
    personId: string;
    fullName?: any;
    oldPersonId?: any;
    oldUnitAdministratorTypeCode?: any;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName?: any;
    updateTimestamp: any;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType;
}

export interface Unit {
    unitNumber: string;
    parentUnitNumber?: any;
    organizationId: string;
    unitName: string;
    active: boolean;
    updateTimestamp: number;
    updateUser: string;
    acronym?: any;
    isFundingUnit?: any;
    unitAdministrators: UnitAdministrator[];
    unitDetail: string;
    parentUnitName?: any;
    organizationName?: any;
}

export interface Sponsor {
    sponsorCode: string;
    sponsorName: string;
    sponsorTypeCode: string;
    active: boolean;
    sponsorType: SponsorType2;
    acronym: string;
    unitNumber: string;
    unit: Unit;
    addressLine1?: any;
    addressLine2?: any;
    addressLine3?: any;
    sponsorLocation?: any;
    emailAddress?: any;
    phoneNumber?: any;
    updateTimestamp: number;
    updateUser?: any;
    createUser?: any;
    rolodex?: any;
    countryCode?: any;
    country?: any;
    rolodexId?: any;
    state?: any;
    postalCode?: any;
    sponsorGroup?: any;
}

export interface GrantCall {
    grantCallId: number;
    openingDate: number;
    closingDate: number;
    internalSubmissionDeadLineDate: number;
    grantCallName: string;
    description: string;
    maximumBudget?: any;
    quantum?: any;
    grantTheme?: any;
    grantTypeCode: number;
    grantCallType: GrantCallType;
    grantStatusCode: number;
    grantCallStatus: GrantCallStatus;
    fundingSchemeId?: any;
    sponsorFundingScheme?: any;
    sponsorTypeCode: string;
    sponsorType: SponsorType;
    currencyCode?: any;
    currency?: any;
    sponsorCode: string;
    sponsor: Sponsor;
    applicationProcedure?: any;
    otherInformation?: any;
    externalUrl?: any;
    abbrevation: string;
    createTimestamp: number;
    createUser: string;
    updateTimeStamp: number;
    updateUser?: any;
    publishTimeStamp?: any;
    isPublished: boolean;
    homeUnitNumber: string;
    homeUnitName: string;
    primeSponsorCode?: any;
    overHeadComment?: any;
    rateTypeCode?: any;
    rateClassCode?: any;
    rateType?: any;
    primeSponsor?: any;
    grantCallKeywords: any[];
    grantCallRelevants: any[];
    grantCallIOIQuestionnaire?: any;
    grantCallTypeDesc?: any;
    grantCallStatusDesc?: any;
    sponsorName?: any;
    proposals?: any;
    createUserFullName?: any;
    lastUpdateUserFullName?: any;
    closingTime?: any;
}

export interface ScoringCriteria {
    scoringCriteriaTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface grantCallScoringCriteria {
    grantScoreCriteriaId: number;
    grantCall: GrantCall;
    scoringCriteria: ScoringCriteria;
    grantCallId: number;
    scoringCriteriaTypeCode: string;
    updateTimestamp: number;
    updateUser: string;
}



export interface ResearchType {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchType2 {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchTypeArea {
    researchTypeAreaCode: string;
    description: string;
    researchTypeCode: string;
    researchType: ResearchType2;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ResearchType3 {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchTypeArea2 {
    researchTypeAreaCode: string;
    description: string;
    researchTypeCode: string;
    researchType: ResearchType3;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ResearchTypeSubArea {
    researchTypeSubAreaCode: string;
    description: string;
    researchTypeAreaCode: string;
    researchTypeArea: ResearchTypeArea2;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface areaOfResearch {
    grantResearchAreaId: number;
    grantCallId: number;
    researchTypeCode: string;
    researchType: ResearchType;
    researchTypeAreaCode: string;
    researchTypeArea: ResearchTypeArea;
    researchTypeSubAreaCode: string;
    researchTypeSubArea: ResearchTypeSubArea;
    updateTimeStamp: number;
    updateUser: string;
}


