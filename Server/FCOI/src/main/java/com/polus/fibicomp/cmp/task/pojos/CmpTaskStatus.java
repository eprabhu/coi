package com.polus.fibicomp.cmp.task.pojos;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Table(name = "CMP_TASK_STATUS")
@Entity
@Data
public class CmpTaskStatus {

    @Id
    @Column(name = "TASK_STATUS_CODE")
    private String taskStatusCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive;
}
