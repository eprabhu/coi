import { NavigationService } from './../../common/services/navigation.service';
/** last updated by Greeshma on 04-06-2020 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../dashboard/dashboard.service';

import { fadeDown } from '../../common/utilities/animations';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { getSponsorSearchDefaultValue, fileDownloader, openInNewTab, pageScroll } from '../../common/utilities/custom-utilities';
import { CommonService } from '../../common/services/common.service';
import { InstituteProposalListService } from './institute-proposal-list.service';
import { getEndPointOptionsForSponsor } from '../../common/services/end-point.config';

declare var $: any;
@Component({
	selector: 'app-institute-proposal-list',
	templateUrl: './institute-proposal-list.component.html',
	styleUrls: ['./institute-proposal-list.component.css'],
	animations: [fadeDown]
})
export class InstituteProposalListComponent implements OnInit, OnDestroy {

	isReverse = true;
	isShowResultCard = false;
	isShowAdvanceSearchOptions = false;
	isAdmin: boolean;
	$subscriptions: Subscription[] = [];
	serviceRequestList: any[] = null;
	result: any = {};
	elasticResultObject: any = {};
	elasticSearchOptions: any = {};
	proposalId: number;
	elasticPersonSearchOptions: any = {};
	filterValues: any = {};
	lookupValues: any = {};
	proposalTypeOptions = 'ACTIVITY_TYPE#ACTIVITY_TYPE_CODE#true#true';
	proposalsTypeOptions = 'PROPOSAL_TYPE#TYPE_CODE#true#true';
	proposalTypeColumnName = 'ACTIVITY_TYPE_CODE';
	proposalStatusOptions = 'PROPOSAL_STATUS#STATUS_CODE#true';
	porposalStatusColumnName = 'STATUS_CODE';
	proposalsTypeColumnName = 'TYPE_CODE';
	pageScroll = pageScroll;
	sortMap: any = {};
	sortCountObj: any = {};
	clearFieldFundingAgency: String;
	fundingAgencySearchOptions: any = {};
	isEmployeeFlag = true;
	advSearchClearField: String;
	isSaving = false;
	tempProposalRequestObject = {
		property1: '',
		property2: '',
		property3: [],
		property4: [],
		property5: '',
		property6: '',
		property7: [],
		fullName: ''
	};
	modalHeaderIPDetails: any = {};
	modalIPVersions: any = [];

	constructor(private _router: Router,
		public _insitutelistService: InstituteProposalListService, private _elasticConfig: ElasticConfigService,
		public _commonService: CommonService, private _navigationService: NavigationService) { }

	ngOnInit() {
		this.setSortProperties();
		this.elasticSearchOptions = this._elasticConfig.getElasticForIP();
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
		this.fundingAgencySearchOptions = getEndPointOptionsForSponsor();
		if (!this._navigationService.previousURL.includes('fibi/instituteproposal')) {
			this._insitutelistService.proposalRequestServiceObject.sortBy = '';
			this._insitutelistService.proposalRequestServiceObject.sort = {};
		}
		this.checkForAdvanceSearch();
		this.loadDashboard();

	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/** Check if previous url includes fibi/instituteproposal, if not then clear Advanced Search fields */
	checkForAdvanceSearch() {
		if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/instituteproposal')) {
			this.fetchDashboardDataToTempObject();
			this.setDefaultValueForCustomLibrarySearch();
			this.generateLookupArrayForDropdown();
			this._insitutelistService.proposalRequestServiceObject.advancedSearch = 'A';
			document.getElementById('collapseInstituteProposal').classList.add('show');
		} else {
			this.clearAdvanceSearchField();
			this.resetSortProperties();
		}
	}

	/** temparory object is used other than using the same service object here because
	  * If user provide a field in Advanced Search and without clicking on search button user choose a record from the list,
	  * In this case when clicks on back icon and comes to dashboard list, previously done search list result should be displayed.
	  * Logic : save new search criteria only if search button is clicked.
	  */
	fetchDashboardDataToTempObject() {
		this.tempProposalRequestObject.property1 = this._insitutelistService.proposalRequestServiceObject.property1 ?
			this._insitutelistService.proposalRequestServiceObject.property1 : '';
		this.tempProposalRequestObject.property2 = this._insitutelistService.proposalRequestServiceObject.property2 ?
			this._insitutelistService.proposalRequestServiceObject.property2 : '';
		this.tempProposalRequestObject.property3 = this._insitutelistService.proposalRequestServiceObject.property3.length > 0 ?
			this._insitutelistService.proposalRequestServiceObject.property3 : [];
		this.tempProposalRequestObject.property4 = this._insitutelistService.proposalRequestServiceObject.property4.length > 0 ?
			this._insitutelistService.proposalRequestServiceObject.property4 : [];
		this.tempProposalRequestObject.property5 = this._insitutelistService.proposalRequestServiceObject.property5 ?
			this._insitutelistService.proposalRequestServiceObject.property5 : '';
		this.tempProposalRequestObject.property6 = this._insitutelistService.proposalRequestServiceObject.property6 ?
			this._insitutelistService.proposalRequestServiceObject.property6 : '';
		this.tempProposalRequestObject.property7 = this._insitutelistService.proposalRequestServiceObject.property7.length > 0 ?
			this._insitutelistService.proposalRequestServiceObject.property7 : [];
		this.tempProposalRequestObject.fullName = this._insitutelistService.proposalRequestExtraData.fullName ?
			this._insitutelistService.proposalRequestExtraData.fullName : '';
		this.isEmployeeFlag = this._insitutelistService.proposalRequestExtraData.isEmployeeflag;
		(this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
	}

	isAdvancedSearchMade() {
		if (this._insitutelistService.proposalRequestServiceObject.property1 ||
			this._insitutelistService.proposalRequestServiceObject.property2 ||
			this._insitutelistService.proposalRequestServiceObject.property3.length ||
			this._insitutelistService.proposalRequestServiceObject.property4.length ||
			this._insitutelistService.proposalRequestServiceObject.property5 ||
			this._insitutelistService.proposalRequestServiceObject.property6 ||
			this._insitutelistService.proposalRequestServiceObject.property7.length) {
			return true;
		} else {
			return false;
		}
	}

	/* Setting default value for end-point, elastic search, so to display in UI. */
	setDefaultValueForCustomLibrarySearch() {
		this.fundingAgencySearchOptions.defaultValue = this._insitutelistService.sponsorAdvanceSearchDefaultValue;
		this.elasticPersonSearchOptions.defaultValue = this._insitutelistService.proposalRequestExtraData.fullName;
	}

	generateLookupArrayForDropdown() {
		if (this._insitutelistService.proposalRequestServiceObject.property3.length) {
			this.generateLookupArray(this._insitutelistService.proposalRequestServiceObject.property3, 'property3');
		}
		if (this._insitutelistService.proposalRequestServiceObject.property4.length) {
			this.generateLookupArray(this._insitutelistService.proposalRequestServiceObject.property4, 'property4');
		}
		if (this._insitutelistService.proposalRequestServiceObject.property7.length) {
			this.generateLookupArray(this._insitutelistService.proposalRequestServiceObject.property7, 'property7');
		}
	}

	generateLookupArray(property, propertyNumber) {
		this.lookupValues[propertyNumber] = [];
		property.forEach(element => {
			this.lookupValues[propertyNumber].push({ code: element });
		});
	}

	/** fetch institute proposal list */
	loadDashboard() {
		this.$subscriptions.push(this._insitutelistService.getInstituteProposalDashBoardList
			(this._insitutelistService.proposalRequestServiceObject).subscribe(data => {
				this.result = data || [];
				if (this.result !== null) {
					this.serviceRequestList = this.result.instituteProposal;
				}
			}));
	}

	actionsOnPageChange(event) {
		this._insitutelistService.proposalRequestServiceObject.currentPage = event;
		this.loadDashboard();
		pageScroll('pageScrollToTop');
	}
	/** show and hide advance search feature
	 * @param event
	 */
	showAdvanceSearch(event: any) {
		event.preventDefault();
		this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
	}

	/** searches using advance search options */
	searchUsingAdvanceOptions() {
		/* close elastic search result if it is open */
		if (this.isShowResultCard === true) {
			this.isShowResultCard = false;
		}
		if (this.isAdvancedSearchMade()) {
			this._insitutelistService.proposalRequestServiceObject.advancedSearch = 'A';
		} else {
			this._insitutelistService.proposalRequestServiceObject.advancedSearch = 'L';
		}
		this.loadDashboard();
	}

	setAdvanceSearchValuesToServiceObject() {
		this._insitutelistService.proposalRequestServiceObject.property1 = this.tempProposalRequestObject.property1 || '';
		this._insitutelistService.proposalRequestServiceObject.property2 = this.tempProposalRequestObject.property2 || '';
		this._insitutelistService.proposalRequestServiceObject.property3 = this.tempProposalRequestObject.property3;
		this._insitutelistService.proposalRequestServiceObject.property4 = this.tempProposalRequestObject.property4;
		this._insitutelistService.proposalRequestServiceObject.property5 = this.tempProposalRequestObject.property5 || '';
		this._insitutelistService.proposalRequestServiceObject.property6 = this.tempProposalRequestObject.property6 || '';
		this._insitutelistService.proposalRequestServiceObject.property7 = this.tempProposalRequestObject.property7;
		this._insitutelistService.proposalRequestExtraData.fullName = this.tempProposalRequestObject.fullName || '';
		this._insitutelistService.proposalRequestExtraData.isEmployeeflag = this.isEmployeeFlag;
	}

	clearAdvanceSearchField() {
		this._insitutelistService.proposalRequestServiceObject.property1 = '';
		this._insitutelistService.proposalRequestServiceObject.property2 = '';
		this._insitutelistService.proposalRequestServiceObject.property3 = [];
		this._insitutelistService.proposalRequestServiceObject.property4 = [];
		this._insitutelistService.proposalRequestServiceObject.property5 = '';
		this._insitutelistService.proposalRequestServiceObject.property6 = '';
		this._insitutelistService.sponsorAdvanceSearchDefaultValue = '';
		this._insitutelistService.proposalRequestServiceObject.property7 = [];
		this.advSearchClearField = new String('true');
		this.lookupValues = [];
		this._insitutelistService.proposalRequestExtraData.fullName = '';
		this.clearFundungAgencyForAdancedSearch();
		this.tempProposalRequestObject.property1 = '';
		this.tempProposalRequestObject.property2 = '';
		this.tempProposalRequestObject.property3 = [];
		this.tempProposalRequestObject.property4 = [];
		this.tempProposalRequestObject.property5 = '';
		this.tempProposalRequestObject.property6 = '';
		this.tempProposalRequestObject.property7 = [];
		this.tempProposalRequestObject.fullName = '';
		this._insitutelistService.proposalRequestServiceObject.advancedSearch = 'L';
		this.isEmployeeFlag = true;
		this.setElasticPersonOption();
	}

	/** select a result from elastic search
	 * @param value
	 */
	selectProposalElasticResult(value) {
		if (value) {
			this.isShowResultCard = true;
			this.elasticResultObject = value;
		} else {
			this.isShowResultCard = false;
			this.elasticResultObject = {};
		}
	}

	/** sends boolean value to elastic component - when clearing the elatic input result card also vanishes
   * @param $event
   */
	receiveResultCard($event) {
		this.isShowResultCard = $event;
	}

	/** sorts results based on fields
	 * @param sortFieldBy
	 */
	sortResult(sortFieldBy) {
		this.sortCountObj[sortFieldBy]++;
		this._insitutelistService.proposalRequestServiceObject.sortBy = sortFieldBy;
		if (this.sortCountObj[sortFieldBy] < 3) {
			if (this._insitutelistService.proposalRequestServiceObject.sortBy === sortFieldBy) {
				this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
			}
		} else {
			this.sortCountObj[sortFieldBy] = 0;
			delete this.sortMap[sortFieldBy];
		}
		this._insitutelistService.proposalRequestServiceObject.sort = this.sortMap;
		this._insitutelistService.sortCountObj = this.sortCountObj;
		this.loadDashboard();
	}
	setSortProperties() {
		this.resetSortProperties();
		this.sortCountObj = (Object.entries(this._insitutelistService.sortCountObj).length === 0) ?
			this.sortCountObj : this._insitutelistService.sortCountObj;
		this.sortMap = (Object.entries(this._insitutelistService.proposalRequestServiceObject.sort).length === 0) ?
			this.sortMap : this._insitutelistService.proposalRequestServiceObject.sort;
	}

	resetSortProperties() {
		this.sortCountObj = {
			'proposalNumber': 0, 'title': 0, 'instProposalPersons.fullName': 0, 'instProposalStatus.description': 0,
			'activityType': 0, 'instProposalType.description': 0, 'sponsorName': 0, 'submissionDate': 0
		};
		this.sortMap = {};
	}
	setFundungAgencyForAdancedSearch(event) {
		this._insitutelistService.sponsorAdvanceSearchDefaultValue = event ? getSponsorSearchDefaultValue(event) : '';
		this.tempProposalRequestObject.property6 = event ? event.sponsorCode : null;
	}
	clearFundungAgencyForAdancedSearch() {
		this._insitutelistService.proposalRequestServiceObject.property6 = null;
		this._insitutelistService.sponsorAdvanceSearchDefaultValue = '';
		this.clearFieldFundingAgency = new String('true');
	}

	viewInstProposalById(proposalDetails) {
		this.modalHeaderIPDetails = proposalDetails;
		const REQ_BODY = {
			proposalNumber: proposalDetails.proposalNumber,
			leadUnitNumber: proposalDetails.homeUnitNumber
		};
		this.$subscriptions.push(this._insitutelistService.getIPVersionsDetails(REQ_BODY).subscribe((data: any) => {
			this.modalIPVersions = data || [];
			const pendingIPVersions = this.modalIPVersions.instProposalSummaryDetails.filter(ele => ele.proposalSequenceStatus === 'PENDING' );
			if (pendingIPVersions.length) {
				$('#newVersionAlreadyExist').modal('show');
			} else {
				openInNewTab('instituteproposal/overview?', ['instituteProposalId'], [proposalDetails.proposalId]);
			}
		}));
	}

	/**
   * @param  {} event
   * if a person is employee then sets prncpl_id  to the json object otherwise sets rolodex_id.
   */
	selectedFilter(event) {
		this.tempProposalRequestObject.property5 = event ? this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id : '';
		this.tempProposalRequestObject.fullName = event ? event.full_name : '';
	}
	/** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
	changeMemberType() {
		this.advSearchClearField = new String('true');
		this.elasticPersonSearchOptions.defaultValue = '';
		(this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
	}
	/**setElasticPersonOption - Set Elastic search option for Fibi Person */
	setElasticPersonOption() {
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
	}

	/**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
	setElasticRolodexOption() {
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForRolodex();
	}

	/** export institute proposal data as excel sheet or pdf
	 * @param docType
	 */
	exportAsTypeDoc(docType) {
		if (!this.isSaving) {
			this.isSaving = true;
			const exportDataReqObject = {
				property1: this._insitutelistService.proposalRequestServiceObject.property1,
				property2: this._insitutelistService.proposalRequestServiceObject.property2,
				property3: this._insitutelistService.proposalRequestServiceObject.property3,
				property4: this._insitutelistService.proposalRequestServiceObject.property4,
				property5: this._insitutelistService.proposalRequestServiceObject.property5,
				property6: this._insitutelistService.proposalRequestServiceObject.property6,
				property7: this._insitutelistService.proposalRequestServiceObject.property7,
				documentHeading: 'Institute Proposal',
				sortBy: this._insitutelistService.proposalRequestServiceObject.sortBy,
				sort: this._insitutelistService.proposalRequestServiceObject.sort,
				advancedSearch: 'L',
				tabName: 'ALL_PROPOSALS',
				exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
			};
			exportDataReqObject.advancedSearch = this._insitutelistService.proposalRequestServiceObject.advancedSearch;
			this.$subscriptions.push(this._insitutelistService.exportInstiuteProposalDashboardDatas(exportDataReqObject).subscribe(
				data => {
					let fileName = '';
					fileName = exportDataReqObject.documentHeading;
					fileDownloader(data.body, fileName.toLowerCase(), exportDataReqObject.exportType);
					this.isSaving = false;
				}, err => { this.isSaving = false; }));
		}
	}

	setCurrentProposalTab() {
		localStorage.setItem('currentTab', 'INSTITUTE_PROPOSAL');
	}

	emptyValidationKeyup(event) {
		if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
			this.tempProposalRequestObject.property5 = '';
		}
	}
	/**
	  * @param  {} data
	  * @param  {} template
	  * to get the values of the lookups in advanced search which returns string value
	  */
	onLookupSelect(data, template) {
		this.lookupValues[template] = data;
		this.tempProposalRequestObject[template] = data.length ? data.map(d => d.code) : [];
	}
	/**
	 * @param  {} data
	 * @param  {} template
	 * to get the values of the lookups in advanced search which retutrns integer values
	 */
	onLookupSelectIntegerValues(data, template) {
		this.lookupValues[template] = data;
		this.tempProposalRequestObject[template] = data.length ? data.map(d => d.code) : [];
	}

	openIPInNewTab(proposalId) {
		$('#newVersionAlreadyExist').modal('hide');
		openInNewTab('instituteproposal/overview?', ['instituteProposalId'], [proposalId]);
	}

}
