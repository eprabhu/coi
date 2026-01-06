package com.polus.fibicomp.general.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.polus.core.general.pojo.DynamicSectionConfig;
import com.polus.core.util.JpaCharBooleanConversion;

//@Entity
//@Table(name = "DYN_SUBSECTION_CONFIG")
public class DynamicSubSectionConfig implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "SUB_SECTION_CODE")
	private String subSectionCode;	

	@Column(name = "PARENT_SUB_SECTION_CODE")
	private String parentSubSectionCode;	
	
	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;
	
	@JsonBackReference
	@ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "DYN_SUBSECTION_CONFIG_FK1"), name = "SECTION_CODE", referencedColumnName = "SECTION_CODE")
	private DynamicSectionConfig sectionConfig;

	@Column(name = "HELP")
	private String help;

	@Column(name = "INSTRUCTION")
	private String instruction;

	@JsonManagedReference
	@OneToMany(mappedBy = "subSectionConfig", orphanRemoval = true, cascade = { CascadeType.ALL }, fetch = FetchType.LAZY)
	private List<DynElementConfig> elementConfig;

	public String getSubSectionCode() {
		return subSectionCode;
	}

	public void setSubSectionCode(String subSectionCode) {
		this.subSectionCode = subSectionCode;
	}

	public String getParentSubSectionCode() {
		return parentSubSectionCode;
	}

	public void setParentSubSectionCode(String parentSubSectionCode) {
		this.parentSubSectionCode = parentSubSectionCode;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public DynamicSectionConfig getSectionConfig() {
		return sectionConfig;
	}

	public void setSectionConfig(DynamicSectionConfig sectionConfig) {
		this.sectionConfig = sectionConfig;
	}

	public String getHelp() {
		return help;
	}

	public void setHelp(String help) {
		this.help = help;
	}

	public String getInstruction() {
		return instruction;
	}

	public void setInstruction(String instruction) {
		this.instruction = instruction;
	}
}
