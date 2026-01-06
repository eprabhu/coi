package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "COI_ATTA_CATE_TYPE_MAPPING")
@EntityListeners(AuditingEntityListener.class)
public class CoiAttachmentCateTypeMapping implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_ATTA_CATE_TYPE_MAPPING_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer attachmentCateTypeMappingId;
	
	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "COI_ATTA_CATEGORY_TYPE_CODE")
	private String attachmentCategoryTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_ATTA_CATE_TYPE_MAPPING_FK1"), name = "COI_ATTA_CATEGORY_TYPE_CODE", referencedColumnName = "COI_ATTA_CATEGORY_TYPE_CODE", insertable = false, updatable = false)
	private CoiAttachmentCategoryType attachmentCategoryType;

	@Column(name = "COI_ATTA_TYPE_CODE")
	private String attachmentTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_ATTA_CATE_TYPE_MAPPING_FK2"), name = "COI_ATTA_TYPE_CODE", referencedColumnName = "COI_ATTA_TYPE_CODE", insertable = false, updatable = false)
	private CoiAttachmentType attachmentType;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	public Integer getAttachmentCateTypeMappingId() {
		return attachmentCateTypeMappingId;
	}

	public void setAttachmentCateTypeMappingId(Integer attachmentCateTypeMappingId) {
		this.attachmentCateTypeMappingId = attachmentCateTypeMappingId;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getAttachmentCategoryTypeCode() {
		return attachmentCategoryTypeCode;
	}

	public void setAttachmentCategoryTypeCode(String attachmentCategoryTypeCode) {
		this.attachmentCategoryTypeCode = attachmentCategoryTypeCode;
	}

	public CoiAttachmentCategoryType getAttachmentCategoryType() {
		return attachmentCategoryType;
	}

	public void setAttachmentCategoryType(CoiAttachmentCategoryType attachmentCategoryType) {
		this.attachmentCategoryType = attachmentCategoryType;
	}

	public String getAttachmentTypeCode() {
		return attachmentTypeCode;
	}

	public void setAttachmentTypeCode(String attachmentTypeCode) {
		this.attachmentTypeCode = attachmentTypeCode;
	}

	public CoiAttachmentType getAttachmentType() {
		return attachmentType;
	}

	public void setAttachmentType(CoiAttachmentType attachmentType) {
		this.attachmentType = attachmentType;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}
}
