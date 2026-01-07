package com.polus.fibicomp.coi.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.dto.AwardDTO;
import com.polus.fibicomp.coi.dto.AwardPersonDTO;
import com.polus.fibicomp.coi.dto.CoiProjectAwardHistoryDTO;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.MyAwardDashboardVO;

@Transactional
@Service
public interface ProjectService {

	/**
	 * This method is used to save comments against project
	 * 
	 * @param comment
	 */
	ResponseEntity<Object> saveComment(ProjectCommentDto dto);

	/**
	 * This method is used to update comments against project
	 * 
	 * @param dto
	 */
	ResponseEntity<Object> updateComment(ProjectCommentDto dto);

	/**
	 * This method is used to fetch comments against project
	 * 
	 * @param dto
	 * @return List of CoiProjectComment
	 */
	List<ProjectCommentDto> fetchComment(ProjectCommentDto dto);

	/**
	 * This method is used to delete comments against project
	 * 
	 * @param commentId
	 */
	ResponseEntity<Object> deleteComment(Integer commentId);

	/**
	 * This method is used to fetch project overview
	 * 
	 * @param vo
	 * @return List of disclosure project dtos
	 */
	ResponseEntity<Object> fetchDashboard(CoiDashboardVO vo);
	
	/**
	 * This method is used to fetch project overview count
	 *
	 * @param vo
	 * @return cont of projects
	 */
	ResponseEntity<Object> fetchDashboardCount(CoiDashboardVO vo);

	/**
	 * This method is used to fetch project status lookup
	 * @param projectType 
	 * 
	 * @return List of project status
	 */
	ResponseEntity<Object> getProjectStatusLookup(String projectType);

	/**
	 * @param vo
	 * @return
	 */
	ResponseEntity<Object> fetchMyAwards(MyAwardDashboardVO vo);

	void updateAwardDisclosureValidationFlag(AwardDTO dto);

	List<CoiProjectAwardHistoryDTO> fetchCoiProjectAwardHistory(String awardNumber);

	void updateAwardKPDisclosureRequirements(AwardPersonDTO dto);

	void recordCompletedDisclosuresInProjectHistory(Integer disclosureId);

	List<CoiNotificationLog> fetchProjectNotificationHistory(NotificationDto request);

	/**
	 * This method is used to fetch project title
	 * 
	 * @param moduleCode
	 * @param moduleItemKey
	 * @return Project title
	 */
	String fetchProjectTitle(Integer moduleCode, String moduleItemKey);

	/**
	 * This method is used to fetch project comment count
	 * 
	 * @param projectCommentDto
	 * @return comment count
	 */
	Integer fetchCommentCount(ProjectCommentDto projectCommentDto);

	/**
	 * Fetch proposals
	 * @param vo
	 * @return
	 */
	ResponseEntity<Object> fetchMyProposals(CoiDashboardVO vo);

	/**
	 * Fetch projects count
	 * @param vo
	 * @return
	 */
	ResponseEntity<Object> fetchMyProjectsCount(CoiDashboardVO vo);

	/**
	 * This method is used to resolve comments against project
	 * 
	 * @param dto
	 */
	void resolveComment(Integer commentId);

	/**
	 * This method is used to update disclosure status against project
	 * 
	 * @param projectNumber
	 */
	void updateAwardDisclosureStatus(String projectNumber);

}
