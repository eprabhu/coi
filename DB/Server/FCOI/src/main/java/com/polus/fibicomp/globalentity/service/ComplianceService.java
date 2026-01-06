package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.dto.ComplianceResponseDTO;

@Service
public interface ComplianceService {

	public default ComplianceResponseDTO fetchComplianceDetails(Integer entityId) {
		return null;
	}

	public default Map<String, Integer> saveComplianceInfo(ComplianceRequestDTO dto) {
		return null;
	}

	public default String updateComplianceInfo(ComplianceRequestDTO dto) {
		return null;
	}

	public default String deleteComplianceInfo(Integer id) {
		return null;
	}

}
