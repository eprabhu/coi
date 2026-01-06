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

@Table(name = "CMP_TASK_QUESTION_ANS")
@Entity
@Data
public class CmpTaskQuestionAnswers {

    @Id
    @Column(name = "TASK_QUESTION_ANS_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskQuestionAnsId;

    @Column(name = "CMP_TASK_QUESTION_ID")
    private Integer cmpTaskQuestionId;

    @ManyToOne
    @JoinColumn(name = "CMP_TASK_QUESTION_ID", referencedColumnName = "CMP_TASK_QUESTION_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_QUESTION_ANS_FK1"))
    private CmpTaskQuestions cmpTaskQuestion;

    @Column(name = "ANSWER")
    private String answer;

    @Column(name = "ANSWERED_BY")
    private String answeredBy;

    @Column(name = "ANSWERED_TIMESTAMP")
    private Timestamp answeredTimestamp;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
