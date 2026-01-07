package com.polus.fibicomp.globalentity.dao;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.pojo.EntityNotes;
import com.polus.fibicomp.globalentity.pojo.EntitySectionNoteRef;

@Transactional
@Service
public interface EntityNoteDAO {

	/**
	 * Saves a new note.
	 * @param note the EntityNotes object representing the note to be saved
	 * @return the ID of the saved note as an Integer
	 */
	Integer saveNote(EntityNotes note);

	/**
	 * Updates an existing note entity with new data.
	 * @param dto the EntityNotesDTO object containing updated note data
	 * @return 
	 */
	Timestamp updateNote(EntityNotesDTO dto);

	/**
	 * Saves a reference between a section and note.
	 * @param entitySectionNoteRef the EntitySectionNoteRef object representing the reference to be saved
	 */
	void saveEntitySectionNoteRef(EntitySectionNoteRef entitySectionNoteRef);

	/**
	 * Retrieves a list of notes by a given section code and entity ID, with an option to check permissions.
	 * @param entitySectionCode the section code used to filter notes
	 * @param entityId the ID of the entity for which notes are being retrieved
	 * @param personHasPermission a boolean indicating if the person has permission to view the notes
	 * @return a list of EntityNotes objects that match the criteria
	 */
	List<EntityNotes> getNotesBySectionCode(String entitySectionCode, Integer entityId);

	/**
	 * Deletes a note from the database based on its ID.
	 * @param noteId the ID of the note to be deleted
	 */
	void deleteNote(Integer noteId);

	/**
	 * Deletes the reference between a section and note based on the note ID.
	 * @param noteId the ID of the note whose reference is to be deleted
	 */
	void deleteEntitySectionNoteRef(Integer noteId);

}
