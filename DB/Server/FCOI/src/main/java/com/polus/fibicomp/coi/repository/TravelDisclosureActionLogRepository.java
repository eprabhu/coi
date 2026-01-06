package com.polus.fibicomp.coi.repository;

import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.pojo.TravelDisclosureActionLog;

@Repository
@Transactional
public interface TravelDisclosureActionLogRepository extends JpaRepository<TravelDisclosureActionLog, Integer>, ActionLogDao {

}
