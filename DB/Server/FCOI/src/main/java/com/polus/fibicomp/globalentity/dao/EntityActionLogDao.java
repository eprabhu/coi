package com.polus.fibicomp.globalentity.dao;

import java.util.List;

import com.polus.fibicomp.globalentity.pojo.EntityActionLog;
import com.polus.fibicomp.globalentity.pojo.EntityActionType;
import com.polus.fibicomp.globalentity.pojo.EntityRiskActionLog;

public interface EntityActionLogDao {

	void saveEntityActionLog(EntityActionLog entityActionLog);

    /**
     * @param actionLogTypeCode
     * @return
     */
    EntityActionType getEntityActionType(String actionLogTypeCode);

    /**
     * @param entityId
     * @return
     */
    List<EntityActionLog> fetchAllEntityActionLog(Integer entityId);

    /**
     * @param entityRiskActionLog
     */
    void saveEntityRiskActionLog(EntityRiskActionLog entityRiskActionLog);

    /**
     * @param entityRiskId
     * @return
     */
    List<EntityRiskActionLog> fetchAllEntityRiskActionLog(Integer entityRiskId);

    /**
     *
     * @param entityId
     * @param entityNumber
     * @return
     */
    List<EntityActionLog> fetchAllEntityActionLog(Integer entityId, Integer entityNumber);

}
