package com.polus.integration.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.pojo.FibiCOIConnectDummy;

@Repository
public interface ProposalResponseRepository extends JpaRepository<FibiCOIConnectDummy, Integer> {


}
