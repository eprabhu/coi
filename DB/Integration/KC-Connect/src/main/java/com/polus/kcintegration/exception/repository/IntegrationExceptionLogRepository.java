package com.polus.kcintegration.exception.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.kcintegration.exception.pojo.IntegrationExceptionLog;

@Repository
public interface IntegrationExceptionLogRepository extends JpaRepository<IntegrationExceptionLog, Long> {

}
