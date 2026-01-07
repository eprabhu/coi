package com.polus.fibicomp.cmp.task.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskType;

import feign.Param;

@Repository
public interface CmpTaskTypeRepository extends JpaRepository<CmpTaskType, String> {

	@Query("SELECT t FROM CmpTaskType t WHERE t.taskTypeCode = :code")
	CmpTaskType findByTaskTypeCode(@Param("code") String code);

}
