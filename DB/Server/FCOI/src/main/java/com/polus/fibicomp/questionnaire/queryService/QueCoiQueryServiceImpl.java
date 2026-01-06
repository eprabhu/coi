package com.polus.fibicomp.questionnaire.queryService;


import com.polus.fibicomp.coi.service.CoiQuestQueries;
import org.springframework.stereotype.Service;

import com.polus.core.questionnaire.v1.util.QueModuleQueryService;

@Service(value = "queModuleQueryService_V1_8")
public class QueCoiQueryServiceImpl implements QueModuleQueryService {

    @Override
    public String getDeleteAttachmentAnswerQueryName() {
        return CoiQuestQueries.DELETE_QUESTIONNAIRE_ATTACHMENT_ANSWER;
    }

    @Override
    public String getUpdateAttachmentAnswerQueryName() {
        return CoiQuestQueries.UPDATE_QUESTIONNAIRE_ATTACHMENT_ANSWER;
    }

    @Override
    public String getInsertAttachmentAnswerQueryName() {
        return CoiQuestQueries.INSERT_QUESTIONNAIRE_ATTACHMENT_ANSWER;
    }

    @Override
    public String getUpdateAnswerQueryName() {
        return CoiQuestQueries.UPDATE_QUESTIONNAIRE_ANSWER;
    }

    @Override
    public String getDeleteAnswerQueryName() {
        return CoiQuestQueries.DELETE_QUESTIONNAIRE_ANSWER;
    }

    @Override
    public String getDeleteQuestAnswerAttachmentQueryName() {
        return CoiQuestQueries.DELETE_QUEST_ANSWER_ATTACHMENT;
    }

    @Override
    public String getInsertTableAnswerQueryName() {
        return CoiQuestQueries.INSERT_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
    public String getUpdateTableAnswerQueryName() {
        return CoiQuestQueries.UPDATE_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
    public String getDeleteTableAnswerQueryName() {
        return CoiQuestQueries.DELETE_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
	public String getTableAnswerId() {
		return CoiQuestQueries.GET_TABLE_ANSWER_ID;
	}
}
