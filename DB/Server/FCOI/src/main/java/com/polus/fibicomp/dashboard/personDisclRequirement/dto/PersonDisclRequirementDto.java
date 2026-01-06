package com.polus.fibicomp.dashboard.personDisclRequirement.dto;

import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDisclRequirementDto {

    private Integer personDisclRequirementId;
    private String personId;
    private String personFullName;
    private String unitName;
    private String unitNumber;
    private String displayName;
    private String appointmentTitle;
    private Boolean isFaculty;
    private String email;
    private Boolean canCreateOPA;;
    private Boolean createOpaAdminForceAllowed;
    private String opaExemptionReason;
    private Timestamp opaExemptFromDate;
    private Timestamp opaExemptToDate;
    private Boolean isExemptFromOPA;
    private Timestamp updateTimestamp;
    private Integer versionNumber;
    private String versionStatus;
    private String updateUserFullName;
    private Boolean canView;
    private Boolean canEdit;
    private Boolean hasPendingDisclosure;
}
