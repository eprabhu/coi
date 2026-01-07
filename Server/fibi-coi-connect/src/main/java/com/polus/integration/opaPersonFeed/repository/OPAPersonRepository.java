package com.polus.integration.opaPersonFeed.repository;

import com.polus.integration.opaPersonFeed.pojo.OPAPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OPAPersonRepository extends JpaRepository<OPAPerson, Integer> {

    OPAPerson findByPersonId(String personId);
}
