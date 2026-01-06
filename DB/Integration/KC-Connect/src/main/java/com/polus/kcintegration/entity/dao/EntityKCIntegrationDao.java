package com.polus.kcintegration.entity.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

import com.polus.kcintegration.entity.dto.SponsorDetailsDTO;
import com.polus.kcintegration.entity.dto.SubAwdOrgDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.entity.dto.EntityDTO;
import com.polus.kcintegration.entity.dto.EntityResponse;
import com.polus.kcintegration.exception.custom.IntegrationCustomException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Transactional
@Service
public class EntityKCIntegrationDao {

    @Autowired
    private EntityManager entityManager;

    public EntityResponse feedEntityDetailsToOrganization(EntityDTO entityDTO) {
        EntityResponse entityResponse = null;
        ResultSet rset = null;
        StoredProcedureQuery storedProcedure = null;

        try {
            String procedureName = "FIBI_COI_FEED_ENTITY_ORG";
            storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
            registerStoredProcedureParameters(storedProcedure);
            setStoredProcedureParameters(storedProcedure, entityDTO);
            boolean executeResult = storedProcedure.execute();
            if (executeResult) {
                ResultSet resultSet = (ResultSet) storedProcedure.getOutputParameterValue(44);
                if (resultSet != null) {
                    while (resultSet.next()) {
                        entityResponse = EntityResponse.builder().entityId(entityDTO.getEntityId())
                                .organizationFeedError(resultSet.getString("ORG_ERROR"))
                                .organizationId(resultSet.getString("ORGANIZATION_ID")).build();
                    }
                }
            }

            log.info("Stored procedure {} executed successfully for entityId: {}", procedureName, entityDTO.getEntityId());

        } catch (SQLException e) {
            log.error("SQLException in feedEntityDetailsToSponsorAndOrg for entityId {}: {}", entityDTO.getEntityId(), e.getMessage(), e);
            throw new IntegrationCustomException("Database error during feedEntityDetailsToSponsorAndOrg", e, entityDTO.getEntityId());
        } catch (Exception e) {
            log.error("Unexpected exception in feedEntityDetailsToSponsorAndOrg for entityId {}: {}", entityDTO.getEntityId(), e.getMessage(), e);
            throw new IntegrationCustomException("Unexpected error during feedEntityDetailsToSponsorAndOrg", e, entityDTO.getEntityId());
        } finally {
            closeResources(rset, storedProcedure, entityDTO.getEntityId());
        }

        return entityResponse;
    }

    private void registerStoredProcedureParameters(StoredProcedureQuery storedProcedure) {
        for (int i = 1; i <= 44; i++) {
            if (i == 44) {
                storedProcedure.registerStoredProcedureParameter(i, void.class, ParameterMode.REF_CURSOR);
            } else if (i == 2 || i == 3 || i == 18 || i == 32 || i == 33) {
                storedProcedure.registerStoredProcedureParameter(i, Integer.class, ParameterMode.IN);
            } else if (i == 28 || i == 36 || i == 37 || i== 42) {
                storedProcedure.registerStoredProcedureParameter(i, Date.class, ParameterMode.IN);
            } else if (i == 4) {
                storedProcedure.registerStoredProcedureParameter(i, Boolean.class, ParameterMode.IN);
            } else {
                storedProcedure.registerStoredProcedureParameter(i, String.class, ParameterMode.IN);
            }
        }
    }

    private void setStoredProcedureParameters(StoredProcedureQuery storedProcedure, EntityDTO entityDTO) {
        SubAwdOrgDetailsDTO organization = entityDTO.getOrganizationDetails();
        storedProcedure.setParameter(1, organization.getOrganizationId());
        storedProcedure.setParameter(2, entityDTO.getEntityId());
        storedProcedure.setParameter(3, organization.getRolodexId());
        storedProcedure.setParameter(4, organization.getIsCreateOrganization());
        storedProcedure.setParameter(5, organization.getOrganizationName());
        storedProcedure.setParameter(6, organization.getPrimaryAddressLine1());
        storedProcedure.setParameter(7, organization.getPrimaryAddressLine2());
        storedProcedure.setParameter(8, organization.getCity());
        storedProcedure.setParameter(9, organization.getState());
        storedProcedure.setParameter(10, organization.getPostCode());
        storedProcedure.setParameter(11, organization.getCountryCode());
        storedProcedure.setParameter(12, organization.getEmailAddress());
        storedProcedure.setParameter(13, organization.getPhoneNumber());
        storedProcedure.setParameter(14, organization.getUpdatedBy());
        storedProcedure.setParameter(15, organization.getUeiNumber());
        storedProcedure.setParameter(16, organization.getDunsNumber());
        storedProcedure.setParameter(17, organization.getCageNumber());
        storedProcedure.setParameter(18, organization.getNumberOfEmployees());
        storedProcedure.setParameter(19, organization.getIrsTaxExemption());
        storedProcedure.setParameter(20, organization.getFederalEmployerId());
        storedProcedure.setParameter(21, organization.getMassTaxExemptNum());
        storedProcedure.setParameter(22, organization.getAgencySymbol());
        storedProcedure.setParameter(23, organization.getVendorCode());
        storedProcedure.setParameter(24, organization.getComGovEntityCode());
        storedProcedure.setParameter(25, organization.getMassEmployeeClaim());
        storedProcedure.setParameter(26, organization.getHumanSubAssurance());
        storedProcedure.setParameter(27, organization.getAnimalWelfareAssurance());
        storedProcedure.setParameter(28, organization.getScienceMisconductComplDate());
        storedProcedure.setParameter(29, organization.getPhsAcount());
        storedProcedure.setParameter(30, organization.getNsfInstitutionalCode());
        storedProcedure.setParameter(31, organization.getIndirectCostRateAgreement());
        storedProcedure.setParameter(32, organization.getCognizantAuditor());
        storedProcedure.setParameter(33, organization.getOnrResidentRep());
        storedProcedure.setParameter(34, organization.getLobbyingRegistrant());
        storedProcedure.setParameter(35, organization.getLobbyingIndividual());
        storedProcedure.setParameter(36, organization.getSamExpirationDate());
        storedProcedure.setParameter(37, organization.getIncorporatedDate());
        storedProcedure.setParameter(38, organization.getIncorporatedIn());
        storedProcedure.setParameter(39, organization.getRiskLevel());
        storedProcedure.setParameter(40, organization.getOrganizationTypeCode());
        storedProcedure.setParameter(41, organization.getCongressionalDistrict());
        storedProcedure.setParameter(42, organization.getSubAwdRiskAssmtDate());
        storedProcedure.setParameter(43, entityDTO.getSponsorCode());
    }

    private void closeResources(ResultSet resultSet, StoredProcedureQuery storedProcedure, Integer entityId) {
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                log.warn("Error closing ResultSet for entityId {}: {}", entityId, e.getMessage(), e);
            }
        }

        if (entityManager != null) {
            entityManager.close();
        }
    }

    public EntityResponse feedEntityDetailsToSponsor(EntityDTO entityDTO) {
        SponsorDetailsDTO sponsorDetails = entityDTO.getSponsorDetails();
        EntityResponse entityResponse = null;
        try {
            String procedureName = "FIBI_COI_FEED_ENTITY_SPONSOR";
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery(procedureName);
            for (int i = 1; i <= 25; i++) {
                if (i == 25) {
                    query.registerStoredProcedureParameter(i, void.class, ParameterMode.REF_CURSOR);
                } else if (i == 4) {
                    query.registerStoredProcedureParameter(i, Boolean.class, ParameterMode.IN);
                } else if (i == 2 || i == 3) {
                    query.registerStoredProcedureParameter(i, Integer.class, ParameterMode.IN);
                } else {
                    query.registerStoredProcedureParameter(i, String.class, ParameterMode.IN);
                }
            }
            query.setParameter(1, sponsorDetails.getSponsorCode());
            query.setParameter(2, entityDTO.getEntityId());
            query.setParameter(3, sponsorDetails.getRolodexId());
            query.setParameter(4, sponsorDetails.getIsCreateSponsor());
            query.setParameter(5, sponsorDetails.getSponsorName());
            query.setParameter(6, sponsorDetails.getPrimaryAddressLine1());
            query.setParameter(7, sponsorDetails.getPrimaryAddressLine2());
            query.setParameter(8, sponsorDetails.getCity());
            query.setParameter(9, sponsorDetails.getState());
            query.setParameter(10, sponsorDetails.getPostCode());
            query.setParameter(11, sponsorDetails.getCountryCode());
            query.setParameter(12, sponsorDetails.getEmailAddress());
            query.setParameter(13, sponsorDetails.getPhoneNumber());
            query.setParameter(14, sponsorDetails.getUpdatedBy());
            query.setParameter(15, sponsorDetails.getSponsorTypeCode());
            query.setParameter(16, sponsorDetails.getCustomerNumber());
            query.setParameter(17, sponsorDetails.getAuditReportSentForFy());
            query.setParameter(18, sponsorDetails.getUeiNumber());
            query.setParameter(19, sponsorDetails.getDodacNumber());
            query.setParameter(20, sponsorDetails.getDunsNumber());
            query.setParameter(21, sponsorDetails.getAcronym());
            query.setParameter(22, sponsorDetails.getCageNumber());
            query.setParameter(23, sponsorDetails.getDunningCampaignId());
            query.setParameter(24, sponsorDetails.getComments());

            boolean executeResult = query.execute();

            if (executeResult) {
                ResultSet resultSet = (ResultSet) query.getOutputParameterValue(25);
                if (resultSet != null) {
                    while (resultSet.next()) {
                        entityResponse = EntityResponse.builder().entityId(entityDTO.getEntityId())
                                .sponsorCode(resultSet.getString("SPONSOR_CODE"))
                                .sponsorFeedError(resultSet.getString("SPONSOR_ERROR"))
                                .rolodexId(resultSet.getInt("ROLODEX_ID")).build();
                    }
                }
            }
            log.info("Stored procedure {} executed successfully for entityId: {}", procedureName, entityDTO.getEntityId());
        } catch (SQLException e) {
            log.error("SQLException in feedEntityDetailsToSponsor for entityId {}: {}", entityDTO.getEntityId(), e.getMessage(), e);
            throw new IntegrationCustomException("Database error during feedEntityDetailsToSponsor", e, entityDTO.getEntityId());
        } catch (Exception e) {
            log.error("Unexpected exception in feedEntityDetailsToSponsor for entityId {}: {}", entityDTO.getEntityId(), e.getMessage(), e);
            throw new IntegrationCustomException("Unexpected error during feedEntityDetailsToSponsor", e, entityDTO.getEntityId());
        }
        return entityResponse;
    }
}
