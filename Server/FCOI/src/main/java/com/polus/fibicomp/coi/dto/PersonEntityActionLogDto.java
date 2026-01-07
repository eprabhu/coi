package com.polus.fibicomp.coi.dto;

import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;


public class PersonEntityActionLogDto {

	private Integer actionLogId;
	private Integer personEntityId;
	private Integer personEntityNumber;
	private String actionTypeCode;
	private PersonEntityActionType personEntityActionType;
	private String description;
	private String comment;
	private Timestamp updateTimestamp;
	private String updateUser;
	private String updateUserFullName;

	public Integer getActionLogId() {
		return actionLogId;
	}

	public void setActionLogId(Integer actionLogId) {
		this.actionLogId = actionLogId;
	}

	public Integer getPersonEntityId() {
		return personEntityId;
	}

	public void setPersonEntityId(Integer personEntityId) {
		this.personEntityId = personEntityId;
	}

	public Integer getPersonEntityNumber() {
		return personEntityNumber;
	}

	public void setPersonEntityNumber(Integer personEntityNumber) {
		this.personEntityNumber = personEntityNumber;
	}

	public String getActionTypeCode() {
		return actionTypeCode;
	}

	public void setActionTypeCode(String actionTypeCode) {
		this.actionTypeCode = actionTypeCode;
	}

	public PersonEntityActionType getPersonEntityActionType() {
		return personEntityActionType;
	}

	public void setPersonEntityActionType(PersonEntityActionType personEntityActionType) {
		this.personEntityActionType = personEntityActionType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
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

	public String getUpdateUserFullName() {
		return updateUserFullName;
	}

	public void setUpdateUserFullName(String updateUserFullName) {
		this.updateUserFullName = updateUserFullName;
	}
}
