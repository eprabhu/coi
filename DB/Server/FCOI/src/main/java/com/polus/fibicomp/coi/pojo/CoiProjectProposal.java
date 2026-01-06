package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "COI_PROJECT_PROPOSAL")
@EntityListeners(AuditingEntityListener.class)
public class CoiProjectProposal implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "EXTERNAL_SYSTEM_REF_ID")
	private Integer externalSystemReference;
	
	@Column(name = "COI_PROJECT_TYPE_CODE")
	private String coiProjectTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_PROJECT_PROPOSAL_FK1"), name = "COI_PROJECT_TYPE_CODE", referencedColumnName = "COI_PROJECT_TYPE_CODE", insertable = false, updatable = false)
	private CoiProjectType coiProjectType;
	
	@Column(name = "PROPOSAL_NUMBER")
	private String proposalNumber;

	@Column(name = "TITLE")
	private String title;
	
	@Column(name = "PI_PERSON_ID")
	private String piPersonId;
	
	@Column(name = "PI_NAME")
	private String piName;
	
	@Column(name = "SPONSOR_NAME")
	private String sponsorName;
	
	@Column(name = "PRIME_SPONSOR_NAME")
	private String primeSponsorName;
	
	@Column(name = "PROPOSAL_START_DATE")
	private Date proposalStartDate;
	
	@Column(name = "PROPOSAL_END_DATE")
	private Date proposalEndDate;

	@Column(name = "LEAD_UNIT_NAME")
	private String leadUnitName;
	
	@Column(name = "FED_AT")
	private Timestamp fedAt;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getExternalSystemReference() {
		return externalSystemReference;
	}

	public void setExternalSystemReference(Integer externalSystemReference) {
		this.externalSystemReference = externalSystemReference;
	}

	public String getCoiProjectTypeCode() {
		return coiProjectTypeCode;
	}

	public void setCoiProjectTypeCode(String coiProjectTypeCode) {
		this.coiProjectTypeCode = coiProjectTypeCode;
	}

	public CoiProjectType getCoiProjectType() {
		return coiProjectType;
	}

	public void setCoiProjectType(CoiProjectType coiProjectType) {
		this.coiProjectType = coiProjectType;
	}

	public String getProposalNumber() {
		return proposalNumber;
	}

	public void setProposalNumber(String proposalNumber) {
		this.proposalNumber = proposalNumber;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getPiPersonId() {
		return piPersonId;
	}

	public void setPiPersonId(String piPersonId) {
		this.piPersonId = piPersonId;
	}

	public String getPiName() {
		return piName;
	}

	public void setPiName(String piName) {
		this.piName = piName;
	}

	public String getSponsorName() {
		return sponsorName;
	}

	public void setSponsorName(String sponsorName) {
		this.sponsorName = sponsorName;
	}

	public String getPrimeSponsorName() {
		return primeSponsorName;
	}

	public void setPrimeSponsorName(String primeSponsorName) {
		this.primeSponsorName = primeSponsorName;
	}

	public Date getProposalStartDate() {
		return proposalStartDate;
	}

	public void setProposalStartDate(Date proposalStartDate) {
		this.proposalStartDate = proposalStartDate;
	}

	public Date getProposalEndDate() {
		return proposalEndDate;
	}

	public void setProposalEndDate(Date proposalEndDate) {
		this.proposalEndDate = proposalEndDate;
	}

	public String getLeadUnitName() {
		return leadUnitName;
	}

	public void setLeadUnitName(String leadUnitName) {
		this.leadUnitName = leadUnitName;
	}

	public Timestamp getFedAt() {
		return fedAt;
	}

	public void setFedAt(Timestamp fedAt) {
		this.fedAt = fedAt;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}
	
}
