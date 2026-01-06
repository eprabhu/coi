package com.polus.fibicomp.coi.dto;


public class CoiConflictStatusTypeDto {

	private String conflictStatusCode;
	private String description;
	private Boolean isActive;

	public String getConflictStatusCode() {
		return conflictStatusCode;
	}

	public void setConflictStatusCode(String conflictStatusCode) {
		this.conflictStatusCode = conflictStatusCode;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Boolean getActive() {
		return isActive;
	}

	public void setActive(Boolean active) {
		isActive = active;
	}
}
