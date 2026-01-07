package com.polus.integration.dnb.referencedata.repository;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.dnb.referencedata.entity.IndustryCategoryCode;

@Repository
public interface IndustryCateCodeRepository extends JpaRepository<IndustryCategoryCode, Integer> {
	
    @Transactional
    @Modifying
    @Query("DELETE FROM IndustryCategoryCode i WHERE i.industryCategoryTypeCode = :typeCode")
    void deleteByIndustryCategoryTypeCode(String typeCode);
    
    @Query("SELECT i.industryCategoryId FROM IndustryCategoryCode i WHERE i.industryCategoryTypeCode = :typeCode and i.industryCategoryCode = :code "  )
    Integer getId(String typeCode, String code);
    
    @Query("SELECT i.industryCategoryCode FROM IndustryCategoryCode i WHERE i.industryCategoryTypeCode = :typeCode")
    Set<String> findExistingCodes(String typeCode);
    
    
}
