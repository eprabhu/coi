package com.polus.fibicomp.globalentity.controller;

import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/entity/notes")
@Slf4j
public class EntityNotesController {

	@Autowired
	@Qualifier(value = "entityNoteService")
	private GlobalEntityService entityNoteService;

	@PostMapping("/save")
	public ResponseEntity<Map<String, Object>> saveNote(@RequestBody EntityNotesDTO dto) {
		log.info("Request for saveNotes");
		Map<String, Object> response = entityNoteService.saveNote(dto);
		return new ResponseEntity<>(response, response != null ? HttpStatus.OK : HttpStatus.FORBIDDEN);
	}

	@PatchMapping(value = "/update")
	public ResponseEntity<Map<String, Object>> updateEntityNote(@RequestBody EntityNotesDTO dto) {
		log.info("Requesting for updateEntityNote");
		Map<String, Object> response = entityNoteService.updateEntityNote(dto);
		return new ResponseEntity<>(response, response == null ? HttpStatus.FORBIDDEN : HttpStatus.OK);
	}

    @GetMapping("/fetchAllBySectionCode/{sectionCode}/{entityId}")
	public ResponseEntity<List<EntityNotesDTO>> fetchAllBySectionCode(@PathVariable("sectionCode") String sectionCode,
			@PathVariable("entityId") Integer entityId) {
		log.info("Request for fetchAllBySectionCode, entityId: {}, sectionCode: {}", entityId, sectionCode);
		List<EntityNotesDTO> response = entityNoteService.fetchAllBySectionCode(sectionCode, entityId);
		return new ResponseEntity<>(response, response == null ? HttpStatus.FORBIDDEN : HttpStatus.OK);
	}

	@DeleteMapping(value = "/delete/{sectionCode}/{noteId}")
	public ResponseEntity<ResponseMessageDTO> deleteNote(@PathVariable(value = "noteId") Integer noteId,
			@PathVariable("sectionCode") String sectionCode) {
		log.info("Requesting for deleteNote, noteId: {}, sectionCode: {}", noteId, sectionCode);
		ResponseMessageDTO response = entityNoteService.deleteNote(noteId, sectionCode);
		return new ResponseEntity<>(response, response != null ? HttpStatus.OK : HttpStatus.FORBIDDEN);
	}

}
