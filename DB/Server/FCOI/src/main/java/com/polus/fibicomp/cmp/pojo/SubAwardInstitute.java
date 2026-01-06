package com.polus.fibicomp.cmp.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "SUB_AWARD_INSTITUTE")
public class SubAwardInstitute implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "INSTITUTE_TYPE_CODE")
	private String instituteTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
