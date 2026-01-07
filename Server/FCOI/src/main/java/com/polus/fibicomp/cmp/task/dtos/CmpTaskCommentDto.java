package com.polus.fibicomp.cmp.task.dtos;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class CmpTaskCommentDto {

    private Integer cmpTaskCommentId;
    private Integer parentCommentId;
    private Integer taskId;
    private String comment;
    private Boolean isPrivate;
    private Boolean isResolved;
    private String resolvedBy;
    private String resolvedPersonName;
    private Timestamp resolvedTimestamp;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
    private List<CmpTaskCommentDto> childComments;
}
