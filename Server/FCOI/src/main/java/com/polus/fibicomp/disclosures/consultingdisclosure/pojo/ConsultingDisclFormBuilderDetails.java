package com.polus.fibicomp.disclosures.consultingdisclosure.pojo;

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
@Table(name = "CONSULTING_DISCL_FORM_BUILDER_DETAILS")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultingDisclFormBuilderDetails {

	@Id
	@Column(name = "CONSULTING_DISCL_FORM_BUILDER_DETAILS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer consultingDisclFormBuilderDetailsId;

	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "FORM_BUILDER_ID")
	private Integer formBuilderId;

	@Column(name = "FORM_BUILDER_NUMBER")
	private String formBuilderNumber;

	@Column(name = "IS_PRIMARY_FORM")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrimaryForm;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
