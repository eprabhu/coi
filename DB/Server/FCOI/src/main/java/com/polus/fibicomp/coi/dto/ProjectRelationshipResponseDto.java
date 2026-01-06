package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.coi.pojo.CoiConflictHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRelationshipResponseDto {

	private CoiConflictStatusTypeDto coiConflictStatusTypeDto;
	
	private List<CoiConflictHistory> coiConflictHistoryList;

	private String updateUserFullName;
	private Timestamp updateTimestamp;

}
