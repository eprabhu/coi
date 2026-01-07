package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Table(name = "COI_PROJECT_PROPOSAL_STATUS_V")
@Data
public class CoiProposalStatusType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "STATUS_CODE")
	private String statusCode;

	@Column(name = "DESCRIPTION")
	private String description;

}
