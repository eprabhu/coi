package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.Data;

@Entity
@Table(name = "COI_CONFLICT_HISTORY")
@EntityListeners(AuditingEntityListener.class)
@Data
public class CoiConflictHistory implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_CONFLICT_HISTORY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiConflictHistoryId;

	@Column(name = "COI_DISCL_PROJECT_ENTITY_REL_ID")
	private Integer coiDisclProjectEntityRelId;

	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;

	@Column(name = "MESSAGE")
	private String message;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "CONFLICT_STATUS_CODE")
	private String conflictStatusCode;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Transient
	private String updateUserFullName;

	@Transient
	private String conflictStatusDescription;

}
