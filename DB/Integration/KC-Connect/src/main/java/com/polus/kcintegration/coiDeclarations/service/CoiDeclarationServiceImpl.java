package com.polus.kcintegration.coiDeclarations.service;

import com.polus.kcintegration.coiDeclarations.pojos.FibiCoiDeclaration;
import com.polus.kcintegration.coiDeclarations.repositories.FibiCoiDeclarationRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Log4j2
public class CoiDeclarationServiceImpl implements CoiDeclarationService {

    @Autowired
    private FibiCoiDeclarationRepository declarationRepository;

    @Override
    public void syncCoiDeclaration(FibiCoiDeclaration fibiCoiDeclaration) {
        log.info("syncCoiDeclaration started with DeclarationNumber: {}", fibiCoiDeclaration.getDeclarationNumber());
        if (declarationRepository.existsById(fibiCoiDeclaration.getDeclarationNumber())) {
            FibiCoiDeclaration declaration = declarationRepository.findById(fibiCoiDeclaration.getDeclarationNumber()).get();
            BeanUtils.copyProperties(fibiCoiDeclaration, declaration);
            declarationRepository.save(declaration);
            log.info("syncCoiDeclaration with DeclarationNumber: {}, updated on KC table", fibiCoiDeclaration.getDeclarationNumber());
        } else {
            declarationRepository.save(fibiCoiDeclaration);
            log.info("syncCoiDeclaration with DeclarationNumber: {}, inserted on KC table", fibiCoiDeclaration.getDeclarationNumber());
        }
        log.info("syncCoiDeclaration completed with DeclarationNumber: {}", fibiCoiDeclaration.getDeclarationNumber());
    }
}
