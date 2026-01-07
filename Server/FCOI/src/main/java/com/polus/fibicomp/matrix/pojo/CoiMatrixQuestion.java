package com.polus.fibicomp.matrix.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "PER_ENT_MATRIX_QUESTION")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiMatrixQuestion implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "MATRIX_QUESTION_ID")
	private Integer matrixQuestionId;

	@Column(name = "COLUMN_LABEL")
	private String columnLabel;

	@Column(name = "ANSWER_TYPE_CODE")
	private String answerTypeCode;

	@Column(name = "LOOKUP_TYPE")
	private String lookupType;

	@Column(name = "LOOKUP_VALUE")
	private String lookupValue;

	@Column(name = "GROUP_ID")
	private Integer groupId;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "SORT_ID")
	private Integer sortId;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MATRIX_QUESTION_FK1"), name = "GROUP_ID", referencedColumnName = "GROUP_ID", insertable = false, updatable = false)
	private CoiMatrixGroup coiMatrixGroup;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MATRIX_QUESTION_FK2"), name = "ANSWER_TYPE_CODE", referencedColumnName = "ANSWER_TYPE_CODE", insertable = false, updatable = false)
	private CoiMatrixAnswerType coiMatrixAnswerType;

}
