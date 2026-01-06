package com.polus.fibicomp.globalentity.controller;

import java.util.List;
import java.util.Map;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/entity/comments")
public class EntityCommentsController {

	@Autowired
	@Qualifier(value = "entityCommentService")
	private GlobalEntityService entityCommentService;

	@PostMapping
	public ResponseEntity<Object> saveComment(@RequestParam("formDataJson") String formDataJson) throws JsonProcessingException {
		log.info("Requesting for saveComment");
		ObjectMapper mapper = new ObjectMapper();
		EntityCommentsDTO entityCommentDto = mapper.readValue(formDataJson, EntityCommentsDTO.class);
		EntityComment response = entityCommentService.saveComment(entityCommentDto);
		return new ResponseEntity<>(response, response != null ? HttpStatus.OK : HttpStatus.FORBIDDEN);
	}

	@PatchMapping
	public ResponseEntity<EntityCommentsDTO> updateComment(@RequestBody EntityCommentsDTO dto) {
		log.info("Requesting for updateComment");
		EntityCommentsDTO response = entityCommentService.updateComment(dto);
		return new ResponseEntity<>(response, response == null ? HttpStatus.FORBIDDEN : HttpStatus.OK);
	}

	@GetMapping("/fetchAllBySectionCode/{sectionCode}/{entityNumber}")
	public ResponseEntity<List<EntityCommentsDTO>> fetchAllCommentsBySectionCode(@PathVariable("sectionCode") String sectionCode,
			@PathVariable("entityNumber") Integer entityNumber) {
		log.info("Request for fetchAllCommentsBySectionCode, entityNumber: {}, sectionCode: {}", entityNumber, sectionCode);
		List<EntityCommentsDTO> response = entityCommentService.fetchAllCommentsBySectionCode(sectionCode, entityNumber);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/getEntityCommentsByEntityNumber/{entityNumber}")
	public Map<String, List<EntityCommentsDTO>> getEntityCommentsByEntityNumber(@PathVariable("entityNumber") Integer entityNumber) {
		log.info("Requesting for getEntityCommentsByEntityNumber, entityNumber: {}", entityNumber);
   		return entityCommentService.getEntityCommentsByEntityNumber(entityNumber);
   	}

	@DeleteMapping(value = "/delete/{sectionCode}/{entityCommentId}")
	public ResponseEntity<ResponseMessageDTO> deleteComment(@PathVariable(value = "entityCommentId") Integer entityCommentId,
			@PathVariable("sectionCode") String sectionCode) {
		log.info("Requesting for deleteComment, entityCommentId: {}, sectionCode: {}", entityCommentId, sectionCode);
		ResponseMessageDTO response = entityCommentService.deleteComment(entityCommentId, sectionCode);
		return new ResponseEntity<>(response, response != null ? HttpStatus.OK : HttpStatus.FORBIDDEN);
	}

	@GetMapping(value = "/count/{entityNumber}")
   	public Map<String, Integer> getEntityCommentsCount(@PathVariable("entityNumber") Integer entityNumber) {
   		log.info("Requesting for getEntityCommentsCount entityNumber: {}", entityNumber);
   		return entityCommentService.getEntityCommentsCount(entityNumber);
   	}

	@GetMapping("/resolveEntityComment/{entityCommentId}")
	public ResponseEntity<Object> resolveEntityComment(@PathVariable(value = "entityCommentId") Integer entityCommentId) {
		log.info("Attempting to resolve entity comment - Entity CommentId: {}", entityCommentId);
		try {
			entityCommentService.resolveEntityComment(entityCommentId);
			log.info("Successfully resolved comment with ID: {}", entityCommentId);
			return ResponseEntity.ok("Comment resolved successfully.");
		} catch (EntityNotFoundException e) {
			log.warn("Comment not found - ID: {}", entityCommentId, e);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found with ID: " + entityCommentId);
		} catch (Exception e) {
			log.error("Unexpected error while resolving comment - ID: {}", entityCommentId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while resolving the comment.");
		}
	}

}
