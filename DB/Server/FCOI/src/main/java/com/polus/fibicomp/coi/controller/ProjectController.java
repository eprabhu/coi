package com.polus.fibicomp.coi.controller;

import java.util.List;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.fibicomp.coi.dto.AwardDTO;
import com.polus.fibicomp.coi.dto.AwardPersonDTO;
import com.polus.fibicomp.coi.dto.CoiProjectAwardHistoryDTO;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.service.ProjectService;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.MyAwardDashboardVO;
import com.polus.fibicomp.constants.Constants;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/project")
public class ProjectController {

	@Autowired
	private ProjectService projectService;

	@PostMapping("/fetchDashbaord")
	public ResponseEntity<Object> fetchDashboard(@RequestBody CoiDashboardVO vo) {
		log.info("Requesting for fetchDashbaord...!");
		try {
			return projectService.fetchDashboard(vo);
		} catch (Exception e) {
			log.error("Error fetching dashboard for request: {}", vo, e);
			throw new ApplicationException("Failed to fetch dashboard", Constants.JAVA_ERROR);
		}
	}
	
	@PostMapping("/fetchDashboardCount")
	public ResponseEntity<Object> fetchDashboardCount(@RequestBody CoiDashboardVO vo) {
		log.info("Requesting for fetchDashbaordCount...!");
		try {
			return projectService.fetchDashboardCount(vo);
		} catch (Exception e) {
			log.error("Error fetching dashboard count for request: {}", vo, e);
			throw new ApplicationException("Failed to fetch dashboard count", Constants.JAVA_ERROR);
		}
	}

	@GetMapping("/getProjectStatusLookup/{projectType}")
	public ResponseEntity<Object> getProjectStatusLookup(@PathVariable(value = "projectType", required = true) final String projectType) {
		return projectService.getProjectStatusLookup(projectType);
	}

	@PostMapping("/saveComment")
	public ResponseEntity<Object> saveComment(@RequestBody ProjectCommentDto dto) {
		return projectService.saveComment(dto);
	}

	@PatchMapping("/updateComment")
	public ResponseEntity<Object> updateComment(@RequestBody ProjectCommentDto dto) {
		return projectService.updateComment(dto);
	}

	@PostMapping("/fetchComment")
	public ResponseEntity<Object> fetchComment(@RequestBody ProjectCommentDto dto) {
		return new ResponseEntity<>(projectService.fetchComment(dto), HttpStatus.OK);
	}

	@DeleteMapping("/deleteComment/{commentId}")
	public ResponseEntity<Object> deleteComment(@PathVariable(value = "commentId", required = true) final Integer commentId) {
		return projectService.deleteComment(commentId);
	}

	@PostMapping("/fetchMyAwards")
	public ResponseEntity<Object> fetchMyAwards(@RequestBody MyAwardDashboardVO vo) {
		log.info("Requesting for fetchMyAwards");
		return projectService.fetchMyAwards(vo);
	}

	@PutMapping("/updateAwardDisclosureValidationFlag")
	public ResponseEntity<Object> updateAwardDisclosureValidationFlag(@RequestBody AwardDTO dto) {
		log.info("Requesting for updateAwardDisclosureValidationFlag, awardNumber: {}, disclosureValidationFlag: {}",
				dto.getProjectNumber(), dto.getDisclosureValidationFlag());
		projectService.updateAwardDisclosureValidationFlag(dto);
		projectService.updateAwardDisclosureStatus(dto.getProjectNumber());
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PutMapping("/updateAwardKPDisclosureRequirements")
	public ResponseEntity<Object> updateAwardKPDisclosureRequirements(@RequestBody AwardPersonDTO dto) {
		log.info("Requesting for updateAwardKPDisclosureRequirements, awardNumber: {}, flag: {}", dto.getProjectNumber(), dto.getNewDisclosureRequired());
		projectService.updateAwardKPDisclosureRequirements(dto);
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@GetMapping("/fetchCoiProjectAwardHistory/{awardNumber}")
	public ResponseEntity<List<CoiProjectAwardHistoryDTO>> fetchCoiProjectAwardHistory(@PathVariable(value = "awardNumber", required = true) final String awardNumber) {
		return new ResponseEntity<>(projectService.fetchCoiProjectAwardHistory(awardNumber), HttpStatus.OK);
	}

	@GetMapping("/recordCompletedDisclosuresInProjectHistory/{disclosureId}")
	public void recordCompletedDisclosuresInProjectHistory(@PathVariable final Integer disclosureId) {
		log.info("Received request to validate and update disclosure status for disclosureId: {}", disclosureId);
		try {
			projectService.recordCompletedDisclosuresInProjectHistory(disclosureId);
			log.info("Successfully processed disclosure completion validation for disclosureId: {}", disclosureId);
		} catch (Exception e) {
			log.error("Error occurred while validating disclosure completion for disclosureId: {}", disclosureId, e);
		}
	}

	@PostMapping("/fetchProjectNotificationHistory")
	public ResponseEntity<?> fetchProjectNotificationHistory(@RequestBody NotificationDto request) {
		log.info("Received request to fetch project notification logs with disclosureId: {}, projectId: {}, publishedUserId: {}, actionType: {}",
				request.getDisclosureId(), request.getProjectId(), request.getPublishedUserId(), request.getActionType());

		try {
			List<CoiNotificationLog> logs = projectService.fetchProjectNotificationHistory(request);

			if (logs == null || logs.isEmpty()) {
				log.warn("No notification logs found for disclosureId: {}, projectId: {}, publishedUserId: {}, actionType: {}",
						request.getDisclosureId(), request.getProjectId(), request.getPublishedUserId(), request.getActionType());
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No notification logs found.");
			}

			log.info("Found {} notification logs for disclosureId: {}, projectId: {}, publishedUserId: {}, actionType: {}",
					logs.size(), request.getDisclosureId(), request.getProjectId(), request.getPublishedUserId(), request.getActionType());

			return ResponseEntity.ok(logs);
		} catch (Exception e) {
			log.error("Error while fetching notification logs for disclosureId: {}, projectId: {}, publishedUserId: {}, actionType: {}",
					request.getDisclosureId(), request.getProjectId(), request.getPublishedUserId(), request.getActionType(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while retrieving notification logs.");
		}
	}

	@PostMapping("/fetchMyProposals")
	public ResponseEntity<Object> fetchMyProposals(@RequestBody CoiDashboardVO vo) {
		log.info("Requesting for fetchMyProposals");
		return projectService.fetchMyProposals(vo);
	}

	@PostMapping("/fetchMyProjectsCount")
	public ResponseEntity<Object> fetchMyProjectsCount(@RequestBody CoiDashboardVO vo) {
		log.info("Requesting for fetchMyProjectsCount");
		return projectService.fetchMyProjectsCount(vo);
	}

	@GetMapping("/resolveProjectComment/{commentId}")
	public ResponseEntity<Object> resolveProjectComment(@PathVariable(value = "commentId") Integer commentId) {
		log.info("Attempting to resolve project comment - CommentId: {}", commentId);
		try {
			projectService.resolveComment(commentId);
			log.info("Successfully resolved comment with ID: {}", commentId);
			return ResponseEntity.ok("Comment resolved successfully.");
		} catch (EntityNotFoundException e) {
			log.warn("Comment not found - ID: {}", commentId, e);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found with ID: " + commentId);
		} catch (Exception e) {
			log.error("Unexpected error while resolving comment - ID: {}", commentId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while resolving the comment.");
		}
	}

}
