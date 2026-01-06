package com.polus.fibicomp.compliance.declaration.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardRequest;
import com.polus.fibicomp.compliance.declaration.service.DeclDashboardService;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@RestController
@RequestMapping("/declaration/dashboard")
@Slf4j
public class DeclDashboardController {

	@Autowired
	private DeclDashboardService declDashboardService;

	@PostMapping("/getDashboardData")
	public ResponseEntity<?> getDeclarationDashboardData(@RequestBody DeclDashboardRequest request) {
		try {
			Map<String, Object> declarationDashboard = request.getDeclarationDashboardData();

			log.info("Received dashboard data request: {}", declarationDashboard);

			List<String> validationMessages = new ArrayList<>();

			if (!declDashboardService.validateDeclarationDashboardData(declarationDashboard, validationMessages)) {
				log.warn("Validation failed: {}", validationMessages);
				return ResponseEntity.badRequest().body("Validation errors: " + String.join(", ", validationMessages));
			}

			String dashboardJson = declDashboardService.getDeclarationDashBoardData(request);
			log.info("Dashboard data response generated successfully.");
			return ResponseEntity.ok(dashboardJson);

		} catch (Exception e) {
			log.error("Error occurred while fetching declaration dashboard data", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while processing your request. Please try again later.");
		}
	}

    @PostMapping("/getAdminDashboardTabCount")
    public ResponseEntity<?> getAdminDashboardTabCount(@RequestBody DeclDashboardRequest request) {
        log.info("Requesting for getAdminDashboardTabCount");
        try {
            return new ResponseEntity<>(declDashboardService.getAdminDashboardTabCount(request), HttpStatus.OK);
        } catch (Exception e) {
            throw new ApplicationException("Exception on getAdminDashboardTabCount", e, e.getMessage());
        }

    }
}
