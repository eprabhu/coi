export class ExtReviewer {
    extReviewerId?: string | number;
    firstName? = '';
    lastName? = '';
    middleName? = '';
    passportName? = '';
    gender?= null;
    primaryEmail? = '';
    secondaryEmail?: string;
    principalName?: string;
    academicRankCode?: string | number = null;
    academicRank?: any;
    workCountry?: string;
    agreementStartDate?: number | Date | string;
    agreementEndDate?: number | Date | string;
    scoringTrend?: string;
    countryCode?: number;
    countryDetails?: any;
    acType?: any;
    status?: any = 'A';
    isUsernameChange?: boolean;
    isEmailChange?: boolean;
    academicAreaCodePrimary?: string | number = null;
    academicAreaPrimary?: any;
    academicAreaCodeSecondary?: string | number = null;
    academicAreaSecondary?: any;
    affiliationInstitutionCode?: string | number = null;
    affiliationInstitution?: any;
    isTopInstitution?= null;
    externalReviewerId?: number;
    department?: string;
}

export class ExternalReviewerExt {
    externalReviewerId?: string | number;
    hIndex?: string | number = null;
    supplierDof?: string;
    ciraCode?: string | number = null;
    extReviewerCira?: any;
    extReviewerOriginality?: any;
    orginalityCode?: string | number = null;
    extReviewerThoroughness?: any;
    thoroughnessCode?: string | number = null;
    scopusUrl? = '';
    urlProfile? = '';
    disciplinaryField?: string;
}

export interface ExternalReviewer {
    externalReviewerId: number;
    lastName: string;
    firstName: string;
    middleName: string;
    passportName: string;
    gender?: any;
    primaryEmail: string;
    secondaryEmail?: any;
    countryCode?: any;
    countryDetails?: any;
    academicRankCode?: any;
    academicRank?: any;
    affiliationInstitutionCode?: any;
    affiliationInstitution?: any;
    isTopInstitution?: any;
    agreementStartDate?: any;
    agreementEndDate?: any;
    academicAreaCodeSecondary?: any;
    academicAreaSecondary?: any;
    academicAreaCodePrimary?: any;
    academicAreaPrimary?: any;
    status: string;
    department?: any;
    principalName: string;
    additionalInformation?: any;
    isUsernameChange: boolean;
    isEmailChange: boolean;
}

export interface Unit {
    unitNumber: string;
    parentUnitNumber: string;
    organizationId: string;
    unitName: string;
    active: boolean;
    updateTimestamp: number;
    updateUser: string;
    acronym?: any;
    isFundingUnit?: any;
    unitAdministrators: any[];
    unitDetail: string;
    parentUnitName?: any;
    organizationName?: any;
}

export interface Person {
    personId: string;
    lastName?: string;
    firstName?: string;
    middleName?: any;
    fullName: string;
    priorName?: any;
    principalName: string;
    emailAddress?: string;
    dateOfBirth?: any;
    age?: any;
    gender?: any;
    educationLevel?: any;
    officeLocation?: any;
    secOfficeLocation?: any;
    secOfficePhone?: any;
    school?: any;
    directoryDepartment?: any;
    countryOfCitizenshipCode?: any;
    countryOfCitizenshipDetails?: any;
    primaryTitle?: any;
    directoryTitle?: any;
    homeUnit?: string;
    unit?: Unit;
    isFaculty?: any;
    isGraduateStudentStaff?: any;
    isResearchStaff?: boolean;
    isServiceStaff?: any;
    isSupportStaff?: any;
    isOtherAcadamic?: any;
    isMedicalStaff?: any;
    addressLine1?: any;
    addressLine2?: any;
    addressLine3?: any;
    city?: any;
    country?: any;
    state?: any;
    postalCode?: any;
    countryCode?: any;
    countryDetails?: any;
    faxNumber?: any;
    pagerNumber?: any;
    mobileNumber?: any;
    status?: string;
    salaryAnniversary?: any;
    updateTimestamp?: number;
    updateUser?: string;
    supervisorPersonId?: any;
    orcidId?: any;
    isWebhookActive?: any;
    dateOfInactive?: number;
    isExternalUser?: any;
    officePhone?: any;
    isPasswordChange?: boolean;
    isUsernameChange?: boolean;
}

export interface coiWithPerson {
    coiWithPersonId?: number;
    personId: string;
    externalReviewerId: number;
    externalReviewer?: ExternalReviewer;
    person: Person;
    actionType: null | string;
}

export class AttachmentType {
    attachmentTypeCode: number;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export class ExtReviewerAttachment {
    externalReviewerId: number | string;
    attachmentTypeCode: number | string;
    externalReviewerAttachmentType = new AttachmentType();
    description: string;
    mimeType: string;
    fileName: string;
}
export class ExternalReviewerRight {
    externalReviewerId?: string | number = '';
    personRoleId?: string = null;
    reviewerRightId?: string = null;
    reviewerRights?: any;
}


