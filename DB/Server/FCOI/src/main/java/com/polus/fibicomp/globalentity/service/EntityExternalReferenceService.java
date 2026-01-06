package com.polus.fibicomp.globalentity.service;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.ExternalReferenceRequestDTO;

@Service
public interface EntityExternalReferenceService extends GlobalEntityService {

	ResponseEntity<Map<String, Integer>> saveExternalReference(ExternalReferenceRequestDTO dto);

	ResponseEntity<String> updateExternalReference(ExternalReferenceRequestDTO dto);

	ResponseEntity<String> deleteExternalReference(Integer entityExternalMappingId);

	void saveExternalReferenceFromFeed(ExternalReferenceRequestDTO dto);

}
