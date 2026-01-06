package com.polus.fibicomp.coi.vo;

import com.polus.fibicomp.coi.dto.COIFinancialEntityDto;
import com.polus.fibicomp.coi.dto.CoiTravelDashboardDto;
import com.polus.fibicomp.coi.dto.ConsultDisclDashboardDto;
import com.polus.fibicomp.opa.dto.OPADashboardDto;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class DashBoardProfile {

	private ArrayList<HashMap<String, Object>> dashBoardDetailMap;

	private ArrayList<HashMap<String, Object>> dashBoardResearchSummaryMap;

	private Integer totalServiceRequest;

	private Integer serviceRequestCount;

	private List<Integer> pageNumbers;

//	private PersonDTO personDTO;

	private String encryptedUserName;

//	private List<AwardView> awardViews;

	private List<ProposalView> proposalViews;

//	private List<IacucView> iacucViews;

	private List<DisclosureView> disclosureViews;

//	private List<ExpenditureVolume> expenditureVolumes;
//
//	private List<ResearchSummaryView> summaryViews;
//
//	private List<ResearchSummaryPieChart> summaryAwardPieChart;
//
//	private List<ResearchSummaryPieChart> summaryProposalPieChart;
//
//	private List<ResearchSummaryPieChart> summaryProposalDonutChart;
//
//	private List<ResearchSummaryPieChart> summaryAwardDonutChart;
//
//	private List<GrantCall> grantCalls;
//
//	private List<Proposal> proposal;
//
//	private List<UnitAdministrator> unitAdministrators;
//
//	private List<Workflow> workflowList;
//
//	private List<Negotiations> negotiationsList;
//
//	private List<InstituteProposal> instituteProposal;
//
//	private List<AgreementHeader> agreementHeaderList;
//
//	private List<ServiceRequest> serviceRequestList;
//
//	private List<FinalEvaluationStatus> finalEvaluationStatus;
//
//	private List<Unit> unitsWithRights;

	private Boolean canCopyAward = false;
	
//	private List<AwardView> progressReportViews;
//
//	private List<QuickLink> quickLinks;
//
//	private List<UserSelectedWidget> userSelectedWidgets;
//
//	private List<WidgetLookup> widgetLookups;
//
//	private UserSelectedWidget userSelectedWidget;

	private List<Object[]> widgetDatas;

	private Boolean isGrantcallAbbrevationRequired = false;

	private Boolean isBudgetVersionEnabled = Boolean.FALSE;
	
//	private Set<Person> persons;
//
//	private List<AdminGroup> agreementAdminGroups;

	private Integer inProgressCount;

	private Integer newSubmissionCount;

	private Integer allAgreementCount;

	private Integer allPendingAgreementCount;

	private Integer myPendingAgreementCount;

	private Integer adminInProgressCount;

	private List<Object[]> agreementView;

	private Integer disclosureCount;

	private List<COIFinancialEntityDto> coiFinancialEntityList;

	private Integer coiFinancialEntityListCount;

	private Integer count;
	
	private Integer travelDisclosureCount;

	private List<Object> data;
	
	List<CoiTravelDashboardDto> travelDashboardViews;

	List<OPADashboardDto> opaDashboardDto;

	List<ConsultDisclDashboardDto> consultingDisclDashboardViews;

	private Integer consultDisclCount;

	public List<CoiTravelDashboardDto> getTravelDashboardViews() {
		return travelDashboardViews;
	}

	public void setTravelDashboardViews(List<CoiTravelDashboardDto> travelDashboardViews) {
		this.travelDashboardViews = travelDashboardViews;
	}

	public Integer getTravelDisclosureCount() {
		return travelDisclosureCount;
	}

	public void setTravelDisclosureCount(Integer travelDisclosureCount) {
		this.travelDisclosureCount = travelDisclosureCount;
	}

	public DashBoardProfile() {
	}

	public DashBoardProfile(Integer count, List<Object> data) {
		this.count = count;
		this.data = data;
	}

	public ArrayList<HashMap<String, Object>> getDashBoardDetailMap() {
		return dashBoardDetailMap;
	}

	public void setDashBoardDetailMap(ArrayList<HashMap<String, Object>> dashBoardDetailMap) {
		this.dashBoardDetailMap = dashBoardDetailMap;
	}

	public Integer getTotalServiceRequest() {
		return totalServiceRequest;
	}

	public void setTotalServiceRequest(Integer totalServiceRequest) {
		this.totalServiceRequest = totalServiceRequest;
	}

	public Integer getServiceRequestCount() {
		return serviceRequestCount;
	}

	public void setServiceRequestCount(Integer serviceRequestCount) {
		this.serviceRequestCount = serviceRequestCount;
	}

	public List<Integer> getPageNumbers() {
		return pageNumbers;
	}

	public void setPageNumbers(List<Integer> pageNumbers) {
		this.pageNumbers = pageNumbers;
	}

	public ArrayList<HashMap<String, Object>> getDashBoardResearchSummaryMap() {
		return dashBoardResearchSummaryMap;
	}

	public void setDashBoardResearchSummaryMap(ArrayList<HashMap<String, Object>> dashBoardResearchSummaryMap) {
		this.dashBoardResearchSummaryMap = dashBoardResearchSummaryMap;
	}

	public String getEncryptedUserName() {
		return encryptedUserName;
	}

	public void setEncryptedUserName(String encryptedUserName) {
		this.encryptedUserName = encryptedUserName;
	}

	public List<DisclosureView> getDisclosureViews() {
		return disclosureViews;
	}

	public void setDisclosureViews(List<DisclosureView> disclosureViews) {
		this.disclosureViews = disclosureViews;
	}


	public List<ProposalView> getProposalViews() {
		return proposalViews;
	}

	public void setProposalViews(List<ProposalView> proposalViews) {
		this.proposalViews = proposalViews;
	}

	public Boolean getCanCopyAward() {
		return canCopyAward;
	}

	public void setCanCopyAward(Boolean canCopyAward) {
		this.canCopyAward = canCopyAward;
	}

	public List<Object[]> getWidgetDatas() {
		return widgetDatas;
	}

	public void setWidgetDatas(List<Object[]> widgetDatas) {
		this.widgetDatas = widgetDatas;
	}

	public Boolean getIsGrantcallAbbrevationRequired() {
		return isGrantcallAbbrevationRequired;
	}

	public void setIsGrantcallAbbrevationRequired(Boolean isGrantcallAbbrevationRequired) {
		this.isGrantcallAbbrevationRequired = isGrantcallAbbrevationRequired;
	}

	public Boolean getIsBudgetVersionEnabled() {
		return isBudgetVersionEnabled;
	}

	public void setIsBudgetVersionEnabled(Boolean isBudgetVersionEnabled) {
		this.isBudgetVersionEnabled = isBudgetVersionEnabled;
	}

	public Integer getInProgressCount() {
		return inProgressCount;
	}

	public void setInProgressCount(Integer inProgressCount) {
		this.inProgressCount = inProgressCount;
	}

	public Integer getNewSubmissionCount() {
		return newSubmissionCount;
	}

	public void setNewSubmissionCount(Integer newSubmissionCount) {
		this.newSubmissionCount = newSubmissionCount;
	}

	public Integer getAllAgreementCount() {
		return allAgreementCount;
	}

	public void setAllAgreementCount(Integer allAgreementCount) {
		this.allAgreementCount = allAgreementCount;
	}

	public Integer getAllPendingAgreementCount() {
		return allPendingAgreementCount;
	}

	public void setAllPendingAgreementCount(Integer allPendingAgreementCount) {
		this.allPendingAgreementCount = allPendingAgreementCount;
	}

	public Integer getMyPendingAgreementCount() {
		return myPendingAgreementCount;
	}

	public void setMyPendingAgreementCount(Integer myPendingAgreementCount) {
		this.myPendingAgreementCount = myPendingAgreementCount;
	}

	public Integer getAdminInProgressCount() {
		return adminInProgressCount;
	}

	public void setAdminInProgressCount(Integer adminInProgressCount) {
		this.adminInProgressCount = adminInProgressCount;
	}

	public List<Object[]> getAgreementView() {
		return agreementView;
	}

	public void setAgreementView(List<Object[]> agreementView) {
		this.agreementView = agreementView;
	}

	public Integer getDisclosureCount() {
		return disclosureCount;
	}

	public void setDisclosureCount(Integer disclosureCount) {
		this.disclosureCount = disclosureCount;
	}

	public List<COIFinancialEntityDto> getCoiFinancialEntityList() {
		return coiFinancialEntityList;
	}

	public void setCoiFinancialEntityList(List<COIFinancialEntityDto> coiFinancialEntityList) {
		this.coiFinancialEntityList = coiFinancialEntityList;
	}

	public Integer getCoiFinancialEntityListCount() {
		return coiFinancialEntityListCount;
	}

	public void setCoiFinancialEntityListCount(Integer coiFinancialEntityListCount) {
		this.coiFinancialEntityListCount = coiFinancialEntityListCount;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}

	public List<Object> getData() {
		return data;
	}

	public void setData(List<Object> data) {
		this.data = data;
	}

	public List<OPADashboardDto> getOpaDashboardDto() {
		return opaDashboardDto;
	}

	public void setOpaDashboardDto(List<OPADashboardDto> opaDashboardDto) {
		this.opaDashboardDto = opaDashboardDto;
	}

	public List<ConsultDisclDashboardDto> getConsultingDisclDashboardViews() {
		return consultingDisclDashboardViews;
	}

	public void setConsultingDisclDashboardViews(List<ConsultDisclDashboardDto> consultingDisclDashboardViews) {
		this.consultingDisclDashboardViews = consultingDisclDashboardViews;
	}

	public Integer getConsultDisclCount() {
		return consultDisclCount;
	}

	public void setConsultDisclCount(Integer consultDisclCount) {
		this.consultDisclCount = consultDisclCount;
	}
}
