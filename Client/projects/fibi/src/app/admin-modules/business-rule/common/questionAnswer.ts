import { Rule } from '../create-final/rule-interfaces';

export interface QuestionAnswer {
    singleRule: Rule;
    ruleIndex: Number;
    subRuleIndex: Number;
    openModal: boolean;
    isEditClicked: boolean;
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
    AC_TYPE: string;
    ANSWER_TYPE: string;
    NO_OF_ANSWERS: number | Number;
    UPDATE_TIMESTAMP: number;
    PARENT_QUESTION_ID?: any;
    IS_NO_VISIBLE_ANSWERS: boolean;
    IS_ANSWERED: boolean;
    IS_LIMIT_REACHED: boolean | null;
}

