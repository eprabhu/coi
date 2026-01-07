package com.polus.integration.opaPersonFeed.repository;

import com.polus.integration.opaPersonFeed.pojo.OpaPersonFeedLogDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpaPersonFeedLogDetailsRepository extends JpaRepository<OpaPersonFeedLogDetails, Integer> {

    @Query("SELECT distinct l.personId FROM OpaPersonFeedLogDetails l")
    List<String> findAllPersonId();
}
