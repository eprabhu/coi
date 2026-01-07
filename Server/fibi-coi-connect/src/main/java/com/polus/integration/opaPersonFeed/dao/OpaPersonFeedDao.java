package com.polus.integration.opaPersonFeed.dao;

import com.polus.integration.opaPersonFeed.pojo.OpaPersonFeedLog;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.Query;
import jakarta.persistence.StoredProcedureQuery;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@Service
@Log4j2
@AllArgsConstructor
public class OpaPersonFeedDao {

    private final EntityManager entityManager;

    public OpaPersonFeedLog getLastUpdatedOpaPersonFeedLog() {
        Query query = entityManager.createQuery("SELECT o FROM OpaPersonFeedLog o ORDER BY o.feedStartedAt DESC");
        List resultList = query.getResultList();
        return resultList != null && !resultList.isEmpty() ? (OpaPersonFeedLog) resultList.get(0) : null;
    }

    public void checkAndUpdateOpaPersonEligibility(String personId) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("UPDT_OPA_ELIGIBILITY_FROM_FEED")
                .registerStoredProcedureParameter(0, Integer.class, ParameterMode.IN)
                .setParameter(0, personId);
        query.execute();
    }
}
