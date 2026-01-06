import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';
import { Subscription, Subject } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { NavigationService } from '../../common/services/navigation.service';
import { itemAnim } from '../../common/utilities/animations';
import { getSponsorSearchDefaultValue, fileDownloader, openInNewTab, pageScroll } from '../../common/utilities/custom-utilities';
import { AwardListService } from './award-list.service';
import { getEndPointOptionsForSponsor, getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { AWARD_LABEL, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { AwardDashboardItem, AwardDashboardRequest } from '../award-interfaces';
import {concatUnitNumberAndUnitName} from '../../common/utilities/custom-utilities';
declare var $: any;

@Component({
	selector: 'app-award-list',
	templateUrl: './award-list.component.html',
	styleUrls: ['./award-list.component.css'],
	animations: [itemAnim]
})
export class AwardListComponent implements OnInit, OnDestroy {

	isReverse = true;
	isShowResultCard = false;
	isShowAdvanceSearchOptions = false;
	serviceRequestList: Array<AwardDashboardItem> = [];
	result: any = {};
	elasticResultObject: any = {};
	elasticSearchOptions: any = {};
	elasticPersonSearchOptions: any = {};
	leadUnitSearchOptions: any = {};
	fundingAgencySearchOptions: any = {};
	warningObj: any = {};
	sortMap: any = {};
	sortCountObj: any = {};
	isCreateAward = false;
	viewHoldForFundingTab = false;
	isDeleteAward = false;
	clearPiField: String;
	clearFieldLeadUnit: String;
	clearGrantField: String;
	clearFieldFundingAgency: String;
	clearAwardField: String;
	filterValues: any = {};
	lookupValues: any = {};
	awardTypeOptions = 'AWARD_STATUS#STATUS_CODE#true#true';
	researchRoleOptions = 'EPS_PROP_PERSON_ROLE#PROP_PERSON_ROLE_ID#true#true';
	awardTypeColumnName = 'STATUS_CODE';
	variationTypeOptions = 'SR_TYPE#TYPE_CODE#true#true';
	accountTypeOptions = 'ACCOUNT_TYPE#ACCOUNT_TYPE_CODE#true#true';
	grantCallTypeOptions = 'GRANT_CALL_TYPE#GRANT_TYPE_CODE#true';
	$subscriptions: Subscription[] = [];
	$awardList = new Subject();
	awardVersionObject: any = {};
	isEmployeeFlag = true;
	pageScroll = pageScroll;
	awardId: any;
	isSaving = false;
	tempAwardRequestObject = new AwardDashboardRequest();
	tempAwardDetails: any = {};
	copyQuestionnaire = false;
	copyOtherInformation = false;
	isShowAllAwardsList = false;
	awardIndex: number;
	deleteWarningMessages: any = [];
	canDeleteAward: boolean;
	deleteAwardNumber: string;
	concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
	awardSectionConfig: any;
	grantCallElasticSearchOptions: any = {};

	constructor(public _awardListService: AwardListService, public _commonService: CommonService,
		private _router: Router, private _elasticConfig: ElasticConfigService, private _navigationService: NavigationService) { }

	ngOnInit() {
		this.getAwardSectionConfig('AW01');
		this.setDashboardTab();
		this.setAdvanceSearch();
		this.loadDashboard();
		this.elasticSearchOptions = this._elasticConfig.getElasticForAward();
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
		this.fundingAgencySearchOptions = getEndPointOptionsForSponsor();
		this.leadUnitSearchOptions = getEndPointOptionsForDepartment();
		this.grantCallElasticSearchOptions = this._elasticConfig.getElasticForGrantCall();
		this.setSortProperties();
		this.getPermissions();
		this.checkForAdvanceSearch();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/** Check if previous url is fibi/award, if not then clear Advanced Search fields */
	checkForAdvanceSearch() {
		if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/award')) {
			this.isShowAllAwardsList = true;
			if (this._awardListService.isAdvanceSearch) {
				document.getElementById('collapseAward').classList.add('show');
			} else {
				if (this._awardListService.awardRequestObject.tabName === 'ALL_AWARDS') {
					document.getElementById('collapseAward').classList.add('show');
					this.isShowAllAwardsList = false;
				} else {
					document.getElementById('collapseAward').classList.remove('show');
				}
			}
			this.switchAdvanceSearchProperties(this.tempAwardRequestObject, this._awardListService.awardRequestObject);
			this.tempAwardRequestObject.fullName = this._awardListService.awardRequestExtraDetails.fullName || '';
			this.tempAwardRequestObject.grantCallName = this._awardListService.awardRequestExtraDetails.grantCallName || '';
			this.tempAwardRequestObject.unitName = this._awardListService.awardRequestExtraDetails.unitName || '';
			this.isEmployeeFlag = this._awardListService.awardRequestExtraDetails.isEmployeeFlag;
			(this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
			this.generateLookupArrayForDropdown();
			this.setDefaultValueForCustomLibrarySearch();
			this._awardListService.awardRequestObject.advancedSearch = 'A';
			this.$awardList.next();
		} else {
			this.clearAdvanceSearchFields();
			this.resetSortObjects();
			if (this._awardListService.awardRequestObject.tabName !== 'ALL_AWARDS') {
				document.getElementById('collapseAward').classList.remove('show');
				this.$awardList.next();
			}
		}
	}

	isAdvancedSearchMade(): boolean {
		return !!Object.values(this._awardListService.awardRequestObject)
			.find(V => (typeof (V) === 'string' && V) || (typeof (V) === 'object' && V.length));
	}

	/* Setting default value for end-point, elastic search, so to display in UI. */
	setDefaultValueForCustomLibrarySearch() {
		this.fundingAgencySearchOptions.defaultValue = this._awardListService.sponsorAdvanceSearchDefaultValue || '';
		this.elasticPersonSearchOptions.defaultValue = this._awardListService.awardRequestExtraDetails.fullName || '';
		this.leadUnitSearchOptions.defaultValue = this._awardListService.awardRequestExtraDetails.unitName || '';
		this.grantCallElasticSearchOptions.defaultValue = this._awardListService.awardRequestExtraDetails.grantCallName || '';
	}

	generateLookupArrayForDropdown() {
		if (this._awardListService.awardRequestObject.property8.length !== 0) {
			this.generateLookupArray(this._awardListService.awardRequestObject.property8, 'property8');
		}
		if (this._awardListService.awardRequestObject.property11.length !== 0) {
			this.generateLookupArray(this._awardListService.awardRequestObject.property11, 'property11');
		}
		if (this._awardListService.awardRequestObject.property13.length !== 0) {
			this.generateLookupArray(this._awardListService.awardRequestObject.property13, 'property13');
		}
		if (this._awardListService.awardRequestObject.property14.length !== 0) {
			this.generateLookupArray(this._awardListService.awardRequestObject.property14, 'property14');
		}
		if (this._awardListService.awardRequestObject.property15.length !== 0) {
			this.generateLookupArray(this._awardListService.awardRequestObject.property15, 'property15');
		}
	}

	generateLookupArray(property, propertyNumber) {
		this.lookupValues[propertyNumber] = [];
		property.forEach(element => {
			this.lookupValues[propertyNumber].push({ code: element });
		});
	}

	loadDashboard() {
		this.$subscriptions.push(this.$awardList.pipe(
			switchMap(() => this._awardListService.getAwardDashBoardList(this._awardListService.awardRequestObject)))
			.subscribe((data: any) => {
				this.result = data || [];
				if (this.result) {
					this.serviceRequestList = this.result.awardViews;
				}
			}));
	}

	setDashboardTab() {
		this._awardListService.awardRequestObject.tabName = !sessionStorage.getItem('currentAwardDashboardTab')
			? 'MY_AWARDS' : sessionStorage.getItem('currentAwardDashboardTab');
	}

	actionsOnPageChange(event) {
		this._awardListService.awardRequestObject.currentPage = event;
		this.$awardList.next();
		pageScroll('pageScrollToTop');
	}

	setFundingAgencyForAdvanceSearch(event) {
		this._awardListService.sponsorAdvanceSearchDefaultValue = event ? getSponsorSearchDefaultValue(event) : null;
		this.tempAwardRequestObject.property3 = event ? event.sponsorCode : null;
	}

	setLeadUnitForAdvanceSearch(event) {
		this.tempAwardRequestObject.property2 = event ? event.unitNumber : null;
		this.tempAwardRequestObject.unitName = event ? event.unitName : '';
	}

	setGrantCallForAdvanceSearch(event) {
		this.tempAwardRequestObject.property10 = event ? event.grant_header_id : null;
        this.tempAwardRequestObject.grantCallName = event ? event.title : '';
	}

	clearGrantCallForAdvanceSearch() {
		this._awardListService.awardRequestObject.property10 = null;
		this.clearGrantField = new String('true');
	}

	clearLeadUnitForAdvanceSearch() {
		this._awardListService.awardRequestObject.property2 = null;
		this.clearFieldLeadUnit = new String('true');
	}

	clearFundingAgencyForAdvanceSearch() {
		this._awardListService.awardRequestObject.property3 = null;
		this._awardListService.sponsorAdvanceSearchDefaultValue = null;
		this.clearFieldFundingAgency = new String('true');
	}

	showAdvanceSearch(event: any) {
		event.preventDefault();
		this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
	}

	/* close elastic search result if it is open */
	searchUsingAdvanceOptions() {
		if (this.isShowResultCard) {
			this.isShowResultCard = false;
		}
		this._awardListService.awardRequestObject.advancedSearch = 'A';
		this.$awardList.next();
		this.isShowAllAwardsList = true;
		this._awardListService.isAdvanceSearch = true;
	}


	clearAdvanceSearchFields() {
		this.clearAdvanceSearchList();
		this.tempAwardRequestObject = new AwardDashboardRequest();
		this._awardListService.isAdvanceSearch = false;
	}

	clearElasticField() {
		this.clearAwardField = new String('true');
	}


	selectAwardElasticResult(value) {
		if (value) {
			this.isShowResultCard = true;
			this.elasticResultObject = value;
		} else {
			this.isShowResultCard = false;
			this.elasticResultObject = {};
		}
	}

	sortResult(sortFieldBy) {
		this.sortCountObj[sortFieldBy]++;
		this._awardListService.awardRequestObject.sortBy = sortFieldBy;
		if (this.sortCountObj[sortFieldBy] < 3) {
			if (this._awardListService.awardRequestObject.sortBy === sortFieldBy) {
				this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
			}
		} else {
			this.sortCountObj[sortFieldBy] = 0;
			delete this.sortMap[sortFieldBy];
		}
		this._awardListService.awardRequestObject.sort = this.sortMap;
		this._awardListService.sortCountObj = this.sortCountObj;
		this.$awardList.next();
	}

	exportAsTypeDoc(docType: string) {
		if (!this.isSaving) {
			this.isSaving = true;
			const exportObject: any = { ...this._awardListService.awardRequestObject };
			exportObject.documentHeading = this.getDocumentHeading(this._awardListService.awardRequestObject.tabName);
			exportObject.exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
			this.$subscriptions.push(this._awardListService.exportAwardDashboardData(exportObject).subscribe(
				data => {
					const fileName = exportObject.documentHeading;
					fileDownloader(data.body, fileName, exportObject.exportType);
					this.isSaving = false;
				}, err => { this.isSaving = false; }));
		}
	}

	getDocumentHeading(tabName: string) {
		return tabName === 'MY_AWARDS' ? `MY ${AWARD_LABEL}` :
			tabName === 'ALL_AWARDS' ? `All ${AWARD_LABEL}` :
				tabName === 'PENDING_AWARDS' ? `Review Pending ${AWARD_LABEL}` :
					tabName === 'DRAFT_AWARDS' ? `Draft ${AWARD_LABEL}` : `Hold For Funding Agency Review ${AWARD_LABEL}`;
	}

	/**
	* restrict input fields to numbers, - and /
	* @param event
	*/
	inputRestriction(event: any) {
		const pattern = /[0-9\+\-\/\ ]/;
		if (!pattern.test(String.fromCharCode(event.charCode))) {
			event.preventDefault();
		}
	}

	gotoAwardCreation() {
		this._router.navigate(['fibi/award'], { queryParams: { 'awardId': null } });
	}

	/**
	 * @param  {} event
	 * if a person is employee then sets prncpl_id  to the json object otherwise sets rolodex_id.
	 */
	selectedFilter(event) {
		this.tempAwardRequestObject.property4 = event ? this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id : '';
		this.tempAwardRequestObject.fullName = event ? event.full_name : '';
	}

	emptyValidationKeyup(event) {
		if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
			this.tempAwardRequestObject.property4 = '';
		}
	}

	async getPermissions() {
		this.isCreateAward = await this._commonService.checkPermissionAllowed('CREATE_AWARD');
		this.viewHoldForFundingTab = await this._commonService.checkPermissionAllowed('VIEW_HOLD_FOR_FUNDING_AGENCY_REVIEW_AWARDS');
		this.isDeleteAward = await this._commonService.checkPermissionAllowed('DELETE_AWARD');
	}

	deleteAwardConfirmationModal(award, index) {
		this.awardId = award.awardId;
		this.awardIndex = index;
		this.deleteAwardNumber = award.awardNumber;
		this.checkCanDeleteAward();
	}

	clearWarningMessages() {
		this.deleteWarningMessages = [];
	}

	deleteAward(): void {
		this.$subscriptions.push(this._awardListService.deleteAward(this.awardId).subscribe((res: any) => {
			$('#deleteAwardPermissionCheckingModal').modal('hide');
			this._commonService.showToast(HTTP_SUCCESS_STATUS, res.message);
			this.serviceRequestList.splice(this.awardIndex, 1);
			this.awardIndex = null;
			this.awardId = null;
			this.clearWarningMessages();
		}
			, err => {
				$('#deleteAwardPermissionCheckingModal').modal('hide');
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Award failed as another transaction is being processed in current Award. Please click Delete Award again.');
			}));
	}

	checkCanDeleteAward(): void {
		this.clearWarningMessages();
		this.$subscriptions.push(this._awardListService.canDeleteAward(this.awardId).subscribe((res: any) => {
			this.canDeleteAward = res.status;
			if (this.canDeleteAward) {
				this.deleteWarningMessages.push('Are you sure you want to delete this Award?');
			} else {
				this.deleteWarningMessages = res.message;
			}
			$('#deleteAwardPermissionCheckingModal').modal('show');
		},
			err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Award failed as another transaction is being processed in current Award. Please click Delete Award again.'); }));
	}

	setSortProperties() {
		this.resetSortObjects();
		this.sortCountObj = (Object.entries(this._awardListService.sortCountObj).length === 0) ?
			this.sortCountObj : this._awardListService.sortCountObj;
		this.sortMap = (Object.entries(this._awardListService.awardRequestObject.sort).length === 0) ?
			this.sortMap : this._awardListService.awardRequestObject.sort;
	}

	setAdvanceSearch() {
		sessionStorage.setItem('currentAwardDashboardTab', this._awardListService.awardRequestObject.tabName);
		this.checkCurrentTab();
		if (this._awardListService.awardRequestObject.tabName === 'ALL_AWARDS') {
			document.getElementById('collapseAward').classList.add('show');
		} else {
			if (this._awardListService.isAdvanceSearch) {
				document.getElementById('collapseAward').classList.add('show');
			} else {
				document.getElementById('collapseAward').classList.remove('show');
			}

		}
	}
	/**
	 * @param  {} data
	 * @param  {} template
	 * to get the values of the lookups in advanced search which returns string value
	 */
	onLookupSelect(data, template) {
		this.lookupValues[template] = data;
		this.tempAwardRequestObject[template] = data.length ? data.map(d => d.code) : [];
	}

	navigateToAward(awardDetails) {
		if (this._awardListService.awardRequestObject.tabName === 'MY_AWARDS') {
			this.tempAwardDetails = awardDetails;
			this._awardListService.getAwardVersions({ 'awardNumber': awardDetails.awardNumber }).subscribe(data => {
				this.awardVersionObject = data;
				if (this.awardVersionObject.pendingAwards.length) {
					$('#newVersionAlreadyExist').modal('show');
				} else {
					openInNewTab('award/overview?', ['awardId'], [awardDetails.awardId]);
				}
			});
		} else {
			openInNewTab('award/overview?', ['awardId'], [awardDetails.awardId]);
		}
	}

	openAwardInNewTab(awardId) {
		$('#newVersionAlreadyExist').modal('hide');
		openInNewTab('award/overview?', ['awardId'], [awardId]);
	}
	/** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
	changeMemberType() {
		this.tempAwardRequestObject.property4 = '';
		this.clearPiField = new String('true');
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

	copyAward() {
		const requestObject = {
			'awardId': this.awardId,
			'isCopyAward': true,
			'createUser': this._commonService.getCurrentUserDetail('userName'),
			'updateUser': this._commonService.getCurrentUserDetail('userName'),
			'copyOtherInformation': this.copyOtherInformation,
			'copyQuestionnaire': this.copyQuestionnaire
		};
		this.$subscriptions.push(this._awardListService.copyAward(requestObject).subscribe((data: any) => {
			openInNewTab('award/overview?', ['awardId'], [data.awardId]);
		}));
		this.clearModalFlags();
	}

	clearModalFlags() {
		this.copyOtherInformation = false;
		this.copyQuestionnaire = false;
	}

	checkCurrentTab() {
		if (this._awardListService.awardRequestObject.tabName === 'ALL_AWARDS') {
			this.isShowAllAwardsList = false;
		} else {
			this.isShowAllAwardsList = true;
		}
	}

	clearAdvanceSearchList() {
		this._awardListService.awardRequestObject.property1 = '';
		this.clearLeadUnitForAdvanceSearch();
		this.clearFundingAgencyForAdvanceSearch();
		this.clearGrantCallForAdvanceSearch();
		this._awardListService.awardRequestObject = new AwardDashboardRequest();
		this._awardListService.awardRequestObject.tabName = sessionStorage.getItem('currentAwardDashboardTab');
		this.clearPiField = new String('true');
		this.lookupValues = [];
		this._awardListService.awardRequestExtraDetails.fullName = '';
		this._awardListService.awardRequestExtraDetails.grantCallName = '';
		this._awardListService.awardRequestExtraDetails.unitName = '';
		this.isEmployeeFlag = true;
		this.setElasticPersonOption();
		this._awardListService.awardRequestObject.advancedSearch = 'L';
		this.switchAdvanceSearchProperties(this.tempAwardRequestObject, this._awardListService.awardRequestObject);
	}

	awardTabChange(currentTab: string) {
		this._awardListService.awardRequestObject.tabName = currentTab;
		sessionStorage.setItem('currentAwardDashboardTab', currentTab);
		this._awardListService.awardRequestObject.currentPage = 1;
		this._awardListService.isAdvanceSearch = false;
		this.setAdvanceSearch();
		this.clearAdvanceSearchList();
		this.resetSortObjects();
		this.$awardList.next();
	}

	resetSortObjects() {
		this.sortMap = {};
		this.sortCountObj = {
			'awardNumber': 0, 'accountNumber': 0, 'title': 0, 'leadUnit.unitName': 0, 'sponsor.sponsorName': 0,
			'awardPersons.fullName': 0, 'awardDocumentType.description': 0, 'awardSequenceStatus': 0, 'awardVariationType': 0,
			'sponsorAwardNumber': 0, 'awardStatus.description': 0
		};
	}

	searchAward() {
		this._awardListService.awardRequestObject.currentPage = 1;
		this.switchAdvanceSearchProperties(this._awardListService.awardRequestObject, this.tempAwardRequestObject);
		this._awardListService.awardRequestObject.advancedSearch = 'A';
		this._awardListService.awardRequestExtraDetails.isEmployeeFlag = this.isEmployeeFlag;
		this._awardListService.awardRequestExtraDetails.fullName = this.tempAwardRequestObject.fullName || '';
		this._awardListService.awardRequestExtraDetails.unitName = this.tempAwardRequestObject.unitName || '';
		this._awardListService.awardRequestExtraDetails.grantCallName = this.tempAwardRequestObject.grantCallName || '';
		this.searchUsingAdvanceOptions();
	}

	switchAdvanceSearchProperties(destination, source) {
		destination.property1 = source.property1 || '';
		destination.property2 = source.property2 || '';
		destination.property3 = source.property3 || '';
		destination.property4 = source.property4 || '';
		destination.property5 = source.property5 || '';
		destination.property6 = source.property6 || '';
		destination.property7 = source.property7 || '';
		destination.property8 = source.property8;
		destination.property9 = source.property9 || '';
		destination.property10 = source.property10 || '';
		destination.property11 = source.property11;
		destination.property12 = source.property12 || '';
		destination.property13 = source.property13;
		destination.property14 = source.property14;
		destination.property15 = source.property15;
	}

	getAwardSectionConfig(moduleCode: string) {
		this._commonService.getDashboardActiveModules(moduleCode).subscribe(data => {
			this.awardSectionConfig = this._commonService.getSectionCodeAsKeys(data);
		});
	}
}
