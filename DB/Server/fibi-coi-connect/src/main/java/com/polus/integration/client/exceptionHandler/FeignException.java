package com.polus.integration.client.exceptionHandler;

public class FeignException extends RuntimeException {

    private String errorBody;
    private int statusCode;

    public FeignException(String message) {
        super(message);
    }

    public FeignException(String message, String errorBody, int statusCode) {
        super(message);
        this.errorBody = errorBody;
        this.statusCode = statusCode;
    }

    public String getErrorBody() {
        return errorBody;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
