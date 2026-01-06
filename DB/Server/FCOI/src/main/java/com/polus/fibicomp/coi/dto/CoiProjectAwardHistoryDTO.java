package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiProjectAwardHistoryDTO {

	private String comment;
	private String description;
	private String awardNumber;
	private String updateUserFullName;
	private Timestamp updateTimestamp;

}
