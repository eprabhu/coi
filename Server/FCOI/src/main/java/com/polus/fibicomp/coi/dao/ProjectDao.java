package com.polus.fibicomp.coi.dao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.persontraining.pojo.PersonTraining;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.dto.ProjectStatusLookupDto;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.pojo.CoiProjectAwardHistory;
import com.polus.fibicomp.coi.pojo.CoiProjectComment;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.MyAwardDashboardVO;

@Transactional
@Service
public interface ProjectDao {

	/**
	 * This method is used to save comments against project
	 * 
	 * @param comment
	 */
	public void saveComment(CoiProjectComment comment);

	/**
	 * This method is used to update comments against project
	 * 
	 * @param dto
	 */
	public void updateComment(ProjectCommentDto dto);

	/**
	 * This method is used to fetch comments against project
	 * 
	 * @param dto
	 * @return List of CoiProjectComment
	 */
	public List<CoiProjectComment> fetchComment(ProjectCommentDto dto);

	/**
	 * This method is used to delete comments against project
	 * 
	 * @param commentId
	 */
	public void deleteComment(Integer commentId);

	/**
	 * This method is used to check if child comments are present
	 * 
	 * @param commentId
	 * @return True if no child comment is present, False if child comments are present
	 */
	public Boolean canDeleteComment(Integer commentId);

	/**
	 * This method is used to fetch project overview
	 * 
	 * @param vo
	 * @return List of disclosure project dtos
	 */
	List<DisclosureProjectDto> fetchProjectOverview(CoiDashboardVO vo);

	/**
	 * This method is used to fetch project overview count
	 * 
	 * @param vo
	 * @return count of projects
	 */
	public Integer fetchProjectOverviewCount(CoiDashboardVO vo);

	/**
	 * This method is used to fetch project status lookup
	 * 
	 * @return List of project statuses
	 */
	public List<ProjectStatusLookupDto> getProposalStatusLookup();

	/**
	 * @param vo
	 * @param isCount
	 * @return
	 */
	public List<DisclosureProjectDto> fetchMyAwards(MyAwardDashboardVO vo, Boolean isCount);

	public void saveCoiProjectAwardHistory(CoiProjectAwardHistory coiProjectAwardHistory);

	public List<CoiProjectAwardHistory> fetchCoiProjectAwardHistory(String awardNumber);

	/**
	 * @param projectNumber
	 * @return
	 */
	public List<String> getProjectPersonsForReDisclose(String projectNumber);

	public Integer getCountBySponsorCodeAndRequirement(List<String> sponsorCodes, List<String> requirements);

	public List<PersonTraining> getPersonTrainingByParams(String personId, Integer trainingCode);

	public List<ProjectStatusLookupDto> getAwardStatusLookup();

	/**
	 * @param vo
	 * @param isCount
	 * @return
	 */
	public Integer fetchMyAwardCount(MyAwardDashboardVO vo, Boolean isCount);

	public Boolean isDisclosureCompleteForProject(String projectNumber);

	public List<CoiNotificationLog> fetchProjectNotificationHistory(NotificationDto request);

	/**
	 * This method is used to fetch project title
	 * 
	 * @param moduleCode
	 * @param moduleItemKey
	 * @return title of projects
	 */
	public String fetchProjectTitle(Integer moduleCode, String moduleItemKey);

	/**
	 * This method is used to fetch project comment count
	 * 
	 * @param projectCommentDto
	 * @return project comment count
	 */
	public Integer fetchCommentCount(ProjectCommentDto projectCommentDto);

	/**
	 * This method fetches the proposal dashboard details
	 * @param vo
	 * @param isCount
	 * @return
	 */
	List<DisclosureProjectDto> fetchMyProposals(CoiDashboardVO vo, boolean isCount);

	/**
	 * This method fetches the proposal count
	 * @param vo
	 * @param isCount
	 * @return
	 */
	Integer fetchMyProposalsCount(CoiDashboardVO vo, boolean isCount);

	/**
	 * This method is used to resolve comments against project
	 * 
	 * @param dto
	 * @return boolean
	 */
	public Boolean resolveComment(Integer commentId);

}
