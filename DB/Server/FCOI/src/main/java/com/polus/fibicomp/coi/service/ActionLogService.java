package com.polus.fibicomp.coi.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.cmp.dto.CmpCommonDto;
import com.polus.fibicomp.cmp.dto.CmpReviewActionLogDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.DisclosureActionLog;
import com.polus.fibicomp.coi.pojo.TravelDisclosureActionLog;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationCommonDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclCommonDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.travelDisclosure.dtos.TravelDisclosureActionLogDto;

public interface ActionLogService {

    /**
     *
     * @param actionLogDto
     */
	void saveDisclosureActionLog(DisclosureActionLogDto actionLogDto);

    /**
     *
     * @param disclosureId
     * @return
     */
	ResponseEntity<Object> getDisclosureHistoryById(Integer disclosureId);

	void saveTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto);

    /**
     * This method is used to fetch disclosure action log
     * @param actionLogDto
     * @return
     */
    List<DisclosureActionLog> fetchDisclosureActionLog(DisclosureActionLogDto actionLogDto);
	
	ResponseEntity<Object> getTravelDisclosureHistoryById(Integer travelDisclosureId);

	List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto);

	/**
     * This method is used to fetch review history
     * @param disclosureId
     * @return
     */
	ResponseEntity<Object> getReviewHistoryById(Integer disclosureId);

    /**
     * This method is used to save OPA Action log
     * @param actionLogTypeCode
     * @param opaCommonDto
     */
    void saveOPAActionLog(String actionLogTypeCode, OPACommonDto opaCommonDto);

    /**
     * This method is used to get OPA disclosure history
     * @param opaDisclosureId
     */
	ResponseEntity<Object> getOpaDisclosureHistoryById(Integer opaDisclosureId);

    /**
     * This method is used to save person entity action log
     * @param personEntityDto
     */
    void savePersonEntityActionLog(PersonEntityDto personEntityDto);

    /**
     * This method is fetches all the Person Entity action logs of current version and of previous versions
     * @param personEntityDto
     * @return List<PersonEntityActionLog>
     */
    ResponseEntity<Object> getAllPersonEntityActionLog(PersonEntityDto personEntityDto);

    /**
     * This method is used to get consulting disclosure history
     * @param disclosureId
     */
	ResponseEntity<Object> getConsultingDisclosureHistoryById(Integer disclosureId);

	/**
     * This method is used to save Consulting disclosure action log
     * @param actionLogTypeCode
     * @param consultDisclCommonDto
     */
	void saveConsultingDisclActionLog(String actionLogTypeCode, ConsultDisclCommonDto consultDisclCommonDto);

	/**
     * This method is used to replace placeholders in the message template for the specified action type.
     * @param actionLogDto
     * @return String
     */
	String getFormattedMessageByActionType(DisclosureActionLogDto actionLogDto);

	/**
	 * Save Coi Declaration Action Log
	 * @param actionCode
	 * @param declarationCommonDto
	 */
	void saveCoiDeclarationActionLog(String actionCode, DeclarationCommonDto declarationCommonDto);

	void saveCMPActionLog(String actionTypeCode, CmpCommonDto dto);

	ResponseEntity<Object> getCmpHistoryById(Integer cmpId);

	void saveCmpReviewActionLog(String actionTypeCode, CmpReviewActionLogDto dto);

	ResponseEntity<Object> getCmpReviewHistoryById(Integer cmpId);

    void saveCmpTaskActionLog(String actionTypeCode, CmpTaskActionLogDto dto);

}
