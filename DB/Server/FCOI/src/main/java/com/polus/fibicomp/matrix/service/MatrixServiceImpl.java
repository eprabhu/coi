package com.polus.fibicomp.matrix.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.pojo.PersonEntityRelType;
import com.polus.fibicomp.coi.service.PersonEntityService;
import com.polus.fibicomp.matrix.dao.MatrixDao;
import com.polus.fibicomp.matrix.dto.CoiMatrixResponse;
import com.polus.fibicomp.matrix.dto.CoiMatrixResponseDto;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.matrix.pojo.CoiMatrixQuestion;
import com.polus.fibicomp.matrix.pojo.MatrixPersonRelMapping;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class MatrixServiceImpl implements MatrixService {

	@Autowired
	private MatrixDao matrixDao;

	@Autowired
	private ConflictOfInterestDao coiDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
    private PersonEntityService personEntityService;

	@Override
	public CoiMatrixResponseDto fetchMatrixQuestion(Integer personEntityId) {
		List<CoiMatrixResponse> coiMatrixResponse = null;
		CompletableFuture<List<CoiMatrixQuestion>> coiMatrixQuestionFuture = CompletableFuture
				.supplyAsync(() -> matrixDao.fetchMatrixQuestion());
		CompletableFuture<List<MatrixPersonRelMapping>> matrixPersonRelMappingFuture = CompletableFuture
				.supplyAsync(() -> matrixDao.fetchMatrixPersonRelMapping());
		CompletableFuture<List<PersonEntityRelType>> personEntityRelTypeFuture = CompletableFuture
				.supplyAsync(() -> coiDao.fetchPersonEntityRelType());
		CompletableFuture<List<CoiMatrixAnswer>> coiMatrixAnswerFuture = CompletableFuture
				.supplyAsync(() -> matrixDao.fetchMatrixAnswer(personEntityId));
		CompletableFuture.allOf(coiMatrixQuestionFuture, matrixPersonRelMappingFuture, personEntityRelTypeFuture,
				coiMatrixAnswerFuture).join();
		try {
			List<CoiMatrixQuestion> coiMatrixQuestion = coiMatrixQuestionFuture.get();
			List<MatrixPersonRelMapping> matrixPersonRelMapping = matrixPersonRelMappingFuture.get();
			List<PersonEntityRelType> personEntityRelTypes = personEntityRelTypeFuture.get();
			List<CoiMatrixAnswer> coiMatrixAnswer = coiMatrixAnswerFuture.get();
			coiMatrixResponse = prepareResponse(matrixPersonRelMapping, coiMatrixQuestion, personEntityRelTypes);
			coiMatrixResponse = setMatrixAnswer(coiMatrixResponse, coiMatrixAnswer);
		} catch (InterruptedException e) {
			log.error("InterruptedException in fetchCoiMatrixQuestion:, {}", e.getMessage());
		} catch (ExecutionException e) {
			log.error("ExecutionException in fetchCoiMatrixQuestion:, {}", e.getMessage());
		}
		
		boolean isFormCompleted = coiDao.checkMatrixCompleted(personEntityId);
		return CoiMatrixResponseDto.builder().coiMatrixResponse(coiMatrixResponse).isMatrixComplete(isFormCompleted).build();
	}

	private List<CoiMatrixResponse> setMatrixAnswer(List<CoiMatrixResponse> coiMatrixResponse,
			List<CoiMatrixAnswer> coiMatrixAnswer) {
		Map<Integer, List<CoiMatrixAnswer>> coiMatrixQuestionIdToAnswers = coiMatrixAnswer.stream()
		        .collect(Collectors.groupingBy(CoiMatrixAnswer::getMatrixQuestionId));

		    coiMatrixResponse.forEach(response -> {
		        Integer coiMatrixQuestionId = response.getCoiMatrixQuestion().getMatrixQuestionId();
		        
		        if (coiMatrixQuestionIdToAnswers.containsKey(coiMatrixQuestionId)) {
		            response.setCoiMatrixAnswer(coiMatrixQuestionIdToAnswers.get(coiMatrixQuestionId));
		        }
		    });
		    return coiMatrixResponse;
	}

	private List<CoiMatrixResponse> prepareResponse(List<MatrixPersonRelMapping> matrixPersonRelMapping,
			List<CoiMatrixQuestion> coiMatrixQuestion, List<PersonEntityRelType> personEntityRelTypes) {
		Map<Integer, List<String>> coiMatrixQuestionIdToRelationshipCodes = matrixPersonRelMapping.stream()
				.collect(Collectors.groupingBy(MatrixPersonRelMapping::getMatrixQuestionId,
						Collectors.mapping(MatrixPersonRelMapping::getRelationshipTypeCode, Collectors.toList())));
		Map<String, PersonEntityRelType> relationshipCodeToRelationship = personEntityRelTypes.stream()
				.collect(Collectors.toMap(PersonEntityRelType::getRelationshipTypeCode, rel -> rel));
		List<CoiMatrixResponse> coiMatrixResponse = coiMatrixQuestion.stream()
				.filter(data -> coiMatrixQuestionIdToRelationshipCodes.containsKey(data.getMatrixQuestionId())).map(data -> {
					List<String> relationshipCodes = coiMatrixQuestionIdToRelationshipCodes.get(data.getMatrixQuestionId());
					List<PersonEntityRelType> relationships = relationshipCodes.stream()
							.map(relationshipCodeToRelationship::get).collect(Collectors.toList());
					return new CoiMatrixResponse(data, relationships);
				}).collect(Collectors.toList());
		return coiMatrixResponse;
	}

	@Override
	public List<CoiMatrixAnswer> saveOrUpdateMatrixQuestion(List<CoiMatrixAnswer> coiMatrixAnswers) {
		List<CoiMatrixAnswer> processedAnswers = new ArrayList<>();
	    coiMatrixAnswers.forEach(answer -> {
	        answer.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
	        answer.setUpdateTimestamp(commonDao.getCurrentTimestamp());

	        if (answer.getMatrixAnswerId() == null) {
	            CoiMatrixAnswer processedAnswer = saveMatrixQuestion(answer);
	            processedAnswers.add(processedAnswer);
	        } else {
	            updateMatrixQuestion(answer);
	            processedAnswers.add(answer);
	        }
	    });
	    coiDao.updatePersonEntityUpdateDetails(processedAnswers.get(0).getPersonEntityId());
	    return processedAnswers;
	}

	private CoiMatrixAnswer saveMatrixQuestion(CoiMatrixAnswer answer) {
		CoiMatrixAnswer processedAnswer = matrixDao.saveMatrixQuestion(answer);
		return processedAnswer;
	}

	private void updateMatrixQuestion(CoiMatrixAnswer answer) {
		if ((answer.getColumnValue() == null || answer.getColumnValue().isBlank()) && (answer.getComments() == null || answer.getComments().isBlank())) {
			matrixDao.deleteMatrixQuestion(answer);
		} else {
			matrixDao.updateMatrixQuestion(answer);
		}
	}

	@Override
	public Map<String, Object> checkMatrixCompleted(Integer personEntityId) {
		Map<String, Object> evaluationResult = new HashMap<>();
		boolean isFormCompleted = coiDao.checkMatrixCompleted(personEntityId);
		evaluationResult.put("isMatrixCompleted", isFormCompleted);
		return evaluationResult;
	}

	@Override
	public Map<String, Object> checkMatrixCompletedAndEvaluate(Integer personEntityId) {
		Map<String, Object> evaluationResult = new HashMap<>();
		boolean isFormCompleted = coiDao.checkMatrixCompleted(personEntityId);
		if (isFormCompleted) {
			evaluationResult = matrixDao.evaluateRelationship(personEntityId);
		}
		evaluationResult.put("isMatrixCompleted", isFormCompleted);
		return evaluationResult;
	}

	@Override
	public void deleteMatrixAnswers(Integer personEntityId) {
		matrixDao.deleteMatrixAnswer(personEntityId);
		coiDao.updatePersonEntityUpdateDetails(personEntityId);
	}

	@Override
	public void copyMatrixAnswers(Integer orgPersonEntityId, Integer copyPersonEntityId) {
		matrixDao.copyMatrixAnswers(orgPersonEntityId, copyPersonEntityId);
	}

}
