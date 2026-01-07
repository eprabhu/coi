package com.polus.integration.proposal.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import com.polus.integration.client.FcoiFeignClient;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.proposal.dao.ProposalIntegrationDao;
import com.polus.integration.proposal.dto.DisclosureResponse;
import com.polus.integration.proposal.dto.ProposalDTO;
import com.polus.integration.proposal.dto.ProposalPersonDTO;
import com.polus.integration.proposal.pojo.COIIntegrationPropQuestAns;
import com.polus.integration.proposal.pojo.COIIntegrationProposal;
import com.polus.integration.proposal.pojo.COIIntegrationProposalPerson;
import com.polus.integration.proposal.questionnaire.pojo.FibiCoiQnrMapping;
import com.polus.integration.proposal.questionnaire.pojo.FibiCoiQnrQstnMapping;
import com.polus.integration.proposal.repository.ProposalIntegrationRepository;
import com.polus.integration.proposal.repository.ProposalPersonIntegrationRepository;
import com.polus.integration.proposal.repository.ProposalQnAIntegrationRepository;
import com.polus.integration.proposal.vo.CreateProposalDisclosureVO;
import com.polus.integration.proposal.vo.MarkVoidVO;
import com.polus.integration.proposal.vo.ProcessProposalDisclosureVO;
import com.polus.integration.proposal.vo.ProposalUserNotifyReqVO;
import com.polus.integration.proposal.vo.QuestionnaireVO;
import com.polus.integration.proposal.vo.ValidateDisclosureVO;
import com.polus.questionnaire.dto.FetchQnrAnsHeaderDto;
import com.polus.questionnaire.dto.GetQNRDetailsDto;
import com.polus.questionnaire.dto.QuestionnaireSaveDto;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@EnableAsync
@EnableRetry
@Service
@Slf4j
public class ProposalIntegrationServiceImpl implements ProposalIntegrationService {

	@Autowired
	private ProposalIntegrationRepository proposalIntegrationRepository;
	
	@Autowired
	private ProposalPersonIntegrationRepository proposalPersonIntegrationRepository;

	@Autowired
	private ProposalQnAIntegrationRepository qnAIntegrationRepository;

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private ProposalIntegrationDao proposalIntegrationDao;

	@Autowired
	private FcoiFeignClient fcoiFeignClient;

	@Autowired
	private RetryService retryService;

	@Value("${fibi.messageq.queues.devProposalIntegration}")
	private String devProposalIntegrationQueue;

	@Value("${fibi.messageq.queues.devPropQuesAnsIntegration}")
	private String devPropQuesAnsIntegrationQueue;

	private static final String ANSWERS = "ANSWERS";
	private static final String QUESTION_NUMBER = "QUESTION_NUMBER";
	private static final String AC_TYPE = "AC_TYPE";
	private static final String QUESTION_ID = "QUESTION_ID";
	private static final String CHECKBOX = "Checkbox";
	private static final String ANSWER_TYPE = "ANSWER_TYPE";
	
	private static final String PROPOSAL_DEACTIVATE_STATUS = "8";
	private static final String REMARK_PROPOSAL_VOID = "This proposal has been marked as Deactivated in the Source System (Kuali Coeus).";
	private static final String REMARK_PROPOSAL_PERSON_VOID = "Proposals Person has been inactive in the Source System (Kuali Coeus).";
	private static final String REMARK_PROPOSAL_PERSON_QUES_VOID = "Proposals Person Certification questionnaire answers validation didn't met in the Source System (Kuali Coeus).";
	
	
	@Override
	public void feedProposalDetails(ProposalDTO proposalDTO) {
		try {
			COIIntegrationProposal proposal = proposalIntegrationRepository.findProposalByProposalNumber(proposalDTO.getProposalNumber());
			COIIntegrationProposal coiIntegrationProposal = (proposal != null) ? proposal : new COIIntegrationProposal();
			if (proposal == null) {
			    coiIntegrationProposal.setFirstFedTimestamp(integrationDao.getCurrentTimestamp());
			}
			saveDevProposalDetails(proposalDTO, coiIntegrationProposal);
			saveProposalPersonDetail(proposalDTO);
            integrationDao.updateDeclarationPersonEligibility(proposalDTO.getProposalNumber(), Constant.DEV_PROPOSAL_MODULE_CODE);
		} catch (Exception e) {
	        log.error("Error saving proposal details for ProposalDTO: {}", proposalDTO, e.getMessage());
	        throw new MQRouterException("ER004", "Error saving proposal details for ProposalDTO: {}", e, e.getMessage(), devProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, Constant.COI_MODULE_CODE, Constant.COI_INTEGRATION_SUB_MODULE_CODE, Constant.PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	}

	private void saveDevProposalDetails(ProposalDTO proposalDTO, COIIntegrationProposal coiIntegrationProposal) {
		
		coiIntegrationProposal = setProposalEntityObject(proposalDTO, coiIntegrationProposal);
		try {
			proposalIntegrationDao.saveProposal(coiIntegrationProposal);

			if (PROPOSAL_DEACTIVATE_STATUS.equals(coiIntegrationProposal.getProposalStatusCode())) {
				MarkVoidVO vo = prepareMarkProposalVoidVO(coiIntegrationProposal.getProposalNumber(), Constant.COI_DISCL_MARKED_VOID_BY_PRJCT_CLOSED);
				fcoiFeignClient.makeDisclosureVoid(vo);
			}

		} catch (DataAccessException dae) {
			log.error("Data access error while saving proposal: ", dae);

		} catch (FeignException fe) {
			log.error("Error while voiding disclosure: ", fe);

		} catch (Exception e) {
			log.error("General error while saving proposal or voiding disclosure: ", e);

		}
	}


	private void saveProposalPersonDetail(ProposalDTO proposalDTO) {
		List<COIIntegrationProposalPerson> proposalPersons = proposalPersonIntegrationRepository.findProposalPersonsByProposalNumber(proposalDTO.getProposalNumber());
		saveProposalPerson(proposalDTO.getProposalPersons(), proposalPersons);
	}

	private void saveProposalPerson(List<ProposalPersonDTO> proposalPersonDTOs, List<COIIntegrationProposalPerson> proposalPersons) {
		proposalPersonDTOs.forEach(proposalPersonDTO -> {
			COIIntegrationProposalPerson proposalPerson = proposalPersons.stream()
					.filter(person -> person.getKeyPersonId().equals(proposalPersonDTO.getKeyPersonId())
							&& person.getProposalNumber().equals(proposalPersonDTO.getProposalNumber()))
					.findFirst().orElse(new COIIntegrationProposalPerson());
			preparePersonDetail(proposalPerson, proposalPersonDTO);
			try {
				proposalIntegrationDao.saveProposalPerson(proposalPerson);
			} catch (Exception e) {
				log.error("Error in saving proposal saveProposalPerson {}", proposalPerson, e.getMessage());
			}
		});
		checkAndDeactivatePerson(proposalPersonDTOs, proposalPersons);
	}

	private void checkAndDeactivatePerson(List<ProposalPersonDTO> proposalPersonDTOs, List<COIIntegrationProposalPerson> proposalPersons) {
		Set<String> incomingKeyPersonIds = proposalPersonDTOs.stream().map(proposalPersonDTO -> proposalPersonDTO.getKeyPersonId()).collect(Collectors.toSet());
		proposalPersons.stream().filter(existingPerson -> !incomingKeyPersonIds.contains(existingPerson.getKeyPersonId()))
				.forEach(existingPerson -> {
					existingPerson.setStatus(Constant.INACTIVE);
					try {
						proposalIntegrationDao.saveProposalPerson(existingPerson);
						MarkVoidVO vo = prepareMarkProposalPersonVoidVO(existingPerson.getProposalNumber(), existingPerson.getKeyPersonId(), Constant.COI_DISCL_MARKED_VOID_BY_KEY_PRSN_REMOVAL);
						fcoiFeignClient.makeDisclosureVoid(vo);
					} catch (DataAccessException dae) {
						log.error("Error in checkAndDeactivatePerson {}: ", dae);

					} catch (FeignException fe) {
						log.error("Error in checkAndDeactivatePerson {}: ", fe);

					} catch (Exception e) {
						log.error("Error in checkAndDeactivatePerson {}", existingPerson, e.getMessage());
					}
				});
	}

	private void preparePersonDetail(COIIntegrationProposalPerson coiIntegrationProposalPerson,	ProposalPersonDTO proposalPersonDTO) {
		if (coiIntegrationProposalPerson.getProposalNumber() == null) {
			coiIntegrationProposalPerson.setProposalNumber(proposalPersonDTO.getProposalNumber());
			coiIntegrationProposalPerson.setKeyPersonId(proposalPersonDTO.getKeyPersonId());
		}
		coiIntegrationProposalPerson.setKeyPersonRoleCode(proposalPersonDTO.getKeyPersonRoleCode());
        coiIntegrationProposalPerson.setKeyPersonRole(proposalPersonDTO.getKeyPersonRole());
		coiIntegrationProposalPerson.setAttribute1Label(proposalPersonDTO.getAttribute1Label());
        coiIntegrationProposalPerson.setAttribute1Value(proposalPersonDTO.getAttribute1Value());
        coiIntegrationProposalPerson.setAttribute2Label(proposalPersonDTO.getAttribute2Label());
        coiIntegrationProposalPerson.setAttribute2Value(proposalPersonDTO.getAttribute2Value());
        coiIntegrationProposalPerson.setAttribute3Label(proposalPersonDTO.getAttribute3Label());
        coiIntegrationProposalPerson.setAttribute3Value(proposalPersonDTO.getAttribute3Value());
        coiIntegrationProposalPerson.setKeyPersonName(proposalPersonDTO.getKeyPersonName());
        coiIntegrationProposalPerson.setPercentageOfEffort(proposalPersonDTO.getPercentageOfEffort());
        coiIntegrationProposalPerson.setUpdateTimestamp(integrationDao.getCurrentTimestamp());
        coiIntegrationProposalPerson.setStatus(Constant.ACTIVE);
        coiIntegrationProposalPerson.setCertificationFlag(proposalPersonDTO.getCertificationFlag());
        coiIntegrationProposalPerson.setDisclosureReqFlag(proposalPersonDTO.getDisclosureReqFlag());
		coiIntegrationProposalPerson.setDisclosureStatus(
				coiIntegrationProposalPerson.getDisclosureStatus() == null ? proposalPersonDTO.getDisclosureStatus()
						: coiIntegrationProposalPerson.getDisclosureStatus());
		coiIntegrationProposalPerson
				.setDisclosureReviewStatus(coiIntegrationProposalPerson.getDisclosureReviewStatus() == null
						? proposalPersonDTO.getDisclosureReviewStatus()
						: coiIntegrationProposalPerson.getDisclosureReviewStatus());
        proposalPersonIntegrationRepository.save(coiIntegrationProposalPerson);
	}

	@Override
	public DisclosureResponse feedPersonQuestionnaireAndCreateDisclosure(List<QuestionnaireVO> questionnaireVOs) {
		DisclosureResponse response = new DisclosureResponse();
		try {
			log.info("feedPersonQuestionnaireAndCreateDisclosure .... ");
			Map<String, List<QuestionnaireVO>> groupedByProposal = questionnaireVOs.stream().collect(Collectors.groupingBy(QuestionnaireVO::getProposalNumber));
			for (Map.Entry<String, List<QuestionnaireVO>> entry : groupedByProposal.entrySet()) {
	            String proposalNumber = entry.getKey();
	            List<QuestionnaireVO> questVOs = entry.getValue();
				COIIntegrationProposal proposal = proposalIntegrationRepository.findProposalByProposalNumber(proposalNumber);
	            if (proposal != null && !questVOs.isEmpty()) {
	                List<COIIntegrationPropQuestAns> questAnswers = qnAIntegrationRepository.findQuestionAnswersByProposalNumber(proposalNumber);
					saveOrUpdateQuestionAnswer(questAnswers, questVOs);
					QuestionnaireVO vo = questVOs.get(0);
					Integer disclosureId = prepareValidateAndCreateDisclosure(vo);
					if (disclosureId != null) {
						response.setDisclosureId(disclosureId);
						response.setMessage("Disclosure created successfully.");
						notifyUserForDisclSubmission(disclosureId, proposal, vo.getPersonId());
					}
	            } else {
	            	String message = "No such proposal exists in COIIntegrationProposal: " + proposalNumber;
	                log.info(message);
					response.setMessage(message);
	            }
	        }
		} catch (Exception e) {
			log.error("Error in saving proposal questionnaire details: {}", questionnaireVOs, e.getMessage());
			throw new MQRouterException("ER004", "Error in saving proposal questionnaire details: {}", e, e.getMessage(), devPropQuesAnsIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,  Constant.COI_MODULE_CODE, Constant.COI_INTEGRATION_SUB_MODULE_CODE, Constant.QUESTIONNAIRE_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
		return response;
	}

	private void notifyUserForDisclSubmission(Integer disclosureId, COIIntegrationProposal proposal, String personId) {
		ProposalUserNotifyReqVO vo = new ProposalUserNotifyReqVO();
		try {
			vo.setModuleCode(Constant.COI_MODULE_CODE);
			vo.setSubModuleCode(Constant.SUB_MODULE_CODE);
			vo.setSubModuleItemKey(Constant.SUBMODULE_ITEM_KEY);
			vo.setDisclosureId(disclosureId);
			vo.setModuleItemKey(proposal.getProposalNumber());
			vo.setTitle(proposal.getTitle());
			vo.setPersonId(personId);
			vo.setUnitNumber(proposal.getLeadUnit());
			vo.setUnitName(proposal.getLeadUnitName());
			fcoiFeignClient.notifyUserForDisclSubmission(vo);
		} catch (Exception e) {
			log.error("General error while notify user for submitting disclosure: ", e.getMessage());
		}
	}

	private void saveOrUpdateQuestionAnswer(List<COIIntegrationPropQuestAns> questAnswers, List<QuestionnaireVO> questionnaireVOs) {
		questionnaireVOs.forEach(vo -> {
			COIIntegrationPropQuestAns integrationPropQuestAns = questAnswers.stream()
					.filter(questAnswer -> questAnswer.getKeyPersonId().equals(vo.getPersonId()) && 
							questAnswer.getQuestionId().equals(vo.getQuestionId())).findFirst()
					.orElse(new COIIntegrationPropQuestAns());
			prepareQuestionAnswer(integrationPropQuestAns, vo);
			proposalIntegrationDao.saveQuestionnaireAnswer(integrationPropQuestAns);			
		});
	}

	private COIIntegrationPropQuestAns prepareQuestionAnswer(COIIntegrationPropQuestAns integrationPropQuestAns, QuestionnaireVO vo) {
		integrationPropQuestAns.setAnswer(vo.getAnswer());
		integrationPropQuestAns.setQuestionId(vo.getQuestionId());
		integrationPropQuestAns.setQuestionnaireId(vo.getQuestionnaireId());
		integrationPropQuestAns.setKeyPersonId(vo.getPersonId());
		integrationPropQuestAns.setProposalNumber(vo.getProposalNumber());
		integrationPropQuestAns.setUpdateTimestamp(integrationDao.getCurrentTimestamp());
		integrationPropQuestAns.setAttribute1Label(vo.getAttribute1Label());
		integrationPropQuestAns.setAttribute1Value(vo.getAttribute1Value());
		integrationPropQuestAns.setAttribute2Label(vo.getAttribute2Label());
		integrationPropQuestAns.setAttribute2Value(vo.getAttribute2Value());
		integrationPropQuestAns.setAttribute3Label(vo.getAttribute3Label());
		integrationPropQuestAns.setAttribute3Value(vo.getAttribute3Value());
		return integrationPropQuestAns;
	}
	
	private Integer prepareValidateAndCreateDisclosure(QuestionnaireVO vo) {
		ProcessProposalDisclosureVO processProposalDisclosureVO = new ProcessProposalDisclosureVO();
		processProposalDisclosureVO.setCoiProjectTypeCode(vo.getCoiProjectTypeCode());
		processProposalDisclosureVO.setHomeUnit(vo.getPersonHomeUnit());
		processProposalDisclosureVO.setModuleCode(Constant.DEV_PROPOSAL_MODULE_CODE.toString());
		processProposalDisclosureVO.setModuleItemId(Integer.parseInt(vo.getProposalNumber()));
		processProposalDisclosureVO.setPersonId(vo.getPersonId());
		return validateAndCreateDisclosure(createValidateDisclosureVO(vo), processProposalDisclosureVO, vo.getQuestionnaireId());
	}

	private ValidateDisclosureVO createValidateDisclosureVO(QuestionnaireVO vo) {
		ValidateDisclosureVO disclosureVO = new ValidateDisclosureVO();
	    disclosureVO.setModuleCode(Constant.DEV_PROPOSAL_MODULE_CODE.toString());
	    disclosureVO.setModuleItemKey(Integer.parseInt(vo.getProposalNumber()));
	    disclosureVO.setPersonId(vo.getPersonId());
	    return disclosureVO;
	}

	@SuppressWarnings("unchecked")
	public Integer validateAndCreateDisclosure(ValidateDisclosureVO validateDisclosureVO, ProcessProposalDisclosureVO vo, Integer questionnaireId) {
		Integer disclosureId = null;
		try {
			Boolean canCreateDisclosure = proposalIntegrationDao.canCreateProjectDisclosure(questionnaireId, vo.getPersonId(), vo.getModuleItemId().toString());
			if (Boolean.TRUE.equals(canCreateDisclosure)) {
				ResponseEntity<Object> response = fcoiFeignClient.validateDisclosure(validateDisclosureVO);
				Map<String, Object> responseObject = (Map<String, Object>) response.getBody();
				if (responseObject.get(Constant.PENDING_PROJECT) == null) {
					CreateProposalDisclosureVO disclosureVO = prepareCreateProposalDisclosureResponse(vo);
					ResponseEntity<Object> responseObj = fcoiFeignClient.createDisclosure(disclosureVO);
					Map<String, Object> coiDisclosure = (Map<String, Object>) responseObj.getBody();
					log.info("Disclosure created successfully.");
					disclosureId = (Integer) coiDisclosure.get("disclosureId");
					log.info("Disclosure Id : {}", disclosureId);
					syncQuestionniareAnswers(coiDisclosure, vo, questionnaireId);
				}
			} else {
				ResponseEntity<Object> response = fcoiFeignClient.validateDisclosure(validateDisclosureVO);
				Map<String, Object> responseObject = (Map<String, Object>) response.getBody();
				if (responseObject.get(Constant.PENDING_PROJECT) != null) {
					log.info("Pending project exists, disclosure creation skipped.");
					Map<String, Object> coiDisclosure = (Map<String, Object>) responseObject.get(Constant.PENDING_PROJECT);
					syncQuestionniareAnswers(coiDisclosure, vo, questionnaireId);
					Boolean canMarkDisclosureAsVoid = proposalIntegrationDao.canMarkDisclosureAsVoid(questionnaireId, vo.getPersonId(), vo.getModuleItemId().toString());
					if (Boolean.TRUE.equals(canMarkDisclosureAsVoid)) {
						markDisclosureAsVoidForNoAnswer(vo.getPersonId(),vo.getModuleItemId().toString());
					}
				}
            }
		} catch (Exception e) {
			log.error("Exception occurred while validating or creating disclosure", e.getMessage());
			throw new MQRouterException("ER004", "Error in validateAndCreateDisclosure: {}", e, e.getMessage(), devPropQuesAnsIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,  Constant.COI_MODULE_CODE, Constant.COI_INTEGRATION_SUB_MODULE_CODE, Constant.QUESTIONNAIRE_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
		return disclosureId;
    }

	private void markDisclosureAsVoidForNoAnswer(String personId, String moduleItemId) {
		try {
			MarkVoidVO vo = prepareMarkProposalPersonQuesVoidVO(moduleItemId, personId, Constant.COI_DISCL_MARKED_VOID_BY_QUEST);
			fcoiFeignClient.makeDisclosureVoid(vo);
		} catch (DataAccessException dae) {
			log.error("Error in markDisclosureAsVoidForNoAnswer {}: ", dae);

		} catch (FeignException fe) {
			log.error("Error in markDisclosureAsVoidForNoAnswer {}: ", fe);

		} catch (Exception e) {
			log.error("Error in markDisclosureAsVoidForNoAnswer {} {}", personId, e.getMessage());
		}
	}

	private void syncQuestionniareAnswers(Map<String, Object> coiDisclosure, ProcessProposalDisclosureVO vo, Integer questionnaireId) {
		QuestionnaireVO questionnaireVO = new QuestionnaireVO();
		questionnaireVO.setProposalNumber(vo.getModuleItemId().toString());
		questionnaireVO.setPersonId(vo.getPersonId());
		questionnaireVO.setQuestionnaireId(questionnaireId);
		questionnaireVO.setDisclosureId((Integer) coiDisclosure.get("disclosureId"));
		questionnaireVO.setUpdateUser((String) coiDisclosure.get("updateUser"));
		getQuestionnaire(questionnaireVO);
	}

	private CreateProposalDisclosureVO prepareCreateProposalDisclosureResponse(ProcessProposalDisclosureVO vo) {
		CreateProposalDisclosureVO disclosureVO = new CreateProposalDisclosureVO();
		disclosureVO.setCoiProjectTypeCode(vo.getCoiProjectTypeCode());
		disclosureVO.setHomeUnit(vo.getHomeUnit());
		disclosureVO.setModuleItemKey(vo.getModuleItemId());
		disclosureVO.setPersonId(vo.getPersonId());
		disclosureVO.setModuleCode(Constant.DEV_PROPOSAL_MODULE_CODE);
		disclosureVO.setFcoiTypeCode(Constant.DISCLOSURE_TYPE_CODE_PROPOSAL);
	    return disclosureVO;
	}

	
	private String getQuestionnaire(QuestionnaireVO vo) {
		try {
			FibiCoiQnrMapping  qnrMapping = proposalIntegrationDao.getQuestionnaireMappingInfo(vo.getQuestionnaireId());
			GetQNRDetailsDto questionnaire = new GetQNRDetailsDto();
			getQuestionnaireByParam(questionnaire, qnrMapping.getFibiQnrId(), vo.getDisclosureId().toString());
			return integrationDao.convertObjectToJSON(prepareQuestionnaireAnswersToSave(qnrMapping, questionnaire, vo));
		} catch (Exception e) {
			log.error("Exception occurred while getQuestionnaire", e.getMessage());
			throw new MQRouterException("ER004", "Error in getQuestionnaire: {}", e, e.getMessage(), "saveQuestionnaire", null, Constant.FIBI_DIRECT_EXCHANGE,  Constant.COI_MODULE_CODE, Constant.COI_INTEGRATION_SUB_MODULE_CODE, "saveQuestionnaire", integrationDao.generateUUID());
		}
	}

	
	private QuestionnaireSaveDto prepareQuestionnaireAnswersToSave(FibiCoiQnrMapping qnrMapping, GetQNRDetailsDto questionnaire, QuestionnaireVO vo) {
		QuestionnaireSaveDto questionnaireSaveDto = new QuestionnaireSaveDto();
		questionnaireSaveDto.setModuleItemCode(Constant.COI_MODULE_CODE);
		questionnaireSaveDto.setModuleItemKey(vo.getDisclosureId().toString());
		questionnaireSaveDto.setModuleSubItemCode(Constant.COI_INTEGRATION_SUB_MODULE_CODE);
		questionnaireSaveDto.setModuleSubItemKey(Constant.SUB_MODULE_ITEM_KEY);
		questionnaireSaveDto.setQuestionnaireId(qnrMapping.getFibiQnrId());
		questionnaireSaveDto.setQuestionnaire(questionnaire.getQuestionnaire());
		questionnaireSaveDto.setQuestionnaireAnswerHeaderId(questionnaire.getQuestionnaireAnswerHeaderId());
		questionnaireSaveDto.setAcType(questionnaire.getQuestionnaireAnswerHeaderId() != null ? Constant.AC_TYPE_UPDATE : Constant.AC_TYPE_INSERT);
		questionnaireSaveDto.setActionUserId(vo.getUpdateUser());
		return saveQuestionnaireAnswers(questionnaireSaveDto, qnrMapping.getQuestions(), vo.getPersonId(), Integer.parseInt(vo.getProposalNumber()), vo.getDisclosureId(), vo.getQuestionnaireId(), questionnaire.getQuestionnaireAnswerHeaderId());
	}

	private GetQNRDetailsDto getQuestionnaireByParam(GetQNRDetailsDto questionnaire, Integer fibiQuestionnaireId, String moduleItemKey) {
		Integer questionnaireAnswerHeaderId = getQuestionnaireAnswerHeaderId(moduleItemKey, fibiQuestionnaireId);
		questionnaire.setQuestionnaireAnswerHeaderId(questionnaireAnswerHeaderId);
		questionnaire.setModuleItemCode(Constant.COI_MODULE_CODE);
		questionnaire.setModuleSubItemCode(Constant.COI_INTEGRATION_SUB_MODULE_CODE);
		questionnaire.setQuestionnaireId(fibiQuestionnaireId);
		return proposalIntegrationDao.getQuestionnaireDetails(questionnaire);
	}
	
	private Integer getQuestionnaireAnswerHeaderId(String disclosureId, Integer fibiQnrId) {
		FetchQnrAnsHeaderDto ansHeaderDto = new FetchQnrAnsHeaderDto();
		ansHeaderDto.setModuleItemCode(Constant.COI_MODULE_CODE);
		ansHeaderDto.setModuleItemKey(disclosureId);
		ansHeaderDto.setModuleSubItemCode(Constant.COI_INTEGRATION_SUB_MODULE_CODE);
		ansHeaderDto.setModuleSubItemKey(Constant.SUB_MODULE_ITEM_KEY);
		ansHeaderDto.setQuestionnaireId(fibiQnrId);
		return proposalIntegrationDao.findQuestionnaireAnsHeaderId(ansHeaderDto);
	}

	public QuestionnaireSaveDto saveQuestionnaireAnswers(QuestionnaireSaveDto questionnaireDataBus, List<FibiCoiQnrQstnMapping> mappingQuestions, String disclosurePersonId, Integer proposalNumber, Integer disclosureId, Integer questionnaireId, Integer questionnaireAnswerHeaderId) {
		try {
			questionnaireDataBus.setQuestionnaireCompleteFlag("Y");
			if (questionnaireDataBus.getQuestionnaire() != null && questionnaireDataBus.getQuestionnaire().getQuestions() != null) {
				List<HashMap<String, Object>> fibiQuestions = questionnaireDataBus.getQuestionnaire().getQuestions();
				prepareQuestionAnswers(fibiQuestions, mappingQuestions, questionnaireId, proposalNumber, disclosurePersonId, questionnaireAnswerHeaderId);
			}
			return proposalIntegrationDao.saveQuestionnaireAnswers(questionnaireDataBus);
		} catch (Exception e) {
			log.error("Exception occurred while saveQuestionnaire", e.getMessage());
			throw new MQRouterException("ER004", "Error in saveQuestionnaire: {}", e, e.getMessage(), "saveQuestionnaire", null, Constant.FIBI_DIRECT_EXCHANGE,  Constant.COI_MODULE_CODE, Constant.COI_INTEGRATION_SUB_MODULE_CODE, "saveQuestionnaire", integrationDao.generateUUID());
		}
	}

	private void prepareQuestionAnswers(List<HashMap<String, Object>> questions, List<FibiCoiQnrQstnMapping> mappingQuestions, Integer questionnaireId, Integer proposalNumber, String disclosurePersonId, Integer questionnaireAnswerHeaderId) {
		try {
			questions.forEach(question -> {
				mappingQuestions.forEach(mappingQuestion -> {
					if (question.get(QUESTION_NUMBER).equals(mappingQuestion.getFibiQstnNum()) && question.get(QUESTION_ID).equals(mappingQuestion.getFibiQstnId())) {
						question.put(AC_TYPE, question.get(AC_TYPE) != null ? Constant.AC_TYPE_UPDATE : Constant.AC_TYPE_INSERT);
						String answer = proposalIntegrationDao.getQuestionAnswerByParams(mappingQuestion.getSourceQstnId(), questionnaireId, proposalNumber, disclosurePersonId);
						HashMap<String, String> answers = new HashMap<>();
						if (CHECKBOX.equals(question.get(ANSWER_TYPE))) {
							answers.put(answer, "true");
						} else {
							answers.put("1", answer);
						}
						question.put(ANSWERS, answers);
					}
				});
			});
		} catch (Exception e) {
			log.error("Exception occurred while prepareQuestionAnswers", e.getMessage());
		}
	}

	private COIIntegrationProposal setProposalEntityObject(ProposalDTO proposalDTO, COIIntegrationProposal coiIntegrationProposal) {
		coiIntegrationProposal.setProposalNumber(proposalDTO.getProposalNumber());
		coiIntegrationProposal.setIpNumber(proposalDTO.getIpNumber());
		coiIntegrationProposal.setSponsorGrantNumber(proposalDTO.getSponsorGrantNumber());
		coiIntegrationProposal.setVersionNumber(proposalDTO.getVersionNumber());
        coiIntegrationProposal.setProposalStartDate(proposalDTO.getStartDate());
        coiIntegrationProposal.setProposalEndDate(proposalDTO.getEndDate());
        coiIntegrationProposal.setSponsorCode(proposalDTO.getSponsorCode());
        coiIntegrationProposal.setSponsorName(proposalDTO.getSponsorName());
        coiIntegrationProposal.setPrimeSponsorCode(proposalDTO.getPrimeSponsorCode());
        coiIntegrationProposal.setPrimeSponsorName(proposalDTO.getPrimeSponsorName());
        coiIntegrationProposal.setLeadUnit(proposalDTO.getLeadUnit());
        coiIntegrationProposal.setLeadUnitName(proposalDTO.getLeadUnitName());
        coiIntegrationProposal.setProposalStatusCode(proposalDTO.getProposalStatusCode());
        coiIntegrationProposal.setProposalStatus(proposalDTO.getProposalStatus());
        coiIntegrationProposal.setProposalTypeCode(proposalDTO.getProposalTypeCode());
        coiIntegrationProposal.setProposalType(proposalDTO.getProposalType());
        coiIntegrationProposal.setTitle(proposalDTO.getTitle());
        coiIntegrationProposal.setLastFedTimestamp(integrationDao.getCurrentTimestamp());  
        coiIntegrationProposal.setDocumentUrl(proposalDTO.getDocumentUrl());
        coiIntegrationProposal.setSrcSysUpdateTimestamp(proposalDTO.getSrcSysUpdateTimestamp());
        coiIntegrationProposal.setSrcSysUpdateUsername(proposalDTO.getSrcSysUpdateUsername());
        coiIntegrationProposal.setAttribute1Label(proposalDTO.getAttribute1Label());
        coiIntegrationProposal.setAttribute1Value(proposalDTO.getAttribute1Value());
        coiIntegrationProposal.setAttribute2Label(proposalDTO.getAttribute2Label());
        coiIntegrationProposal.setAttribute2Value(proposalDTO.getAttribute2Value());
        coiIntegrationProposal.setAttribute3Label(proposalDTO.getAttribute3Label());
        coiIntegrationProposal.setAttribute3Value(proposalDTO.getAttribute3Value());
        coiIntegrationProposal.setAttribute4Label(proposalDTO.getAttribute4Label());
        coiIntegrationProposal.setAttribute4Value(proposalDTO.getAttribute4Value());
        coiIntegrationProposal.setAttribute5Label(proposalDTO.getAttribute5Label());
        coiIntegrationProposal.setAttribute5Value(proposalDTO.getAttribute5Value());
        
        return coiIntegrationProposal;
	}

	private MarkVoidVO prepareMarkProposalVoidVO(String proposalNumber, String actionType) {
		return prepareMarkVoidVO(proposalNumber, null, REMARK_PROPOSAL_VOID, actionType);
	}

	private MarkVoidVO prepareMarkProposalPersonVoidVO(String proposalNumber, String personId, String actionType) {
		return prepareMarkVoidVO(proposalNumber, personId, REMARK_PROPOSAL_PERSON_VOID, actionType);
	}

	private MarkVoidVO prepareMarkProposalPersonQuesVoidVO(String proposalNumber, String personId, String actionType) {
		return prepareMarkVoidVO(proposalNumber, personId, REMARK_PROPOSAL_PERSON_QUES_VOID, actionType);
	}

	private MarkVoidVO prepareMarkVoidVO(String proposalNumber, String personId, String remark, String actionType) {
		return MarkVoidVO.builder()
						 .moduleCode(Constant.DEV_PROPOSAL_MODULE_CODE)
						 .moduleItemKey(proposalNumber)
						 .remark(remark)
						 .personId(personId)
						 .actionType(actionType)
						 .build();
	}

	@Override
	public DisclosureResponse feedProposalPersonDisclosureStatus(String proposalNumber, String personId) {
		return proposalIntegrationDao.feedProposalDisclosureStatus(proposalNumber, personId);
	}

	@Override
	public DisclosureResponse checkProposalDisclosureStatus(String proposalNumber) {
		return proposalIntegrationDao.checkProposalDisclosureStatus(proposalNumber);
	}

	@Override
	public DisclosureResponse feedDisclosureExpirationDate(String disclosureType, String personId) {
		return proposalIntegrationDao.feedDisclosureExpirationDate(disclosureType, personId);
	}

	@Async
	@Override
	public CompletableFuture<DisclosureResponse> feedProposalPersonDisclosureId(String proposalNumber, String personId) {
		log.info("Async process started for proposalNumber: {}, personId: {}", proposalNumber, personId);

		return CompletableFuture.supplyAsync(() -> {
			try {
				log.info("Delaying execution for 10 seconds before retrying proposal feed for proposalNumber: {}, personId: {}", proposalNumber, personId);
				Thread.sleep(10000);
				log.info("Delay complete. Initiating retry process for proposalNumber: {}, personId: {}", proposalNumber, personId);

				log.info("Calling retryService.retryfeedProposalPersonDisclosureId for proposalNumber: {}, personId: {}", proposalNumber, personId);
				DisclosureResponse response = retryService.retryfeedProposalPersonDisclosureId(proposalNumber, personId);

				if (response == null) {
					throw new RuntimeException("Failed to fetch DisclosureResponse. Response is null.");
				}

				log.info("Successfully retrieved DisclosureResponse for proposalNumber: {}, personId: {}. Disclosure ID: {}",
						proposalNumber, personId, response != null ? response.getDisclosureId() : "NULL");

				return response;
			} catch (Exception e) {
				log.error("Error during async processing of proposalNumber: {}, personId: {}. Exception: {}", proposalNumber, personId, e.getMessage(), e);
				throw new RuntimeException("Error in feedProposalPersonDisclosureId for proposalNumber: " + proposalNumber + " and personId: " + personId, e);
			}
		}).exceptionally(ex -> {
			log.error("Async operation failed for proposalNumber: {}, personId: {}. Exception: {}", proposalNumber, personId, ex.getMessage(), ex);
			return null;
		});
	}

	@Override
	public DisclosureResponse getDeclarationStatus(String personId, String declarationTypeCode) {
		return proposalIntegrationDao.fetchDeclarationStatus(personId, declarationTypeCode);
	}

}
