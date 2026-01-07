package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.EntityComplianceDao;
import com.polus.fibicomp.globalentity.dao.EntityRiskDAO;
import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.dto.ComplianceResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.repository.EntityComplianceInfoRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class ComplianceServiceImpl implements ComplianceService {

	@Autowired
	private EntityRiskDAO entityRiskDAO;

	@Autowired
	private EntityFileAttachmentService entityFileAttachmentService;

	@Autowired
	private EntityComplianceDao complianceDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EntityComplianceInfoRepository entityComplianceInfoRepository;

	private static final String COMPLAINCE_SECTION_CODE = "4";

	@Override
	public ComplianceResponseDTO fetchComplianceDetails(Integer entityId) {
		log.info("Fetching compliance details for entityId: {}", entityId);

		List<EntityRisk> entityRisks = entityRiskDAO.findComplianceRiskByEntityId(entityId);
		List<EntityAttachmentResponseDTO> attachments = entityFileAttachmentService.getAttachmentsBySectionCode(COMPLAINCE_SECTION_CODE, entityId);

		Optional<EntityComplianceInfo> complianceInfoOpt = entityComplianceInfoRepository.findByEntityId(entityId);

		ComplianceResponseDTO response = ComplianceResponseDTO.builder().entityRisks(entityRisks)
				.attachments(attachments).complianceInfo(complianceInfoOpt.orElse(null))
				.build();

		log.info("Successfully fetched compliance details for entityId: {}", entityId);
		return response;
	}

	@Override
	public Map<String, Integer> saveComplianceInfo(ComplianceRequestDTO dto) {
		try {
			EntityComplianceInfo complianceInfo = mapDTOToEntity(dto);

			log.info("Saving compliance info for entity ID: {}", complianceInfo.getEntityId());
			Integer id = complianceDao.saveComplianceInfo(complianceInfo);

			log.info("Saved compliance info successfully with ID: {}", id);
			return Map.of("id", id);
		} catch (Exception e) {
			log.error("Error occurred while saving compliance info", e);
			throw new RuntimeException("Failed to save compliance info", e);
		}
	}

	private EntityComplianceInfo mapDTOToEntity(ComplianceRequestDTO dto) {
		return EntityComplianceInfo.builder().entityId(dto.getEntityId()).entityTypeCode(dto.getEntityTypeCode())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public String updateComplianceInfo(ComplianceRequestDTO dto) {
		try {
			complianceDao.updateComplianceInfo(dto);
			return "Entity compliance information updated successfully.";
		} catch (Exception e) {
			log.error("Error while updating compliance info for ID: {}", dto.getId(), e);
			throw new RuntimeException("Failed to update compliance info", e);
		}
	}

	@Override
	public String deleteComplianceInfo(Integer id) {
		try {
			complianceDao.deleteComplianceInfoById(id);
			return "Entity compliance information deleted successfully.";

		} catch (Exception e) {
			log.error("Error while deleting compliance info for ID: {}", id, e);
			throw new RuntimeException("Failed to delete compliance info", e);
		}
	}

}
