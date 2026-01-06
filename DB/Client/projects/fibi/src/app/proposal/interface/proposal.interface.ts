export interface ProposalPersonRole {
    id: number;
    code: string;
    sponsorHierarchyName: string;
    description: string;
    certificationRequired: string;
    readOnly: boolean;
    unitDetailsRequired: boolean;
    isMultiPi: string;
    sortId: number;
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

export interface Unit2 {
    unitNumber: string;
    parentUnitNumber: string;
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

export interface Unit {
    propPersonUnitId: number;
    unitNumber: string;
    leadUnit: boolean;
    unit: Unit2;
    updateTimeStamp: any;
    updateUser: string;
    isDeleted: boolean;
}

export interface ProposalPerson {
    proposalPersonId: number;
    proposalId: number;
    personId: string;
    rolodexId?: any;
    fullName: string;
    personRoleId: number;
    proposalPersonRole: ProposalPersonRole;
    updateTimeStamp: any;
    updateUser: string;
    percentageOfEffort: number;
    units: Unit[];
    emailAddress: string;
    proposalPersonAttachment: any[];
    isPi: boolean;
    designation: string;
    department: string;
    isMultiPi: boolean;
    personCertified: boolean;
    isGenerated: boolean;
    primaryTitle?: any;
}
export interface ProposalAttachmentTypes {
    attachmentTypeCode: number;
    description: string;
    isActive: boolean;
    isPrivate: boolean;
    updateTimeStamp: number;
    updateUser: string;
}
export interface UpdateCertificateRO {
    proposalId: number;
    personId: number | string;
    status: boolean;
    isNonEmployee: boolean;
    proposalPersonRole: number;
}

export interface CertificationLogRO {
    moduleItemKey: number;
    property1: string;
    moduleCode: number;
}

export interface PersonNotifyMailRO {
    proposalId: number;
    personId?: number | string;
    actionType?: string;
    personCertified?: boolean;
}

export interface PersonNotificationMailLog {
    errorMsg?: any;
    mailSentFlag: 'Y' | 'N';
    sendDate: number;
}

export interface NotificationModalConfig {
    mode: 'SINGLE' | 'ALL';
    selectedPerson?: ProposalPerson;
}
