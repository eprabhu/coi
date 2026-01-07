package com.polus.fibicomp.opa.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_ACTION_LOG_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OPAActionLogType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "MESSAGE")
	private String message;

}
