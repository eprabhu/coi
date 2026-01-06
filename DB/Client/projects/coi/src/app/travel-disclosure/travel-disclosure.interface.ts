import { CoiDisclosureType, Country, DisclosureCommentsCounts } from "../common/services/coi-common.interface";
import { EntityDetails } from "../entity-management-module/shared/entity-interface";

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '';
export type TabType = 'TRAVEL_ENGAGEMENTS' | 'TRAVEL_DETAILS' | 'CERTIFY' | 'HISTORY_CREATE' | 'HISTORY_VIEW' | 'SUMMARY' | 'RELATED_DISCLOSURES';

export class CoiTravelDisclosure {
    travellerTypeCode: Array<string> = [];
    entityId: number;
    entityNumber: number;
    travelTitle: string;
    travelState: string;
    destinationCity: string;
    destinationCountry: string;
    purposeOfTheTrip: string;
    relationshipToYourResearch: string;
    travelAmount: number;
    travelStartDate: any;
    travelEndDate: any;
    isInternationalTravel: boolean;
    isSponsoredTravel: boolean;
    personId: string;
    noOfDays: number;
    homeUnit: string | null;
    description: string;
    travelDisclosureId?: number;
    travelEntityName?: string;
}

export interface TravelDisclosureTraveller {
    description: string;
    isActive: boolean;
    isChecked?: boolean;
    travelerTypeCode?: string;
    travelStatusCode?: string;
    updateTimestamp: number;
    updateUser: string;
}

export class TravelCreateModalDetails {
    homeUnit: string | null;
    description: string | null;
    personId: string | null;
    homeUnitName: string | null;
}
export interface EndpointOptions {
    contextField: string;
    formatString: string;
    path: string;
    defaultValue: string;
    params: string;
}

export interface TravelHistoryRO {
    personId: string;
    entityNumber: number;
}

export interface TravelHistory {
    travelDisclosureId: number;
    travelEntityName: string;
    entityType: string;
    country: string;
    travelTitle: string;
    purposeOfTheTrip: string;
    destinationCity: string;
    destinationCountry: string;
    destinationState: string;
    travellerTypeCodeList: [];
    travelAmount: number;
    travelStartDate: number;
    travelEndDate: number;
}

export interface TravelActionAfterSubmitRO {
    travelDisclosureId: number;
    description: string;
}

export class TravelConflictRO {
    travelDisclosureId: number;
    personId: string;
    description: string;
    disclosureStatusCode: string;
}


export interface CoiTravelerStatusType {
    travelStatusCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}

export interface CoiTravelDisclosureStatusType {
    disclosureStatusCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
    sortOrder: string
}

export interface Unit {
    unitNumber: string
    parentUnitNumber: any
    organizationId: string
    unitName: string
    active: boolean
    updateTimestamp: number
    updateUser: string
    acronym: any
    isFundingUnit: any
    unitAdministrators: UnitAdministrator[]
    unitDetail: string
    parentUnitName: any
    organizationName: any
}

export interface UnitAdministrator {
    personId: string
    fullName: any
    oldPersonId: any
    oldUnitAdministratorTypeCode: any
    unitAdministratorTypeCode: string
    unitNumber: string
    unitName: any
    updateTimestamp: number
    updateUser: string
    unitAdministratorType: UnitAdministratorType
}

export interface UnitAdministratorType {
    code: string
    description: string
    isActive: boolean
}
export interface EntityStatus {
    entityStatusCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}

export interface EntityType {
    entityTypeCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}

export class TravelDisclosure {
    travelDisclosureId: number
    travelNumber: number
    versionNumber: number
    versionStatus: string
    personEntityId: number
    personEntity?: PersonEntity
    personEntityNumber: number
    entityId: number
    entityNumber: number
    personId: string
    person: Person
    travellerHomeUnit: string
    travelTitle: any
    purposeOfTheTrip: any
    relationshipToPhsDoe: any
    travelDestinations: any
    travelStatusCode: any
    coiTravelerStatusType: any
    reimbursedCost: any
    travelStartDate: any
    travelEndDate: any
    travelSubmissionDate: any
    adminGroupId: any
    adminPersonId: any
    certifiedBy: any
    certifiedAt: any
    certificationText: any
    expirationDate: any
    documentStatusCode: string
    travelDocumentStatusType?: TravelDocumentStatusType
    reviewStatusCode: string
    travelReviewStatusType?: TravelReviewStatusType
    travelerFundingTypeCode: string
    travelFundingType: TravelFundingType
    updatedBy: string
    updateTimestamp: number
    createdBy: string
    createTimestamp: number
    updateUserFullName: string
    createUserFullName: string
    personEntitiesCount: number
    personNotesCount: number
    personAttachmentsCount: number
    actionType: any
    adminGroupName: any
    adminPersonName: any
    description: any
    formBuilderId: any
    travelFormBuilderDetail: TravelFormBuilderDetail
    travellers: any
    entity: any
    travelDisclosureCommentsCounts: DisclosureCommentsCounts;
    isHomeUnitSubmission: boolean | null;
}

export class PersonEntity {
    personEntityId: number
    personEntityNumber: number
    personId: string
    person: Person
    entityId: number
    coiEntity: EntityDetails
    entityNumber: number
    isFormCompleted: boolean
    versionNumber: number
    versionStatus: string
    sponsorsResearch: boolean
    involvementStartDate: number
    involvementEndDate: any
    studentInvolvement: any
    staffInvolvement: any
    instituteResourceInvolvement: any
    updateTimestamp: number
    updateUser: string
    createUser: string
    createTimestamp: number
    revisionReason: any
    personEntityRelationships: any
    validPersonEntityRelTypes: ValidPersonEntityRelType[]
    validPersonEntityRelTypeCodes: any
    perEntDisclTypeSelection: any
    personFullName: any
    unit: any
    relationshipTypes: any
    designation: any
    updateUserFullName: any
    personEntityRelationshipDto: any
    disclosureId: any
    canDelete: any
    sfiCompleted: any
    disclosureStatusCount: any
}

export interface Person {
    personId: string
    lastName: string
    firstName: string
    middleName: any
    fullName: string
    priorName: any
    principalName: string
    emailAddress: string
    dateOfBirth: any
    age: any
    educationLevel: any
    officeLocation: any
    secOfficeLocation: any
    secOfficePhone: any
    school: any
    directoryDepartment: any
    countryOfCitizenshipCode: any
    countryOfCitizenshipDetails: any
    primaryTitle: string
    directoryTitle: string
    homeUnit: string
    unit: Unit
    isFaculty: boolean
    isGraduateStudentStaff: boolean
    isResearchStaff: boolean
    isServiceStaff: boolean
    isSupportStaff: boolean
    isOtherAcadamic: boolean
    isMedicalStaff: boolean
    addressLine1: any
    addressLine2: any
    addressLine3: any
    city: string
    country: string
    state: string
    postalCode: string
    countryCode: string
    countryDetails: Country;
    faxNumber: any
    pagerNumber: any
    visaCode: any
    visaType: any
    visaRenewalDate: any
    mobileNumber: string
    status: string
    salaryAnniversary: any
    updateTimestamp: number
    updateUser: string
    jobCode: any
    supervisorPersonId: any
    orcidId: string
    isWebhookActive: any
    dateOfInactive: any
    isExternalUser: any
    officePhone: any
    aliasName: any
    genderCode: any
    alternateMobileNumber: any
    secondaryEmailAddress: any
    gender: any
    isMfaEnabled: any
    secret: any
    userType: any
    isPasswordChange: boolean
    isUsernameChange: boolean
}

export interface ValidPersonEntityRelType {
    validPersonEntityRelTypeCode: number
    disclosureTypeCode: string
    coiDisclosureType: CoiDisclosureType
    relationshipTypeCode: string
    personEntityRelType: PersonEntityRelType
    description: string
    questionnaireNumber: any
    isActive: boolean
    updateTimestamp: number
    updateUser: string
}

export interface PersonEntityRelType {
    relationshipTypeCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}


export interface TravelDocumentStatusType {
    documentStatusCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}

export interface TravelReviewStatusType {
    reviewStatusCode: string
    description: string
    updateTimestamp: number
    updateUser: string
    isActive: boolean
}

export interface TravelFundingType {
    travelerFundingTypeCode: string
    description: string
    updateTimestamp: number
    updatedBy: string
    isActive: boolean
}

export interface TravelFormBuilderDetail {
    opaFormBuilderDetailsId: number
    travelDisclosureId: number
    travelNumber: number
    personId: string
    formBuilderId: number
    isPrimaryForm: boolean
    updateTimestamp: number
    updatedBy: string
}

export class CreateDisclosureModalDetails{
    message: string;
    id: number;
    REVIEW_STATUS_CODE?:string;
    modalHeader: string;
    isView = false;
}

export interface DisclosureValidatedDetails {
    personEntityNumber: number;
    reimbursedCost: number;
    personId: string;
    noOfTravels: number;
    fcoiDisclosureDetails: FcoiDisclosureDetails;
}

export interface FcoiDisclosureDetails {
    REVIEW_STATUS_CODE: string;
    DISCLOSURE_ID: number;
}

export class ExpandCollapseSummaryBySection {
    TD2401 = true;
    TD2402 = true;
}
