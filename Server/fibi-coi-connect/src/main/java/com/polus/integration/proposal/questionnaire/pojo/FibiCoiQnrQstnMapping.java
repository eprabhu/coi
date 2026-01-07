package com.polus.integration.proposal.questionnaire.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FIBI_COI_QNR_QSTN_MAPPING")
public class FibiCoiQnrQstnMapping implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@JsonManagedReference
	@ManyToOne(optional = false)
    @JoinColumn(name = "QNR_MAPPING_ID")
	private FibiCoiQnrMapping qnrMapping;

	@Column(name = "SOURCE_QSTN_ID")
	private Integer sourceQstnId;

	@Column(name = "SOURCE_QSTN_NUM")
	private Integer sourceQstnNum;

	@Column(name = "SOURCE_QSTN_DATA_TYPE")
	private String sourceQstnDataType;

	@Column(name = "FIBI_QSTN_ID")
	private Integer fibiQstnId;

	@Column(name = "FIBI_QSTN_NUM")
	private Integer fibiQstnNum;

	@Column(name = "FIBI_QSTN_DATA_TYPE")
	private String fibiQstnDataType;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
