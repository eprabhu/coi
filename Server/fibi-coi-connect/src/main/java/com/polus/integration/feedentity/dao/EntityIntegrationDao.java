package com.polus.integration.feedentity.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.feedentity.dto.SponsorDetailsDTO;
import com.polus.integration.feedentity.dto.SubAwdOrgDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.feedentity.dto.EntityDTO;
import com.polus.integration.feedentity.dto.EntityResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Transactional
@Service
public class EntityIntegrationDao {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private IntegrationDao integrationDao;

	private static final String FEED_STATUS_READY_TO_FEED = "2";
	private static final String FEED_STATUS_ERROR = "4";

	public List<EntityDTO> getEntityDetails(Integer entityId) {
		List<EntityDTO> dtos = new ArrayList<>();
		try {
			log.info("Calling stored procedure COI_INT_GET_ENTITY_DETAILS with entityId: {}", entityId);

			dtos = jdbcTemplate.execute((Connection conn) -> {
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_GET_ENTITY_DETAILS(?)}")) {
					if (entityId != null) {
						cs.setInt(1, entityId);
					} else {
						cs.setNull(1, java.sql.Types.INTEGER);
					}

					try (ResultSet rset = cs.executeQuery()) {
						List<EntityDTO> results = new ArrayList<>();
						while (rset.next()) {
							results.add(EntityDTO.builder()
									.telephoneNumber(rset.getString("TELEPHONE_NUMBER"))
									.certifiedEmail(rset.getString("CERTIFIED_EMAIL"))
									.ueiNumber(rset.getString("UEI_NUMBER"))
									.dunsNumber(rset.getString("DUNS_NUMBER"))
									.cageNumber(rset.getString("CAGE_NUMBER"))
									.entityId(rset.getInt("ENTITY_ID"))
									.createdBy(rset.getString("CREATED_BY"))
									.updatedBy(rset.getString("UPDATED_BY"))
									.build());
						}
						log.info("Stored procedure executed successfully, {} records found", results.size());
						return results;
					}
				}
			});
		} catch (DataAccessException e) {
			log.error("DataAccessException while executing stored procedure COI_INT_GET_ENTITY_DETAILS with entityId {}: {}", entityId, e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error occurred while fetching entity details with entityId {}: {}", entityId, e.getMessage(), e);
		}
		return dtos;
	}

	public void updateEntitySponsorInfoByParams(EntityResponse entityResponse) {
		try {
			log.info("Calling stored procedure COI_INT_KC_SPON_ORG_RESPONSE with entityId: {}, sponsorCode: {}, sponsorFeedError: {}, orgFeedError: {}, organizationId: {}",
					entityResponse.getEntityId(), entityResponse.getSponsorCode(), entityResponse.getSponsorFeedError(), entityResponse.getOrganizationFeedError(), entityResponse.getOrganizationId());

			jdbcTemplate.execute((Connection conn) -> {
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_KC_SPON_ORG_RESPONSE(?, ?, ?, ?, ?,?,?)}")) {
					cs.setInt(1, entityResponse.getEntityId());
					cs.setString(2, entityResponse.getOrganizationFeedError());
					cs.setString(3, entityResponse.getSponsorFeedError());
					cs.setString(4, entityResponse.getSponsorCode());
					cs.setString(5, entityResponse.getOrganizationId());
					cs.setInt(6, entityResponse.getRolodexId());
					cs.setTimestamp(7, integrationDao.getCurrentTimestamp());
					cs.execute();
				}
				return null;
			});
		} catch (DataAccessException e) {
			log.error("DataAccessException while executing stored procedure COI_INT_KC_SPON_ORG_RESPONSE with entityId {}: {}", entityResponse.getEntityId(), e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error occurred while updating entity sponsor info with entityId {}: {}", entityResponse.getEntityId(), e.getMessage(), e);
		}
	}

	public SponsorDetailsDTO getEntitySponsorDetails(Integer entityId) {
		SponsorDetailsDTO sponsorDetails = null;
		try {
			log.info("Calling stored procedure COI_INT_GET_SPONSOR_DETAILS with entityId: {}", entityId);

			 sponsorDetails = jdbcTemplate.execute((Connection conn) -> {
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_GET_SPONSOR_DETAILS(?)}")) {
					if (entityId != null) {
						cs.setInt(1, entityId);
					} else {
						cs.setNull(1, java.sql.Types.INTEGER);
					}

					try (ResultSet rset = cs.executeQuery()) {
						SponsorDetailsDTO result = null;
						while (rset.next()) {
							result = SponsorDetailsDTO.builder()
									.ueiNumber(rset.getString("UEI_NUMBER"))
									.dunsNumber(rset.getString("DUNS_NUMBER"))
									.cageNumber(rset.getString("CAGE_NUMBER"))
									.entityId(rset.getInt("ENTITY_ID"))
									.updatedBy(rset.getString("UPDATED_BY"))
									.sponsorCode(rset.getString("SPONSOR_CODE"))
									.sponsorName(rset.getString("SPONSOR_NAME"))
									.primaryAddressLine1(rset.getString("SPONSOR_ADDRESS_LINE_1"))
									.primaryAddressLine2(rset.getString("SPONSOR_ADDRESS_LINE_2"))
									.city(rset.getString("SPONSOR_CITY"))
									.state(rset.getString("SPONSOR_STATE"))
									.postCode(rset.getString("SPONSOR_POST_CODE"))
									.countryCode(rset.getString("SPONSOR_COUNTRY_CODE"))
									.emailAddress(rset.getString("EMAIL_ADDRESS"))
									.phoneNumber(rset.getString("PHONE_NUMBER"))
									.sponsorTypeCode(rset.getString("SPONSOR_TYPE_CODE"))
									.customerNumber(rset.getString("CUSTOMER_NUMBER"))
									.auditReportSentForFy(rset.getString("AUDIT_REPORT_SENT_FOR_FY"))
									.acronym(rset.getString("ACRONYM"))
									.dunningCampaignId(rset.getString("DUNNING_CAMPAIGN_ID"))
									.dodacNumber(rset.getString("DODAC_NUMBER"))
									.isCreateSponsor(rset.getString("SPONSOR_FEED_STATUS_CODE") != null
											&& (rset.getString("SPONSOR_FEED_STATUS_CODE").equals(FEED_STATUS_READY_TO_FEED)
											|| rset.getString("SPONSOR_FEED_STATUS_CODE").equals(FEED_STATUS_ERROR)))
									.comments(rset.getString("COMMENTS"))
									.rolodexId(rset.getInt("ROLODEX_ID"))
									.build();
						}
						log.info("Stored procedure executed successfully");
						return result;
					}
				}
			});
		} catch (DataAccessException e) {
			log.error("DataAccessException while executing stored procedure COI_INT_GET_SPONSOR_DETAILS with entityId {}: {}", entityId, e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error occurred while fetching entity sponsor details with entityId {}: {}", entityId, e.getMessage(), e);
		}
		return sponsorDetails;
	}

	public SubAwdOrgDetailsDTO getEntityOrganizationDetails(Integer entityId) {
		SubAwdOrgDetailsDTO orgDetails = null;
		try {
			log.info("Calling stored procedure COI_INT_GET_ORGANIZATION_DETAILS with entityId: {}", entityId);

			orgDetails = jdbcTemplate.execute((Connection conn) -> {
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_GET_ORGANIZATION_DETAILS(?)}")) {
					if (entityId != null) {
						cs.setInt(1, entityId);
					} else {
						cs.setNull(1, java.sql.Types.INTEGER);
					}

					try (ResultSet rset = cs.executeQuery()) {
						SubAwdOrgDetailsDTO result = null;
						while (rset.next()) {
							result = SubAwdOrgDetailsDTO.builder()
									.ueiNumber(rset.getString("UEI_NUMBER"))
									.dunsNumber(rset.getString("DUNS_NUMBER"))
									.cageNumber(rset.getString("CAGE_NUMBER"))
									.entityId(rset.getInt("ENTITY_ID"))
									.updatedBy(rset.getString("UPDATED_BY"))
									.primaryAddressLine1(rset.getString("ORG_ADDRESS_LINE_1"))
									.primaryAddressLine2(rset.getString("ORG_ADDRESS_LINE_2"))
									.city(rset.getString("ORG_CITY"))
									.state(rset.getString("ORG_STATE"))
									.postCode(rset.getString("ORG_POST_CODE"))
									.countryCode(rset.getString("ORG_COUNTRY_CODE"))
									.emailAddress(rset.getString("EMAIL_ADDRESS"))
									.phoneNumber(rset.getString("PHONE_NUMBER"))
									.organizationId(rset.getString("ORGANIZATION_ID"))
									.numberOfEmployees(rset.getInt("NUMBER_OF_EMPLOYEES"))
									.federalEmployerId(rset.getString("FEDERAL_EMPLOYER_ID"))
									.incorporatedDate(rset.getString("INCORPORATED_DATE"))
									.incorporatedIn(rset.getString("INCORPORATED_IN"))
									.irsTaxExemption(rset.getString("IRS_TAX_EXEMPTION"))
									.massTaxExemptNum(rset.getString("MASS_TAX_EXEMPT_NUM"))
									.agencySymbol(rset.getString("AGENCY_SYMBOL"))
									.vendorCode(rset.getString("VENDOR_CODE"))
									.comGovEntityCode(rset.getString("COM_GOV_ENTITY_CODE"))
									.massEmployeeClaim(rset.getString("MASS_EMPLOYEE_CLAIM"))
									.humanSubAssurance(rset.getString("HUMAN_SUB_ASSURANCE"))
									.animalWelfareAssurance(rset.getString("ANIMAL_WELFARE_ASSURANCE"))
									.scienceMisconductComplDate(rset.getDate("SCIENCE_MISCONDUCT_COMPL_DATE"))
									.phsAcount(rset.getString("PHS_ACOUNT"))
									.nsfInstitutionalCode(rset.getString("NSF_INSTITUTIONAL_CODE"))
									.indirectCostRateAgreement(rset.getString("INDIRECT_COST_RATE_AGREEMENT"))
									.cognizantAuditor(rset.getInt("COGNIZANT_AUDITOR"))
									.onrResidentRep(rset.getInt("ONR_RESIDENT_REP"))
									.lobbyingIndividual(rset.getString("LOBBYING_INDIVIDUAL"))
									.lobbyingRegistrant(rset.getString("LOBBYING_REGISTRANT"))
									.samExpirationDate(rset.getDate("SAM_EXPIRATION_DATE"))
									.riskLevel(rset.getString("RISK_LEVEL"))
									.congressionalDistrict(rset.getString("CONGRESSIONAL_DISTRICT"))
									.organizationTypeCode(rset.getString("ORGANIZATION_TYPE_CODE"))
									.isCreateOrganization(rset.getString("ORG_FEED_STATUS_CODE") != null
											&& (rset.getString("ORG_FEED_STATUS_CODE").equals(FEED_STATUS_READY_TO_FEED)
											|| rset.getString("ORG_FEED_STATUS_CODE").equals(FEED_STATUS_ERROR)))
									.subAwdRiskAssmtDate(rset.getDate("SUB_AWD_RISK_ASSMT_DATE"))
									.organizationName(rset.getString("ORGANIZATION_NAME"))
									.rolodexId(rset.getInt("ROLODEX_ID"))
									.build();
						}
						log.info("Stored procedure executed successfully");
						return result;
					}
				}
			});
		} catch (DataAccessException e) {
			log.error("DataAccessException while executing stored procedure COI_INT_GET_ORGANIZATION_DETAILS with entityId {}: {}", entityId, e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error occurred while fetching entity organization details with entityId {}: {}", entityId, e.getMessage(), e);
		}
		return orgDetails;
	}

}
