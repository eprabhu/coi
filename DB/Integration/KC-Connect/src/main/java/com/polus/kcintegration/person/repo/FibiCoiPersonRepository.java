package com.polus.kcintegration.person.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.polus.kcintegration.person.pojo.FibiCoiPerson;

import jakarta.transaction.Transactional;

public interface FibiCoiPersonRepository extends JpaRepository<FibiCoiPerson, String> {

	@Modifying
	@Transactional
    @Query("UPDATE FibiCoiPerson person SET person.syncStatus = :syncStatus WHERE person.personId IN :personIds")
    int updateFeedStatusByPersonIds(@Param("syncStatus") String syncStatus, @Param("personIds") List<String> personIds);

	@Query("SELECT o FROM FibiCoiPerson o")
	Page<FibiCoiPerson> feedFibiCoiPersonsByParams(Pageable pageable);

}
