package com.polus.fibicomp.coi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.coi.pojo.DisclosureActionType;

@Repository
public interface DisclosureActionTypeRepository extends JpaRepository<DisclosureActionType, String> {

}
