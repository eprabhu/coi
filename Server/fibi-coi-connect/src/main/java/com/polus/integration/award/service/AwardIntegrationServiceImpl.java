package com.polus.integration.award.service;

import java.util.ArrayList;
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

import com.polus.integration.award.dao.AwardIntegrationDao;
import com.polus.integration.award.dto.AwardDTO;
import com.polus.integration.award.dto.AwardPersonDTO;
import com.polus.integration.award.dto.ProjectSyncRequest;
import com.polus.integration.award.pojo.COIIntegrationAward;
import com.polus.integration.award.pojo.COIIntegrationAwardPerson;
import com.polus.integration.award.repository.AwardPersonRepository;
import com.polus.integration.award.repository.AwardRepository;
import com.polus.integration.award.vo.UserNotifyRequestVO;
import com.polus.integration.client.FcoiFeignClient;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.feedentity.client.KCFeignClient;
import com.polus.integration.instituteProposal.dao.InstituteProposalIntegrationDao;
import com.polus.integration.instituteProposal.repository.InstituteProposalRepository;
import com.polus.integration.instituteProposal.vo.DisclosureSyncVO;
import com.polus.integration.proposal.dto.DisclosureResponse;
import com.polus.integration.proposal.vo.MarkVoidVO;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AwardIntegrationServiceImpl implements AwardIntegrationService {

	private static final String DISCLOSURE_VALIDATION_FLAG_SELF = "SELF";
	private static final String ENABLE_NEW_DISCLOSURE_REQUIRED = "Y";
//	private static final String DISABLE_NEW_DISCLOSURE_REQUIRED = "N";
	private static final String REMARK_PROJECT_PERSON_VOID = "Award Person has been inactive in the Source System (Kuali Coeus).";
	private static final String REMARK_AWARD_VOID = "This Award has been marked as Deactivated/closed in the Source System (Kuali Coeus).";
	private static final String DISCLOSURE_NOT_REQUIRED_FLAG = "NOT_REQUIRED";
	@Autowired
	private AwardIntegrationDao awardDao;

	@Autowired
	private InstituteProposalRepository proposalRepository;

	@Autowired
	private AwardPersonRepository  projectPersonRepository;

	@Autowired
	private AwardRepository awardRepository;

	@Autowired
	private FcoiFeignClient fcoiFeignClient;

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private InstituteProposalIntegrationDao instituteProposalDao;

	@Autowired
	private KCFeignClient kcFeignClient;

	@Value("${fibi.messageq.queues.awardIntegration}")
	private String awardIntegrationQueue;
 
	@Override
	public ResponseEntity<AwardDTO> feedAward(AwardDTO awardDTO) {
		try {
			Boolean canUpdateProjectDisclosureFlag = awardDao.canUpdateProjectDisclosureFlag(awardDTO);
			AwardDTO awardDto = integrationProcess(awardDTO);
			awardDTO.setNewChildAwardFeed(awardDto.getNewChildAwardFeed()); 
			awardDTO.setNewPersonIds(awardDto.getNewPersonIds()); 
			if (Boolean.TRUE.equals(canUpdateProjectDisclosureFlag)) {
				updateDisclSyncFlag(awardDTO.getProjectNumber());
			}
			if (!awardDTO.getInactivePersonIds().isEmpty() || Constant.AWARD_STATUS_CODE_CLOSED.equals(awardDTO.getProjectStatusCode()) ||
					Constant.AWARD_STATUS_CODE_INACTIVE.equals(awardDTO.getProjectStatusCode())) {
				deleteUserInboxForDisclosureCreation(awardDTO);
			}
			notifyUserForDisclosureCreation(awardDTO);
            integrationDao.updateDeclarationPersonEligibility(awardDTO.getProjectNumber(), Constant.AWARD_MODULE_CODE);
		} catch (Exception e) {
	        log.error("General exception occurred in feedAward for project: {}", awardDTO.getProjectNumber(), e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed award integration", e, e.getMessage(),
	        		awardIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE, Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
		awardDao.postIntegrationProcess(awardDTO.getProjectNumber());
	    return new ResponseEntity<>(awardDTO, HttpStatus.OK);
	}

	private void deleteUserInboxForDisclosureCreation(AwardDTO awardDTO) {
		UserNotifyRequestVO vo = new UserNotifyRequestVO();
		List<String> inactivePersonIds = new ArrayList<>();
		try {
			vo.setModuleCode(Constant.COI_MODULE_CODE);
			vo.setSubModuleCode(Constant.SUB_MODULE_CODE);
			vo.setSubModuleItemKey(Constant.SUBMODULE_ITEM_KEY);
			vo.setModuleItemKey(awardDTO.getProjectNumber());
			if (awardDTO.getInactivePersonIds() != null) {
				inactivePersonIds.addAll(awardDTO.getInactivePersonIds());
			}
			if ((Constant.AWARD_STATUS_CODE_CLOSED.equals(awardDTO.getProjectStatusCode()) || Constant.AWARD_STATUS_CODE_INACTIVE.equals(awardDTO.getProjectStatusCode()))) {
				vo.setPersonIds(awardDTO.getProjectPersons().stream()
						.filter(person -> person.getAttribute1Value() != null && !Constant.NON_EMPLOYEE_FLAG.equals(person.getAttribute1Value()))
				.map(AwardPersonDTO::getKeyPersonId).collect(Collectors.toList()));
			}
			vo.setInactivePersonIds(inactivePersonIds);
			fcoiFeignClient.deleteUserInboxForDisclosureCreation(vo);
		} catch (Exception e) {
			log.error("General error while remove action list entry for user for creating disclosure: ", e.getMessage());
		}
	}

	@Override
	public void notifyUserForDisclosureCreation(AwardDTO awardDTO) {
		UserNotifyRequestVO vo = new UserNotifyRequestVO();
		try {
			vo.setModuleCode(Constant.COI_MODULE_CODE);
			vo.setSubModuleCode(Constant.SUB_MODULE_CODE);
			vo.setSubModuleItemKey(Constant.SUBMODULE_ITEM_KEY);
			vo.setModuleItemId(Integer.parseInt(awardDTO.getProjectId()));
			vo.setTitle(awardDTO.getTitle());
			vo.setModuleItemKey(awardRepository.findProjectByProjectId(Integer.parseInt(awardDTO.getProjectId()))
					.getProjectNumber());
			if (awardDTO.getProjectPersons() == null) {
				List<COIIntegrationAwardPerson> persons = awardRepository
						.findProjectPersonsByProjectNumber(vo.getModuleItemKey());
				vo.setPersonIds(persons.stream()
						.filter(person -> person.getAttribute1Value() != null && !Constant.NON_EMPLOYEE_FLAG.equals(person.getAttribute1Value()))
						.map(COIIntegrationAwardPerson::getKeyPersonId).collect(Collectors.toList()));
			} else {
			vo.setPersonIds(awardDTO.getProjectPersons().stream()
					.filter(person -> person.getAttribute1Value() != null && !Constant.NON_EMPLOYEE_FLAG.equals(person.getAttribute1Value()))
					.map(AwardPersonDTO::getKeyPersonId).collect(Collectors.toList()));
			}
			fcoiFeignClient.notifyUserForDisclosureCreation(vo);
		} catch (Exception e) {
			log.error("General error while notify user for creating disclosure: ", e.getMessage());
		}
	}

	@Transactional
	private AwardDTO integrationProcess(AwardDTO awardDTO) {
		try {
			Boolean newChildAwardFeed = null;
			Set<String> newPersonIds = new HashSet<>();
			COIIntegrationAward award = awardRepository.findProjectByProjectNumber(awardDTO.getProjectNumber());
			COIIntegrationAward coiIntAward = (award != null) ? award : new COIIntegrationAward();
			if (award == null) {
			    coiIntAward.setFirstFedTimestamp(integrationDao.getCurrentTimestamp());
			    String projectNumber = awardDTO.getProjectNumber();
				String[] parts = projectNumber.split("-");
				if (parts.length == 2) {
				    String suffix = parts[1];
				    if (!suffix.equals("00001")) {
				    	newChildAwardFeed = Boolean.TRUE;
				    }
				}
			}
			if (Constant.AWARD_STATUS_CODE_CLOSED.equals(awardDTO.getProjectStatusCode())
					|| Constant.AWARD_STATUS_CODE_INACTIVE.equals(awardDTO.getProjectStatusCode())) {
				MarkVoidVO vo = prepareMarkVoidVO(awardDTO.getProjectNumber(), null, REMARK_AWARD_VOID, Constant.COI_DISCL_MARKED_VOID_BY_PRJCT_CLOSED);
				fcoiFeignClient.makeDisclosureVoid(vo);
			}
			saveOrUpdateCOIAward(awardDTO, coiIntAward);
			newPersonIds = prepareProjectPersonDetail(awardDTO);
			linkOrUnlinkIPFromAward(awardDTO.getLinkedInstProposalNumbers(), awardDTO.getProjectNumber());
			awardDTO.setNewChildAwardFeed(newChildAwardFeed);
			awardDTO.setNewPersonIds(newPersonIds);
			return awardDTO;
		} catch (Exception e) {
			log.error("Error in saving award details", awardDTO.getProjectNumber(), e.getMessage());
			throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed award integration", e, e.getMessage(),
	        		awardIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE, Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

	private Set<String> prepareProjectPersonDetail(AwardDTO awardDTO) {
		try {
			List<COIIntegrationAwardPerson> projectPersons = projectPersonRepository.findProjectPersonsByProjectNumber(awardDTO.getProjectNumber());
			Set<String> newPersonIds = new HashSet<>();
			if (!projectPersons.isEmpty()) {
			    Set<String> existingPersonKeys = projectPersons.stream()
			        .map(person -> person.getKeyPersonId() + "::" + person.getProjectNumber())
			        .collect(Collectors.toSet());
			    awardDTO.getProjectPersons().forEach(projectPersonDTO -> {
			        String incomingKey = projectPersonDTO.getKeyPersonId() + "::" + projectPersonDTO.getProjectNumber();
			        boolean isNewPerson = !existingPersonKeys.contains(incomingKey);
			        boolean hasInactiveEntry = projectPersons.stream()
			            .anyMatch(person -> person.getKeyPersonId().equals(projectPersonDTO.getKeyPersonId())
			                    && person.getProjectNumber().equals(projectPersonDTO.getProjectNumber())
			                    && Constant.INACTIVE.equalsIgnoreCase(person.getStatus()));
			        if (isNewPerson || hasInactiveEntry) {
			            newPersonIds.add(projectPersonDTO.getKeyPersonId());
			        }
			    });
			}
		    awardDTO.getProjectPersons().forEach(projectPersonDTO -> {
		        COIIntegrationAwardPerson projectPerson = projectPersons.stream()
		            .filter(person -> person.getKeyPersonId().equals(projectPersonDTO.getKeyPersonId())
		                    && person.getProjectNumber().equals(projectPersonDTO.getProjectNumber()))
		            .findFirst()
		            .orElse(new COIIntegrationAwardPerson());
		        prepareProjectPersonDetail(projectPerson, projectPersonDTO, awardDTO.getDisclosureValidationFlag());
		        awardDao.saveAwardPerson(projectPerson);
		    });
			List<String> inactivePersonIds = new ArrayList<>();
	        // Mark as inactive if any existing person is removed 
	        Set<String> incomingKeyPersonIds = awardDTO.getProjectPersons().stream().map(projectPersonDTO -> projectPersonDTO.getKeyPersonId())
	                .collect(Collectors.toSet());
	        projectPersons.stream().filter(existingPerson -> !incomingKeyPersonIds.contains(existingPerson.getKeyPersonId()))
	                .forEach(existingPerson -> {
	                	inactivePersonIds.add(existingPerson.getKeyPersonId());
	                    existingPerson.setStatus(Constant.INACTIVE);
	                    /*if (ENABLE_NEW_DISCLOSURE_REQUIRED.equals(existingPerson.getNewDisclosureRequired())) {
	                    	existingPerson.setNewDisclosureRequired(DISABLE_NEW_DISCLOSURE_REQUIRED);
	                    }*/
	                    awardDao.saveAwardPerson(existingPerson);
	                    MarkVoidVO vo = prepareMarkAwardPersonVoidVO(existingPerson.getProjectNumber(), existingPerson.getKeyPersonId(), Constant.COI_DISCL_MARKED_VOID_BY_KEY_PRSN_REMOVAL);
						fcoiFeignClient.makeDisclosureVoid(vo);
	                });
	        awardDTO.setInactivePersonIds(inactivePersonIds);
			projectPersons.forEach(existingPerson -> {
				if (DISCLOSURE_NOT_REQUIRED_FLAG.equalsIgnoreCase(existingPerson.getDisclosureReqFlag())
						&& !inactivePersonIds.contains(existingPerson.getKeyPersonId())) {
					MarkVoidVO vo = prepareMarkAwardPersonVoidVO(existingPerson.getProjectNumber(),
							existingPerson.getKeyPersonId(), Constant.COI_DISCL_MARKED_VOID_BY_KEY_PRSN_ROLE_CHANGE);
					fcoiFeignClient.makeDisclosureVoid(vo);
				}
			});
	        return newPersonIds;
	    } catch (DataAccessException e) {
	        log.error("Database exception occurred while preparing project person details for project: {}", awardDTO.getProjectNumber(), e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Database exception in preparing project person details", e, e.getMessage(),
	        		awardIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	}

	private MarkVoidVO prepareMarkAwardPersonVoidVO(String projectNumber, String keyPersonId, String actionType) {
		return prepareMarkVoidVO(projectNumber, keyPersonId, REMARK_PROJECT_PERSON_VOID, actionType);
	}

	private MarkVoidVO prepareMarkVoidVO(String projectNumber, String keyPersonId, String remark, String actionType) {
		return MarkVoidVO.builder()
				 .moduleCode(Constant.AWARD_MODULE_CODE)
				 .moduleItemKey(projectNumber)
				 .remark(remark)
				 .personId(keyPersonId)
				 .actionType(actionType)
				 .build();
	}

	private void prepareProjectPersonDetail(COIIntegrationAwardPerson projectPerson, AwardPersonDTO projectPersonDTO, String disclosureValidationFlag) {
		if (projectPerson.getProjectNumber() == null) {
			projectPerson.setProjectNumber(projectPersonDTO.getProjectNumber());
			projectPerson.setKeyPersonId(projectPersonDTO.getKeyPersonId());
		}
		projectPerson.setKeyPersonRoleCode(projectPersonDTO.getKeyPersonRoleCode());
        projectPerson.setKeyPersonRoleName(projectPersonDTO.getKeyPersonRoleName());
		projectPerson.setAttribute1Label(projectPersonDTO.getAttribute1Label());
        projectPerson.setAttribute1Value(projectPersonDTO.getAttribute1Value());
        projectPerson.setAttribute2Label(projectPersonDTO.getAttribute2Label());
        projectPerson.setAttribute2Value(projectPersonDTO.getAttribute2Value());
        projectPerson.setAttribute3Label(projectPersonDTO.getAttribute3Label());
        projectPerson.setAttribute3Value(projectPersonDTO.getAttribute3Value());
        projectPerson.setKeyPersonName(projectPersonDTO.getKeyPersonName());
        projectPerson.setStatus(Constant.ACTIVE);
        projectPerson.setPercentOfEffort(projectPersonDTO.getPercentOfEffort());
        projectPerson.setDisclosureReqFlag(projectPersonDTO.getDisclosureReqFlag());
        if (DISCLOSURE_VALIDATION_FLAG_SELF.equals(disclosureValidationFlag) && projectPerson.getNewDisclosureRequired() == null) {
        	projectPerson.setNewDisclosureRequired(ENABLE_NEW_DISCLOSURE_REQUIRED);
        	awardDao.insertAwardHistory(projectPersonDTO.getProjectNumber(), "<b>FCOI Disclosure request reopened.</b>");
        }
        awardDao.saveAwardPerson(projectPerson);
	}

	private void saveOrUpdateCOIAward(AwardDTO awardDTO, COIIntegrationAward award) {
		award.setProjectStatus(awardDTO.getProjectStatus());
		award.setProjectStatusCode(awardDTO.getProjectStatusCode());
		award.setProjectNumber(awardDTO.getProjectNumber());
		award.setProjectId(awardDTO.getProjectId());
		award.setTitle(awardDTO.getTitle());
		award.setVersionNumber(awardDTO.getVersionNumber());
		award.setRootProjectNumber(awardDTO.getRootProjectNumber());
		award.setParentProjectNumber(awardDTO.getParentProjectNumber());
		award.setAccountNumber(awardDTO.getAccountNumber());
		award.setAnticipatedTotal(awardDTO.getAnticipatedTotal());
		award.setObligatedTotal(awardDTO.getObligatedTotal());
		award.setDocumentUrl(awardDTO.getDocumentUrl());
		award.setLastFedTimestamp(integrationDao.getCurrentTimestamp());
		award.setLeadUnitName(awardDTO.getLeadUnitName());
		award.setLeadUnitNumber(awardDTO.getLeadUnitNumber());
		award.setPrimeSponsorCode(awardDTO.getPrimeSponsorCode());
		award.setPrimeSponsorName(awardDTO.getPrimeSponsorName());
		award.setProjectStartDate(awardDTO.getProjectStartDate());
		award.setProjectEndDate(awardDTO.getProjectEndDate());
		award.setProjectType(awardDTO.getProjectType());
		award.setProjectTypeCode(awardDTO.getProjectTypeCode());
		award.setSponsorCode(awardDTO.getSponsorCode());
		award.setSponsorName(awardDTO.getSponsorName());
		award.setSponsorGrantNumber(awardDTO.getSponsorGrantNumber());
		award.setSrcSysUpdatedBy(awardDTO.getSrcSysUpdatedBy());
		award.setSrcSysUpdateTimestamp(awardDTO.getSrcSysUpdateTimestamp());
		award.setAttribute1Label(awardDTO.getAttribute1Label());
		award.setAttribute1Value(awardDTO.getAttribute1Value());
		award.setAttribute2Label(awardDTO.getAttribute2Label());
		award.setAttribute2Value(awardDTO.getAttribute2Value());
		award.setAttribute3Label(awardDTO.getAttribute3Label());
		award.setAttribute3Value(awardDTO.getAttribute3Value());
		award.setAttribute4Label(awardDTO.getAttribute4Label());
		award.setAttribute4Value(awardDTO.getAttribute4Value());
		award.setAttribute5Label(awardDTO.getAttribute5Label());
		award.setAttribute5Value(awardDTO.getAttribute5Value());
		if (!DISCLOSURE_VALIDATION_FLAG_SELF.equals(award.getDisclosureValidationFlag())) {
			award.setDisclosureValidationFlag(awardDTO.getDisclosureValidationFlag());
		}
		awardDTO.setDisclosureValidationFlag(award.getDisclosureValidationFlag());
		awardDao.saveAward(award);
	}

	private void updateDisclSyncFlag(String projectNumber) {
		try {
			DisclosureSyncVO vo = new DisclosureSyncVO();
			vo.setModuleCode(Constant.AWARD_MODULE_CODE);
			vo.setProjectId(projectNumber);
			ResponseEntity<Object> response = fcoiFeignClient.updateProjectDisclosureFlag(vo);
			if (response.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR || response.getStatusCode() == HttpStatus.BAD_REQUEST
					|| response.getStatusCode() == HttpStatus.UNAUTHORIZED || response.getStatusCode() == HttpStatus.NOT_FOUND) {
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

	private void linkOrUnlinkIPFromAward(List<String> linkedIPNumbers, String projectNumber) {
		try {
			List<String> ipNumbers = proposalRepository.findIPNumbersByAwardNumber(projectNumber);
			if (linkedIPNumbers.isEmpty()) {
				if (!ipNumbers.isEmpty()) {
					proposalRepository.unlinkAwardFromAllIPs(ipNumbers);
				}
			} else {
				Set<String> linkedIPs = new HashSet<>(linkedIPNumbers);
				ipNumbers.forEach(ipNumber -> {
					if (linkedIPs.contains(ipNumber)) {
						proposalRepository.linkAwardNumberInIP(projectNumber, ipNumber);
						linkedIPs.remove(ipNumber);
					} else {
						proposalRepository.unlinkAwardNumberFromIP(projectNumber, ipNumber);
					}
				});
				linkedIPs.forEach(ipNumber -> proposalRepository.linkAwardNumberInIP(projectNumber, ipNumber));
			}
	    } catch (DataAccessException e) {
	        log.error("Database exception occurred while linking/unlinking IP numbers in development proposals for project: {}", projectNumber, e.getMessage());
	        throw new MQRouterException(Constant.ERROR_CODE, "Database exception in linking/unlinking IP numbers", e, e.getMessage(),
	        		awardIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
	                Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE,
	                Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
	    }
	}

	@Override
	public DisclosureResponse feedAwardPersonDisclosureStatus(String awardNumber, List<String> personIds) {
		return awardDao.feedAwardDisclosureStatus(awardNumber, personIds);
	}

	@Override
	public DisclosureResponse checkAwardDisclosureStatus(String awardNumber) {
		return awardDao.checkAwardDisclosureStatus(awardNumber);
	}

	@Override
	public void updateAwardDisclosureValidationFlag(String awardNumber, String disclosureValidationFlag) {
		awardDao.updateDisclosureValidationFlag(awardNumber, disclosureValidationFlag);
		if(DISCLOSURE_VALIDATION_FLAG_SELF.equals(disclosureValidationFlag)) {
			awardDao.updateKPDisclosureRequirements(awardNumber, ENABLE_NEW_DISCLOSURE_REQUIRED);
		}
	}

	@Transactional
	@Override
	public void updateKPDisclosureRequirements(AwardPersonDTO dto) {
		if (dto.getKeyPersonId() != null) {
			awardDao.updateKPDisclosureRequirements(dto.getProjectNumbers(), dto.getNewDisclosureRequired(), dto.getKeyPersonId());
		} else {
			awardDao.updateKPDisclosureRequirements(dto.getProjectNumber(), dto.getNewDisclosureRequired());
		}
	}

	@Override
	public void updateAwardDisclosureStatus(String projectNumber, String updatePersonStatus) {
		log.info("updateAwardDisclosureStatus, awardnumber: {}", projectNumber);
		awardRepository.UPD_COI_AWD_DISCLOSURE_STS(projectNumber, updatePersonStatus, null);
	}

	@Override
	public void updateAwardDisclosureStatus(String projectNumber, String updatePersonStatus, Set<String> newPersonIds) {
		log.info("updateAwardDisclosureStatus, awardnumber: {}, keyPersonIds: {}", projectNumber, newPersonIds);
		String personIdInput = newPersonIds.stream().map(id -> "'" + id + "'").collect(Collectors.joining(","));
		log.info("formatted key person ids {}", personIdInput);
		awardRepository.UPD_COI_AWD_DISCLOSURE_STS(projectNumber, updatePersonStatus, personIdInput);
	}

	@Override
	public void syncPersonProjects(String personId) {
		log.info("Fetching project and proposal numbers for personId: {}", personId);

		List<String> projectNumbers = awardDao.findProjectNumbersByKeyPersonId(personId);
		log.info("Found projectNumbers: {}", projectNumbers);

		List<String> proposalNumbers = instituteProposalDao.findProposalNumbersByKeyPersonId(personId);
		log.info("Found proposalNumbers: {}", proposalNumbers);

		ProjectSyncRequest syncRequest = ProjectSyncRequest.builder()
				.personId(personId)
				.projectNumbers(projectNumbers)
				.proposalNumbers(proposalNumbers)
				.build();

		log.info("Sending sync request to KC system for personId: {}", personId);
		kcFeignClient.syncPersonProjects(syncRequest);
	}

}
