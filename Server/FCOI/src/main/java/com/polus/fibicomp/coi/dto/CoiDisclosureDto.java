package com.polus.fibicomp.coi.dto;


import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.polus.core.person.pojo.Person;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiConflictStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureFcoiType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDispositionStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiRiskCategory;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiDisclosureDto {

	private Integer disclosureId;
	private String personId;
	private Person person;
	private String homeUnit;
	private String homeUnitName;
	private Integer disclosureNumber;
	private Integer versionNumber;
	private String versionStatus;
	private String conflictStatusCode;
	private String conflictStatus;
	private String dispositionStatusCode;
	private String dispositionStatus;
	private String reviewStatusCode;
	private String reviewStatus;
	private Date certifiedAt;
	private Timestamp expirationDate;
	private Boolean syncNeeded;
	private Timestamp updateTimestamp;
	private Timestamp createTimestamp;
	private String updateUserFullName;
	private String createUserFullName;
	private Integer adminGroupId;
	private String adminPersonId;
	private String disclosurePersonFullName;
	private String adminGroupName;
	private String adminPersonName;
	private String riskCategoryCode;
	private String revisionComment;
	private String actionType;
	private Integer moduleCode;
	private String moduleItemKey;
	private String coiProjectTypeCode;
	private String fcoiTypeCode;
	private DisclosureProjectDto projectDetail;
	private Integer numberOfSFI;
	private Integer numberOfProposals;
	private Integer numberOfAwards;
	private String personEmail;
	private String personPrimaryTitle;
	private CoiDisclosureFcoiType coiDisclosureFcoiType;
	private CoiConflictStatusType coiConflictStatusType;
	private CoiDispositionStatusType coiDispositionStatusType;
	private CoiReviewStatusType coiReviewStatusType;
	private CoiRiskCategory coiRiskCategory;
	private CoiProjectType coiProjectType;
	List<CoiSectionsType> coiSectionsTypes;
	private Integer personEntitiesCount;
	private Long personNotesCount;
	private Long personAttachmentsCount;
	private String certificationText;
	private Boolean withdrawalRequested;
	private String withdrawalRequestReason;
	private Boolean isExtended;
	private Integer subModuleCode;
	private String moduleItemId;
	private String subModuleItemKey;
	private String updateUser;
	private String logginPersonId;
	private Long disclosureAttachmentsCount;
	private Boolean isHomeUnitSubmission;

}
