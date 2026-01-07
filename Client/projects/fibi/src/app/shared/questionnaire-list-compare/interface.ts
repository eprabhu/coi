export interface Configuration {
    baseModuleItemCode: number;
    baseSubitemCodes: Array<number>;
    baseModuleItemKey: string;
    baseModuleSubItemKey: string;
    currentModuleItemCode: number;
    currentModuleItemKey: string;
    currentSubItemCodes: Array<string>;
    currentModuleSubItemKey: string;
    actionUserId: string;
    actionPersonName: string;
    baseQuestionnaireMode: string | object;
    currentQuestionnaireMode: string | object;
}

export interface ApplicableQuestionnaire {
    moduleItemCode: number | null;
    moduleSubItemCode: number | null;
    moduleSubItemKey: string;
    moduleItemKey: string;
    actionUserId: string;
    actionPersonName: string;
    questionnaireMode: string;
}

export interface CompareType {
    reviewSectionUniqueFields: Array<string>;
    reviewSectionSubFields: Array<string>;
}

export interface QuestionnaireDetail {
    baseQuestionnaire: any;
    currentQuestionnaire: any;
    configuration: any;
    moduleItemKeyList: any;
    baseQuestionnaireHeader: any;
    currentQuestionnaireHeader: any;
}

