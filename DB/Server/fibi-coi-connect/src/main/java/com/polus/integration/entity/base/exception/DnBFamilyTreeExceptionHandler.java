package com.polus.integration.entity.base.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class DnBFamilyTreeExceptionHandler{

	
	@ExceptionHandler(UpwardFamilyTreeDnBAPIException.class)
	public ProblemDetail ErrorInUpwardFamilyTree(UpwardFamilyTreeDnBAPIException ex) {		
		return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}
	
	@ExceptionHandler(EntityDnBAPIException.class)
	public ProblemDetail EntityDnBAPIException(EntityDnBAPIException ex) {		
		return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}
	
	
	
	@ExceptionHandler(DunsDnBSearchAPIException.class)
	public ProblemDetail ErrorDunsSearch(DunsDnBSearchAPIException ex) {		
		return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}
	
	
}
