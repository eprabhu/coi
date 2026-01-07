package com.polus.fibicomp.opa.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OPA_FORM_BUILDER_DETAILS")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPAFormBuilderDetails {

	@Id
	@Column(name = "OPA_FORM_BUILDER_DETAILS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaFormBuilderDetailsId;

	@Column(name = "OPA_DISCLOSURE_ID")
	private Integer opaDisclosureId;

	@Column(name = "OPA_DISCLOSURE_NUMBER")
	private String opaDisclosureNumber;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "FORM_BUILDER_ID")
	private Integer formBuilderId;
	
	@Column(name = "IS_PRIMARY_FORM")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrimaryForm;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
