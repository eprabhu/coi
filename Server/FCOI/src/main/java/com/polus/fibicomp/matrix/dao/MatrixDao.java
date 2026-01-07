package com.polus.fibicomp.matrix.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.matrix.pojo.CoiMatrixQuestion;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.matrix.pojo.MatrixPersonRelMapping;

@Transactional
@Service
public interface MatrixDao {

	List<CoiMatrixQuestion> fetchMatrixQuestion();

	List<MatrixPersonRelMapping> fetchMatrixPersonRelMapping();

	List<CoiMatrixAnswer> fetchMatrixAnswer(Integer personEntityId);

	CoiMatrixAnswer saveMatrixQuestion(CoiMatrixAnswer answer);

	void updateMatrixQuestion(CoiMatrixAnswer answer);

	void deleteMatrixQuestion(CoiMatrixAnswer answer);

	Map<String, Object> evaluateRelationship(Integer personEntityId);

	void deleteMatrixAnswer(Integer personEntityId);

	void copyMatrixAnswers(Integer orgPersonEntityId, Integer copyPersonEntityId);

	void evaluateMatrixData(CoiMatrixAnswer answer);

}
