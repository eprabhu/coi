package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgResponseDTO;

@Service
public interface SubAwdOrgDetailsService extends SubAwdOrgService{

	ResponseEntity<Map<String, Integer>> saveDetails(SubAwdOrgRequestDTO dto);

	ResponseEntity<String> updateDetails(SubAwdOrgRequestDTO dto);

	ResponseEntity<SubAwdOrgResponseDTO> fetchDetails(Integer entityId);

	ResponseEntity<String> deleteDetails(Integer id);

	void saveCopyFromEntity(Entity entity);

	void updateCopyFromEntity(Entity entity);

	void updateCopyFromEntity(Integer entityId);

	/**
	 * Update org address with sponsor address
	 * @param entityId
	 * @param sponsorInfo
	 */
	void updateOrgAddressBySponAddress(Integer entityId, EntitySponsorInfo sponsorInfo);

}
