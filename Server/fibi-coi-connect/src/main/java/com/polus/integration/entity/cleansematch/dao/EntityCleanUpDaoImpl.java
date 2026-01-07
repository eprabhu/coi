package com.polus.integration.entity.cleansematch.dao;

import com.polus.integration.entity.cleansematch.constants.Constants;
import com.polus.integration.entity.cleansematch.dto.EntityCleanUpDto;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminActionType;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminReviewStatusType;
import com.polus.integration.entity.cleansematch.entity.EntityStageBatch;
import com.polus.integration.entity.cleansematch.entity.EntityStageDetails;
import com.polus.integration.pojo.State;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
@Slf4j
public class EntityCleanUpDaoImpl implements EntityCleanUpDao {

    @Autowired
    private EntityManager entityManager;

    @Override
    public List<EntityStageBatch> getEntityCleanUpBatches(EntityCleanUpDto entityCleanUpDto) {
        StringBuilder queryBuilder = new StringBuilder("select e from EntityStageBatch e WHERE e.batchStatusCode = :batchStatusCode ");

        if (entityCleanUpDto.getBatchId() != null) {
            queryBuilder.append(" AND e.batchId = :batchId ");
        }
        if (entityCleanUpDto.getBatchStatusCodes() != null && entityCleanUpDto.getBatchStatusCodes().length != 0) {
            queryBuilder.append(" AND e.batchStatusCode in :batchStatusCode ");
        }
        if (entityCleanUpDto.getReviewStatusCodes() != null && entityCleanUpDto.getReviewStatusCodes().length != 0) {
            queryBuilder.append(" AND e.reviewStatusCode in :reviewStatusCode ");
        }
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("batchStatusCode", Constants.BATCH_STATUS_COMPLETED);
        if (entityCleanUpDto.getBatchId() != null) {
            query.setParameter("batchId", entityCleanUpDto.getBatchId());
        }
        if (entityCleanUpDto.getBatchStatusCodes() != null && entityCleanUpDto.getBatchStatusCodes().length != 0) {
            query.setParameter("batchStatusCode",  Arrays.asList(entityCleanUpDto.getBatchStatusCodes()));
        }
        if (entityCleanUpDto.getReviewStatusCodes() != null && entityCleanUpDto.getReviewStatusCodes().length != 0) {
            query.setParameter("reviewStatusCode",  Arrays.asList(entityCleanUpDto.getReviewStatusCodes()));
        }
        return query.getResultList();
    }

    @Override
    public List<EntityStageDetails> getEntityCleanUpBatchDetails(EntityCleanUpDto entityCleanUpDto) {
        List<EntityStageDetails> entityDetails = new ArrayList<>();
        Query query = entityManager.createQuery(getEntityCleanUpBatchDetailsQuery(entityCleanUpDto).toString());
        query.setParameter("batchId", entityCleanUpDto.getBatchId());
        if (entityCleanUpDto.getIsExactDunsMatch() != null && entityCleanUpDto.getIsExactDunsMatch()) {
            query.setParameter("isExactDunsMatch", Constants.ENTITY_MATCH_STATUS_EXACT_MATCH);
        }
        if (entityCleanUpDto.getIsMultipleDunsMatch() != null && entityCleanUpDto.getIsMultipleDunsMatch()) {
            query.setParameter("isMultipleDunsMatch", Constants.ENTITY_MATCH_STATUS_MULTIPLE_MATCH);
        }
        if (entityCleanUpDto.getIsNoDunsMatch() != null && entityCleanUpDto.getIsNoDunsMatch()) {
            query.setParameter("isNoDunsMatch", Constants.ENTITY_MATCH_STATUS_NO_MATCH);
        }
        if (entityCleanUpDto.getIsDuplicateInBatch() != null && entityCleanUpDto.getIsDuplicateInBatch()) {
            query.setParameter("isDuplicateInSrc", true);
        }
        if (entityCleanUpDto.getIsDuplicateInEntitySys() != null && entityCleanUpDto.getIsDuplicateInEntitySys()) {
            query.setParameter("isSystemDuplicate", true);
        }
        if (entityCleanUpDto.getAdminReviewStatusCodes() != null) {
            query.setParameter("adminReviewStatusCodes", Arrays.asList(entityCleanUpDto.getAdminReviewStatusCodes()));
        }
        if (entityCleanUpDto.getAdminActionCodes() != null) {
            query.setParameter("adminActionCodes", Arrays.asList(entityCleanUpDto.getAdminActionCodes()));
        }
        if (entityCleanUpDto.getSearchKeyword() != null && !entityCleanUpDto.getSearchKeyword().isEmpty()) {
            query.setParameter("searchKeyword", "%" + entityCleanUpDto.getSearchKeyword() + "%");
        }
        query.setFirstResult((entityCleanUpDto.getPageNumber() -1 ) * entityCleanUpDto.getTotalCount());  // Starting index for the page
        query.setMaxResults(entityCleanUpDto.getTotalCount());  // Maximum number of results per page
        List<Object[]> results = query.getResultList();
        for (Object[] result : results) {
            EntityStageDetails entity = (EntityStageDetails) result[0];
            entity.setCanReReview((Boolean) result[1]);
            entityDetails.add(entity);
        }
        return entityDetails;
    }

    private static StringBuilder getEntityCleanUpBatchDetailsQuery(EntityCleanUpDto entityCleanUpDto) {
        StringBuilder queryBuilder = new StringBuilder("SELECT ed, (CASE WHEN ");
        queryBuilder.append("(ed1.adminReviewStatusCode IS NOT NULL AND ed1.adminReviewStatusCode = 1) ");
        queryBuilder.append( " OR ed.adminActionCode = 4 ");
        queryBuilder.append("THEN true ELSE false END) ");
        queryBuilder.append("FROM EntityStageDetails ed LEFT JOIN EntityStageDetails ed1 ON ed1.entityStageDetailId = ed.originatingId WHERE ed.batchId = :batchId ");
        getEntityCleanUpBatchDetailsConditions(entityCleanUpDto, queryBuilder);
        return queryBuilder;
    }

    @Override
    public Long getEntityCleanUpBatchDetailsCount(EntityCleanUpDto entityCleanUpDto) {
        TypedQuery<Long> query = entityManager.createQuery(getEntityCleanUpBatchDetailsCountQuery(entityCleanUpDto).toString(), Long.class);
        query.setParameter("batchId", entityCleanUpDto.getBatchId());
        if (entityCleanUpDto.getIsExactDunsMatch() != null && entityCleanUpDto.getIsExactDunsMatch()) {
            query.setParameter("isExactDunsMatch", Constants.ENTITY_MATCH_STATUS_EXACT_MATCH);
        }
        if (entityCleanUpDto.getIsMultipleDunsMatch() != null && entityCleanUpDto.getIsMultipleDunsMatch()) {
            query.setParameter("isMultipleDunsMatch", Constants.ENTITY_MATCH_STATUS_MULTIPLE_MATCH);
        }
        if (entityCleanUpDto.getIsNoDunsMatch() != null && entityCleanUpDto.getIsNoDunsMatch()) {
            query.setParameter("isNoDunsMatch", Constants.ENTITY_MATCH_STATUS_NO_MATCH);
        }
        if (entityCleanUpDto.getIsDuplicateInBatch() != null && entityCleanUpDto.getIsDuplicateInBatch()) {
            query.setParameter("isDuplicateInSrc", true);
        }
        if (entityCleanUpDto.getIsDuplicateInEntitySys() != null && entityCleanUpDto.getIsDuplicateInEntitySys()) {
            query.setParameter("isSystemDuplicate", true);
        }
        if (entityCleanUpDto.getAdminReviewStatusCodes() != null) {
            query.setParameter("adminReviewStatusCodes", Arrays.asList(entityCleanUpDto.getAdminReviewStatusCodes()));
        }
        if (entityCleanUpDto.getAdminActionCodes() != null) {
            query.setParameter("adminActionCodes", Arrays.asList(entityCleanUpDto.getAdminActionCodes()));
        }
        if (entityCleanUpDto.getSearchKeyword() != null && !entityCleanUpDto.getSearchKeyword().isEmpty()) {
            query.setParameter("searchKeyword", "%" + entityCleanUpDto.getSearchKeyword() + "%");
        }
        return Optional.ofNullable((Long) query.getSingleResult()).orElse(0L);

    }

    private static StringBuilder getEntityCleanUpBatchDetailsCountQuery(EntityCleanUpDto entityCleanUpDto) {
        StringBuilder queryBuilder = new StringBuilder("SELECT count(ed.entityStageDetailId) FROM EntityStageDetails ed WHERE ed.batchId = :batchId ");
        getEntityCleanUpBatchDetailsConditions(entityCleanUpDto, queryBuilder);
        return queryBuilder;
    }

    private static void getEntityCleanUpBatchDetailsConditions(EntityCleanUpDto entityCleanUpDto, StringBuilder mainQueryBuilder) {
        StringBuilder queryBuilder = new StringBuilder();
        String AND = "";
        String OR = "";
        if (entityCleanUpDto.getIsExactDunsMatch() != null && entityCleanUpDto.getIsExactDunsMatch()) {
            queryBuilder.append("(");
            queryBuilder.append(" (ed.matchStatusCode = :isExactDunsMatch) ");
            AND = " AND ";
            OR = " OR ";
        }
        if (entityCleanUpDto.getIsMultipleDunsMatch() != null && entityCleanUpDto.getIsMultipleDunsMatch()) {
            if (queryBuilder.isEmpty()) {
                queryBuilder.append("(");
            }
            queryBuilder.append(OR);
            queryBuilder.append(" (ed.matchStatusCode = :isMultipleDunsMatch)");
            AND = " AND ";
            OR = "OR";
        }
        if (entityCleanUpDto.getIsNoDunsMatch() != null && entityCleanUpDto.getIsNoDunsMatch()) {
            if (queryBuilder.isEmpty()) {
                queryBuilder.append("(");
            }
            queryBuilder.append(OR);
            queryBuilder.append(" ed.matchStatusCode = :isNoDunsMatch ");
            AND = " AND ";
            OR = "OR";
        }
        if (entityCleanUpDto.getIsDuplicateInBatch() != null && entityCleanUpDto.getIsDuplicateInBatch()) {
            if (queryBuilder.isEmpty()) {
                queryBuilder.append("(");
            }
            queryBuilder.append(OR);
            queryBuilder.append("(ed.groupNumber IS NOT NULL AND ed.isDuplicateInSrc = :isDuplicateInSrc )");
            AND = " AND ";
            OR = "OR";
        }
        if (entityCleanUpDto.getIsDuplicateInEntitySys() != null && entityCleanUpDto.getIsDuplicateInEntitySys()) {
            if (queryBuilder.isEmpty()) {
                queryBuilder.append("(");
            }
            queryBuilder.append(OR);
            queryBuilder.append(" (ed.entityId IS NOT NULL AND ed.isSystemDuplicate = :isSystemDuplicate)");
            AND = " AND ";
        }
        if (!queryBuilder.isEmpty()) {
            queryBuilder.append(")");
        }
        if (entityCleanUpDto.getAdminReviewStatusCodes() != null) {
            queryBuilder.append(AND);
            queryBuilder.append(" ed.adminReviewStatusCode IN :adminReviewStatusCodes ");
            AND = " AND ";
        }
        if (entityCleanUpDto.getSearchKeyword() != null && !entityCleanUpDto.getSearchKeyword().isEmpty()) {
            queryBuilder.append(AND);
            queryBuilder.append(" ed.srcDataName like :searchKeyword ");
            AND = " AND ";
        }
        if (entityCleanUpDto.getAdminActionCodes() != null) {
            queryBuilder.append(AND);
            queryBuilder.append(" ed.adminActionCode IN :adminActionCodes ");
        }
        if (!queryBuilder.isEmpty()) {
            mainQueryBuilder.append("AND (");
            mainQueryBuilder.append(queryBuilder);
            mainQueryBuilder.append(")");
        }

    }

    @Override
    public EntityStageDetails getEntityCleanUpEntityDetail(Integer entityStageDetailId) {
        Query query = entityManager.createQuery("SELECT ed FROM EntityStageDetails ed WHERE ed.entityStageDetailId = :entityStageDetailId");
        query.setParameter("entityStageDetailId", entityStageDetailId);
        return (EntityStageDetails) query.getResultList().get(0);
    }

    @Override
    public List<EntityStageDetails> getEntityDetailsByGroupNumber(Integer entityStageDetailId) {
        StringBuilder queryBuilder = new StringBuilder("SELECT ed FROM EntityStageDetails ed ");
        queryBuilder.append("LEFT JOIN EntityStageDetails ed1 ON ed1.entityStageDetailId = :entityStageDetailId ");
        queryBuilder.append("WHERE ed1.groupNumber IS NOT NULL AND ed.groupNumber = ed1.groupNumber AND ed.batchId = ed1.batchId  AND ed.entityStageDetailId != :entityStageDetailId " );
        queryBuilder.append("AND ed.adminReviewStatusCode != :adminReviewStatusCode");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("adminReviewStatusCode", Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        return query.getResultList();
    }

    @Override
    public void updateAdminActionStatus(Integer entityStageDetailId, Integer originatingId, Integer entityId, Integer adminActionTypeCode, Integer adminReviewStatusCode) {
        StringBuilder queryBuilder = new StringBuilder("UPDATE EntityStageDetails ed SET ed.adminActionCode = :adminActionTypeCode ");
        if (adminReviewStatusCode != null ) {
            queryBuilder.append(", ed.adminReviewStatusCode = :adminReviewStatusCode ");
        }
        queryBuilder.append(", ed.originatingId = :originatingId ");
        if (entityId != null) {
            queryBuilder.append(", ed.entityId = :entityId ");
        }
        queryBuilder.append("WHERE ed.entityStageDetailId = :entityStageDetailId ");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("adminActionTypeCode", adminActionTypeCode);
        if (adminReviewStatusCode != null ) {
            query.setParameter("adminReviewStatusCode", adminReviewStatusCode);
        }
        query.setParameter("originatingId", originatingId);
        if (entityId != null) {
            query.setParameter("entityId", entityId);
        }
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.executeUpdate();
    }


    @Override
    public EntityStageBatch getEntityCleanUpBatch(Integer batchId) {
        Query query = entityManager.createQuery("SELECT b FROM EntityStageBatch b WHERE b.batchId = :batchId");
        query.setParameter("batchId", batchId);
        return (EntityStageBatch) query.getResultList().get(0);
    }

    @Override
    public List<EntityStageAdminReviewStatusType> getAdminReviewStatusTypes() {
        Query query = entityManager.createQuery("SELECT b FROM EntityStageAdminReviewStatusType b");
        return query.getResultList();
    }

    @Override
    public List<EntityStageAdminActionType> getAdminActionTypes() {
        Query query = entityManager.createQuery("SELECT b FROM EntityStageAdminActionType b");
        return query.getResultList();
    }

    @Override
    public void updateEntityDetailsWithSysEntity(Integer entityId, Integer entityStageDetailId, Integer adminReviewStatusCode, Integer adminActionCode) {
        StringBuilder queryBuilder = new StringBuilder("UPDATE EntityStageDetails b set b.entityId = :entityId ");
        queryBuilder.append(", b.adminReviewStatusCode = :adminReviewStatusCode ");
        queryBuilder.append(", b.adminActionCode = :adminActionCode ");
        queryBuilder.append("WHERE b.entityStageDetailId = :entityStageDetailId");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("entityId", entityId);
        query.setParameter("adminReviewStatusCode", adminReviewStatusCode);
        query.setParameter("adminActionCode", adminActionCode);
        query.executeUpdate();
    }

    @Override
    public boolean isEntityAdminActionAlreadyDoneInGroup(Integer entityStageDetailId, Integer adminActionStatusCode) {
        StringBuilder queryBuilder = new StringBuilder("SELECT CASE WHEN COUNT(ed) > 0 THEN TRUE ELSE FALSE END FROM EntityStageDetails ed ");
        queryBuilder.append("LEFT JOIN EntityStageDetails ed1 ON ed1.entityStageDetailId = :entityStageDetailId  ");
        queryBuilder.append("WHERE ed.groupNumber = ed1.groupNumber AND ed.batchId = ed1.batchId " );
        queryBuilder.append("AND ed.adminActionCode = :adminActionCode");
        TypedQuery<Boolean> query = entityManager.createQuery(queryBuilder.toString(),  Boolean.class);
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("adminActionCode", adminActionStatusCode);
        return query.getSingleResult();
    }

    @Override
    public boolean isEntityAdminActionAlreadyDone(Integer entityStageDetailId, List<Integer> adminActionStatusCodes) {
        StringBuilder queryBuilder = new StringBuilder("SELECT CASE WHEN COUNT(ed) > 0 THEN TRUE ELSE FALSE END FROM EntityStageDetails ed ");
        queryBuilder.append("WHERE ed.entityStageDetailId = :entityStageDetailId " );
        queryBuilder.append("AND ed.adminActionCode IN :adminActionCodes");
        TypedQuery<Boolean> query = entityManager.createQuery(queryBuilder.toString(),  Boolean.class);
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("adminActionCodes", adminActionStatusCodes);
        return query.getSingleResult();
    }

    @Override
    public void bulkUpdateAdminReviewStatus(List<Integer> entityStageDetailIds, Integer adminReviewStatusCode) {
        Query query = entityManager.createQuery("UPDATE EntityStageDetails b set b.adminReviewStatusCode = :adminReviewStatusCode WHERE b.entityStageDetailId IN :entityStageDetailId");
        query.setParameter("adminReviewStatusCode", adminReviewStatusCode);
        query.setParameter("entityStageDetailId", entityStageDetailIds);
        query.executeUpdate();
    }

    @Override
    public void bulkUpdateAdminActionStatus(List<Integer> entityStageDetailIds, Integer adminActionTypeCode, Integer adminReviewStatusCode) {
        StringBuilder queryBuilder = new StringBuilder("UPDATE EntityStageDetails ed SET ed.adminActionCode = :adminActionTypeCode ");
        if (adminReviewStatusCode != null ) {
            queryBuilder.append(", ed.adminReviewStatusCode = :adminReviewStatusCode ");
        }
        queryBuilder.append("WHERE ed.entityStageDetailId IN :entityStageDetailIds ");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("adminActionTypeCode", adminActionTypeCode);
        if (adminReviewStatusCode != null ) {
            query.setParameter("adminReviewStatusCode", adminReviewStatusCode);
        }
        query.setParameter("entityStageDetailIds", entityStageDetailIds);
        query.executeUpdate();
    }

    @Override
    public void updateBatchCompletionStatus(Integer batchId) {
        if (isEntityAdminActionCompleted(batchId)) {
            Query query = entityManager.createQuery("UPDATE EntityStageBatch b set b.reviewStatusCode = :reviewStatusCode, b.completionDate = now() WHERE b.batchId = :batchId");
            query.setParameter("reviewStatusCode", Constants.BATCH_REVIEW_STATUS_COMPLETED);
            query.setParameter("batchId", batchId);
            query.executeUpdate();
        }
    }


    public boolean isEntityAdminActionCompleted(Integer batchId) {
        StringBuilder queryBuilder = new StringBuilder("SELECT CASE WHEN COUNT(ed) > 0 THEN FALSE ELSE TRUE END FROM EntityStageDetails ed ");
        queryBuilder.append("WHERE ed.batchId = :batchId " );
        queryBuilder.append("AND ed.adminReviewStatusCode != :adminReviewStatusCode");
        TypedQuery<Boolean> query = entityManager.createQuery(queryBuilder.toString(),  Boolean.class);
        query.setParameter("batchId", batchId);
        query.setParameter("adminReviewStatusCode", Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        return query.getSingleResult();
    }

    @Override
    public List<EntityStageDetails> getEntityDetailExternalReferences(Integer entityStageDetailId) {
        StringBuilder queryBuilder = new StringBuilder("SELECT ed FROM EntityStageDetails ed ");
        queryBuilder.append("WHERE ed.entityStageDetailId != :entityStageDetailId AND ed.originatingId = :entityStageDetailId " );
        queryBuilder.append("AND ed.adminReviewStatusCode = :adminReviewStatusCode");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("adminReviewStatusCode", Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        return query.getResultList();
    }

    @Override
    public void resetOriginEntityDetail(Integer entityStageDetailId, Integer originalEntityDetailId) {
        StringBuilder selctQueryBuilder = new StringBuilder();
        selctQueryBuilder.append("SELECT ed1.entityStageDetailId FROM EntityStageDetails ed ");
        selctQueryBuilder.append("LEFT JOIN EntityStageDetails ed1 ON ed1.entityStageDetailId = ed.originatingId ");
        selctQueryBuilder.append("LEFT JOIN EntityStageDetails ed2 ON ed2.originatingId = ed1.entityStageDetailId AND ed2.entityStageDetailId != :entityStageDetailId ");
        selctQueryBuilder.append("WHERE ed2 IS NULL AND ed.entityStageDetailId = :entityStageDetailId ");
        if (originalEntityDetailId != null) {
            selctQueryBuilder.append("AND ed.originatingId != :originalEntityDetailId");
        }
        TypedQuery<Integer> selectQuery = entityManager.createQuery(selctQueryBuilder.toString(), Integer.class);
        selectQuery.setParameter("entityStageDetailId", entityStageDetailId);
        if (originalEntityDetailId != null) {
            selectQuery.setParameter("originalEntityDetailId", originalEntityDetailId);
        }
        StringBuilder queryBuilder = new StringBuilder("UPDATE EntityStageDetails esd ");
        queryBuilder.append("SET esd.adminActionCode = null ");
        queryBuilder.append("WHERE esd.entityStageDetailId IN :entityStageDetailIds");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("entityStageDetailIds", selectQuery.getResultList());
        query.executeUpdate();
    }

    @Override
    public List<EntityStageDetails> getEntityDetailByOriginatingId(Integer entityStageDetailId) {
        Query query = entityManager.createQuery("SELECT ed FROM EntityStageDetails ed WHERE ed.originatingId = :entityStageDetailId");
        query.setParameter("entityStageDetailId", entityStageDetailId);
        return query.getResultList();
    }

    @Override
    public void updateGroupChildAdminAction(Integer entityStageDetailId, Integer oldAdminActionCode, Integer newAdminActionCode, boolean isChildAction) {
        StringBuilder queryBuilder = new StringBuilder("UPDATE EntityStageDetails ed ");
        queryBuilder.append("SET ed.adminActionCode = :newAdminActionCode WHERE ");
        if (isChildAction) {
            queryBuilder.append(" ed.entityStageDetailId != :entityStageDetailId AND ed.originatingId = :entityStageDetailId ");
        } else {
            queryBuilder.append(" ed.entityStageDetailId = :entityStageDetailId ");
        }
        queryBuilder.append("AND ed.adminReviewStatusCode = :adminReviewStatusCode AND ed.adminActionCode = :oldAdminActionCode ");
        Query query = entityManager.createQuery(queryBuilder.toString());
        query.setParameter("entityStageDetailId", entityStageDetailId);
        query.setParameter("adminReviewStatusCode", Constants.ADMIN_REVIEW_STATUS_COMPLETED);
        query.setParameter("newAdminActionCode", newAdminActionCode);
        query.setParameter("oldAdminActionCode", oldAdminActionCode);
        query.executeUpdate();
    }

    @Override
    public List<Integer> getEntityIdsByDunsNumber(List<String> dunsNumbers) {
        Query query = entityManager.createNativeQuery("SELECT ENTITY_ID FROM ENTITY WHERE DUNS_NUMBER IN :DUNS_NUMBERS AND VERSION_STATUS = :VERSION_STATUS");
        query.setParameter("DUNS_NUMBERS", dunsNumbers);
        query.setParameter("VERSION_STATUS", "ACTIVE");
        return query.getResultList();
    }

	@Override
	public Integer getAdminActionCode(Integer entityStageDetailId) {
		TypedQuery<Integer> query = entityManager.createQuery(
				"SELECT adminActionCode FROM EntityStageDetails ed WHERE ed.entityStageDetailId = :entityStageDetailId",
				Integer.class);
        query.setParameter("entityStageDetailId", entityStageDetailId);
		return query.getSingleResult();
	}

	@Override
	public Integer getAdminReviewCode(Integer entityStageDetailId) {
		TypedQuery<Integer> query = entityManager.createQuery(
				"SELECT adminReviewStatusCode FROM EntityStageDetails ed WHERE ed.entityStageDetailId = :entityStageDetailId",
				Integer.class);
		query.setParameter("entityStageDetailId", entityStageDetailId);
		return query.getSingleResult();
	}

    @Override
    public State findStateByStateCodeCountryCode(String countryCode, String stateCode) {
        try {
            TypedQuery<State> query = entityManager.createQuery(
                    "SELECT s FROM State s INNER JOIN Country c ON c.countryCode = s.countryCode " +
                            "WHERE (c.countryTwoCode = :countryCode OR s.countryCode = :countryCode ) AND s.stateCode like :stateCode  ",
                    State.class);
            query.setParameter("countryCode", countryCode);
            query.setParameter("stateCode", "%" + stateCode + "%");
            List<State> result = query.getResultList();
            return !result.isEmpty() ? result.get(0) : null;
        } catch (Exception e) {
            log.warn("State not fount for countryCode : {} & stateCode : {} | exception : {}", countryCode, stateCode, e.getMessage());
            return null;
        }
    }


    @Override
    public List<Integer> getEntityDetailIdByBatchId(Integer batchId) {
        Query query = entityManager.createQuery("SELECT ed.entityStageDetailId FROM EntityStageDetails ed WHERE ed.batchId = :batchId");
        query.setParameter("batchId", batchId);
        return query.getResultList();
    }

}
