package com.polus.integration.award.dao;


import java.util.List;

import org.springframework.stereotype.Service;

import com.polus.integration.award.dto.AwardDTO;
import com.polus.integration.award.pojo.COIIntegrationAward;
import com.polus.integration.award.pojo.COIIntegrationAwardPerson;
import com.polus.integration.proposal.dto.DisclosureResponse;

import jakarta.transaction.Transactional;

@Transactional
@Service
public interface AwardIntegrationDao {

	/**
	 * @param awardDTO
	 * @param moduleCode 
	 * @return
	 */
	public Boolean canUpdateProjectDisclosureFlag(AwardDTO awardDTO);

	/**
	 * @param projectNumber
	 */
	public void postIntegrationProcess(String projectNumber);

	/**
	 * @param award
	 */
	public void saveAward(COIIntegrationAward award);

	/**
	 * @param projectPerson
	 */
	public void saveAwardPerson(COIIntegrationAwardPerson projectPerson);

	public DisclosureResponse feedAwardDisclosureStatus(String awardNumber, List<String> personIds);

	public DisclosureResponse checkAwardDisclosureStatus(String awardNumber);

	public void updateKPDisclosureRequirements(String projectNumber, String newDisclosureRequiredFlag);

	public void updateDisclosureValidationFlag(String awardNumber, String disclosureValidationFlag);

	public void updateKPDisclosureRequirements(List<String> projectNumbers, String newDisclosureRequired, String keyPersonId);

	public void insertAwardHistory(String awardNumber, String message);

	public List<String> findProjectNumbersByKeyPersonId(String keyPersonId);

}
