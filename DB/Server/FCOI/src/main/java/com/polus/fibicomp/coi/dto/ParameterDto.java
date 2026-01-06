package com.polus.fibicomp.coi.dto;

import com.polus.core.pojo.FileType;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Builder
@Data
public class ParameterDto {

    private Boolean showEntityMigrationPhase;
    private List<FileType> fileTypes;
    private List<CoiProjectType> coiProjectTypes;
    private List<CoiDisclosureType> coiDisclosureTypes;
    private Boolean isUnifiedQuestionnaireEnabled;
    private String engagementFlowType;
    private Boolean showEntityComplianceRisk;
    private Boolean enableEditForDisclosureUnit; 
    private Boolean isEnableEntityDunsMatch;
    private Boolean coiActionListSortingEnabled;
    private Boolean coiNotesTabEnabled;
    private Boolean coiAttachmentsTabEnabled;
    private String travelDisclosureFlowType;
    private Boolean allowFcoiWithoutProjects;
    private String engagementTypeForCoiDisclosure;
    private Boolean enableKeyPersonDisclosureComments;
    private Boolean isEnableLegacyEngMig;
    private Boolean isDisclosureRequired;
    private Boolean isSfiEvaluationEnabled;
    private Boolean canDeleteEngagement;
    private List<CoiDeclarationType> declarationTypes;
    private String opaApprovalFlowType;
    private Boolean isStartDateOfInvolvementMandatory;
    private String fcoiApprovalFlowType;
    private Boolean enableRouteLogUserAddOpaReviewer;
    private Map<String, Boolean> declarationEligibilityMap;

}
