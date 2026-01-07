export interface UserDisclosure {
    consultDisclId: any;
    coiDisclosureId: any;
    documentNumber: any;
    coiDisclosureNumber: any;
    sequenceNumber: any;
    personId: any;
    fullName: any;
    dispositionStatusCode: any;
    dispositionStatus: any;
    conflictStatusCode: any;
    conflictStatus: any;
    moduleItemKey: any;
    discActiveStatus: any;
    expirationDate: any;
    updateTimeStamp: number;
    updateUser: any;
    updateUserFullName: any;
    createUser: any;
    versionStatus: any;
    reviewStatus: any;
    submittedDate: any;
    lastApprovedVersion: any;
    noOfSfiInActive: any;
    noOfSfiInPending: any;
    noOfAwardInPending: any;
    noOfProposalInPending: any;
    noOfAwardInActive: any;
    noOfProposalInActive: any;
    createTimestamp: any;
    disclosureVersionNumber: any;
    disclosurePersonFullName: any;
    fcoiTypeCode?: any;
    fcoiType: any;
    lastApprovedVersionDate: any;
    reviseComment: any;
    reviewStatusCode: string;
    reviewId: any;
    reviewDescription: string;
    reviewerStatusCode: any;
    reviewerStatus: any;
    reviewerFullName: any;
    proposalId: any;
    proposalTitle: any;
    awardId: any;
    awardTitle: any;
    noOfSfi: any;
    noOfAward: any;
    noOfProposal: any;
    certifiedAt: any;
    unit: any;
    travelDisclosureId: number;
    travelStartDate: number;
    travelEndDate: number;
    acknowledgeBy: any;
    destination: any;
    purpose: any;
    acknowledgeDate: any;
    travelDisclosureNumber: any;
    description: any;
    disclosurestatus: any;
    homeUnitName: any;
    homeUnit: any;
    adminGroupName: any;
    administrator: any;
    department: any;
    travelDisclosureStatus: any;
    travelEntityName: string;
    travellerName: string;
    travelAmount: number;
    travelReviewStatus: any;
    travelSubmissionDate: any;
    travelExpirationDate: any;
    travelPurpose: string;
    certificationDate: any;
    unitDetails: UnitDetails;
    travelCity: string;
    travelCountry: string;
    travelState: string;
    travellerTypeCode: any;
    travellerTypeDescription: string;
    travelDisclosureStatusCode: string;
    travelDisclosureStatusDescription: string;
    opaDisclosureId: any;
    disclosureId: any;
    projectHeader: string;
    travelNumber: number;
    opaDisclosureNumber: number;
}

export interface UnitDetails {
    unitNumber: string;
    parentUnitNumber: any;
    organizationId: any;
    unitName: string;
    active: boolean;
    updateTimestamp: any;
    updateUser: any;
    acronym: any;
    isFundingUnit: any;
    unitAdministrators: [];
    unitDetail: string;
    parentUnitName: any;
    organizationName: any;
}

export interface ActiveDisclosure {
    disclosureId: number;
    personId: string;
    person: Person;
    homeUnit: string;
    unit: Unit2;
    disclosureNumber: number;
    versionNumber: number;
    versionStatus: string;
    fcoiTypeCode: string;
    coiDisclosureFcoiType: CoiDisclosureFcoiType;
    conflictStatusCode: any;
    coiConflictStatusType: any;
    dispositionStatusCode: string;
    coiDispositionStatusType: CoiDispositionStatusType;
    reviewStatusCode: string;
    coiReviewStatusType: CoiReviewStatusType;
    riskCategoryCode?: string;
    coiRiskCategory?: CoiRiskCategory;
    moduleCode: any;
    moduleItemKey: any;
    expirationDate: number;
    certificationText: string;
    certifiedBy: string;
    certifiedAt: number;
    revisionComment: string;
    adminGroupId: any;
    adminPersonId: string;
    updateTimestamp: number;
    updateUser: string;
    createUser?: string;
    createTimestamp: number;
    updateUserFullName?: string;
    createUserFullName: any;
    numberOfSFI?: number;
    numberOfProposals?: number;
    numberOfAwards?: number;
    coiProjectTypeCode: any;
    adminGroupName: any;
    adminPersonName: any;
    disclosurePersonFullName: string;
}

export interface Person {
    personId: string;
    lastName: string;
    firstName: string;
    middleName: any;
    fullName: string;
    priorName: any;
    principalName: string;
    emailAddress: string;
    dateOfBirth: any;
    age: any;
    gender: any;
    educationLevel: any;
    officeLocation: any;
    secOfficeLocation: any;
    secOfficePhone: any;
    school: any;
    directoryDepartment: any;
    countryOfCitizenshipCode: string;
    countryOfCitizenshipDetails: CountryOfCitizenshipDetails;
    primaryTitle: string;
    directoryTitle: string;
    homeUnit: string;
    unit: Unit;
    isFaculty: boolean;
    isGraduateStudentStaff: boolean;
    isResearchStaff: boolean;
    isServiceStaff: boolean;
    isSupportStaff: boolean;
    isOtherAcadamic: boolean;
    isMedicalStaff: boolean;
    addressLine1: any;
    addressLine2: any;
    addressLine3: any;
    city: string;
    country: string;
    state: string;
    postalCode: string;
    countryCode: string;
    countryDetails: CountryDetails;
    faxNumber: any;
    pagerNumber: any;
    mobileNumber: string;
    status: string;
    salaryAnniversary: any;
    updateTimestamp: number;
    updateUser: string;
    supervisorPersonId: any;
    orcidId: string;
    isWebhookActive: any;
    dateOfInactive: any;
    isExternalUser: any;
    officePhone: any;
    isPasswordChange: boolean;
    isUsernameChange: boolean;
}

export interface CountryOfCitizenshipDetails {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currency: Currency;
    updateTimeStamp: number;
    updateUser: string;
    countryTwoCode: string;
}

export interface Currency {
    currencyCode: string;
    currency: string;
    currencySymbol: string;
    updateUser: string;
    updateTimeStamp: number;
}

export interface Unit {
    unitNumber: string;
    parentUnitNumber: any;
    organizationId: string;
    unitName: string;
    active: boolean;
    updateTimestamp: number;
    updateUser: string;
    acronym: any;
    isFundingUnit: any;
    unitAdministrators: UnitAdministrator[];
    unitDetail: string;
    parentUnitName: any;
    organizationName: any;
}

export interface UnitAdministrator {
    personId: string;
    fullName: any;
    oldPersonId: any;
    oldUnitAdministratorTypeCode: any;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName: any;
    updateTimestamp: number;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType;
}

export interface UnitAdministratorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface CountryDetails {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currency: Currency2;
    updateTimeStamp: number;
    updateUser: string;
    countryTwoCode: string;
}
export interface Currency2 {
    currencyCode: string;
    currency: string;
    currencySymbol: string;
    updateUser: string;
    updateTimeStamp: number;
}
export interface Unit2 {
    unitNumber: string;
    parentUnitNumber: any;
    organizationId: string;
    unitName: string;
    active: boolean;
    updateTimestamp: number;
    updateUser: string;
    acronym: any;
    isFundingUnit: any;
    unitAdministrators: UnitAdministrator2[];
    unitDetail: string;
    parentUnitName: any;
    organizationName: any;
}

export interface UnitAdministrator2 {
    personId: string;
    fullName: any;
    oldPersonId: any;
    oldUnitAdministratorTypeCode: any;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName: any;
    updateTimestamp: number;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType2;
}

export interface UnitAdministratorType2 {
    code: string;
    description: string;
    isActive: boolean;
}

export interface CoiDisclosureFcoiType {
    fcoiTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiDispositionStatusType {
    dispositionStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiReviewStatusType {
    reviewStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiRiskCategory {
    riskCategoryCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class DisclosureExpireDateValidation {
    isShowExpiringValidation = false;
    isExpiringIn10Days = false;
    differenceInDays: DurationDifference = {
        durInDays: null,
        durInMonths: null,
        durInYears: null,
    };
}

export interface DurationDifference {
    durInDays: number | null;
    durInMonths: number | null;
    durInYears: number | null;
}

export class SortCountObj {
    [key: string]: number;
    documentStatusDescription = 0;
    reviewDescription = 0;
    certifiedAt = 0;
    travelEntityName = 0;
    updateTimeStamp = 2;
    fullName = 0;
    cmpType = 0;
    homeUnitName = 0;
}
