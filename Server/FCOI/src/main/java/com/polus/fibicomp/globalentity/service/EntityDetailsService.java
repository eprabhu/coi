package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import com.polus.fibicomp.globalentity.dto.EntityFeedRequestDto;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;

@Service
public interface EntityDetailsService extends GlobalEntityService {

	ResponseEntity<Map<String, Integer>> createEntity(EntityRequestDTO dto);

	ResponseEntity<String> updateEntityDetails(EntityRequestDTO dto);

	ResponseEntity<EntityResponseDTO> fetchEntityDetails(Integer entityId);

	void postCreationProcessFromFeed(EntityFeedRequestDto dto, Integer entityId);

	void updateEntitySponsorOrgDetailsFromFeed(EntityFeedRequestDto dto);

	void feedVerifyEntity(EntityRequestDTO dto);

	ResponseEntity<Object> modifyEntity(Integer entityId, Integer entityNumber);

	ResponseEntity<Object> getActiveModifyingVersion(Integer entityNumber);

	ResponseEntity<Object> getVersions(Integer entityNumber);

	List<EntityFamilyTreeRole> getFamilyTreeRoles(Integer entityNumber);

	Integer updateActiveEntitySponOrgFeedStatus(Integer currentEntityId);

	Map<String, Object> cancelEntityModification(EntityRequestDTO entityRequestDTO);

	Boolean isEntityForeign(Integer entityId);

	void verifyEntityFromCorporateTree(Integer entityId);

	Entity fetchEntityByEntityId(Integer entityId);

	/**
	 * @param entityId
	 * @return
	 */
	public ResponseEntity<String> unlinkDnbMatchDetails(Integer entityId);


	ResponseEntity<Object> createDunsRefreshVersion(Integer entityId, Integer entityNumber);

}
