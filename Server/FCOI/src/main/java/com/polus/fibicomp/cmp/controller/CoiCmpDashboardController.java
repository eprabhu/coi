package com.polus.fibicomp.cmp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.cmp.dto.CoiCmpAdmDashboardReqDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardResponseDto;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;
import com.polus.fibicomp.cmp.service.CoiCmpDashboardService;

@RestController
@RequestMapping("/cmp")
public class CoiCmpDashboardController {

	@Autowired
	private CoiCmpDashboardService dashboardService;

	@PostMapping("/adminDashboard")
	public ResponseEntity<CoiCmpDashboardResponseDto> getCmpAdminDashboard(@RequestBody CoiCmpAdmDashboardReqDto dto) {
	    CoiCmpDashboardResponseDto response = dashboardService.getCmpAdminDashboard(dto);
	    return ResponseEntity.ok(response);
	}
	
	@PostMapping("/reporterDashboard")
	public ResponseEntity<CoiCmpDashboardResponseDto> getCmpReporterDashboard(@RequestBody CoiCmpRepDashboardDto dto) {
	    CoiCmpDashboardResponseDto response = dashboardService.getCmpReporterDashboard(dto);
	    return ResponseEntity.ok(response);
	}
}
