package com.polus.fibicomp.globalentity.exception;

public class EntityFileAttachmentException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public EntityFileAttachmentException(String message) {
        super(message);
    }

    public EntityFileAttachmentException(String message, Throwable cause) {
        super(message, cause);
    }
}

