package com.polus.fibicomp.compliance.declaration.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "DECLARATION_PERSON_ELIGIBILITY ")
@AllArgsConstructor
@NoArgsConstructor
public class DeclarationPersonEligibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PERSON_ELIGIBILITY_ID ")
    private Integer declarationPersonEligibilityId;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "DECLARATION_TYPE_CODE")
    private String declarationTypeCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "DECLARATION_PERSON_ELIGIBILITY_FK1"), name = "DECLARATION_TYPE_CODE", referencedColumnName = "DECLARATION_TYPE_CODE", insertable = false, updatable = false)
    private CoiDeclarationType declarationType;

    @Column(name = "CAN_CREATE_DECLARATION")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean canCreateDeclaration;

    @Column(name = "ADMIN_FORCE_ALLOWED_TO_CREATE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean adminForceAllowedToCreate;

    @Column(name = "VERSION_STATUS")
    private String versionStatus;

    @Column(name = "VERSION_NUMBER")
    private Integer versionNumber;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
