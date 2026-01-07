package com.polus.fibicomp.mig.eng.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EngMigResponseDto {
	
	private long totalCount;
	private long excludedCount;
	private long toReviewCount;
	private long completedCount;
	private long inProgressCount;
}
