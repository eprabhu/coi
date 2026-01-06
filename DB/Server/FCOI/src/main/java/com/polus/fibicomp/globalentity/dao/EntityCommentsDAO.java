package com.polus.fibicomp.globalentity.dao;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;
import com.polus.fibicomp.globalentity.pojo.EntitySectionCommentRef;

@Transactional
@Service
public interface EntityCommentsDAO {

	/**
	 * Saves a new entity comment to the database.
	 * 
	 * @param entityComment The comment entity to be saved
	 * @return The generated ID of the saved comment
	 */
	Integer saveComment(EntityComment entityComment);

	/**
	 * Creates a reference between an entity section and a comment.
	 * 
	 * @param entitySectionCommentRef The reference to be saved linking a section to a comment
	 */
	void saveEntitySectionCommentRef(EntitySectionCommentRef entitySectionCommentRef);

	/**
	 * Updates an existing comment with new information.
	 * 
	 * @param dto Data transfer object containing updated comment details
	 * @return The timestamp of the comment update
	 */
	Timestamp updateComment(EntityCommentsDTO dto);

	/**
	 * Retrieves all comments for a specific section of an entity.
	 * 
	 * @param sectionCode Unique identifier for the entity section
	 * @param entityNumber Identifier of the entity
	 * @return List of comments associated with the specified section and entity
	 */
	List<EntityComment> getCommentsBySectionCode(String sectionCode, Integer entityNumber);

	/**
	 * Removes the reference between an entity section and a comment.
	 * 
	 * @param entityCommentId ID of the comment reference to be deleted
	 */
	void deleteEntitySectionCommentRef(Integer entityCommentId);

	/**
	 * Deletes a specific comment from the database.
	 * 
	 * @param entityCommentId ID of the comment to be deleted
	 */
	void deleteComment(Integer entityCommentId);

	/**
	 * Resolve a specific comment from the database.
	 * 
	 * @param entityCommentId ID of the comment to be deleted
	 */
	Boolean resolveComment(Integer entityCommentId);

}
