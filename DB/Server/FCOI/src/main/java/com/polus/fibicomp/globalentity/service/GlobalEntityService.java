package com.polus.fibicomp.globalentity.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityFeedStatusType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.core.pojo.Currency;
import com.polus.fibicomp.coi.dto.EntityActionLogDto;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.ActivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.dto.EntityDocumentStatusesDTO;
import com.polus.fibicomp.globalentity.dto.EntityFeedRequestDto;
import com.polus.fibicomp.globalentity.dto.EntityMandatoryFiledsDTO;
import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskActionLogResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.dto.ExternalReferenceRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.InactivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.MarkDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.dto.ValidateDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.validateDuplicateResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;

@Service
public interface GlobalEntityService {

	public default ResponseEntity<Map<String, Integer>> createEntity(EntityRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateEntityDetails(EntityRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<EntityResponseDTO> fetchEntityDetails(Integer entityId) {
		return null;
	}

	public default Integer getParentEntityIdEntityId(Integer entityId) {
		return null;
	}

	public default void saveIndustryDetails(IndustryDetailsRequestDTO dto) {
	}

	public default ResponseEntity<List<EntityIndustryClassification>> fetchIndustryDetails(Integer entityId) {
		return null;
	}

	public default ResponseEntity<String> updateIndustryDetails(IndustryDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> saveRegistrationDetails(RegistrationDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateRegistrationDetails(RegistrationDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> saveAdditionalAddresses(AddressDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateAdditionalAddresses(AddressDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateOtherDetails(OtherDetailsRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateRisk(EntityRiskRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> saveRisk(EntityRiskRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> saveExternalReference(ExternalReferenceRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateExternalReference(ExternalReferenceRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Object> fetchEntityOverview(Integer entityId) {
		return null;
	}

	public default ResponseEntity<Boolean> isDunsNumberExists(EntityRequestDTO dto) {
		return null;
	}

	public default Object[] getEntityIdByDunsNumber(String dunsNumber) {
		return null;
	}

	public default ResponseEntity<Boolean> isUeiNumberExists(EntityRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<Boolean> isCageNumberExists(EntityRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> deleteIndustryDetailsByClassId(Integer entityIndustryClassId) {
		return null;
	}

	public default ResponseEntity<String> deleteRegistrationDetails(Integer entityRegistrationId) {
		return null;
	}

	public default ResponseEntity<String> deleteAdditionalAddress(Integer entityMailingAddressId) {
		return null;
	}

	public default ResponseEntity<String> deleteRisk(Integer entityRiskId) {
		return null;
	}

	public default ResponseEntity<List<IndustryCategoryCode>> fetchIndustryCategoryCode(
			String industryCategroyTypeCode) {
		return null;
	}

	public default ResponseEntity<String> deleteExternalReference(Integer entityExternalMappingId) {
		return null;
	}

	public default ResponseEntity<List<Currency>> fetchCurrencyDetails() {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> addPriorName(PriorNameRequestDTO dto) {
		return null;
	}

	public default List<PriorNameResponseDTO> fetchPriorNames(Integer entityId) {
		return null;
	}

	public default ResponseEntity<Map<String, Integer>> addForeignName(ForeignNameRequestDTO dto) {
		return null;
	}

	public default List<ForeignNameResponseDTO> fetchForeignNames(Integer entityId) {
		return null;
	}

	public default ResponseEntity<String> deletePriorName(Integer id) {
		return null;
	}

	public default ResponseEntity<String> deleteForeignName(Integer id) {
		return null;
	}

	public default ResponseEntity<List<EntityRiskType>> fetchRiskTypes(String riskCategoryCode){
		return null;
	}

	public default ResponseEntity<Map<String, Object>> verifyEntityDetails(Integer entityId, Boolean verifyFromFeed) {
		return null;
	}

	public default void processEntityMessageToQ(Integer entityId) {
	}

	public default ResponseEntity<String> deleteIndustryDetailsByCatCode(String industryCatCode) {
		return null;
	}

	public default ResponseEntity<List<EntityRiskLevel>> fetchRiskLevels(String riskTypeCode) {
		return null;
	}

	public default Map<String, Object> fetchEntityTabStatus(Integer entityId) {
		return null;
	}

	public default List<validateDuplicateResponseDTO> validateDuplicate(ValidateDuplicateRequestDTO dto) {
		return null;
	}

	public default ResponseMessageDTO markDuplicate(MarkDuplicateRequestDTO dto) {
		return null;
	}

	public default List<EntityActionLogDto> fetchHistory(Integer entityId) {
		return null;
	}

	default List<EntityActionLogDto> fetchHistory(Integer entityId, Integer entityNumber) {return null;}

	public default ResponseMessageDTO logAction(ActionLogRequestDTO dto) {
		return null;
	}

	public default List<EntityRiskActionLogResponseDTO> fetchRiskHistory(Integer entityRiskId) {
		return null;
	}

	public default ResponseEntity<CorporateFamilyRequestDTO> createCorporateFamily(CorporateFamilyRequestDTO dto) {
		return null;
	}

	public default ResponseMessageDTO updateCorporateFamily(CorporateFamilyRequestDTO dto) {
		return null;
	}

	public default CorporateFamilyRequestDTO unlinkEntity(Integer entityNumber) {
		return null;
	}

	public default CorporateFamilyResponseDTO fetchCorporateFamily(Integer entityNumber) {
		return null;
	}

	public default boolean isParentLinked(Integer entityNumber) {
		return false;
	}

	public default ResponseEntity<ResponseMessageDTO> createCorporateFamilyFromDnB(String dunsNumber) {
		return null;
	}

	public default ResponseMessageDTO activateEntity(ActivateEntityRequestDTO dto) {
		return null;
	}

	public default ResponseMessageDTO inactivateEntity(InactivateEntityRequestDTO dto) {
		return null;
	}

	public default void processEntityMessageToGraphSyncQ(Integer integer) {
	}

	public default EntityMandatoryFiledsDTO fetchEntityMandatoryFields() {
		return null;
	}

	public default ObjectNode validateEntityDetails(Integer entityId) {
		return null;
	}

	default void postCreationProcessFromFeed(EntityFeedRequestDto dto, Integer entityId) {}

	public default List<EntityDocumentStatusesDTO> fetchEntityDocumentStatuses() {
		return null;
	}

	default void updateEntitySponsorOrgDetailsFromFeed(EntityFeedRequestDto dto) {}

	public default Map<String, Object> saveNote(EntityNotesDTO dto) {
		return null;
	}

	public default Map<String, Object> updateEntityNote(EntityNotesDTO dto) {
		return null;
	}

	public default List<EntityNotesDTO> fetchAllBySectionCode(String sectionCode, Integer entityId) {
		return null;
	}

	public default ResponseMessageDTO deleteNote(Integer noteId, String sectionCode) {
		return null;
	}

	public default void syncGraph(ResponseEntity<ResponseMessageDTO> response, String dunsNumber) {

	}

	default void feedVerifyEntity(EntityRequestDTO dto) {
	}

	default ResponseEntity<Object> modifyEntity(Integer entityId, Integer entityNumber) {
		return null;
	}

	default ResponseEntity<Object> getActiveModifyingVersion(Integer entityNumber) {
		return null;
	}

	default ResponseEntity<Object> getVersions(Integer entityNumber) {
		return null;
	}

	default EntityComment saveComment(EntityCommentsDTO entityCommentDto) {
		return null;
	}

	default EntityCommentsDTO updateComment(EntityCommentsDTO dto) {
		return null;
	}

	default List<EntityCommentsDTO> fetchAllCommentsBySectionCode(String sectionCode, Integer entityId) {
		return null;
	}

	default ResponseMessageDTO deleteComment(Integer entityCommentId, String sectionCode) {
		return null;
	}

	default Map<String, List<EntityCommentsDTO>> getEntityCommentsByEntityNumber(Integer entityId) {
		return null;
	}

	default Map<String, Integer> getEntityCommentsCount(Integer entityId) {
		return null;
	}

	default List<EntityFamilyTreeRole> getFamilyTreeRoles(Integer entityId) {
		return null;
	}

	default void saveExternalReferenceFromFeed(ExternalReferenceRequestDTO dto) {}

	default  void updateEntityFeedActionLog(Integer entityId, Map<String, Object> entityTabStatus, EntityFeedStatusType sponFeedStatus,
											String entityName, String updatedBy, Timestamp updateTimestamp, EntityFeedStatusType orgFeedStatus) {}

	default Integer updateActiveEntitySponOrgFeedStatus(Integer currentEntityId) { return null; }

	default Map<String, Object> cancelEntityModification(EntityRequestDTO entityRequestDTO){ return null; }

	public default List<IndustryCategoryType> fetchIndustryCategoryTypeBySource(String source) {
		return null;
	}

	default void updateEntityForeignFlag(Integer entityId, Integer entityNumber) {}

	default Boolean isEntityForeign(Integer entityId) { return null; }

	default void verifyEntityFromCorporateTree(Integer entityId) {}

	default Entity fetchEntityByEntityId(Integer entityId) { return null; }

	default ResponseEntity<String> unlinkDnbMatchDetails(Integer entityId) {
		return null;
	}

	default ResponseEntity<Object> createDunsRefreshVersion(Integer entityId, Integer entityNumber) {return null;}

	default void updateEntityForeignFlag(Integer entityId){}

	default void updateEntityElastic(Integer entityId) {}

	default void insertDunsMonitoringVerifyLog(Integer entityId) {}

	default void syncCorporateLinkage(Integer entityNumber, String dunsNumber, String updateUserId, Timestamp updateTimestamp) {}

	default void resolveEntityComment(Integer entityCommentId) {}

}
