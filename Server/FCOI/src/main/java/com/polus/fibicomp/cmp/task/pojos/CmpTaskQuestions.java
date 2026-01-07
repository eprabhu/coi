package com.polus.fibicomp.cmp.task.pojos;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.sql.Timestamp;

@Table(name = "CMP_TASK_QUESTIONS")
@Entity
@Data
public class CmpTaskQuestions {

    @Id
    @Column(name = "CMP_TASK_QUESTION_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cmpTaskQuestionId;

    @Column(name = "TASK_ID")
    private Integer taskId;

    @ManyToOne
    @JoinColumn(name = "TASK_ID", referencedColumnName = "TASK_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_QUESTIONS_FK1"))
    private CmpTask cmpTask;

    @Column(name = "QUESTION")
    private String question;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
