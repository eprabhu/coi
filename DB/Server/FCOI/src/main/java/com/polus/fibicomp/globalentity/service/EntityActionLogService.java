package com.polus.fibicomp.globalentity.service;

import java.util.List;

import com.polus.fibicomp.coi.dto.EntityActionLogDto;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskActionLogResponseDTO;

public interface EntityActionLogService {

    /**
     * This method is used to build and save Entity Action Log
     * @param actionLogTypeCode
     * @param dto
     * @param comment
     */
    void saveEntityActionLog(String actionLogTypeCode, ActionLogRequestDTO dto, String comment);

    /**
     * This method is used to fetch all entity action log based on entity id
     * @param entityId
     * @return
     */
    List<EntityActionLogDto> fetchAllEntityActionLog(Integer entityId);

    /**
     * This method is used to build and save Entity Action Log
      * @param actionLogTypeCode
     * @param dto
     */
	void saveEntityRiskActionLog(String actionLogTypeCode, ActionLogRequestDTO logDTO);

	/**
     * This method is used to fetch all entity risk action log based on entity risk id
     * @param entityRiskId
     * @return
     */
	List<EntityRiskActionLogResponseDTO> fetchAllEntityRiskActionLog(Integer entityRiskId);

    /**
     * This method is used to fetch all entity action log based on entity id and entity number
     * @param entityId
     * @param entityNumber
     * @return
     */
    List<EntityActionLogDto> fetchAllEntityActionLog(Integer entityId, Integer entityNumber);

}
