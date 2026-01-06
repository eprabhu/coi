package com.polus.integration.entity.enrich.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.polus.integration.constant.Constant;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.enrich.dao.EntityEnrichDAO;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse;
import com.polus.integration.entity.enrich.dto.DnBEntityEnrichRequestDTO;
import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse;
import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse.Organization;
import com.polus.integration.service.IntegrationService;
import com.polus.integration.vo.COIActionLogVO;


import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EntityEnrichService {

	@Autowired
	private EnrichUrlBuilder urlBuilder;

	@Autowired
	private DnBEnrichAPIService apiService;
	
	@Autowired
	private IntegrationService integrationService;

	@Autowired
	private EntityEnrichDAO dao;

	@Autowired
	private EntityCriteriaSearchService searchService;

	private static final Integer UEI_DNB_REGISTRATION_TYPE = 37491;

	private static final Integer FEDERAL_EMPLOYER_ID_DNB_REGISTRATION_TYPE = 6863;
	
	private static final Integer CAGE_CODE = 23949;
	
	private static final String COI_ENRICH_ACTION_TYPE = "2";
	
	private static final String PUBLICLY_TRADED_COMPANY = "1";
	
	private static final String PRIVATELY_OWNED_COMPANY = "2";
	
	private static final String UNKNOWN_OWNERSHIP_TYPE = "3";
	
	

	public EntityEnrichAPIResponse runEnrich(DnBEntityEnrichRequestDTO request) {
		EntityEnrichAPIResponse response = new EntityEnrichAPIResponse();
		try {
			String apiUrl = buildApiUrl(request);
			DnBEnrichAPIResponse dnbResponse = callAPI(apiUrl);
			response = PrepareResponse(dnbResponse);
			String actionPersonId = (request.getActionPersonId() != null ? request.getActionPersonId()
					: Constant.UPDATE_BY);
			boolean isSuccess = refreshDatabase(request.getEntityId(), actionPersonId, response);
			if (!Boolean.TRUE.equals(request.getFromFeed())) {
				logAction(isSuccess, request.getEntityId(), request.getActionPersonId(), response);
			}
		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_ENRICH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage(errorCode.getErrorMessage());
			response.setErrorDetails(e.getMessage());
		}

		return response;
	}

	private boolean refreshDatabase(Integer entityId, String actionPersonId, EntityEnrichAPIResponse response) {

		if (response.getOrganization() == null) {
			return false;
		}

		try {

			dao.refreshEntityHeaderInfo(entityId, actionPersonId, response.getOrganization());
			dao.refreshEntityIndustryCode(entityId, actionPersonId, response.getOrganization().getIndustryCodes());
			dao.refreshEntityRegistration(entityId, actionPersonId,
					response.getOrganization().getRegistrationNumbers());
			dao.refreshEntityTelephone(entityId, actionPersonId, response.getOrganization().getTelephone());
			dao.refreshForiegnName(entityId, actionPersonId, response.getOrganization().getMultilingualPrimaryName());
			dao.refreshEntityMailingAddress(entityId, actionPersonId, response.getOrganization().getMailingAddress());
		} catch (Exception e) {
			log.error("DnB ENRICH API: Exception while refreshDatabase, error " + e.getMessage());
			return false;
		}
		return true;
	}

	private String buildApiUrl(DnBEntityEnrichRequestDTO request) {
		return urlBuilder.buildApiUrl(request);
	}

	private DnBEnrichAPIResponse callAPI(String apiUrl) {
		return apiService.callAPI(apiUrl);
	}

	private EntityEnrichAPIResponse PrepareResponse(DnBEnrichAPIResponse apiResponse) {
		EntityEnrichAPIResponse response = new EntityEnrichAPIResponse();
		try {

			if (apiResponse == null) {
				return response;
			}

			response.setHttpStatusCode(apiResponse.getHttpStatusCode());
			if (apiResponse.getTransactionDetail() != null) {
				response.setTransactionID(apiResponse.getTransactionDetail().getTransactionID());
			}

			if (apiResponse.getOrganization() != null) {
				com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization dnbOrg = apiResponse
						.getOrganization();
				Organization organization = setOrganizationResponse(dnbOrg);

				DnBCriteriaSearchAPIResponse result = searchService.fetchSearchResult(Arrays.asList(apiResponse.getOrganization().getDuns()));
				var searchResult = result.getSearchCandidates();

				Map<String, DnBOrganizationDetails> dunsOrganizationMapFromSearchAPI =
						searchResult.stream()
								.map(row -> row.getOrganization())
								.collect(Collectors.toMap(DnBOrganizationDetails::getDuns, org -> org));
				DnBOrganizationDetails dunsOrganization = dunsOrganizationMapFromSearchAPI.get(apiResponse.getOrganization().getDuns());
				organization.setCorporateLinkage(dunsOrganization.getCorporateLinkage());
				response.setOrganization(organization);

			}

			if (apiResponse.getError() != null) {
				PrepareErrorInfo(apiResponse, response);
			}

		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_ENRICH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage(
					"Error while API PrepareResponse for Enrich API in Fibi Enrich Service. \n Exception: "
							+ e.getMessage());
			response.setErrorDetails(e.getMessage());
		}
		return response;
	}

	private Organization setOrganizationResponse(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization dnbOrg) {
		Organization organization = new Organization();
		organization.setDuns(dnbOrg.getDuns());
		organization.setUei(getUEI(dnbOrg));
		organization.setCageNumber(getCageNumber(dnbOrg));
		organization.setPrimaryName(dnbOrg.getPrimaryName());
		organization.setRegisteredName(dnbOrg.getRegisteredName());
		organization.setTradeStyleNames(getShortName(dnbOrg));
		organization.setFederalEmployerId(getFederalEmployerId(dnbOrg));
		// organization.setMultilingualPrimaryName(getForiegnName(dnbOrg));
		organization.setMultilingualPrimaryName(dnbOrg.getMultilingualPrimaryName());
		organization.setIndustryCodes(dnbOrg.getIndustryCodes());
		organization.setWebsiteAddress(getWebsite(dnbOrg));
		organization.setDunsControlStatus(dnbOrg.getDunsControlStatus());
		organization.setBusinessEntityType(dnbOrg.getBusinessEntityType());
		organization.setOwnershipType(getOwnershipType(dnbOrg));		
		organization.setSummary(getCompanyProfile(dnbOrg));
		organization.setTelephone(dnbOrg.getTelephone());
		organization.setPrimaryAddress(dnbOrg.getPrimaryAddress());
		organization.setMailingAddress(dnbOrg.getMailingAddress());
		organization.setRegisteredAddress(dnbOrg.getRegisteredAddress());
		organization.setDefaultCurrency(dnbOrg.getDefaultCurrency());
		organization.setStartDate(dnbOrg.getStartDate());
		organization.setIncorporatedDate(dnbOrg.getIncorporatedDate());
		organization.setRegistrationNumbers(dnbOrg.getRegistrationNumbers());
		organization.setNumberOfEmployees(getNoOfEmployees(dnbOrg));
		organization.setStandalone(dnbOrg.isStandalone());

		return organization;
	}

	private void PrepareErrorInfo(DnBEnrichAPIResponse apiResponse, EntityEnrichAPIResponse response) {
		if (apiResponse.getError().getErrorCode() != null) {
			response.setErrorCode(apiResponse.getError().getErrorCode());
			response.setErrorMessage(apiResponse.getError().getErrorMessage());
			if (apiResponse.getError().getErrorDetails() != null) {

				List<com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.ErrorDetail> errorDetails = apiResponse
						.getError().getErrorDetails();

				response.setErrorDetails(errorDetails.stream()
						.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.ErrorDetail::toString)
						.collect(Collectors.joining("; ")));

			}

		}
	}

	private String getUEI(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return pickRegistrationNumber(UEI_DNB_REGISTRATION_TYPE, organization);

	}
  
	private Integer getNoOfEmployees(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return handleException(() -> {
			if (organization.getNumberOfEmployees() == null) {
				return null;
			}

			Integer noOfEmp = organization.getNumberOfEmployees().stream()
					.filter(emp -> emp.getInformationScopeDnBCode() == 9067)// to get the consolidated count
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.NumberOfEmployees::getValue)
					.findFirst().orElse(null);

			return noOfEmp;
		});

	}

	private String getCompanyProfile(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return handleException(() -> {
			if (organization.getSummary() == null) {
				return null;
			}

			String companyProfile = organization.getSummary().stream()
					.filter(reg -> reg.getTextType().getDnbCode() == 32456) // This is the Short company profile in DnB
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Summary::getText).findFirst()
					.orElse(null);

			companyProfile = removeHTMLTags(companyProfile);

			return companyProfile;
		});

	}

	private String removeHTMLTags(String companyProfile) {
		if (companyProfile == null) {
			return companyProfile;
		}
		companyProfile = companyProfile.replaceAll("<[^>]*>", "");
		return companyProfile;
	}

	private String getOwnershipType(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		if (organization.getControlOwnershipType() == null) {
			return UNKNOWN_OWNERSHIP_TYPE;
		}

		if (organization.getControlOwnershipType().getDnbCode() == 9057) { // "Publicly Traded Company"
			return PUBLICLY_TRADED_COMPANY;
		}
		
		if (organization.getControlOwnershipType().getDnbCode() == 9058) { // "Privately owned"
			return PRIVATELY_OWNED_COMPANY;
		}
		
		return UNKNOWN_OWNERSHIP_TYPE;
	}

	private String getForiegnName(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {
		return handleException(() -> {
			if (organization.getMultilingualPrimaryName() == null) {
				return null;
			}

			String foriegnName = organization.getMultilingualPrimaryName().stream()
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.MultilingualPrimaryName::getName)
					.findFirst().orElse(null);
			return foriegnName;
		});

	}

	private String getShortName(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return handleException(() -> {
			if (organization.getTradeStyleNames() == null) {
				return null;
			}

			String shortName = organization.getTradeStyleNames().stream()
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.TradeNameStyle::getName)
					.findFirst().orElse(null);

			return shortName;
		});
	}

	private String getWebsite(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {
		return handleException(() -> {
			if (organization.getWebsiteAddress() == null) {
				return null;
			}
			String website = organization.getWebsiteAddress().stream()
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Website::getUrl).findFirst()
					.orElse(null);

			return website;
		});
	}

	private String getFederalEmployerId(
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return pickRegistrationNumber(FEDERAL_EMPLOYER_ID_DNB_REGISTRATION_TYPE, organization);
	}

	private String pickRegistrationNumber(Integer registrationTypeCode,
			com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {
		return handleException(() -> {
			if (organization.getRegistrationNumbers() == null) {
				return null;
			}

			String registrationNumber = organization.getRegistrationNumbers().stream()
					.filter(reg -> reg.getTypeDnBCode() == registrationTypeCode)
					.map(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.RegistrationNumber::getRegistrationNumber)
					.findFirst().orElse(null);

			return registrationNumber;
		});

	}

	private <T> T handleException(Supplier<T> supplier) {
		try {
			return supplier.get();
		} catch (Exception e) {
			log.error("DnB ENRICH API: Exception while handleException, error " + e.getMessage());
			return null;
		}
	}

	private void logAction(Boolean isSuccess, Integer entityId, String actionPersonId,EntityEnrichAPIResponse response) {
		
		if(!isSuccess) {
			return;
		}
		
		String entityName = null;
		String dunsNumber = null;
		
		if(response != null && response.getOrganization() != null) {
			entityName = response.getOrganization().getPrimaryName();
			dunsNumber = response.getOrganization().getDuns();
		}
		
		integrationService.logCOIAction(COIActionLogVO.builder()
													  .entityId(entityId)
													  .entityName(entityName)
													  .actionLogCode(COI_ENRICH_ACTION_TYPE)
													  .updatedBy(actionPersonId)
													  .dunsNumber(dunsNumber)
													  .build()
				);
	}
	
	private String getCageNumber(com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Organization organization) {

		return pickRegistrationNumber(CAGE_CODE, organization);

	}	
}
