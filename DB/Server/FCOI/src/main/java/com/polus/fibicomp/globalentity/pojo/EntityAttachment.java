package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
//import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_ATTACHMENT")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityAttachment implements Serializable {

	 private static final long serialVersionUID = 1L;

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "ENTITY_ATTACHMENT_ID")
	    private Integer entityAttachmentId;

	    @Column(name = "ATTACHMENT_NUMBER")
	    private Integer attachmentNumber;

	    @Column(name = "VERSION_NUMBER")
	    private Integer versionNumber;

	    @Column(name = "VERSION_STATUS")
	    private String versionStatus;

	    @Column(name = "ENTITY_ID")
		private Integer entityId;

		@ManyToOne(optional = true)
		@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_ATTACH_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
		private Entity entity;

	    @Column(name = "COMMENT")
	    private String comment;

	    @Column(name = "ATTACHMENT_TYPE_CODE")
	    private String attachmentTypeCode;

	    @ManyToOne(optional = true)
	    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_ATTACH_FK2"), name = "ATTACHMENT_TYPE_CODE", referencedColumnName = "ATTACHMENT_TYPE_CODE", insertable = false, updatable = false)
	    private EntityAttachmentType attachmentType;

	    @Column(name = "ATTACHMENT_STATUS_CODE")
	    private String attachmentStatusCode;

	    @ManyToOne(optional = true)
	    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_ATTACH_FK3"), name = "ATTACHMENT_STATUS_CODE", referencedColumnName = "ATTACHMENT_STATUS_CODE", insertable = false, updatable = false)
	    private EntityAttachmentStatusType attachmentStatus;

	    @Column(name = "FILE_NAME")
	    private String fileName;

	    @Column(name = "MIME_TYPE")
	    private String mimeType;

	    @Column(name = "FILE_DATA_ID")
	    private String fileDataId;

	    @Column(name = "UPDATE_TIMESTAMP")
	    private Timestamp updateTimestamp;

	    @Column(name = "UPDATED_BY")
	    private String updatedBy;

}
