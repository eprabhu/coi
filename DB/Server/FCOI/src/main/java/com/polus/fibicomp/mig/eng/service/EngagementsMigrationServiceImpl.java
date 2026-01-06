package com.polus.fibicomp.mig.eng.service;


import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.pojo.PersonEntityRelType;
import com.polus.fibicomp.matrix.dao.MatrixDao;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.mig.eng.dao.EngagementsMigrationDao;
import com.polus.fibicomp.mig.eng.dto.EngDetailRequestDto;
import com.polus.fibicomp.mig.eng.dto.EngMigDashboardDto;
import com.polus.fibicomp.mig.eng.dto.EngMigEntityDto;
import com.polus.fibicomp.mig.eng.dto.EngMigMatrixResonse;
import com.polus.fibicomp.mig.eng.dto.EngMigMatrixResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigStatusUpdateDto;
import com.polus.fibicomp.mig.eng.dto.EngPopulateReqDTO;
import com.polus.fibicomp.mig.eng.pojo.LegacyCoiMatrixQuestion;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EngagementsMigrationServiceImpl implements EngagementsMigrationService {

	@Autowired
	EngagementsMigrationDao engagementsMigrationDao;

	@Autowired
	MatrixDao matrixDao;

	@Autowired
	ConflictOfInterestDao coiDao;
	
	@Autowired
	CommonDao commonDao;

	private static final int ENG_MIG_STATUS_COMPLETED = 1;
	private static final int ENG_MIG_STATUS_EXCLUDED = 2;
	private static final int ENG_MIG_STATUS_TOREVIEW = 3;
	private static final int ENG_MIG_STATUS_INPROGRESS = 4;

	@Override
	public EngMigResponseDto checkEngagementsToMigrate(String personId) {
		return engagementsMigrationDao.checkEngagementsToMigrate(personId);
	}

	@Override
	public Map<String, Object> getEngagementsMigDashboard(EngDetailRequestDto request) {
		return engagementsMigrationDao.getEngagementsMigDashboard(AuthenticatedUser.getLoginPersonId(), request);
	}

	public EngMigMatrixResponseDto fetchEngMatrix(Integer engagementId) {
		List<LegacyCoiMatrixQuestion> legacyMatrixQuestion = engagementsMigrationDao.fetchLegacyMatrixQuestion();
		List<CoiMatrixAnswer> legacyMatrixAnswer =  engagementsMigrationDao.fetchLegacyMatrixAnswer(engagementId, false);
		List<PersonEntityRelType> personEntityRelType = coiDao.fetchPersonEntityRelType();
		List<EngMigMatrixResonse> legacyMatrixResponse = setEngMatrixAnswer(legacyMatrixQuestion, legacyMatrixAnswer, personEntityRelType);
		boolean isFormCompleted = coiDao.checkMatrixCompleted(engagementId);
		EngMigMatrixResponseDto responseDto = EngMigMatrixResponseDto.builder()
			.coiMatrixResponse(legacyMatrixResponse)
			.isMatrixComplete(isFormCompleted)
			.build();
		return responseDto;
	}

	private List<EngMigMatrixResonse> setEngMatrixAnswer(List<LegacyCoiMatrixQuestion> coiMatrixQuestionList, List<CoiMatrixAnswer> coiMatrixAnswerList, 
			List<PersonEntityRelType> personEntityRelTypes) {
		Map<Integer, LegacyCoiMatrixQuestion> questionMap = coiMatrixQuestionList.stream()
			    .collect(Collectors.toMap(LegacyCoiMatrixQuestion::getMatrixQuestionId, q -> q, (a, b) -> a, LinkedHashMap::new));
		List<EngMigMatrixResonse> responses = new ArrayList<>();
		for (Map.Entry<Integer, LegacyCoiMatrixQuestion> entry : questionMap.entrySet()) {
			LegacyCoiMatrixQuestion question = entry.getValue();
		    List<CoiMatrixAnswer> matchingAnswers = coiMatrixAnswerList.stream()
		        .filter(ans -> ans.getMatrixQuestionId().equals(entry.getKey()))
		        .collect(Collectors.toList());
		    EngMigMatrixResonse response = EngMigMatrixResonse.builder()
		        .coiMatrixQuestion(question)
		        .coiMatrixAnswer(matchingAnswers)
		        .relationships(personEntityRelTypes)
		        .build();
		    responses.add(response);
		}
	    return responses;
	}

	@Override
	public boolean checkLegacyEngagements(int engagementId) {
		return engagementsMigrationDao.checkEngagements(engagementId);
	}
	
	@Override
	public List<EngMigEntityDto> getEntityByEntityName(int engagementId) {
		return engagementsMigrationDao.getEntityByEngagementId(engagementId);
	}
	
	@Override
	public EngMigDashboardDto getEngDetails(int engagementId) {
		return engagementsMigrationDao.getMigEngDetails(engagementId);
	}

	@Override
	public void updateMigStatus(EngMigStatusUpdateDto dto) {
		if(dto.getMigrationStatus() != null) {
			if(dto.getMigrationStatus().equalsIgnoreCase("EXCLUDED")) {
				engagementsMigrationDao.updateEngMigStatus(ENG_MIG_STATUS_EXCLUDED, dto.getEngagementIds());
			} 
			if(dto.getMigrationStatus().equalsIgnoreCase("TOREVIEW")) {
				engagementsMigrationDao.updateEngMigStatus(ENG_MIG_STATUS_TOREVIEW, dto.getEngagementIds());
			} 
			if(dto.getMigrationStatus().equalsIgnoreCase("COMPLETED")) {
				engagementsMigrationDao.updateEngMigStatus(ENG_MIG_STATUS_COMPLETED, dto.getEngagementIds());
			}
			if(dto.getMigrationStatus().equalsIgnoreCase("INPROGRESS")) {
				engagementsMigrationDao.updateEngMigStatus(ENG_MIG_STATUS_INPROGRESS, dto.getEngagementIds());
			}
		}
	}

	@Override
	public void populateAndUpdateMigDetails(EngPopulateReqDTO engPopulateDto) {
		List<CoiMatrixAnswer> legacyMatrixAnswer =  engagementsMigrationDao.fetchLegacyMatrixAnswer(engPopulateDto.getLegacyEngagementId(), true);
		legacyMatrixAnswer.forEach(answer -> {
		    answer.setMatrixAnswerId(null);
		    answer.setPersonEntityId(engPopulateDto.getPersonEntityId());
		    answer.setPersonEntityNumber(engPopulateDto.getPersonEntityNumber());
			answer.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
			answer.setUpdateTimestamp(commonDao.getCurrentTimestamp());
		    matrixDao.saveMatrixQuestion(answer);
		});
		engagementsMigrationDao.saveEngFbAnswer(engPopulateDto);
		coiDao.updatePersonEntityUpdateDetails(engPopulateDto.getPersonEntityId());
		engagementsMigrationDao.updateLegEng(engPopulateDto, ENG_MIG_STATUS_INPROGRESS);
	}
}
