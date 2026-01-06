package com.polus.kcintegration.exception.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionResponse {

	private int status;

	private String error;

	private String message;

	private String details;

	private String timestamp;

}
