package com.polus.fibicomp.travelDisclosure.dtos;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import javax.validation.constraints.NotNull;

import com.polus.core.person.pojo.Person;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.customValidation.AtLeastOneNotNull;
import com.polus.fibicomp.customValidation.validationGroups.AssignAdminValidation;
import com.polus.fibicomp.customValidation.validationGroups.CertifyValidation;
import com.polus.fibicomp.customValidation.validationGroups.CreateValidation;
import com.polus.fibicomp.customValidation.validationGroups.UpdateValidation;
import com.polus.fibicomp.customValidation.validationGroups.WithdrawValidation;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDestinations;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDocumentStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelReviewStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelerStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.TravelFormBuilderDetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@JsonInclude(JsonInclude.Include.NON_NULL)
@AtLeastOneNotNull(fields = {"adminGroupId", "adminPersonId"}, message = "Either adminGroupId or adminPersonId must be provided", groups = AssignAdminValidation.class)
public class CoiTravelDisclosureDto {

    @NotNull(message = "Disclosure ID cannot be null", groups = {UpdateValidation.class, AssignAdminValidation.class, CertifyValidation.class, WithdrawValidation.class})
    private Integer travelDisclosureId;
    @NotNull(message = "Disclosure Number cannot be null", groups = {AssignAdminValidation.class, CertifyValidation.class, WithdrawValidation.class})
    private Integer travelNumber;
    private Integer versionNumber;
    private String versionStatus;
    @NotNull(message = "Engagement ID cannot be null", groups = {CreateValidation.class, UpdateValidation.class})
    private Integer personEntityId;
    private PersonEntity personEntity;
    private Integer personEntityNumber;
    @NotNull(message = "Entity ID cannot be null", groups = {CreateValidation.class, UpdateValidation.class})
    private Integer entityId;
    private Entity Entity;
    private Integer entityNumber;
    private String personId;
    private Person person;
    private String travellerHomeUnit;
    private String travelTitle;
    private String purposeOfTheTrip;
    private String relationshipToPhsDoe;
//    private List<CoiTravelDisclosureTraveler> travelers;
    private List<CoiTravelDestinations> travelDestinations;
//    private List<CoiTravelFundingAgencies> travelFundingAgencies;
    private String travelStatusCode;
    private CoiTravelerStatusType coiTravelerStatusType;
    private BigDecimal reimbursedCost;
    private Date travelStartDate;
    private Date travelEndDate;
    private Date travelSubmissionDate;
    private Integer adminGroupId;
    private String adminPersonId;
    private String certifiedBy;
    private Timestamp certifiedAt;
    @NotNull(message = "Disclosure Number cannot be null", groups = CertifyValidation.class)
    private String certificationText;
    private Timestamp expirationDate;
    private String documentStatusCode;
    private CoiTravelDocumentStatusType travelDocumentStatusType;
    private String reviewStatusCode;
    private CoiTravelReviewStatusType travelReviewStatusType;
    @NotNull(message = "Funding Type cannot be null", groups = CreateValidation.class)
    private String travelerFundingTypeCode;
    private CoiTravelFundingType travelFundingType;
    private String updatedBy;
    private Timestamp updateTimestamp;
    private String createdBy;
    private Timestamp createTimestamp;
    private String updateUserFullName;
    private String createUserFullName;
    private Integer personEntitiesCount;
    private Long personNotesCount;
    private Long personAttachmentsCount;
//    @NotNull(message = "ActionType cannot be null", groups = AssignAdminValidation.class)
    private String actionType;
    private String adminGroupName;
    private String adminPersonName;
    @NotNull(message = "ActionType cannot be null", groups = WithdrawValidation.class)
    private String description;
    private Integer formBuilderId;
    TravelFormBuilderDetails travelFormBuilderDetail;
    private String travellers;
    private CoiTravelDisclValidateDto disclValidatedObject;
    private List<String> destinations;
    private String reviewStatus;
    private String documentStatusDescription;
    private Boolean isHomeUnitSubmission;
}
