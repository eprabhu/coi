package com.polus.fibicomp.coi.pojo;

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

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ATTACHMENTS")
public class Attachments implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ATTACHMENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer attachmentId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ATTACHMENTS1_FK1"), name = "ATTA_TYPE_CODE", referencedColumnName = "ATTA_TYPE_CODE", insertable = false, updatable = false)
	private DisclAttaType disclAttaTypeDetails;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "ATTA_TYPE_CODE")
	private String attaTypeCode;

	@Column(name = "FILE_NAME")
	private String fileName;

	@Column(name = "MIME_TYPE")
	private String mimeType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "FILE_DATA_ID")
	private String fileDataId;

    @CreatedBy
    @Column(name = "CREATED_BY")
    private String createdBy;

    @CreatedDate
    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "ATTACHMENT_NUMBER")
	private Integer attachmentNumber;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

}
