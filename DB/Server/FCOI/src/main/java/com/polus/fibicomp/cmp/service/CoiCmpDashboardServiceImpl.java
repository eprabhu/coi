package com.polus.fibicomp.cmp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.cmp.dao.CoiCmpDashboardDao;
import com.polus.fibicomp.cmp.dto.CoiCmpAdmDashboardReqDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardResponseDto;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;

@Service
public class CoiCmpDashboardServiceImpl implements CoiCmpDashboardService{

	@Autowired
	CoiCmpDashboardDao dashBoardDao;
	
	@Override
	public CoiCmpDashboardResponseDto getCmpAdminDashboard(CoiCmpAdmDashboardReqDto dto) {
		return dashBoardDao.getCmpAdminDashboard(dto);
	}

	@Override
	public CoiCmpDashboardResponseDto getCmpReporterDashboard(CoiCmpRepDashboardDto dto) {
		return dashBoardDao.getCmpReporterDashboard(dto);
	}
}
