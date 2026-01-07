package com.polus.fibicomp.opa.dto;

import lombok.*;

import java.sql.Timestamp;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OPAActionLogDto {

	private Integer actionLogId;
	private Integer opaDisclosureId;
	private String opaDisclosureNumber;
	private String actionTypeCode;
	private String description;
	private String comment;
	private Timestamp updateTimestamp;
	private String updateUser;
	private String updateUserFullName;
}
