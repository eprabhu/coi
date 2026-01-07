package com.polus.integration.coideclarations.services;

import com.polus.integration.coideclarations.dao.CoiDeclarationDao;
import com.polus.integration.coideclarations.dtos.CoiDeclarationDto;
import com.polus.integration.feedentity.client.KCFeignClient;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Log4j2
public class CoiDeclarationIntegrServiceImpl implements CoiDeclarationIntegrService {

    @Autowired
    private CoiDeclarationDao coiDeclarationDao;

    @Autowired
    private KCFeignClient kcFeignClient;

    @Override
    public void syncCoiDeclaration(Integer moduleItemKey) {
        log.info("Syncing Coi Declaration with KC started | declarationId : {}", moduleItemKey);
        CoiDeclarationDto declaration = coiDeclarationDao.getCoiDeclarationDetails(moduleItemKey);
        kcFeignClient.syncCoiDeclaration(declaration);
        log.info("Syncing Coi Declaration with KC completed| declarationId : {}", moduleItemKey);
    }
}
