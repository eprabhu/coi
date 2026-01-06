package com.polus.fibicomp.disclosures.consultingdisclosure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultDisclCreatetDto {

	private String personId;

	private String homeUnit;

}
