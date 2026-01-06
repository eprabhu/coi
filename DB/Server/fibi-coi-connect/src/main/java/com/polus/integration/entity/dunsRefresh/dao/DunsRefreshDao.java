package com.polus.integration.entity.dunsRefresh.dao;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.cleansematch.dao.EntityCleanUpDao;
import com.polus.integration.entity.dunsRefresh.constants.DunsRefreshConstants;
import com.polus.integration.entity.dunsRefresh.dto.EntityRefreshDto;
import com.polus.integration.entity.dunsRefresh.pojos.EntityDunsRefreshDetails;
import com.polus.integration.entity.dunsRefresh.pojos.ParameterBo;
import com.polus.integration.entity.enrich.dao.EntityEnrichDAO;
import com.polus.integration.pojo.State;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@Transactional
@Log4j2
public class DunsRefreshDao {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    EntityEnrichDAO entityEnrichDAO;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityCleanUpDao entityCleanUpDao;

    public void saveOrUpdate(Object entity) {
        entityManager.merge(entity);
    }

    public EntityRefreshDto getEntityVersionByDunsNumber(String dunsNumber, String versionStatus) {
        StringBuilder queryBuilder = new StringBuilder("SELECT e.ENTITY_ID, e.ENTITY_NUMBER, e.PRIMARY_NAME ")
                .append("FROM entity e WHERE e.DUNS_NUMBER = :dunsNumber AND e.VERSION_STATUS = :versionStatus");
        Query query = entityManager.createNativeQuery(queryBuilder.toString());
        query.setParameter("dunsNumber", dunsNumber);
        query.setParameter("versionStatus", versionStatus);
        List<Object[]> result = query.getResultList();
        if (result != null && !result.isEmpty()) {
            return EntityRefreshDto.builder().entityId((Integer) result.get(0)[0])
                    .entityNumber((Integer) result.get(0)[1])
                    .entityName((String) result.get(0)[2]).build();
        }
        return null;
    }

    public ParameterBo getParameterBO(String parameterName) {
        StringBuilder queryBuilder = new StringBuilder("SELECT p from ParameterBo p ")
                .append("WHERE p.parameterName = :parameterName");
        TypedQuery<ParameterBo> query = entityManager.createQuery(queryBuilder.toString(), ParameterBo.class);
        query.setParameter("parameterName", parameterName);
        return query.getSingleResult();
    }

    public boolean isFileAlreadyExists(String fileName) {
        String hql = "SELECT COUNT(e) FROM EntityDunsRefreshDetails e WHERE e.monitoringSeedFileName = :fileName";
        Long count = entityManager.createQuery(hql, Long.class)
                .setParameter("fileName", fileName)
                .getSingleResult();
        return count > 0;
    }

    public List<EntityDunsRefreshDetails> getByRefreshTypeAndStatusCodes() {
        String hql = "FROM EntityDunsRefreshDetails e WHERE e.refreshTypeCode = :refreshTypeCode AND e.refreshStatusTypeCode IN (:statusCodes)";
        return entityManager.createQuery(hql, EntityDunsRefreshDetails.class)
                .setParameter("refreshTypeCode", DunsRefreshConstants.REFRESH_TYPE_CODE_UPDATE)
                .setParameter("statusCodes", List.of(DunsRefreshConstants.REFRESH_STATUS_PENDING, DunsRefreshConstants.REFRESH_STATUS_ERROR))
                .getResultList();
    }


    public void refreshEntityHeaderInfo(Integer entityId, String actionPersonId, DnBOrganizationDetails res) {
        try {
            String sql = "{call DUNS_REFRESH_ENTITY_HEADER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";
            jdbcTemplate.update(sql,
                    entityId,
                    res.getPrimaryName(),
                    null, //  it will be removed res.getMultilingualPrimaryName(),
                    res.getPriorName(),
                    res.getTradeStyleNames(),
                    res.getDuns(),
                    res.getUei(),
                    res.getCageNumber(),
                    res.getFederalEmployerId(),
                    res.getOwnershipType(),
                    getOperatingStatusType(res.getDunsControlStatus()),
                    getBusinessEntityType(res.getBusinessEntityType()),
                    res.getWebsiteAddress(),
                    res.getStartDate(),
                    res.getIncorporatedDate(),
                    convertToInteger(res.getNumberOfEmployees()),
                    res.getCertifiedEmail(),
                    res.getSummary(),
                    res.getDefaultCurrency(),
                    getPrimaryTelephone(res.getTelephone()),
                    getLine1(res.getPrimaryAddress()),
                    getLine2(res.getPrimaryAddress()),
                    getCity(res.getPrimaryAddress()),
                    getState(res.getPrimaryAddress()),
                    getPostCode(res.getPrimaryAddress()),
                    getCountry(res.getPrimaryAddress()),
                    res.getHumanSubAssurance(),
                    res.getAnimalWelfareAssurance(),
                    res.getAnimalAccreditaion(),
                    actionPersonId
            );
        } catch (Exception e) {
            log.error("Exception on refreshEntityHeaderInfo {}", e.getMessage());
            throw e;
        }
    }

    public Integer convertToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
            }
        }
        return null;
    }


    private String getLine1(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getStreetAddress() != null) {
            return address.getStreetAddress().getLine1();
        }
        return null;
    }

    private String getLine2(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getStreetAddress() != null) {
            return address.getStreetAddress().getLine2();
        }
        return null;
    }

    private String getCity(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getAddressLocality() != null) {
            return address.getAddressLocality().getName();
        }
        return null;
    }

    private String getState(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getAddressRegion() != null) {
            State state = entityCleanUpDao.findStateByStateCodeCountryCode(getCountry(address), address.getAddressRegion().getAbbreviatedName());
            return state != null ? state.getStateCode() :
                    (address.getAddressRegion().getAbbreviatedName() != null ? address.getAddressRegion().getAbbreviatedName() :
                            address.getAddressRegion().getName());
        }
        return null;
    }


    private String getCountry(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getAddressCountry() != null) {
            return address.getAddressCountry().getIsoAlpha2Code();
        }
        return null;
    }

    private String getPostCode(DnBOrganizationDetails.DetailedAddress address) {
        if (address != null && address.getPostalCode() != null) {
            return address.getPostalCode();
        }
        return null;
    }

    private String getPrimaryTelephone(List<DnBOrganizationDetails.Telephone> telephone) {
        if (telephone == null) {
            return null;
        }

        if (telephone != null && telephone.isEmpty()) {
            return null;
        }

        if (telephone != null && telephone.get(0) != null) {
            return telephone.get(0).getTelephoneNumber();
        }
        return null;
    }

    private Integer getOperatingStatusType(DnBOrganizationDetails.DunsControlStatus dunsControlStatus) {
        if (dunsControlStatus != null && dunsControlStatus.getOperatingStatus() != null) {
            return dunsControlStatus.getOperatingStatus().getDnbCode();
        }
        return null;
    }

    private Integer getBusinessEntityType(DnBOrganizationDetails.BusinessEntityType businessEntityType) {
        if (businessEntityType != null) {

            if (businessEntityType.getDnbCode() == 0) {
                return null;
            }

            return businessEntityType.getDnbCode();
        }
        return null;
    }

    public void refreshEntityIndustryCode(Integer entityId, String actionPersonId, List<DnBOrganizationDetails.IndustryCode> industryCodes) throws JsonProcessingException {
        try {
            if (industryCodes == null) {
                return;
            } else if (industryCodes.isEmpty()) {
                Query query = entityManager.createNativeQuery("DELETE FROM ENTITY_INDUSTRY_CLASSIFICATION WHERE ENTITY_ID = :entityId");
                query.setParameter("entityId", entityId);
                query.executeUpdate();
                return;
            }

            ObjectMapper objectMapper = new ObjectMapper();
            String industryCodesJsonData = objectMapper.writeValueAsString(industryCodes);
            String sql = "{call ENRICH_ENTITY_INDUSTRY_CATE_JSON(?, ?, ?)}";
            jdbcTemplate.update(sql, entityId, actionPersonId, industryCodesJsonData);

        } catch (Exception e) {
            log.error("Exception on refreshEntityIndustryCode {}", e.getMessage());
            throw e;
        }
    }

    public void refreshEntityRegistration(Integer entityId, String actionPersonId, List<DnBOrganizationDetails.RegistrationNumber> registrations) {
        try {
            if (registrations == null) {
                return;
            } else if (registrations.isEmpty()) {
                Query query = entityManager.createNativeQuery("DELETE FROM ENTITY_REGISTRATION WHERE ENTITY_ID = :entityId");
                query.setParameter("entityId", entityId);
                query.executeUpdate();
                return;
            }
            String sql = "{call ENRICH_ENTITY_REGISTRATION(?,?,?,?,?)}";
            List<Integer> registrationTypes = new ArrayList<>();
            for (DnBOrganizationDetails.RegistrationNumber input : registrations) {
                jdbcTemplate.update(sql,
                        entityId,
                        input.getRegistrationNumber(),
                        input.getTypeDescription(),
                        input.getTypeDnBCode(),
                        actionPersonId);
                registrationTypes.add(input.getTypeDnBCode());
            }
            Query query = entityManager.createNativeQuery("DELETE FROM ENTITY_REGISTRATION WHERE ENTITY_ID = :entityId AND REG_TYPE_CODE NOT IN :registrationTypes");
            query.setParameter("entityId", entityId);
            query.setParameter("registrationTypes", registrationTypes);
            query.executeUpdate();
        } catch (Exception e) {
            log.error("Exception on refreshEntityRegistration {}", e.getMessage());
            throw e;
        }

    }

    public void refreshEntityTelephone(Integer entityId, String actionPersonId, List<DnBOrganizationDetails.Telephone> telephone) {
        try {
            if (telephone == null) {
                return;
            } else if (telephone.isEmpty()) {
                Query query = entityManager.createNativeQuery("DELETE FROM ENTITY_TELEPHONE WHERE ENTITY_ID = :entityId ");
                query.setParameter("entityId", entityId);
                query.executeUpdate();
                return;
            }
            String sql = "{call ENRICH_ENTITY_TELEPHONE(?,?,?,?)}";
            for (DnBOrganizationDetails.Telephone input : telephone) {
                jdbcTemplate.update(sql,
                        entityId,
                        input.getTelephoneNumber(),
                        input.getIsdCode(),
                        actionPersonId);
            }
            deleteNonExistingTelephones(entityId, telephone);
        } catch (Exception e) {
            log.error("Exception on refreshEntityTelephone {}", e.getMessage());
            throw e;
        }

    }

    private void deleteNonExistingTelephones(Integer entityId, List<DnBOrganizationDetails.Telephone> telephone) {
        // Create (?, ?) placeholders for each phone entry
        String placeholders = telephone.stream()
                .map(t -> "(?, ?)")
                .collect(Collectors.joining(", "));

        StringBuilder queryBuilder = new StringBuilder("DELETE FROM ENTITY_TELEPHONE ")
                .append("WHERE ENTITY_ID = ? ")
                .append("AND (TELEPHONE_NUMBER, INT_DIALING_CODE) IN (" + placeholders + ")");

        Query query = entityManager.createNativeQuery(queryBuilder.toString());

        int paramIndex = 1;

        // Set ENTITY_ID as the first parameter
        query.setParameter(paramIndex++, entityId);

        // Set each TELEPHONE_NUMBER and ISD_CODE (INT_DIALING_CODE)
        for (DnBOrganizationDetails.Telephone tel : telephone) {
            query.setParameter(paramIndex++, tel.getTelephoneNumber());
            query.setParameter(paramIndex++, tel.getIsdCode());
        }
        query.executeUpdate();
    }

    public void refreshForeignName(Integer entityId, String actionPersonId,
                                   List<DnBOrganizationDetails.MultilingualPrimaryName> multilingualPrimaryName) {
        try {
            if (multilingualPrimaryName == null) {
                return;
            } else if (multilingualPrimaryName.isEmpty()) {
                Query query = entityManager.createNativeQuery("DELETE FROM entity_foreign_name WHERE ENTITY_ID = :entityId ");
                query.setParameter("entityId", entityId);
                query.executeUpdate();
                return;
            }
            List<String> foreignNames = new ArrayList<>();
            String sql = "{call ENRICH_FOREIGN_NAME(?,?,?)}";
            for (DnBOrganizationDetails.MultilingualPrimaryName input : multilingualPrimaryName) {
                if (input.getLanguage() != null && input.getLanguage().getDnbCode() == DunsRefreshConstants.LANGUAGE_DNBCODE_ENGLISH) { //English name not need to add
                    continue;
                }
                jdbcTemplate.update(sql, entityId, input.getName(), actionPersonId);
                foreignNames.add(input.getName());
            }
            Query query = entityManager.createNativeQuery("DELETE FROM entity_foreign_name WHERE ENTITY_ID = :entityId AND FOREIGN_NAME NOT IN :foreignNames");
            query.setParameter("entityId", entityId);
            query.setParameter("foreignNames", foreignNames);
            query.executeUpdate();
        } catch (Exception e) {
            log.error("Exception on refreshForeignName   {}", e.getMessage());
            throw e;
        }
    }

    public void refreshEntityMailingAddress(Integer entityId, String actionPersonId, DnBOrganizationDetails.DetailedAddress mailingAddress) {
        try {
            if (mailingAddress == null) {
                return;
            }
            String sql = "{call ENRICH_ENTITY_MAILING_ADDRESS(?,?,?,?,?,?,?,?)}";
            jdbcTemplate.update(sql,
                    entityId,
                    getCountry(mailingAddress),
                    getCity(mailingAddress),
                    getState(mailingAddress),
                    getPostCode(mailingAddress),
                    getLine1(mailingAddress),
                    getLine2(mailingAddress),
                    actionPersonId
            );
        } catch (Exception e) {
            log.error("Exception on refreshEntityMailingAddress : {}", e.getMessage());
            throw e;
        }

    }

    public String getEntityNameByEntityId(Integer entityId) {
        StringBuilder queryBuilder = new StringBuilder("SELECT e.PRIMARY_NAME ")
                .append("FROM entity e WHERE e.ENTITY_ID = :entityId");
        Query query = entityManager.createNativeQuery(queryBuilder.toString());
        query.setParameter("entityId", entityId);
        List<String> result = query.getResultList();
        if (result != null && !result.isEmpty()) {
            return result.get(0);
        }
        return null;
    }

    public List<String> getEntityAdmins() {
        StringBuilder queryBuilder = new StringBuilder("SELECT DISTINCT t1.PERSON_ID FROM PERSON_ROLES t1 ")
                .append("INNER JOIN (SELECT ROLE_ID,RT.RIGHT_NAME FROM ROLE_RIGHTS RR, RIGHTS RT ")
                .append("WHERE RR.RIGHT_ID = RT.RIGHT_ID AND RT.RIGHT_NAME IN ")
                .append("('MANAGE_ENTITY','MANAGE_ENTITY_COMPLIANCE', 'MANAGE_ENTITY_COMPLIANCE_NOTES' ")
                .append("'MANAGE_ENTITY_ORGANIZATION', 'MANAGE_ENTITY_ORGANIZATION_NOTES', 'MANAGE_ENTITY_OVERVIEW_NOTES', 'MANAGE_ENTITY_SPONSOR' ")
                .append("'MANAGE_ENTITY_SPONSOR_NOTES')) t2 ON t2.ROLE_ID = t1.ROLE_ID");
        return entityManager.createNativeQuery(queryBuilder.toString()).getResultList();
    }
}
