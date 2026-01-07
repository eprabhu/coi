package com.polus.kcintegration.coiDeclarations.repositories;

import com.polus.kcintegration.coiDeclarations.pojos.FibiCoiDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface FibiCoiDeclarationRepository extends JpaRepository<FibiCoiDeclaration, String> {

}
