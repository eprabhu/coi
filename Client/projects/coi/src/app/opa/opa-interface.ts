import { DisclosureCommentsCounts, Person } from "../common/services/coi-common.interface";
import { WorkFlowResult } from "../shared-components/workflow-engine2/workflow-engine-interface";

export class OPA {
    opaDisclosure: OpaDisclosure;
    opaReviewerList: any;
    workFlowResult = new OPAWorkFlow();
    disclosureCommentsCount: DisclosureCommentsCounts;
    isDepLevelAdmin = false;
    hasDeptLevelReviewerRight = false;
}

export class OpaDisclosure {
    opaDisclosureId: number;
    opaDisclosureNumber: string;
    opaCycleNumber: number;
    opaCycles: OpaCycles;
    personId: string;
    opaPerson: OpaPerson;
    personName: string;
    homeUnit: string;
    statusCode: string;
    isFaculty: boolean;
    isFallSabatical?: any;
    isSpringSabatical?: any;
    receivedSummerComp?: any;
    summerCompMonths?: any;
    isFullTime?: any;
    isPartTime?: any;
    appointmentPercent?: any;
    isCompensated?: any;
    hasPotentialConflict?: any;
    conflictDescription?: any;
    reviewStatusCode: string;
    reviewStatusType: ReviewStatusType;
    dispositionStatusCode: string;
    dispositionStatusType: DispositionStatusType;
    certificationText: string;
    certifiedBy: string;
    submissionTimestamp: number;
    adminGroupId: number;
    adminPersonId: string;
    createTimestamp: number;
    createUser: string;
    updateTimestamp: number;
    updateUser: string;
    updateUserFullName: string;
    createUserFullName?: any;
    adminGroupName: string;
    adminPersonName: string;
    personEmail: string;
    personPrimaryTitle: string;
    homeUnitName: string;
    opaFormBuilderDetails: any[];
    personAttachmentsCount: number;
    personNotesCount: number;
    personEntitiesCount: number;
    unitDisplayName: string;
    versionStatus: string;
    versionNumber: number;
    isHomeUnitSubmission: boolean | null;
}

export interface DispositionStatusType {
    dispositionStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ReviewStatusType {
    reviewStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface OpaPerson {
    personId: string;
    person: Person;
    isDisclosureRequired: boolean;
    requirementReason: string;
    isRuleBased: boolean;
    exemptFromDate: number;
    exemptToDate: number;
    exemptionReason: string;
    formOfAddressShort: string;
    krbNameUppercase: string;
    emailAddress: string;
    jobId: string;
    jobTitle: string;
    adminEmployeeType: string;
    hrDepartmentCodeOld: string;
    hrOrgUnitId: string;
    hrDepartmentName: string;
    adminOrgUnitId: string;
    adminOrgUnitTitle: string;
    adminPositionTitle: string;
    payrollRank: string;
    isFaculty: boolean;
    employmentPercent: number;
    isConsultPriv: boolean;
    isPaidAppt: boolean;
    isSummerSessionAppt: boolean;
    summerSessionMonths: number;
    isSabbatical: boolean;
    sabbaticalBeginDate: number;
    sabbaticalEndDate: number;
    warehouseLoadDate: number;
    createTimestamp: number;
    updateTimestamp: number;
}

export interface OpaCycles {
    opaCycleNumber: number;
    periodStartDate: number;
    periodEndDate: number;
    opaCycleStatus: boolean;
    openDate: number;
    closeDate: number;
    updateTimestamp: number;
    updateUser: string;
}

export class OPAApproveOrRejectWorkflowRO {
    opaDisclosureId: number | string | null = null;
    opaDisclosureNumber: number | string | null = null;
    personId: string | null = null;
    workFlowPersonId: string | null = null;
    updateUser: string | null = null;
    approverStopNumber: number | null = null;
    actionType: 'A' | 'R' | null = null;
    approveComment: string | null = null;
}

export class OPAWorkFlow extends WorkFlowResult {
    opaDisclosure: OpaDisclosure | null = null;
}

export interface OPAWorkFlowResponse extends WorkFlowResult {
    opaDisclosureId?: number | string | null;
    opaDisclosureNumber?: string | null;
    adminGroupName?: string | null;
    adminPersonName?: string | null;
    reassignedAdminPersonName?: string | null;
    comment?: string | null;
    description?: string | null;
    updateUserFullName?: string | null;
    reviewerFullName?: string | null;
    reviewLocationType?: any;
    reviewStatus?: string | null;
    reviewStatusCode?: string | number | null;
    reviewStatusType?: ReviewStatusType | null;
    dispositionStatusType?: DispositionStatusType | null;
    updateTimestamp?: number | null;
}

export interface OPADashboardTabCount {
    myReviewsTabCount: number;
    allReviewsTabCount: number;
}
