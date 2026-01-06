package com.polus.dnb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.dnb.entity.DnBMatchResult;

@Repository
public interface DnBMatchResultRepository extends JpaRepository<DnBMatchResult, Integer> {

	@Modifying
	@Transactional
	@Query(value = "INSERT INTO DNB_MATCH_RESULT (ID, SOURCE_DATA_CODE, DUNS_NUMBER, CONFIDENCE_CODE, ELEMENT_ORDER_NUMBER, DNB_DATA) "
			+ "VALUES (SEQ_DNB_MATCH_RESULT.NEXTVAL, :sourceDataCode, :dunsNumber, :confidenceCode, :elementOrderNumber, :dnbData)", nativeQuery = true)
	void insertDnbMatchResult(String sourceDataCode, String dunsNumber, Integer confidenceCode,
			Integer elementOrderNumber, String dnbData);
}