package com.polus.fibicomp.cmp.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CmpActionRequestDto {

	private Integer cmpId;
	private Integer availableActionId;
	private String description;
	private Date expirationDate;
	private Date approvalDate;

}
