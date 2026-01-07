package com.polus.fibicomp.globalentity.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.fibicomp.globalentity.dto.EntityDocumentStatusesDTO;
import com.polus.fibicomp.globalentity.dto.EntityMandatoryFiledsDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.ValidateDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.pojo.Entity;

@Transactional
@Service
public interface EntityDetailsDAO {

	public Integer createEntity(Entity entity);

	public void updateEntity(EntityRequestDTO dto);

	public Entity fetchEntityDetails(Integer entityId);

	public Map<String, Object> getEntityTabStatus(Integer entityId);

	public List<Entity> validateDuplicateByParams(ValidateDuplicateRequestDTO dto);

	public void updateDocWithOriginalEntity(Integer duplicateEntityId, Integer originalEntityId);

	public Object[] getEntityIdByDunsNumber(String dunsNumber);

	public EntityMandatoryFiledsDTO fetchEntityMandatoryFields();

	public ObjectNode validateEntityDetails(Integer entityId);

	public List<EntityDocumentStatusesDTO> fetchEntityDocumentStatuses();

	Integer copyEntity(Integer entityId, Integer entityNumber, String entityStatusTypeCode);

	List<Object[]> fetchEntityUsedEngagements(Integer entityNumber);

	void updateEntityForeignFlag(Integer entityId, Integer entityNumber);

    Boolean isEntityForeign(Integer entityId);

	/**
	 * @param entityId
	 * @param personId
	 */
	public void unlinkDnbMatchDetails(Integer entityId, String personId);

	Integer getEntityIdByEntityNumberAndVersionStatus(Integer entityNumber, String versionStatus);
}
