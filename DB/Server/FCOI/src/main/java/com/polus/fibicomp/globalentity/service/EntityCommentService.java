package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;

@Service
public interface EntityCommentService extends GlobalEntityService {

	/**
	 * Saves a new comment based on the provided DTO.
	 * 
	 * @param dto Data transfer object containing comment details
	 * @return The saved EntityComment with generated identifier
	 */
	EntityComment saveComment(EntityCommentsDTO dto);

	/**
	 * Updates an existing comment with new information.
	 * 
	 * @param dto Data transfer object with updated comment details
	 * @return Updated EntityCommentsDTO with modification details
	 */
	EntityCommentsDTO updateComment(EntityCommentsDTO dto);

	/**
	 * Retrieves all comments for a specific section of an entity.
	 * 
	 * @param sectionCode Unique identifier for the entity section
	 * @param entityId Identifier of the entity
	 * @return List of comments matching the section and entity
	 */
	List<EntityCommentsDTO> fetchAllCommentsBySectionCode(String sectionCode, Integer entityNumber);

	/**
	 * Deletes a specific comment and returns operation result.
	 * 
	 * @param entityCommentId Identifier of the comment to delete
	 * @param sectionCode Section code for additional validation
	 * @return ResponseMessageDTO with deletion status and message
	 */
	ResponseMessageDTO deleteComment(Integer entityCommentId, String sectionCode);

	/**
	 * Retrieves all comments grouped by section for a given entity.
	 * 
	 * @param entityNumber Identifier of the entity
	 * @return Map of section codes to their respective comments
	 */
	Map<String, List<EntityCommentsDTO>> getEntityCommentsByEntityNumber(Integer entityNumber);

	/**
	 * Counts comments across different sections for an entity.
	 * 
	 * @param entityId Identifier of the entity
	 * @return Map of section codes to their comment count
	 */
	Map<String, Integer> getEntityCommentsCount(Integer entityId);

	/**
	 * Resolve comment for an entity.
	 * 
	 * @param entityCommentId Identifier of the entity comment
	 * @return void
	 */
	void resolveEntityComment(Integer entityCommentId);

}
