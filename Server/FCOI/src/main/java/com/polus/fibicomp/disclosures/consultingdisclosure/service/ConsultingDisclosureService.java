package com.polus.fibicomp.disclosures.consultingdisclosure.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclAssignAdminDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclCommonDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclSubmitDto;

@Service
public interface ConsultingDisclosureService {

	ResponseEntity<Object> createConsultingDisclosure(String personId, String homeUnit);

	/**
	 * This method id used to submit consulting disclosure
	 * @param consultDisclSubmitDto
	 * @return consulting disclosure
	 */
    ResponseEntity<Object> submitConsultingDisclosure(ConsultDisclSubmitDto consultDisclSubmitDto);

    /**
	 * This method is used to withdraw consulting disclosure
	 * @param consultDisclCommonDto
	 * @return consulting disclosure
	 */
	ResponseEntity<Object> withdrawConsultingDisclosure(ConsultDisclCommonDto consultDisclCommonDto);

	/**
	 * This method used to return consulting disclosure
	 * @param consultDisclCommonDto
	 * @return consulting disclosure
	 */
	ResponseEntity<Object> returnConsultingDisclosure(ConsultDisclCommonDto consultDisclCommonDto);

	/**
	 * This method is used to assign consulting Disclosure admin
	 * @param consultDisclAssignAdminDto
	 * @return consulting disclosure
	 */
	ResponseEntity<Object> assignAdminConsultingDisclosure(ConsultDisclAssignAdminDto consultDisclAssignAdminDto);

	/**
	 * This method used to complete consulting disclosure
	 * @param disclosureId
	 * @return consulting disclosure
	 */
    ResponseEntity<Object> completeConsultingDisclosure(Integer discloureId);

    /**
	 * This method is used to get header details of consulting disclosure
	 * @param discloureId
	 * @return consulting disclosure
	 */
	ResponseEntity<Object> getConsultingDisclosure(Integer discloureId);

	/**
	 * This method is used to save entity details of consulting disclosure
	 * @param consultDisclCommonDto
	 * @return consulting disclosure
	 */
	ResponseEntity<Object> saveEntityDetails(ConsultDisclCommonDto consultDisclCommonDto);

}
