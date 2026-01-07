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
@Table(name = "COI_MGMT_PLAN_TMPL_SEC_MAPPING")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiMgmtPlanTmplSecMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TMPL_SEC_MAPPING_ID")
    private Integer tmplSecMappingId;

    @Column(name = "SECTION_ID")
    private Integer sectionId;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_TMPL_SEC_MAPPING_FK1"), name = "SECTION_ID", referencedColumnName = "SECTION_ID", insertable = false, updatable = false)
	private CoiManagementPlanSection coiManagementPlanSection;
    
    @Column(name = "TEMPLATE_ID")
    private Integer templateId;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_TMPL_SEC_MAPPING_FK2"), name = "TEMPLATE_ID", referencedColumnName = "TEMPLATE_ID", insertable = false, updatable = false)
	private CoiManagementPlanTemplate coiManagementPlanTemplate;

    @Column(name = "NAME")
    private String name;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
