package com.polus.fibicomp.globalentity.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.EntityNoteDAO;
import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.pojo.EntityNotes;
import com.polus.fibicomp.globalentity.pojo.EntitySectionNoteRef;
import com.polus.fibicomp.globalentity.repository.EntitySectionAccessRightRepository;

@Service(value = "entityNoteService")
@Transactional
public class EntityNoteServiceImpl implements EntityNoteService {

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EntityNoteDAO entityNoteDAO;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private PersonRoleRightDao personRoleRightDao;

	@Autowired
	private EntitySectionAccessRightRepository entitySectionAccessRightRepository;

	@Override
	public Map<String, Object> saveNote(EntityNotesDTO dto) {
		Integer noteId = null;
		EntityNotes note = null;
		if (checkPermission(dto.getSectionCode(), Boolean.TRUE)) {
			note = mapDTOToEntity(dto);
			noteId = entityNoteDAO.saveNote(note);
			entityNoteDAO.saveEntitySectionNoteRef(EntitySectionNoteRef.builder().entityId(note.getEntityId())
					.sectionCode(dto.getSectionCode()).entityNoteId(noteId).updatedBy(note.getUpdatedBy())
					.updateTimestamp(note.getUpdateTimestamp()).build());
		} else {
			return null;
		}
		return Map.of("noteId", noteId, "updatedBy", note.getUpdatedBy(), 
				"updatedByFullName", personDao.getPersonFullNameByPersonId(note.getUpdatedBy()),
				"updateTimestamp", note.getUpdateTimestamp());
	}

	private EntityNotes mapDTOToEntity(EntityNotesDTO dto) {
		return EntityNotes.builder().entityId(dto.getEntityId()).title(dto.getTitle()).content(dto.getContent())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public Map<String, Object> updateEntityNote(EntityNotesDTO dto) {
		if (checkPermission(dto.getSectionCode(), Boolean.TRUE)) {
			Timestamp updateTimestamp = entityNoteDAO.updateNote(dto);
			return Map.of("noteId", dto.getNoteId(), "updatedBy", AuthenticatedUser.getLoginPersonId(), 
					"updatedByFullName", AuthenticatedUser.getLoginUserFullName(),
					"updateTimestamp", updateTimestamp);
		} else {
			return null;
		}
	}

	private boolean checkPermission(String sectionCode, Boolean isModify) {
		String permissions = null;
		if (isModify) {
			permissions = String.join(", ", entitySectionAccessRightRepository.getRightsByCode(sectionCode).stream()
					.filter(right -> right.contains("MANAGE")).collect(Collectors.toList()));
		} else {
			permissions = String.join(", ", entitySectionAccessRightRepository.getRightsByCode(sectionCode));
		}
		return personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), permissions, null);
	}

	private EntityNotesDTO mapEntityToDTO(EntityNotes note) {
		return EntityNotesDTO.builder().noteId(note.getNoteId()).title(note.getTitle()).content(note.getContent())
				.updateTimestamp(note.getUpdateTimestamp())
				.updatedBy(note.getUpdatedBy())
				.updatedByFullName(personDao.getPersonFullNameByPersonId(note.getUpdatedBy())).build();
	}

	@Override
	public List<EntityNotesDTO> fetchAllBySectionCode(String sectionCode, Integer entityId) {
		List<EntityNotesDTO> noteDTOs = new ArrayList<>();
		if (checkPermission(sectionCode, Boolean.FALSE)) {
			List<EntityNotes> notes = entityNoteDAO.getNotesBySectionCode(sectionCode, entityId);
			notes.forEach(note -> {
				noteDTOs.add(mapEntityToDTO(note));
			});
		} else {
			return null;
		}
		return noteDTOs;
	}

	@Override
	public ResponseMessageDTO deleteNote(Integer noteId, String sectionCode) {
		if (checkPermission(sectionCode, Boolean.TRUE)) {
			entityNoteDAO.deleteEntitySectionNoteRef(noteId);
			entityNoteDAO.deleteNote(noteId);
		} else {
			return null;
		}
		return ResponseMessageDTO.builder().message("Note deleted successfully").build();
	}

}
