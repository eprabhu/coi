package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.polus.fibicomp.cmp.pojo.CoiCmpTypeProjectTypeRel;

public interface CmpTypeProjectTypeRelRepository extends JpaRepository<CoiCmpTypeProjectTypeRel, String> {

	@Query("SELECT r FROM CoiCmpTypeProjectTypeRel r")
	List<CoiCmpTypeProjectTypeRel> findAllRelations();

}
