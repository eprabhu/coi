package com.polus.fibicomp.globalentity.dto;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EntityAttachmentResponseDTO {

	private Integer entityAttachmentId;
    private Integer attachmentNumber;
    private Integer versionNumber;
    private String versionStatus;
    private Integer entityId;
    private String comment;
    private String attachmentTypeCode;
    private String attachmentType;
    private String attachmentStatusCode;
    private String attachmentStatus;
    private String fileName;
    private String mimeType;
    private String fileDataId;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullname;

}
