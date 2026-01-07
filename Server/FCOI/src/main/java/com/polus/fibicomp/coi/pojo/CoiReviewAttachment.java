package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import com.polus.fibicomp.reviewcomments.pojos.DisclComponentType;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "REVIEW_ATTACHMENT")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiReviewAttachment implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ATTACHMENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer attachmentId;

	@Column(name = "COMMENT_ID")
	private Integer commentId;

	@JsonBackReference
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "REVIEW_ATTACHMENT_FK1"), name = "COMMENT_ID", referencedColumnName = "COMMENT_ID", insertable = false, updatable = false)
	private DisclComment disclComment;

	@Column(name = "COMPONENT_TYPE_CODE")
	private String componentTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "REVIEW_ATTACHMENT_FK2"), name = "COMPONENT_TYPE_CODE", referencedColumnName = "COMPONENT_TYPE_CODE", insertable = false, updatable = false)
	private DisclComponentType disclComponentType;

	@Column(name = "COMPONENT_REFERENCE_ID")
	private Integer componentReferenceId;

	@Column(name = "COMPONENT_REFERENCE_NUMBER")
	private String componentReferenceNumber;

	@Column(name = "ATTACHMENT_NUMBER")
	private Integer attachmentNumber;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

	@Column(name = "VERSION_STATUS")
	private String versionStatus;

	@Column(name = "ATTA_TYPE_CODE")
	private String attaTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "REVIEW_ATTACHMENT_FK3"), name = "ATTA_TYPE_CODE", referencedColumnName = "ATTA_TYPE_CODE", insertable = false, updatable = false)
	private DisclAttaType disclAttaType;

	@Column(name = "ATTA_STATUS_CODE")
	private String attaStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "REVIEW_ATTACHMENT_FK4"), name = "ATTA_STATUS_CODE", referencedColumnName = "ATTA_STATUS_CODE", insertable = false, updatable = false)
	private DisclAttaStatus disclAttaStatus;

	@Column(name = "DOCUMENT_OWNER_PERSON_ID")
	private String documentOwnerPersonId;

	@Column(name = "FILE_NAME")
	private String fileName;

	@Column(name = "MIME_TYPE")
	private String mimeType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "FILE_DATA_ID")
	private String fileDataId;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
