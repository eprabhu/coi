import { CompUnComp, CompUnCompPE } from "./PE-components/OPA-comp-uncomp/interface";
import { OPAInstituteResources, OPAInstituteResourcesPE } from "./PE-components/OPA-institute-resources/OPA-institute-resources.interface";
import { OutsideFinRelation, OutsideFinRelationPE } from "./PE-components/OPA-outside-financial-relation/interface";
import { StudentSubordinateEmployee, StudentSubordinatePE } from "./PE-components/OPA-student-subordinate-employee/interface";
import {CustomAnswerAttachment} from '../../form-builder-create-interface';
import { Question } from "../../../../shared/common.interface";

export class FormBuilder {
    applicableFormsBuilderIds: number[];
    form: Form;
}

type EventTypes = ['EXTERNAL_SAVE', 'SAVE', 'SAVE_COMPLETE', 'SAVE_COMPLETED', 'CONFIGURATION', 'IS_EDIT_MODE' , 'BLANK_FORM', 'REVISION_REQUESTED', 'EXTERNAL_ACTION', 'AUTO_SAVE_INPROGRESS'];

export class FormBuilderEvent {
    eventType: EventTypes[number];
    data?: any;
}

export class FormBuilderStatusEvent {
    action: string;
    result?: any;
}

export class Form {
    formBuilderId: number;
    formBuilderNumber: string;
    moduleItemCode: string;
    moduleSubItemCode: string;
    moduleItemKey: string;
    moduleSubItemKey: string;
    formName: string;
    formSections: FormSection[] = [];
}

export class FormSection {
    sectionId: number;
    sectionName: string;
    sectionOrder: number;
    sectionDescription: string;
    sectionBusinessRule: any;
    sectionHelpText?: string;
    sectionHeader?: string;
    sectionFooter?: string;
    sectionComponent: SectionComponent[];
    validationType?: null | 'VE' | 'VW';
}

export class SectionComponent {
    componentId: number;
    sectionId: number;
    componentDescription: any;
    componentType: string;
    componentRefId?: string;
    componentData?: any;
    componentHeader?: string;
    componentFooter: any;
    programmedElement: any;
    questionnaire?: QuestionnaireVO;
    customElement?: CustomElementVO;
    componentOrder: number;
    isMandatory?: any;
    validationMessage?: any;
    label?: any;
    componentTypeDescription?:any;
    tempId?:any
    formBuilderAnswerHeaderId?:number;
    placeHolderText?: string;
    captureDescription?: string;
    formFiles?: any;
}

export class QuestionnaireVO {
    applicableQuestionnaire: any;
    questionnaireId: number;
    moduleItemKey: string;
    moduleSubItemKey: string;
    moduleItemCode: number;
    moduleSubItemCode: number;
    questionnaireAnswerHeaderId: any;
    questionnaireAnsAttachmentId: any;
    questionnaireCompleteFlag: any;
    actionUserId: any;
    actionPersonId: any;
    actionPersonName: any;
    acType: any;
    questionnaireName: any;
    newQuestionnaireVersion: boolean;
    questionEditted: boolean;
    questionnaireList: any;
    questionnaireGroup: any;
    header: Header;
    questionnaire: Questionnaire;
    usage: any;
    fileName: any;
    fileContent: any;
    length: any;
    remaining: any;
    fileTimestamp: any;
    contentType: any;
    personId: any;
    multipartFile: any;
    moduleList: any;
    isInserted: any;
    updateTimestamp: any;
    copyModuleItemKey: any;
    questionnaireNumbers: any;
    lookUpDetails: any;
    newQuestionnaireId: any;
    moduleSubItemCodes: any[];
    questionnaireBusinessRules: any;
    ruleId: any;
    rulePassed: any;
    questionnaireMode: any;
    copyInActiveQuestionAnswers: boolean;
    files?: any[] = [];
}

export class Header {
    TRIGGER_POST_EVALUATION: any;
    QUESTIONNAIRE_VERSION: number;
    UPDATE_USER: string;
    ANS_UPDATE_TIMESTAMP: any;
    ANS_PERSON_FULL_NAME: any;
    QUESTIONNAIRE_DESCRIPTION: any;
    IS_FINAL: boolean;
    QUESTIONNAIRE_NUMBER: number;
    QUESTIONNAIRE_ID: number;
    QUEST_GROUP_TYPE_CODE: any;
    AC_TYPE: string;
    QUESTIONNAIRE_NAME: string;
    UPDATE_TIMESTAMP: string;
}

export class Questionnaire {
    maxGroupNumber: any;
    questions: Question[];
    conditions: Condition[];
    options: Option[];
    deleteList: any;
    questionnaireQuestions: any;
    questionnaireConditions: any;
    questionnaireOptions: any;
    questionnaireAnswers: any;
    quesAttachmentList: any;
    lookUpDetails: any;
}

export class Condition {
    QUESTION_CONDITION_ID: number;
    CONDITION_TYPE: string;
    GROUP_NAME: string;
    UPDATE_USER: string;
    QUESTION_ID: number;
    CONDITION_VALUE: string;
}

export class Option {
    EXPLANTION_LABEL: any;
    QUESTION_OPTION_ID: number;
    OPTION_NUMBER?: number;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION?: string;
}

export class CustomElementVO {
    customDataElement: any;
    customDataElements: any;
    responseMessage: any;
    customDataElementId: any;
    customDataTypes: any;
    elementOptions: any;
    customResponses: any;
    moduleCode: any;
    customElements: CustomElement[];
    updateUser: any;
    updateTimestamp: any;
    moduleItemKey: any;
    applicableModules: any;
    deleteOptions: any;
    isDataChange: any;
    dataTypeCode: any;
    systemLookups: any;
    lookUps: any;
    elementAnswered: any;
    subModuleCode: any;
    subModuleItemKey: any;
}

export class CustomElement {
    customDataElementId: number;
    columnName: string;
    defaultValue: string;
    dataType: string;
    isRequired: string;
    options: Option2[];
    answers: any[];
    moduleItemCode: number;
    moduleItemKey: string;
    subModuleItemCode: number;
    subModuleItemKey: string;
    dataLength: any;
    columnId: number;
    versionNumber: number;
    lookupWindow: string;
    lookupArgument: string;
    filterType: string;
    orderNumber: number;
    isActive: any;
    customElementName: any;
    attachments: CustomAnswerAttachment[];
}

export class Option2 {
    optionName: string;
    customDataOptionId: string;
}


export class FormBuilderSaveRO {
    formBuilderId: number;
    documentOwnerPersonId: string;
    moduleItemCode: string;
    moduleSubItemCode: string;
    moduleItemKey: string;
    moduleSubItemKey: string;
    componentId: number;
    componentType: string;
    componentRefId: string;
    componentData?: string;
    programmedElement: any;
    questionnaire: QuestionnaireVO;
    customElement: CustomElementVO;
    files: any;
    formBuilderAnswerHeaderId?: number|null;
}

export class FBConfiguration {
    moduleItemCode: string;
    moduleSubItemCode: string;
    moduleItemKey: string;
    moduleSubItemKey: string;
    documentOwnerPersonId: string;
    formBuilderId: number;
    formBuilderAnswerHeaderId?: number;
    newFormBuilderId?: string | number;
}

export class FBActionEvent {
    action: string;
    actionResponse?: SectionComponent| CompUnComp | OPAInstituteResources | OutsideFinRelation | StudentSubordinateEmployee;
    component?: SectionComponent | CompUnCompPE | OPAInstituteResourcesPE | OutsideFinRelationPE | StudentSubordinatePE;
}

export interface UpdatedQuestionnaire {
    componentId: number;
    questionnaire: any;
}

