package com.polus.kcintegration.exception.custom;

public class IntegrationCustomException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	private Object requestObject;

	public IntegrationCustomException(String message, Throwable cause) {
		super(message, cause);
	}

	public IntegrationCustomException(String message, Throwable cause, Object requestObject) {
		super(message, cause);
		this.requestObject = requestObject;
	}

	public Object getRequestObject() {
		return requestObject;
	}

	public void setRequestObject(Object requestObject) {
		this.requestObject = requestObject;
	}

}
