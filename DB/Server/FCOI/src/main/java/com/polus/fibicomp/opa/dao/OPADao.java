package com.polus.fibicomp.opa.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.opa.dto.OPAAssignAdminDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPADashTabCountVO;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPADashboardResponseDto;
import com.polus.fibicomp.opa.dto.OPASubmitDto;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.pojo.OPADispositionStatusType;
import com.polus.fibicomp.opa.pojo.OPAFormBuilderDetails;
import com.polus.fibicomp.opa.pojo.OPAPersonType;
import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;

@Service
public interface OPADao {

	boolean canCreateOpaDisclosure(String personId);

	/**
	 * Creates an OPA disclosure for the given person ID.
	 * @param personId the unique identifier of the person
	 * @return OPACommonDto containing disclosure information.
	 */
	OPACommonDto createOpaDisclosure(String personId);

	/**
	 * This method is used patch the opa disclosure for submit
	 * @param opaSubmitDto
	 * @return update timestamp
	 */
    Timestamp submitOPADisclosure(OPASubmitDto opaSubmitDto);

	/**
	 * This method is used to return or withdraw OPA Disclosure
	 * @param opaStatusCode
	 * @param opaDisclosureId
	 * @return
	 */
	Timestamp returnOrWithdrawOPADisclosure(String opaStatusCode, Integer opaDisclosureId);

	/**
	 * This method is used to update OPA disclosure admin and admin group
	 * @param assignAdminDto
	 * @return
	 */
	Timestamp assignAdminOPADisclosure(OPAAssignAdminDto assignAdminDto);

	Timestamp completeOPADisclosure(Integer opaDisclosureId);

	/**
	 * This method is used to check the disclosure is with statues @params
	 * @param opaDisclosureStatuses
	 * @param dispositionStatus
	 * @param opaDisclosureId
	 * @return boolean true/false, true if exists else false
	 */
	boolean isOPAWithStatuses(List<String> opaDisclosureStatuses, String dispositionStatus, Integer opaDisclosureId);

	/**
	 * This method is used to check admin assigned to the disclosure
	 * @param opaDisclosureId
	 * @return boolean true/false, true if added else false
	 */
	boolean isAdminAssigned(Integer opaDisclosureId);

	/**
	 * This method is used for get opaDisclosure details
	 * @param opaDisclosureId
	 * @return
	 */
	public OPADisclosure getOPADisclosure(Integer opaDisclosureId);

	/**
	 *
	 * @param requestDto
	 * @return
	 */
	OPADashboardResponseDto getOPADashboard(OPADashboardRequestDto requestDto);
	
	/**
	 * This method is used to Retrieves the count of disclosures of the OPA Dashboard tabs.
	 * @param requestDto
	 * @return
	 */
	String getOPADashboardTabCount(OPADashboardRequestDto requestDto);

	/**
	 *
	 * @param requestDto
	 * @param isCount
	 * @return
	 */
	ResultSet getOPADashboardResultSet(OPADashboardRequestDto requestDto, boolean isCount) throws SQLException;

	/**
	 * This method is used for inserting details into opaformbuilderdetails table
	 * @param opaFormBuilderDetails
	 * @return
	 */
	OPAFormBuilderDetails saveOrUpdateOpaFormBuilderDetails(OPAFormBuilderDetails opaFormBuilderDetails);

	/**
	 * This method is used to get opaformbuilderdetails using opaDisclosureId
	 * @param opaDisclosureId
	 * @return
	 */
	List<OPAFormBuilderDetails> getOpaFormBuilderDetailsByOpaDisclosureId(Integer opaDisclosureId);

	/**
	 * This method is used to get admin person id of an opa disclosure using opaDisclosureId
	 * @param opaDisclosureId
	 * @return
	 */
	String getAssignedAdmin(Integer opaDisclosureId);

	/**
	 * This method is used to get active and pending OPA disclosures by personId
	 * @param personId
	 * @return
	 */
	List<OPADisclosure> getActiveAndPendingOpaDisclosure(String personId);

	/**
	 * This method updates the update details of a OPA Disclosure
	 * @param opaDisclosureId
	 * @param timesStamp
	 * @return
	 */
	Timestamp updateOPADisclosureUpDetails(Integer opaDisclosureId, Timestamp timesStamp);

	/**
	 * This method updates the OPA disclosure statuses and update details
	 * @param opaDisclosureId
	 * @param opaDisclosureStatusCode
	 * @param dispositionStatusCode
	 * @return
	 */
	void updateOPADisclosureStatuses(Integer opaDisclosureId, Timestamp timestamp, String opaDisclosureStatusCode, String dispositionStatusCode);

	/**
	 *
	 * @param statusTypeCode
	 * @return
	 */
	OPAReviewStatusType getOPADisclosureStatusType(String statusTypeCode);

	/**
	 * This method is used to fetch OPA person type lookup
	 * @return
	 */
	List<OPAPersonType> getOpaPersonType();

	/**
	 * This method is used to check if same admin is added
	 * @return
	 */
	boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer opaDisclosureId);

	/**
	 * This method is used to check if admin is added
	 * @return
	 */
	boolean isAdminPersonOrGroupAdded(Integer opaDisclosureId);

	/**
	 * This method is used to evaluate relationship by personEntityId
	 */
	Map<String, String> evaluateRelationship(Integer personEntityId);

	/**
	 * This method  fetches OPA review status
	 * @param opaDisclosureId
	 * @return
	 */
	OPAReviewStatusType getDisclosureReviewStatue(Integer opaDisclosureId);

	/**
	 *
	 * @param opaDisclosureId
	 * @return
	 */
    String getOPAHomeUnit(Integer opaDisclosureId);

	OPACommonDto reviseOpaDisclosure(OPACommonDto dto);

	void archiveOPADisclosureOldVersions(Integer opaDisclosureId, String opaDisclosureNumber);

	public OPADisclosure getPreviousOPADisclosureVersion(String disclosureNumber, Integer versionNumber);

	boolean existsPendingOPADisclosure(String personId);

	/**
	 * update sebbatical flag
	 * @param personId
	 * @param opaDisclosureId
	 */
	void updateSebbatical(String personId, Integer opaDisclosureId);
	
	/**
	 * Retrieves the disposition status type based on the statusTypeCode.
	 * 
	 * @param statusTypeCode 
	 * @return the current disposition status type
	 */
	OPADispositionStatusType getOPADisclDispositionStatusType(String statusTypeCode);

	/**
	 * Validates an OPA disclosure against business rules and requirements.
	 * 
	 * @param disclosureId the ID of the disclosure to validate
	 * @return list of validation results containing any issues found
	 */
	List<COIValidateDto> validateOPA(String disclosureId);
	
	/**
	 * Retrieves the home unit for a given person ID or null if not found.
	 * 
	 * @param personId the ID of the person
	 * @return homeUnit
	 */
	String getOpaDisclHomeUnit(String personId);

	/**
	 * Retrieves the expiration and certification date for the given disclosure number
	 * 
	 * @param disclosure number
	 */
	public Object[] getActiveOpaDisclExpiryAndCertDate(Integer disclosureNumber);

	/**
	 * Get Expiring Disclosure Summary Data
	 * @return
	 */
    Map<String, String> getExpiringDisclosureSumryData() throws SQLException;
    
	/**
	 * Get latest OPA disclosure for personId
	 * @return OPADisclosure
	 */
    OPADisclosure getLatestOpaDisclosure(String personId);
}
