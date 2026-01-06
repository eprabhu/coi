
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
}

