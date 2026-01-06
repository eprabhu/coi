package com.polus.fibicomp.globalentity.service;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dao.EntityDetailsDAO;
import com.polus.fibicomp.globalentity.repository.EntityFamilyTreeRoleRepository;
import com.polus.fibicomp.globalentity.repository.GlobalEntityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.clients.FibiCoiConnectClient;
import com.polus.fibicomp.coi.clients.model.EntityDnBUpwardFamilyTreeResponse;
import com.polus.fibicomp.coi.clients.model.ParentDunsDto;
import com.polus.fibicomp.coi.dto.DnBOrganizationDetails;
import com.polus.fibicomp.coi.dto.DnBOrganizationDetails.FamilyTreeRole;
import com.polus.fibicomp.globalentity.dao.CorporateFamilyDAO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestField;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTree;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import com.polus.fibicomp.globalentity.repository.EntityFamilyTreeRepository;

import lombok.extern.slf4j.Slf4j;

@Service(value = "corporateFamilyService")
@Transactional
@Slf4j
public class CorporateFamilyServiceImpl implements CorporateFamilyService {

	private static final String ENTITY_FAMILY_ROLE_TYPE_PARENT = "12773";
	private static final String UPDATED_BY_SYSTEM = "system";

	@Autowired
	CommonDao commonDao;

	@Autowired
	CorporateFamilyDAO corporateFamilyDAO;

	@Autowired
	private EntityFamilyTreeRepository entityFamilyTreeRepository;

	@Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

	@Autowired
	private FibiCoiConnectClient fibiCoiConnectClient;

	@Autowired
	@Qualifier(value = "entityDetailsService")
	private GlobalEntityService entityDetailsService;

	@Autowired
	private GlobalEntityRepository globalEntityRepository;

	@Autowired
	private EntityDetailsDAO entityDetailsDAO;

	@Autowired
	private EntityFamilyTreeRepository familyTreeRepository;

	@Autowired
	private EntityFamilyTreeRoleRepository familyTreeRoleRepository;

	private static final String SUCCESS_MESSAGE = "Corporate family updated successfully";

	@Override
	public ResponseEntity<CorporateFamilyRequestDTO> createCorporateFamily(CorporateFamilyRequestDTO dto) {
		String updateUserId = AuthenticatedUser.getLoginPersonId();
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		if (!isParentLinked(dto.getEntityNumber())) {
			if (isEntityPresent(dto.getEntityNumber())) {
				dto.setUpdatedBy(updateUserId);
				dto.setUpdateTimestamp(updateTimestamp);
				updateCorporateFamily(dto);
			} else {
				corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(dto.getEntityNumber())
						.globalUltimateEntityNumber(dto.getGuEntityNumber()).parentEntityNumber(dto.getParentEntityNumber())
						.isSystemCreated(Boolean.FALSE)
						.updatedBy(updateUserId)
						.updateTimestamp(updateTimestamp).build());
			}
			dto.getRoleTypeCodes().forEach(roleTypeCode -> {
				if (!isEntityRoleTypePresent(dto.getEntityNumber(), roleTypeCode)) {
					corporateFamilyDAO.insertFamilyTreeRoles(
							EntityFamilyTreeRole.builder().entityNumber(dto.getEntityNumber()).familyRoleTypeCode(roleTypeCode)
									.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
				}
			});
			if (!isValidParent(dto.getParentEntityNumber())) {
				corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(dto.getParentEntityNumber())
						.isSystemCreated(Boolean.FALSE)
						.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
				if (!isEntityRoleTypePresent(dto.getParentEntityNumber(), ENTITY_FAMILY_ROLE_TYPE_PARENT)) {
					corporateFamilyDAO.insertFamilyTreeRoles(
							EntityFamilyTreeRole.builder().entityNumber(dto.getParentEntityNumber()).familyRoleTypeCode(ENTITY_FAMILY_ROLE_TYPE_PARENT)
									.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
				}
			}
			entityDetailsDAO.updateEntityForeignFlag(dto.getEntityId(), dto.getEntityNumber());
			return new ResponseEntity<>(CorporateFamilyRequestDTO.builder().build(), HttpStatus.OK);
		}
		return new ResponseEntity<>(CorporateFamilyRequestDTO.builder().build(), HttpStatus.METHOD_NOT_ALLOWED);
	}

	private boolean isEntityRoleTypePresent(Integer entityNumber, String roleTypeCode) {
		Boolean isEntityRoleTypePresent = corporateFamilyDAO.isEntityRoleTypePresent(entityNumber, roleTypeCode);
		log.info("isEntityRoleTypePresent: {}", isEntityRoleTypePresent);
		return isEntityRoleTypePresent;
	}

	private boolean isEntityPresent(Integer entityNumber) {
		Boolean isEntityPresent = corporateFamilyDAO.isEntityPresent(entityNumber);
		log.info("isEntityPresent: {}", isEntityPresent);
		return isEntityPresent;
	}

	private boolean isValidParent(Integer entityNumber) {
		Boolean isValidParent = corporateFamilyDAO.isValidParent(entityNumber);
		log.info("isValidParent: {}", isValidParent);
		return isValidParent;
	}

	@Override
	public boolean isParentLinked(Integer entityNumber) {
		Boolean isParentLinked = corporateFamilyDAO.isParentLinked(entityNumber);
		log.info("isParentLinked: {}", isParentLinked);
		return isParentLinked;
	}

	@Override
	public ResponseMessageDTO updateCorporateFamily(CorporateFamilyRequestDTO dto) {
		String updateUserId = AuthenticatedUser.getLoginPersonId();
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		corporateFamilyDAO.updateParent(dto);
		if (!isValidParent(dto.getParentEntityNumber())) {
			corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(dto.getParentEntityNumber())
					.isSystemCreated(dto.getIsSystemCreated() == null ? Boolean.FALSE : dto.getIsSystemCreated())
					.updatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : updateUserId)
					.updateTimestamp(updateTimestamp).build());
			if (!isEntityRoleTypePresent(dto.getParentEntityNumber(), ENTITY_FAMILY_ROLE_TYPE_PARENT)) {
				corporateFamilyDAO.insertFamilyTreeRoles(
						EntityFamilyTreeRole.builder().entityNumber(dto.getParentEntityNumber()).familyRoleTypeCode(ENTITY_FAMILY_ROLE_TYPE_PARENT)
								.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
			}
		}
		entityDetailsDAO.updateEntityForeignFlag(entityDetailsDAO.getEntityIdByEntityNumberAndVersionStatus(dto.getEntityNumber(), Constants.COI_ACTIVE_STATUS),
				dto.getEntityNumber());
		return ResponseMessageDTO.builder().message("Corporate family updated successfully").build();
	}

	@Override
	public CorporateFamilyRequestDTO unlinkEntity(Integer entityNumber) {
		Integer parentEntityNumber = corporateFamilyDAO.getParentEntityIdEntityId(entityNumber);
		Integer entityId = globalEntityRepository.getEntityIdByEntityNumberAndVersionStatus(entityNumber, Constants.COI_ACTIVE_STATUS);
		corporateFamilyDAO.deleteEntityFamilyTreeRole(entityNumber);
		if (entityFamilyTreeRepository.hasChildEntities(entityNumber) > 0) {
			corporateFamilyDAO.unlinkEntity(entityNumber);
			corporateFamilyDAO.insertFamilyTreeRoles(
					EntityFamilyTreeRole.builder().entityNumber(entityNumber).familyRoleTypeCode(ENTITY_FAMILY_ROLE_TYPE_PARENT)
							.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp()).build());
		} else {
			corporateFamilyDAO.deleteEntityFromFamilyTree(entityNumber);
		}
		if (isParentSingleNode(parentEntityNumber)) {
			corporateFamilyDAO.deleteEntityFromFamilyTree(parentEntityNumber);
			corporateFamilyDAO.deleteEntityFamilyTreeRole(parentEntityNumber);
		}
		return CorporateFamilyRequestDTO.builder().entityId(entityId).entityNumber(entityNumber)
				.parentEntityNumber(parentEntityNumber)
				.parentEntityId(globalEntityRepository.getEntityIdByEntityNumberAndVersionStatus(parentEntityNumber, Constants.COI_ACTIVE_STATUS))
				.build();
	}

	private boolean isParentSingleNode(Integer entityNumber) {
		return corporateFamilyDAO.isParentSingleNode(entityNumber);
	}

	@Override
	public CorporateFamilyResponseDTO fetchCorporateFamily(Integer entityNumber) {
		CorporateFamilyResponseDTO root = null;
		try {
			List<CorporateFamilyResponseDTO> entityCorporateFamily = corporateFamilyDAO.fetchCorporateFamily(entityNumber);
			Map<Integer, List<CorporateFamilyResponseDTO>> parentEntityMapping = entityCorporateFamily.stream()
					.filter(e -> e.getParentEntityNumber() != 0).collect(Collectors.groupingBy(e -> e.getParentEntityNumber()));

			root = entityCorporateFamily.stream().filter(e -> e.getParentEntityNumber() == 0).findFirst()
					.orElseThrow(() -> new RuntimeException("Root entity not found"));
			buildEntityTree(root, parentEntityMapping);
			return root;
		} catch (Exception e) {
			log.info("Root entity not found");
		}
		return root;
	}

	private static void buildEntityTree(CorporateFamilyResponseDTO parent,
			Map<Integer, List<CorporateFamilyResponseDTO>> parentEntityMap) {
		List<CorporateFamilyResponseDTO> children = parentEntityMap.get(parent.getEntityNumber());
		if (children != null) {
			children.forEach(child -> {
				parent.getChild().add(child);
				buildEntityTree(child, parentEntityMap);
			});
		}
	}

	@Override
	public ResponseEntity<ResponseMessageDTO> createCorporateFamilyFromDnB(String dunsNumber) {
		EntityDnBUpwardFamilyTreeResponse familyTreeResponse = fibiCoiConnectClient.getUpwardFamilyTree(dunsNumber).getBody();
		if (familyTreeResponse.getParentDuns() != null) {
			Object[] guEntityObj = globalEntityService
					.getEntityIdByDunsNumber(familyTreeResponse.getGlobalUltimateDuns());
			Integer guEntityId;
			Integer guEntityNumber;
			if (guEntityObj == null) {
				guEntityId = createEntity(familyTreeResponse.getGlobalUltimateDuns());
				guEntityNumber = guEntityId;
			} else {
				guEntityId = (Integer) guEntityObj[0];
				guEntityNumber = (Integer) guEntityObj[1];
				if (isParentLinked(guEntityNumber)) {
					unlinkEntity(guEntityNumber);
				}
			}
			iterateParentDuns(familyTreeResponse.getParentDuns(), familyTreeResponse.getDuns(), guEntityId, guEntityNumber);
		} else {
			return new ResponseEntity<>(
					ResponseMessageDTO.builder().message("Parent entity details not found").build(), HttpStatus.OK);
		}
		return new ResponseEntity<>(
				ResponseMessageDTO.builder().message(SUCCESS_MESSAGE).build(), HttpStatus.OK);
	}

	private void iterateParentDuns(ParentDunsDto parentDuns, String duns, Integer guEntityId, Integer guEntityNumber) {
		String updateUserId = UPDATED_BY_SYSTEM;
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		Object[] entityObj = globalEntityService.getEntityIdByDunsNumber(duns);
		Integer entityNumber;
		if (entityObj == null) {
			entityNumber = createEntity(duns);
		} else {
			entityNumber = (Integer) entityObj[1];
		}
		String parentDunsNumber = parentDuns.getDuns();
		Object[] parentEntityObj = globalEntityService.getEntityIdByDunsNumber(parentDunsNumber);
		Integer parentEntityId;
		Integer parentEntityNumber;
		if (parentEntityObj == null ) {
			parentEntityId = createEntity(parentDunsNumber);
			parentEntityNumber = parentEntityId;
		} else {
			parentEntityNumber = (Integer) parentEntityObj[1];
		}
		if (isEntityPresent(entityNumber)) {
			if (!isParentLinked(entityNumber)) {
				updateCorporateFamily(CorporateFamilyRequestDTO.builder().entityNumber(entityNumber)
						.isSystemCreated(Boolean.TRUE).updatedBy(updateUserId)
						.parentEntityNumber(parentEntityNumber).guEntityNumber(guEntityNumber).build());
			} else if (!corporateFamilyDAO.fetchExistingParentIs(entityNumber, parentEntityNumber)) {
				unlinkEntity(entityNumber);
				corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(entityNumber)
						.globalUltimateEntityNumber(guEntityNumber).parentEntityNumber(parentEntityNumber).updatedBy(UPDATED_BY_SYSTEM)
						.isSystemCreated(Boolean.TRUE).updatedBy(updateUserId)
						.updateTimestamp(updateTimestamp).build());
			}
		} else {
			corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(entityNumber)
					.globalUltimateEntityNumber(guEntityNumber).parentEntityNumber(parentEntityNumber).updatedBy(UPDATED_BY_SYSTEM)
					.isSystemCreated(Boolean.TRUE).updatedBy(updateUserId)
					.updateTimestamp(updateTimestamp).build());
		}
		syncCorporateLinkage(entityNumber, duns, updateUserId, updateTimestamp);
		if (!isValidParent(parentEntityNumber)) {
			corporateFamilyDAO.createCorporateFamily(EntityFamilyTree.builder().entityNumber(parentEntityNumber)
					.isSystemCreated(Boolean.TRUE)
					.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
			if (!isEntityRoleTypePresent(guEntityNumber, ENTITY_FAMILY_ROLE_TYPE_PARENT)) {
				corporateFamilyDAO.insertFamilyTreeRoles(
						EntityFamilyTreeRole.builder().entityNumber(guEntityNumber).familyRoleTypeCode(ENTITY_FAMILY_ROLE_TYPE_PARENT)
								.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
			}
		}
		if (parentDuns.getParentDuns() != null) {
			iterateParentDuns(parentDuns.getParentDuns(), parentDunsNumber, guEntityId, guEntityNumber);
		}
	}

	private Integer createEntity(String duns) {
		String countryCode = null;
		ResponseEntity<DnBOrganizationDetails> parentResponse = fibiCoiConnectClient.searchDuns(duns);
		if (parentResponse.getBody().getPrimaryAddress().getAddressCountry().getIsoAlpha2Code() != null && parentResponse.getBody().getPrimaryAddress().getAddressCountry().getIsoAlpha2Code().length() == 2) {
			countryCode = commonDao.fetchCountryByCountryTwoCode(parentResponse.getBody().getPrimaryAddress().getAddressCountry().getIsoAlpha2Code()).getCountryCode();
		}
		Map<EntityRequestField, Object> entityRequestFields = new HashMap<>();
		entityRequestFields.put(EntityRequestField.entityName, 
		    parentResponse.getBody() != null && parentResponse.getBody().getPrimaryName() != null ? parentResponse.getBody().getPrimaryName() : null);
		entityRequestFields.put(EntityRequestField.primaryAddressLine1, 
		    parentResponse.getBody() != null && parentResponse.getBody().getPrimaryAddress() != null 
		    && parentResponse.getBody().getPrimaryAddress().getStreetAddress() != null
		    && parentResponse.getBody().getPrimaryAddress().getStreetAddress().getLine1() != null ? parentResponse.getBody().getPrimaryAddress().getStreetAddress().getLine1() : null);
		entityRequestFields.put(EntityRequestField.city, 
		    parentResponse.getBody() != null && parentResponse.getBody().getPrimaryAddress() != null 
		    && parentResponse.getBody().getPrimaryAddress().getAddressLocality() != null 
		    && parentResponse.getBody().getPrimaryAddress().getAddressLocality().getName() != null ? parentResponse.getBody().getPrimaryAddress().getAddressLocality().getName() : null);
		entityRequestFields.put(EntityRequestField.state, 
		    parentResponse.getBody() != null && parentResponse.getBody().getPrimaryAddress() != null 
		    && parentResponse.getBody().getPrimaryAddress().getAddressRegion() != null 
		    && parentResponse.getBody().getPrimaryAddress().getAddressRegion().getName() != null ? parentResponse.getBody().getPrimaryAddress().getAddressRegion().getName() : null);
		entityRequestFields.put(EntityRequestField.postCode, 
		    parentResponse.getBody() != null && parentResponse.getBody().getPrimaryAddress() != null 
		    && parentResponse.getBody().getPrimaryAddress().getPostalCode() != null ? parentResponse.getBody().getPrimaryAddress().getPostalCode() : null);
		entityRequestFields.put(EntityRequestField.countryCode, countryCode != null ? countryCode : null);
		entityRequestFields.put(EntityRequestField.dunsNumber, 
		    parentResponse.getBody() != null && parentResponse.getBody().getDuns() != null ? parentResponse.getBody().getDuns() : null);
		entityRequestFields.put(EntityRequestField.isDunsMatched, Boolean.FALSE);
		Integer ParentEntityId = entityDetailsService.createEntity(EntityRequestDTO.builder().entityRequestFields(entityRequestFields)
				.updatedBy(UPDATED_BY_SYSTEM).createdFromCorFamily(Boolean.TRUE).build()).getBody().get("entityId");
		try {
			entityDetailsService.verifyEntityFromCorporateTree(ParentEntityId);
		} catch (Exception e) {
			log.warn("Unable to verify entity while creating from family tree : {}", e.getMessage());
		}
		globalEntityService.processEntityMessageToGraphSyncQ(ParentEntityId);
		return ParentEntityId;
	}

	@Override
	public void syncGraph(ResponseEntity<ResponseMessageDTO> response, String dunsNumber) {
		if (response.getStatusCode().is2xxSuccessful()
				&& response.getBody().getMessage().contentEquals(SUCCESS_MESSAGE)) {
			Object[] entityObj = globalEntityService.getEntityIdByDunsNumber(dunsNumber);
			globalEntityService.processEntityMessageToGraphSyncQ((Integer) entityObj[0]);
		}
	}


	@Override
	public void syncCorporateLinkage(Integer entityNumber, String dunsNumber, String updateUserId, Timestamp updateTimestamp) {
		DnBOrganizationDetails orgDetails = fibiCoiConnectClient.searchDuns(dunsNumber).getBody();
		if (orgDetails != null && orgDetails.getCorporateLinkage() != null && orgDetails.getCorporateLinkage().getFamilytreeRolesPlayed() != null) {
			List<DnBOrganizationDetails.FamilyTreeRole> response = orgDetails.getCorporateLinkage().getFamilytreeRolesPlayed();
			for (DnBOrganizationDetails.FamilyTreeRole familyTreeRole : response) {
				if (!isEntityRoleTypePresent(entityNumber, String.valueOf(familyTreeRole.getDnbCode()))) {
					corporateFamilyDAO.insertFamilyTreeRoles(
							EntityFamilyTreeRole.builder().entityNumber(entityNumber).familyRoleTypeCode(String.valueOf(familyTreeRole.getDnbCode()))
									.updatedBy(updateUserId).updateTimestamp(updateTimestamp).build());
				}
			}
		}
	}
}
