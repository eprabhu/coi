package com.polus.integration.entity.cleansematch.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.client.FcoiFeignClient;
import com.polus.integration.client.exceptionHandler.FeignException;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.cleansematch.constants.Constants;
import com.polus.integration.entity.cleansematch.dao.EntityCleanUpDao;
import com.polus.integration.entity.cleansematch.dao.EntityCleanseMatchDAO;
import com.polus.integration.entity.cleansematch.dto.*;
import com.polus.integration.entity.cleansematch.entity.Country;
import com.polus.integration.entity.cleansematch.entity.EntityOwnershipType;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminActionType;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminReviewStatusType;
import com.polus.integration.entity.cleansematch.entity.EntityStageBatch;
import com.polus.integration.entity.cleansematch.entity.EntityStageDetails;
import com.polus.integration.entity.cleansematch.repositories.CountryRepository;
import com.polus.integration.entity.cleansematch.repositories.EntityOwnershipTypeRepository;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;
import com.polus.integration.entity.enrich.service.EntityEnrichService;
import com.polus.integration.pojo.State;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class EntityCleanUpServiceImpl implements EntityCleanUpService {

    @Autowired
    private EntityCleanUpDao entityCleanUpDao;

    @Autowired
    private FcoiFeignClient fcoiFeignClient;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private EntityEnrichService entityEnrichService;

    @Autowired
    private EntityOwnershipTypeRepository ownershipTypeRepository;

    @Autowired
    private EntityCleanseMatchDAO entityCleanseMatchDAO;

    @Autowired
    private EntityCriteriaSearchService searchService;

    private static final Integer ADMIN_REVIEW_STATUS_PROCESSING = 4;

    private Instant startTime;

    private Instant endTime;

    private boolean isProcessing = false;

    private AtomicInteger totalRecords = new AtomicInteger(0);

    private AtomicInteger processedRecords = new AtomicInteger(0);

    @Override
    public ResponseEntity<Object> getEntityCleanUpBatches(EntityCleanUpDto entityCleanUpDto) {
        List<EntityStageBatch> entityStageBatches = entityCleanUpDao.getEntityCleanUpBatches(entityCleanUpDto);
        return new ResponseEntity<>(entityStageBatches, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getEntityCleanUpBatchDetails(EntityCleanUpDto entityCleanUpDto) {
        Map<String, CountryDto> countryDataList = new HashMap<>();
        List<EntityStageDetailsDto> entityStageDetails = new ArrayList<>();
        entityCleanUpDao.getEntityCleanUpBatchDetails(entityCleanUpDto).forEach(entityStageDetail -> {
            EntityStageDetailsDto entityStageDetailsDto = EntityStageDetailsDto.builder().build();
            BeanUtils.copyProperties(entityStageDetail, entityStageDetailsDto);
            if (entityStageDetail.getMatchStatusCode() != null && entityStageDetail.getMatchStatusCode().equals(Constants.ENTITY_MATCH_STATUS_EXACT_MATCH)) {
                entityStageDetailsDto.setIsExactDunsMatch(Boolean.TRUE);
            } else if (entityStageDetail.getMatchStatusCode() != null && entityStageDetail.getMatchStatusCode().equals(Constants.ENTITY_MATCH_STATUS_MULTIPLE_MATCH)) {
                entityStageDetailsDto.setIsMultipleDunsMatch(Boolean.TRUE);
            } else if (entityStageDetail.getMatchStatusCode() != null && entityStageDetail.getMatchStatusCode().equals(Constants.ENTITY_MATCH_STATUS_NO_MATCH)) {
                entityStageDetailsDto.setIsNoDunsMatch(Boolean.TRUE);
            }
            if (entityStageDetail.getIsDuplicateInSrc() != null && entityStageDetail.getGroupNumber() != null && entityStageDetail.getIsDuplicateInSrc()) {
                entityStageDetailsDto.setIsDuplicateInBatch(Boolean.TRUE);
            }
            if (entityStageDetail.getIsSystemDuplicate() != null && entityStageDetail.getEntityId() != null && entityStageDetail.getIsSystemDuplicate()) {
                entityStageDetailsDto.setIsDuplicateInEntitySys(Boolean.TRUE);
            }
            CountryDto countryDto = getCountryDetails(entityStageDetail.getSrcCountryCode(), countryDataList);
            entityStageDetailsDto.setSrcCountry(countryDto);
            entityStageDetailsDto.setSrcCountryCode(countryDto != null ? countryDto.getCountryCode() : null);
            State stateDetail = entityCleanUpDao.findStateByStateCodeCountryCode(countryDto != null ? countryDto.getCountryCode() : null, entityStageDetail.getSrcState());
            entityStageDetailsDto.setSrcState(stateDetail != null ? stateDetail.getStateName()
                    : entityStageDetail.getSrcState());
            entityStageDetailsDto.setSrcStateCode(stateDetail != null ? stateDetail.getStateCode()
                    : entityStageDetail.getSrcState());
            entityStageDetails.add(entityStageDetailsDto);
        });
        Map<String, Object> response = new HashMap<>();
        response.put("batchDetail", entityCleanUpDao.getEntityCleanUpBatch(entityCleanUpDto.getBatchId()));
        response.put("batchEntityDetails", entityStageDetails);
        response.put("batchEntityDetailsCount", entityCleanUpDao.getEntityCleanUpBatchDetailsCount(entityCleanUpDto));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private CountryDto getCountryDetails(String countryCode, Map<String, CountryDto> countryDataList) {
        CountryDto countryDto = null;
        if (countryCode != null && (countryDataList.isEmpty() || !countryDataList.containsKey(countryCode))) {
            Country country = countryRepository.findByCountryTwoCode(countryCode);
            if (country != null) {
                countryDto = CountryDto.builder()
                        .countryCode(country.getCountryCode())
                        .countryName(country.getCountryName())
                        .build();
                countryDataList.put(countryCode, countryDto);
            }
        } else if (countryCode != null && countryDataList.containsKey(countryCode)) {
            countryDto = countryDataList.get(countryCode);
        }
        return countryDto;
    }

    @Override
    public ResponseEntity<Object> getEntityCleanUpEntityDetail(Integer entityStageDetailId) {
        List<EntityStageDetailsDto> entityStageDetailsDtos = new ArrayList<>();
        Map<String, CountryDto> countryDataList = new HashMap<>();
        entityCleanUpDao.getEntityDetailsByGroupNumber(entityStageDetailId).forEach(entityStageDetailObj -> {
            EntityStageDetailsDto entityStageDetailsDto = EntityStageDetailsDto.builder().build();
            BeanUtils.copyProperties(entityStageDetailObj, entityStageDetailsDto);
            CountryDto countryDto = getCountryDetails(entityStageDetailObj.getSrcCountryCode(), countryDataList);
            entityStageDetailsDto.setSrcCountry(countryDto);
            entityStageDetailsDtos.add(entityStageDetailsDto);
        });
        return new ResponseEntity<>(entityStageDetailsDtos, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> updateEntityDetails(EntityCleanUpDto entityCleanUpDto, HttpServletRequest request) {
		if (!Objects.equals(entityCleanUpDao.getAdminActionCode(entityCleanUpDto.getEntityStageDetailId()),
				entityCleanUpDto.getAdminActionCode())
				&& !ADMIN_REVIEW_STATUS_PROCESSING.equals(entityCleanUpDao.getAdminReviewCode(entityCleanUpDto.getEntityStageDetailId()))) {
			return new ResponseEntity<>("Document state changed", HttpStatus.METHOD_NOT_ALLOWED);
		}
        if (entityCleanUpDto.getOriginalEntityDetailId() != null) {
            entityCleanUpDao.updateAdminActionStatus(entityCleanUpDto.getOriginalEntityDetailId(), null, null,
                    Constants.ADMIN_ACTION_STATUS_SOURCE_SELECTED, Constants.ADMIN_REVIEW_STATUS_PENDING);
        }
        if (entityCleanUpDto.getDuplicateEntityDetailId() != null && (entityCleanUpDto.getAdminReviewStatusCode() == null || !entityCleanUpDto.getAdminReviewStatusCode().equals(Constants.ADMIN_ACTION_STATUS_SOURCE_SELECTED))) {
            if (!entityCleanUpDto.getCanReReview() && entityCleanUpDao.isEntityAdminActionAlreadyDone(entityCleanUpDto.getDuplicateEntityDetailId(), Arrays.asList(
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED, Constants.ADMIN_ACTION_STATUS_MARK_EXCLUDE,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED))) {
                return new ResponseEntity<>("Duplicate Action Already done", HttpStatus.METHOD_NOT_ALLOWED);
            }
            entityCleanUpDao.resetOriginEntityDetail(entityCleanUpDto.getDuplicateEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId());
            entityCleanUpDao.updateAdminActionStatus(entityCleanUpDto.getDuplicateEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId(), null,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED, Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        } else if(entityCleanUpDto.getDuplicateEntityDetailId() != null && (entityCleanUpDto.getAdminReviewStatusCode() != null && entityCleanUpDto.getAdminReviewStatusCode().equals(Constants.ADMIN_ACTION_STATUS_SOURCE_SELECTED))) {
            entityCleanUpDao.resetOriginEntityDetail(entityCleanUpDto.getDuplicateEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId());
            entityCleanUpDao.updateAdminActionStatus(entityCleanUpDto.getDuplicateEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId(), null,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED, Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        }
        if (entityCleanUpDto.getExcludedEntityDetailId() != null && entityCleanUpDto.getEntityId() == null) {
            if (!entityCleanUpDto.getCanReReview() && entityCleanUpDao.isEntityAdminActionAlreadyDone(entityCleanUpDto.getExcludedEntityDetailId(), Arrays.asList(
                    Constants.ADMIN_ACTION_STATUS_MARK_EXCLUDE,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED))) {
                return new ResponseEntity<>("Exclude Action Already done", HttpStatus.METHOD_NOT_ALLOWED);
            }
            entityCleanUpDao.resetOriginEntityDetail(entityCleanUpDto.getExcludedEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId());
            entityCleanUpDao.updateAdminActionStatus(entityCleanUpDto.getExcludedEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId(), null,
                    entityCleanUpDto.getOriginalEntityDetailId() == null ? Constants.ADMIN_ACTION_STATUS_MARK_EXCLUDE : Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                    Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        } else if (entityCleanUpDto.getExcludedEntityDetailId() != null) {
            if (!entityCleanUpDto.getCanReReview() && entityCleanUpDao.isEntityAdminActionAlreadyDone(entityCleanUpDto.getExcludedEntityDetailId(), Arrays.asList(
                    Constants.ADMIN_ACTION_STATUS_MARK_EXCLUDE, Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED))) {
                return new ResponseEntity<>("Exclude Action Already done", HttpStatus.METHOD_NOT_ALLOWED);
            }
            entityCleanUpDao.resetOriginEntityDetail(entityCleanUpDto.getExcludedEntityDetailId(), entityCleanUpDto.getOriginalEntityDetailId());
            entityCleanUpDao.updateAdminActionStatus(entityCleanUpDto.getExcludedEntityDetailId(), null, entityCleanUpDto.getEntityId(),
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Constants.ADMIN_REVIEW_STATUS_COMPLETED);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
        }
        entityCleanUpDao.updateBatchCompletionStatus(entityCleanUpDto.getBatchId());
        if (entityCleanUpDto.getEntityId() != null && entityCleanUpDto.getDuplicateEntityDetailId() != null) {
            saveEntityExternalReference(entityCleanUpDto, request);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.FALSE);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.FALSE);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
            entityCleanUpDao.updateGroupChildAdminAction(entityCleanUpDto.getDuplicateEntityDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                    Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
            updateEntitySponsorOrgDetails(entityCleanUpDto, entityCleanUpDto.getEntityId(), request);
        }
            return new ResponseEntity<>(HttpStatus.OK);
    }

    private void updateEntitySponsorOrgDetails(EntityCleanUpDto entityCleanUpDto, Integer entityId, HttpServletRequest request) {
        CoiEntityFeedRequestDto coiEntityRequestDTO = CoiEntityFeedRequestDto.builder().build();
        EntityStageDetails entDetailObj = entityCleanUpDao.getEntityCleanUpEntityDetail(entityCleanUpDto.getDuplicateEntityDetailId());
        if (entDetailObj.getBatch().getBatchSrcTypeCode().equals(Constants.BATCH_SRC_TYPE_SPONSOR)) {
            setSponsorDetails(entDetailObj, coiEntityRequestDTO);
            coiEntityRequestDTO.getEntitySponsor().setEntityId(entityId);
        } else {
            setOrganizationDetails(entDetailObj, coiEntityRequestDTO);
            coiEntityRequestDTO.getEntitySubAward().setEntityId(entityId);
        }
        setEntityAdditionalAddress(entDetailObj, coiEntityRequestDTO);
        setEntityRisk(entDetailObj, coiEntityRequestDTO);
        coiEntityRequestDTO.getAdditionalAddress().setEntityId(entityId);
        fcoiFeignClient.updateEntitySponsorOrgDetailsFromFeed(coiEntityRequestDTO, getCookie(request.getCookies()));
    }

    private void saveEntityExternalReference(EntityCleanUpDto entityCleanUpDto, HttpServletRequest request) {
        List<EntityStageDetails> entDetailObjs = new ArrayList<>();
        entDetailObjs.add(entityCleanUpDao.getEntityCleanUpEntityDetail(entityCleanUpDto.getDuplicateEntityDetailId()));
        List<EntityStageDetails> externalReferences = entityCleanUpDao.getEntityDetailExternalReferences(entityCleanUpDto.getDuplicateEntityDetailId());
        if (externalReferences != null && !externalReferences.isEmpty()) {
            entDetailObjs.addAll(externalReferences);
        }
        for(EntityStageDetails entDetailObj : entDetailObjs) {
            fcoiFeignClient.saveExternalReference(ExternalReferenceRequestDTO.builder()
                    .sponsorCode(Constants.BATCH_SRC_TYPE_SPONSOR.equals(entDetailObj.getBatch().getBatchSrcTypeCode()) ? entDetailObj.getSrcDataCode() : null)
                    .organizationId(Constants.BATCH_SRC_TYPE_ORGANIZATION.equals(entDetailObj.getBatch().getBatchSrcTypeCode()) && entDetailObj.getSrcDataCode() != null ?
                           entDetailObj.getSrcDataCode() : null)
                    .description(entDetailObj.getSrcDataName())
                    .externalIdTypeCode(Constants.BATCH_SRC_TYPE_SPONSOR.equals(entDetailObj.getBatch().getBatchSrcTypeCode()) ?
                            Constants.EXTERNAL_REF_TYPE_SPONSOR : Constants.EXTERNAL_REF_TYPE_ORGANIZATION)
                    .externalId(entDetailObj.getSrcDataCode())
                    .entityId(entityCleanUpDto.getEntityId())
                    .build(), getCookie(request.getCookies()));
        }
    }

    @Override
    public ResponseEntity<Object> getEntityDunsMatches(Integer entityStageDetailId) {
        EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailId);
        if (entityStageDetail.getDunsMatchedResults() == null) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
        return new ResponseEntity<>(extractDunsDetails(entityStageDetail), HttpStatus.OK);
    }

    private List<DunsMatchDetails> extractDunsDetails(EntityStageDetails entityStageDetail) {
        List<DunsMatchDetails> dunsMatchDetails = new ArrayList<>();
        List<EntityOwnershipType> entityOwnershipTypes = ownershipTypeRepository.findAll();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode rootArray = objectMapper.readTree(entityStageDetail.getDunsMatchedResults());
            for (JsonNode root : rootArray) {
                DunsMatchDetails dunsMatchDetail = DunsMatchDetails.builder().build();
                JsonNode organizationNode = root.path("organization");
                if (!organizationNode.isMissingNode()) {
                    dunsMatchDetail.setEntityName(organizationNode.path("primaryName").asText(null));
                    dunsMatchDetail.setDunsNumber(organizationNode.path("duns").asText(null));
                    dunsMatchDetail.setPrimaryAddressLine1(organizationNode.path("primaryAddress").path("streetAddress").path("line1").asText(null));
                    dunsMatchDetail.setPrimaryAddressLine2(organizationNode.path("primaryAddress").path("streetAddress").path("line2").asText(null));
                    dunsMatchDetail.setState(organizationNode.path("primaryAddress").path("addressRegion").path("name").asText(null));
                    dunsMatchDetail.setStateCode(organizationNode.path("primaryAddress").path("addressRegion").path("abbreviatedName").asText(null));
                    dunsMatchDetail.setCity(organizationNode.path("primaryAddress").path("addressLocality").path("name").asText(null));
                    dunsMatchDetail.setPostCode(organizationNode.path("primaryAddress").path("postalCode").asText(null));
                    dunsMatchDetail.setCountryCode(organizationNode.path("primaryAddress").path("addressCountry").path("isoAlpha2Code").asText(null));
                    dunsMatchDetail.setCountry(organizationNode.path("primaryAddress").path("addressCountry").path("name").asText(null));
                    dunsMatchDetail.setConfidenceScore(root.path("matchQualityInformation").path("confidenceCode").asText(null));
                    dunsMatchDetail.setOwnershipType(organizationNode.path("publiclyTradedCompany").asBoolean(false) ?
                            entityOwnershipTypes.stream().filter(entityOwnershipType -> entityOwnershipType.getOwnershipTypeCode().equals("1")).findFirst().get().getDescription() :
                            entityOwnershipTypes.stream().filter(entityOwnershipType -> entityOwnershipType.getOwnershipTypeCode().equals("2")).findFirst().get().getDescription());
                    dunsMatchDetail.setOwnershipTypeCode(organizationNode.path("publiclyTradedCompany").asBoolean(false) ?
                            entityOwnershipTypes.stream().filter(entityOwnershipType -> entityOwnershipType.getOwnershipTypeCode().equals("1")).findFirst().get().getOwnershipTypeCode() :
                            entityOwnershipTypes.stream().filter(entityOwnershipType -> entityOwnershipType.getOwnershipTypeCode().equals("2")).findFirst().get().getOwnershipTypeCode());
                    DnBCriteriaSearchAPIResponse result = searchService.fetchSearchResult(Arrays.asList(dunsMatchDetail.getDunsNumber()));
                    var searchResult = result.getSearchCandidates();
                    if (searchResult != null) {
                        Map<String, DnBOrganizationDetails> dunsOrganizationMapFromSearchAPI =
                                searchResult.stream()
                                        .map(row -> row.getOrganization())
                                        .collect(Collectors.toMap(DnBOrganizationDetails::getDuns, org -> org));
                        DnBOrganizationDetails dunsOrganization = dunsOrganizationMapFromSearchAPI.get(dunsMatchDetail.getDunsNumber());
                        dunsMatchDetail.setCorporateLinkage(dunsOrganization.getCorporateLinkage());
                        dunsMatchDetail.setBusinessEntityType(dunsOrganization.getBusinessEntityType());
                        dunsMatchDetail.setMailingAddress(dunsOrganization.getMailingAddress());
                    }
                    if (dunsMatchDetail.getDunsNumber() != null) {
                        EntityInfoDTO entityInfo = entityCleanseMatchDAO.getEntityInfoByDUNS(dunsMatchDetail.getDunsNumber(), null);
                        dunsMatchDetail.setEntityDetails(entityInfo);
                    }
                    dunsMatchDetails.add(dunsMatchDetail);
                    if(dunsMatchDetail.getCountryCode() != null) {
                        Country country = countryRepository.findByCountryTwoCode(dunsMatchDetail.getCountryCode());
                        if (country != null) {
                            dunsMatchDetail.setCountryCode(country.getCountryCode());
                        }
                        if (dunsMatchDetail.getStateCode() != null) {
                            dunsMatchDetail.setStateCode(getStateCode(dunsMatchDetail.getCountryCode(), dunsMatchDetail.getStateCode()));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Exception on extractDunsDetails : {}", e.getMessage());
            throw new RuntimeException(e);
        }
        return dunsMatchDetails;
    }

    @Override
    public ResponseEntity<Object> getEntityCleanUpLookups() {
        List<EntityStageAdminReviewStatusType> adminReviewStatusTypes = entityCleanUpDao.getAdminReviewStatusTypes();
        List<EntityStageAdminActionType> adminActionTypes = entityCleanUpDao.getAdminActionTypes();
        return new ResponseEntity<>(EntityCleanUpLookups.builder()
                .adminActionTypes(adminActionTypes)
                .adminReviewStatusTypes(adminReviewStatusTypes)
                .build(), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getEntitySystemMatches(Integer entityStageDetailId) {
        try {
            EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailId);
            ValidateDuplicateRequestDTO validateRequest = ValidateDuplicateRequestDTO.builder()
                    .countryCode(entityStageDetail.getSrcCountryCode() != null && !entityStageDetail.getSrcCountryCode().isEmpty()?
                            getCountryDetails(entityStageDetail.getSrcCountryCode(), new HashMap<>()).getCountryCode() : null)
                    .entityName(entityStageDetail.getSrcDataName())
                    .primaryAddressLine1(entityStageDetail.getSrcAddressLine1())
                    .primaryAddressLine2(entityStageDetail.getSrcAddressLine2())
                    .dunsNumber(entityStageDetail.getSrcDunsNumber())
                    .ueiNumber(entityStageDetail.getSrcUei())
                    .cageNumber(entityStageDetail.getSrcCageNumber())
                    .build();
            ResponseEntity<List<validateDuplicateResponseDTO>> validateResponse = fcoiFeignClient.validateDuplicate(validateRequest);
            List<CoiEntityDto> coiEntityDtos = new ArrayList<>();
            List<String> validatedEntityDunsNos = new ArrayList<>();
            if (validateResponse != null && validateResponse.getBody() != null) {
                validateResponse.getBody().forEach(validatedObj -> {
                    CoiEntityDto coiEntityDto = CoiEntityDto.builder().build();
                    BeanUtils.copyProperties(validatedObj, coiEntityDto);
                    coiEntityDto.setPostCode(validatedObj.getPostalCode());
                    if (validatedObj.getCountry() != null) {
                        CountryDto countryDto = CountryDto.builder()
                                .countryName(validatedObj.getCountry().getCountryName())
                                .countryCode(validatedObj.getCountry().getCountryCode())
                                .build();
                        coiEntityDto.setCountry(countryDto);
                    }
                    if (coiEntityDto.getDunsNumber() != null) {
                        validatedEntityDunsNos.add(coiEntityDto.getDunsNumber());
                    }
                    coiEntityDto.setEntityOwnershipType(CoiEntityOwnershipTypeDto.builder().description(validatedObj.getOwnershipType()).build());
                    coiEntityDtos.add(coiEntityDto);
                });
            }
            List<CoiEntityDto>  dunsEntityDetails = getDunsEntities(entityStageDetail, validatedEntityDunsNos);
            if (dunsEntityDetails != null && !dunsEntityDetails.isEmpty()) {
                coiEntityDtos.addAll(dunsEntityDetails);
            }
            return new ResponseEntity<>(coiEntityDtos, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Exception on getEntitySystemMatches {}", e.getMessage());
            throw e;
        }
    }

    private List<CoiEntityDto> getDunsEntities(EntityStageDetails entityStageDetail, List<String> validatedEntityDunsNos) {
        List<CoiEntityDto> entityList = new ArrayList<>();
        try {
            List<String> dunsNumbers = new ArrayList<>();
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootArray = objectMapper.readTree(entityStageDetail.getDunsMatchedResults());
            for (JsonNode root : rootArray) {
                JsonNode organizationNode = root.path("organization");
                if (!organizationNode.isMissingNode()) {
                    String dunsNumber = organizationNode.path("duns").asText(null);
                    if (dunsNumber != null && !validatedEntityDunsNos.contains(dunsNumber)) {
                        dunsNumbers.add(dunsNumber);
                    }
                }
            }
            entityCleanUpDao.getEntityIdsByDunsNumber(dunsNumbers).forEach(entityId -> {
                EntityResponseDTO entityResponseDTO = fcoiFeignClient.fetchEntityDetails(entityId).getBody();
                CoiEntityDto coiEntityDto = CoiEntityDto.builder().build();
                BeanUtils.copyProperties(entityResponseDTO.getEntityDetails(), coiEntityDto);
                coiEntityDto.setOrganizationId(entityResponseDTO.getOrganizationId() != null ? entityResponseDTO.getOrganizationId() : null);
                coiEntityDto.setSponsorCode(entityResponseDTO.getSponsorCode() != null ? entityResponseDTO.getSponsorCode() : null);
                coiEntityDto.setForeignNames(entityResponseDTO.getForeignNames());
                coiEntityDto.setState(entityResponseDTO.getEntityDetails().getStateDetails() != null ? entityResponseDTO.getEntityDetails().getStateDetails().getStateName() :
                entityResponseDTO.getEntityDetails().getState());
                entityList.add(coiEntityDto);
            });
        } catch (Exception e) {
            log.info("Exception while fetching duns entity details");
        }
        return entityList;
    }

    @Override
    public ResponseEntity<Object> createEntity(EntityStageDetailsDto entityStageDetailsDto, HttpServletRequest request) {
		if (!Objects.equals(entityCleanUpDao.getAdminActionCode(entityStageDetailsDto.getEntityStageDetailId()), entityStageDetailsDto.getAdminActionCode())
				&& !ADMIN_REVIEW_STATUS_PROCESSING.equals(entityCleanUpDao.getAdminReviewCode(entityStageDetailsDto.getEntityStageDetailId()))) {
			return new ResponseEntity<>("Document state changed", HttpStatus.METHOD_NOT_ALLOWED);
		}
        try {
            EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailsDto.getEntityStageDetailId());
            CoiEntityResponseDto entity = createCoiEntity(entityStageDetailsDto, entityStageDetail, request.getCookies());
            if (entity.getEntityId() != null) {
                entityCleanUpDao.updateEntityDetailsWithSysEntity(entity.getEntityId(), entityStageDetail.getEntityStageDetailId(),
                        entity.getIsErrorInEnrichProcess() ? Constants.ADMIN_REVIEW_STATUS_ERROR_ENRICH_VERIFY_PROCESS :
                                Constants.ADMIN_REVIEW_STATUS_COMPLETED, (entityStageDetailsDto.getCreateWithDuns() != null && entityStageDetailsDto.getCreateWithDuns())?
                    Constants.ADMIN_ACTION_STATUS_MATCH_SELECTED : Constants.ADMIN_ACTION_STATUS_WITHOUT_DUNS);
                entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                        Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                        Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);

                entityCleanUpDao.updateBatchCompletionStatus(entityStageDetail.getBatchId());
                syncGraph(entity.getEntityId());
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error("Exception on createEntity : {}", e.getMessage());
            entityCleanUpDao.bulkUpdateAdminReviewStatus(Arrays.asList(entityStageDetailsDto.getEntityStageDetailId()), Constants.ADMIN_REVIEW_STATUS_ERROR_IN_PROCESS);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void syncGraph(Integer entityId) {
    	fcoiFeignClient.syncGraph(entityId);
	}

    private CoiEntityResponseDto createCoiEntity(EntityStageDetailsDto entityStageDetailsDto, EntityStageDetails entityStageDetail, Cookie[] cookies ) throws JsonProcessingException {
        CoiEntityFeedRequestDto entityFeedRequestDto = CoiEntityFeedRequestDto.builder().build();
        CoiEntityResponseDto entityResponseDto = CoiEntityResponseDto.builder().build();
        setEntityFieldDetails(entityStageDetailsDto, entityStageDetail, entityFeedRequestDto);
        if (Constants.BATCH_SRC_TYPE_SPONSOR.equals(entityStageDetail.getBatch().getBatchSrcTypeCode())) {
            setSponsorDetails(entityStageDetail, entityFeedRequestDto);
            if (entityStageDetailsDto.getSrcUei() == null && entityStageDetail.getSrcUei() != null) {
                entityFeedRequestDto.getEntitySponsor().getEntitySponsorFields().put(CoiEntitySponsorField.ueiNumber, entityStageDetail.getSrcUei());
            }
            if (entityStageDetailsDto.getSrcCageNumber() == null && entityStageDetail.getSrcCageNumber() != null) {
                entityFeedRequestDto.getEntitySponsor().getEntitySponsorFields().put(CoiEntitySponsorField.cageNumber, entityStageDetail.getSrcCageNumber());
            }
        } else {
            setOrganizationDetails(entityStageDetail, entityFeedRequestDto);
            if (entityStageDetailsDto.getSrcUei() == null && entityStageDetail.getSrcUei() != null) {
                entityFeedRequestDto.getEntitySubAward().getSubAwardOrgFields().put(CoiSubAwardOrgField.ueiNumber, entityStageDetail.getSrcUei());
            }
            if (entityStageDetailsDto.getSrcCageNumber() == null && entityStageDetail.getSrcCageNumber() != null) {
                entityFeedRequestDto.getEntitySubAward().getSubAwardOrgFields().put(CoiSubAwardOrgField.cageNumber, entityStageDetail.getSrcCageNumber());
            }
        }
        setEntityAdditionalAddress(entityStageDetail, entityFeedRequestDto);
        setEntityExternalReferences(entityStageDetail, entityFeedRequestDto);
        setEntityRisk(entityStageDetail, entityFeedRequestDto);
        try {
            ResponseEntity<Map<String, Integer>> response = fcoiFeignClient.createEntity(entityFeedRequestDto, getCookie(cookies));
            entityResponseDto.setEntityId(response.getBody() != null ? response.getBody().get("entityId") : null);
            entityResponseDto.setIsErrorInEnrichProcess(false);
            entityFeedRequestDto.getEntity().setEntityId(entityResponseDto.getEntityId());
            fcoiFeignClient.verifyEntityFromFeed(entityFeedRequestDto.getEntity(), getCookie(cookies));
        } catch (FeignException e) {
            if (e.getErrorBody() != null && e.getErrorBody().contains("entityId")) {
                entityResponseDto.setIsErrorInEnrichProcess(true);
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Integer> responseData = objectMapper.readValue(e.getErrorBody(), Map.class);
                entityResponseDto.setEntityId(responseData.get("entityId"));
            } else {
                throw e;
            }
        }
        return entityResponseDto;
    }
    private String getCookie(Cookie[] cookies ) {
        if (cookies != null && cookies.length > 0) {
            // Convert cookies to a single string to be passed as a header
            StringBuilder cookieHeader = new StringBuilder();
            for (Cookie cookie : cookies) {
                cookieHeader.append(cookie.getName())
                        .append("=")
                        .append(cookie.getValue())
                        .append("; ");
            }
            return cookieHeader.toString();
        }
        return null;
    }

    private void setEntityRisk(EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        String batchSrcType = entityStageDetail.getBatch().getBatchSrcTypeCode();
        if (entityStageDetail.getSrcRiskLevelCode() == null || entityStageDetail.getSrcRiskLevelCode().isEmpty()) {
            return;
        }
        String entityRiskTypeCode = null;
        if (batchSrcType.equals(Constants.BATCH_SRC_TYPE_ORGANIZATION)) {
            entityRiskTypeCode = Constants.ENTITY_RISK_TYPE_CODE_ORGANIZATION;
        } else {
            return;
        }
        CoiEntityRiskDto entityRiskDto = CoiEntityRiskDto.builder()
                .riskTypeCode(entityRiskTypeCode)
                .riskLevelCode(entityStageDetail.getSrcRiskLevelCode())
                .description("Risk from Import Entity")
                .build();
        entityFeedRequestDto.setEntityRisk(entityRiskDto);
    }

    private void setEntityExternalReferences(EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        List<ExternalReferenceRequestDTO> externalReferences = new ArrayList<>();
        entityCleanUpDao.getEntityDetailExternalReferences(entityStageDetail.getEntityStageDetailId()).forEach(entDetailObj -> {
            externalReferences.add(ExternalReferenceRequestDTO.builder()
                     .sponsorCode(Constants.BATCH_SRC_TYPE_SPONSOR.equals(entityStageDetail.getBatch().getBatchSrcTypeCode()) ? entDetailObj.getSrcDataCode() : null)
                     .organizationId(Constants.BATCH_SRC_TYPE_ORGANIZATION.equals(entityStageDetail.getBatch().getBatchSrcTypeCode()) && entDetailObj.getSrcDataCode() != null ?
                             entDetailObj.getSrcDataCode() : null)
                     .description(entDetailObj.getSrcDataName())
                     .externalIdTypeCode(Constants.BATCH_SRC_TYPE_SPONSOR.equals(entityStageDetail.getBatch().getBatchSrcTypeCode()) ?
                                    Constants.EXTERNAL_REF_TYPE_SPONSOR : Constants.EXTERNAL_REF_TYPE_ORGANIZATION)
                            .externalId(entDetailObj.getSrcDataCode())
                     .build());
        });
        entityFeedRequestDto.setExternalReferences(externalReferences);
    }

    private void setEntityAdditionalAddress(EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        Country country = null;
        if (entityStageDetail.getSrcCountryCode() != null) {
            country = countryRepository.findByCountryTwoCode(entityStageDetail.getSrcCountryCode());
        }
        entityFeedRequestDto.setAdditionalAddress(EntityAddressDetailsRequestDTO.builder()
                .addressTypeCode(entityStageDetail.getBatch()
                        .getBatchSrcTypeCode().equals(Constants.BATCH_SRC_TYPE_SPONSOR) ? Constants.ADDITIONAL_ADDRESS_TYPE_SPONSOR_ADDRESS
                        : Constants.ADDITIONAL_ADDRESS_TYPE_ORGANIZATION_ADDRESS)
                .addressLine1(entityStageDetail.getSrcAddressLine1())
                .addressLine2(entityStageDetail.getSrcAddressLine2())
                .city(entityStageDetail.getSrcCity())
                .state(getStateCode(entityStageDetail.getSrcCountryCode(), entityStageDetail.getSrcState()))
                .postCode(entityStageDetail.getSrcPostalCode())
                .countryCode(country != null ? country.getCountryCode() : null).build());
    }

    private static void setOrganizationDetails(EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        Map<CoiSubAwardOrgField, Object> subAwardOrgFields = new HashMap<>();
        subAwardOrgFields.put(CoiSubAwardOrgField.organizationId, entityStageDetail.getSrcDataCode() != null ? entityStageDetail.getSrcDataCode() : null);
        subAwardOrgFields.put(CoiSubAwardOrgField.organizationTypeCode, entityStageDetail.getSrcTypeCode());
        subAwardOrgFields.put(CoiSubAwardOrgField.samExpirationDate, entityStageDetail.getSrcSamExpirationDate());
        subAwardOrgFields.put(CoiSubAwardOrgField.subAwdRiskAssmtDate, entityStageDetail.getSrcRiskAssmtDate());
        subAwardOrgFields.put(CoiSubAwardOrgField.isCopy, false);
        subAwardOrgFields.put(CoiSubAwardOrgField.rolodexId, entityStageDetail.getSrcRolodexId());
        subAwardOrgFields.put(CoiSubAwardOrgField.isCreatedFromImportEntity, Boolean.TRUE);
        entityFeedRequestDto.setEntitySubAward(CoiSubAwdOrgRequestDTO.builder().subAwardOrgFields(subAwardOrgFields).build());
    }

    private static void setSponsorDetails(EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        Map<CoiEntitySponsorField, Object> entitySponsorFields = new HashMap<>();
        entitySponsorFields.put(CoiEntitySponsorField.acronym, entityStageDetail.getSrcAcronym());
        entitySponsorFields.put(CoiEntitySponsorField.sponsorTypeCode, entityStageDetail.getSrcTypeCode());
        entitySponsorFields.put(CoiEntitySponsorField.sponsorCode, entityStageDetail.getSrcDataCode());
        entitySponsorFields.put(CoiEntitySponsorField.comments, entityStageDetail.getSrcComments());
        entitySponsorFields.put(CoiEntitySponsorField.isCopy, false);
        entitySponsorFields.put(CoiEntitySponsorField.rolodexId, entityStageDetail.getSrcRolodexId());
        entitySponsorFields.put(CoiEntitySponsorField.isCreatedFromImportEntity, Boolean.TRUE);
        entityFeedRequestDto.setEntitySponsor(CoiEntitySponsorRequestDTO.builder()
                .acronym(entityStageDetail.getSrcAcronym())
                .sponsorTypeCode(entityStageDetail.getSrcTypeCode())
                .entitySponsorFields(entitySponsorFields).build());
    }

    private void setEntityFieldDetails(EntityStageDetailsDto entityStageDetailsDto, EntityStageDetails entityStageDetail, CoiEntityFeedRequestDto entityFeedRequestDto) {
        Map<CoiEntityRequestField, Object> entityRequestFields = new HashMap<>();
        entityRequestFields.put(CoiEntityRequestField.entityName, entityStageDetailsDto.getSrcDataName());
        entityRequestFields.put(CoiEntityRequestField.phoneNumber, entityStageDetailsDto.getSrcPhoneNumber());
        entityRequestFields.put(CoiEntityRequestField.primaryAddressLine1, entityStageDetailsDto.getSrcAddressLine1());
        entityRequestFields.put(CoiEntityRequestField.primaryAddressLine2, entityStageDetailsDto.getSrcAddressLine2());
        entityRequestFields.put(CoiEntityRequestField.city, entityStageDetailsDto.getSrcCity());
        entityRequestFields.put(CoiEntityRequestField.state, getStateCode(entityStageDetailsDto.getSrcCountryCode(), entityStageDetailsDto.getSrcState()));
        entityRequestFields.put(CoiEntityRequestField.postCode, entityStageDetailsDto.getSrcPostalCode());
        entityRequestFields.put(CoiEntityRequestField.countryCode, entityStageDetailsDto.getSrcCountryCode());
        entityRequestFields.put(CoiEntityRequestField.certifiedEmail, entityStageDetail.getSrcEmailAddress());
        entityRequestFields.put(CoiEntityRequestField.websiteAddress, entityStageDetail.getSrcWebsite());
        entityRequestFields.put(CoiEntityRequestField.dunsNumber, entityStageDetailsDto.getSrcDunsNumber());
        entityRequestFields.put(CoiEntityRequestField.cageNumber, entityStageDetailsDto.getSrcCageNumber());
        entityRequestFields.put(CoiEntityRequestField.ueiNumber, entityStageDetailsDto.getSrcUei());
        entityRequestFields.put(CoiEntityRequestField.animalAccreditation, entityStageDetailsDto.getSrcAnimalAccreditation() != null ?
                entityStageDetailsDto.getSrcAnimalAccreditation() : entityStageDetail.getSrcAnimalAccreditation());
        entityRequestFields.put(CoiEntityRequestField.humanSubAssurance, entityStageDetailsDto.getSrcHumanSubAssurance() != null ?
                entityStageDetailsDto.getSrcHumanSubAssurance() : entityStageDetail.getSrcHumanSubAssurance());
        entityRequestFields.put(CoiEntityRequestField.anumalWelfareAssurance, entityStageDetailsDto.getSrcAnimalWelfareAssurance() != null ?
                entityStageDetailsDto.getSrcAnimalWelfareAssurance() : entityStageDetail.getSrcAnimalWelfareAssurance());
        entityRequestFields.put(CoiEntityRequestField.entityOwnershipTypeCode,  entityStageDetailsDto.getEntityOwnershipTypeCode() == null ? "3" : //EntityOwnershipTypeCode 3 : Unknown
                entityStageDetailsDto.getEntityOwnershipTypeCode());
        entityRequestFields.put(CoiEntityRequestField.entityStatusTypeCode, "2"); //unverified
        entityRequestFields.put(CoiEntityRequestField.entitySourceTypeCode, entityStageDetail.getBatch().getBatchSrcTypeCode());
        entityFeedRequestDto.setEntity(CoiEntityRequestDTO.builder()
                .entityName(entityStageDetailsDto.getSrcDataName())
                .phoneNumber(entityStageDetailsDto.getSrcPhoneNumber())
                .primaryAddressLine1(entityStageDetailsDto.getSrcAddressLine1())
                .primaryAddressLine2(entityStageDetailsDto.getSrcAddressLine2())
                .city(entityStageDetailsDto.getSrcCity())
                .state(entityRequestFields.get(CoiEntityRequestField.state) != null ? (String) entityRequestFields.get(CoiEntityRequestField.state) : null)
                .postCode(entityStageDetailsDto.getSrcPostalCode())
                .countryCode(entityStageDetailsDto.getSrcCountryCode())
                .certifiedEmail(entityStageDetail.getSrcEmailAddress())
                .websiteAddress(entityStageDetail.getSrcWebsite())
                .dunsNumber(entityStageDetailsDto.getSrcDunsNumber())
                .ueiNumber(entityStageDetailsDto.getSrcUei())
                .cageNumber(entityStageDetailsDto.getSrcCageNumber())
                .entityRequestFields(entityRequestFields)
                .isCreatingFromFeed(Boolean.TRUE)
                .createWithDuns(entityStageDetailsDto.getCreateWithDuns())
                .comments(entityStageDetail.getSrcComments())
                .rolodexId(entityStageDetail.getSrcRolodexId())
                .build());
    }

    @Override
    public ResponseEntity<Object> bulkUpdateEntityDetails(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
		entityCleanupBulkUpdateDto.getEntityStageDetailIds()
				.removeIf(id -> entityCleanUpDao.getAdminActionCode(id) != null
						&& !ADMIN_REVIEW_STATUS_PROCESSING.equals(entityCleanUpDao.getAdminReviewCode(id)));
        switch (entityCleanupBulkUpdateDto.getAction()) {
            case EXCLUDE_FROM_CREATION:
                entityCleanUpDao.bulkUpdateAdminActionStatus(entityCleanupBulkUpdateDto.getEntityStageDetailIds(),
                        Constants.ADMIN_ACTION_STATUS_MARK_EXCLUDE, Constants.ADMIN_REVIEW_STATUS_COMPLETED);
                entityCleanUpDao.updateBatchCompletionStatus(entityCleanupBulkUpdateDto.getBatchId());
                break;
            case CREATION_WITH_DNB:
                createEntityWithDUNS(entityCleanupBulkUpdateDto, request);
                break;
            case CREATION_WITHOUT_DNB:
                createEntityWithoutDUNS(entityCleanupBulkUpdateDto, request);
                break;
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
    void createEntityWithDUNS(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        entityCleanUpDao.bulkUpdateAdminReviewStatus(entityCleanupBulkUpdateDto.getEntityStageDetailIds(), Constants.ADMIN_REVIEW_STATUS_PROCESSING);
        entityCleanupBulkUpdateDto.getEntityStageDetailIds().forEach(entityStageDetailId -> {
            getExecutorServiceThread().submit(() -> {
                try {
                    EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailId);
                    DunsMatchDetails dunsDetail = extractDunsDetails(entityStageDetail).get(0);
                    CoiEntityResponseDto entity = createCoiEntity(EntityStageDetailsDto.builder()
                            .srcDunsNumber(dunsDetail.getDunsNumber())
                            .srcCageNumber(dunsDetail.getCageNumber())
                            .srcUei(dunsDetail.getUeiNumber())
                            .srcAddressLine1(dunsDetail.getPrimaryAddressLine1())
                            .srcAddressLine2(dunsDetail.getPrimaryAddressLine2())
                            .srcPostalCode(dunsDetail.getPostCode())
                            .srcCity(dunsDetail.getCity())
                            .srcState(dunsDetail.getStateCode())
                            .srcCountryCode(dunsDetail.getCountryCode())
                            .srcDataName(dunsDetail.getEntityName())
                            .createWithDuns(Boolean.TRUE)
                            .build(), entityStageDetail, cookies);
                    if (entity.getEntityId() != null) {
                        entityCleanUpDao.updateEntityDetailsWithSysEntity(entity.getEntityId(), entityStageDetail.getEntityStageDetailId(),
                                entity.getIsErrorInEnrichProcess() ? Constants.ADMIN_REVIEW_STATUS_ERROR_ENRICH_VERIFY_PROCESS :
                                        Constants.ADMIN_REVIEW_STATUS_COMPLETED, Constants.ADMIN_ACTION_STATUS_MATCH_SELECTED);
                        entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                                Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                        entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                                Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                        entityCleanUpDao.updateBatchCompletionStatus(entityStageDetail.getBatchId());
                    }
                } catch (Exception e) {
                    log.error("Exception on createEntityWithDUNS : {} | DetailID : {}", e.getMessage(), entityStageDetailId);
                    entityCleanUpDao.bulkUpdateAdminReviewStatus(Arrays.asList(entityStageDetailId), Constants.ADMIN_REVIEW_STATUS_ERROR_IN_PROCESS);
                } finally {
                    if (isProcessing) {
                        processedRecords.incrementAndGet();
                        if (processedRecords.get() == totalRecords.get()) {
                            endTime = Instant.now();
                            isProcessing = false;
                        }
                    }
                }
            });

        });
    }

    void createEntityWithoutDUNS(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        entityCleanUpDao.bulkUpdateAdminReviewStatus(entityCleanupBulkUpdateDto.getEntityStageDetailIds(), Constants.ADMIN_REVIEW_STATUS_PROCESSING);
        entityCleanupBulkUpdateDto.getEntityStageDetailIds().forEach(entityStageDetailId -> {
            getExecutorServiceThread().submit(() -> {
                try {
                    EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailId);
                    CountryDto countryDetail = getCountryDetails(entityStageDetail.getSrcCountryCode(), new HashMap<>());
                    EntityStageDetailsDto entityStageDetailsDto = EntityStageDetailsDto.builder().build();
                    BeanUtils.copyProperties(entityStageDetail, entityStageDetailsDto);
                    if(countryDetail!= null) {
                        entityStageDetailsDto.setSrcCountryCode(countryDetail.getCountryCode());
                    }
                    entityStageDetailsDto.setCreateWithDuns(Boolean.FALSE);
                    CoiEntityResponseDto entity = createCoiEntity(entityStageDetailsDto, entityStageDetail, cookies);
                    if (entity.getEntityId() != null) {
                        entityCleanUpDao.updateEntityDetailsWithSysEntity(entity.getEntityId(), entityStageDetail.getEntityStageDetailId(),
                                entity.getIsErrorInEnrichProcess() ? Constants.ADMIN_REVIEW_STATUS_ERROR_ENRICH_VERIFY_PROCESS :
                                        Constants.ADMIN_REVIEW_STATUS_COMPLETED, Constants.ADMIN_ACTION_STATUS_WITHOUT_DUNS);
                        entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                                Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                        entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                                Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                        entityCleanUpDao.updateBatchCompletionStatus(entityStageDetail.getBatchId());
                    }
                } catch (Exception e) {
                    log.error("Exception on createEntityWithDUNS : {} | DetailID : {}", e.getMessage(), entityStageDetailId);
                    entityCleanUpDao.bulkUpdateAdminReviewStatus(Arrays.asList(entityStageDetailId), Constants.ADMIN_REVIEW_STATUS_ERROR_IN_PROCESS);
                } finally {
                    if (isProcessing) {
                        processedRecords.incrementAndGet();
                        if (processedRecords.get() == totalRecords.get()) {
                            endTime = Instant.now();
                            isProcessing = false;
                        }
                    }
                }
            });
        });
    }

    private ExecutorService getExecutorServiceThread() {
        return Executors.newWorkStealingPool(2);
    }

    @Override
    public ResponseEntity<Object> validatingExcludingSource(Integer entityDetailId) {
        List<EntityStageDetailsDto> duplicateEntityDetails = new ArrayList<>();
        entityCleanUpDao.getEntityDetailByOriginatingId(entityDetailId).forEach(entDetailObj -> {
            EntityStageDetailsDto entityStageDetailsDto1 = EntityStageDetailsDto.builder().build();
            BeanUtils.copyProperties(entDetailObj, entityStageDetailsDto1);
            duplicateEntityDetails.add(entityStageDetailsDto1);
        });
        return new ResponseEntity<>(duplicateEntityDetails, HttpStatus.OK);
    }

    private String getStateCode(String countryCode, String stateAbbreviatedName) {
        try {
            State state = entityCleanUpDao.findStateByStateCodeCountryCode(countryCode, stateAbbreviatedName);
            return state != null ? state.getStateCode() : stateAbbreviatedName;
        } catch (Exception e) {
            return stateAbbreviatedName;
        }
    }

    @Override
    public ResponseEntity<Object> bulkUpdateEntityDetailsByBatchId(EntityCleanupAction updateType, Integer batchId, HttpServletRequest request) {
        if (isProcessing) {
            return new ResponseEntity<>("A process is currently in progress!! ", HttpStatus.OK);
        }
        if (entityCleanUpDao.getEntityCleanUpBatch(batchId).getReviewStatusCode().equals(Constants.BATCH_REVIEW_STATUS_COMPLETED)) {
            return new ResponseEntity<>("Batch " + batchId +" is already completed/processed!! ", HttpStatus.OK);
        }
        List<Integer> entityDetailIds = entityCleanUpDao.getEntityDetailIdByBatchId(batchId);
        if (entityDetailIds == null || entityDetailIds.isEmpty()) {
            return new ResponseEntity<>("No records found!! ", HttpStatus.OK);
        }
        startTime = Instant.now();
        totalRecords.set(entityDetailIds.size());
        processedRecords.set(0);
        isProcessing = true;
        bulkUpdateEntityDetailsByBatch(EntityCleanupBulkUpdateDto.builder().entityStageDetailIds(entityDetailIds).action(updateType).build(), request);
        return new ResponseEntity<>(getProcessStatus(), HttpStatus.OK);
    }

    @Override
    public String getProcessStatus() {
        if (isProcessing) {
            int total = totalRecords.get();
            int processed = processedRecords.get();
            return String.format("Processing in progress: %d out of %d records processed (%.2f%% completed)", processed,
                    total, (total == 0 ? 0 : (processed * 100.0 / total)));
        } else if (startTime != null && endTime != null) {
            Duration duration = Duration.between(startTime, endTime);
            return String.format("Processing completed. Duration: %d seconds. Total records processed: %d",
                    duration.getSeconds(), processedRecords.get());
        } else {
            return "No processing has been started yet";
        }
    }

    public ResponseEntity<Object> bulkUpdateEntityDetailsByBatch(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
        entityCleanupBulkUpdateDto.getEntityStageDetailIds()
                .removeIf(id -> entityCleanUpDao.getAdminActionCode(id) != null
                        && !ADMIN_REVIEW_STATUS_PROCESSING.equals(entityCleanUpDao.getAdminReviewCode(id)));
        createEntityWithoutDUNSByBatch(entityCleanupBulkUpdateDto, request);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    void createEntityWithoutDUNSByBatch(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        entityCleanUpDao.bulkUpdateAdminReviewStatus(entityCleanupBulkUpdateDto.getEntityStageDetailIds(), Constants.ADMIN_REVIEW_STATUS_PROCESSING);
        entityCleanupBulkUpdateDto.getEntityStageDetailIds().forEach(entityStageDetailId -> {
            try {
                EntityStageDetails entityStageDetail = entityCleanUpDao.getEntityCleanUpEntityDetail(entityStageDetailId);
                CountryDto countryDetail = getCountryDetails(entityStageDetail.getSrcCountryCode(), new HashMap<>());
                EntityStageDetailsDto entityStageDetailsDto = EntityStageDetailsDto.builder().build();
                BeanUtils.copyProperties(entityStageDetail, entityStageDetailsDto);
                if (countryDetail != null) {
                    entityStageDetailsDto.setSrcCountryCode(countryDetail.getCountryCode());
                }
                entityStageDetailsDto.setCreateWithDuns(Boolean.FALSE);
                CoiEntityResponseDto entity = createCoiEntity(entityStageDetailsDto, entityStageDetail, cookies);
                if (entity.getEntityId() != null) {
                    entityCleanUpDao.updateEntityDetailsWithSysEntity(entity.getEntityId(), entityStageDetail.getEntityStageDetailId(),
                            entity.getIsErrorInEnrichProcess() ? Constants.ADMIN_REVIEW_STATUS_ERROR_ENRICH_VERIFY_PROCESS :
                                    Constants.ADMIN_REVIEW_STATUS_COMPLETED, Constants.ADMIN_ACTION_STATUS_WITHOUT_DUNS);
                    entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED,
                            Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                    entityCleanUpDao.updateGroupChildAdminAction(entityStageDetail.getEntityStageDetailId(), Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED,
                            Constants.ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED, Boolean.TRUE);
                    entityCleanUpDao.updateBatchCompletionStatus(entityStageDetail.getBatchId());
                }
            } catch (Exception e) {
                log.error("Exception on createEntityWithDUNS : {} | DetailID : {}", e.getMessage(), entityStageDetailId);
                entityCleanUpDao.bulkUpdateAdminReviewStatus(Arrays.asList(entityStageDetailId), Constants.ADMIN_REVIEW_STATUS_ERROR_IN_PROCESS);
            } finally {
                if (isProcessing) {
                    processedRecords.incrementAndGet();
                    if (processedRecords.get() == totalRecords.get()) {
                        endTime = Instant.now();
                        isProcessing = false;
                    }
                }
            }
        });
    }
}
