package com.polus.fibicomp.mig.eng.dao;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.ParameterMode;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.StoredProcedureQuery;

import org.hibernate.procedure.internal.ProcedureCallImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.mig.eng.dto.EngDetailRequestDto;
import com.polus.fibicomp.mig.eng.dto.EngMigDashboardDto;
import com.polus.fibicomp.mig.eng.dto.EngMigEntityDto;
import com.polus.fibicomp.mig.eng.dto.EngMigResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngPopulateReqDTO;
import com.polus.fibicomp.mig.eng.pojo.LegacyCoiMatrixQuestion;
import lombok.extern.slf4j.Slf4j;

@Repository
@Transactional
@Slf4j
public class EngagementsMigrationDaoImpl implements EngagementsMigrationDao {

	@PersistenceContext
	EntityManager entityManager;
	
	@Autowired
	CommonDao commonDao;

	@Override
	public EngMigResponseDto checkEngagementsToMigrate(String personId) {
		StringBuilder sql = new StringBuilder();
		sql.append("SELECT COUNT(e) AS totalCount, ")
			.append("COUNT(CASE WHEN e.migrationStatus = 2 THEN 1 END) AS excludedCount, ")
			.append("COUNT(CASE WHEN e.migrationStatus = 3 THEN 1 END) AS toReviewCount, ")
			.append("COUNT(CASE WHEN e.migrationStatus = 1 THEN 1 END) AS completedCount, ")
			.append("COUNT(CASE WHEN e.migrationStatus = 4 THEN 1 END) AS inProgressCount ")
			.append("FROM LegacyCoiEngagements e ")
			.append("WHERE e.personId = :personId and e.statusCode = 1");
		Query query = entityManager.createQuery(sql.toString()).setParameter("personId", personId);
		Object[] result = (Object[]) query.getSingleResult();
		return EngMigResponseDto.builder()
				.totalCount((Long) result[0])
				.excludedCount((Long) result[1])
				.toReviewCount((Long) result[2])
				.completedCount((Long) result[3])
				.inProgressCount((Long) result[4])
				.build();
	}

	@Override
	public Map<String, Object> getEngagementsMigDashboard(String personId, EngDetailRequestDto request) {
		List<EngMigDashboardDto> engagementsDto = getEngagementDetails(personId, request);
		BigInteger count = getEngagementsMigDashboardCount(personId, request);
		Map<String, Object> response = new HashMap<>();
	    response.put("legacyEngagements", engagementsDto);
	    response.put("count", count);
	    return response;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<EngMigDashboardDto> getEngagementDetails(String personId, EngDetailRequestDto request) {
	    List<Object[]> results = getMigEngDashProcCall(request, false).getResultList();
	    List<EngMigDashboardDto> engagementsDto = new ArrayList<>();
	    if(!results.isEmpty()) {
		    for (Object[] row : results) {
		        EngMigDashboardDto dto = EngMigDashboardDto.builder()
	        		.engagementId(row[0] != null ? (Integer) row[0] : null)
		            .entityName(row[1] != null ? row[1].toString() : null)
		            .relationshipType(row[2] != null ? row[2].toString() : null)
		            .entityType(row[3] != null ? row[3].toString() : null)
		            .ownershipType(row[4] != null ? row[4].toString() : null)
		            .entityBusinessFocus(row[5] != null ? row[5].toString() : null)
		            .involvementOfStudents(row[6] != null ? row[6].toString() : null)
		            .involvementOfStaff(row[7] != null ? row[7].toString() : null)
		            .useOfMitResources(row[8] != null ? row[8].toString() : null)
		            .founder(row[9] != null ? row[9].toString() : null)
		            .migrationStatus(row[10] != null ? row[10].toString() : null)
		            .ownershipTypeCode(row[11] != null ? row[11].toString() : null)
		            .coiEngagementId(row[12] != null ? (Integer) row[12] : null)
		            .coiEntityId(row[13] != null ? (Integer) row[13] : null)
		            .initialReportDate(row[14] != null ? row[14].toString() : null)
		            .build();
		        engagementsDto.add(dto);
	    	}
	    }
	    return engagementsDto;
	}

	private BigInteger getEngagementsMigDashboardCount(String personId, EngDetailRequestDto request) {
	    return (BigInteger) getMigEngDashProcCall(request, true).getSingleResult();
	}

	private StoredProcedureQuery getMigEngDashProcCall(EngDetailRequestDto request, Boolean isCount) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("GET_MIG_ENG_DASHBOARD")
	    		.registerStoredProcedureParameter("AV_PERSON_ID", String.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_TAB", String.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_FILTER", String.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_COUNT", Boolean.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_PAGED", Integer.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_LIMIT", Integer.class, ParameterMode.IN)
    			.setParameter("AV_PERSON_ID", AuthenticatedUser.getLoginPersonId())
    			.setParameter("AV_TAB", request.getTab())
    			.setParameter("AV_COUNT", isCount)
    			.setParameter("AV_PAGED", request.getPageNumber())
				.setParameter("AV_LIMIT", request.getPageLimit());
	    if (request.getFilter() == null) {
	        query.unwrap(ProcedureCallImpl.class).getParameterRegistration("AV_FILTER").enablePassingNulls(true);
	        query.setParameter("AV_FILTER", null);
	    } else {
	        query.setParameter("AV_FILTER", request.getFilter());
	    }
	    return query;
	}

	@Override
	public EngMigDashboardDto getMigEngDetails(int engagementId) {
	    try {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("GET_MIG_ENG_DETAILS")
	    		.registerStoredProcedureParameter("AV_ENG_ID", Integer.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_PERSON_ID", String.class, ParameterMode.IN)
	    		.setParameter("AV_ENG_ID", engagementId)
				.setParameter("AV_PERSON_ID", AuthenticatedUser.getLoginPersonId());
	    Object[] result = (Object[]) query.getSingleResult();
        EngMigDashboardDto dto = EngMigDashboardDto.builder()
    		.engagementId(result[0] != null ? (Integer) result[0] : null)
            .entityName(result[1] != null ? result[1].toString() : null)
            .relationshipType(result[2] != null ? result[2].toString() : null)
            .entityType(result[3] != null ? result[3].toString() : null)
            .ownershipType(result[4] != null ? result[4].toString() : null)
            .entityBusinessFocus(result[5] != null ? result[5].toString() : null)
            .involvementOfStudents(result[6] != null ? result[6].toString() : null)
            .involvementOfStaff(result[7] != null ? result[7].toString() : null)
            .useOfMitResources(result[8] != null ? result[8].toString() : null)
            .founder(result[9] != null ? result[9].toString() : null)
            .migrationStatus(result[10] != null ? result[10].toString() : null)
            .ownershipTypeCode(result[11] != null ? result[11].toString() : null)
            .coiEngagementId(result[12] != null ? (Integer) result[12] : null)
            .coiEntityId(result[13] != null ? (Integer) result[13] : null)
            .initialReportDate(result[14] != null ? result[14].toString() : null)
            .build();
	    return dto;
	    } catch (NoResultException e) {
	    	log.error("Error in getMigEngDetails: {}", e.getMessage());
	    	return null;
	    }
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<CoiMatrixAnswer> fetchLegacyMatrixAnswer(int engagementId, Boolean applyMatrixNameFilter) {
		try {
			StoredProcedureQuery query = entityManager.createStoredProcedureQuery("GET_MIG_ENG_MATRIX_ANS")
		    		.registerStoredProcedureParameter("AV_ENG_ID", Integer.class, ParameterMode.IN)
		    		.registerStoredProcedureParameter("AV_IS_MATRIX_FILTERED", Boolean.class, ParameterMode.IN)
		    		.setParameter("AV_ENG_ID", engagementId)
					.setParameter("AV_IS_MATRIX_FILTERED", applyMatrixNameFilter);
			List<Object[]> results = query.getResultList();
			List<CoiMatrixAnswer> answers = new ArrayList<>();
			for(Object[] result: results) {
				CoiMatrixAnswer answer = new CoiMatrixAnswer();
						answer.setMatrixAnswerId((Integer) result[0]);
						answer.setMatrixQuestionId((Integer) result[1]);
						answer.setColumnValue(result[2] != null ? result[2].toString() : null);
						answer.setRelationshipTypeCode(result[3] != null ? result[3].toString() : null);
						answer.setUpdateTimestamp(result[4] != null ? (java.sql.Timestamp) result[4] : null);
						answer.setUpdatedBy(result[5] != null ? result[5].toString() : null);
						answer.setComments(result[6] != null ? result[6].toString() : null);
				answers.add(answer);
			}
		    return answers;
		    } catch (NoResultException e) {
		    	log.error("Error in fetchLegacyMatrixAnswer: {}", e.getMessage());
		    	throw new ApplicationException("No matrix answers found for the engagement ID: " + engagementId, e.getMessage());
		    }
	}
	
	@Override
	public boolean checkEngagements(int engagementId) {
		String sql = "SELECT 1 FROM LegacyCoiEngagements e WHERE e.engagementId = :engagementId AND e.personId = :personId";
		List<Integer> result = entityManager.createQuery(sql, Integer.class)
		        .setParameter("engagementId", engagementId)
		        .setParameter("personId", AuthenticatedUser.getLoginPersonId())
		        .setMaxResults(1)
		        .getResultList();
		return !result.isEmpty();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<EngMigEntityDto> getEntityByEngagementId(int engagmentId) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("GET_MIG_ENG_ENTITY")
	    		.registerStoredProcedureParameter("AV_ENG_ID", Integer.class, ParameterMode.IN)
				.setParameter("AV_ENG_ID", engagmentId);
		List<Object[]> results = query.getResultList();
		List<EngMigEntityDto> response = new ArrayList<>();
		for(Object[] result: results) {
			EngMigEntityDto dto = EngMigEntityDto.builder()
					.entityId((Integer) result[0])
					.entityNumber((Integer) result[1])
					.entityName(result[2] != null? result[2].toString(): null)
					.addressLine1(result[3] != null ? result[3].toString(): null)
					.addressLine2(result[4] != null ? result[4].toString(): null)
					.city(result[5] != null? result[5].toString(): null)
					.state(result[6] != null? result[6].toString(): null)
					.country(result[7] != null ? result[7].toString() : null)
					.dunsNumber(result[8] != null ? result[8].toString() : null)
					.ueiNumber(result[9] != null ? result[9].toString() : null)
					.organizationId(result[10] != null ? result[10].toString() : null)
					.sponsorCode(result[11] != null? result[11].toString(): null)
					.postalCode(result[12] != null? result[12].toString(): null)
					.cageNumber(result[13] != null? result[13].toString(): null)
					.website(result[14] != null? result[14].toString(): null)
					.ownershipType(result[15] != null? result[15].toString(): null)
					.businessType(result[16] != null? result[16].toString(): null)
					.build();
			response.add(dto);
		}
		return response;
	}

	@Override
	public void updateEngMigStatus(Integer statusCode, List<Integer> engagementIds) {
		StringBuilder sql = new StringBuilder();
		sql.append("UPDATE LegacyCoiEngagements e SET ")
			.append("e.migrationStatus = :migrationStatus, ")
			.append("e.updatedBy = :updatedBy, ")
			.append("e.updateTimestamp = :updateTimestamp ")
			.append("WHERE e.engagementId IN :engagementIds");
		Query query = entityManager.createQuery(sql.toString())
				.setParameter("migrationStatus", statusCode)
				.setParameter("engagementIds", engagementIds)
				.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId())
				.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		int response = query.executeUpdate();
		log.info("Number of engagement records updated: {}", response);
	}

	@Override
	public void saveEngFbAnswer(EngPopulateReqDTO dto) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("INSERT_MIG_ENG_FB_ANS")
	    		.registerStoredProcedureParameter("AV_ENG_ID", Integer.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_LEG_ENG_ID", Integer.class, ParameterMode.IN)
	    		.registerStoredProcedureParameter("AV_PERSON_ID", String.class, ParameterMode.IN)
				.setParameter("AV_ENG_ID", dto.getPersonEntityId())
				.setParameter("AV_LEG_ENG_ID", dto.getLegacyEngagementId())
				.setParameter("AV_PERSON_ID", AuthenticatedUser.getLoginPersonId());
		query.execute();
	}

	@Override
	public void updateLegEng(EngPopulateReqDTO dto, Integer statusCode) {
		StringBuilder sql = new StringBuilder();
		sql.append("UPDATE LegacyCoiEngagements e SET ")
			.append("e.migrationStatus = :migrationStatus, ")
			.append("e.fibiCoiEngagementId = :engagementId, ")
			.append("e.fibiCoiEntityId = :entityId, ")
			.append("e.updatedBy = :updatedBy, ")
			.append("e.updateTimestamp = :updateTimestamp ")
			.append("WHERE e.engagementId = :legacyEngagementId");
		Query query = entityManager.createQuery(sql.toString())
				.setParameter("migrationStatus", statusCode)
				.setParameter("engagementId", dto.getPersonEntityId())
				.setParameter("entityId", dto.getPersonEntityNumber())
				.setParameter("legacyEngagementId", dto.getLegacyEngagementId())
				.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId())
				.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.executeUpdate();
	}
	
	@Override
	public List<LegacyCoiMatrixQuestion> fetchLegacyMatrixQuestion() {
		String jpql = "SELECT e FROM LegacyCoiMatrixQuestion e ORDER BY e.groupId asc, e.sortId asc";
        return entityManager.createQuery(jpql, LegacyCoiMatrixQuestion.class).getResultList();
	}

}
