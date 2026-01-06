package com.polus.integration.entity.base.service;

import org.springframework.stereotype.Service;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.base.dto.EntityDnBUpwardFamilyTreeResponse;
import com.polus.integration.entity.base.dto.ParentDunsDto;
import com.polus.integration.entity.base.exception.EntityDnBAPIException;
import com.polus.integration.entity.base.exception.UpwardFamilyTreeDnBAPIException;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;

@Service
public class EntityDnBService {

	private final EntityCriteriaSearchService searchService;

	public EntityDnBService(EntityCriteriaSearchService searchService) {
		this.searchService = searchService;
	}

	public EntityDnBUpwardFamilyTreeResponse getUpwardFamilyTree(String dunsNumber) {
		var result = searchService.fetchSearchResult(dunsNumber);
		validateFamilyTreeResponse(result, dunsNumber);
		var matchedResult = result.getSearchCandidates().get(0).getOrganization();
		var response = prepareFamilyTreeResponse(matchedResult);
		return response;
	}

	public DnBOrganizationDetails searchDuns(String dunsNumber) {
		var result = searchService.fetchSearchResult(dunsNumber);
		validateResponse(result, dunsNumber);
		DnBOrganizationDetails organization = result.getSearchCandidates().get(0).getOrganization();
		return organization;
	}

	private EntityDnBUpwardFamilyTreeResponse prepareFamilyTreeResponse(DnBOrganizationDetails matchedResult) {
		var response = new EntityDnBUpwardFamilyTreeResponse();
		response.setDuns(matchedResult.getDuns());
		response.setPrimaryName(matchedResult.getPrimaryName());
		response.setFamilytreeRolesPlayed(matchedResult.getCorporateLinkage().getFamilytreeRolesPlayed());
		response.setGlobalUltimateDuns(extractGlobalUltimateDunsNumber(matchedResult));
		response.setGlobalUltimatePrimaryName(extractGlobalUltimatePrimaryName(matchedResult));
		response.setParentDuns(
				getParentDunsTree(extractParentDunsNumber(matchedResult), extractParentDunsPrimaryName(matchedResult)));
		return response;
	}

	private void validateResponse(DnBCriteriaSearchAPIResponse result, String dunsNumber) {
		if (result == null) {
			throw new EntityDnBAPIException("No response for the D-U-N-S " + dunsNumber);
		}
		if (result.getError() != null) {
			throw new EntityDnBAPIException(result.getError().getErrorMessage());
		}

		if (result.getCandidatesMatchedQuantity() > 1) {
			throw new EntityDnBAPIException("Results returned more than one result for the D-U-N-S " + dunsNumber);
		}

		if (result.getSearchCandidates() == null || result.getSearchCandidates().get(0) == null) {
			throw new EntityDnBAPIException("No result found for the D-U-N-S " + dunsNumber);
		}

	}

	private void validateFamilyTreeResponse(DnBCriteriaSearchAPIResponse result, String dunsNumber) {
		validateResponse(result, dunsNumber);
		var matchedResult = result.getSearchCandidates().get(0).getOrganization();
		if (matchedResult == null || matchedResult.getCorporateLinkage() == null) {
			throw new UpwardFamilyTreeDnBAPIException("No Corporate Family Tree for the D-U-N-S " + dunsNumber);
		}

	}

	private ParentDunsDto getParentDunsTree(String duns, String primaryName) {
		if (duns == null) {
			return null;
		}
		ParentDunsDto dto = new ParentDunsDto();
		var result = searchService.fetchSearchResult(duns);
		if (result.getSearchCandidates() != null && result.getSearchCandidates().get(0) != null) {

			var matchedResult = result.getSearchCandidates().get(0).getOrganization();
			dto.setDuns(duns);
			dto.setPrimaryName(primaryName);
			dto.setParentDuns(getParentDunsTree(extractParentDunsNumber(matchedResult),
					extractParentDunsPrimaryName(matchedResult)));
		}
		return dto;
	}

	private String extractParentDunsNumber(DnBOrganizationDetails matchedResult) {
		return matchedResult.getCorporateLinkage().getParent() == null ? null
				: matchedResult.getCorporateLinkage().getParent().getDuns();
	}

	private String extractParentDunsPrimaryName(DnBOrganizationDetails matchedResult) {
		return matchedResult.getCorporateLinkage().getParent() == null ? null
				: matchedResult.getCorporateLinkage().getParent().getPrimaryName();
	}

	private String extractGlobalUltimateDunsNumber(DnBOrganizationDetails matchedResult) {
		return matchedResult.getCorporateLinkage().getGlobalUltimate() == null ? null
				: matchedResult.getCorporateLinkage().getGlobalUltimate().getDuns();
	}

	private String extractGlobalUltimatePrimaryName(DnBOrganizationDetails matchedResult) {
		return matchedResult.getCorporateLinkage().getGlobalUltimate() == null ? null
				: matchedResult.getCorporateLinkage().getGlobalUltimate().getPrimaryName();
	}
}
