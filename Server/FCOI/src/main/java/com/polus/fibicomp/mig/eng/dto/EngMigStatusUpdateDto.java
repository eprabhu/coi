package com.polus.fibicomp.mig.eng.dto;

import java.util.List;

import lombok.Data;

@Data
public class EngMigStatusUpdateDto {

	private String migrationStatus;
	private List<Integer> engagementIds;
}
