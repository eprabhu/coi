package com.polus.fibicomp.disclosures.consultingdisclosure.dao;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclAssignAdminDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclSubmitDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclFormBuilderDetails;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclReviewStatusType;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclosure;

public interface ConsultingDisclosureDao {

	ConsultingDisclosure createConsultingDisclosure(ConsultingDisclosure consultingDisclosure);

	/**
	 * This method is used patch the consulting disclosure for submit
	 * @param consultDisclSubmitDto
	 * @return update timestamp
	 */
    Timestamp submitConsultingDisclosure(ConsultDisclSubmitDto consultDisclSubmitDto);

	/**
	 * This method is used to return or withdraw consulting Disclosure
	 * @param dislcosureStatusCode
	 * @param disclosureId
	 * @return update timestamp
	 */
	Timestamp returnOrWithdrawConsultingDisclosure(String dislcosureStatusCode, Integer disclosureId);

	/**
	 * This method is used to update consulting disclosure admin and admin group
	 * @param assignAdminDto
	 * @return update timestamp
	 */
	Timestamp assignAdminConsultingDisclosure(ConsultDisclAssignAdminDto consultDisclAssignAdminDto);

	/**
	 * This method is used to complete consulting disclosure
	 * @param disclosureId
	 * @return update timestamp
	 */
	Timestamp completeConsultingDisclosure(Integer disclosureId);

	/**
	 * This method is used to check admin assigned to the disclosure
	 * @param disclosureId
	 * @return boolean true/false, true if added else false
	 */
	boolean isAdminAssigned(Integer disclosureId);

	/**
	 * This method is used for get consulting disclosure details
	 * @param disclosureId
	 * @return consulting disclosure
	 */
	public ConsultingDisclosure getConsultingDisclosure(Integer disclosureId);

	/**
	 * This method is used for inserting details into ConsultDisclformbuilderdetails table
	 * @param consultingDisclFormBuilderDetails
	 * @return ConsultingDisclFormBuilderDetails
	 */
	ConsultingDisclFormBuilderDetails saveOrUpdateConsultDisclFormBuilderDetails(ConsultingDisclFormBuilderDetails consultingDisclFormBuilderDetails);

	/**
	 * This method is used to get consultingDisclFormBuilderDetails using disclosureId
	 * @param disclosureId
	 * @return list of ConsultingDisclFormBuilderDetails
	 */
	List<ConsultingDisclFormBuilderDetails> getConsultDisclFormBuilderDetailsByDisclosureId(Integer disclosureId);

	/**
	 * This method is used to get admin person id of consulting disclosure using disclosureId
	 * @param disclosureId
	 * @return admin person id
	 */
	String getAssignedAdmin(Integer disclosureId);

	/**
	 * This method is used to get active and pending consulting disclosures by personId
	 * @param personId
	 * @return list of consulting disclosures
	 */
	List<ConsultingDisclosure> getActiveAndPendingConsultingDisclosure(String personId);

	/**
	 * This method updates the update details of a Consulting Disclosure
	 * @param disclosureId
	 * @param timeStamp
	 * @return update timestamp
	 */
	Timestamp updateConsultingDisclosureUpDetails(Integer disclosureId, Timestamp timeStamp);

	/**
	 * This method updates the Consulting disclosure statuses and update details
	 * @param disclosureId
	 * @param disclosureStatusCode
	 * @param dispositionStatusCode
	 */
	void updateConsultingDisclosureStatuses(Integer disclosureId, Timestamp timestamp, String disclosureStatusCode, String dispositionStatusCode);

	/**
	 * This method is used to get consulting disclosure status types
	 * @param statusTypeCode
	 * @return ConsultingDisclReviewStatusType
	 */
	ConsultingDisclReviewStatusType getConsultingDisclosureStatusType(String statusTypeCode);

	/**
	 * This method is used to check if same admin is added
	 * @return boolean true/false, true if added else false
	 */
	boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer disclosureId);

	/**
	 * This method is used to check if admin is added
	 * @return boolean true/false, true if added else false
	 */
	boolean isAdminPersonOrGroupAdded(Integer disclosureId);

	/**
	 * This method is used to check if consulting disclosure is of the given statuses
	 * @return boolean true/false, true if disclosure is of given statuses
	 */
	boolean isConsultingDisclWithStatuses(List<String> consultingDisclStatuses, String consultDisclDispositionStatusPending, Integer disclosureId);

	/**
	 * This method is used to save entity details in consulting disclosure
	 * @param disclosureId
	 * @param entityId
	 * @param entityNumber
	 * @param personEntityNumber 
	 * @return update timestamp
	 */
	Timestamp saveEntityDetails(Integer entityId, Integer disclosureId, Integer entityNumber, Integer personEntityNumber);

}
