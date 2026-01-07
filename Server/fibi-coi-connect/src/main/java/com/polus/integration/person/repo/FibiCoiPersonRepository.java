package com.polus.integration.person.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.person.pojo.FibiCoiPerson;

public interface FibiCoiPersonRepository extends JpaRepository<FibiCoiPerson, String> {

	@Modifying
	@Transactional
	@Query(value = "TRUNCATE TABLE FIBI_COI_PERSON", nativeQuery = true)
	void truncateFibiCoiPerson();

	@Query("SELECT P.validationMessage FROM FibiCoiPerson P WHERE P.validationStatus = :validationStatus")
	List<String> findValidationMessagesByValidationStatus(@Param("validationStatus") String validationStatus);

}
