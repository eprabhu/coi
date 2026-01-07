package com.polus.fibicomp.coi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.pojo.DisclosureActionType;

@Repository
@Transactional
public interface TravelDisclosureActionTypeRepository extends JpaRepository<DisclosureActionType, String> {

}
