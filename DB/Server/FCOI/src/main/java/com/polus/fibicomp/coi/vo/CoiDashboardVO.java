package com.polus.fibicomp.coi.vo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.Pattern;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoiDashboardVO {

	private Integer id;

	private Integer pageNumber;

	private Integer currentPage;

	@Pattern(regexp="^$|[0-9a-zA-Z _]*$", message="personId must not include special characters.")
	private String personIdentifier;

	@Pattern(regexp="^$|[0-9a-zA-Z _]*$", message="tab name must not include special characters except '-' and '_'.")
	private String tabName;

	private Map<@Pattern(regexp="^$|[a-zA-Z\\.]+$", message="Sort key must not include special characters.") String, @Pattern(regexp="^$|[a-zA-Z]+$", message="Sort value must not include special characters.") String> sort = new HashMap<>();

	private Boolean isDownload;

	@Pattern(regexp="^$|[AL]+$", message="advancedSearch must not include special characters.")
	private String advancedSearch = "L";

	private String exportType;

	private String documentHeading;

	@Pattern(regexp="^$|[0-9 -]*$", message="Disclosure Number must not include special characters.")
	private String property1;

	private String property2;

	@Pattern(regexp="^$|[0-9a-zA-Z ]+$", message="home Unit must not include special characters.")
	private String property3;

	private List<@Pattern(regexp="^$|[0-9]*$", message="Disclosure Status must not include special characters.") String> property4;

	private List<@Pattern(regexp="^$|[0-9]*$", message="Disclosure Category Type must not include special characters.") String> property5;

	private String property6;

	private String property7;

	private String property8;

	private String property9;

	private List<String> property10;

	private String property11;

	private String property12;

	private String property13;

	private String property14;

	private Boolean property15;

	private String property16;

	private Boolean property17;

	private Boolean property18;

	private Boolean property19;
	
	private String filterType;

	private List<@Pattern(regexp="^$|[0-9]*$", message="Disposition Status must not include special characters.") String> property20;

	private List<@Pattern(regexp="^$|[0-9]*$", message="Review Status must not include special characters.") String> property21;

	private List<@Pattern(regexp="^$|[0-9]*$", message="Conflict Status must not include special characters.") String> property22;

	private String property23;

	private String property24;
	
	private String property25;
	
	private String property26;

	private Map<String, Boolean> fieldSortOrders;

	private Map<String, Object> fieldSortDefaultValues;

	private String documentOwner;

	private String accountNumber;

	private String piPersonIdentifier;

	private String searchKeyword;

	private Boolean isUnlimited;

	private List<String> coiSubmissionStatus;
	
	private List<String> freeTextSearchFields;
	
	@Pattern(regexp="^$|[0-9a-zA-Z _]*$", message="personId must not include special characters.")
	private String caPersonIdentifier;

}
