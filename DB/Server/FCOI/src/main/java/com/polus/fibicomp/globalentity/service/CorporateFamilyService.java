package com.polus.fibicomp.globalentity.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import java.sql.Timestamp;

@Service
public interface CorporateFamilyService extends GlobalEntityService {

	public ResponseEntity<CorporateFamilyRequestDTO> createCorporateFamily(CorporateFamilyRequestDTO dto);

	public ResponseEntity<ResponseMessageDTO> createCorporateFamilyFromDnB(String dunsNumber);

	public ResponseMessageDTO updateCorporateFamily(CorporateFamilyRequestDTO dto);

	public CorporateFamilyRequestDTO unlinkEntity(Integer entityNumber);

	public CorporateFamilyResponseDTO fetchCorporateFamily(Integer entityNumber);

	public boolean isParentLinked(Integer entityNumber);

	public void syncGraph(ResponseEntity<ResponseMessageDTO> response, String dunsNumber);

	/**
	 * Sync corporate linkage from search api
	 * @param entityNumber
	 * @param dunsNumber
	 * @param updateUserId
	 * @param updateTimestamp
	 */
	void syncCorporateLinkage(Integer entityNumber, String dunsNumber, String updateUserId, Timestamp updateTimestamp);

}
