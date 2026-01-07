package com.polus.integration.opaPersonFeed.repository;

import com.polus.integration.opaPersonFeed.pojo.OpaPersonFeedLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpaPersonFeedLogRepository extends JpaRepository<OpaPersonFeedLog, Integer> {
}
