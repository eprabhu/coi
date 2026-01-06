package com.polus.fibicomp.globalentity.dashboard.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.fibicomp.globalentity.dashboard.dao.EntityDashboardDao;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboard;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboardDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class EntityDashboardService {

	@Autowired
	private EntityDashboardDao entityDashboardDao;

	@Autowired
	private CommonDao commonDao;

	public String getEntityDashBoardData(EntityDashboardDTO vo) {
		EntityDashboard entityDashboard = new EntityDashboard();
		try {
			if (vo == null) {
				log.error("EntityDashboardDTO is null");
				throw new IllegalArgumentException("EntityDashboardDTO cannot be null");
			}
			entityDashboard = entityDashboardDao.dashboardDataForEntity(vo);
		} catch (IllegalArgumentException e) {
			log.error("Invalid input provided for getEntityDashBoardData", e);
			throw e;
		} catch (Exception e) {
			log.error("Unexpected error in method getEntityDashBoardData", e);
			throw new RuntimeException("Error occurred while fetching entity dashboard data", e);
		}
		return commonDao.convertObjectToJSON(entityDashboard);
	}

	public boolean validateEntityDashboardData(Map<String, Object> globalEntityDashboard, List<String> validationMessages) {
		boolean isValid = true;

		if (globalEntityDashboard == null || validationMessages == null) {
			throw new IllegalArgumentException("Input data cannot be null");
		}

		for (Map.Entry<String, Object> entry : globalEntityDashboard.entrySet()) {
			String key = entry.getKey();
			Object value = entry.getValue();

			// Validate key-value pairs except for PAGED, LIMIT, and UNLIMITED
			if (!key.equals("PAGED") && !key.equals("LIMIT") && !key.equals("UNLIMITED")) {
				if (!(value instanceof List)) {
					String errorMessage = getErrorMessage(key, String.valueOf(value));
					if (errorMessage != null) {
						validationMessages.add(errorMessage);
						isValid = false;
					}
				}
			}
		}
		return isValid;
	}

	private String getErrorMessage(String key, String value) {
		if (value == null || value.isEmpty()) {
			return key + " cannot be empty or null.";
		}

		switch (key) {
			case "PRIMARY_NAME":
				// \p{L} → Matches any kind of letter from any language (including accented characters).
				// \p{M} → Matches diacritic marks (like accents).
				return validateFormat(value, "[\\p{L}\\p{M}0-9\",<>'_()/\\.\\[\\]\\{\\}&#@: \\-\\*]*+", "Entity Name must not include special characters.");
			case "OWNERSHIP_TYPE_CODE":
				return validateFormat(value, "[\",<>'_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z -]+", "Ownership Type must not include special characters.");
			case "PRIMARY_ADDRESS":
				return validateFormat(value, "[\\p{L}\\p{M}\",<>'_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z \\-\\*]*", "Address Line 1 must not include special characters.");
			case "CITY":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z ()\\-\\*]+", "City must not include special characters.");
			case "STATE":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z _(),&.*-]+", "State must not include special characters.");
			case "COUNTRY_CODE":
				return validateFormat(value, "[0-9a-zA-Z _]+", "Country must not include special characters.");
			case "DUNS_NUMBER":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z _\\-\\*]*", "Duns Number must not include special characters.");
			case "UEI_NUMBER":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z _\\-\\*]+", "UEI Number must not include special characters.");
			case "CAGE_NUMBER":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z. _()-/\\-\\*]+", "CAGE Number must not include special characters.");
			case "WEBSITE_ADDRESS":
				return validateFormat(value, "[\\p{L}\\p{M}\",<>_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z \\-\\*]+", "Website must not include special characters.");
			case "CERTIFIED_EMAIL":
				return validateFormat(value, "[\",<>_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z -]*", "Email must not include special characters except '-, @' and '_'.");
			case "ENTITY_STATUS_TYPE_CODE":
				return validateFormat(value, "[\",<>_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z -]+", "Entity Status must not include special characters.");
			case "FOREIGN_NAME":
				return validateFormat(value, "[\",<>_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z -]*", "Foreign Name must not include special characters.");
			case "PRIOR_NAME":
				return validateFormat(value, "[\\p{L}\\p{M}\",<>_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z \\-\\*]*", "Prior Name must not include special characters.");
			case "SORT_TYPE":
				return validateFormat(value, "[a-zA-Z\\.,_ ]+", "Sort must not include special characters.");
			case "TAB_TYPE":
				return validateFormat(value, "[0-9a-zA-Z _]*", "TabName must not include special characters except '-' and '_'.");
			case "TYPE":
				return validateFormat(value, "[AL]+", "AdvancedSearch must not include special characters.");
			case "EXPORT_TYPE":
				return validateFormat(value, "^[a-zA-Z]*", "Export Type must not include special characters.");
			case "DOCUMENT_HEADING":
				return validateFormat(value, "[0-9a-zA-Z _-]*", "Document Heading must not include special characters.");
			case "ORGANIZATION_ID":
				return validateFormat(value, "[\\p{L}\\p{M}0-9, \\-\\*]*", "Organization ID must not include special characters.");
			case "SPONSOR_CODE":
				return validateFormat(value, "[\\p{L}\\p{M}0-9a-zA-Z _\\-\\*]*", "Sponsor code must not include special characters.");
			default:
				return null;
		}
	}

	private String validateFormat(String value, String regex, String errorMessage) {
		if (!value.matches("^$|" + regex)) {
			log.error("Validation failed for value: {}", value);
			return errorMessage;
		}
		return null;
	}

}
