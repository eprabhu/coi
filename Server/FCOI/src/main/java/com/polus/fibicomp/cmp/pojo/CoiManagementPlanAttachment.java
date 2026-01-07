package com.polus.fibicomp.cmp.pojo;

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
@Table(name = "COI_MANAGEMENT_PLAN_ATTACHMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanAttachment implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ATTACHMENT_ID")
	private Integer attachmentId;

	@Column(name = "ATTACHMENT_NUMBER")
	private Integer attachmentNumber;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

	@Column(name = "CMP_ID")
	private Integer cmpId;

	@Column(name = "ATTACHMENT_TYPE_CODE")
	private String attaTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "FILE_NAME")
	private String fileName;

	@Column(name = "MIME_TYPE")
	private String mimeType;

	@Column(name = "FILE_DATA_ID")
	private String fileDataId;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@ManyToOne(optional = true)
	@JoinColumn(name = "CMP_ID", referencedColumnName = "CMP_ID", foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_ATTACHMENT_FK1"), insertable = false, updatable = false)
	private CoiManagementPlan coiManagementPlan;

	@ManyToOne(optional = true)
	@JoinColumn(name = "ATTACHMENT_TYPE_CODE", referencedColumnName = "ATTA_TYPE_CODE", foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_ATTACHMENT_FK2"), insertable = false, updatable = false)
	private CoiManagementPlanAttaType cmpAttaType;

}