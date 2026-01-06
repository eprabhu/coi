package com.polus.fibicomp.coi.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AwardPersonDTO {

	private String projectNumber;
	private List<String> projectNumbers;
	private String keyPersonId;
	private String newDisclosureRequired;
	private String comment;

}
