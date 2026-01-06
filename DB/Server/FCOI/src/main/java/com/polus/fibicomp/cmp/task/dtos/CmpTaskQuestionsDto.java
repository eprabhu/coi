package com.polus.fibicomp.cmp.task.dtos;

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
public class CmpTaskQuestionsDto {

    private Integer cmpTaskQuestionId;
    private Integer taskId;
    private String question;
    private String description;
    private Timestamp createTimestamp;
    private String createdBy;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
    private String createUserFullName;
    private String actionType;
    private List<CmpTaskQuestionAnswersDto> cmpTaskQuestionAnswers;

}
