package com.polus.fibicomp.disclosures.consultingdisclosure.dto;

import lombok.*;

import java.sql.Timestamp;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ConsultDisclActionLogDto {

	private Integer actionLogId;

	private Integer disclosureId;

	private String actionTypeCode;

	private String description;

	private String comment;

	private Timestamp updateTimestamp;

	private String updateUser;

	private String updateUserFullName;

}
