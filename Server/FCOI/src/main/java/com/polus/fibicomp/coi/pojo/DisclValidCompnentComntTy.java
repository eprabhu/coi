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

import com.polus.fibicomp.reviewcomments.pojos.DisclCommentType;
import com.polus.fibicomp.reviewcomments.pojos.DisclComponentType;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "DISCL_VALID_COMPNENT_COMNT_TY")
@EntityListeners(AuditingEntityListener.class)
public class DisclValidCompnentComntTy implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "COMPONENT_TYPE_CODE")
	private String componentTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "DISCL_VALID_CMPNENT_COMNT_TY_FK1"), name = "COMPONENT_TYPE_CODE", referencedColumnName = "COMPONENT_TYPE_CODE", insertable = false, updatable = false)
	private DisclComponentType disclComponentType;
	
	@Column(name = "COMMENT_TYPE_CODE")
	private String commentType;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "DISCL_VALID_CMPNENT_COMNT_TY_FK2"), name = "COMMENT_TYPE_CODE", referencedColumnName = "COMMENT_TYPE_CODE", insertable = false, updatable = false)
	private DisclCommentType disclCommentType;
	
	@Column(name = "DESCRIPTION")
	private String description;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getComponentTypeCode() {
		return componentTypeCode;
	}

	public void setComponentTypeCode(String componentTypeCode) {
		this.componentTypeCode = componentTypeCode;
	}

	public DisclComponentType getDisclComponentType() {
		return disclComponentType;
	}

	public void setDisclComponentType(DisclComponentType disclComponentType) {
		this.disclComponentType = disclComponentType;
	}

	public String getCommentType() {
		return commentType;
	}

	public void setCommentType(String commentType) {
		this.commentType = commentType;
	}

	public DisclCommentType getDisclCommentType() {
		return disclCommentType;
	}

	public void setDisclCommentType(DisclCommentType disclCommentType) {
		this.disclCommentType = disclCommentType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

}
