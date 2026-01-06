package com.polus.fibicomp.opa.service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.opa.dto.OPAAssignAdminDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPASubmitDto;

@Service
public interface OPAService {

	/**
	 * This service is used to check if OPA disclosure has to be submitted for the logged in user
	 * @param personId 
	 */
	Boolean canCreateOpaDisclosure(String personId);

	/**
	 * Creates an OPA disclosure for the given person ID.
	 * @param personId the unique identifier of the person.
	 * @return OPACommonDto containing disclosure information.
	 */
	ResponseEntity<Object> createOpaDisclosure(String personId);

	/**
	 * This method id used to submit opa disclosure
	 * @param opaSubmitDto
	 * @return
	 */
    ResponseEntity<Object> submitOPADisclosure(OPASubmitDto opaSubmitDto);

    /**
	 * This method is used to withdraw OPA disclosure
	 * @param opaCommonDto
	 * @return
	 */
	ResponseEntity<Object> withdrawOPADisclosure(OPACommonDto opaCommonDto);

	/**
	 * This method used to return OPA disclosure
	 * @param opaCommonDto
	 * @return
	 */
	ResponseEntity<Object> returnOPADisclosure(OPACommonDto opaCommonDto);

	/**
	 * This method is used to assign OPA Disclosure admin
	 * @param assignAdminDto
	 * @return
	 */
	ResponseEntity<Object> assignAdminOPADisclosure(OPAAssignAdminDto assignAdminDto);

	/**
	 * This method used to complete OPA disclosure
	 * @param opaDisclosureId
	 * @param opaDisclosureNumber
	 * @param description 
	 * @return
	 */
    ResponseEntity<Object> completeOPADisclosure(Integer opaDisclosureId, String opaDisclosureNumber, String description, Boolean hasRouteLog);

    /**
	 * This method is used to get header details of OPA disclosure
	 * @param opaDisclosureId
	 * @return
	 */
	ResponseEntity<Object> getOPADisclosure(Integer opaDisclosureId);

	/**
	 * This method is used to fetch reporter OPA Dashboard
	 * @param requestDto
	 * @return
	 */
    ResponseEntity<Object> getOPADashboard(OPADashboardRequestDto requestDto);
    
    /**
	 * This method is used to Retrieves the count of disclosures of the OPA Dashboard tabs.
	 * @param requestDto
	 * @return
	 */
    ResponseEntity<Object> getOPADashboardTabCount(OPADashboardRequestDto requestDto);

    /**
	 * This method is used to fetch OPA Person Types
	 * @return
	 */
	ResponseEntity<Object> getOpaPersonType();

	/**
	 * This method is used to evaluate OPA questionnaire
	 * @return
	 */
	Map<String, String> evaluateOPAQuestionnaire(Integer personEntityId);

	void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage, String updateUser);

	/**
	 * This method is used to insert on Inbox while OPA submitting
	 * @param opaDisclosureId
	 * @param personName
	 */
	void insertOPASubmitInbox(String opaDisclosureId, String personName);

	ResponseEntity<Object> reviseOpaDisclosure(OPACommonDto dto);

	/**
	 * update sebbatical flag
	 * @param personId
	 * @param opaDisclosureId
	 */
	void updateSebbatical(String personId, Integer opaDisclosureId);

	/**
	 * Validates an OPA disclosure against business rules and requirements.
	 * 
	 * @param disclosureId the ID of the disclosure to validate
	 * @return list of validation results containing any issues found
	 */
	List<COIValidateDto> validateOPA(String disclosureId);

	/**
	 * Get Expiring Disclosure Summary Data
	 */
    void sendMonthlyExpiringSummary() throws SQLException;
}
