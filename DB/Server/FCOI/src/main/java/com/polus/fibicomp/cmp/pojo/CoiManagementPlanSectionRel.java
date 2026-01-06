package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MGMT_PLAN_SECTION_REL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanSectionRel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CMP_SECTION_REL_ID")
    private Integer cmpSectionRelId;

    @Column(name = "CMP_ID")
    private Integer cmpId;

    @ManyToOne
    @JoinColumn(name = "CMP_ID", referencedColumnName = "CMP_ID", insertable = false, updatable = false,
                foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_SECTION_REL_FK1"))
    private CoiManagementPlan coiManagementPlan;

    @Column(name = "SECTION_NAME")
    private String sectionName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "CREATED_BY")
	private String createdBy;

}
