package com.polus.kcintegration.exception.global;

import java.net.ConnectException;
import java.time.LocalDateTime;

import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.exception.service.IntegrationExceptionLogService;
import com.polus.kcintegration.exception.vo.ExceptionResponse;

import jakarta.persistence.EntityNotFoundException;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@Autowired
	private IntegrationExceptionLogService integrationExceptionLogService;

	@ExceptionHandler(IntegrationCustomException.class)
	public final ResponseEntity<ExceptionResponse> handleCustomException(IntegrationCustomException ex, WebRequest request) {
		logger.error("IntegrationCustomException: {}", ex);
		integrationExceptionLogService.logException(ex, request, ex.getRequestObject());
		return createResponseEntity(ex, HttpStatus.BAD_REQUEST, "CUSTOM_ERROR");
	}

	@ExceptionHandler(EntityNotFoundException.class)
	public final ResponseEntity<ExceptionResponse> handleEntityNotFoundException(EntityNotFoundException ex, WebRequest request) {
		logger.error("EntityNotFoundException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.NOT_FOUND, "ENTITY_NOT_FOUND");
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public final ResponseEntity<ExceptionResponse> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
		logger.error("ConstraintViolationException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
	}

	@ExceptionHandler(ConnectException.class)
	public final ResponseEntity<ExceptionResponse> handleConnectException(ConnectException ex, WebRequest request) {
		logger.error("ConnectException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.SERVICE_UNAVAILABLE, "NETWORK_ERROR");
	}

	@ExceptionHandler(WebClientRequestException.class)
	public final ResponseEntity<ExceptionResponse> handleWebClientRequestException(WebClientRequestException ex, WebRequest request) {
		logger.error("WebClientRequestException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR, "WEB_CLIENT_REQUEST_EXCEPTION");
	}

	@ExceptionHandler(WebClientResponseException.class)
	public final ResponseEntity<ExceptionResponse> handleWebClientResponseExceptionn(WebClientResponseException ex, WebRequest request) {
		logger.error("WebClientResponseException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.NOT_FOUND, "WEB_CLIENT_RESPONSE_EXCEPTION");
	}

	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<ExceptionResponse> handleDataAccessException(DataAccessException ex, WebRequest request) {
		logger.error("DataAccessException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR, "DATA_ACCESS_EXCEPTION");
	}

	@ExceptionHandler(HttpServerErrorException.class)
	public ResponseEntity<ExceptionResponse> handleHttpServerErrorException(HttpServerErrorException ex, WebRequest request) {
		logger.error("HttpServerErrorException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR, "HTTP_SERVER_ERROR_EXCEPTION");
	}

	@ExceptionHandler(HttpClientErrorException.class)
	public ResponseEntity<ExceptionResponse> handleHttpClientErrorException(HttpClientErrorException ex, WebRequest request) {
		logger.error("HttpClientErrorException: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR, "HTTP_CLIENT_ERROR_EXCEPTION");
	}

	@ExceptionHandler(Exception.class)
	public final ResponseEntity<ExceptionResponse> handleAllExceptions(Exception ex, WebRequest request) {
		logger.error("Exception: {}", ex);
		integrationExceptionLogService.logException(ex, request, null);
		return createResponseEntity(ex, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
	}

	private ResponseEntity<ExceptionResponse> createResponseEntity(Exception ex, HttpStatus status, String message) {
		ExceptionResponse response = new ExceptionResponse();
		response.setTimestamp(LocalDateTime.now().toString());
		response.setStatus(status.value());
		response.setError(status.getReasonPhrase());
		response.setMessage(message);
		response.setDetails(ex.getMessage());
		return new ResponseEntity<>(response, status);
	}

}
