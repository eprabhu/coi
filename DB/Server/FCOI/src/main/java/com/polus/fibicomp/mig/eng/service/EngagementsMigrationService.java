package com.polus.fibicomp.mig.eng.service;

import java.util.List;
import java.util.Map;

import com.polus.fibicomp.mig.eng.dto.EngDetailRequestDto;
import com.polus.fibicomp.mig.eng.dto.EngMigDashboardDto;
import com.polus.fibicomp.mig.eng.dto.EngMigEntityDto;
import com.polus.fibicomp.mig.eng.dto.EngMigMatrixResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigStatusUpdateDto;
import com.polus.fibicomp.mig.eng.dto.EngPopulateReqDTO;

public interface EngagementsMigrationService {

	/**
	 * This method is used to get the engagement counts by migration status to check migration for a person ID.
	 *
	 * @param personId
	 */
	public EngMigResponseDto checkEngagementsToMigrate(String personId);

	/**
	 * This method is used to get the engagements migration listings and its count for migration dash-board by person ID.
	 *
	 * @param EngDetailRequestDto request
	 * @return List of Engagements and total count
	 */
	public Map<String, Object> getEngagementsMigDashboard(EngDetailRequestDto request);

	/**
	 * This method is used to get the legacy engagement matrix by engagement id.
	 *
	 * @param engagementId
	 * @return legacy engagement matrix
	 */
	public EngMigMatrixResponseDto fetchEngMatrix(Integer engagementId);

	/**
	 * This method is used to check the legacy engagement is valid for the logged in person.
	 *
	 * @param engagementId
	 * @return true if engagement is valid, false otherwise
	 */
	public boolean checkLegacyEngagements(int engagementId);

	/**
	 * This method is used to update legacy engagement's migration status.
	 *
	 */
	public void updateMigStatus(EngMigStatusUpdateDto dto);

	/**
	 * This method is used to get the legacy engagement details by engagementId.
	 *
	 * @param engagementId
	 * @return legacy engagement details
	 */
	public EngMigDashboardDto getEngDetails(int engagementId);

	/**
	 * This method is used to search entity from COI entity table by entity name for an engagement id.
	 *
	 * @param engagementId
	 * @return List of Entity
	 */
	public List<EngMigEntityDto> getEntityByEntityName(int engagementId);

	/**
	 * This method is used to update engagement migration status to completed and, save legacy matrix answers and form-builder answer
	 *  for entity business focus field for an engagement into COI matrix answer table and form-builder tables.
	 *
	 */
	public void populateAndUpdateMigDetails(EngPopulateReqDTO engSaveAnswerDto);
}
