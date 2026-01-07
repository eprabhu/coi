package com.polus.fibicomp.coi.vo;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Unit;
import com.polus.core.roles.pojo.AdminGroup;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureDetailDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.pojo.CoiProjConflictStatusType;
import com.polus.fibicomp.coi.pojo.CoiProjectAward;
import com.polus.fibicomp.coi.pojo.CoiProjectProposal;
import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.coi.pojo.CoiReviewActivity;
import com.polus.fibicomp.coi.pojo.CoiReviewCommentAttachment;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import com.polus.fibicomp.coi.pojo.EntityRiskCategory;
import com.polus.fibicomp.coi.pojo.EntityStatus;
import com.polus.fibicomp.coi.pojo.EntityType;
import com.polus.fibicomp.coi.pojo.PerEntDisclTypeSelection;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelType;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.pojo.PersonEnttityFormBuilderDetails;
import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiConflictStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjectEntityRel;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosure;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosureStatusType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConflictOfInterestVO {

	private CoiDisclosureDto coiDisclosure;

	private Person person;

	private Integer numberOfSFI;

	private PersonEntity personEntity;

	private Entity coiEntity;

	private String personId;

	private List<DisclosureDetailDto> proposals;

	private List<DisclosureDetailDto> awards;

	private DisclosureProjectDto projectDetail;

	private String searchString;

	private List<EntityStatus> entityStatus;

	private List<EntityType> entityType;

	private List<ValidPersonEntityRelType> validPersonEntityRelTypes;

	private List<CoiConflictStatusType> coiConflictStatusTypes;

	private List<CoiDisclosureType> coiDisclosureTypes;

	private List<PersonEntityRelationship> personEntityRelationships;

	private PersonEntityRelationship personEntityRelationship;

	private List<PersonEntity> personEntities;

	private Integer moduleCode;

	private String moduleItemId;

	private List<CoiDisclProjectEntityRel> disclProjectEntityRels;

	private Integer disclosureId;

	private Boolean sfiCompleted;

	private Integer conflictIdentifiedCount;

	private Integer newSubmissionsCount;

	private Integer unassignedCount;

	private Integer pendingEntityApproval;

	private Integer reviewCommentsCount;

	private String revisionComment;

	private Integer submoduleCode;

	private String disclosureSequenceStatusCode;

	private List<CoiDisclosure> coiDisclosures;

	private Integer coiFinancialEntityId;

    private List<CoiSectionsType> coiSectionsType;

	private CoiReview coiReview;

	private List<CoiReview> coiReviews;

	private List<AdminGroup> adminGroup;

	private List<CoiReviewActivity> coiReviewActivitys;

	private List<CoiReviewCommentAttachment> coiReviewCommentAttachment;

	private String disclosureStatusCode;

	private Integer numberOfProposal;

	private Integer numberOfAward;

	private Integer coiSubSectionsId;

	private  String coiSectionsTypeCode;

	private long commentCount;

	private List<Integer> tagGroupId;

	private String sort;

	private CoiDisclProjectEntityRel coiDisclEntProjDetail;

	private String disclosureCategoryType;

	private String proposalIdlinkedInDisclosure;

	private Integer disclosureNumber;

	private Boolean proposalDisclosureWithNoSfi;

	private Integer coiEntityId;

	private String entityStatusCode;

	private Integer inProgressDisclosureCount;

	private Integer approvedDisclosureCount;

	private Integer travelDisclosureCount;

	private Integer consultDisclCount;

	private Integer disclosureHistoryCount;

	private String filterType;

	private List<Entity> entityList;

	private Boolean isActive;

	private CoiTravelDisclosure coiTravelDisclosure;

	private List<CoiTravelDisclosure> coiTravelDisclosureList;

	private List<PersonEntity> personEntityList;

	private List<CoiProjectType> coiProjectTypes;

	private List<PersonEntityRelType> personEntityRelType;

	private Integer personEntityId;

	private CoiProjectProposal coiProjectProposal;

	private CoiProjectAward coiProjectAward;

	private String tabName;

	private String disclosureTypeCode;

	private Integer travelDisclosureId;

	private Integer travelNumber;

	private Integer versionNumber;

	private String versionStatus;

	private Integer entityId;

	private Integer entityNumber;

	private String travelStatusCode;

	private Boolean isSponsoredTravel;

	private String travelTitle;

	private String purposeOfTheTrip;

	private BigDecimal travelAmount;

	private Date travelStartDate;

	private Date travelEndDate;

	private Integer noOfDays;

	private String destinationCity;

	private String destinationCountry;

	private String relationshipToYourResearch;

	private String acknowledgeBy;

	private String acknowledgeAt;

	private Timestamp updateTimeStamp;

	private String updateUser;

	private String createUser;

	private Timestamp createTimeStamp;

	private String travelState;

	private Boolean isInternationalTravel;

	private Integer travelTravellerId;

	private Integer travellerDisclosureId;

	private List<String> travellerTypeCode;

	private String reviewStatus;

	private Integer entityCount;

	private String homeUnit;

	private List<CoiProjConflictStatusType> coiProjConflictStatusTypes;

	private Date travelSubmissionDate;

	private List<EntityRiskCategory> entityRiskCategories;

	private String description;

	private Unit travellerUnitDetails;

	private String disclosureStatus;

	private String dispositionStatus;

	private String reviewStatusCode;

	private String versionStatusCode;

	private String dispositionStatusCode;

	private CoiReviewStatusType coiReviewStatusTypeDetalis;

	private CoiTravelDisclosureStatusType coiTravelDisclosureStatusDetails;

	private String conflictStatusCode;

	private String Comment;

	private Integer coiDisclProjectEntityRelId;

	private String documentOwnerPersonId;

	private Integer pageNumber;

	private Integer currentPage;

	private Integer count;

	private String searchWord;

	private List<DisclComment> DisclComments;

	private Integer componentSubRefId;

	private List<OPADisclosure> opaDisclosure;

	private Integer personEntitiesCount;

	private Long personNotesCount;

	private Long personAttachmentsCount;

	private Boolean isSfiProjectMapping;

	private String reporterFullName;

	private Boolean canShowEngLinkToFcoiInfo;

	private List<String> unifiedPersonEntityRelationships;

	private List<PerEntDisclTypeSelection> perEntDisclTypeSelections;

	private List<EntityFamilyTreeRole> entityFamilyTreeRoles;

	public List<PersonEnttityFormBuilderDetails> perEntFormBuilderDetails;

	private EntityComplianceInfo complianceInfo;

	private String sortType;

}
