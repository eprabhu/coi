package com.polus.integration.entity.cleansematch.entity;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.polus.integration.entity.cleansematch.dto.DnBStageEntityMatchDTO;

@Repository
public interface DnBEntityMatchRepository extends JpaRepository<EntityStageDetails, Integer>, JpaSpecificationExecutor<EntityStageDetails> {
    List<EntityStageDetails> findByBatchId(Integer batchId);
}
