package com.polus.integration.coideclarations.dao;

import com.polus.integration.coideclarations.dtos.CoiDeclarationDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;

@Repository
@Transactional
@Log4j2
public class CoiDeclarationDaoImpl implements CoiDeclarationDao {

    @Autowired
    private EntityManager entityManager;

    @Override
    public CoiDeclarationDto getCoiDeclarationDetails(Integer declarationId) {
        Query query = entityManager.createNativeQuery("CALL GET_COI_DECLARATION_DETAIL_INTEG(:DECLARATION_ID)");
        query.setParameter("DECLARATION_ID", declarationId);
        Object[] row = (Object[]) query.getSingleResult();
        CoiDeclarationDto dto = new CoiDeclarationDto();
        dto.setDeclarationId(((Integer) row[0]).intValue());
        dto.setDeclarationNumber((String) row[1]);
        dto.setPersonId((String) row[2]);
        dto.setDeclarationTypeCode((String) row[3]);
        dto.setDeclarationType((String) row[4]);
        dto.setDeclarationStatusCode((String) row[5]);
        dto.setDeclarationStatus((String) row[6]);
        dto.setSubmissionDate(row[7] != null ? (Timestamp) row[7] : null);
        dto.setExpirationDate(row[8] != null ?  (Timestamp) row[8] : null);
        dto.setVersionNumber((Integer) row[9]);
        dto.setVersionStatus((String) row[10]);
        dto.setCreatedBy((String) row[11]);
        dto.setCreateTimestamp((Timestamp) row[12]);
        dto.setUpdatedBy((String) row[13]);
        dto.setUpdateTimestamp((Timestamp) row[14]);
        dto.setDeclarationQuesAnswer((String) row[15]);
        dto.setReviewStatusCode(row[16] != null ? (String) row[16] : null);
        dto.setReviewStatus(row[17] != null ? (String) row[17] : null);
        return dto;
    }
}
