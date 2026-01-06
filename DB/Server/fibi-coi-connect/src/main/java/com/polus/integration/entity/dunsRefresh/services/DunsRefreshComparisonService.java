package com.polus.integration.entity.dunsRefresh.services;

import com.polus.integration.entity.dunsRefresh.dao.DunsRefreshComparisonDao;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Log4j2
public class DunsRefreshComparisonService {

    @Autowired
    private DunsRefreshComparisonDao comparisonDao;

    public boolean hasDifferenceBetweenVersions(int activeEntityId, int pendingEntityId) {
        Map<String, List<String>> tableColumnsMap = comparisonDao.fetchDunsMandatoryFields();

        List<CompletableFuture<Boolean>> futures = tableColumnsMap.entrySet().stream()
                .map(entry -> CompletableFuture.supplyAsync(() -> {
                    String tableName = entry.getKey();
                    List<String> columns = entry.getValue();
                    return comparisonDao.hasDifference(tableName, columns, activeEntityId, pendingEntityId);
                }))
                .collect(Collectors.toList());

        return futures.stream()
                .map(CompletableFuture::join)
                .anyMatch(Boolean::booleanValue); // if any true, return true
    }
}
