package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import com.polus.core.pojo.Country;
import com.polus.fibicomp.globalentity.dao.SponsorDAO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import com.polus.fibicomp.globalentity.repository.EntitySponsorInfoRepository;
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
import com.polus.fibicomp.globalentity.dao.SubAwdOrgDAO;
import com.polus.fibicomp.globalentity.dto.SubAwardOrgField;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgDetailsResponseDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;
import com.polus.fibicomp.globalentity.repository.EntityFeedStatusTypeRepository;
import com.polus.fibicomp.globalentity.repository.EntitySubOrgInfoRepository;

import lombok.extern.slf4j.Slf4j;

@Service(value = "subAwardOrganizationService")
@Transactional
@Slf4j
public class SubAwdOrgDetailsServiceImpl implements SubAwdOrgDetailsService {

    @Autowired
    private EntitySubOrgInfoRepository entitySubOrgInfoRepository;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private SubAwdOrgDAO subAwdOrgDAO;

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
    private SponsorDAO sponsorDAO;

    @Autowired
    private SponsorDetailsService sponsorDetailsService;

    private static final String ORGANIZATION_SECTION_CODE = "3";
    private static final String FEED_STATUS_READY_TO_FEED = "2";
    private static final String FEED_STATUS_NOT_READY_TO_FEED = "1";
    private static final String ORGANIZATION_FEED_ACTION_LOG_CODE = "11";

    @Override
    public ResponseEntity<Map<String, Integer>> saveDetails(SubAwdOrgRequestDTO dto) {
        EntitySubOrgInfo entity = mapDTOToEntity(dto);
        int id = subAwdOrgDAO.saveDetails(entity);
        log.info("entitySubOrgInfoId : {}", id);
        return ResponseEntity.ok(Map.of("id", id));
    }

    private EntitySubOrgInfo mapDTOToEntity(SubAwdOrgRequestDTO dto) {
        Map<SubAwardOrgField, Object> subAwardOrgFields = dto.getSubAwardOrgFields();
        EntitySubOrgInfo.EntitySubOrgInfoBuilder entitySubOrgInfo = EntitySubOrgInfo.builder()
                .entityId(dto.getEntityId())
                .updateTimestamp(commonDao.getCurrentTimestamp())
                .updatedBy(AuthenticatedUser.getLoginPersonId());

        subAwardOrgFields.forEach((field, value) -> {
            switch (field) {
                case organizationId:
                    entitySubOrgInfo.organizationId(value != null ? String.valueOf(value) : null);
                    break;
                case organizationTypeCode:
                    entitySubOrgInfo.organizationTypeCode(castToString(value));
                    break;
                case samExpirationDate:
                    entitySubOrgInfo.samExpirationDate(dto.getDateFromMap(field));
                    break;
                case subAwdRiskAssmtDate:
                    entitySubOrgInfo.subAwdRiskAssmtDate(dto.getDateFromMap(field));
                    break;
                case feedStatusCode:
                    entitySubOrgInfo.feedStatusCode(castToString(value));
                    break;
                case organizationName:
                    entitySubOrgInfo.organizationName(castToString(value));
                    break;
                case dunsNumber:
                    entitySubOrgInfo.dunsNumber(castToString(value));
                    break;
                case ueiNumber:
                    entitySubOrgInfo.ueiNumber(castToString(value));
                    break;
                case cageNumber:
                    entitySubOrgInfo.cageNumber(castToString(value));
                    break;
                case primaryAddressLine1:
                    entitySubOrgInfo.primaryAddressLine1(castToString(value));
                    break;
                case primaryAddressLine2:
                    entitySubOrgInfo.primaryAddressLine2(castToString(value));
                    break;
                case city:
                    entitySubOrgInfo.city(castToString(value));
                    break;
                case state:
                    entitySubOrgInfo.state(castToString(value));
                    break;
                case postCode:
                    entitySubOrgInfo.postCode(castToString(value));
                    break;
                case countryCode:
                    entitySubOrgInfo.countryCode(castToString(value));
                    break;
                case emailAddress:
                    entitySubOrgInfo.emailAddress(castToString(value));
                    break;
                case phoneNumber:
                    entitySubOrgInfo.phoneNumber(castToString(value));
                    break;
                case humanSubAssurance:
                    entitySubOrgInfo.humanSubAssurance(castToString(value));
                    break;
                case animalWelfareAssurance:
                    entitySubOrgInfo.animalWelfareAssurance(castToString(value));
                    break;
                case animalAccreditation:
                    entitySubOrgInfo.animalAccreditation(castToString(value));
                    break;
                case congressionalDistrict:
                    entitySubOrgInfo.congressionalDistrict(castToString(value));
                    break;
                case incorporatedIn:
                    entitySubOrgInfo.incorporatedIn(castToString(value));
                    break;
                case incorporatedDate:
                    entitySubOrgInfo.incorporatedDate(castToString(value));
                    break;
                case numberOfEmployees:
                    entitySubOrgInfo.numberOfEmployees(castToInteger(value));
                    break;
                case federalEmployerId:
                    entitySubOrgInfo.federalEmployerId(castToString(value));
                    break;
                case isCopy:
                    entitySubOrgInfo.isCopy(castToBoolean(value));
                    break;
                case rolodexId:
                    entitySubOrgInfo.rolodexId(castToInteger(value));
                    break;
            }
        });

        return entitySubOrgInfo.build();
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
    public ResponseEntity<String> updateDetails(SubAwdOrgRequestDTO dto) {
        if (dto.getSubAwardOrgFields().get(SubAwardOrgField.feedStatusCode) != null) {
            EntitySubOrgInfo orgInfo = entitySubOrgInfoRepository.findByEntityId(dto.getEntityId());
            if (orgInfo.getEntityFeedStatusType() == null
                    || !feedStatusRepository.getDescriptionByCode(FEED_STATUS_READY_TO_FEED).equals(orgInfo.getEntityFeedStatusType().getDescription())) {
                ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(dto.getEntityId())
                        .oldFeedStatus(orgInfo.getEntityFeedStatusType() == null
                                ? feedStatusRepository.getDescriptionByCode(FEED_STATUS_NOT_READY_TO_FEED)
                                : orgInfo.getEntityFeedStatusType().getDescription())
                        .newFeedStatus(feedStatusRepository.getDescriptionByCode(FEED_STATUS_READY_TO_FEED)).build();
                actionLogService.saveEntityActionLog(ORGANIZATION_FEED_ACTION_LOG_CODE, logDTO, null);
            }
        }
        subAwdOrgDAO.updateDetails(dto);
        if (dto.getIsChangeInAddress() != null && dto.getIsChangeInAddress()) {
            sponsorDetailsService.updateSponsorAddressByOrgAddress(dto.getEntityId(), subAwdOrgDAO.findByEntityId(dto.getEntityId()));
        }
        return new ResponseEntity<>(commonDao.convertObjectToJSON("Sub Award Organization details updated successfully"), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<SubAwdOrgResponseDTO> fetchDetails(Integer entityId) {
        SubAwdOrgDetailsResponseDTO subAwdOrgDetailsResponseDTOs = mapEntityToDTO(subAwdOrgDAO.findByEntityId(entityId));
        subAwdOrgDetailsResponseDTOs.setTranslatedName(sponsorDAO.findTranslatedNameByEntityId(entityId));
        List<EntityRisk> entityRisks = entityRiskDAO.findSubAwdOrgRiskByEntityId(entityId);
        List<EntityAttachmentResponseDTO> attachments = entityFileAttachmentService.getAttachmentsBySectionCode(ORGANIZATION_SECTION_CODE, entityId);
        return new ResponseEntity<>(
                SubAwdOrgResponseDTO.builder().subAwdOrgDetailsResponseDTO(subAwdOrgDetailsResponseDTOs).entityRisks(entityRisks).attachments(attachments)
                        .build(),
                HttpStatus.OK);
    }

    private SubAwdOrgDetailsResponseDTO mapEntityToDTO(EntitySubOrgInfo entitySubOrgInfos) {
        if (entitySubOrgInfos != null) {
            return SubAwdOrgDetailsResponseDTO.builder().entityId(entitySubOrgInfos.getEntityId())
                    .id(entitySubOrgInfos.getId())
                    .organizationId(entitySubOrgInfos.getOrganizationId())
                    .entityOrganizationType(entitySubOrgInfos.getEntityOrganizationType())
                    .samExpirationDate(entitySubOrgInfos.getSamExpirationDate())
                    .subAwdRiskAssmtDate(entitySubOrgInfos.getSubAwdRiskAssmtDate())
                    .organizationName(entitySubOrgInfos.getOrganizationName())
                    .dunsNumber(entitySubOrgInfos.getDunsNumber())
                    .ueiNumber(entitySubOrgInfos.getUeiNumber())
                    .cageNumber(entitySubOrgInfos.getCageNumber())
                    .primaryAddressLine1(entitySubOrgInfos.getPrimaryAddressLine1())
                    .primaryAddressLine2(entitySubOrgInfos.getPrimaryAddressLine2())
                    .city(entitySubOrgInfos.getCity())
                    .state(entitySubOrgInfos.getState())
                    .postCode(entitySubOrgInfos.getPostCode())
                    .countryCode(entitySubOrgInfos.getCountryCode())
                    .country(entitySubOrgInfos.getCountry())
                    .emailAddress(entitySubOrgInfos.getEmailAddress())
                    .phoneNumber(entitySubOrgInfos.getPhoneNumber())
                    .humanSubAssurance(entitySubOrgInfos.getHumanSubAssurance())
                    .animalAccreditation(entitySubOrgInfos.getAnimalAccreditation())
                    .animalWelfareAssurance(entitySubOrgInfos.getAnimalWelfareAssurance())
                    .congressionalDistrict(entitySubOrgInfos.getCongressionalDistrict())
                    .incorporatedDate(entitySubOrgInfos.getIncorporatedDate())
                    .incorporatedIn(entitySubOrgInfos.getIncorporatedIn())
                    .numberOfEmployees(entitySubOrgInfos.getNumberOfEmployees())
                    .federalEmployerId(entitySubOrgInfos.getFederalEmployerId())
                    .isCopy(entitySubOrgInfos.getIsCopy())
                    .stateDetails(entitySubOrgInfos.getStateDetails())
                    .isCreatedFromImportEntity(entitySubOrgInfos.getIsCreatedFromImportEntity())
                    .build();
        } else {
            return null;
        }
    }

    @Override
    public ResponseEntity<String> deleteDetails(Integer id) {
        entitySubOrgInfoRepository.deleteByEntitySubOrgInfoId(id);
        return new ResponseEntity<>(commonDao.convertObjectToJSON("Sub Award Organization details deleted successfully"), HttpStatus.OK);
    }

    @Override
    public void saveCopyFromEntity(Entity entity) {
        EntitySubOrgInfo entitySubOrgInfo = new EntitySubOrgInfo();
        BeanUtils.copyProperties(entity, entitySubOrgInfo);
        entitySubOrgInfo.setEntityId(entity.getEntityId());
        entitySubOrgInfo.setIsCopy(Boolean.TRUE);
        setAwdOrdDetails(entitySubOrgInfo, entity);
        subAwdOrgDAO.saveDetails(entitySubOrgInfo);
    }

    @Override
    public void updateCopyFromEntity(Entity entity) {
        EntitySubOrgInfo orgDetails = entitySubOrgInfoRepository.findByEntityId(entity.getEntityId());
        if (orgDetails == null) {
            orgDetails = new EntitySubOrgInfo();
        }
        if (orgDetails.getIsCopy() != null && orgDetails.getIsCopy()) {
            BeanUtils.copyProperties(entity, orgDetails,  "updateTimestamp", "updatedBy", "comments", "rolodexId");
            setAwdOrdDetails(orgDetails, entity);
            updateOrgAddressDetailsBySponAddDetails(entity.getEntityId(), orgDetails);
        }
    }

    @Override
    public void updateCopyFromEntity(Integer entityId) {
        Entity entity = globalEntityRepository.findByEntityId(entityId);
        EntitySubOrgInfo orgDetails = entitySubOrgInfoRepository.findByEntityId(entityId);
        if (orgDetails == null) {
            orgDetails = new EntitySubOrgInfo();
        }
        BeanUtils.copyProperties(entity, orgDetails, "updateTimestamp", "updatedBy", "comments", "rolodexId");
        orgDetails.setIsCopy(Boolean.TRUE);
        setAwdOrdDetails(orgDetails, entity);
        updateOrgAddressDetailsBySponAddDetails(entityId, orgDetails);
        if (orgDetails.getId() == null) {
            subAwdOrgDAO.saveDetails(orgDetails);
        }
    }

    private void updateOrgAddressDetailsBySponAddDetails(Integer entityId, EntitySubOrgInfo orgDetails) {
        EntitySponsorInfo sponsorInfo = sponsorDAO.findByEntityId(entityId);
        if (sponsorInfo != null) {
            orgDetails.setPrimaryAddressLine1(sponsorInfo.getPrimaryAddressLine1());
            orgDetails.setPrimaryAddressLine2(sponsorInfo.getPrimaryAddressLine2());
            orgDetails.setState(sponsorInfo.getState());
            orgDetails.setCity(sponsorInfo.getCity());
            orgDetails.setPostCode(sponsorInfo.getPostCode());
            orgDetails.setCountryCode(sponsorInfo.getCountryCode());
        }
    }

    private void setAwdOrdDetails(EntitySubOrgInfo orgDetails, Entity entity) {
        orgDetails.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        orgDetails.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        orgDetails.setOrganizationName(entity.getEntityName());
        orgDetails.setEmailAddress(entity.getCertifiedEmail());
        orgDetails.setAnimalWelfareAssurance(entity.getAnumalWelfareAssurance());
        orgDetails.setIncorporatedDate(entity.getIncorporationDate());
        orgDetails.setIncorporatedIn(entity.getIncorporatedIn());
    }

    @Override
    public void updateOrgAddressBySponAddress(Integer entityId, EntitySponsorInfo sponsorInfo) {
        EntitySubOrgInfo orgDetails = subAwdOrgDAO.findByEntityId(entityId);
        if (orgDetails != null) {
            orgDetails.setPrimaryAddressLine1(sponsorInfo.getPrimaryAddressLine1());
            orgDetails.setPrimaryAddressLine2(sponsorInfo.getPrimaryAddressLine2());
            orgDetails.setState(sponsorInfo.getState());
            orgDetails.setCity(sponsorInfo.getCity());
            orgDetails.setPostCode(sponsorInfo.getPostCode());
            orgDetails.setCountryCode(sponsorInfo.getCountryCode());
        }
    }
}
