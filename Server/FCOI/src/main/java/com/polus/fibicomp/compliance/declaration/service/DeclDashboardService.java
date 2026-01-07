package com.polus.fibicomp.compliance.declaration.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.polus.fibicomp.compliance.declaration.dto.DeclarationTabCountDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.compliance.declaration.dao.DeclarationDashboardDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardDTO;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardRequest;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardResponse;
import com.polus.fibicomp.compliance.declaration.util.DbRetryUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class DeclDashboardService {

	@Autowired
	private DeclarationDashboardDao declarationDashboardDao;

	@Autowired
	private CommonDao commonDao;

	public String getDeclarationDashBoardData(DeclDashboardRequest request) {
		request.getDeclarationDashboardData().put("LOGIN_PERSON_ID", AuthenticatedUser.getLoginPersonId());
		List<DeclDashboardResponse> dashboardList = DbRetryUtils.retryWithDeadlockHandling(
				() -> declarationDashboardDao.fetchDashboardList(request),
				"Fetching dashboard list failed for request: " + request.getDeclarationDashboardData());

		request.getDeclarationDashboardData().put("COUNT", true);

		Integer count = DbRetryUtils.retryWithDeadlockHandling(
				() -> declarationDashboardDao.fetchDashboardCount(request),
				"Fetching dashboard count failed for request: " + request.getDeclarationDashboardData());

		DeclDashboardDTO dto = DeclDashboardDTO.builder()
				.dashboardResponses(dashboardList)
				.totalDeclarationResponse(count)
				.build();

		return commonDao.convertObjectToJSON(dto);
	}

	public boolean validateDeclarationDashboardData(Map<String, Object> declarationDashboard, List<String> validationMessages) {
		boolean isValid = true;

		if (declarationDashboard == null || validationMessages == null) {
			throw new IllegalArgumentException("Input data cannot be null");
		}

		for (Map.Entry<String, Object> entry : declarationDashboard.entrySet()) {
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
			case "PERSON":
				// \p{L} → Matches any kind of letter from any language (including accented characters).
				// \p{M} → Matches diacritic marks (like accents).
				return validateFormat(value, "[\\p{L}\\p{M}0-9\",<>'_()/\\.\\[\\]\\{\\}&#@: \\-\\*]*+", "Person Name must not include special characters.");
			case "DEPARTMENT":
				return validateFormat(value, "[\",<>'_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z -]+", "Department must not include special characters.");
			case "DECLARATION_STATUS":
				return validateFormat(value, "[\\p{L}\\p{M}\",<>'_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z \\-\\*]*", "Submission Status must not include special characters.");
			case "DECLARATION_TYPE":
				return validateFormat(value, "[\\p{L}\\p{M}\",<>'_()/\\.\\[\\]\\{\\}&#@:0-9a-zA-Z \\-\\*]*", "Declaration Type must not include special characters.");
			case "SUBMISSION_DATE":
				return validateFormat(value, "[0-9a-zA-Z _(),&.*-]+", "Submission Date must not include special characters.");
			case "EXPIRATION_DATE":
				return validateFormat(value, "[0-9a-zA-Z _(),&.*-]+", "Expiration Date must not include special characters.");
			case "SORT_TYPE":
				return validateFormat(value, "[a-zA-Z\\.,_ ]+", "Sort must not include special characters.");
			case "TAB_TYPE":
				return validateFormat(value, "[0-9a-zA-Z _]*", "TabName must not include special characters except '-' and '_'.");
			case "TYPE":
				return validateFormat(value, "[AL]+", "AdvancedSearch must not include special characters.");
			case "DASHBOARD_TYPE":
				return validateFormat(value, "[AR]+", "Dashboard Type must not include special characters.");
			case "EXPORT_TYPE":
				return validateFormat(value, "^[a-zA-Z]*", "Export Type must not include special characters.");
			case "DOCUMENT_HEADING":
				return validateFormat(value, "[0-9a-zA-Z _-]*", "Document Heading must not include special characters.");
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

    public DeclarationTabCountDto getAdminDashboardTabCount(DeclDashboardRequest request) throws ExecutionException, InterruptedException {
        request.getDeclarationDashboardData().put("COUNT", true);
        request.getDeclarationDashboardData().put("TYPE", "A");
        request.getDeclarationDashboardData().put("LOGIN_PERSON_ID", AuthenticatedUser.getLoginPersonId());
        request.getDeclarationDashboardData().put("UNLIMITED", true);
        request.getDeclarationDashboardData().put("TAB_TYPE", "NEW_SUBMISSIONS");
        Integer newSubmissionCount = declarationDashboardDao.fetchDashboardCount(request);
        request.getDeclarationDashboardData().put("TAB_TYPE", "MY_REVIEWS");
        Integer myReviewsCount = declarationDashboardDao.fetchDashboardCount(request);
        request.getDeclarationDashboardData().put("TAB_TYPE", "ALL_REVIEWS");
        Integer allReviewsCount = declarationDashboardDao.fetchDashboardCount(request);
        return DeclarationTabCountDto.builder().newSubmissionTabCount(newSubmissionCount).allReviewsTabCount(allReviewsCount).myReviewsTabCount(myReviewsCount).build();
    }
}
