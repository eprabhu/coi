package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SponsorResponseDTO;

@Service
public interface SponsorDetailsService extends SponosrService{

	Map<String, Integer> saveDetails(SponsorRequestDTO dto);

	ResponseEntity<String> updateDetails(SponsorRequestDTO dto);

	ResponseEntity<SponsorResponseDTO> fetchDetails(Integer entityId);

	ResponseEntity<String> deleteDetails(Integer id);

	void saveCopyFromEntity(Entity entity);

	void updateCopyFromEntity(Entity entity);

	void updateCopyFromEntity(Integer entityId);

	/**
	 * Update Sponsor address by organization address
	 * @param entityId
	 * @param orgDetails
	 */
	void updateSponsorAddressByOrgAddress(Integer entityId, EntitySubOrgInfo orgDetails);
}
