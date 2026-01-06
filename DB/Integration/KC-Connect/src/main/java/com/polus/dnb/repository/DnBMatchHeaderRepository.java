package com.polus.dnb.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.polus.dnb.entity.DnBMatchHeader;

@Repository
public interface DnBMatchHeaderRepository
		extends JpaRepository<DnBMatchHeader, Integer>, JpaSpecificationExecutor<DnBMatchHeader> {
	
	 List<DnBMatchHeader> findByBatchId(Integer batchId);	

}
