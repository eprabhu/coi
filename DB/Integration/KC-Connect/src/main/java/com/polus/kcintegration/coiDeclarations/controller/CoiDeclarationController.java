package com.polus.kcintegration.coiDeclarations.controller;

import com.polus.kcintegration.coiDeclarations.pojos.FibiCoiDeclaration;
import com.polus.kcintegration.coiDeclarations.service.CoiDeclarationService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/coiDeclaration/integration")
@Log4j2
public class CoiDeclarationController {

    @Autowired
    private CoiDeclarationService coiDeclarationService;

    @PostMapping("/sync")
    public void syncCoiDeclaration(@RequestBody FibiCoiDeclaration fibiCoiDeclaration) {
        log.info("Request for /coiDeclaration/Integration/sync with details {}", fibiCoiDeclaration.toString());
        coiDeclarationService.syncCoiDeclaration(fibiCoiDeclaration);
        log.info("Request for /coiDeclaration/Integration/sync completed");
    }
}
