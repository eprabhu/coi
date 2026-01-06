package com.polus.fibicomp.coi.pojo;

import com.polus.core.person.pojo.Person;
import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;

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
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "PERSON_DISCL_REQUIREMENT")
public class PersonDisclRequirement implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "PERSON_DISCL_REQUIREMENT_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer personDisclRequirementId;

    @Column(name = "PERSON_ID")
    private String personId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "PERSON_DISCL_REQUIREMENT_FK_1"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
    private Person person;

    @Column(name = "CAN_CREATE_OPA")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean canCreateOPA;

    @Column(name = "IS_OPA_RULE_BASED")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isOpaRuleBased;

    @Column(name = "CREATE_OPA_ADMIN_FORCE_ALLOWED")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean createOpaAdminForceAllowed;

    @Column(name = "IS_EXEMPT_FROM_OPA")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isExempFromOpa;

    @Column(name = "OPA_EXEMPT_FROM_DATE")
    private Timestamp opaExemptFromDate;

    @Column(name = "OPA_EXEMPT_TO_DATE")
    private Timestamp opaExemptToDate;

    @Column(name = "OPA_EXEMPTION_REASON")
    private String opaExemptionReason;

    @Column(name = "VERSION_NUMBER")
    private Integer versionNumber;

    @Column(name = "VERSION_STATUS")
    private String versionStatus;

    @CreatedBy
    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
