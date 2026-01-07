package com.polus.dnb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.dnb.entity.DnBIndustryCatInfo;

@Repository
public interface DnBIndustryCatInfoRepository extends JpaRepository<DnBIndustryCatInfo, Integer> {

	@Modifying
	@Transactional
	@Query(value = "INSERT INTO DNB_INDUSTRY_CAT_INFO (ID, DUNS_NUMBER, INDUSTRY_TYPE, TYPE_DESCRIPTION, INDUSTRY_CODE, CODE_DESCRIPTION) "
			+ "VALUES (SEQ_DNB_INDUSTRY_CAT_INFO.NEXTVAL, :dunsNumber, :industryType, :typeDescription, :industryCode, :codeDescription)", nativeQuery = true)
	void insertDnbIndustryCatInfo(String dunsNumber, String industryType, String typeDescription, String industryCode,
			String codeDescription);
}