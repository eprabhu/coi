package com.polus.fibicomp.globalentity.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.EntityCommentsDAO;
import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;
import com.polus.fibicomp.globalentity.pojo.EntitySection;
import com.polus.fibicomp.globalentity.pojo.EntitySectionCommentRef;
import com.polus.fibicomp.globalentity.repository.EntitySectionAccessRightRepository;
import com.polus.fibicomp.globalentity.repository.EntitySectionRepository;

@Service(value = "entityCommentService")
@Transactional
public class EntityCommentServiceImpl implements EntityCommentService {

	private static final String COMMENT = "Comment";

	@Autowired
	private EntitySectionAccessRightRepository entitySectionAccessRightRepository;

	@Autowired
	private PersonRoleRightDao personRoleRightDao;

	@Autowired
	private EntityCommentsDAO entityCommentsDAO;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private EntitySectionRepository entitySectionRepository;

	@Autowired
	private CommonDao commonDao;

	@Override
	public EntityComment saveComment(EntityCommentsDTO dto) {
		EntityComment entityComment = null;
		if (checkPermission(dto.getSectionCode(), Boolean.TRUE)) {
			entityComment = mapDTOToEntity(dto);
			entityCommentsDAO.saveComment(entityComment);
			entityCommentsDAO.saveEntitySectionCommentRef(EntitySectionCommentRef.builder().entityId(entityComment.getEntityId())
							.entityNumber(entityComment.getEntityNumber()).sectionCode(dto.getSectionCode())
							.entityCommentId(entityComment.getEntityCommentId()).updatedBy(entityComment.getUpdatedBy())
							.updateTimestamp(entityComment.getUpdateTimestamp()).build());
		} else {
			return null;
		}
		return entityComment;
	}

	private EntityComment mapDTOToEntity(EntityCommentsDTO dto) {
		return EntityComment.builder().entityId(dto.getEntityId()).entityNumber(dto.getEntityNumber())
				.comment(dto.getComment()).commentTypeCode(dto.getCommentTypeCode())
				.parentCommentId(dto.getParentCommentId()).updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
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

	@Override
	public EntityCommentsDTO updateComment(EntityCommentsDTO dto) {
		if (checkPermission(dto.getSectionCode(), Boolean.TRUE)) {
			entityCommentsDAO.updateComment(dto);
			return dto;
		} else {
			return null;
		}
	}

	@Override
	public List<EntityCommentsDTO> fetchAllCommentsBySectionCode(String sectionCode, Integer entityNumber) {
		List<EntityCommentsDTO> commentDTOs = new ArrayList<>();
		List<EntityCommentsDTO> responseCommentDTOs = new ArrayList<>();

		if (checkPermission(sectionCode, Boolean.FALSE)) {
			List<EntityComment> comments = entityCommentsDAO.getCommentsBySectionCode(sectionCode, entityNumber);

			if (comments != null) {
				comments.forEach(comment -> commentDTOs.add(mapEntityToDTO(comment)));

				Map<Integer, List<EntityCommentsDTO>> childComments = commentDTOs.stream()
						.filter(comment -> comment.getParentCommentId() != null)
						.collect(Collectors.groupingBy(EntityCommentsDTO::getParentCommentId));

				for (EntityCommentsDTO parentComment : commentDTOs) {
					List<EntityCommentsDTO> children = childComments.get(parentComment.getEntityCommentId());
					if (children != null && parentComment.getIsResolved() != null && Boolean.TRUE.equals(parentComment.getIsResolved())) {
						for (EntityCommentsDTO child : children) {
							child.setIsParentCommentResolved(Boolean.TRUE);
						}
					}
					parentComment.setChildComments(children);
				}
				responseCommentDTOs = commentDTOs.stream().filter(comment -> comment.getParentCommentId() == null).collect(Collectors.toList());
			}
		}
		return responseCommentDTOs;
	}

	private EntityCommentsDTO mapEntityToDTO(EntityComment comment) {
		return EntityCommentsDTO.builder().entityCommentId(comment.getEntityCommentId()).comment(comment.getComment())
				.commentTypeCode(comment.getCommentTypeCode()).parentCommentId(comment.getParentCommentId())
				.updateTimestamp(comment.getUpdateTimestamp()).updatedBy(comment.getUpdatedBy())
				.updatedByFullName(personDao.getPersonFullNameByPersonId(comment.getUpdatedBy()))
				.isResolved(comment.getIsResolved()).resolvedBy(comment.getResolvedBy())
				.resolvedUserFullName(personDao.getPersonFullNameByPersonId(comment.getResolvedBy()))
				.resolvedTimestamp(comment.getResolvedTimestamp()).build();
	}

	@Override
	public ResponseMessageDTO deleteComment(Integer entityCommentId, String sectionCode) {
		if (checkPermission(sectionCode, Boolean.TRUE)) {
			entityCommentsDAO.deleteEntitySectionCommentRef(entityCommentId);
			entityCommentsDAO.deleteComment(entityCommentId);
			return ResponseMessageDTO.builder().message("Deleted successfully").build();
		} else {
			return null;
		}
	}

	@Override
	public Map<String, List<EntityCommentsDTO>> getEntityCommentsByEntityNumber(Integer entityNumber) {
		List<EntitySection> sections = entitySectionRepository.fetchAllEntitySections();
		Map<String, List<EntityCommentsDTO>> sectionCommentsDTO = sections.stream()
				.filter(section -> section.getDescription().contains(COMMENT))
				.collect(Collectors.toMap(section -> section.getEntitySectionCode(),
						section -> fetchAllCommentsBySectionCode(section.getEntitySectionCode(), entityNumber)));
		return sectionCommentsDTO;

	}

	@Override
	public Map<String, Integer> getEntityCommentsCount(Integer entityNumber) {
		List<EntitySection> sections = entitySectionRepository.fetchAllEntitySections();
		Map<String, Integer> sectionCommentCountDTO = sections.stream()
		    .filter(section -> section.getDescription() != null && section.getDescription().contains(COMMENT))
		    .collect(Collectors.toMap(
		    		section -> section.getEntitySectionCode(),
		        section -> { 
		            List<EntityComment> comments = entityCommentsDAO.getCommentsBySectionCode(section.getEntitySectionCode(), entityNumber);
		            return comments.size();
		        }
		    ));
		return sectionCommentCountDTO;
	}

	@Override
	public void resolveEntityComment(Integer entityCommentId) {
		boolean updated = entityCommentsDAO.resolveComment(entityCommentId);

		if (!updated) {
			throw new EntityNotFoundException("Comment not found with ID: " + entityCommentId);
		}
	}

}
