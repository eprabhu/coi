package com.polus.fibicomp.matrix.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiMatrixResponseDto {

	private List<CoiMatrixResponse> coiMatrixResponse;
	private boolean isMatrixComplete;

}
