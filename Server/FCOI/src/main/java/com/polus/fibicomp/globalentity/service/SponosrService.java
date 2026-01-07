package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SponsorResponseDTO;

@Service
public interface SponosrService {

	public default Map<String, Integer> saveDetails(SponsorRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<String> updateDetails(SponsorRequestDTO dto) {
		return null;
	}

	public default ResponseEntity<SponsorResponseDTO> fetchDetails(Integer entityId) {
		return null;
	}

	public default ResponseEntity<String> deleteDetails(Integer id) {
		return null;
	}

	public default void logAction(SponsorRequestDTO dto) {
	}

	default void updateCopyFromEntity(Integer entityId) {}
}
