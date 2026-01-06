package com.polus.integration.instituteProposal.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposal;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposalPerson;
import com.polus.integration.instituteProposal.repository.InstituteProposalPersonRepository;
import com.polus.integration.instituteProposal.repository.InstituteProposalRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class InstituteProposalIntegrationDaoImpl implements InstituteProposalIntegrationDao {

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private InstituteProposalRepository instituteProposalRepository;

	@Autowired
	private InstituteProposalPersonRepository  projectPersonRepository;

	@Value("${fibi.messageq.queues.instProposalIntegration}")
	private String instProposalIntegrationQueue;

	@Override
	public Boolean canUpdateProjectDisclosureFlag(InstituteProposalDTO instituteProposal) {
	    try {
	        String linkedProposalIds = !instituteProposal.getLinkedDevProposalNumbers().isEmpty()
	                ? String.join(",", instituteProposal.getLinkedDevProposalNumbers())
	                : "";
	        Query query = entityManager.createNativeQuery(
	                "SELECT FN_CHK_DISCL_SYNC_FLAG_REQ_IN_IP(:projectNumber, :statusCode, :sponsorCode, :primeSponsorCode, :attributeValue1, :linkedModuleNumber, :linkedProposalIds)")
	                .setParameter("projectNumber", instituteProposal.getProjectNumber())
	                .setParameter("statusCode", instituteProposal.getProjectStatusCode())
	                .setParameter("sponsorCode", instituteProposal.getSponsorCode())
	                .setParameter("primeSponsorCode", instituteProposal.getPrimeSponsorCode())
	                .setParameter("attributeValue1", instituteProposal.getAttribute1Value())
	                .setParameter("linkedModuleNumber", instituteProposal.getLinkedAwardProjectNumber())
	                .setParameter("linkedProposalIds", linkedProposalIds);

	        Object result = query.getSingleResult();
	        if (result instanceof Number) {
	            return ((Number) result).intValue() == 1;
	        }
	    } catch (Exception e) {
	        log.error("Exception occurred in canUpdateProjectDisclosureFlag for project: {}", instituteProposal.getProjectNumber(), e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed institute proposal integration", e, e.getMessage(),
	                instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	    return false;
	}

	@Override
	public void postIntegrationProcess(String projectNumber) {
		try {
			instituteProposalRepository.COI_SYNC_REMOVE_DEACTIVATED_PROJECTS(Constant.INST_PROPOSAL_MODULE_CODE, projectNumber);
		} catch (Exception e) {
			log.error("Exception in postIntegrationProccess {}", e.getMessage());
		}
	}

	@Override
	public void saveInstituteProposal(COIIntInstituteProposal coiIntInstituteProposal) {
		instituteProposalRepository.save(coiIntInstituteProposal);
	}

	@Override
	public void saveInstituteProposalPerson(COIIntInstituteProposalPerson proposalPerson) {
		projectPersonRepository.save(proposalPerson);
	}

	@Override
	public List<String> findProposalNumbersByKeyPersonId(String keyPersonId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<String> query = cb.createQuery(String.class);

		Root<COIIntInstituteProposalPerson> root = query.from(COIIntInstituteProposalPerson.class);

		query.select(root.get("projectNumber")).where(cb.equal(root.get("keyPersonId"), keyPersonId));

		return entityManager.createQuery(query).getResultList();
	}

}
