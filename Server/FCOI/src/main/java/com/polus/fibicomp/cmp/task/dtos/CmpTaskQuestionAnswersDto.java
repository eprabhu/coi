package com.polus.fibicomp.cmp.task.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.sql.Timestamp;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CmpTaskQuestionAnswersDto {

    private Integer taskQuestionAnsId;
    private Integer cmpTaskQuestionId;
    private String answer;
    private String answeredBy;
    private String answeredPersonName;
    private Timestamp answeredTimestamp;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
}
