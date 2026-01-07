
package com.polus.fibicomp.globalentity.dao;
import java.util.List;

import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;

@Transactional
@Service
public interface EntityRiskDAO {

	int saveEntityRisk(EntityRisk entity);

	void updateEntityRisk(EntityRiskRequestDTO dto);

	List<EntityRisk> findSubAwdOrgRiskByEntityId(Integer entityId);

	List<EntityRisk> findSponsorRiskByEntityId(Integer entityId);

	List<EntityRisk> findEntityRiskByEntityId(Integer entityId);

	List<EntityRisk> findComplianceRiskByEntityId(Integer entityId);

	EntityRiskLevel findEntityRiskLevel(String riskLevelCode);

	EntityRiskType findEntityRiskType(String riskLevelCode);
}
