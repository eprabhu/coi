package com.polus.fibicomp.globalentity.dao;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.EntityNotesDTO;
import com.polus.fibicomp.globalentity.pojo.EntityNotes;
import com.polus.fibicomp.globalentity.pojo.EntitySectionNoteRef;

@Repository
@Transactional
public class EntityNoteDAOImpl implements EntityNoteDAO {

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private CommonDao commonDao;

	@Override
	public Integer saveNote(EntityNotes note) {
		note = entityManager.merge(note);
		return note.getNoteId();
	}

	@Override
	public Timestamp updateNote(EntityNotesDTO dto) {
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		StringBuilder hqlQuery = new StringBuilder();
	    hqlQuery.append("UPDATE EntityNotes e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
	    if (dto.getTitle() != null) {
	        hqlQuery.append(", e.title = :title");
	    }
	    if (dto.getContent() != null) {
	        hqlQuery.append(", e.content = :content");
	    }
	    hqlQuery.append(" WHERE e.noteId = :noteId");
	    Query query = entityManager.createQuery(hqlQuery.toString());
	    query.setParameter("noteId", dto.getNoteId());
	    query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
	    query.setParameter("updateTimestamp", updateTimestamp);
	    if (dto.getTitle() != null) {
	        query.setParameter("title", dto.getTitle());
	    }
	    if (dto.getContent() != null) {
	        query.setParameter("content", dto.getContent());
	    }
	    query.executeUpdate();
	    return updateTimestamp;
	}

	@Override
	public void saveEntitySectionNoteRef(EntitySectionNoteRef entitySectionNoteRef) {
		entityManager.merge(entitySectionNoteRef);
	}

	@Override
	public List<EntityNotes> getNotesBySectionCode(String entitySectionCode, Integer entityId) {
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
	    CriteriaQuery<EntityNotes> query = builder.createQuery(EntityNotes.class);
	    Root<EntityNotes> root = query.from(EntityNotes.class);
	    Subquery<Long> subquery = query.subquery(Long.class);
	    Root<EntitySectionNoteRef> subRoot = subquery.from(EntitySectionNoteRef.class);
	    subquery.select(subRoot.get("entityNoteId"))
	            .where(
	                builder.equal(subRoot.get("entityId"), entityId),
	                builder.equal(subRoot.get("sectionCode"), entitySectionCode)
	            );
	    query.where(root.get("noteId").in(subquery));
	    query.orderBy(builder.desc(root.get("updateTimestamp")));
	    return entityManager.createQuery(query).getResultList();
	}

	@Override
	public void deleteNote(Integer noteId) {
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaDelete<EntityNotes> query = builder.createCriteriaDelete(EntityNotes.class);
		Root<EntityNotes> root = query.from(EntityNotes.class);
		query.where(builder.equal(root.get("noteId"), noteId));
		entityManager.createQuery(query).executeUpdate();
	}

	@Override
	public void deleteEntitySectionNoteRef(Integer noteId) {
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaDelete<EntitySectionNoteRef> query = builder.createCriteriaDelete(EntitySectionNoteRef.class);
		Root<EntitySectionNoteRef> root = query.from(EntitySectionNoteRef.class);
		query.where(builder.equal(root.get("entityNoteId"), noteId));
		entityManager.createQuery(query).executeUpdate();
	}

}
