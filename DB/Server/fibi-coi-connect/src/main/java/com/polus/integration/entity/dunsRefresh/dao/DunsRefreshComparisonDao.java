package com.polus.integration.entity.dunsRefresh.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Repository
@Transactional
public class DunsRefreshComparisonDao {

    @Autowired
    private EntityManager entityManager;

    public boolean hasDifference(String tableName, List<String> columns, int activeEntityId, int pendingEntityId) {
        String columnList = columns.stream().collect(Collectors.joining(", "));

        // Fetch all rows for active and pending
        String activeQuery = String.format("SELECT %s FROM %s WHERE ENTITY_ID = :entityId", columnList, tableName);
        String pendingQuery = String.format("SELECT %s FROM %s WHERE ENTITY_ID = :entityId", columnList, tableName);

        List<Object[]> activeRows = entityManager.createNativeQuery(activeQuery)
                .setParameter("entityId", activeEntityId)
                .getResultList();

        List<Object[]> pendingRows = entityManager.createNativeQuery(pendingQuery)
                .setParameter("entityId", pendingEntityId)
                .getResultList();

        // Normalize each row: convert to string row values (null-safe), sort, and compare sets
        Set<String> activeRowSet = activeRows.stream()
                .map(row -> Arrays.stream(row)
                        .map(val -> val == null ? "NULL" : val.toString())
                        .collect(Collectors.joining("|"))
                )
                .collect(Collectors.toCollection(TreeSet::new));

        Set<String> pendingRowSet = pendingRows.stream()
                .map(row -> Arrays.stream(row)
                        .map(val -> val == null ? "NULL" : val.toString())
                        .collect(Collectors.joining("|"))
                )
                .collect(Collectors.toCollection(TreeSet::new));

        return !activeRowSet.equals(pendingRowSet);
    }

    public Map<String, List<String>> fetchDunsMandatoryFields() {
        List<String> fields = entityManager.createNativeQuery(
                "SELECT FIELD_NAME FROM ENTITY_DUNS_REFRESH_FIELD_CONFIG WHERE IS_MANDATORY = 'Y'"
        ).getResultList();
        return  fields.stream()
                .map(field -> field.split("\\."))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.groupingBy(
                        parts -> parts[0],                                 // key: table name
                        Collectors.mapping(parts -> parts[1], Collectors.toList())  // value: column names
                ));
    }
}
