package com.polus.fibicomp.travelDisclosure.dao;

import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclValidateDto;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclosureDto;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosure;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosureStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDocumentStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingAgencyType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelReviewStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.TravelFormBuilderDetails;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TravelDisclDao {

    Object save(Object entity);

    CoiTravelDisclosure findByTravelDisclosureId(Integer travelDisclosureId);

    /**
     * Validate admin person is already assigned or note
     * @param adminPersonId
     * @param travelDisclosureId
     * @return
     */
    boolean isAdminAlreadyAssigned(Integer adminGroup, String adminPersonId,
                                          Integer travelDisclosureId);

    /**
     * Travel Lookups
     * @return
     */
    List<CoiTravelDisclosureStatusType> getAllCoiTravelDisclosureStatusType();
    List<CoiTravelDocumentStatusType> getAllCoiTravelDocumentStatusType();
    List<CoiTravelFundingAgencyType> getAllCoiTravelFundingAgencyType();
    List<CoiTravelFundingType> getAllCoiTravelFundingType();
    List<CoiTravelReviewStatusType> getAllCoiTravelReviewStatusType();
    List<ValidPersonEntityRelType> getTravelRelationshipTypes();

    List<CoiTravelDisclValidateDto> getReimbursementValidatedDetails(Integer personEntityNumber);

    Integer maxDisclosureNumber();

    void changeReviewStatus(String reviewStatusCode, Timestamp updateTimestamp,
                            String updatedBy, Integer travelDisclosureId);

    Boolean isReviewStatusIsNotIn(Integer travelDisclosureId, List<String> reviewStatusCodes);

    Boolean isReviewStatusIsIn(Integer travelDisclosureId, List<String> reviewStatusCodes);

    void assignAdmin(String adminPersonId, Integer adminGroupId, String updatedBy,
                     Timestamp updateTimestamp, String reviewStatusCode, Integer travelDisclosureId);

    String findAdminPersonIdByTravelDisclosureId(Integer travelDisclosureId);

    void certify(String certifiedBy, Timestamp currentTimestamp, String certificationText,
                 String reviewStatusCode, Integer travelDisclosureId, Timestamp expirationDate);

    Boolean isAlreadyCertified(Integer travelDisclosureId);

    void changeReviewStatusAndDocumentStatusCode(String reviewStatusCode, String documentStatusCode,
                                                 Timestamp updateTimestamp, String updatedBy, Integer travelDisclosureId);

    List<CoiTravelDisclosureDto> findCoiTravelDisclosureByPersonEntityNumber(Integer personEntityNumber);

    TravelFormBuilderDetails findTravelFormBuilderDetailsByTravelDisclosureId(Integer travelDisclosureId);

    CoiTravelDocumentStatusType findTravelDocumentStatusTypeById(String travelDocumentStatusCode);

    CoiTravelReviewStatusType findTravelReviewStatusTypeById(String travelReviewStatusCode);

    void removeRelationShipIfNotUsed(Integer personEntityId, Integer travelSelfRelationship, Boolean isSystemCreated, Integer travelDisclosureId);

    String findPersonIdByTravelDisclosureId(Integer travelDisclosureId);

    /**
     * This method is used to update disclosure header update details
     * @param disclosureId
     */
    Timestamp updateDisclosureUpdateDetails(Integer disclosureId);

    /**
     * This method is used to check if travel disclosure is created for the given engagement
     * @param personEntityId
     * @param personId
     * @return true if disclosure created, false if not
     */
	Boolean isTravelDisclosureCreated(Integer personEntityId, String personId);

	/**
     * This method is used to synchronize engagement details with the given travel disclosure.
     * 
     * @param coiTravelDisclosure the travel disclosure object containing engagement details to be synced
     */
	void syncEngagementDetails(CoiTravelDisclosure coiTravelDisclosure);

}
