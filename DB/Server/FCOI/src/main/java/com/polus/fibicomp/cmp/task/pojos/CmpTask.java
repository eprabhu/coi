package com.polus.fibicomp.cmp.task.pojos;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
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

@Table(name = "CMP_TASK")
@Entity
@Data
public class CmpTask {

    @Id
    @Column(name = "TASK_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskId;

    @Column(name = "TASK_TYPE_CODE")
    private String taskTypeCode;

    @ManyToOne
    @JoinColumn(name = "TASK_TYPE_CODE", referencedColumnName = "TASK_TYPE_CODE", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_FK1"))
    private CmpTaskType cmpTaskType;

    @Column(name = "TASK_STATUS_CODE")
    private String taskStatusCode;

    @ManyToOne
    @JoinColumn(name = "TASK_STATUS_CODE", referencedColumnName = "TASK_STATUS_CODE", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_FK2"))
    private CmpTaskStatus cmpTaskStatus;

    @Column(name = "ASSIGNEE_PERSON_ID")
    private String assigneePersonId;

    @Column(name = "ASSIGNED_ON")
    private Timestamp assignedOn;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "DUE_DATE")
    private Timestamp dueDate;

    @Column(name = "CMP_ID")
    private Integer cmpId;

    @ManyToOne
    @JoinColumn(name = "CMP_ID", referencedColumnName = "CMP_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_FK3"))
    private CoiManagementPlan coiManagementPlan;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "COMPLETION_TIMESTAMP")
    private Timestamp completionTimestamp;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
