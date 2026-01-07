package com.polus.fibicomp.disclosures.consultingdisclosure.pojo;

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
@Table(name = "CONSULTING_DISCL_DISPOSITION_STATUS_TYPE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultingDisclDispositionStatusType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "DISPOSITION_STATUS_CODE")
	private String dispositionStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "SORT_ORDER")
	private String sortOrder;

}
