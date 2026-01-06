package com.polus.fibicomp.travelDisclosure.pojos;

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
@Table(name = "TRAVEL_FORM_BUILDER_DETAILS")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TravelFormBuilderDetails {

	@Id
	@Column(name = "TRAVEL_FORM_BUILDER_DETAILS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaFormBuilderDetailsId;

	@Column(name = "TRAVEL_DISCLOSURE_ID")
	private Integer travelDisclosureId;

	@Column(name = "TRAVEL_NUMBER")
	private Integer travelNumber;

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
