package com.polus.kcintegration.award.dao;

import java.util.List;

import com.polus.kcintegration.award.dto.AwardDTO;
import com.polus.kcintegration.award.dto.AwardPersonDTO;
import com.polus.kcintegration.award.dto.ProjectSyncRequest;

public interface AwardIntegrationDao {

	/**
	 * @param projectNumber
	 * @return
	 */
	public AwardDTO fetchProjectByProjectNumber(String projectNumber);

	/**
	 * @param projectNumber
	 * @return
	 */
	public List<AwardPersonDTO> fetchProjectPersons(String projectNumber);

	public ProjectSyncRequest syncPersonProjects(String personId);

}
