package com.polus.kcintegration.proposal.service;

import java.util.List;

import org.springframework.amqp.core.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.polus.kcintegration.award.dao.AwardIntegrationDao;
import com.polus.kcintegration.award.dto.AwardDTO;
import com.polus.kcintegration.constant.Constant;
import com.polus.kcintegration.dao.KCIntegrationDao;
import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.instituteProposal.dao.InstituteProposalIntegrationDao;
import com.polus.kcintegration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.kcintegration.message.service.MessagingService;
import com.polus.kcintegration.proposal.client.FibiCoiConnectFeignClient;
import com.polus.kcintegration.proposal.dao.ProposalKCIntegrationDao;
import com.polus.kcintegration.proposal.dto.DisclosureResponse;
import com.polus.kcintegration.proposal.dto.ProposalDTO;
import com.polus.kcintegration.proposal.dto.QuestionnaireVO;
import com.polus.kcintegration.proposal.vo.ProposalIntegrationVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RetryService {

	@Autowired
	private ProposalKCIntegrationDao proposalKCDao;

	@Autowired
	private MessagingService messagingService;

	@Autowired
	private KCIntegrationDao kcIntegrationDao;

	@Autowired
	private InstituteProposalIntegrationDao ipIntegrationDao;

	@Autowired
	private AwardIntegrationDao awardDao;

	@Autowired
	private FibiCoiConnectFeignClient fibiCoiConnectFeignClient;

	@Value("${fibi.messageq.queues.devProposalIntegration}")
	private String devProposalIntegrationQueue;

	@Value("${fibi.messageq.queues.devPropQuesAnsIntegration}")
	private String devPropQuesAnsIntegrationQueue;

	@Value("${fibi.messageq.queues.instProposalIntegration}")
	private String instProposalIntegrationQueue;

	@Value("${fibi.messageq.queues.awardIntegration}")
	private String awardIntegrationQueue;

	@Retryable(retryFor = { IntegrationCustomException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public void retryFetchAndSendMessage(String moduleItemId, Integer questionnaireId, String personId) {
		log.info("Attempting to fetch and send message - ModuleItemId: {}, QuestionnaireId: {}, PersonId: {}", moduleItemId, questionnaireId, personId);

		List<QuestionnaireVO> questionnaireVOs = proposalKCDao.fetchQuestionnaireDetailsByParams(moduleItemId, questionnaireId, personId);

		if (questionnaireVOs == null || questionnaireVOs.isEmpty()) {
			log.warn("Retry attempt failed: Questionnaire details are null or empty for ModuleItemId: {}", moduleItemId);
			throw new IntegrationCustomException("Questionnaire details are null or empty", null);
		}

		try {
			String messagePayload = kcIntegrationDao.convertObjectToJSON(questionnaireVOs);
			messagingService.sendMessage(Constant.FIBI_DIRECT_EXCHANGE, devPropQuesAnsIntegrationQueue, new Message(messagePayload.getBytes()));
			log.info("Message successfully sent to queue for ModuleItemId: {}", moduleItemId);
		} catch (Exception e) {
			log.error("Error sending message to queue for ModuleItemId: {}", moduleItemId, e);
			throw new IntegrationCustomException("Error sending message to queue", e);
		}
	}

	@Retryable(retryFor = { IntegrationCustomException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public DisclosureResponse retryFetchAndSendMessage1(String moduleItemId, Integer questionnaireId, String personId) {
		log.info("Attempting to fetch questionnaire details for moduleItemId: {}, questionnaireId: {}, personId: {}", moduleItemId, questionnaireId, personId);

		List<QuestionnaireVO> questionnaireVOs = proposalKCDao.fetchQuestionnaireDetailsByParams(moduleItemId, questionnaireId, personId);

		if (questionnaireVOs == null || questionnaireVOs.isEmpty()) {
			log.warn("Questionnaire details are null or empty. Retrying...");
			throw new IntegrationCustomException("Questionnaire details are null or empty", null);
		}

		log.info("Successfully fetched {} questionnaire records. Sending to FeignClient...", questionnaireVOs.size());

		ProposalIntegrationVO request = new ProposalIntegrationVO();
		request.setQuestionnaireVOs(questionnaireVOs);

		try {
			return fibiCoiConnectFeignClient.createProposalDisclosure(request);
		} catch (Exception e) {
			log.error("Error while calling createProposalDisclosure via FeignClient: {}", e.getMessage(), e);
			throw new IntegrationCustomException("Feign client call failed", e);
		}
	}

	@Retryable(retryFor = { IntegrationCustomException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public void retryFetchProposalAndSendMessage(String proposalNumber) {
		ProposalDTO feedProposal = proposalKCDao.fetchProposalByProposalNumber(proposalNumber);
		if (feedProposal != null) {
			feedProposal.setProposalPersons(proposalKCDao.fetchProposalPersons(proposalNumber));
		} else {
	        log.error("Proposal details are null for proposalNumber: {}", proposalNumber);
	        throw new IntegrationCustomException("Proposal details are null", null);
	    }
		messagingService.sendMessage(Constant.FIBI_DIRECT_EXCHANGE, devProposalIntegrationQueue, new Message(kcIntegrationDao.convertObjectToJSON(feedProposal).getBytes()));
		log.info("Message successfully sent to queue for proposalNumber: {}", proposalNumber);
	}

	@Recover
	public void recover(IntegrationCustomException e, String moduleItemId, Integer questionnaireId, String personId) {
		log.error("Retries exhausted for feedPersonQuestionnaireAndCreateDisclosure with params {}, {}, {}. Error: {}", moduleItemId, questionnaireId, personId, e.getMessage());
		throw new IntegrationCustomException("Retries exhausted for feedPersonQuestionnaireAndCreateDisclosure with params", e);
	}

	@Recover
	public void recoverFeed(IntegrationCustomException e, String projectNumber) {
		log.error("Retries exhausted for feed project with params {}. Error: {}", projectNumber, e.getMessage());
		throw new IntegrationCustomException("Retries exhausted for feed project with params", e);
	}

	@Retryable(retryFor = { IntegrationCustomException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public void retryFetchIPAndSendMessage(String proposalNumber) {
		InstituteProposalDTO feedInstituteProposal = ipIntegrationDao.fetchProposalByProposalNumber(proposalNumber);
	    if (feedInstituteProposal != null) {
	        feedInstituteProposal.setProjectPersons(ipIntegrationDao.fetchProposalPersons(proposalNumber));
	    } else {
	    	log.error("Institute Proposal details are null for project Number: {}", proposalNumber);
	        throw new IntegrationCustomException("Institute Proposal details are null", null);
	    }
	    messagingService.sendMessage(Constant.FIBI_DIRECT_EXCHANGE, instProposalIntegrationQueue, new Message(kcIntegrationDao.convertObjectToJSON(feedInstituteProposal).getBytes()));
	    log.info("Message successfully sent to queue for projectNumber: {}", proposalNumber);
	}

	@Retryable(retryFor = { IntegrationCustomException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public void retryFetchAwardAndSendMessage(String projectNumber) {
		AwardDTO feedAward = awardDao.fetchProjectByProjectNumber(projectNumber);
		if (feedAward != null) {
			feedAward.setProjectPersons(awardDao.fetchProjectPersons(projectNumber));
		} else {
	        log.error("Award details are null for project Number: {}", projectNumber);
	        throw new IntegrationCustomException("Award details are null", null);
	    }
		messagingService.sendMessage(Constant.FIBI_DIRECT_EXCHANGE, awardIntegrationQueue, new Message(kcIntegrationDao.convertObjectToJSON(feedAward).getBytes()));
		log.info("Message successfully sent to queue for projectNumber: {}", projectNumber);
	}

}
