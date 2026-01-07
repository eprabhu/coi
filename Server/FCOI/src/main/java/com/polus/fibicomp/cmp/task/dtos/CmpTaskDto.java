package com.polus.fibicomp.cmp.task.dtos;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskStatus;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CmpTaskDto {

    private Integer taskId;
    private String taskTypeCode;
    private CmpTaskType cmpTaskType;
    private String taskStatusCode;
    private CmpTaskStatus cmpTaskStatus;
    private String assigneePersonId;
    private String assigneePersonName;
    private Timestamp assignedOn;
    private String description;
    private Timestamp dueDate;
    private Timestamp completionTimestamp;
    private Integer cmpId;
    private Timestamp createTimestamp;
    private String createdBy;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
    private String createUserFullName;
    private List<CmpTaskQuestionsDto> cmpTaskQuestions;
    private List<CmpTaskWatchersDto> cmpTaskWatchers;
    private List<CmpTaskAttachmentDto> cmpTaskAttachments;
    private List<CmpTaskCommentDto> cmpTaskComments;

}
