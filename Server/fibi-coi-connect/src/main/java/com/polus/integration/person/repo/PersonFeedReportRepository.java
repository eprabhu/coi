package com.polus.integration.person.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.polus.integration.person.pojo.PersonFeedReport;

public interface PersonFeedReportRepository extends JpaRepository<PersonFeedReport, Integer> {

}
