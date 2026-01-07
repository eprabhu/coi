package com.polus.fibicomp.coi.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Map;

public class CoiTravelHistoryDto {

	private Integer travelDisclosureId;
	private String travelEntityName;
	private String entityType;
	private String country;
	private String travelTitle;
	private String purposeOfTheTrip;
	private String destinationCity;
	private String destinationState;
	private String destinationCountry;
	private BigDecimal travelAmount;
	private Date travelStartDate;
	private Date travelEndDate;
	Map<String, String> travellerTypeCodeList;

	public Integer getTravelDisclosureId() {
		return travelDisclosureId;
	}

	public void setTravelDisclosureId(Integer travelDisclosureId) {
		this.travelDisclosureId = travelDisclosureId;
	}

	public String getTravelEntityName() {
		return travelEntityName;
	}

	public void setTravelEntityName(String travelEntityName) {
		this.travelEntityName = travelEntityName;
	}

	public String getEntityType() {
		return entityType;
	}

	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getTravelTitle() {
		return travelTitle;
	}

	public void setTravelTitle(String travelTitle) {
		this.travelTitle = travelTitle;
	}

	public String getPurposeOfTheTrip() {
		return purposeOfTheTrip;
	}

	public void setPurposeOfTheTrip(String purposeOfTheTrip) {
		this.purposeOfTheTrip = purposeOfTheTrip;
	}

	public String getDestinationCity() {
		return destinationCity;
	}

	public void setDestinationCity(String destinationCity) {
		this.destinationCity = destinationCity;
	}

	public String getDestinationState() {
		return destinationState;
	}

	public void setDestinationState(String destinationState) {
		this.destinationState = destinationState;
	}

	public String getDestinationCountry() {
		return destinationCountry;
	}

	public void setDestinationCountry(String destinationCountry) {
		this.destinationCountry = destinationCountry;
	}

	public BigDecimal getTravelAmount() {
		return travelAmount;
	}

	public void setTravelAmount(BigDecimal travelAmount) {
		this.travelAmount = travelAmount;
	}

	public Date getTravelStartDate() {
		return travelStartDate;
	}

	public void setTravelStartDate(Date travelStartDate) {
		this.travelStartDate = travelStartDate;
	}

	public Date getTravelEndDate() {
		return travelEndDate;
	}

	public void setTravelEndDate(Date travelEndDate) {
		this.travelEndDate = travelEndDate;
	}

	public Map<String, String> getTravellerTypeCodeList() {
		return travellerTypeCodeList;
	}

	public void setTravellerTypeCodeList(Map<String, String> travellerTypeCodeList) {
		this.travellerTypeCodeList = travellerTypeCodeList;
	}

}
