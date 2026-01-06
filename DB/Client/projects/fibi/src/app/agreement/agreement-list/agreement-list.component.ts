import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { pageScroll, setFocusToElement } from '../../common/utilities/custom-utilities';
import { switchMap } from 'rxjs/operators';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { compareDatesWithoutTimeZone, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { AgreementService } from '../../agreement/agreement.service';
import { environment } from '../../../environments/environment';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { NavigationService } from '../../common/services/navigation.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { AgreementListService } from './agreement-list.service';
import { getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import {concatUnitNumberAndUnitName} from "../../common/utilities/custom-utilities"
declare var $: any;

@Component({
	selector: 'app-agreement-list',
	templateUrl: './agreement-list.component.html',
	styleUrls: ['./agreement-list.component.css'],
	animations: [fadeDown]
})
export class AgreementListComponent implements OnInit, OnDestroy {

	$agreementList = new Subject();
	$subscriptions: Subscription[] = [];
	isAgreementCompletion = false;
	isAssignLocation = false;
	agreementList: any = [];
	isCreateAgreement = false;
	agreementTypeOptions = 'AGREEMENT_TYPE#AGREEMENT_TYPE_CODE#true#true';
	agreementStatusOptions = 'AGREEMENT_STATUS#AGREEMENT_STATUS_CODE#true';
	agreementReviewStatusOptions = 'AGREEMENT_WORKFLOW_STATUS#WORKFLOW_STATUS_CODE#true';
	organizationTypeStatusOptions = 'SPONSOR_TYPE#SPONSOR_TYPE_CODE#true#true';
	adminGroupTypeOptions = 'AGREEMENT_ADMIN_GROUPS#ADMIN_GROUP_ID#true#true';
	datePlaceHolder = DEFAULT_DATE_FORMAT;
	setFocusToElement = setFocusToElement;
	lookupValues: any = {};
	clearLeadUnitField;
	clearAdminField;
	unitHttpOptions: any = {};
	elasticSearchOptions: any = {};
	elasticSearchOptionsPI: any = {};
	advSearchClearField: String;
	isReverse = true;
	result: any;
	isNDAAdministrator = false;
	isAgreementAdministrator = false;
	agreementID: Number;
	isShowCopyWarningModal = false;
	clearAgreementField: String;
	isShowResultCard = false;
	elasticResultObject: any = {};
	agreementElasticSearchOptions: any = {};
	pageCount: Number;
	isHideAgreementList = true;
	clearField;
	roleType: any;
	assignObject: any = {
		agreementPeople: {}
	};
	adminSearchOptions: any = {};
	isRoleTypeChanged = false;
	assignAdminMap = new Map();
	isAssigntoMe = false;
	map = new Map();
	agreementResult: any;
	negotiationLookUp: any;
	clearModalValue: any;
	deployMap = environment.deployUrl;
	adminGroupSearchOptions: any = {};
	clearAdminGroupField: any;
	isShowWarningMessage = false;
	warningMessage: any;
	tempagreementRequestObject = {
		property1: '',
		property2: '',
		property3: [],
		property4: [],
		property5: '',
		property6: [],
		property7: '',
		property8: '',
		property9: '',
		property10: '',
		property14: [],
		property15: [],
		property16: '',
		property17: '',
		property18: '',
		property19: '',
		property20: [],
		requestorName: '',
		piName: '',
		negotiatorName: '',
		unitName: '',
		adminName: ''
	};
	isGroupAdministrator = false;
	isShowCreateButton = false;
	personType = 'EMPLOYEE';
	clearPiField: String;
	isShowActivityModal = false;
	concatUnitNumberAndUnitName=concatUnitNumberAndUnitName;

	constructor(
		public _agreementList: AgreementListService, public _commonService: CommonService,
		private _router: Router, private _elasticConfig: ElasticConfigService, private _navigationService: NavigationService,
		private _agreementService: AgreementService, public _researchSummaryConfigService: ResearchSummaryConfigService) { }

	async ngOnInit() {
		this._researchSummaryConfigService.isResearchSummary = false;
		this.setDashboardTab();
		this.setSearchOptions();
		if (!this._navigationService.previousURL.includes('fibi/agreement')) {
			this._agreementList.agreementRequestObject.sortBy = '';
		}
		this.checkForAdvanceSearch();
		this.getPermissions();
		this.getAgreementListData();
		this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
		this.isGroupAdministrator = await this._commonService.checkPermissionAllowed('VIEW_ADMIN_GROUP_AGREEMENT');
		this.isHideAgreementList = (this.isAgreementAdministrator || this.isGroupAdministrator) ? true : false;
		this.openAllAgreements();
	}

	setSearchOptions() {
		this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
		this.elasticSearchOptionsPI = this._elasticConfig.getElasticForPerson();
		this.agreementElasticSearchOptions = this._elasticConfig.getElasticForAgreement();
		this.unitHttpOptions = getEndPointOptionsForDepartment();
	}

	/**
	 * Check whether advance serch is done and previous url has fibi/agreement, if not
	 * then clear advance search fields.
	 */
	checkForAdvanceSearch() {
		this._agreementList.agreementRequestObject.currentPage = 1;
		if (this.isAdvancedSearchDone() && this._navigationService.previousURL.includes('fibi/agreement')) {
			document.getElementById('collapseListAgreement').classList.add('show');
			this.fetchTempRequestObject();
			this.generateLookupArrayForDropdown();
			this.setDefaultSearchOptions();
			this._agreementList.agreementRequestObject.advancedSearch = 'A';
			this.$agreementList.next();
		} else {
			document.getElementById('collapseListAgreement').classList.remove('show');
			this.clearAdvanceSearchField();
			if (this._agreementList.agreementRequestObject.tabName !== 'ALL_AGREEMENTS') { this.$agreementList.next(); }
		}
	}


	/** temparory object is used other than using the same service object here because
	 * If user provide a field in Advanced Search and without clicking on search button user choose a record from the list,
	 * In this case when clicks on back icon and comes to dashboard list, previously done search list result should be displayed.
	 * Logic : save new search criteria only if search button is clicked.
	*/
	fetchTempRequestObject() {
		this.tempagreementRequestObject.property1 = this._agreementList.agreementRequestObject.property1 ?
			this._agreementList.agreementRequestObject.property1 : '';
		this.tempagreementRequestObject.property2 = this._agreementList.agreementRequestObject.property2 ?
			this._agreementList.agreementRequestObject.property2 : '';
		this.tempagreementRequestObject.property3 = this._agreementList.agreementRequestObject.property3 ?
			this._agreementList.agreementRequestObject.property3 : [];
		this.tempagreementRequestObject.property4 = this._agreementList.agreementRequestObject.property4.length > 0 ?
			this._agreementList.agreementRequestObject.property4 : [];
		this.tempagreementRequestObject.property5 = this._agreementList.agreementRequestObject.property5 ?
			this._agreementList.agreementRequestObject.property5 : '';
		this.tempagreementRequestObject.property6 = this._agreementList.agreementRequestObject.property6.length > 0 ?
			this._agreementList.agreementRequestObject.property6 : [];
		this.tempagreementRequestObject.property7 = this._agreementList.agreementRequestObject.property7 ?
			this._agreementList.agreementRequestObject.property7 : '';
		this.tempagreementRequestObject.property8 = this._agreementList.agreementRequestObject.property8 ?
			this._agreementList.agreementRequestObject.property8 : '';
		this.tempagreementRequestObject.property9 = this._agreementList.agreementRequestObject.property9 ?
			this._agreementList.agreementRequestObject.property9 : '';
		this.tempagreementRequestObject.property10 = this._agreementList.agreementRequestObject.property10 ?
			this._agreementList.agreementRequestObject.property10 : '';
		this.tempagreementRequestObject.property14 = this._agreementList.agreementRequestObject.property14.length > 0 ?
			this._agreementList.agreementRequestObject.property14 : [];
		this.tempagreementRequestObject.property15 = this._agreementList.agreementRequestObject.property15.length > 0 ?
			this._agreementList.agreementRequestObject.property15 : [];
		this.tempagreementRequestObject.property16 = this._agreementList.agreementRequestObject.property16 ?
			this._agreementList.agreementRequestObject.property16 : '';
		this.tempagreementRequestObject.property17 = this._agreementList.agreementRequestObject.property17 ?
			this._agreementList.agreementRequestObject.property17 : '';
		this.tempagreementRequestObject.property18 = this._agreementList.agreementRequestObject.property18 ?
			this._agreementList.agreementRequestObject.property18 : '';
		this.tempagreementRequestObject.property19 = this._agreementList.agreementRequestObject.property19 ?
			this._agreementList.agreementRequestObject.property19 : '';
		this.tempagreementRequestObject.property20 = this._agreementList.agreementRequestObject.property20 ?
			this._agreementList.agreementRequestObject.property20 : [];
		this.tempagreementRequestObject.unitName = this._agreementList.nameObject.unitName ?
			this._agreementList.nameObject.unitName : '';
		this.tempagreementRequestObject.requestorName = this._agreementList.nameObject.requestorName ?
			this._agreementList.nameObject.requestorName : '';
		this.tempagreementRequestObject.adminName = this._agreementList.nameObject.adminName ?
			this._agreementList.nameObject.adminName : '';
		this.tempagreementRequestObject.negotiatorName = this._agreementList.nameObject.negotiatorName ?
			this._agreementList.nameObject.requestorName : '';
		this.tempagreementRequestObject.piName = this._agreementList.nameObject.piName ?
			this._agreementList.nameObject.piName : '';
		this.personType = this._agreementList.nameObject.personType;
		this.setElasticSearchOptions();
	}

	/**
	 * check whether advance search fields have value.
	 */
	isAdvancedSearchDone() {
		if (this._agreementList.agreementRequestObject.property1 ||
			this._agreementList.agreementRequestObject.property2 ||
			this._agreementList.agreementRequestObject.property3.length ||
			this._agreementList.agreementRequestObject.property4.length ||
			this._agreementList.agreementRequestObject.property5 ||
			this._agreementList.agreementRequestObject.property6.length ||
			this._agreementList.agreementRequestObject.property7 ||
			this._agreementList.agreementRequestObject.property8 ||
			this._agreementList.agreementRequestObject.property9 ||
			this._agreementList.agreementRequestObject.property10 ||
			this._agreementList.agreementRequestObject.property14.length ||
			this._agreementList.agreementRequestObject.property15.length ||
			this._agreementList.agreementRequestObject.property16 ||
			this._agreementList.agreementRequestObject.property17 ||
			this._agreementList.agreementRequestObject.property18 ||
			this._agreementList.agreementRequestObject.property19 ||
			this._agreementList.agreementRequestObject.property20.length) {
			return true;
		} else {
			return false;
		}
	}

	/* set defaultValue for autocomplete , elasticsearchoptions, endpointsearchoptions.*/
	setDefaultSearchOptions() {
		this.unitHttpOptions.defaultValue = this._agreementList.nameObject.unitName || '';
		this.elasticSearchOptions.defaultValue = this._agreementList.nameObject.requestorName || '';
		this.elasticSearchOptionsPI.defaultValue = this._agreementList.nameObject.piName || '';
		this.adminSearchOptions.defaultValue = this._agreementList.nameObject.adminName || '';
	}

	/** gets various permissions for agreement processes. */
	async getPermissions() {
		this.isNDAAdministrator = await this._commonService.checkPermissionAllowed('NDA_ADMINISTRATOR');
		this.isAssignLocation = await this._commonService.checkPermissionAllowed('ASSIGN_LOCATION');
		this.isCreateAgreement = await this._commonService.checkPermissionAllowed('CREATE_AGREEMENT');
		this.isAgreementCompletion = await this._commonService.checkPermissionAllowed('AGREEMENT_COMPLETION');
	}

	setCompleterOptions(searchOption: any = null, arrayList: any, fieldValue: string) {
		searchOption.defaultValue = '';
		searchOption.arrayList = arrayList || [];
		searchOption.contextField = fieldValue;
		searchOption.filterFields = fieldValue;
		searchOption.formatString = fieldValue;
	}

	setAdminGroupCompleterOptions(searchOptions: any, result: any) {
		searchOptions.defaultValue = '';
		searchOptions.arrayList = result.agreementAdminGroups;
		searchOptions.contextField = 'adminGroupName';
		searchOptions.filterFields = 'adminGroupName';
		searchOptions.formatString = 'adminGroupName';
	}

	getAgreementListData() {
		this._agreementList.agreementRequestObject.personId = this._commonService.getCurrentUserDetail('personID');
		this.$subscriptions.push(this.$agreementList.pipe(
			switchMap(() => this._agreementList.getAgreementDashBoardList(this.checkAdvanceSearchOption()))).
			subscribe((data: any) => {
				this.result = data || [];
				if (this.result !== null && !this.isHideAgreementList) {
					this.agreementList = data.agreementHeaderList || [];
					this.pageCount = this.getCountForPagination();
				}
				this.setCompleterOptions(this.adminSearchOptions, this.result.persons, 'fullName');
				this.setAdminGroupCompleterOptions(this.adminGroupSearchOptions, this.result);
				this.isShowCreateButton = this.canCreateAgreement();
			}));
	}

	setDashboardTab() {
		this._agreementList.agreementRequestObject.tabName = !sessionStorage.getItem('currentAgreementDashboardTab')
			? 'ALL_AGREEMENTS' : sessionStorage.getItem('currentAgreementDashboardTab');
	}

	openAllAgreements() {
		if ((!this.isAgreementAdministrator && !this.isGroupAdministrator)
			|| this._agreementList.agreementRequestObject.advancedSearch === 'A' || this.isHideAgreementList) {
			this.$agreementList.next();
			sessionStorage.setItem('currentAgreementDashboardTab', this._agreementList.agreementRequestObject.tabName);
		}
		if (this.isAgreementAdministrator || this.isGroupAdministrator) {
			this.setAdvanceSearch();
		}
	}

	getCountForPagination() {
		if (this._agreementList.agreementRequestObject.tabName === 'ALL_AGREEMENTS') {
			return this.result.allAgreementCount;
		}
		if (this._agreementList.agreementRequestObject.tabName === 'NEW_SUBMISSIONS') {
			return this.result.newSubmissionCount;
		}
		if (this._agreementList.agreementRequestObject.tabName === 'MY_PENDING_AGREEMENTS') {
			return this.result.myPendingAgreementCount;
		}
		if (this._agreementList.agreementRequestObject.tabName === 'ALL_PENDING_AGREEMENTS') {
			return this.result.allPendingAgreementCount;
		}
		if (this._agreementList.agreementRequestObject.tabName === 'IN_PROGRESS_AGREEMENTS') {
			return this.result.inProgressCount;
		}
		if (this._agreementList.agreementRequestObject.tabName === 'PENDING_AGREEMENTS') {
			return this.result.myAgreementCount;
		}
	}

	/** returns object with advance search option. */
	checkAdvanceSearchOption() {
		if (!this.isAdvancedSearchDone()) {
			this._agreementList.agreementRequestObject.advancedSearch = 'L';
		} else {
			this._agreementList.agreementRequestObject.advancedSearch = 'A';
		}
		return this._agreementList.agreementRequestObject;
	}

	/** export data as excel sheet or pdf
	* @param docType
	*/
	exportAsTypeDoc(docType) {
		this.checkAdvanceSearchOption();
		this.setPropertiesToExport(docType);
	}

	adminSelectFromDashboard(event: any) {
		if (event) {
			this.tempagreementRequestObject.property16 = event.personId ? event.personId : '';
			this.tempagreementRequestObject.adminName = event ? event.fullName : '';
		} else {
			this.tempagreementRequestObject.property16 = '';
		}
	}

	/**
	 * @param  {} docType
	 * Sets all the properties for exporting the file into doc and pdf formats.
	 */
	setPropertiesToExport(docType) {
		const exportDataReqObject = {
			advancedSearch: this._agreementList.agreementRequestObject.advancedSearch,
			personId: this._commonService.getCurrentUserDetail('personID'),
			property1: this._agreementList.agreementRequestObject.property1,
			property2: this._agreementList.agreementRequestObject.property2,
			property3: this._agreementList.agreementRequestObject.property3,
			property4: this._agreementList.agreementRequestObject.property4,
			property5: this._agreementList.agreementRequestObject.property5,
			property6: this._agreementList.agreementRequestObject.property6,
			property7: this._agreementList.agreementRequestObject.property7,
			property8: this._agreementList.agreementRequestObject.property8,
			property9: this._agreementList.agreementRequestObject.property9,
			property10: this._agreementList.agreementRequestObject.property10,
			property14: this._agreementList.agreementRequestObject.property14,
			property15: this._agreementList.agreementRequestObject.property15,
			property16: this._agreementList.agreementRequestObject.property16,
			property17: this._agreementList.agreementRequestObject.property17,
			property18: this._agreementList.agreementRequestObject.property18,
			property19: this._agreementList.agreementRequestObject.property19,
			property20: this._agreementList.agreementRequestObject.property20,
			tabName: this._agreementList.agreementRequestObject.tabName,
			documentHeading: this.getDocumentHeading(),
			exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
			sortBy: this._agreementList.agreementRequestObject.sortBy,
			reverse: this._agreementList.agreementRequestObject.reverse
		};
		this.getExportedData(exportDataReqObject);
	}

	getDocumentHeading() {
		let docHeading = '';
		if (this._agreementList.agreementRequestObject.tabName === 'ALL_AGREEMENTS') {
			docHeading = 'All Agreements';
		} else if (this._agreementList.agreementRequestObject.tabName === 'NEW_SUBMISSIONS') {
			docHeading = 'New Submissions';
		} else if (this._agreementList.agreementRequestObject.tabName === 'MY_PENDING_AGREEMENTS') {
			docHeading = 'My Reviews';
		} else if (this._agreementList.agreementRequestObject.tabName === 'ALL_PENDING_AGREEMENTS') {
			docHeading = 'All Reviews';
		} else if (this._agreementList.agreementRequestObject.tabName === 'IN_PROGRESS_AGREEMENTS') {
			docHeading = 'In Progress Agreements';
		} else if (this._agreementList.agreementRequestObject.tabName === 'PENDING_AGREEMENTS') {
			docHeading = 'My Review';
		} else {
			docHeading = 'In Progress Agreements';
		}
		return docHeading;
	}

	getExportedData(exportDataReqObject) {
		this.$subscriptions.push(this._agreementList.exportAgreementDasboardDatas(exportDataReqObject).subscribe(
			data => {
				let fileName = '';
				fileName = this.getDocumentHeading();
				// msSaveOrOpenBlob only available for IE & Edge
				if ((window.navigator as any).msSaveOrOpenBlob) {
					(window.navigator as any).msSaveBlob(new Blob([data.body], { type: exportDataReqObject.exportType }),
						fileName.toLowerCase() + '.' + exportDataReqObject.exportType);
				} else {
					const DOWNLOAD_BTN = document.createElement('a');
					DOWNLOAD_BTN.href = URL.createObjectURL(data.body);
					DOWNLOAD_BTN.download = fileName.toLowerCase() + '.' + exportDataReqObject.exportType;
					document.body.appendChild(DOWNLOAD_BTN);
					DOWNLOAD_BTN.click();
					DOWNLOAD_BTN.remove();
				}
			}));
	}

	async gotoAgreementCreation() {
		this._router.navigate(['/fibi/agreement/create']);
	}

	onLookupSelect(data, template) {
		this.lookupValues[template] = data;
		this.tempagreementRequestObject[template] = data.length ? data.map(d => d.code) : [];
	}

	setOrgTypeLookupValues(event: any) {
		if (event) {
			this._agreementList.agreementRequestObject.property15 = this.getSponsorCodeArray(event);
		}
	}

	getSponsorCodeArray(event: any) {
		const SPONSOR_CODE_ARRAY = [];
		event.forEach(element => {
			SPONSOR_CODE_ARRAY.push(element.code);
		});
		return SPONSOR_CODE_ARRAY;
	}

	/*assign temproary object values to advance search properties*/
	setAdvanceSearchToServiceObject() {
		this._agreementList.agreementRequestObject.property1 = this.tempagreementRequestObject.property1 || '';
		this._agreementList.agreementRequestObject.property2 = this.tempagreementRequestObject.property2 || '';
		this._agreementList.agreementRequestObject.property3 = this.tempagreementRequestObject.property3 || [];
		this._agreementList.agreementRequestObject.property4 = this.tempagreementRequestObject.property4 || [];
		this._agreementList.agreementRequestObject.property5 = this.tempagreementRequestObject.property5 || '';
		this._agreementList.agreementRequestObject.property6 = this.tempagreementRequestObject.property6 || [];
		this._agreementList.agreementRequestObject.property7 = this.tempagreementRequestObject.property7 || '';
		this._agreementList.agreementRequestObject.property8 = this.tempagreementRequestObject.property8 || '';
		this._agreementList.agreementRequestObject.property9 = this.tempagreementRequestObject.property9 || '';
		this._agreementList.agreementRequestObject.property10 = this.tempagreementRequestObject.property10 || '';
		this._agreementList.agreementRequestObject.property14 = this.tempagreementRequestObject.property14 || [];
		this._agreementList.agreementRequestObject.property15 = this.tempagreementRequestObject.property15 || [];
		this._agreementList.agreementRequestObject.property16 = this.tempagreementRequestObject.property16 || '';
		this._agreementList.agreementRequestObject.property17 = this.tempagreementRequestObject.property17 || '';
		this._agreementList.agreementRequestObject.property18 = this.tempagreementRequestObject.property18 || '';
		this._agreementList.agreementRequestObject.property19 = this.tempagreementRequestObject.property19 || '';
		this._agreementList.agreementRequestObject.property20 = this.tempagreementRequestObject.property20 || [];
		this._agreementList.nameObject.requestorName = this.tempagreementRequestObject.requestorName || '';
		this._agreementList.nameObject.negotiatorName = this.tempagreementRequestObject.negotiatorName || '';
		this._agreementList.nameObject.unitName = this.tempagreementRequestObject.unitName || '';
		this._agreementList.nameObject.adminName = this.tempagreementRequestObject.adminName || '';
		this._agreementList.nameObject.piName = this.tempagreementRequestObject.piName || '';
		this._agreementList.nameObject.personType = this.personType;
	}

	/*populate look up fields with search values, if advance search is made*/
	generateLookupArrayForDropdown() {
		if (this._agreementList.agreementRequestObject.property4.length) {
			this.generateLookupArray(this._agreementList.agreementRequestObject.property4, 'property4');
		}
		if (this._agreementList.agreementRequestObject.property6.length) {
			this.generateLookupArray(this._agreementList.agreementRequestObject.property6, 'property6');
		}
		if (this._agreementList.agreementRequestObject.property14.length) {
			this.generateLookupArray(this._agreementList.agreementRequestObject.property14, 'property14');
		}
		if (this._agreementList.agreementRequestObject.property15.length) {
			this.generateLookupArray(this._agreementList.agreementRequestObject.property15, 'property15');
		}
		if (this._agreementList.agreementRequestObject.property20.length) {
			this.generateLookupArray(this._agreementList.agreementRequestObject.property20, 'property20');
		}
	}

	/*generate lookup array with existing values */
	generateLookupArray(property, propertyNumber) {
		this.lookupValues[propertyNumber] = [];
		property.forEach(element => {
			this.lookupValues[propertyNumber].push({ code: element });
		});
	}

	setUnitOption(event) {
		(event) ? this.tempagreementRequestObject.property7 = event.unitNumber : this.clearLeadUnitForAdvancedSearch();
		this.tempagreementRequestObject.unitName = event ? event.unitName : '';
	}

	clearLeadUnitForAdvancedSearch() {
		this.tempagreementRequestObject.property7 = '';
		this.clearLeadUnitField = new String('true');
	}

	emptyValidationKeyup(event, property) {
		if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
			this._agreementList.agreementRequestObject[property] = '';
		}
	}

	selectElasticResult(event, property, type) {
		if (type === 'PI') {
			this.tempagreementRequestObject[property] = event ? (this.personType === 'EMPLOYEE' ? event.prncpl_id : event.rolodex_id) : '';
			this.tempagreementRequestObject.piName = event ? event.full_name : '';
		} else {
			this.tempagreementRequestObject[property] = event ? event.prncpl_id : '';
			this.tempagreementRequestObject.requestorName = event ? event.full_name : '';
		}
	}

	clearAdvanceSearchField() {
		this._agreementList.clearAdvanceSearchOptions();
		this._agreementList.clearLookUpObject();
		this._agreementList.clearNameObject();
		this.clearLeadUnitForAdvancedSearch();
		this.advSearchClearField = new String('true');
		this.clearAdminField = new String('true');
		this.lookupValues = [];
		this.isHideAgreementList = false;
		this.clearTempObject();
		this.personType = 'EMPLOYEE';
		this.setElasticPersonOption();
	}

	clearTempObject() {
		this.tempagreementRequestObject.property1 = '';
		this.tempagreementRequestObject.property2 = '';
		this.tempagreementRequestObject.property3 = [];
		this.tempagreementRequestObject.property4 = [];
		this.tempagreementRequestObject.property5 = '';
		this.tempagreementRequestObject.property6 = [];
		this.tempagreementRequestObject.property7 = '';
		this.tempagreementRequestObject.property8 = '';
		this.tempagreementRequestObject.property9 = '';
		this.tempagreementRequestObject.property10 = '';
		this.tempagreementRequestObject.property14 = [];
		this.tempagreementRequestObject.property15 = [];
		this.tempagreementRequestObject.property16 = '';
		this.tempagreementRequestObject.property17 = '';
		this.tempagreementRequestObject.property18 = '';
		this.tempagreementRequestObject.property19 = '';
		this.tempagreementRequestObject.property20 = [];
		this.tempagreementRequestObject.requestorName = '';
		this.tempagreementRequestObject.piName = '';
		this.tempagreementRequestObject.adminName = '';
		this.tempagreementRequestObject.unitName = '';
		this.tempagreementRequestObject.negotiatorName = '';
	}

	sortResult(sortFieldBy) {
		this.isReverse = (this._agreementList.agreementRequestObject.sortBy === sortFieldBy) ? !this.isReverse : false;
		(this.isReverse) ? this._agreementList.agreementRequestObject.reverse = 'DESC'
			: this._agreementList.agreementRequestObject.reverse = 'ASC';
		this._agreementList.agreementRequestObject.sortBy = sortFieldBy;
		this.$agreementList.next();
	}

	viewAgreementById(agreementId) {
		this._router.navigate(['fibi/agreement/form'], { queryParams: { 'agreementId': agreementId } });
	}

	actionsOnPageChange(event) {
		this._agreementList.agreementRequestObject.currentPage = event;
		this.$agreementList.next();
		pageScroll('pageScrollToTop');
	}

	tempCopyAgreement(requestID) {
		this.agreementID = requestID;
		this.isShowCopyWarningModal = true;
	}

	/** select a result from elastic search
	  * @param value
	  */
	selectAgreementElasticResult(value) {
		if (value) {
			this.isShowResultCard = true;
			this.elasticResultObject = value;
		} else {
			this.isShowResultCard = false;
			this.elasticResultObject = {};
		}
	}

	clearElasticField() {
		this.clearAgreementField = new String('true');
	}

	/* sets advanced search as 'A' if tab name = 'All_AGREEMENTS', other wise advance search as 'L' */
	setAdvanceSearch() {
		sessionStorage.setItem('currentAgreementDashboardTab', this._agreementList.agreementRequestObject.tabName);
		this.checkAdvanceSearchOption();
		if (this._agreementList.agreementRequestObject.tabName === 'ALL_AGREEMENTS') {
			document.getElementById('collapseListAgreement').classList.add('show');
			this.isHideAgreementList = this.isAdvancedSearchDone() ? false : true;
		} else {
			this._agreementList.agreementRequestObject.advancedSearch === 'L' ?
				document.getElementById('collapseListAgreement').classList.remove('show') :
				document.getElementById('collapseListAgreement').classList.add('show');
			this.isHideAgreementList = false;
		}
	}

	searchAgreementList() {
		if (this.dateValidation()) {
			this.setDateFormatWithoutTimeStamp();
			this.$agreementList.next();
			this.isHideAgreementList = false;
		}
	}

	setDateFormatWithoutTimeStamp() {
		this._agreementList.agreementRequestObject.property17 = parseDateWithoutTimestamp
			(this._agreementList.agreementRequestObject.property17);
		this._agreementList.agreementRequestObject.property18 = parseDateWithoutTimestamp
			(this._agreementList.agreementRequestObject.property18);
	}

	dateValidation() {
		this.map.clear();
		if (this._agreementList.agreementRequestObject.property17 && this._agreementList.agreementRequestObject.property18 &&
			compareDatesWithoutTimeZone(this._agreementList.agreementRequestObject.property17,
				this._agreementList.agreementRequestObject.property18) === 1) {
			this.map.set('fromDate', `Please select 'Submitted To' Date after 'Submitted From' Date`);
		}
		return this.map.size < 1 ? true : false;
	}

	setRoleTypeDropdown() {
		this.assignObject.agreementPeople.piPersonnelTypeCode = null;
		this.assignObject.agreementPeople.updateUser = this._commonService.getCurrentUserDetail('userName');
		this.assignObject.loginUserName = this._commonService.getCurrentUserDetail('userName');
		this.assignObject.updateUser = this._commonService.getCurrentUserDetail('userName');
	}

	/**
	* @param  {any} event
	* Set objects after selecting an admin from search field,
	* if admin value is cleared, then value from
	* both admin and admingroup will be removed.
	*/
	adminSelectFunction(event: any) {
		if (event) {
			this.getAdminGroupDetails(event.personId);
			this.setAssignObjectDetails(event);
			this.isAssigntoMe = this.setAssginToMeCheckBox();
			this.assignAdminMap.clear();
		} else {
			this.assignObject.agreementPeople.personId = null;
			this.assignObject.adminGroupId = null;
			this.clearAdminGroupField = new String('true');
			this.isAssigntoMe = false;
			this.isShowWarningMessage = false;
		}
	}

	setAssginToMeCheckBox() {
		return this.assignObject.agreementPeople.personId === this._commonService.getCurrentUserDetail('personID') ? true : false;
	}

	setAssignObjectDetails(person) {
		this.assignObject.agreementPeople.personId = person.personId;
		this.assignObject.agreementPeople.fullName = person.fullName ? person.fullName : null;
		this.assignObject.agreementPeople.phoneNumber = person.mobileNumber ? person.mobileNumber : null;
		this.assignObject.agreementPeople.email = person.emailAddress ? person.emailAddress : null;
		this.assignObject.agreementPeople.department = person.unit ? person.unit.unitName : null;
		this.assignObject.personId = person.personId;
	}

	/**
	 * set adminGroupId based on the selected group,
	 * if admin group field is cleared then value from
	 * both admin and admingroup will be removed.
	 */

	adminGroupSelectFunction(event) {
		if (event) {
			this.isShowWarningMessage = false;
			this.assignObject.adminGroupId = event.adminGroupId;
		} else {
			this.assignObject.adminGroupId = null;
		}
	}

	/**
	 * @param  {any} checkBoxEvent
	 * Sets objects for assigning admin if user selects the checkbox 'Assign to me' from the modal.
	 */
	assignToMeEvent(checkBoxEvent: any) {
		if (checkBoxEvent.target.checked) {
			this.adminSearchOptions.defaultValue = this._commonService.getCurrentUserDetail('fullName');
			this.clearField = new String('false');
			this.setDetailsForAssignedToMe();
			this.getAdminGroupDetails(this._commonService.getCurrentUserDetail('personID'));
			this.isAssigntoMe = true;
			this.assignAdminMap.clear();
		} else {
			this.clearField = new String('true');
			this.clearAdminGroupField = new String('true');
			this.assignObject.agreementPeople = {};
			this.isAssigntoMe = false;
		}
	}
	/**
	 * @param personId
	 * get admin group details of selected admin,
	 * if no admin group is available then flag
	 * for showing warning message will be set to true.
	 */
	getAdminGroupDetails(personId) {
		this.$subscriptions.push(this._agreementService.getPersonGroup(personId).subscribe((data: any) => {
			if (data.adminGroupId) {
				this.adminGroupSearchOptions.defaultValue = data.adminGroupName;
				this.clearAdminGroupField = new String('false');
				this.assignObject.adminGroupId = data.adminGroupId;
				this.isShowWarningMessage = false;
			} else {
				this.isShowWarningMessage = true;
				this.warningMessage = data;
			}
		}));
	}

	setDetailsForAssignedToMe() {
		this.assignObject.agreementPeople.personId = this._commonService.getCurrentUserDetail('personID');
		this.assignObject.personId = this._commonService.getCurrentUserDetail('personID');
		this.assignObject.updateUser = this._commonService.getCurrentUserDetail('userName');
		this.assignObject.agreementPeople.fullName = this._commonService.getCurrentUserDetail('fullName');
	}

	/** Set agreementPeopleType object with value STO by default, otherwise set object with value as per the dropdown selection. */
	setPeopleTypeObject() {
		this.assignObject.agreementPeople.agreementPeopleType = this.isRoleTypeChanged ? this.getPeopleTypeObject(this.roleType) :
			this.getPeopleTypeObject(6);
		this.assignObject.agreementPeople.peopleTypeId = this.isRoleTypeChanged ? this.roleType : '6';
	}

	getPeopleTypeObject(roleType) {
		// tslint:disable-next-line:triple-equals
		return this.result.agreementPeopleType.find(element => element.peopleTypeId == roleType);
	}

	validateAdmin() {
		this.assignAdminMap.clear();
		if (!this.assignObject.agreementPeople.personId) {
			this.assignAdminMap.set('adminName', 'adminName');
		}
		return this.assignAdminMap.size > 0 ? false : true;
	}

	assignToAgreementAdmin() {
		if (this.validateAdmin()) {
			this.assignObject.loginUserId = this._commonService.getCurrentUserDetail('personID');
			this.setRoleTypeDropdown();
			this.$subscriptions.push(this._agreementService.assignAgreementAdmin(this.assignObject).subscribe(
				(data: any) => {
					this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Admin assigned successfully.');
					this.result.agreementStatuses = data.agreementStatuses;
					this.result.agreementHeader = data.agreementHeader;
					this.isShowWarningMessage = false;
					this.$agreementList.next();
					this.isAssigntoMe = false;
				}, err => {
					this._commonService.showToast(HTTP_ERROR_STATUS, 'Admin assign failed.');
				}));
			if (this.assignAdminMap.size === 0) {
				$('#assign-to-admin-modal').modal('hide');
			}
		}
	}

	clearAssignFields(id: any) {
		this.clearField = new String('true');
		this.assignObject.agreementPeople.agreementRequestId = id;
		this.clearAdminGroupField = new String('true');
		this.assignObject.agreementRequestId = id;
		this.assignObject.agreementPeople.personId = null;
		this.assignAdminMap.clear();
		this.isShowWarningMessage = false;
	}


	loadNewNegotiationData(agreementId, negotiationId) {
		this.$subscriptions.push(this._agreementService.loadAgreementNegotiation(
			{
				'agreementRequestId': agreementId,
				'negotiationId': negotiationId
			}
		).subscribe((data: any) => {
			this.negotiationLookUp = data;
			this.isShowActivityModal = true;
		}));
	}

	updateNegotiationActivity(event) {
		if (event) {
			this._agreementService.$isActivityAdded.next(true);
			this.isShowActivityModal = event.showModal;
		}
	}

	canCreateAgreement() {
		return (this._commonService.isCreateAgreement) ? true : (this.isCreateAgreement) ? true : false;
	}

	/** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
	changeMemberType() {
		this.tempagreementRequestObject.property10 = '';
		this.clearPiField = new String('true');
		this.elasticSearchOptionsPI.defaultValue = '';
		this.setElasticSearchOptions();
	}

	setElasticSearchOptions() {
		(this.personType === 'EMPLOYEE') ? this.setElasticPersonOption() : this.setElasticRolodexOption();
	}

	setElasticPersonOption() {
		this.elasticSearchOptionsPI = this._elasticConfig.getElasticForPerson();
	}

	setElasticRolodexOption() {
		this.elasticSearchOptionsPI = this._elasticConfig.getElasticForRolodex();
	}

	/**
	 * 1 - In Progress
	 * 2 - Review In Progress
	 * 5 - Routing In Progress
	 * 6 - Revision Requested
	 * 7 - Submitted
	 */
	checkForAddActivity(agreement) {
		return ['1', '2', '5', '6', '7']
			.includes(agreement.agreementStatusCode) && (this.isAgreementAdministrator || this.isGroupAdministrator);
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	switchTab(tabName: string) {
		this._agreementList.agreementRequestObject.tabName = tabName;
		this._agreementList.agreementRequestObject.currentPage = 1;
		this._agreementList.agreementRequestObject.sortBy = '';
		this.agreementList = [];
		this.clearAdvanceSearchField();
		if (tabName === 'ALL_AGREEMENTS') {
			this.openAllAgreements();
		} else {
			this.$agreementList.next();
			this.setAdvanceSearch();
		}
	}
}
