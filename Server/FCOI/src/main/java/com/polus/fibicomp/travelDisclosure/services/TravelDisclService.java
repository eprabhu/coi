package com.polus.fibicomp.travelDisclosure.services;

import java.sql.SQLException;
import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclValidateDto;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclosureDto;

public interface TravelDisclService {

    /**
     * Create Travel Disclosure
     * @param vo
     * @return
     */
    ResponseEntity<Object> createCoiTravelDisclosure(CoiTravelDisclosureDto vo);

    /**
     * Update Travel Disclosure
     * @param vo
     * @return
     */
    ResponseEntity<Object> updateCoiTravelDisclosure(CoiTravelDisclosureDto vo);

    /**
     * Load travel disclosure
     * @param travelDisclosureId
     * @return
     */
    ResponseEntity<Object> loadTravelDisclosure(Integer travelDisclosureId);

    /**
     *
     * @param dto
     * @return
     */
    ResponseEntity<Object> assignAdmin(CoiTravelDisclosureDto dto);

    /**
     *
     * @param travelDisclosureId
     * @return
     */
    ResponseEntity<Object> fetchHistory(Integer travelDisclosureId);

    /**
     *
     * @param dto
     * @return
     */
    ResponseEntity<Object> certifyTravelDisclosure(@Valid CoiTravelDisclosureDto dto);

    /**
     *
     * @param dto
     * @return
     */
    ResponseEntity<Object> withdrawTravelDisclosure(@Valid CoiTravelDisclosureDto dto);

    /**
     *
     * @param dto
     * @return
     */
    ResponseEntity<Object> returnTravelDisclosure(@Valid CoiTravelDisclosureDto dto);

    /**
     *
     * @param dto
     * @return
     */
    ResponseEntity<Object> approveTravelDisclosure(@Valid CoiTravelDisclosureDto dto);

    /**
     *
     * @param personEntityNumber
     * @return
     */
    ResponseEntity<Object> getRelatedDisclosures(Integer personEntityNumber);

    /**
     *
     * @return
     */
    ResponseEntity<Object> getLookups();

    /**
     * Validates reimbursement costs and processes for a given person entity.
     * 
     * @param personEntityNumber the unique identifier of the person entity
     * @param travlDisclosureId the unique identifier of the travel disclosure
     * @param personEntity the person entity representing the engagement linked to the travel disclosure
     * @return list of validation results containing cost and process validation details
     */
    List<CoiTravelDisclValidateDto> validateReimbursementCostAndProcess(Integer personEntityNumber, Integer travlDisclosureId, PersonEntity personEntity) throws SQLException;

	void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage,
			String updateUser);

    /**
     * This method is used to check if travel disclosure is created for the given engagement
     * @param personEntityId
     * @param personId
     * @return true if disclosure created, false if not
     */
	Boolean isTravelDisclosureCreated(Integer personEntityId, String personId);

}
