

export interface InstProposalStatus {
    statusCode: number;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
    canCreateAward?: boolean;
}

export interface InstProposalType {
    typeCode: number;
    isActive: boolean;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
}

export class Unit {
    unitNumber = '';
    parentUnitNumber?: string;
    organizationId?: any;
    unitName = '';
    active?: boolean;
    updateTimestamp?: number;
    updateUser?: string;
    acronym?: any;
    unitAdministrators?: any[];
    unitDetail?: string;
    parentUnitName?: any;
    organizationName?: any;
}

export class PersonUnit {
    propPersonUnitId: number;
    unitNumber: string;
    unit: Unit = new Unit();
    updateTimeStamp: number;
    updateUser: string;
    isDeleted = false;
    leadUnit = false;
}

export interface ActivityType {
    activityTypeCode: string;
    description: string;
    higherEducationFunctionCode?: any;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    grantTypeCode?: any;
    categoryCode?: any;
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

export interface AwardType {
    awardTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class ProposalPersonRole {
    id: number;
    code: string;
    sponsorHierarchyName: string;
    description: string;
    certificationRequired: boolean;
    readOnly: boolean;
    unitDetailsRequired: boolean;
    isMultiPi: string;
    sortId: number;
    isActive: boolean;
    showProjectRole: boolean;
}

export class InstProposalPerson {
    proposalPersonId: number;
    proposalId: number;
    personId: string;
    rolodexId?: any;
    fullName: string;
    personRoleId: number | string = null;
    proposalPersonRole: ProposalPersonRole;
    updateTimeStamp: number;
    updateUser: string;
    percentageOfEffort: number;
    proposalNumber: string;
    sequenceNumber: number;
    units: PersonUnit[] = [];
    emailAddress: string;
    proposalPersonAttachment: any[] = [];
    isPi: boolean;
    designation?: any;
    isMultiPi = false;
    department: string;
    projectRole: string = null;
}

export class InstProposal {
    proposalId: number;
    statusCode: number;
    instProposalStatus: InstProposalStatus;
    typeCode: number | string;
    instProposalType: InstProposalType;
    title: string;
    startDate: number | Date | string;
    endDate: number | Date | string;
    submissionDate: number;
    internalDeadLineDate?: number | Date | string;
    abstractDescription?: any;
    fundingStrategy?: any;
    details?: any;
    deliverables?: any;
    researchDescription?: any;
    createTimeStamp: number;
    createUser: string;
    updateTimeStamp: number;
    updateUser: string;
    ipNumber?: any;
    proposalNumber: string;
    sequenceNumber: number;
    homeUnitNumber: string;
    homeUnitName: string;
    unit: Unit;
    activityTypeCode: string;
    activityType: ActivityType;
    sponsorCode: string;
    sponsorName: string;
    submitUser?: any;
    sponsorProposalNumber?: any;
    cfdaNumber?: any;
    baseProposalNumber?: any;
    baseProposalTitle?: string;
    programAnnouncementNumber?: any;
    primeSponsorCode: string;
    primeSponsorName: string;
    sponsorDeadlineDate: number | Date | string;
    grantCallId?: any;
    grantCall?: any;
    isSubcontract?: any;
    multiDisciplinaryDescription?: any;
    principalInvestigator: string;
    applicationActivityType?: any;
    applicationType?: any;
    applicationStatus?: any;
    workflow?: any;
    proposalPreReviews?: any;
    reviewerReview?: any;
    preReviewExist: boolean;
    isPreReviewer: boolean;
    workflowList?: any;
    principalInvestigatorForMobile: string;
    createUserFullName: string;
    updateUserFullName: string;
    grantTypeCode: number | string;
    grantCallType: GrantCallType;
    awardTypecode: string;
    awardType: AwardType;
    instProposalPersons: InstProposalPerson[];
    instProposalKeywords: Array<any> = [];
    proposalSequenceStatus: string;
    primeSponsor: any;
    sponsor: any;
    disciplineCluster?: DisciplineClusters;
    clusterCode?: number | string;
    duration: string;
}

export interface DisciplineClusters {
    description: string;
    id: number;
    updateTimeStamp: number;
    updateUser: string;
}

export interface StatusCode {
    statusCode: number;
    description: string;
    updateTimeStamp: any;
    updateUser: string;
    isActive: boolean;
}

export class InstituteProposal {
    instProposal: InstProposal;
    proposalId?: any;
    userName?: any;
    personId?: any;
    devProposalId?: any;
    devProposalIds: number[];
    statusCode?: any;
    statusCodes: StatusCode[];
    availableRights: string[];
    isFundingSupportDeclarationRequired: boolean;
    isReplaceAttachmentEnabled: boolean;
    sortBy?: any;
    reverse?: any;
    instituteProposalAttachments: any[];
    instituteProposalPersons?: any;
    instituteProposalResearchAreas: Array<AreaOfResearch> = [];
    instituteProposalSpecialReviews: SpecialReview[] = [];
    instituteProposalPerson?: any;
    instituteProposalKeywords: any;
    instituteProposalSpecialReview?: any;
    instituteProposalResearchArea?: any;
    instituteProposalAttachment?: Array<Attachment>;
    proposalAttachments: Array<any> = [];
    instPropPersonId?: any;
    newIPPersonAttachments?: any;
    activityTypes: Array<ActivityType>;
    awardTypes: Array<AwardType>;
    proposalTypes: Array<InstProposalType>;
    grantCallTypes: Array<GrantCallType>;
    proposalPersonRoles: Array<ProposalPersonRole>;
    specialReviewApprovalTypes: Array<SpecialReviewApprovalType> = [];
    reviewTypes: Array<SpecialReviewType> = [];
    researchTypes: Array<ResearchType> = [];
    proposalAttachmentTypes: Array<AttachmentType>;
    instituteProposalActionTypes: Array<ActionType> = [];
    isAwarded: boolean;
    disciplineClusters: DisciplineClusters[];
    enableActivityGrantCallMapping: boolean;
    proposalNumber: string;
    sequenceNumber: number;
    acProtocolStatuses: any;
    irbProtocolStatuses: any;
    instProposalSummaryVO: InstituteProposalList;
    isPendingIPExist: boolean;
    isArchive: boolean;
}

export class PersonRole {
    description: string;
    isActive: boolean;
    typeCode: number;
    updateTimeStamp: number;
    updateUser: string;
}

export interface SpecialReviewApprovalType {
    approvalTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface SpecialReviewType {
    specialReviewTypeCode: string;
    description: string;
    sortId: number;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    isIntegrated: boolean;
}

export class SpecialReview {
    specialReviewId: number;
    proposalId: number;
    proposalNumber: string;
    sequenceNumber: number;
    applicationDate?: any;
    approvalDate?: any;
    approvalTypeCode: string = null;
    specialReviewApprovalType: SpecialReviewApprovalType;
    comments: string;
    expirationDate?: any;
    protocolNumber: string;
    statusDescription?: any;
    specialReviewCode: string = null;
    specialReviewType: SpecialReviewType;
    updateTimestamp: number;
    updateUser: string;
    approvalType: string;
    specialReviewTypeCode: string;
    isProtocolIntegrated?: boolean;
    acProtocol: any;
    irbProtocol: any;
}

export interface ResearchType {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export class AreaOfResearch {
    researchAreaId: number;
    proposalId: number;
    proposalNumber: string;
    sequenceNumber: number;
    researchTypeCode: string;
    researchType: ResearchType;
    researchTypeAreaCode?: any;
    researchTypeArea?: any;
    researchTypeSubAreaCode?: any;
    researchTypeSubArea?: any;
    updateTimeStamp: number;
    updateUser: string;
}

export interface AttachmentType {
    attachmentTypeCode: number;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface NarrativeStatus {
    code: string;
    description: string;
    isActive: boolean;
}

export interface DocumentStatus {
    documentStatusCode: number;
    description: string;
    updateUser: string;
    updateTimeStamp: number;
}

export class Attachment {
    attachmentId: number;
    proposalId: number;
    attachmentTypeCode: number | string = null;
    attachmentType: AttachmentType;
    description: string;
    fileName: string;
    mimeType: string;
    updateTimeStamp: number;
    updateUser: string;
    narrativeStatusCode = 'C';
    narrativeStatus: NarrativeStatus;
    versionNumber: number;
    fileDataId: string;
    documentStatusCode: number;
    documentStatus: DocumentStatus;
    documentId: number;
    proposalNumber: string;
    sequenceNumber: number;
    lastUpdateUserFullName: string;
}

export class ActionType {
    actionTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    statusCode: number;
    instProposalStatus: InstProposalStatus;
}

export class BRValidation {
    error: Array<any> = [];
    warning: Array<any> = [];
}
export interface CommentType {
    commentTypeCode: string;
    description: string;
    moduleCode: number;
    updateTimestamp: any;
    updateUser: string;
    isActive: boolean;
}
export class InstituteProposalComment {
    comment: string;
    proposalId: any;
    proposalNumber: string;
    sequenceNumber: number;
    isPrivate = false;
    commentTypeCode: any = null;
    updateTimeStamp: number;
    updateUser: string;
}
export class CommentObject {
    proposalCommentId: number;
    proposalId: number;
    proposalNumber: string;
    sequenceNumber: number;
    instituteProposal: any;
    commentTypeCode: string;
    commentType: CommentType;
    comment: string;
    isPrivate: boolean;
    updateTimestamp: number;
    updateUser: string;
    fullName: string;
}

export interface Comment {
    proposalCommentId: number;
    proposalId: number;
    proposal: InstProposal;
    commentTypeCode: string;
    commentType: CommentType;
    comments: string;
    isPrivate: boolean;
    updateTimestamp: any;
    updateUser: string;
    fullName: string;
}
export interface CommentsList {
    id: string;
    description: string;
    comments: CommentObject[];
    totalCommentLength: number;
    countToDisplay: number;
}
export interface InstituteProposalList {
    instProposalSummaryDetails: ActiveInstituteProposal[];
    proposalID: number;
}
export interface ActiveInstituteProposal {
    proposalId: number;
    instProposalNumber: number;
    proposalSequenceStatus: string;
    sequenceNumber: number;
    createTimeStamp: string;
    createUserFullName: string;
}
