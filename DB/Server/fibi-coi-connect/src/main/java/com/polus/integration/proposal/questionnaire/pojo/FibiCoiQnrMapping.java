package com.polus.integration.proposal.questionnaire.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FIBI_COI_QNR_MAPPING")
public class FibiCoiQnrMapping implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "QNR_MAPPING_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer qnrMappingId;
	
	@Column(name = "SOURCE_QNR_ID")
	private Integer sourceQnrId;

	@Column(name = "SOURCE_QNR_NUM")
	private Integer sourceQnrNum;

	@Column(name = "FIBI_QNR_ID")
	private Integer fibiQnrId;

	@Column(name = "FIBI_QNR_NUM")
	private Integer fibiQnrNum;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@JsonBackReference
	@OneToMany(mappedBy = "qnrMapping", orphanRemoval = true, cascade = { CascadeType.ALL }, fetch = FetchType.LAZY)
	private List<FibiCoiQnrQstnMapping> questions;

}
