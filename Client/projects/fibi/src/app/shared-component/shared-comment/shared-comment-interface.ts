
export class ProposalComment {
    comment: string;
    proposalId: any;
    isPrivate = false;
    commentTypeCode: any = null;
    updateTimeStamp: number;
    updateUser: string;
    proposalNumber?: string;
    sequenceNumber?: number;
    proposalCommentAttachments?: any[];
}

export class CommentObject {
    proposalCommentId: number;
    proposalId: number;
    proposal: any;
    commentTypeCode: string;
    commentType: CommentType;
    comments: string;
    isPrivate: boolean;
    updateTimestamp: number;
    updateUser: string;
    proposalCommentAttachments: ProposalCommentAttachment[];
    fullName: string;
}

export interface ProposalStatus {
    statusCode: number;
    description: string;
    updateTimeStamp: any;
    updateUser: string;
    isActive: boolean;
}

export interface ProposalType {
    typeCode: number;
    description: string;
    updateTimeStamp: any;
    updateUser: string;
    isActive: boolean;
    canMergeToIp: boolean;
}

export interface GrantCallCategory {
    categoryCode: number;
    description: string;
    updateUser: string;
    updateTimestamp: any;
}

export interface GrantCallType {
    grantTypeCode: number;
    description: string;
    updateTimestamp: any;
    updateUser: string;
    categoryCode: number;
    grantCallCategory: GrantCallCategory;
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
    updateTimestamp: any;
    updateUser: string;
    acronym?: any;
    isFundingUnit?: any;
    unitAdministrators: UnitAdministrator[];
    unitDetail: string;
    parentUnitName?: any;
    organizationName?: any;
}

export interface ActivityType {
    activityTypeCode: string;
    description: string;
    higherEducationFunctionCode?: any;
    updateTimestamp: any;
    updateUser: string;
    isActive: boolean;
    grantTypeCode?: any;
    categoryCode?: any;
}

export interface SponsorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface Currency {
    currencyCode: string;
    currency: string;
    currencySymbol: string;
    updateUser: string;
    updateTimeStamp: any;
}

export interface Country {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currency: Currency;
    updateTimeStamp: any;
    updateUser: string;
    countryTwoCode: string;
}

export interface Sponsor {
    sponsorCode: string;
    sponsorName: string;
    sponsorTypeCode: string;
    active: boolean;
    sponsorType: SponsorType;
    acronym: string;
    unitNumber?: any;
    unit?: any;
    addressLine1: string;
    addressLine2?: any;
    addressLine3?: any;
    sponsorLocation: string;
    emailAddress?: any;
    phoneNumber?: any;
    updateTimestamp: any;
    updateUser: string;
    createUser: string;
    rolodex?: any;
    countryCode: string;
    country: Country;
    rolodexId?: any;
    state?: any;
    postalCode?: any;
    sponsorGroup?: any;
}

export interface DocumentStatus {
    documentStatusCode: string;
    description: string;
    updateTimestamp: any;
    updateUser: string;
}

export interface Proposal {
    proposalId: number;
    grantCallId: number;
    statusCode: number;
    proposalStatus: ProposalStatus;
    typeCode: number;
    proposalType: ProposalType;
    title: string;
    startDate: any;
    endDate: any;
    submissionDate: any;
    internalDeadLineDate?: any;
    abstractDescription: string;
    fundingStrategy?: any;
    details?: any;
    deliverables?: any;
    researchDescription?: any;
    createTimeStamp: any;
    createUser: string;
    updateTimeStamp: any;
    updateUser: string;
    ipNumber?: any;
    sponsorDeadlineDate: any;
    isEndorsedOnce: boolean;
    proposalRank?: any;
    applicationId?: any;
    multiDisciplinaryDescription?: any;
    duration: string;
    proposalKeywords: any[];
    grantTypeCode: number;
    grantCallType: GrantCallType;
    homeUnitNumber: string;
    homeUnitName: string;
    unit: Unit;
    activityTypeCode: string;
    activityType: ActivityType;
    sponsorCode: string;
    sponsor: Sponsor;
    submitUser: string;
    sponsorProposalNumber?: any;
    awardTypeCode?: any;
    awardType?: any;
    primeSponsorCode?: any;
    primeSponsor?: any;
    baseProposalNumber?: any;
    programAnnouncementNumber?: any;
    cfdaNumber?: any;
    externalFundingAgencyId?: any;
    clusterCode?: any;
    disciplineCluster?: any;
    isEligibilityCriteriaMet?: any;
    recommendationCode?: any;
    evaluationRecommendation?: any;
    awardNumber?: any;
    documentStatusCode: string;
    documentStatus: DocumentStatus;
    sourceProposalId?: any;
    applicationActivityType?: any;
    applicationType?: any;
    applicationStatus?: any;
    workflow?: any;
    proposalPreReviews?: any;
    reviewerReview?: any;
    preReviewExist: boolean;
    isPreReviewer: boolean;
    workflowList?: any;
    principalInvestigatorForMobile?: any;
    grantORTTManagers: any[];
    isAssigned: boolean;
    isRcbfProposal: boolean;
    isModularBudgetEnabled: boolean;
    isSimpleBudgetEnabled: boolean;
    isDetailedBudgetEnabled: boolean;
    isBudgetCategoryTotalEnabled: boolean;
    createUserFullName?: any;
    lastUpdateUserFullName?: any;
    submitUserFullName?: any;
    hasRecommendation: boolean;
    hasRank: boolean;
    investigator?: any;
    grantCallName?: any;
    grantCallClosingDate?: any;
    proposalPersons: any[];
    isReviewExist?: any;
    score: number;
    categoryCode?: any;
    proposalEvaluationScore?: any;
    totalCost?: any;
    total?: any;
    scoringMapId?: any;
    abbreviation?: any;
    awardTitle?: any;
    awardId?: any;
    proposalTypeDescription?: any;
    proposalCategory?: any;
    sourceProposalTitle?: any;
    baseProposalTitle?: any;
    sponsorName?: any;
    primeSponsorName?: any;
}

export interface CommentType {
    commentTypeCode: string;
    description: string;
    moduleCode: number;
    updateTimestamp: any;
    updateUser: string;
    isActive: boolean;
}

export interface ProposalCommentAttachment {
    commentAttachmentId: number;
    fileName: string;
    fileDataId: string;
    mimeType: string;
    updateTimestamp: number;
    updateUser: string;
    proposalCommentId: number;
    lastUpdateUserFullName?: any;
}

export interface Comment {
    proposalCommentId: number;
    proposalId: number;
    proposal: Proposal;
    commentTypeCode: string;
    commentType: CommentType;
    comments: string;
    isPrivate: boolean;
    updateTimestamp: any;
    updateUser: string;
    proposalCommentAttachments: ProposalCommentAttachment[];
    fullName: string;
}

export interface CommentsAndAttachmentsList {
    id: string;
    description: string;
    comments: Comment[];
    totalCommentLength: number;
    countToDisplay: number;
}

export interface Attachments {
    fileName: string;
    mimeType: string;
}

export interface ProposalCommentAttachment {
    commentAttachmentId: number;
    fileName: string;
    fileDataId: string;
    mimeType: string;
    updateTimestamp: number;
    updateUser: string;
    proposalCommentId: number;
    lastUpdateUserFullName?: any;
}













