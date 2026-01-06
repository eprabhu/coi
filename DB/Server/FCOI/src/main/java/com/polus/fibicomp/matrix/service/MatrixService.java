package com.polus.fibicomp.matrix.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.matrix.dto.CoiMatrixResponseDto;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;

@Service
public interface MatrixService {

	CoiMatrixResponseDto fetchMatrixQuestion(Integer personEntityId);

	List<CoiMatrixAnswer> saveOrUpdateMatrixQuestion(List<CoiMatrixAnswer> coiMatrixAnswer);

	Map<String, Object> checkMatrixCompleted(Integer personEntityId);

	Map<String, Object>  checkMatrixCompletedAndEvaluate(Integer personEntityId);

	void deleteMatrixAnswers(Integer personEntityId);

	void copyMatrixAnswers(Integer orgPersonEntityId, Integer copyPersonEntityId);

}
