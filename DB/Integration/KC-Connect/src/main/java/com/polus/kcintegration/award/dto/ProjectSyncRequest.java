package com.polus.kcintegration.award.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSyncRequest {

	private String personId;

	private List<String> projectNumbers;

	private List<String> proposalNumbers;

}
