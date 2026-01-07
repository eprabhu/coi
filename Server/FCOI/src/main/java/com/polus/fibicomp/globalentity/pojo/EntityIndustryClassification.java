package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
//import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_INDUSTRY_CLASSIFICATION")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityIndustryClassification implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_INDUSTRY_CLASS_ID")
    private int entityIndustryClassId;

	@Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_INDUSTRY_CLASS_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "INDUSTRY_CATEGORY_ID")
    private int industryCategoryId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_INDUSTRY_CLASS_FK2"), name = "INDUSTRY_CATEGORY_ID", referencedColumnName = "INDUSTRY_CATEGORY_ID", insertable = false, updatable = false)
    private IndustryCategoryCode industryCategoryCode;

    @Column(name = "IS_PRIMARY")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrimary;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
