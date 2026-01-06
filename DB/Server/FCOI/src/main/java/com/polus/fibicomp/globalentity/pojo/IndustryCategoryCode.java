package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Data
@Table(name = "INDUSTRY_CATEGORY_CODE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IndustryCategoryCode implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "INDUSTRY_CATEGORY_ID")
	private int industryCategoryId;

	@Column(name = "INDUSTRY_CATEGORY_CODE")
	private String industryCategoryCode;

	@Column(name = "INDUSTRY_CATEGORY_TYPE_CODE")
	private String industryCategoryTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "INDUSTRY_CATEGORY_CODE_FK1"), name = "INDUSTRY_CATEGORY_TYPE_CODE", referencedColumnName = "INDUSTRY_CATEGORY_TYPE_CODE", insertable = false, updatable = false)
	private IndustryCategoryType industryCategoryType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "IS_ACTIVE")
	private String isActive;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
