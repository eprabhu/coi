package com.polus.fibicomp.mig.eng.dao;

import java.util.List;
import java.util.Map;

import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.mig.eng.dto.EngDetailRequestDto;
import com.polus.fibicomp.mig.eng.dto.EngMigDashboardDto;
import com.polus.fibicomp.mig.eng.dto.EngMigEntityDto;
import com.polus.fibicomp.mig.eng.dto.EngMigResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngPopulateReqDTO;
import com.polus.fibicomp.mig.eng.pojo.LegacyCoiMatrixQuestion;

public interface EngagementsMigrationDao {

	/**
	 * This method is used to get the engagements migration count by person ID.
	 *
	 * @param personId the person ID
	 * @return Count of engagements by migration status
	 */
	public EngMigResponseDto checkEngagementsToMigrate(String personId);

	/**
	 * This method is used to get the list of legacy engagements and total count for migration dash-board by person ID.
	 *
	 * @param personId the person ID
	 * @return Engagements and count
	 */
	public List<EngMigDashboardDto> getEngagementDetails(String personId, EngDetailRequestDto request);

	/**
	 * This method is used to fetch the legacy engagement matrix answer by engagementId.
	 *
	 * @param engagementId
	 * @param applyMatrixNameFilter flag to apply matrix name filter. Set to false when fetching matrix answers for showing legacy matrix. Set to true when 
	 * fetching matrix answers for migration.
	 * @return legacy engagement matrix answer
	 */
	public List<CoiMatrixAnswer> fetchLegacyMatrixAnswer(int engagementId, Boolean applyMatrixNameFilter);

	/**
	 * This method is used to check the legacy engagement is valid for the logged in person.
	 *
	 * @param personId the person ID
	 * @return true if engagement is valid, false otherwise
	 */
	public boolean checkEngagements(int engagementId);
	
	/**
	 * This method is used to search the related list of entity for legacy engagement ID from COI entity table.
	 *
	 * @param engagement id
	 * @return EngMigEntityDto
	 */
	public List<EngMigEntityDto> getEntityByEngagementId(int engagementId);

	/**
	 * This method is used to update migration status of legacy engagements.
	 *
	 * @param statusCode
	 * @param engagementId
	 */
	public void updateEngMigStatus(Integer statusCode, List<Integer> engagementIds);

	/**
	 * This method is used to get details of engagement migration dash-board by person ID.
	 *
	 * @param personId
	 * @param EngDetailRequestDto
	 * @return 
	 */
	public Map<String, Object> getEngagementsMigDashboard(String personId, EngDetailRequestDto request);

	/**
	 * This method is used to get details of a legacy engagement.
	 *
	 * @param engagementId
	 * @return EngMigDashboardDto
	 */
	public EngMigDashboardDto getMigEngDetails(int engagementId);
	
	/**
	 * This method is used to save migrated data from legacy engagement into the field entity business focus in the form-builder.
	 *
	 * @param dto
	 */
	public void saveEngFbAnswer(EngPopulateReqDTO dto);
	
	/**
	 * This method is used to save migrated engagement ID and entity number in the legacy_coi_entity table and update migration status to
	 * completed.
	 *
	 * @param dto
	 */
	public void updateLegEng(EngPopulateReqDTO dto, Integer statusCode);

	/**
	 * This method is used to fetch legacy matrix questions from the database.
	 * @return List of LegacyCoiMatrixQuestion
	 */
	public List<LegacyCoiMatrixQuestion> fetchLegacyMatrixQuestion();

}
