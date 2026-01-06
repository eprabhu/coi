package com.polus.fibicomp.matrix.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.fibicomp.coi.pojo.PersonEntityRelType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "PER_ENT_MATRIX_REL_MAPPING")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MatrixPersonRelMapping implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "MAPPING_CODE")
    private String mappingCode;

    @Column(name = "RELATIONSHIP_TYPE_CODE")
    private String relationshipTypeCode;

    @Column(name = "MATRIX_QUESTION_ID")
    private Integer matrixQuestionId;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "MATRIX_PERSON_REL_MAPPING_FK1"), name = "RELATIONSHIP_TYPE_CODE", referencedColumnName = "RELATIONSHIP_TYPE_CODE", insertable = false, updatable = false)
    private PersonEntityRelType relationshipType;

    @ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "MATRIX_PERSON_REL_MAPPING_FK2"), name = "MATRIX_QUESTION_ID", referencedColumnName = "MATRIX_QUESTION_ID", insertable = false, updatable = false)
    private CoiMatrixQuestion coiMatrixQuestion;

}
