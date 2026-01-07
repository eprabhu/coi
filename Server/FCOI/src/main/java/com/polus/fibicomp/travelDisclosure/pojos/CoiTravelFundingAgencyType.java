package com.polus.fibicomp.travelDisclosure.pojos;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "COI_TRAVEL_FUNDING_AGENCY_TYPE")
public class CoiTravelFundingAgencyType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "FUNDING_AGENCY_CODE")
	private String travelStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

}
