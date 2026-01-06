package com.polus.fibicomp.compliance.declaration.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "COI_DECL_ACTION_LOG_TYPE")
@Getter
@Setter
public class CoiDeclActionLogType {

	@Id
	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@Column(name = "ACTION_MESSAGE")
	private String actionMessage;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
