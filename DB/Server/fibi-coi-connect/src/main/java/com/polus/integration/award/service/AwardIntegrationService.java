package com.polus.integration.award.service;

import java.util.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.integration.award.dto.AwardDTO;
import com.polus.integration.award.dto.AwardPersonDTO;
import com.polus.integration.proposal.dto.DisclosureResponse;


@Service
public interface AwardIntegrationService {


	/**
	 * @param award
	 */
	public ResponseEntity<AwardDTO> feedAward(AwardDTO award);

	public DisclosureResponse feedAwardPersonDisclosureStatus(String awardNumber, List<String> personIds);

	public DisclosureResponse checkAwardDisclosureStatus(String awardNumber);

	public void updateAwardDisclosureValidationFlag(String awardNumber,String disclosureValidationFlag);

	public void updateKPDisclosureRequirements(AwardPersonDTO dto);

	public void updateAwardDisclosureStatus(String projectNumber, String yes);

	public void updateAwardDisclosureStatus(String projectNumber, String no, Set<String> newPersonIds);

	public void notifyUserForDisclosureCreation(AwardDTO awardDTO);

	public void syncPersonProjects(String personId);

}
