package com.polus.fibicomp.cmp.service;

import org.springframework.stereotype.Service;

import com.polus.fibicomp.cmp.dto.CoiCmpAdmDashboardReqDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardResponseDto;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;

@Service
public interface CoiCmpDashboardService {

	/**
	 * Fetch CMP Admin Dashboard Records
	 * @param dto
	 * @return CoiCmpDashboardResponseDto
	 */
	CoiCmpDashboardResponseDto getCmpAdminDashboard(CoiCmpAdmDashboardReqDto dto);
	
	/**
	 * Fetch CMP Reporter Dashboard Records
	 * @param dto
	 * @return CoiCmpDashboardResponseDto
	 */
	CoiCmpDashboardResponseDto getCmpReporterDashboard(CoiCmpRepDashboardDto dto);
}
