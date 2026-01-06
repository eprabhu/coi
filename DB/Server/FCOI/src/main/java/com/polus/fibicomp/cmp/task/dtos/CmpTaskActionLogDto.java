package com.polus.fibicomp.cmp.task.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CmpTaskActionLogDto {

	private Integer cmpId;
	private Integer taskId;
	private String taskType;
	private String taskStatus;
	private String assigneeName;
	private String adminName;
	private String comment;

}
