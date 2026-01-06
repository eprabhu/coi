import { Question } from "../../../../shared/common.interface";

export class QuestionnaireVO {
    applicableQuestionnaire: any;
    questionnaireId: number;
    moduleItemKey: any;
    moduleSubItemKey: any;
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
    files: any[] = [];
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
    OPTION_NUMBER: any;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION: string;
}

export interface ANSWERS {
    [x: string]: TableAnswer[] | any;
}


export interface HEADER {
    EXPLANTION_LABEL?: any;
    QUESTION_OPTION_ID: number;
    OPTION_NUMBER: number;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION: string;
}

export class TableAnswer {
    AC_TYPE = null;
    QUEST_TABLE_ANSWER_ID = null;
    COLUMN_1 = null;
    COLUMN_2 = null;
    COLUMN_3 = null;
    COLUMN_4 = null;
    COLUMN_5 = null;
    COLUMN_6 = null;
    COLUMN_7 = null;
    COLUMN_8 = null;
    COLUMN_9 = null;
    COLUMN_10 = null;
    ORDER_NUMBER = 1;
    isAnswered = false;
}
