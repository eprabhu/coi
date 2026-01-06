package com.polus.dnb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "DNB_INDUSTRY_CAT_INFO")
public class DnBIndustryCatInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_DNB_INDUSTRY_CAT_INFO")
	@SequenceGenerator(name = "SEQ_DNB_INDUSTRY_CAT_INFO", sequenceName = "SEQ_DNB_INDUSTRY_CAT_INFO", allocationSize = 1)
	@Column(name = "ID")
	private Integer id;

	@Column(name = "DUNS_NUMBER", length = 50)
	private String dunsNumber;

	@Column(name = "INDUSTRY_TYPE", length = 50)
	private String industryType;

	@Column(name = "TYPE_DESCRIPTION", length = 255)
	private String typeDescription;

	@Column(name = "INDUSTRY_CODE", length = 50)
	private String industryCode;

	@Column(name = "CODE_DESCRIPTION", length = 255)
	private String codeDescription;
}
