package com.polus.fibicomp.mig.eng.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EngMigMatrixResponseDto {

	private List<EngMigMatrixResonse> coiMatrixResponse;
	private boolean isMatrixComplete;

}
