package com.polus.fibicomp.matrix.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.coi.service.PersonEntityService;
import com.polus.fibicomp.matrix.dto.CoiMatrixResponseDto;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.matrix.service.MatrixService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/matrix")
@Slf4j
public class MatrixController {

	@Autowired
	private MatrixService matrixService;

	@Autowired
	private PersonEntityService personEntityService;

	@GetMapping(value = "/fetchMatrix/{personEntityId}")
	public ResponseEntity<CoiMatrixResponseDto> fetchMatrixQuestion(@PathVariable(value = "personEntityId", required = true) final Integer personEntityId) {
		log.info("Requesting for fetchMatrixQuestion, personEntityId: {}", personEntityId);
		return new ResponseEntity<>(matrixService.fetchMatrixQuestion(personEntityId), HttpStatus.OK); 
	}

	@PostMapping(value = "/saveOrUpdateMatrixAnswer")
	public ResponseEntity<Object> saveOrUpdateMatrixQuestion(@RequestBody List<CoiMatrixAnswer> coiMatrixAnswers) {
		log.info("Requesting for saveOrUpdateMatriAnswer");
		List<CoiMatrixAnswer> processedAnswerResponse = matrixService.saveOrUpdateMatrixQuestion(coiMatrixAnswers);
		Map<String, Object> matrixCompletionEvalResponse = matrixService.checkMatrixCompleted(coiMatrixAnswers.get(0).getPersonEntityId());
		Map<String, Object> response = new HashMap<>();
		response.putAll(matrixCompletionEvalResponse);
		response.put("response", processedAnswerResponse);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/evaluateMatrix/{personEntityId}")
	public Map<String, Object> evaluateMatrix(@PathVariable("personEntityId") Integer personEntityId) {
		Map<String, Object> evaluationResult = matrixService.checkMatrixCompleted(personEntityId);
		return evaluationResult;
	}

}
