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

@Table(name = "CMP_TASK_COMMENTS")
@Entity
@Data
public class CmpTaskComment {

    @Id
    @Column(name = "CMP_TASK_COMMENT_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cmpTaskCommentId;

    @Column(name = "PARENT_COMMENT_ID")
    private Integer parentCommentId;

    @Column(name = "TASK_ID")
    private Integer taskId;

    @ManyToOne
    @JoinColumn(name = "TASK_ID", referencedColumnName = "TASK_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_COMMENTS_FK1"))
    private CmpTask cmpTask;

    @Column(name = "COMMENTS")
    private String comment;

    @Column(name = "IS_PRIVATE")
    private Boolean isPrivate;

    @Column(name = "IS_RESOLVED")
    private Boolean isResolved;

    @Column(name = "RESOLVED_BY")
    private String resolvedBy;

    @Column(name = "RESOLVED_TIMESTAMP")
    private Timestamp resolvedTimestamp;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
