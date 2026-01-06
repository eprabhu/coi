package com.polus.fibicomp.matrix.dto;

import java.util.List;

import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;

import lombok.Data;

@Data
public class CoiMatrixRequest {

	private List<CoiMatrixAnswer> coiMatrixAnswer;

}
