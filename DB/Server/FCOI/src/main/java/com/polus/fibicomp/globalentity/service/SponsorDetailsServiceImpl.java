package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;
import com.polus.fibicomp.globalentity.repository.GlobalEntityRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.EntityRiskDAO;
import com.polus.fibicomp.globalentity.dao.SponsorDAO;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntitySponsorField;
import com.polus.fibicomp.globalentity.dto.SponsorDetailsResponseDTO;
import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SponsorResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import com.polus.fibicomp.globalentity.repository.EntityFeedStatusTypeRepository;
import com.polus.fibicomp.globalentity.repository.EntitySponsorInfoRepository;

@Service
@Transactional
public class SponsorDetailsServiceImpl implements SponsorDetailsService {

	@Autowired
	private EntitySponsorInfoRepository entitySponsorInfoRepository;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private SponsorDAO sponsorDAO;

	@Autowired
	private EntityRiskDAO entityRiskDAO;

	@Autowired
	private EntityFileAttachmentService entityFileAttachmentService;

	@Autowired
    private EntityActionLogService actionLogService;

	@Autowired
    private EntityFeedStatusTypeRepository feedStatusRepository;

	@Autowired
	private GlobalEntityRepository globalEntityRepository;

	@Autowired
	private SubAwdOrgDetailsService subAwdOrgDetailsService;

	private static final String SPONSOR_SECTION_CODE = "2";
	private static final String FEED_STATUS_READY_TO_FEED = "2";
	private static final String FEED_STATUS_NOT_READY_TO_FEED = "1";
	private static final String SPONSOR_FEED_ACTION_LOG_CODE = "10";
	private static final String ACTION_TYPE_SAVE = "S";
	private static final String ACTION_TYPE_UPDATE = "U";

	@Override
	public Map<String, Integer> saveDetails(SponsorRequestDTO dto) {
		EntitySponsorInfo entity = mapDTOToEntity(dto);
		return Map.of("id", sponsorDAO.saveDetails(entity));
	}

	private EntitySponsorInfo mapDTOToEntity(SponsorRequestDTO dto) {
		Map<EntitySponsorField, Object> entitySponsorFields = dto.getEntitySponsorFields();
		EntitySponsorInfo.EntitySponsorInfoBuilder entitySponsorInfo = EntitySponsorInfo.builder()
				.entityId(dto.getEntityId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.updatedBy(AuthenticatedUser.getLoginPersonId());

		entitySponsorFields.forEach((field, value) -> {
			switch (field) {
				case acronym:
					entitySponsorInfo.acronym(castToString(value));
					break;
				case sponsorTypeCode:
					entitySponsorInfo.sponsorTypeCode(castToString(value));
					break;
				case feedStatusCode:
					entitySponsorInfo.feedStatusCode(castToString(value));
					break;
				case sponsorCode:
					entitySponsorInfo.sponsorCode(castToString(value));
					break;
				case sponsorName:
					entitySponsorInfo.sponsorName(castToString(value));
					break;
				case translatedName:
					entitySponsorInfo.translatedName(castToString(value));
					break;
				case dunsNumber:
					entitySponsorInfo.dunsNumber(castToString(value));
					break;
				case ueiNumber:
					entitySponsorInfo.ueiNumber(castToString(value));
					break;
				case cageNumber:
					entitySponsorInfo.cageNumber(castToString(value));
					break;
				case primaryAddressLine1:
					entitySponsorInfo.primaryAddressLine1(castToString(value));
					break;
				case primaryAddressLine2:
					entitySponsorInfo.primaryAddressLine2(castToString(value));
					break;
				case city:
					entitySponsorInfo.city(castToString(value));
					break;
				case state:
					entitySponsorInfo.state(castToString(value));
					break;
				case postCode:
					entitySponsorInfo.postCode(castToString(value));
					break;
				case countryCode:
					entitySponsorInfo.countryCode(castToString(value));
					break;
				case emailAddress:
					entitySponsorInfo.emailAddress(castToString(value));
					break;
				case phoneNumber:
					entitySponsorInfo.phoneNumber(castToString(value));
					break;
				case comments:
					entitySponsorInfo.comments(castToString(value));
					break;
				case isCopy:
					entitySponsorInfo.isCopy(castToBoolean(value));
					break;
				case rolodexId:
					entitySponsorInfo.rolodexId(castToInteger(value));
					break;
			}
		});

		return entitySponsorInfo.build();
	}
	private Integer castToInteger(Object value) {
		return value instanceof Integer ? (Integer) value : null;
	}

	private String castToString(Object value) {
		return value instanceof String ? (String) value : null;
	}

	private Boolean castToBoolean(Object value) {
		return value instanceof Boolean ? (Boolean) value : null;
	}

	@Override
	public ResponseEntity<String> updateDetails(SponsorRequestDTO dto) {
		dto.setAcType(ACTION_TYPE_UPDATE);
		logAction(dto);
		sponsorDAO.updateDetails(dto);
		if (dto.getIsChangeInAddress() != null && dto.getIsChangeInAddress()) {
			subAwdOrgDetailsService.updateOrgAddressBySponAddress(dto.getEntityId(), sponsorDAO.findByEntityId(dto.getEntityId()));
		}
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Sponsor details updated successfully"), HttpStatus.OK);
	}

	public void logAction(SponsorRequestDTO dto) {
		if(dto.getEntitySponsorFields().get(EntitySponsorField.feedStatusCode) != null ) {
			if (dto.getAcType().equals(ACTION_TYPE_SAVE)) {
				ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(dto.getEntityId())
						.oldFeedStatus(feedStatusRepository.getDescriptionByCode(FEED_STATUS_NOT_READY_TO_FEED))
						.newFeedStatus(feedStatusRepository.getDescriptionByCode(FEED_STATUS_READY_TO_FEED)).build();
				actionLogService.saveEntityActionLog(SPONSOR_FEED_ACTION_LOG_CODE, logDTO, null);
			} else {
				EntitySponsorInfo sponsorInfo = entitySponsorInfoRepository.findByEntityId(dto.getEntityId());
				if (sponsorInfo.getEntityFeedStatusType() == null
						|| !feedStatusRepository.getDescriptionByCode(FEED_STATUS_READY_TO_FEED).equals(sponsorInfo.getEntityFeedStatusType().getDescription())) {
					ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(dto.getEntityId())
							.oldFeedStatus(sponsorInfo.getEntityFeedStatusType() == null
									? feedStatusRepository.getDescriptionByCode(FEED_STATUS_NOT_READY_TO_FEED)
									: sponsorInfo.getEntityFeedStatusType().getDescription())
							.newFeedStatus(feedStatusRepository.getDescriptionByCode(FEED_STATUS_READY_TO_FEED))
							.build();
					actionLogService.saveEntityActionLog(SPONSOR_FEED_ACTION_LOG_CODE, logDTO, null);
				}
			}
		}
	}

	@Override
	public ResponseEntity<SponsorResponseDTO> fetchDetails(Integer entityId) {
		SponsorDetailsResponseDTO sponsorDetailsResponseDTO = mapEntityToDTO(sponsorDAO.findByEntityId(entityId));
		List<EntityRisk> entityRisks = entityRiskDAO.findSponsorRiskByEntityId(entityId);
		List<EntityAttachmentResponseDTO> attachments = entityFileAttachmentService.getAttachmentsBySectionCode(SPONSOR_SECTION_CODE, entityId);
		return new ResponseEntity<>(
				SponsorResponseDTO.builder().sponsorDetailsResponseDTO(sponsorDetailsResponseDTO).entityRisks(entityRisks).attachments(attachments)
				.build(),
				HttpStatus.OK);
	}

	private SponsorDetailsResponseDTO mapEntityToDTO(EntitySponsorInfo entitySponsorInfo) {
		if (entitySponsorInfo != null) {
			return SponsorDetailsResponseDTO.builder().entityId(entitySponsorInfo.getEntityId())
					.acronym(entitySponsorInfo.getAcronym()).id(entitySponsorInfo.getId())
					.sponsorCode(entitySponsorInfo.getSponsorCode())
					.sponsorType(entitySponsorInfo.getSponsorType())
					.sponsorName(entitySponsorInfo.getSponsorName())
					.translatedName(entitySponsorInfo.getTranslatedName())
					.dunsNumber(entitySponsorInfo.getDunsNumber())
					.ueiNumber(entitySponsorInfo.getUeiNumber())
					.cageNumber(entitySponsorInfo.getCageNumber())
					.primaryAddressLine1(entitySponsorInfo.getPrimaryAddressLine1())
					.primaryAddressLine2(entitySponsorInfo.getPrimaryAddressLine2())
					.city(entitySponsorInfo.getCity())
					.state(entitySponsorInfo.getState())
					.postCode(entitySponsorInfo.getPostCode())
					.countryCode(entitySponsorInfo.getCountryCode())
					.country(entitySponsorInfo.getCountry())
					.emailAddress(entitySponsorInfo.getEmailAddress())
					.phoneNumber(entitySponsorInfo.getPhoneNumber())
					.comments(entitySponsorInfo.getComments())
					.isCopy(entitySponsorInfo.getIsCopy())
					.stateDetails(entitySponsorInfo.getStateDetails())
					.isCreatedFromImportEntity(entitySponsorInfo.getIsCreatedFromImportEntity())
					.build();
		} else {
			return null;
		}
	}

	@Override
	public ResponseEntity<String> deleteDetails(Integer id) {
		entitySponsorInfoRepository.deleteByEntitySponsorInfoId(id);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Sponsor details deleted successfully"), HttpStatus.OK);
	}

	@Override
	public void saveCopyFromEntity(Entity entity) {
		EntitySponsorInfo entitySponsorInfo = new EntitySponsorInfo();
		BeanUtils.copyProperties(entity, entitySponsorInfo);
		entitySponsorInfo.setEntityId(entity.getEntityId());
		entitySponsorInfo.setIsCopy(Boolean.TRUE);
		entitySponsorInfo.setSponsorName(entity.getEntityName());
		entitySponsorInfo.setEmailAddress(entity.getCertifiedEmail());
		sponsorDAO.saveDetails(entitySponsorInfo);
	}

	@Override
	public void updateCopyFromEntity(Entity entity) {
		EntitySponsorInfo sponsorDetails = entitySponsorInfoRepository.findByEntityId(entity.getEntityId());
		if (sponsorDetails == null) {
			sponsorDetails = new EntitySponsorInfo();
		}
		if (sponsorDetails.getIsCopy() != null && sponsorDetails.getIsCopy()) {
			BeanUtils.copyProperties(entity, sponsorDetails, "updateTimestamp", "updatedBy", "comments", "rolodexId");
			sponsorDetails.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
			sponsorDetails.setUpdateTimestamp(commonDao.getCurrentTimestamp());
			sponsorDetails.setSponsorName(entity.getEntityName());
			sponsorDetails.setEmailAddress(entity.getCertifiedEmail());
			subAwdOrgDetailsService.updateOrgAddressBySponAddress(entity.getEntityId(), sponsorDetails);
		}
	}

	@Override
	public void updateCopyFromEntity(Integer entityId) {
		Entity entity = globalEntityRepository.findByEntityId(entityId);
		EntitySponsorInfo sponsorDetails = entitySponsorInfoRepository.findByEntityId(entity.getEntityId());
		if (sponsorDetails == null) {
			sponsorDetails = new EntitySponsorInfo();
		}
		BeanUtils.copyProperties(entity, sponsorDetails, "updateTimestamp", "updatedBy", "comments", "rolodexId");
		sponsorDetails.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
		sponsorDetails.setUpdateTimestamp(commonDao.getCurrentTimestamp());
		sponsorDetails.setIsCopy(Boolean.TRUE);
		sponsorDetails.setSponsorName(entity.getEntityName());
		sponsorDetails.setEmailAddress(entity.getCertifiedEmail());
		subAwdOrgDetailsService.updateOrgAddressBySponAddress(entity.getEntityId(), sponsorDetails);
		if (sponsorDetails.getId() == null) {
			sponsorDAO.saveDetails(sponsorDetails);
		}
	}

	@Override
	public void updateSponsorAddressByOrgAddress(Integer entityId, EntitySubOrgInfo orgDetails) {
		EntitySponsorInfo sponsorInfo = sponsorDAO.findByEntityId(entityId);
		if (orgDetails != null) {
			sponsorInfo.setPrimaryAddressLine1(orgDetails.getPrimaryAddressLine1());
			sponsorInfo.setPrimaryAddressLine2(orgDetails.getPrimaryAddressLine2());
			sponsorInfo.setState(orgDetails.getState());
			sponsorInfo.setCity(orgDetails.getCity());
			sponsorInfo.setPostCode(orgDetails.getPostCode());
			sponsorInfo.setCountryCode(orgDetails.getCountryCode());
		}
	}
}
