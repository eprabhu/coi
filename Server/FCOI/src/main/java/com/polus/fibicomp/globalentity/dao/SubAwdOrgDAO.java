package com.polus.fibicomp.globalentity.dao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;

@Transactional
@Service
public interface SubAwdOrgDAO {

	Integer saveDetails(EntitySubOrgInfo entity);

	void updateDetails(SubAwdOrgRequestDTO dto);

	EntitySubOrgInfo findByEntityId(Integer entityId);

	/**
	 * Check org is from import entity
	 * @param entityId
	 * @return
	 */
	boolean isOrgFromImportEntity(Integer entityId);
}
