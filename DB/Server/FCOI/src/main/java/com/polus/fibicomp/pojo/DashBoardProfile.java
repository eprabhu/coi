package com.polus.fibicomp.pojo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;


import com.polus.fibicomp.coi.dto.COIFinancialEntityDto;
import com.polus.fibicomp.coi.dto.CoiTravelDashboardDto;
import com.polus.fibicomp.coi.dto.ConsultDisclDashboardDto;
import com.polus.fibicomp.opa.dto.OPADashboardDto;

public class DashBoardProfile {

	private ArrayList<HashMap<String, Object>> dashBoardDetailMap;

	private ArrayList<HashMap<String, Object>> dashBoardResearchSummaryMap;

	private Integer totalServiceRequest;

	private Integer serviceRequestCount;

	private List<Integer> pageNumbers;

//	private PersonDTO personDTO;

	private String encryptedUserName;

//	private List<AwardView> awardViews;
//
//	private List<ProposalView> proposalViews;
//
//	private List<IacucView> iacucViews;
//
//	private List<DisclosureView> disclosureViews;
//
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

	private Integer consultDisclCount;

	private List<Object> data;
	
	List<CoiTravelDashboardDto> travelDashboardViews;

	List<ConsultDisclDashboardDto> consultingDisclDashboardViews;

	List<OPADashboardDto> opaDashboardDto;

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

//	public PersonDTO getPersonDTO() {
//		return personDTO;
//	}
//
//	public void setPersonDTO(PersonDTO personDTO) {
//		this.personDTO = personDTO;
//	}

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

//	public List<AwardView> getAwardViews() {
//		return awardViews;
//	}
//
//	public void setAwardViews(List<AwardView> awardViews) {
//		this.awardViews = awardViews;
//	}
//
//	public List<IacucView> getIacucViews() {
//		return iacucViews;
//	}
//
//	public void setIacucViews(List<IacucView> iacucViews) {
//		this.iacucViews = iacucViews;
//	}
//
//	public List<DisclosureView> getDisclosureViews() {
//		return disclosureViews;
//	}
//
//	public void setDisclosureViews(List<DisclosureView> disclosureViews) {
//		this.disclosureViews = disclosureViews;
//	}
//
//	public List<ExpenditureVolume> getExpenditureVolumes() {
//		return expenditureVolumes;
//	}
//
//	public void setExpenditureVolumes(List<ExpenditureVolume> expenditureVolumes) {
//		this.expenditureVolumes = expenditureVolumes;
//	}
//
//	public List<ResearchSummaryView> getSummaryViews() {
//		return summaryViews;
//	}
//
//	public void setSummaryViews(List<ResearchSummaryView> summaryViews) {
//		this.summaryViews = summaryViews;
//	}
//
//	public List<ResearchSummaryPieChart> getSummaryAwardPieChart() {
//		return summaryAwardPieChart;
//	}
//
//	public void setSummaryAwardPieChart(List<ResearchSummaryPieChart> summaryAwardPieChart) {
//		this.summaryAwardPieChart = summaryAwardPieChart;
//	}
//
//	public List<ResearchSummaryPieChart> getSummaryProposalPieChart() {
//		return summaryProposalPieChart;
//	}
//
//	public void setSummaryProposalPieChart(List<ResearchSummaryPieChart> summaryProposalPieChart) {
//		this.summaryProposalPieChart = summaryProposalPieChart;
//	}
//
//	public List<ResearchSummaryPieChart> getSummaryProposalDonutChart() {
//		return summaryProposalDonutChart;
//	}
//
//	public void setSummaryProposalDonutChart(List<ResearchSummaryPieChart> summaryProposalDonutChart) {
//		this.summaryProposalDonutChart = summaryProposalDonutChart;
//	}
//
//	public List<ResearchSummaryPieChart> getSummaryAwardDonutChart() {
//		return summaryAwardDonutChart;
//	}
//
//	public void setSummaryAwardDonutChart(List<ResearchSummaryPieChart> summaryAwardDonutChart) {
//		this.summaryAwardDonutChart = summaryAwardDonutChart;
//	}
//
//	public List<GrantCall> getGrantCalls() {
//		return grantCalls;
//	}
//
//	public void setGrantCalls(List<GrantCall> grantCalls) {
//		this.grantCalls = grantCalls;
//	}
//
//	public List<Proposal> getProposal() {
//		return proposal;
//	}
//
//	public void setProposal(List<Proposal> proposal) {
//		this.proposal = proposal;
//	}
//
//	public List<UnitAdministrator> getUnitAdministrators() {
//		return unitAdministrators;
//	}
//
//	public void setUnitAdministrators(List<UnitAdministrator> unitAdministrators) {
//		this.unitAdministrators = unitAdministrators;
//	}
//
//	public List<Workflow> getWorkflowList() {
//		return workflowList;
//	}
//
//	public void setWorkflowList(List<Workflow> workflowList) {
//		this.workflowList = workflowList;
//	}
//
//	public List<ProposalView> getProposalViews() {
//		return proposalViews;
//	}
//
//	public void setProposalViews(List<ProposalView> proposalViews) {
//		this.proposalViews = proposalViews;
//	}
//
//	public List<Negotiations> getNegotiationsList() {
//		return negotiationsList;
//	}
//
//	public void setNegotiationsList(List<Negotiations> negotiationsList) {
//		this.negotiationsList = negotiationsList;
//	}
//
//	public List<InstituteProposal> getInstituteProposal() {
//		return instituteProposal;
//	}
//
//	public void setInstituteProposal(List<InstituteProposal> instituteProposal) {
//		this.instituteProposal = instituteProposal;
//	}
//
//	public List<AgreementHeader> getAgreementHeaderList() {
//		return agreementHeaderList;
//	}
//
//	public void setAgreementHeaderList(List<AgreementHeader> agreementHeaderList) {
//		this.agreementHeaderList = agreementHeaderList;
//	}
//
//	public List<ServiceRequest> getServiceRequestList() {
//		return serviceRequestList;
//	}
//
//	public void setServiceRequestList(List<ServiceRequest> serviceRequestList) {
//		this.serviceRequestList = serviceRequestList;
//	}
//
//	public List<FinalEvaluationStatus> getFinalEvaluationStatus() {
//		return finalEvaluationStatus;
//	}
//
//	public void setFinalEvaluationStatus(List<FinalEvaluationStatus> finalEvaluationStatus) {
//		this.finalEvaluationStatus = finalEvaluationStatus;
//	}

	public Boolean getCanCopyAward() {
		return canCopyAward;
	}

	public void setCanCopyAward(Boolean canCopyAward) {
		this.canCopyAward = canCopyAward;
	}

//	public List<Unit> getUnitsWithRights() {
//		return unitsWithRights;
//	}
//
//	public void setUnitsWithRights(List<Unit> unitsWithRights) {
//		this.unitsWithRights = unitsWithRights;
//	}
//
//	public List<AwardView> getProgressReportViews() {
//		return progressReportViews;
//	}
//
//	public void setProgressReportViews(List<AwardView> progressReportViews) {
//		this.progressReportViews = progressReportViews;
//	}
//
//	public List<QuickLink> getQuickLinks() {
//		return quickLinks;
//	}
//
//	public void setQuickLinks(List<QuickLink> quickLinks) {
//		this.quickLinks = quickLinks;
//	}
//
//	public List<UserSelectedWidget> getUserSelectedWidgets() {
//		return userSelectedWidgets;
//	}
//
//	public void setUserSelectedWidgets(List<UserSelectedWidget> userSelectedWidgets) {
//		this.userSelectedWidgets = userSelectedWidgets;
//	}
//
//	public List<WidgetLookup> getWidgetLookups() {
//		return widgetLookups;
//	}
//
//	public void setWidgetLookups(List<WidgetLookup> widgetLookups) {
//		this.widgetLookups = widgetLookups;
//	}
//
//	public UserSelectedWidget getUserSelectedWidget() {
//		return userSelectedWidget;
//	}
//
//	public void setUserSelectedWidget(UserSelectedWidget userSelectedWidget) {
//		this.userSelectedWidget = userSelectedWidget;
//	}

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
	
//	public List<AdminGroup> getAgreementAdminGroups() {
//		return agreementAdminGroups;
//	}
//
//	public void setAgreementAdminGroups(List<AdminGroup> agreementAdminGroups) {
//		this.agreementAdminGroups = agreementAdminGroups;
//	}
//
//	public Set<Person> getPersons() {
//		return persons;
//	}
//
//	public void setPersons(Set<Person> persons) {
//		this.persons = persons;
//	}

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
