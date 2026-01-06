package com.polus.integration.coideclarations.dao;

import com.polus.integration.coideclarations.dtos.CoiDeclarationDto;

public interface CoiDeclarationDao {

    /**
     * Get Coi Declaration Details
     * @param declarationId
     * @return
     */
    CoiDeclarationDto getCoiDeclarationDetails(Integer declarationId);
}
