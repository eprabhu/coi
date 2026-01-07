package com.polus.fibicomp.cmp.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.dto.CoiCmpAdmDashboardReqDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardResponseDto;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;

@Repository
public interface CoiCmpDashboardDao {

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

	/**
	 * Fetch CMP Reporter Dashboard Count
	 * @param dto
	 * @return Integer
	 */
	Integer fetchCmpReporterDashboardCount(CoiCmpRepDashboardDto dto);

	/**
	 * Fetch CMP History Dashboard
	 * @param dto
	 * @return List of CoiCmpDashboardDto
	 */
	List<CoiCmpDashboardDto> getCmpHistoryDashboard(CoiCmpRepDashboardDto dto);
}
