package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;

@Service
public interface EntityNoteService extends GlobalEntityService {

	/**
	 * Saves a new note.
	 * @param entityNote dto
	 */
	public Map<String, Object> saveNote(EntityNotesDTO dto);

	/**
	 * Updates an existing note entity with new data.
	 * @param dto the EntityNotesDTO object containing updated note data
	 */
	public Map<String, Object> updateEntityNote(EntityNotesDTO dto);

	/**
	 * Retrieves a list of notes by a given section code and entity ID.
	 * @param entitySectionCode the section code used to filter notes
	 * @param entityId the ID of the entity for which notes are being retrieved
	 * @return a list of EntityNotes objects that match the criteria
	 */
	public List<EntityNotesDTO> fetchAllBySectionCode(String sectionCode, Integer entityId);

	/**
	 * Deletes a note from the database based on its ID.
	 * @param noteId the ID of the note to be deleted
	 */
	public ResponseMessageDTO deleteNote(Integer noteId, String sectionCode);

}
