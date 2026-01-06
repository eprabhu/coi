package com.polus.fibicomp.opa.pojo;

import com.polus.core.person.pojo.Person;
import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

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
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;

@Entity
@Table(name = "OPA_DISCL_PERSON_SNAP")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPADisclPersonSnap implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "OPA_DISCL_PERSON_SNAP_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer opaDisclPersonSnapId;


    @Column(name = "OPA_DISCLOSURE_ID")
    private Integer opaDisclosureId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCL_PERSON_SNAP_FK_1"), name = "OPA_DISCLOSURE_ID",
            referencedColumnName = "OPA_DISCLOSURE_ID", insertable = false, updatable = false)
    private OPADisclosure opaDisclosure;

    @Column(name = "PERSON_ID")
    private String personId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCL_PERSON_SNAP_FK_2"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
    private Person person;

    @Column(name = "JOB_TITLE")
    private String jobTitle;

    @Column(name = "HR_ORG_UNIT_ID")
    private String hrOrgUnitId;

    @Column(name = "HR_DEPARTMENT_NAME")
    private String hrDepartmentName;

    @Column(name = "ADMIN_EMPLOYEE_TYPE")
    private String adminEmployeeType;

    @Column(name = "ADMIN_ORG_UNIT_TITLE")
    private String adminOrgUnitTitle;

    @Column(name = "ADMIN_POSITION_TITLE")
    private String adminPositionTitle;

    @Column(name = "EMPLOYMENT_PERCENT")
    private BigDecimal employmentPercent;

    @Column(name = "IS_CONSULT_PRIV")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isConsultPriv;

    @Column(name = "IS_PAID_APPT")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isPaidAppt;

    @Column(name = "IS_SUMMER_SESSION_APPT")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isSummerSessionAppt;

    @Column(name = "IS_SABBATICAL")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isSabbatical;

    @Column(name = "OPA_REQUIREMENT_REASON")
    private String opaRequirementReason;

    @Column(name = "IS_RULE_BASED")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isRuleBased;

    @Column(name = "SABBATICAL_BEGIN_DATE")
    private Date sebbaticalBeginDate;

    @Column(name = "SABBATICAL_END_DATE")
    private Date sebbaticalEndDate;

    @CreatedDate
    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;
}
