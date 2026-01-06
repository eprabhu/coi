package com.polus.fibicomp.cmp.task.pojos;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Table(name = "CMP_TASK_TYPE")
@Entity
@Data
public class CmpTaskType {

    @Id
    @Column(name = "TASK_TYPE_CODE")
    private String taskTypeCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive;
}
