package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgResponseDTO;

@Service
public interface SubAwdOrgService {

	public default ResponseEntity<Map<String, Integer>> saveDetails(SubAwdOrgRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateDetails(SubAwdOrgRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<SubAwdOrgResponseDTO> fetchDetails(Integer entityId) {
		return null;
	}

	public default ResponseEntity<String> deleteDetails(Integer id) {
		return null;
	}

	default void updateCopyFromEntity(Integer entityId) {}

}
