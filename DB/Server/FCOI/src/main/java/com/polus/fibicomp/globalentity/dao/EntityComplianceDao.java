package com.polus.fibicomp.globalentity.dao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;

@Transactional
@Service
public interface EntityComplianceDao {

	int saveComplianceInfo(EntityComplianceInfo complianceInfo);

	void updateComplianceInfo(ComplianceRequestDTO dto);

	void deleteComplianceInfoById(Integer id);

}
