package com.polus.fibicomp.coi.vo;

import java.sql.Timestamp;

public class ProposalView {

	private String proposalNumber;

	private String documentNumber;

	protected Integer versionNumber;

	private String title;

	private String leadUnitNumber;

	private String leadUnit;

	private String sponsorCode;

	private String sponsor;

	private Timestamp deadLinedate;

	private Integer statusCode;

	private String status;

	private Timestamp updateTimeStamp;

	private String updateUser;

	private String personId;

	private String fullName;

	private String totalCost;

	private boolean certified;

	private String proposalPersonRoleCode;
	
    private String homeUnit;
	
	private Timestamp submissionDate;
	
	private String accountNumber;
	
	
	public String getHomeUnit() {
		return homeUnit;
	}

	public void setHomeUnit(String homeUnit) {
		this.homeUnit = homeUnit;
	}

	public Timestamp getSubmissionDate() {
		return submissionDate;
	}

	public void setSubmissionDate(Timestamp submissionDate) {
		this.submissionDate = submissionDate;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getProposalNumber() {
		return proposalNumber;
	}

	public void setProposalNumber(String proposalNumber) {
		this.proposalNumber = proposalNumber;
	}

	public String getDocumentNumber() {
		return documentNumber;
	}

	public void setDocumentNumber(String documentNumber) {
		this.documentNumber = documentNumber;
	}

	public Integer getVersionNumber() {
		return versionNumber;
	}

	public void setVersionNumber(Integer versionNumber) {
		this.versionNumber = versionNumber;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getLeadUnitNumber() {
		return leadUnitNumber;
	}

	public void setLeadUnitNumber(String leadUnitNumber) {
		this.leadUnitNumber = leadUnitNumber;
	}

	public String getLeadUnit() {
		return leadUnit;
	}

	public void setLeadUnit(String leadUnit) {
		this.leadUnit = leadUnit;
	}

	public String getSponsorCode() {
		return sponsorCode;
	}

	public void setSponsorCode(String sponsorCode) {
		this.sponsorCode = sponsorCode;
	}

	public String getSponsor() {
		return sponsor;
	}

	public void setSponsor(String sponsor) {
		this.sponsor = sponsor;
	}

	public Timestamp getDeadLinedate() {
		return deadLinedate;
	}

	public void setDeadLinedate(Timestamp deadLinedate) {
		this.deadLinedate = deadLinedate;
	}

	public Integer getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(Integer statusCode) {
		this.statusCode = statusCode;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Timestamp getUpdateTimeStamp() {
		return updateTimeStamp;
	}

	public void setUpdateTimeStamp(Timestamp updateTimeStamp) {
		this.updateTimeStamp = updateTimeStamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public String getPersonId() {
		return personId;
	}

	public void setPersonId(String personId) {
		this.personId = personId;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(String totalCost) {
		this.totalCost = totalCost;
	}

	public boolean isCertified() {
		return certified;
	}

	public void setCertified(boolean certified) {
		this.certified = certified;
	}

	public String getProposalPersonRoleCode() {
		return proposalPersonRoleCode;
	}

	public void setProposalPersonRoleCode(String proposalPersonRoleCode) {
		this.proposalPersonRoleCode = proposalPersonRoleCode;
	}

}
