package com.polus.kcintegration.exception.error;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

	INVALID_TOKEN("The provided token is invalid.", HttpStatus.UNAUTHORIZED),
	USERNAME_EXTRACT_ERROR("Failed to extract the username from the token.", HttpStatus.UNAUTHORIZED),
	TOKEN_MISSING("Token is missing or invalid.", HttpStatus.UNAUTHORIZED),
	UNEXPECTED_ERROR("An unexpected error has occurred. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR),
	USERNAME_EMPTY("User name cannot be null or empty.", HttpStatus.BAD_REQUEST),
	PASSWORD_EMPTY("Password cannot be null or empty.", HttpStatus.BAD_REQUEST),
	INVALID_PAYLOAD("The request payload is invalid.", HttpStatus.BAD_REQUEST),
	USER_ALREADY_EXIST("The user %s with the specified details already exists.", HttpStatus.FORBIDDEN),
	INVALID_PASSWORD("The provided password is incorrect.", HttpStatus.BAD_REQUEST),
	INVALID_USER_DETAILS("The specified user details are invalid. The user does not exist.", HttpStatus.NOT_FOUND);

	private final String message;
	private final HttpStatus status;

}
