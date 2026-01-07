package com.polus.fibicomp.fcoiDisclosure.exception;

public class FileAttachmentException extends RuntimeException{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public FileAttachmentException(String message) {
		super(message);
	}

	public FileAttachmentException(String message, Throwable cause) {
		super(message, cause);
	}
}
