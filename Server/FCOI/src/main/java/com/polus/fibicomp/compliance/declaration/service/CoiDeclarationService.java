package com.polus.fibicomp.compliance.declaration.service;

import java.util.List;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.coi.dto.HistoryDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationRequestDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationResponse;

@Service
public interface CoiDeclarationService {

	/**
	 * Creates a new COI declaration.
	 *
	 * @param request the declaration request data transfer object
	 * @return the created declaration response
	 */
	DeclarationResponse createDeclaration(DeclarationRequestDto request);

	/**
	 * Submits an existing COI declaration for review or processing.
	 *
	 * @param request the declaration request data transfer object
	 * @return the submitted declaration response
	 */
	DeclarationResponse submitDeclaration(DeclarationRequestDto request);

	/**
	 * Revises an existing COI declaration.
	 *
	 * @param request the declaration request data transfer object
	 * @return the revised declaration response
	 */
	DeclarationResponse reviseDeclaration(DeclarationRequestDto request);

	/**
	 * Retrieves a declaration by its unique ID.
	 *
	 * @param id the declaration ID
	 * @return the declaration response
	 */
	DeclarationResponse getDeclaration(Integer id);

	/**
	 * Processes declarations that are nearing expiration based on predefined rules.
	 */
	void processExpiringDeclarations();

	/**
	 * Finds the most recent COI declaration submitted by a specific person.
	 *
	 * @param personId the ID of the person
	 * @return the latest declaration response
	 */
	DeclarationResponse findLatestDeclarationsByPersonId(String personId);

	/**
	 * Retrieves the action logs (history) associated with a specific declaration.
	 *
	 * @param declarationId the ID of the declaration
	 * @return a list of history data transfer objects
	 */
	List<HistoryDto> getActionLogsByDeclarationId(Integer declarationId);

	/**
	 * Initiate Coi Declaration sync with integration app
	 * @param declarationId
	 */
	void initiateSyncCoiDeclaration(Integer declarationId);

	/**
	 * This method is used to assign or reassign admin
	 * @param declarationRequest
	 * @return
	 */
    ResponseEntity<Object> assignAdmin(DeclarationRequestDto declarationRequest);

	/**
	 * This method is to complete Declaration admin review
	 * @param declarationRequest
	 * @return
	 */
	ResponseEntity<Object> completeDeclarationReview(DeclarationRequestDto declarationRequest);

	/**
	 * This method is used to withdraw declaration
	 * @param declarationRequest
	 * @return
	 */
	ResponseEntity<Object> withdrawDeclaration(DeclarationRequestDto declarationRequest);

	/**
	 * This method is used to withdraw declaration
	 * @param declarationRequest
	 * @return
	 */
	ResponseEntity<Object> returnDeclaration(DeclarationRequestDto declarationRequest);

    /**
     * This method is used to check declaration is already exists
     * @param request
     * @return
     */
    boolean existsDeclarationByParams(DeclarationRequestDto request);

    /**
     * @param personId
     * @param declarationTypeCode
     * @return
     */
    Boolean canCreateDeclaration(String personId, String declarationTypeCode);

    /**
     * This method is used to mark declaration as void
     * @param declarationRequest
     * @return
     */
    ResponseEntity<?> markDeclarationAsVoid(DeclarationRequestDto declarationRequest);
}
