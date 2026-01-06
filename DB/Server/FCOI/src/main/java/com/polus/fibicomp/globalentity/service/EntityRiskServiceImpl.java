package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.EntityRiskDAO;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import com.polus.fibicomp.globalentity.pojo.ValidEntityRiskLevel;
import com.polus.fibicomp.globalentity.repository.EntityRiskRepository;
import com.polus.fibicomp.globalentity.repository.EntityRiskTypeRepository;
import com.polus.fibicomp.globalentity.repository.ValidEntityRiskLevelRepository;

@Service(value = "entityRiskService")
@Transactional
public class EntityRiskServiceImpl implements EntityRiskService {

	@Autowired
	private EntityRiskDAO entityRiskDAO;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EntityRiskRepository entityRiskRepository;

	@Autowired
	private EntityRiskTypeRepository entityRiskTypeRepository;

	@Autowired
	private ValidEntityRiskLevelRepository validEntityRiskLevelRepository;

	@Autowired
    private EntityActionLogService actionLogService;

	private static final String ADD_RISK_ACTION_LOG_CODE = "12";
	private static final String MODIFY_RISK_DESCRIPTION_ACTION_LOG_CODE = "13";
	private static final String MODIFY_RISK_LEVEL_ACTION_LOG_CODE = "14";
	protected static Logger logger = LogManager.getLogger(EntityRiskServiceImpl.class.getName());

	@Override
	public ResponseEntity<Map<String, Integer>> saveRisk(EntityRiskRequestDTO dto) {
		EntityRisk entity = mapDTOToEntity(dto);
		Integer entityRiskId = entityRiskDAO.saveEntityRisk(entity);
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entity.getEntityId())
					.entityRiskId(entityRiskId).riskType(dto.getRiskType()).newRiskLevel(dto.getRiskLevel())
					.oldComment(dto.getOldDescription()).newComment(dto.getDescription()).updatedBy(entity.getUpdatedBy())
					.build();
		actionLogService.saveEntityRiskActionLog(ADD_RISK_ACTION_LOG_CODE, logDTO);
		return new ResponseEntity<>(Map.of("entityRiskId", entityRiskId), HttpStatus.OK);
	}

	private EntityRisk mapDTOToEntity(EntityRiskRequestDTO dto) {
		return EntityRisk.builder().entityId(dto.getEntityId()).riskTypeCode(dto.getRiskTypeCode())
				.riskLevelCode(dto.getRiskLevelCode()).description(dto.getDescription())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public ResponseEntity<String> updateRisk(EntityRiskRequestDTO dto) {
		entityRiskDAO.updateEntityRisk(dto);
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(dto.getEntityId())
				.entityRiskId(dto.getEntityRiskId()).riskType(dto.getRiskType()).oldRiskLevel(dto.getOldRiskLevel())
				.newRiskLevel(dto.getRiskLevel()).oldComment(dto.getOldDescription()).newComment(dto.getDescription())
				.build();
		if (dto.getOldRiskLevel() != null) {
			actionLogService.saveEntityRiskActionLog(MODIFY_RISK_LEVEL_ACTION_LOG_CODE, logDTO);
		} else {
			actionLogService.saveEntityRiskActionLog(MODIFY_RISK_DESCRIPTION_ACTION_LOG_CODE, logDTO);
		}
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Entity risk updated successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> deleteRisk(Integer entityRiskId) {
		entityRiskRepository.deleteByEntityRiskId(entityRiskId);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Entity risk deleted successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<List<EntityRiskType>> fetchRiskTypes(String riskCategoryCode) {
		return new ResponseEntity<>(entityRiskTypeRepository.fetchRiskTypesByRiskCategoryCode(riskCategoryCode), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<List<EntityRiskLevel>> fetchRiskLevels(String riskTypeCode) {
		List<EntityRiskLevel> entityRiskLevels = validEntityRiskLevelRepository.fetchByRiskTypeCode(riskTypeCode).stream()
	            .map(ValidEntityRiskLevel::getEntityRiskLevel)
	            .collect(Collectors.toList());
		return new ResponseEntity<>(entityRiskLevels, HttpStatus.OK);
	}

}
