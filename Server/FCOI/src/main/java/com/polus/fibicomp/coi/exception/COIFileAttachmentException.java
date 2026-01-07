package com.polus.fibicomp.coi.exception;

public class COIFileAttachmentException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public COIFileAttachmentException(String message) {
        super(message);
    }

    public COIFileAttachmentException(String message, Throwable cause) {
        super(message, cause);
    }
}

