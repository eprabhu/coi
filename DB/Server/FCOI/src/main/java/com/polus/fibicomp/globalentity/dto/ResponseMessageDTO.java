package com.polus.fibicomp.globalentity.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseMessageDTO {

	public ResponseMessageDTO() {
	}

	public ResponseMessageDTO(String message) {
		this.message = message;
	}

	public ResponseMessageDTO(String message, Integer id) {
		this.message = message;
		this.id = id;
	}

	private String message;
	private Integer id;

}
