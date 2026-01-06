package com.polus.fibicomp.globalentity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MarkDuplicateRequestDTO {

	private Integer originalEntityId;
	private Integer duplicateEntityId;
	private String description;

}
