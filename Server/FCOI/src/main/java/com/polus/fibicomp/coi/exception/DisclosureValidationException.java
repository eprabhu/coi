package com.polus.fibicomp.coi.exception;

public class DisclosureValidationException extends RuntimeException {
    /**
	 * Custom exception thrown when validation fails during Initial or Revision Disclosure creation.
	 */
	private static final long serialVersionUID = 1L;

	 public DisclosureValidationException(String message) {
		 super(message);
	 }
}

