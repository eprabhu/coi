package com.polus.fibicomp.opa.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OPADashboardRequestDto {

	private Integer id;
	private String tabType;
	private String filterType;
	private Integer pageNumber;
	private Integer currentPage;
	private Map<@Pattern(regexp = "^$|[a-zA-Z\\.]+$", message = "Sort key must not include special characters.") String, @Pattern(regexp = "^$|[a-zA-Z]+$", message = "Sort value must not include special characters.") String> sort = new HashMap<>();
	private String unitIdentifier;
	private String submissionTimestamp;
	private List<String> dispositionStatusCodes;
	private List<String> reviewStatusCodes;
	private List<String> designationStatusCodes;
	private Boolean fetchAllRecords;
	private String personIdentifier;
	private String documentOwner;
	private Integer entityId;
	private Boolean isFaculty;
	private String periodStartDate;
	private String periodEndDate;
	private String expirationDate;
	private List<String> adminPersonIds;
	private String entityIdentifier;
	private List<String> opaDisclosureTypes;
	private List<String> freeTextSearchFields;
	private String advancedSearch;

}
