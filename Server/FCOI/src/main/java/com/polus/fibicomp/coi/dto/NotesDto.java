package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotesDto {

	private Integer noteId;
	private String title;
	private String personId;
	private String content;
	private String updatedBy;
	private String updatedByFullName;
	private Timestamp updateTimestamp;

}
