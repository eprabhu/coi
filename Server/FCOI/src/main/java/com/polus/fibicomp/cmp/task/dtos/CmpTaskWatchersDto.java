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
public class CmpTaskWatchersDto {

    private Integer cmpTaskWatcherId;
    private String watcherPersonId;
    private String watcherPersonName;
    private Integer taskId;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String updateUserFullName;
    private String actionType;
}
