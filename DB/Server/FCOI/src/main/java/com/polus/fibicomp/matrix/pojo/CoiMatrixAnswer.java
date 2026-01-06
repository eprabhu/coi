package com.polus.fibicomp.matrix.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.polus.fibicomp.coi.pojo.PersonEntityRelType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "PER_ENT_MATRIX_ANSWER")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiMatrixAnswer implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MATRIX_ANSWER_ID", nullable = false)
    private Integer matrixAnswerId;

    @Column(name = "PERSON_ENTITY_ID")
    private Integer personEntityId;

    @Column(name = "PERSON_ENTITY_NUMBER")
    private Integer personEntityNumber;

    @Column(name = "MATRIX_QUESTION_ID")
    private Integer matrixQuestionId;

    @Column(name = "COLUMN_VALUE")
    private String columnValue;

    @Column(name = "RELATIONSHIP_TYPE_CODE")
    private String relationshipTypeCode;

    @Column(name = "COMMENTS")
    private String comments;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @JsonIgnore
    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MATRIX_ANSWER_FK1"), name = "RELATIONSHIP_TYPE_CODE", referencedColumnName = "RELATIONSHIP_TYPE_CODE", insertable = false, updatable = false)
    private PersonEntityRelType relationshipType;

    @JsonIgnore
    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_MATRIX_ANSWER_FK2"), name = "MATRIX_QUESTION_ID", referencedColumnName = "MATRIX_QUESTION_ID", insertable = false, updatable = false)
    private CoiMatrixQuestion coiMatrixQuestion;

}
