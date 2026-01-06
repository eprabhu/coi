package com.polus.fibicomp.coi.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "PER_ENT_FORM_BUILDER_DETAILS")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonEnttityFormBuilderDetails {

	@Id
	@Column(name = "PER_ENT_FB_DETAILS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer perEntFormBuilderDetailsId;

	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "FORM_BUILDER_ID")
	private Integer formBuilderId;
	
	@Column(name = "IS_PRIMARY_FORM")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrimaryForm;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
