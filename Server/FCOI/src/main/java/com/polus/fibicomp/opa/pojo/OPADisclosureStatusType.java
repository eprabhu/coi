package com.polus.fibicomp.opa.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OPA_DISCLOSURE_STATUS_TYPE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPADisclosureStatusType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "OPA_DISCLOSURE_STATUS_CODE")
	private String opaDisclosureStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;


	
}
