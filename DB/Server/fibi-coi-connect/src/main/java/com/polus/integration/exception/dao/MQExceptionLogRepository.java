package com.polus.integration.exception.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.exception.pojo.MQExceptionsLog;


@Repository
public interface MQExceptionLogRepository extends JpaRepository<MQExceptionsLog, Integer> {

}
