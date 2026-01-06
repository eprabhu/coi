package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import com.polus.fibicomp.globalentity.pojo.ValidEntityRiskLevel;

@Service
public interface EntityRiskService extends GlobalEntityService {

	ResponseEntity<Map<String, Integer>> saveRisk(EntityRiskRequestDTO dto);

	ResponseEntity<String> updateRisk(EntityRiskRequestDTO dto);

	ResponseEntity<String> deleteRisk(Integer entityRiskId);

	ResponseEntity<List<EntityRiskType>> fetchRiskTypes(String riskCategoryCode);

	ResponseEntity<List<EntityRiskLevel>> fetchRiskLevels(String riskTypeCode);

}
