package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

public class CoiTravelDisclosureActionsDto {

	private String reviewStatus;
	private String reviewStatusCode;
	private String documentStatusCode;
	private String documentStatus;
	private String versionStatus;
	private String travelDisclosureStatus;
	private String travelDisclosureStatusCode;
	private String acknowledgeBy;
	private Timestamp acknowledgeAt;
	private String certifiedBy;
	private Timestamp certifiedAt;
	private String description;
	private Timestamp updateTimestamp;

	public String getReviewStatus() {
		return reviewStatus;
	}

	public void setReviewStatus(String reviewStatus) {
		this.reviewStatus = reviewStatus;
	}

	public String getReviewStatusCode() {
		return reviewStatusCode;
	}

	public void setReviewStatusCode(String reviewStatusCode) {
		this.reviewStatusCode = reviewStatusCode;
	}

	public String getDocumentStatusCode() {
		return documentStatusCode;
	}

	public void setDocumentStatusCode(String documentStatusCode) {
		this.documentStatusCode = documentStatusCode;
	}

	public String getDocumentStatus() {
		return documentStatus;
	}

	public void setDocumentStatus(String documentStatus) {
		this.documentStatus = documentStatus;
	}

	public String getVersionStatus() {
		return versionStatus;
	}

	public void setVersionStatus(String versionStatus) {
		this.versionStatus = versionStatus;
	}

	public String getTravelDisclosureStatus() {
		return travelDisclosureStatus;
	}

	public void setTravelDisclosureStatus(String travelDisclosureStatus) {
		this.travelDisclosureStatus = travelDisclosureStatus;
	}

	public String getTravelDisclosureStatusCode() {
		return travelDisclosureStatusCode;
	}

	public void setTravelDisclosureStatusCode(String travelDisclosureStatusCode) {
		this.travelDisclosureStatusCode = travelDisclosureStatusCode;
	}

	public String getAcknowledgeBy() {
		return acknowledgeBy;
	}

	public void setAcknowledgeBy(String acknowledgeBy) {
		this.acknowledgeBy = acknowledgeBy;
	}

	public Timestamp getAcknowledgeAt() {
		return acknowledgeAt;
	}

	public void setAcknowledgeAt(Timestamp acknowledgeAt) {
		this.acknowledgeAt = acknowledgeAt;
	}

	public String getCertifiedBy() {
		return certifiedBy;
	}

	public void setCertifiedBy(String certifiedBy) {
		this.certifiedBy = certifiedBy;
	}

	public Timestamp getCertifiedAt() {
		return certifiedAt;
	}

	public void setCertifiedAt(Timestamp certifiedAt) {
		this.certifiedAt = certifiedAt;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

}
