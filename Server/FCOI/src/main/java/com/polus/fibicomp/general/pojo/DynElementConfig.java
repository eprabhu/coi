package com.polus.fibicomp.general.pojo;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.io.Serializable;
import java.sql.Timestamp;

//@Entity
//@Table(name = "DYN_ELEMENT_CONFIG")
public class DynElementConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "ELEMENT_ID")
    private Integer elementId;

    @Column(name = "UI_REFERENCE_ID")
    private String uiReferenceId;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "SUB_SECTION_CODE")
    private String subSectionCode;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(foreignKey = @ForeignKey(name = "DYN_ELEMENT_CONFIG_FK1"), name = "SUB_SECTION_CODE",
            referencedColumnName = "SUB_SECTION_CODE", insertable = false, updatable = false)
    private DynamicSubSectionConfig subSectionConfig;

    @Column(name = "SECTION_CODE")
    private String sectionCode;

    @Column(name = "HELP")
    private String help;

    @Column(name = "INSTRUCTION")
    private String instruction;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    public Integer getElementId() {
        return elementId;
    }

    public void setElementId(Integer elementId) {
        this.elementId = elementId;
    }

    public String getUiReferenceId() {
        return uiReferenceId;
    }

    public void setUiReferenceId(String uiReferenceId) {
        this.uiReferenceId = uiReferenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubSectionCode() {
        return subSectionCode;
    }

    public void setSubSectionCode(String subSectionCode) {
        this.subSectionCode = subSectionCode;
    }

    public DynamicSubSectionConfig getSubSectionConfig() {
        return subSectionConfig;
    }

    public void setSubSectionConfig(DynamicSubSectionConfig subSectionConfig) {
        this.subSectionConfig = subSectionConfig;
    }

    public String getSectionCode() {
        return sectionCode;
    }

    public void setSectionCode(String sectionCode) {
        this.sectionCode = sectionCode;
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
}
