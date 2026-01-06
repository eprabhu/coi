package com.polus.fibicomp.mig.eng.dto;

import lombok.Data;

@Data
public class EngDetailRequestDto {

	private String tab;
	private String filter;
	private int pageNumber;
	private int pageLimit;

}
