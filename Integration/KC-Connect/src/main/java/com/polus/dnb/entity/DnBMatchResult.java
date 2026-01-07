package com.polus.dnb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DNB_MATCH_RESULT")
public class DnBMatchResult {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_DNB_MATCH_RESULT")
	@SequenceGenerator(name = "SEQ_DNB_MATCH_RESULT", sequenceName = "SEQ_DNB_MATCH_RESULT", allocationSize = 1)
	@Column(name = "ID", nullable = false)
	private Integer id;

	@Column(name = "SOURCE_DATA_CODE", length = 50)
	private String sourceDataCode;

	@Column(name = "DUNS_NUMBER", length = 50)
	private String dunsNumber;

	@Column(name = "CONFIDENCE_CODE")
	private Integer confidenceCode;

	@Column(name = "ELEMENT_ORDER_NUMBER")
	private Integer elementOrderNumber;

	@Lob
	@Column(name = "DNB_DATA")
	private String dnbData;

}
