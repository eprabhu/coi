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

@Table(name = "CMP_TASK_ATTACHMENT")
@Entity
@Data
public class CmpTaskAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ATTACHMENT_ID")
    private Integer attachmentId;

    @Column(name = "TASK_ID")
    private Integer taskId;

    @ManyToOne
    @JoinColumn(name = "TASK_ID", referencedColumnName = "TASK_ID", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "CMP_TASK_ATTACHMENT_FK1"))
    private CmpTask cmpTask;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "CONTENT_TYPE")
    private String contentType;

    @Column(name = "FILE_DATA_ID")
    private String fileDataId;

    @Column(name = "VERSION_NUMBER")
    private Integer versionNumber;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "DOCUMENT_ID")
    private Integer documentId;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
}
