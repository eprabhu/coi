package com.polus.fibicomp.cmp.task.dtos;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@RequiredArgsConstructor
public class CmpTaskAttachmentDto {

    private Integer attachmentId;
    private Integer taskId;
    private String fileName;
    private String contentType;
    private String fileDataId;
    private Integer versionNumber;
    private String description;
    private Integer documentId;
    private Timestamp createTimestamp;
    private String createdBy;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
    private String createUserFullName;
    private String actionType;
}
