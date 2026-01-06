
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

export interface ANSWERS {
    [x: string]: TableAnswer[];
}


export interface HEADER {
    EXPLANTION_LABEL?: any;
    QUESTION_OPTION_ID: number;
    OPTION_NUMBER: number;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION: string;
}

export interface Question {
    LOOKUP_TYPE?: any;
    LOOKUP_FIELD?: any;
    ANSWER_LENGTH?: any;
    GROUP_LABEL?: any;
    UPDATE_USER: string;
    QUESTION_NUMBER: number;
    LOOKUP_NAME?: any;
    HAS_CONDITION?: any;
    QUESTION: string;
    SHOW_QUESTION: boolean;
    GROUP_NAME: string;
    HELP_LINK?: any;
    QUESTION_VERSION_NUMBER: number;
    DESCRIPTION?: any;
    SORT_ORDER: number;
    QUESTION_ID: number;
    ANSWERS: ANSWERS;
    AC_TYPE: string;
    ANSWER_TYPE: string;
    NO_OF_ANSWERS: number | Number;
    UPDATE_TIMESTAMP: number;
    PARENT_QUESTION_ID?: any;
    HEADERS: HEADER[];
    is_add_row: boolean;
    RULE_ID: any;
    IS_NO_VISIBLE_ANSWERS: boolean;
    IS_ANSWERED: boolean;
    IS_LIMIT_REACHED: boolean | null;
    EXPLANATION: {};
    ANSWER_LOOKUP_CODE?: string;
}


export interface OPTION {
    EXPLANTION_LABEL: any;
    QUESTION_OPTION_ID: number;
    OPTION_NUMBER: any;
    QUESTION_ID: number;
    OPTION_LABEL: string;
    REQUIRE_EXPLANATION: string;
  }

export class QuestionnaireRequestObject {
    questionnaireId = null;
    moduleItemKey = null;
    moduleSubItemKey = '';
    moduleItemCode = null;
    moduleSubItemCode = null;
    questionnaireAnswerHeaderId = null;
    questionnaireCompleteFlag = null;
    questionnaire = null;
    header = null;
    files?:any
}

export class QuestionRequestObject {
    QUESTION_ID = null;
    AC_TYPE = null;
    ANSWERS = null;
    ANSWER_TYPE = null;
    NO_OF_ANSWERS = null;
    ANSWER_LOOKUP_CODE = '';
    EXPLANATION = null;
}

export interface OptionRequestObject {
    QUESTION_ID: number;
    OPTION_LABEL: string;
}

export interface AutoSaveRequestQuestionnaireData {
    questions: QuestionRequestObject[];
    options: OptionRequestObject[];
}

export interface AutoSaveResponse {
    moduleItemCode: number;
    moduleSubItemCode: number;
    moduleItemKey: string;
    moduleSubItemKey: string;
    questionnaireId: number;
    questionnaireAnswerHeaderId: number;
    questionnaireCompleteFlag: string;
    questionnaire: AutoSaveResponseQuestionnaire;
    asyncData: string;
    header: AutoSaveResponseHeader;
}

export interface AutoSaveResponseQuestionnaire {
    questions: Question[];
}

export interface AutoSaveResponseHeader {
    TRIGGER_POST_EVALUATION: null;
    QUESTIONNAIRE_VERSION: number;
    QUESTIONNAIRE_COMPLETED_FLAG: string;
    UPDATE_USER: string;
    ANS_UPDATE_TIMESTAMP: number;
    ANS_PERSON_FULL_NAME: string;
    QUESTIONNAIRE_DESCRIPTION: null;
    IS_FINAL: boolean;
    QUESTIONNAIRE_NUMBER: number;
    QUESTIONNAIRE_ID: number;
    QUEST_GROUP_TYPE_CODE: null;
    AC_TYPE: string;
    QUESTIONNAIRE_NAME: string;
    UPDATE_TIMESTAMP: number;
}

export interface AttachmentData {
    attachment: File;
    questionId: number;
    fileName: string;
    type: string;
}

