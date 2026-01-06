package com.polus.integration.pojo;

import java.io.Serializable;


import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FIBI_COI_CONNECT_DUMMY")
public class FibiCOIConnectDummy implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "DUMMY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer dummyId;

	@Column(name = "TYPE_CODE")
	private String typeCode;

	@Column(name = "PROPOSAL_ID")
	private Integer proposalId;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "UNIT_NUMBER")
	private String unitNumber;
}
