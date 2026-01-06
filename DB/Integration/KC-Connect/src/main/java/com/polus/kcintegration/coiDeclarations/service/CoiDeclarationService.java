package com.polus.kcintegration.coiDeclarations.service;

import com.polus.kcintegration.coiDeclarations.pojos.FibiCoiDeclaration;

public interface CoiDeclarationService {

    /**
     * Sync COI Declaration with KC table
     * @param fibiCoiDeclaration
     */
    void syncCoiDeclaration(FibiCoiDeclaration fibiCoiDeclaration);
}
