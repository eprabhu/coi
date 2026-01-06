package com.polus.fibicomp.globalentity.dashboard.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboardDTO;
import com.polus.fibicomp.globalentity.dashboard.service.EntityDashboardService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/entity")
@Slf4j
public class EntityDashboardController {

	@Autowired
	private EntityDashboardService entityDashboardService;

	@PostMapping("/getEntityDashboardData")
	public ResponseEntity<?> getEntityDashboardData(@RequestBody EntityDashboardDTO vo) {
		try {
			 vo.setPersonId(AuthenticatedUser.getLoginPersonId());
			log.info("Requesting getEntityDashboardData for personId: {}", vo.getPersonId());

			List<String> validationMessages = new ArrayList<>();
			Map<String, Object> globalEntityDashboard = vo.getEntityDashboardData();
			globalEntityDashboard.put("PERSON_ID", vo.getPersonId());
			String sortType = (String) globalEntityDashboard.get("SORT_TYPE");
			if (sortType == null || sortType.isEmpty()) {
				globalEntityDashboard.put("SORT_TYPE", "UPDATE_TIMESTAMP DESC");
			}
			log.info("globalEntityDashboard : {}", globalEntityDashboard);

			if (!entityDashboardService.validateEntityDashboardData(globalEntityDashboard, validationMessages)) {
				log.warn("Validation failed with messages: {}", validationMessages);
				return ResponseEntity.badRequest().body("Validation errors: " + String.join(", ", validationMessages));
			}

			vo.setEntityDashboardData(globalEntityDashboard);

			return ResponseEntity.ok(entityDashboardService.getEntityDashBoardData(vo));

		} catch (Exception e) {
			log.error("Error occurred while fetching entity dashboard data", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while processing your request. Please try again later.");
		}
	}

}
