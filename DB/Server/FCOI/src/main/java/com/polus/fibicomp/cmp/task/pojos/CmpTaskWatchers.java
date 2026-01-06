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

@Table(name = "CMP_TASK_WATCHER")
@Entity
@Data
public class CmpTaskWatchers {

    @Id
    @Column(name = "CMP_TASK_WATCHER_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cmpTaskWatcherId;

    @Column(name = "WATCHER_PERSON_ID")
    private String watcherPersonId;

    @Column(name = "TASK_ID")
    private Integer taskId;

    @ManyToOne
    @JoinColumn(name = "TASK_ID", referencedColumnName = "TASK_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_WATCHER_FK1"))
    private CmpTask cmpTask;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
