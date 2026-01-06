import { BehaviorSubject } from "rxjs";

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

export interface CertificationLogRO {
    moduleItemKey: number;
    property1: string;
    moduleCode: number;
}

export interface PersonNotificationMailLog {
    errorMsg?: any;
    mailSentFlag: 'Y' | 'N';
    sendDate: number;
}

export interface PersonNotifyMailRO {
    proposalId: number;
    personId?: number | string;
    actionType?: string;
    personCertified?: boolean;
}

export interface ModulesConfiguration {
    sectionConfig: SectionConfig[];
}

export interface SectionConfig {
    sectionCode: string;
    moduleCode: string;
    description: string;
    isActive: boolean;
    updateUser: string;
    updateTimestamp: number;
    subSectionConfig: SubSectionConfig[]
}

export interface SubSectionConfig {
    subSectionCode: string;
    parentSubSectionCode: string;
    description: string;
    isActive: boolean;
    updateUser: string;
    updateTimestamp: number;
    help?: string;
    instruction: string;
    elementConfig: ElementConfig[]
}

export interface ElementConfig {
    elementId: number;
    uiReferenceId: string;
    description: string;
    subSectionCode: string;
    sectionCode: string;
    help: string;
    instruction: string;
    updateUser?: string;
    updateTimestamp: number;
}

export class SearchLengthValidatorOptions {
  isShowLimiter = false;
  limiterStyle = 'p2 text-end word-count';
  limit = 2000;
  position = 'BELOW';
  elementId = '';
};

export class Question {
    LOOKUP_TYPE: any;
    LOOKUP_FIELD: any;
    ANSWER_LENGTH: any;
    RULE_ID: any;
    GROUP_LABEL: any;
    UPDATE_USER: string;
    QUESTION_NUMBER: number;
    LOOKUP_NAME: any;
    HAS_CONDITION?: string;
    QUESTION: string;
    SHOW_QUESTION?: boolean;
    GROUP_NAME: string;
    HELP_LINK: any;
    QUESTION_VERSION_NUMBER: number;
    DESCRIPTION: any;
    SORT_ORDER: number;
    QUESTION_ID: number;
    ANSWERS?: any;
    ANSWER_TYPE: string;
    NO_OF_ANSWERS?: number;
    UPDATE_TIMESTAMP: string;
    PARENT_QUESTION_ID?: number;
    IS_MANDATORY?: 'Y' | 'N';
    MANDATORY_MESSAGE?: string;
    AC_TYPE: string;
    HEADERS: HEADER[];
    is_add_row: boolean;
    IS_NO_VISIBLE_ANSWERS: boolean;
    IS_ANSWERED: boolean;
    IS_LIMIT_REACHED: boolean | null;
}

export interface HEADER {
    EXPLANTION_LABEL?: any;
    QUESTION_OPTION_ID: number;
    OPTION_NUMBER: number;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION: string;
}

export class MandatoryElementIds {
    buttonId = '';
    elementId = '';
}

export interface PersistentNotifications {
    $questionnaire: BehaviorSubject<QuestionnaireEvent | null>,
    $formValidationList: BehaviorSubject<any>,
    $validationScrollId: BehaviorSubject<string>
}

export interface QuestionnaireEvent {
    questionnaireId: number| null;
    isTriggerValidation: boolean;
}

export class QuestionnaireValidationMap {
    questionnaireId: number = 0;
    isTriggerValidation = false;
}

export interface FormValidationList {
  formBuilderId: number;
  sectionId: number;
  componentId: number;
  label: string;
  validationType: string;
  validationMessage: string;
  componentType: string;
  questionId: number | null;
  questionnaire?:FormValidationList[];
}
