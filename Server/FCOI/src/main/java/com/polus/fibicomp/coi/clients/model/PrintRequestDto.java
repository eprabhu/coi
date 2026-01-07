package com.polus.fibicomp.coi.clients.model;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrintRequestDto {

	private Integer moduleItemCode;
	private Integer moduleItemKey;
	private Integer moduleItemNumber;
	private Integer moduleSubItemCode;
	private List<String> letterTemplateTypeCodes;
	private String fileType;

}
