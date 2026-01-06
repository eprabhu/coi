package com.polus.kcintegration.opaPerson.dao;

import com.polus.kcintegration.opaPerson.dto.OPAPersonDto;
import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedRequest;
import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

@Transactional
@Service
@Log4j2
public class OpaPersonDao {

    @Autowired
    private EntityManager entityManager;


    public OpaPersonFeedResponse fetchOpaPersonFeedDetails(OpaPersonFeedRequest feedRequest) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("FIBI_COI_GET_OPA_PERSONS")
                .registerStoredProcedureParameter(1, Timestamp.class, ParameterMode.IN)
                .registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN)
                .registerStoredProcedureParameter(4, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(5, String.class, ParameterMode.IN)
                .registerStoredProcedureParameter(6, Class.class, ParameterMode.REF_CURSOR)
                .registerStoredProcedureParameter(7, Integer.class, ParameterMode.OUT);
        String personIdList = (feedRequest.getPersonIds() != null && !feedRequest.getPersonIds().isEmpty())
                ? String.join(",", feedRequest.getPersonIds()) : null;

        query.setParameter(1, feedRequest.getLastUpdatedTimestamp());
        query.setParameter(2, feedRequest.getPageNumber());
        query.setParameter(3, feedRequest.getLimit());
        query.setParameter(4, feedRequest.getTotalCount() == null ? "Y" : "N");
        query.setParameter(5, personIdList);
        query.execute();
        List<Object[]> results = query.getResultList();
        List<OPAPersonDto> opaPersons = results.stream().map(row -> {
            OPAPersonDto dto = new OPAPersonDto();
            dto.setPersonId((String) row[0]);
            dto.setFormOfAddressShort((String) row[2]);
            dto.setKrbNameUppercase((String) row[6]);
            dto.setEmailAddress((String) row[7]);
            dto.setJobId((String) row[8]);
            dto.setJobTitle((String) row[9]);
            dto.setAdminEmployeeType((String) row[10]);
            dto.setHrDepartmentCodeOld((String) row[11]);
            dto.setHrDepartmentName((String) row[12]);
            dto.setHrOrgUnitId((String) row[13]);
            dto.setAdminOrgUnitTitle((String) row[14]);
            dto.setAdminPositionTitle((String) row[15]);
            dto.setPayrollRank((String) row[16]);
            dto.setIsFaculty( row[17] != null ? row[17].toString() : null);
            dto.setEmploymentPercent(row[18] != null ? new BigDecimal(row[18].toString()) : null);
            dto.setIsConsultPriv(row[19] != null ? row[19].toString() : null);
            dto.setIsPaidAppt(row[20] != null ?  row[20].toString() : null);
            dto.setIsSummerSessionAppt(row[21] != null ? row[21].toString() : null);
            dto.setSummerSessionMonths(row[22] != null ? ((Number) row[22]).intValue() : null);
            dto.setIsSabbatical(row[23] != null ? row[23].toString() : null);
            dto.setSabbaticalBeginDate(row[24] != null ? (Date) row[24] : null);
            dto.setSabbaticalEndDate(row[25] != null ? (Date) row[25] : null);
            dto.setWarehouseLoadDate(row[26] != null ? (Date) row[26] : null);
            dto.setPersonnelSubareaCode(row[27] != null ? (String) row[27] : null);
            dto.setPersonnelSubarea(row[28] != null ? (String) row[28] : null);
            dto.setIsDisclosureRequired(row[29] != null ? row[29].toString() : "N");
            return dto;
        }).toList();
        Integer count = feedRequest.getTotalCount() == null ? (Integer) query.getOutputParameterValue(7) : null;
        OpaPersonFeedResponse feedResponse = OpaPersonFeedResponse.builder()
                .data(opaPersons)
                .totalCount(count != null ? count : feedRequest.getTotalCount())
                .build();
        return feedResponse;
    }

    public void syncOpaPersonFeedData() {
        entityManager.createNativeQuery("BEGIN FIBI_COI_SYNC_OPA_PERSON_DATA; END;").executeUpdate();
    }
}
