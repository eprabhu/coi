package com.polus.integration.proposal.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateDisclosureVO {

	private String moduleCode;

	private Integer moduleItemKey;

	private String personId;
}
