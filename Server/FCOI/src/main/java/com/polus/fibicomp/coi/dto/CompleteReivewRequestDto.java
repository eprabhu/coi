package com.polus.fibicomp.coi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CompleteReivewRequestDto {

	private Integer disclosureId;
	private Integer disclosureNumber;
	private String description;

}
