package com.polus.fibicomp.coi.service;

public interface CoiQuestQueries {

    String DELETE_QUESTIONNAIRE_ANSWER = new StringBuilder("DELETE FROM COI_QUEST_ANSWER WHERE QUESTION_ID = :questionId AND QUESTIONNAIRE_ANS_HEADER_ID = :questionnaireAnsHeaderId").toString();

    String UPDATE_QUESTIONNAIRE_ANSWER = new StringBuilder()
            .append("UPDATE COI_QUEST_ANSWER SET ANSWER = :answer, ")
            .append("ANSWER_LOOKUP_CODE = :answerLookupCode, ")
            .append("EXPLANATION = :explanation, ")
            .append("UPDATE_TIMESTAMP = :updateTimestamp, ")
            .append("UPDATE_USER = :updateUser ")
            .append("WHERE QUESTION_ID = :questionId ")
            .append("AND ANSWER_NUMBER = :answerNumber ")
            .append("AND QUESTIONNAIRE_ANS_HEADER_ID = :questionnaireAnsHeaderId")
            .toString();

    String DELETE_QUEST_ANSWER_ATTACHMENT = new StringBuilder()
            .append("DELETE FROM COI_QUEST_ANSWER_ATTACHMENT ")
            .append("WHERE QUESTIONNAIRE_ANSWER_ID IN ")
            .append("(SELECT QUESTIONNAIRE_ANSWER_ID FROM COI_QUEST_ANSWER ")
            .append("WHERE QUESTION_ID = :questionId ")
            .append("AND QUESTIONNAIRE_ANS_HEADER_ID = :questionnaireAnsHeaderId)")
            .toString();

    String DELETE_QUESTIONNAIRE_ATTACHMENT_ANSWER = new StringBuilder("DELETE FROM COI_QUEST_ANSWER_ATTACHMENT WHERE QUESTIONNAIRE_ANSWER_ATT_ID = :questionnaireAnswerAttId").toString();

    String UPDATE_QUESTIONNAIRE_ATTACHMENT_ANSWER = new StringBuilder("UPDATE COI_QUEST_ANSWER_ATTACHMENT SET ")
            .append("ATTACHMENT = :attachment, ")
            .append("FILE_NAME = :fileName, ")
            .append("CONTENT_TYPE = :contentType, ")
            .append("UPDATE_TIMESTAMP = :updateTimestamp, ")
            .append("UPDATE_USER = :updateUser ")
            .append("WHERE QUESTIONNAIRE_ANSWER_ATT_ID = :questionnaireAnswerAttId").toString();

    String INSERT_QUESTIONNAIRE_ATTACHMENT_ANSWER = new StringBuilder("INSERT INTO COI_QUEST_ANSWER_ATTACHMENT ")
            .append("(QUESTIONNAIRE_ANSWER_ID, ")
            .append("ATTACHMENT, ")
            .append("FILE_NAME, ")
            .append("CONTENT_TYPE, ")
            .append("UPDATE_TIMESTAMP, ")
            .append("UPDATE_USER) ")
            .append("VALUES ")
            .append("(:questionnaireAnswerId, ")
            .append(":attachment, ")
            .append(":fileName, ")
            .append(":contentType, ")
            .append(":updateTimestamp, ")
            .append(":updateUser)").toString();

    String INSERT_QUESTIONNAIRE_TABLE_ANSWER = new StringBuilder("INSERT INTO COI_QUEST_TABLE_ANSWER ")
            .append("(QUESTIONNAIRE_ANS_HEADER_ID, QUESTION_ID, ORDER_NUMBER, ")
            .append("COLUMN_1, COLUMN_2, COLUMN_3, COLUMN_4, COLUMN_5, COLUMN_6, ")
            .append("COLUMN_7, COLUMN_8, COLUMN_9, COLUMN_10, UPDATE_TIMESTAMP, UPDATE_USER) ")
            .append("VALUES ")
            .append("(:questionnaireAnsHeaderId, :questionId, :orderNumber, ")
            .append(":column1, :column2, :column3, :column4, :column5, :column6, ")
            .append(":column7, :column8, :column9, :column10, ")
            .append(":updateTimestamp, :updateUser)").toString();

    String UPDATE_QUESTIONNAIRE_TABLE_ANSWER = new StringBuilder("UPDATE COI_QUEST_TABLE_ANSWER SET ")
            .append("ORDER_NUMBER = :orderNumber, ")
            .append("COLUMN_1 = :column1, ")
            .append("COLUMN_2 = :column2, ")
            .append("COLUMN_3 = :column3, ")
            .append("COLUMN_4 = :column4, ")
            .append("COLUMN_5 = :column5, ")
            .append("COLUMN_6 = :column6, ")
            .append("COLUMN_7 = :column7, ")
            .append("COLUMN_8 = :column8, ")
            .append("COLUMN_9 = :column9, ")
            .append("COLUMN_10 = :column10, ")
            .append("UPDATE_TIMESTAMP = :updateTimestamp, ")
            .append("UPDATE_USER = :updateUser ")
            .append("WHERE QUEST_TABLE_ANSWER_ID = :questTableAnswerId").toString();

    String DELETE_QUESTIONNAIRE_TABLE_ANSWER = new StringBuilder("DELETE FROM COI_QUEST_TABLE_ANSWER WHERE QUEST_TABLE_ANSWER_ID = :questTableAnswerId").toString();

    String GET_TABLE_ANSWER_ID = new StringBuilder("SELECT QUEST_TABLE_ANSWER_ID ")
            .append("FROM COI_QUEST_TABLE_ANSWER ")
            .append("WHERE QUESTIONNAIRE_ANS_HEADER_ID = :questionnaireAnsHeaderId ")
            .append("AND QUESTION_ID = :questionId ")
            .append("AND ORDER_NUMBER = :orderNumber").toString();

    String UPDATE_QUESTIONNAIRE_COMPLETE_FLAG = new StringBuilder("UPDATE QUEST_ANSWER_HEADER SET ")
            .append("QUESTIONNAIRE_COMPLETED_FLAG = :questionnaireCompletedFlag, ")
            .append("UPDATE_TIMESTAMP = :updateTimestamp, ")
            .append("UPDATE_USER = :updateUser ")
            .append("WHERE QUESTIONNAIRE_ANS_HEADER_ID = :questionnaireAnsHeaderId").toString();


    String GET_EXISTING_ANSWER_HEADER_ID = new StringBuilder ("SELECT QUESTIONNAIRE_ANS_HEADER_ID FROM QUEST_ANSWER_HEADER ")
                .append("WHERE QUESTIONNAIRE_ID = :questionnaireId ")
                .append("AND MODULE_ITEM_CODE = :moduleItemCode ")
                .append("AND MODULE_SUB_ITEM_CODE = :moduleSubItemCode ")
                .append("AND MODULE_ITEM_KEY = :moduleItemKey ")
                .append("AND MODULE_SUB_ITEM_KEY = :moduleSubItemKey").toString();

}
