package com.polus.integration.instituteProposal.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.client.FcoiFeignClient;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.instituteProposal.dao.InstituteProposalIntegrationDao;
import com.polus.integration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.integration.instituteProposal.dto.InstituteProposalPersonDTO;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposal;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposalPerson;
import com.polus.integration.instituteProposal.repository.InstituteProposalPersonRepository;
import com.polus.integration.instituteProposal.repository.InstituteProposalRepository;
import com.polus.integration.instituteProposal.vo.DisclosureSyncVO;
import com.polus.integration.proposal.repository.ProposalIntegrationRepository;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class InstituteProposalIntegrationServiceImpl implements InstituteProposalIntegrationService {

	@Autowired
	private InstituteProposalIntegrationDao instituteProposalDao;

	@Autowired
	private InstituteProposalRepository instituteProposalRepository;

	@Autowired
	private InstituteProposalPersonRepository  projectPersonRepository;

	@Autowired
	private ProposalIntegrationRepository proposalRepository;

	@Autowired
	private FcoiFeignClient fcoiFeignClient;

	@Autowired
	private IntegrationDao integrationDao;

	@Value("${fibi.messageq.queues.instProposalIntegration}")
	private String instProposalIntegrationQueue;
 
	@Override
	public ResponseEntity<Object> feedInstituteProposal(InstituteProposalDTO instituteProposalDTO) {
	    try {
	    	Boolean canUpdateProjectDisclosureFlag = instituteProposalDao.canUpdateProjectDisclosureFlag(instituteProposalDTO);
	        integrationProcess(instituteProposalDTO);
	        if (Boolean.TRUE.equals(canUpdateProjectDisclosureFlag)) {
				updateDisclSyncFlag(instituteProposalDTO.getProjectNumber());
			}
            integrationDao.updateDeclarationPersonEligibility(instituteProposalDTO.getProjectNumber(), Constant.INST_PROPOSAL_MODULE_CODE);
	    } catch (Exception e) {
	        log.error("General exception occurred in feedInstituteProposal for project: {}", instituteProposalDTO.getProjectNumber(), e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed institute proposal integration", e, e.getMessage(),
	                instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE, Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	    instituteProposalDao.postIntegrationProcess(instituteProposalDTO.getProjectNumber());
	    return new ResponseEntity<>(instituteProposalDTO, HttpStatus.OK);
	}

	@Transactional
	private void integrationProcess(InstituteProposalDTO instituteProposalDTO) {
		try {
			COIIntInstituteProposal instituteProposal = instituteProposalRepository.findProposalByProposalNumber(instituteProposalDTO.getProjectNumber());
			COIIntInstituteProposal coiIntInstituteProposal = instituteProposal != null ? instituteProposal : new COIIntInstituteProposal();
			if (instituteProposal == null) {
			    coiIntInstituteProposal.setFirstFedTimestamp(integrationDao.getCurrentTimestamp());
			}
			saveOrUpdateCOIInstituteProposal(instituteProposalDTO, coiIntInstituteProposal);
	        prepareProjectPersonDetail(instituteProposalDTO);
	        linkOrUnlinkIpNumberInDevProposal(instituteProposalDTO.getLinkedDevProposalNumbers(), instituteProposalDTO.getProjectNumber());
		} catch (Exception e) {
			log.error("Error in saving institute proposal details", instituteProposalDTO.getProjectNumber(), e.getMessage());
			throw new MQRouterException(Constant.ERROR_CODE, "Error in saving institute proposal details", e, e.getMessage(),
	                instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

	private void prepareProjectPersonDetail(InstituteProposalDTO instituteProposalDTO) {
	    try {
	    	List<COIIntInstituteProposalPerson> proposalPersons = projectPersonRepository.findProposalPersonsByProjectNumber(instituteProposalDTO.getProjectNumber());
	    	instituteProposalDTO.getProjectPersons().forEach(proposalPersonDTO -> {
	            COIIntInstituteProposalPerson proposalPerson = proposalPersons.stream()
	                    .filter(person -> person.getKeyPersonId().equals(proposalPersonDTO.getKeyPersonId())
	                            && person.getProjectNumber().equals(proposalPersonDTO.getProjectNumber()))
	                    .findFirst()
	                    .orElse(new COIIntInstituteProposalPerson());

	            prepareProjectPersonDetail(proposalPerson, proposalPersonDTO);
	            instituteProposalDao.saveInstituteProposalPerson(proposalPerson);
	        });

	        // Mark as inactive if any existing person is removed 
	        Set<String> incomingKeyPersonIds = instituteProposalDTO.getProjectPersons().stream().map(proposalPersonDTO -> proposalPersonDTO.getKeyPersonId())
	                .collect(Collectors.toSet());
	        proposalPersons.stream().filter(existingPerson -> !incomingKeyPersonIds.contains(existingPerson.getKeyPersonId()))
	                .forEach(existingPerson -> {
	                    existingPerson.setStatus(Constant.INACTIVE);
	                    instituteProposalDao.saveInstituteProposalPerson(existingPerson);
	                });
	    } catch (DataAccessException e) {
	        log.error("Database exception occurred while preparing project person details for project: {}", instituteProposalDTO.getProjectNumber(), e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Database exception in preparing project person details", e, e.getMessage(),
	                instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    } 
	}

	private void prepareProjectPersonDetail(COIIntInstituteProposalPerson proposalPerson, InstituteProposalPersonDTO proposalPersonDTO) {
		if (proposalPerson.getProjectNumber() == null) {
			proposalPerson.setProjectNumber(proposalPersonDTO.getProjectNumber());
			proposalPerson.setKeyPersonId(proposalPersonDTO.getKeyPersonId());
		}
		proposalPerson.setKeyPersonRoleCode(proposalPersonDTO.getKeyPersonRoleCode());
        proposalPerson.setKeyPersonRoleName(proposalPersonDTO.getKeyPersonRoleName());
		proposalPerson.setAttribute1Label(proposalPersonDTO.getAttribute1Label());
        proposalPerson.setAttribute1Value(proposalPersonDTO.getAttribute1Value());
        proposalPerson.setAttribute2Label(proposalPersonDTO.getAttribute2Label());
        proposalPerson.setAttribute2Value(proposalPersonDTO.getAttribute2Value());
        proposalPerson.setAttribute3Label(proposalPersonDTO.getAttribute3Label());
        proposalPerson.setAttribute3Value(proposalPersonDTO.getAttribute3Value());
        proposalPerson.setKeyPersonName(proposalPersonDTO.getKeyPersonName());
        proposalPerson.setStatus(Constant.ACTIVE);
        proposalPerson.setPercentOfEffort(proposalPersonDTO.getPercentOfEffort());
        instituteProposalDao.saveInstituteProposalPerson(proposalPerson);
	}

	private void saveOrUpdateCOIInstituteProposal(InstituteProposalDTO instituteProposalDTO, COIIntInstituteProposal coiIntInstituteProposal) {
		coiIntInstituteProposal.setProjectStatus(instituteProposalDTO.getProjectStatus());
		coiIntInstituteProposal.setProjectStatusCode(instituteProposalDTO.getProjectStatusCode());
		coiIntInstituteProposal.setProjectNumber(instituteProposalDTO.getProjectNumber());
		coiIntInstituteProposal.setProjectId(instituteProposalDTO.getProjectId());
		coiIntInstituteProposal.setTitle(instituteProposalDTO.getTitle());
		coiIntInstituteProposal.setVersionNumber(instituteProposalDTO.getVersionNumber());
		coiIntInstituteProposal.setDocumentUrl(instituteProposalDTO.getDocumentUrl());
		coiIntInstituteProposal.setLastFedTimestamp(integrationDao.getCurrentTimestamp());
		coiIntInstituteProposal.setLeadUnitName(instituteProposalDTO.getLeadUnitName());
		coiIntInstituteProposal.setLeadUnitNumber(instituteProposalDTO.getLeadUnitNumber());
		coiIntInstituteProposal.setLinkedAwardProjectNumber(instituteProposalDTO.getLinkedAwardProjectNumber());
		coiIntInstituteProposal.setPrimeSponsorCode(instituteProposalDTO.getPrimeSponsorCode());
		coiIntInstituteProposal.setPrimeSponsorName(instituteProposalDTO.getPrimeSponsorName());
		coiIntInstituteProposal.setProjectStartDate(instituteProposalDTO.getProjectStartDate());
		coiIntInstituteProposal.setProjectEndDate(instituteProposalDTO.getProjectEndDate());
		coiIntInstituteProposal.setProjectType(instituteProposalDTO.getProjectType());
		coiIntInstituteProposal.setProjectTypeCode(instituteProposalDTO.getProjectTypeCode());
		coiIntInstituteProposal.setSponsorCode(instituteProposalDTO.getSponsorCode());
		coiIntInstituteProposal.setSponsorName(instituteProposalDTO.getSponsorName());
		coiIntInstituteProposal.setSponsorGrantNumber(instituteProposalDTO.getSponsorGrantNumber());
		coiIntInstituteProposal.setSrcSysUpdatedBy(instituteProposalDTO.getSrcSysUpdatedBy());
		coiIntInstituteProposal.setSrcSysUpdateTimestamp(instituteProposalDTO.getSrcSysUpdateTimestamp());
		coiIntInstituteProposal.setAttribute1Label(instituteProposalDTO.getAttribute1Label());
		coiIntInstituteProposal.setAttribute1Value(instituteProposalDTO.getAttribute1Value());
		coiIntInstituteProposal.setAttribute2Label(instituteProposalDTO.getAttribute2Label());
		coiIntInstituteProposal.setAttribute2Value(instituteProposalDTO.getAttribute2Value());
		coiIntInstituteProposal.setAttribute3Label(instituteProposalDTO.getAttribute3Label());
		coiIntInstituteProposal.setAttribute3Value(instituteProposalDTO.getAttribute3Value());
		coiIntInstituteProposal.setAttribute4Label(instituteProposalDTO.getAttribute4Label());
		coiIntInstituteProposal.setAttribute4Value(instituteProposalDTO.getAttribute4Value());
		coiIntInstituteProposal.setAttribute5Label(instituteProposalDTO.getAttribute5Label());
		coiIntInstituteProposal.setAttribute5Value(instituteProposalDTO.getAttribute5Value());
		instituteProposalDao.saveInstituteProposal(coiIntInstituteProposal);
	}

	private void updateDisclSyncFlag(String projectNumber) {
		try {
			DisclosureSyncVO vo = new DisclosureSyncVO();
			vo.setModuleCode(Constant.INST_PROPOSAL_MODULE_CODE);
			vo.setProjectId(projectNumber);
			ResponseEntity<Object> response = fcoiFeignClient.updateProjectDisclosureFlag(vo);
			if (response.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR || response.getStatusCode() == HttpStatus.BAD_REQUEST
					|| response.getStatusCode() == HttpStatus.UNAUTHORIZED|| response.getStatusCode() == HttpStatus.NOT_FOUND) {
				log.error("Exception occurred in disclosure syncNeeded API. Project number : {}", projectNumber);
				return; // Return immediately if the status code is 500 or 400
			} else if (response.getStatusCode() == HttpStatus.OK) {
				log.info("Dislosure Sync flag updated successfully");
			}
		} catch (FeignException e) {
	        log.error("Feign client exception occurred during disclosure sync for project: {}", projectNumber, e.getMessage());
	    } catch (DataAccessException e) {
	        log.error("Database exception occurred during disclosure sync for project: {}", projectNumber, e.getMessage());
	    }
	}

	private void linkOrUnlinkIpNumberInDevProposal(List<String> linkedDevProposalNumbers, String projectNumber) {
	    try {
	    	 List<String> devProposalIds = proposalRepository.findProposalIdByIpNumber(projectNumber);
				if (linkedDevProposalNumbers.isEmpty()) {
					if (!devProposalIds.isEmpty()) {
						proposalRepository.unlinkIpFromAllProposals(devProposalIds);
					}
				} else {
	            Set<String> linkedProposals = new HashSet<>(linkedDevProposalNumbers);
	            devProposalIds.forEach(proposalId -> {
	                if (linkedProposals.contains(proposalId)) {
	                    proposalRepository.linkIpNumberInProposal(projectNumber, proposalId);
	                    linkedProposals.remove(proposalId);
	                } else {
	                    proposalRepository.unlinkIpFromProposal(projectNumber, proposalId);
	                }
	            });
	            linkedProposals.forEach(linkedProposalId -> proposalRepository.linkIpNumberInProposal(projectNumber, linkedProposalId));
	        }
	    } catch (DataAccessException e) {
	        log.error("Database exception occurred while linking/unlinking IP numbers in development proposals for project: {}", projectNumber, e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Database exception in linking/unlinking IP numbers", e, e.getMessage(),
	                instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	}
	
}
