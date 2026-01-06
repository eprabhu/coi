package com.polus.fibicomp.globalentity.dto;

import javax.persistence.Convert;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationDetailsRequestDTO {

	private Integer entityId;
	private Integer entityRegistrationId;
	private String regTypeCode;
	private String regNumber;
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

}
