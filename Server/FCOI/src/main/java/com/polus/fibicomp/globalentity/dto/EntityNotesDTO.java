package com.polus.fibicomp.globalentity.dto;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EntityNotesDTO {

	private Integer noteId;
	private Integer entityId;
	private String title;
	private String content;
	private String updatedBy;
	private String updatedByFullName;
	private String sectionCode;
	private Timestamp updateTimestamp;

}
