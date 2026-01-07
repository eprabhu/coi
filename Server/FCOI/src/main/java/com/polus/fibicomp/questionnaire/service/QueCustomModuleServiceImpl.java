package com.polus.fibicomp.questionnaire.service;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.questionnaire.custompojos.CoiQuestAnswer;
import com.polus.core.questionnaire.custompojos.CoiQuestAnswerAttachment;
import com.polus.core.questionnaire.custompojos.CoiQuestTableAnswer;
import com.polus.core.questionnaire.dao.QuestionnaireDAO;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.modulefactory.QueCustomModuleService;
import com.polus.core.questionnaire.pojo.QuestAnswerHeader;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dao.QueCustomModuleDao;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.opa.dao.OPADao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QueCustomModuleServiceImpl  implements QueCustomModuleService {

    @Autowired
    private QuestionnaireDAO questionnaireDAO;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private QueCustomModuleDao queCustomModuleDao;

    @Autowired
    private FcoiDisclosureDao fcoiDisclosureDao;

    @Autowired
    private ConflictOfInterestDao coiDao;

    @Autowired
    private OPADao opaDao;

    @Override
    public void copyQuestionnaireData(QuestionnaireDataBus questionnaireDataBus, Integer moduleCode, Boolean isVariation) {
        List<Integer> moduleSubItemCodes = questionnaireDataBus.getModuleSubItemCodes();
        String moduleItemKey = questionnaireDataBus.getModuleItemKey();
        String moduleSubItemKey = questionnaireDataBus.getModuleSubItemKey();
        String copyModuleItemKey = questionnaireDataBus.getCopyModuleItemKey();
        List<Integer> questionnaireIds = questionnaireDAO.getActiveQuestionnaireIds(moduleCode, moduleSubItemCodes, moduleItemKey, moduleSubItemKey);        List<QuestAnswerHeader> answerHeaders = questionnaireDAO.getQuestionanswerHeadersToCopy(moduleCode, moduleSubItemCodes, moduleItemKey, moduleSubItemKey, questionnaireIds, questionnaireDataBus.getCopyInActiveQuestionAnswers());
        for (QuestAnswerHeader answerHeader : answerHeaders) {
            List<CoiQuestAnswer> copyQuestAnswers = new ArrayList<>();
            QuestAnswerHeader copyAnswerHeader = new QuestAnswerHeader();
            copyAnswerHeader.setModuleItemCode(answerHeader.getModuleItemCode());
            copyAnswerHeader.setModuleSubItemCode(answerHeader.getModuleSubItemCode());
            copyAnswerHeader.setModuleItemKey(copyModuleItemKey);
            copyAnswerHeader.setModuleSubItemKey(answerHeader.getModuleSubItemKey());
            copyAnswerHeader.setQuestCompletedFlag(answerHeader.getQuestCompletedFlag());
            copyAnswerHeader.setQuestionnaireId(answerHeader.getQuestionnaireId());
            copyAnswerHeader.setUpdateUser(answerHeader.getUpdateUser());
            copyAnswerHeader.setUpdateTimeStamp(answerHeader.getUpdateTimeStamp());
            List<CoiQuestAnswer> questAnswers = answerHeader.getCoiQuestAnswers();
            if (questAnswers != null && !questAnswers.isEmpty()) {
                for (CoiQuestAnswer questAnswer : questAnswers) {
                    CoiQuestAnswer copyQuestAnswer = new CoiQuestAnswer();
                    copyQuestAnswer.setAnswer(questAnswer.getAnswer());
                    copyQuestAnswer.setAnswerLookUpCode(questAnswer.getAnswerLookUpCode());
                    copyQuestAnswer.setAnswerNumber(questAnswer.getAnswerNumber());
                    copyQuestAnswer.setExplanation(questAnswer.getExplanation());
                    copyQuestAnswer.setQuestionId(questAnswer.getQuestionId());
                    copyQuestAnswer.setOptionNumber(questAnswer.getOptionNumber());
                    copyQuestAnswer.setUpdateTimeStamp(questAnswer.getUpdateTimeStamp());
                    copyQuestAnswer.setUpdateUser(questAnswer.getUpdateUser());
                    copyQuestAnswer.setQuestAnswerHeader(copyAnswerHeader);
                    List<CoiQuestAnswerAttachment> copyQuestAnswerAttachments = new ArrayList<>();
                    List<CoiQuestAnswerAttachment> questAnswerAttachments = questAnswer.getQuestAnswerAttachment();
                    if (questAnswerAttachments != null && !questAnswerAttachments.isEmpty()) {
                        for (CoiQuestAnswerAttachment questAnswerAttachment : questAnswerAttachments) {
                            CoiQuestAnswerAttachment copyQuestAnswerAttachment = new CoiQuestAnswerAttachment();
                            copyQuestAnswerAttachment.setAttachment(questAnswerAttachment.getAttachment());
                            copyQuestAnswerAttachment.setContentType(questAnswerAttachment.getContentType());
                            copyQuestAnswerAttachment.setFileName(questAnswerAttachment.getFileName());
                            copyQuestAnswerAttachment.setUpdateTimeStamp(questAnswerAttachment.getUpdateTimeStamp());
                            copyQuestAnswerAttachment.setUpdateUser(questAnswerAttachment.getUpdateUser());
                            copyQuestAnswerAttachment.setQuestAnswer(copyQuestAnswer);
                            copyQuestAnswerAttachments.add(copyQuestAnswerAttachment);
                        }
                    }
                    copyQuestAnswer.setQuestAnswerAttachment(copyQuestAnswerAttachments);
                    copyQuestAnswers.add(copyQuestAnswer);
                }
            }
            copyAnswerHeader.setCoiQuestAnswers(copyQuestAnswers);
            questionnaireDAO.copyQuestionAnswers(copyAnswerHeader);
            copyCoiTableAnswer(answerHeader.getQuestAnsHeaderId(), copyAnswerHeader.getQuestAnsHeaderId());
        }
    }

    private void copyCoiTableAnswer(Integer oldQuestionnaireAnsHeaderId, Integer questionnaireAnsHeaderId) {
        List<CoiQuestTableAnswer> questTableAnswers = queCustomModuleDao.getCoiQuestTableAnswers(oldQuestionnaireAnsHeaderId);
        if (questTableAnswers != null && !questTableAnswers.isEmpty()) {
            questTableAnswers.forEach(tableAnswer -> {
                CoiQuestTableAnswer questTableAnswer = new CoiQuestTableAnswer();
                questTableAnswer.setQuestAnsHeaderId(questionnaireAnsHeaderId);
                questTableAnswer.setOrderNumber(tableAnswer.getOrderNumber());
                questTableAnswer.setQuestionId(tableAnswer.getQuestionId());
                questTableAnswer.setUpdateUser(tableAnswer.getUpdateUser());
                questTableAnswer.setUpdateTimeStamp(commonDao.getCurrentTimestamp());
                questTableAnswer.setColumn1(tableAnswer.getColumn1());
                questTableAnswer.setColumn2(tableAnswer.getColumn2());
                questTableAnswer.setColumn3(tableAnswer.getColumn3());
                questTableAnswer.setColumn4(tableAnswer.getColumn4());
                questTableAnswer.setColumn5(tableAnswer.getColumn5());
                questTableAnswer.setColumn6(tableAnswer.getColumn6());
                questTableAnswer.setColumn7(tableAnswer.getColumn7());
                questTableAnswer.setColumn8(tableAnswer.getColumn8());
                questTableAnswer.setColumn9(tableAnswer.getColumn9());
                questTableAnswer.setColumn10(tableAnswer.getColumn10());
                queCustomModuleDao.saveCoiQuestTableAnswers(questTableAnswer);
            });
        }
    }

    @Override
    public void updateDocumentUpdateUserAndTimestamp(Integer moduleCode, Integer moduleItemKey, Integer subModuleCode, String subModuleItemKey, String updateUser) {
        if (moduleCode == Constants.COI_MODULE_CODE && subModuleCode != null && subModuleCode == Constants.COI_SFI_SUBMODULE_CODE) {
            coiDao.updatePersonEntityUpdateDetails(moduleItemKey);
        } else if (moduleCode == Constants.COI_MODULE_CODE) {
            fcoiDisclosureDao.updateDisclosureUpdateDetails(moduleItemKey);
        } else if (moduleCode == Constants.OPA_MODULE_CODE) {
            opaDao.updateOPADisclosureUpDetails(moduleItemKey, commonDao.getCurrentTimestamp());
        }
    }
}
