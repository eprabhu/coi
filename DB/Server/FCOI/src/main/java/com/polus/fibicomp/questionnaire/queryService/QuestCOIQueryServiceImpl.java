package com.polus.fibicomp.questionnaire.queryService;

import com.polus.core.questionnaire.modulefactory.QueModuleQueryService;
import org.springframework.stereotype.Service;

@Service("queModuleQueryService_8")
public class QuestCOIQueryServiceImpl implements QueModuleQueryService {

    private final static String GET_COI_QUESTIONNAIRE_ATTACHMENT = "GET_COI_QUESTIONNAIRE_ATTACHMENT";
    private final static String COI_UPD_ANS_TO_NEW_QUEST_VERSN = "COI_UPD_ANS_TO_NEW_QUEST_VERSN";
    private final static String DELETE_COI_QUESTIONNAIRE_ATTACHMENT_ANSWER = "DELETE_COI_QUESTIONNAIRE_ATTACHMENT_ANSWER";
    private final static String UPDATE_COI_QUESTIONNAIRE_ANSWER = "UPDATE_COI_QUESTIONNAIRE_ANSWER";
    private final static String DELETE_COI_QUESTIONNAIRE_ANSWER = "DELETE_COI_QUESTIONNAIRE_ANSWER";
    private final static String GET_COI_QUESTIONNAIRE_ANSWER = "GET_COI_QUESTIONNAIRE_ANSWER";
    private final static String DELETE_COI_QUEST_ANSWER_ATTACHMENT = "DELETE_COI_QUEST_ANSWER_ATTACHMENT";
    private final static String GET_COI_QUESTIONNAIRE_TABLE_ANSWER = "GET_COI_QUESTIONNAIRE_TABLE_ANSWER";
    private final static String INSERT_COI_QUESTIONNAIRE_TABLE_ANSWER = "INSERT_COI_QUESTIONNAIRE_TABLE_ANSWER";
    private final static String UPDATE_COI_QUESTIONNAIRE_TABLE_ANSWER = "UPDATE_COI_QUESTIONNAIRE_TABLE_ANSWER";
    private final static String DELETE_COI_QUESTIONNAIRE_TABLE_ANSWER = "DELETE_COI_QUESTIONNAIRE_TABLE_ANSWER";

    @Override
    public String getQuestAttachmentProName() {
        return GET_COI_QUESTIONNAIRE_ATTACHMENT;
    }

    @Override
    public String getDeleteQuestAnswerQuery() {
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("delete CoiQuestAnswer t1 where t1.questAnswerHeader.questAnsHeaderId in (select t2.questAnsHeaderId from QuestAnswerHeader ");
        hqlQuery.append("t2 where t2.moduleItemKey=:moduleItemKey and t2.moduleItemCode =:moduleItemCode and t2.moduleSubItemCode =:moduleSubItemCode and t2.moduleSubItemKey =:moduleSubItemKey) ");
        return hqlQuery.toString();
    }

    @Override
    public String getCopyAnswerToNewVersionProName() {
        return COI_UPD_ANS_TO_NEW_QUEST_VERSN;
    }

    @Override
    public String getDeleteAttachmentAnswerQueryName() {
        return DELETE_COI_QUESTIONNAIRE_ATTACHMENT_ANSWER;
    }

    @Override
    public String getUpdateAnswerQueryName() {
        return UPDATE_COI_QUESTIONNAIRE_ANSWER;
    }

    @Override
    public String getDeleteAnswerQueryName() {
        return DELETE_COI_QUESTIONNAIRE_ANSWER;
    }

    @Override
    public String getAnswerQueryName() {
        return GET_COI_QUESTIONNAIRE_ANSWER;
    }

    @Override
    public String getDeleteQuestAnswerAttachmentQueryName() {
        return DELETE_COI_QUEST_ANSWER_ATTACHMENT;
    }

    @Override
    public String getTableAnswerQueryName() {
        return GET_COI_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
    public String getInsertTableAnswerQueryName() {
        return INSERT_COI_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
    public String getUpdateTableAnswerQueryName() {
        return UPDATE_COI_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
    public String getDeleteTableAnswerQueryName() {
        return DELETE_COI_QUESTIONNAIRE_TABLE_ANSWER;
    }

    @Override
	public String getDeleteQuestAnsAttachByAnsIdQueryName() {
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("delete CoiQuestAnswerAttachment t1 where t1.questAnswer.questAnswerId in (select t2.questAnswerId from CoiQuestAnswer t2 ");
		hqlQuery.append("where t2.questAnswerHeader.questAnsHeaderId in (:questAnsHeaderId) )");
        return hqlQuery.toString();
	}

    @Override
	public String getDeleteQuestAnsByAnsHeaderIdQueryName() {
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("delete CoiQuestAnswer t1 where t1.questAnswerHeader.questAnsHeaderId in (:questAnsHeaderId)");
		return hqlQuery.toString();
	}

    @Override
	public String getDeleteQuestAnsTableByAnsHeaderIdQueryName() {
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("delete CoiQuestTableAnswer t1 where t1.questAnswerHeader.questAnsHeaderId in (:questAnsHeaderId)");
		return hqlQuery.toString();
	}

    @Override
    public String getDeleteQuestAnswerAttachmentsByIdsQuery() {
        StringBuilder query = new StringBuilder();
        query.append("delete from CoiQuestAnswerAttachment ")
                .append("where questAnswerAttachId in (:attachmentIds)");
        return query.toString();
    }

    @Override
    public String getIdsForDeleteQuestAnsAttachQuery() {
        StringBuilder query = new StringBuilder();
        query.append("select t1.questAnswerAttachId from CoiQuestAnswerAttachment t1 ")
                .append("where t1.questAnswer.questAnswerId in (")
                .append("select t2.questAnswerId from QuestAnswer t2 ")
                .append("where t2.questAnswerHeader.questAnsHeaderId in (")
                .append("select t3.questAnsHeaderId from QuestAnswerHeader t3 ")
                .append("where t3.moduleItemKey = :moduleItemKey ")
                .append("and t3.moduleItemCode = :moduleItemCode ")
                .append("and t3.moduleSubItemCode = :moduleSubItemCode ")
                .append("and t3.moduleSubItemKey = :moduleSubItemKey))");
        return query.toString();
    }
}
