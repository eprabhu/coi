package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "COI_SUB_SECTIONS")
public class CoiSubSections implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_SUB_SECTIONS_CODE")
	private String coiSubSectionsCode;

	@Column(name = "COI_SECTIONS_TYPE_CODE")
	private String coiSectionsCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_SUB_SECTIONS_FK1"), name = "COI_SECTIONS_TYPE_CODE", referencedColumnName = "COI_SECTIONS_TYPE_CODE", insertable = false, updatable = false)
	private CoiSectionsType coiSectionsType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	public String getCoiSubSectionsCode() {
		return coiSubSectionsCode;
	}

	public void setCoiSubSectionsCode(String coiSubSectionsCode) {
		this.coiSubSectionsCode = coiSubSectionsCode;
	}

	public CoiSectionsType getCoiSectionsType() {
		return coiSectionsType;
	}

	public void setCoiSectionsType(CoiSectionsType coiSectionsType) {
		this.coiSectionsType = coiSectionsType;
	}

	public String getCoiSectionsCode() {
		return coiSectionsCode;
	}

	public void setCoiSectionsCode(String coiSectionsCode) {
		this.coiSectionsCode = coiSectionsCode;
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

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

}
