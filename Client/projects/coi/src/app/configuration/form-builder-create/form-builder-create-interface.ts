export class FormIntegration {
    formModuleCode = null;
    formSubSectionCode = null;
    formRule = null;
    formUsageId = null;
    formOrderNumber = null;
    formLabel = '';
}



export interface GetAllFormUsage {
    formUsageId: number;
    formBuilderId: number;
    formOrderNumber: number;
    moduleCode: string;
    subModuleCode: string;
    businessRuleId: any;
    description: string;
    isActive: string;
    createTimestamp: string;
    createUser: string;
    updateTimestamp: string;
}

export interface SubModules {
    SUB_MODULE_CODE: number;
    DESCRIPTION: string;
    MODULE_CODE: number;
    IS_ACTIVE: string;
  }

  export interface FetchModuleCode {
    applicableQuestionnaire: any;
    questionnaireId: any;
    moduleItemKey: any;
    moduleSubItemKey: any;
    moduleItemCode: any;
    moduleSubItemCode: any;
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
    header: any;
    questionnaire: any;
    usage: any;
    fileName: any;
    fileContent: any;
    length: any;
    remaining: any;
    fileTimestamp: any;
    contentType: any;
    personId: any;
    multipartFile: any;
    moduleList: ModuleList[];
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
  }

  export interface ModuleList {
    SUB_MODULE_CODE: number;
    DESCRIPTION: string;
    MODULE_CODE: any;
    IS_ACTIVE: string;
  }

  export class SaveFormUsage {
    formBuilderNumber: string;
    formBuilderId: string;
    moduleCode: any;
    subModuleCode: any;
    businessRuleId: any;
    description: string;
    isActive: string;
  }

  export interface IntegrtionResponse {
    formUsageId: number;
    formBuilderId: number;
    formOrderNumber: number;
    moduleCode: string;
    subModuleCode: string;
    businessRuleId: any;
    description: string;
    isActive: string;
    createTimestamp: string;
    createUser: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export class UpdateFormUsage {
    formUsageId: any;
    formBuilderNumber: string;
    formBuilderId: string;
    moduleCode: any;
    subModuleCode: any;
    businessRuleId: any;
    description: string;
    isActive: string;
    formOrderNumber: any;
  }

  export interface LoadForm {
    formHeader: FormHeader;
    lookupProgramElements: LookupProgramElement[];
    lookupSectionComponentType: LookupSectionComponentType[];
  }

  export interface FormHeader {
    formBuilderId: number;
    formBuilderNumber: string;
    versionNumber: number;
    versionStatus: string;
    title: string;
    description: string;
    isActive: string;
    createTimestamp: string;
    createUser: string;
    updateTimestamp: string;
    updateUser: string;
    usages: Usage[];
    sections: Section[];
  }

  export interface Usage {
    formUsageId: number;
    formBuilderId: number;
    formOrderNumber: number;
    moduleCode: string;
    subModuleCode: string;
    businessRuleId: any;
    description: string;
    isActive: string;
    createTimestamp: string;
    createUser: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface Section {
    sectionId: number;
    formBuilderId: number;
    sectionName: string;
    sectionOrder: number;
    businessRuleId: any;
    description: string;
    helpText: string;
    sectionHeader: string;
    sectionFooter: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
    sectionComponent?: SectionComponent[];
  }

  export interface SectionComponent {
    componentId: number;
    sectionId: number;
    formBuilderId: number;
    componentTypeCode: string;
    componentOrder: number;
    componentData: string;
    componentRefId: string;
    description: string;
    headerInstruction: string;
    footerInstruction: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
    isMandatory?: string;
    validationMessage: any;
    label: string;
  }

  export interface LookupProgramElement {
    progElementId: number;
    progElementNumber: string;
    versionNumber: number;
    versionStatus: string;
    progElementName: string;
    description: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface LookupSectionComponentType {
    componentTypeCode: string;
    description: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface FormHeaderResponse {
    formBuilderId: number;
    formBuilderNumber: string;
    versionNumber: number;
    versionStatus: string;
    title: string;
    description: string;
    isActive: string;
    createTimestamp: string;
    createUser: string;
    updateTimestamp: string;
    updateUser: string;
    usages: any;
    sections: any;
  }

  export interface ConfigureCustomElementData {
    customDataElement: CustomDataElement;
    customDataElements: any;
    responseMessage: string;
    customDataElementId: any;
    elementOptions: ElementOption[];
    customResponses: any;
    moduleCode: any;
    subModuleCode: any;
    customElements: any;
    updateUser: any;
    updateTimestamp: any;
    moduleItemKey: any;
    moduleSubItemKey: any;
    deleteOptions: any[];
    dataTypeCode: any;
    lookUps: any;
  }

  export interface CustomDataElement {
    customElementId: any;
    columnLabel: string;
    dataType: string;
    customDataTypes: CustomDataTypes;
    dataLength?: any;
    defaultValue: string;
    isMultiSelectLookup: string;
    hasLookup: string;
    lookupWindow: string;
    lookupArgument: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: string;
    customElementName: string;
    acType: string;
  }

  export interface CustomDataTypes {
    componentTypeCode: string;
    description: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface ElementOption {
    customDataOptionId: number;
    customDataElementsId: number;
    optionName: string;
    updateTimestamp: string;
    updateUser: string;
    acType: string;
  }

  export class ComponentObjects {
    componentId:  number;
    componentType: string;
    componentData: any;
    componentRefId: string;
    description: string;
    componentHeader: string;
    componentFooter: string;
    isActive: any;
    label: string;
    isMandatory: any;
    validationMessage: string;
    captureDescription: string;
  }

  export class CustomDataObject {
    acType: string;
    customElementId: any;
    columnId: any;
    columnLabel: string;
    dataType: string;
    dataLength: any;
    defaultValue: string;
    hasLookup: any;
    updateUser: string;
    updateTimestamp: number;
    isMultiSelectLookup: string;
    lookupArgument: string;
    customDataTypes = {};
    isActive: string;
    lookupWindow: string;
    customElementName: string;
    placeHolderText?: string;
}

export interface ComponentData {
  componentId: number;
  sectionId: number;
  formBuilderId: any;
  componentType: string;
  componentOrder: number;
  componentData: string;
  componentRefId: string;
  componentDescription: string;
  componentHeader: string;
  componentFooter: string;
  isActive: string;
  updateTimestamp: string;
  updateUser: string;
  isMandatory: any;
  validationMessage: any;
  label: any;
  componentTypeDescription: any;
  captureDescription?: any;
  }

  // export interface FormHeader {
  //   formBuilderId: number;
  //   formBuilderNumber: string;
  //   versionNumber: number;
  //   versionStatus: string;
  //   title: string;
  //   description: string;
  //   isActive: string;
  //   createTimestamp: string;
  //   createUser: string;
  //   updateTimestamp: string;
  //   updateUser: string;
  //   usages: any;
  //   sections: any;
  // }

  export interface NewSection {
    sectionId: number;
    formBuilderId: number;
    sectionName: string;
    sectionOrder: number;
    sectionBusinessRule: any;
    sectionDescription: string;
    sectionHelpText: string;
    sectionHeader: string;
    sectionFooter: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
    sectionComponent: any;
  }

  export interface ReadSectionComponent {
    componentId: number;
    sectionId: number;
    formBuilderId: any;
    componentType: string;
    componentTypeDescription: any;
    componentOrder: number;
    componentData: string;
    componentRefId: string;
    description: string;
    componentHeader: string;
    componentFooter: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
    isMandatory: string;
    validationMessage: any;
    label: any;
    captureDescription: any;
  }

  export interface FormList {
    formBuilderId: number;
    formBuilderNumber: string;
    versionNumber: number;
    versionStatus: string;
    title: any;
    description: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: string;
    pendingVersionId?: string | number;
  }

  export interface ElementTree {
    componentTypeCode: string;
    description: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface SectionUpdate {
    sectionId: number;
    formBuilderId: number;
    sectionName: string;
    sectionOrder: number;
    businessRuleId: any;
    description: string;
    helpText: string;
    headerInstruction: string;
    footerInstruction: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
    sectionComponents: any;
  }


  export interface ProgramElementList {
    progElementId: number;
    progElementNumber: string;
    versionNumber: number;
    versionStatus: string;
    progElementName: string;
    description: string;
    isActive: string;
    updateTimestamp: string;
    updateUser: string;
  }

  export interface QuestionnaireElementList {
    ACTIVE_QUESTIONNAIRE_VERSION?: string;
    QUESTIONNAIRE_LABEL: string;
    PENDING_ANSWERED_COUNT?: string;
    IS_FINAL: string;
    ACTIVE_QUESTIONNAIRE_ID?: string;
    PENDING_QUESTIONNAIRE_ID?: string;
    QUESTIONNAIRE_NUMBER: number;
    PENDING_QUESTIONNAIRE_VERSION?: string;
    UPDATE_USER: string;
    ACTIVE_ANSWERED_COUNT?: string;
    UPDATE_TIMESTAMP: string;
  }

  export interface GetQuestionnaire {
    applicableQuestionnaire: any;
    questionnaireId: any;
    moduleItemKey: any;
    moduleSubItemKey: any;
    moduleItemCode: any;
    moduleSubItemCode: any;
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
    questionnaireList: QuestionnaireElementList[];
    questionnaireGroup: QuestionnaireGroup[];
    header: any;
    questionnaire: any;
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
  }

  export interface QuestionnaireGroup {
    DESCRIPTION: string;
    QUEST_GROUP_TYPE_CODE: string;
  }

  export interface GetCustomElement {
    customDataElement: any;
    customDataElements: CustomDataElements[];
    responseMessage: any;
    customDataElementId: any;
    customDataTypes: any;
    elementOptions: any;
    customResponses: any;
    moduleCode: any;
    customElements: any;
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

  export interface CustomDataElements {
    customElementId: number;
    columnId: number;
    columnVersionNumber: number;
    columnLabel: string;
    dataType: string;
    customDataTypes: CustomDataTypes;
    dataLength?: any;
    defaultValue: string;
    isLatestVesrion: string;
    hasLookup: boolean;
    lookupWindow: string;
    lookupArgument: string;
    isActive: string;
    updateUser: string;
    updateTimestamp: number;
    customElementName: string;
    customDataElementUsage: CustomDataElementUsage[];
    acType: any;
  }

  export interface CustomDataElementUsage {
    customElementUsageId: number;
    moduleCode: number;
    module: Module;
    isRequired: string;
    updateUser: string;
    updateTimestamp: number;
    orderNumber?: number;
    acType: any;
  }

  export interface Module {
    moduleCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
  }

  export interface ComponentOrder {
    componentId: number;
    sectionId: number;
    componentOrder: number;
  }

  export interface SectionOrder {
    sectionId: number;
    formBuilderId: string;
    sectionOrder: number;
  }

  export class UpdateSectionObject {
    sectionId: number;
    sectionName: string;
    sectionOrder: number;
    sectionBusinessRule: any;
    sectionDescription: string;
    sectionHelpText: string;
    sectionHeader: string;
    sectionFooter: string;
    isActive: string;
  }

  export interface CreateFormHeader {
    title: string;
    description: string;
  }

  export class UpdateFormHeaderObject {
    formBuilderId: string;
    title: string;
    description: string;
    isActive: string;
    versionStatus?: string;
    versionMode?: string;
}

export class  CreateComponentObject {
  sectionId: string;
  formBuilderId: string;
  componentType: any;
  componentOrder: number;
  componentData: string;
  componentRefId: string;
  description: string;
  componentHeader: string;
  componentFooter: string;
  isActive: string;
  componentTypeDescription: any;
  label: any;
  isMandatory: any;
  validationMessage: any;
  captureDescription: any;
}

export class FormSectionObject {
    sectionId: any;
    formBuilderId: any;
    sectionName: any;
    sectionOrder: any;
    sectionBusinessRule: any;
    sectionDescription: any;
    sectionHelpText: any;
    sectionHeader: any;
    sectionFooter: any;
    isActive: any;
}

export interface ConfigureCustomElement {
    customDataElement: CustomDataObject;
    elementOptions: any[];
    deleteOptions: any[];
  }

export class CreateForm {
  title = '';
  description = '';
}

export interface FormVersion {
  formBuilderId: number;
  formBuilderNumber: string;
  title: string;
  versionNumber: number;
  versionStatus: string;
}

export class CustomAnswerAttachment {
  attachmentId = null;
  description = null;
  moduleItemCode = null;
  moduleItemKey = null;
  moduleSubItemCode = null;
  moduleSubItemKey = null;
  updateTimestamp = null;
  updateUser = null;
  fileKey = null;
  fileName = null;
  attachment = null;
}
