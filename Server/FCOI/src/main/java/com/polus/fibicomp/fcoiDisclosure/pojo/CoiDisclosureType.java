package com.polus.fibicomp.fcoiDisclosure.pojo;

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
import com.polus.fibicomp.coi.pojo.PerEntDataCapturingType;

import lombok.Data;

@Entity
@Data
@Table(name = "COI_DISCLOSURE_TYPE")
public class CoiDisclosureType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "DISCLOSURE_TYPE_CODE")
	private String disclosureTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "DATA_CAPTURING_TYPE_CODE")
	private Integer dataCapturingTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE_TYPE_FK1"), name = "DATA_CAPTURING_TYPE_CODE", referencedColumnName = "DATA_CAPTURING_TYPE_CODE", insertable = false, updatable = false)
	private PerEntDataCapturingType perEntDataCapturingType;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

}
