// last updated by Aravind on 20-10-2020
import { Component, OnDestroy, OnInit } from '@angular/core';
import { itemAnim } from '../../common/utilities/animations';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { getSponsorSearchDefaultValue, openInNewTab, pageScroll, setFocusToElement } from '../../common/utilities/custom-utilities';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { Subject, Subscription } from 'rxjs';
import { ClaimListService } from './claim-list.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
    compareDates,
    compareDatesWithoutTimeZone,
    getDateObjectFromTimeStamp,
    getDuration,
    parseDateWithoutTimestamp
} from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ElasticConfigService } from './../../common/services/elastic-config.service';
import { getEndPointOptionsForSponsor, getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { concatUnitNumberAndUnitName } from '../../common/utilities/custom-utilities';

declare var $: any;


@Component({
    selector: 'app-claim-list',
    templateUrl: './claim-list.component.html',
    styleUrls: ['./claim-list.component.css'],
    animations: [itemAnim]
})
export class ClaimListComponent implements OnInit, OnDestroy {

    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    $claimList = new Subject();
    result: any = {};
    claimRequestList: any = [];
    selectedAwardDetails: any = {};
    sortCountObject: any = {};
    sortMap: any = {};
    claimRequestObject: any = {};
    claimMap = new Map();
    dateWarningList: any = [];
    claimType: string = null;
    isClaimable = false;
    isClaimDelete = false;
    isSaving = false;
    leadUnitSearchOptions: any = {};
    fundingAgencySearchOptions: any = {};
    clearFieldLeadUnit: String;
    clearFieldFundingAgency: String;
    clearPiField: String;
    clearClaimPreparerField: String;
    clearFinanceField: String;
    elasticPersonSearchOptions: any = {};
    elasticClaimPreparerSearchOptions: any = {};
    elasticFinanceSearchOptions: any = {};
    isEmployeeFlag = true;
    tempDashboardRequestObject: any = {
        property1: '',
        property2: '',
        property3: '',
        property4: '',
        property6: '',
        property8: [],
        property9: '',
        property10: '',
        property13: '',
        leadUnit: '',
        fullName: '',
        finOfficerFullName: '',
        preparerFullName: ''
    };
    lookupValues: any = {};
    claimStatusOptions = 'CLAIM_STATUS#CLAIM_STATUS_CODE#true#true';
    removeObject: any = {};
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    constructor(private _commonService: CommonService, public _claimListService: ClaimListService,
        private _elasticConfig: ElasticConfigService, private _navigationService: NavigationService) {
    }

    ngOnInit() {
        this.setDashboardTab();
        this.loadDashboard();
        this.setSortProperties();
        this.setClaimRights();
        this.leadUnitSearchOptions = getEndPointOptionsForDepartment();
        this.fundingAgencySearchOptions = getEndPointOptionsForSponsor();
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.elasticClaimPreparerSearchOptions = this._elasticConfig.getElasticForPerson();
        this.elasticFinanceSearchOptions = this._elasticConfig.getElasticForPerson();
        this.checkForAdvanceSearch();
        this.$claimList.next();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /** Check if previous url includesfibi/claims, if not then clear Advanced Search fields */
    checkForAdvanceSearch() {
        if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/claims')) {
            this.fetchDashboardDataToTempObject();
            this.setDefaultValueForCustomLibrarySearch();
            this.generateLookupArrayForDropdown();
            this._claimListService.dashboardRequestObject.advancedSearch = 'A';
            document.getElementById('collapseClaims').classList.add('show');
        } else {
            this.resetSortObjects();
            this.clearAdvanceSearchField();
        }
    }

    resetSortObjects() {
        this.sortCountObject = {
            'claimNumber': 0, 'awardNumber': 0, 'accountNumber': 0, 'title': 0, 'leadUnit.unitName': 0,
            'sponsor.sponsorName': 0, 'claimStatus.description': 0,
            'awardPersons.fullName': 0, 'claimSubmissionDate': 0, 'createUserName': 0, 'updateUserName': 0
        };
        this.sortMap = {};
    }

    /** temparory object is used other than using the same service object here because
     * If user provide a field in Advanced Search and without clicking on search button user choose a record from the list,
     * In this case when clicks on back icon and comes to dashboard list, previously done search list result should be displayed.
     * Logic : save new search criteria only if search button is clicked.
     */
    fetchDashboardDataToTempObject() {
        this.tempDashboardRequestObject.property1 = this._claimListService.dashboardRequestObject.property1 || '';
        this.tempDashboardRequestObject.property2 = this._claimListService.dashboardRequestObject.property2 || '';
        this.tempDashboardRequestObject.property3 = this._claimListService.dashboardRequestObject.property3 || '';
        this.tempDashboardRequestObject.property4 = this._claimListService.dashboardRequestObject.property4 || '';
        this.tempDashboardRequestObject.property6 = this._claimListService.dashboardRequestObject.property6 || '';
        this.tempDashboardRequestObject.property8 = this._claimListService.dashboardRequestObject.property8 || [];
        this.tempDashboardRequestObject.property9 = this._claimListService.dashboardRequestObject.property9 || '';
        this.tempDashboardRequestObject.property10 = this._claimListService.dashboardRequestObject.property10 || '';
        this.tempDashboardRequestObject.property13 = this._claimListService.dashboardRequestObject.property13 || '';
        this.tempDashboardRequestObject.fullName = this._claimListService.dashboardRequestExtraData.fullName || '';
        this.tempDashboardRequestObject.leadUnit = this._claimListService.dashboardRequestExtraData.leadUnit || '';
        this.tempDashboardRequestObject.finOfficerFullName = this._claimListService.dashboardRequestExtraData.finOfficerFullName || '';
        this.tempDashboardRequestObject.preparerFullName = this._claimListService.dashboardRequestExtraData.preparerFullName || '';
        this.isEmployeeFlag = this._claimListService.dashboardRequestExtraData.isEmployeeFlag;
        (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    }

    isAdvancedSearchMade() {
        if (this._claimListService.dashboardRequestObject.property1 || this._claimListService.dashboardRequestObject.property2 ||
            this._claimListService.dashboardRequestObject.property3 || this._claimListService.dashboardRequestObject.property4 ||
            this._claimListService.dashboardRequestObject.property6 || this._claimListService.dashboardRequestObject.property8.length ||
            this._claimListService.dashboardRequestObject.property9 || this._claimListService.dashboardRequestObject.property10 ||
            this._claimListService.dashboardRequestObject.property13 || this._claimListService.dashboardRequestObject.property11.length
        ) {
            return true;
        } else {
            return false;
        }
    }

    /* Setting default value for end-point, elastic search, so to display in UI. */
    setDefaultValueForCustomLibrarySearch() {
        this.leadUnitSearchOptions.defaultValue = this._claimListService.dashboardRequestExtraData.leadUnit;
        this.fundingAgencySearchOptions.defaultValue = this._claimListService.sponsorAdvanceSearchDefaultValue;
        this.elasticPersonSearchOptions.defaultValue = this._claimListService.dashboardRequestExtraData.fullName;
        this.elasticClaimPreparerSearchOptions.defaultValue = this._claimListService.dashboardRequestExtraData.preparerFullName;
        this.elasticFinanceSearchOptions.defaultValue = this._claimListService.dashboardRequestExtraData.finOfficerFullName;
    }

    setDashboardTab() {
        this._claimListService.dashboardRequestObject.tabName = sessionStorage.getItem('currentClaimsDashboardTab')
            ? sessionStorage.getItem('currentClaimsDashboardTab') : 'PENDING_CLAIMS';
    }

    loadDashboard() {
        this.$subscriptions.push(this.$claimList.pipe(
            switchMap(() => this._claimListService.getClaimDashBoardList(this._claimListService.dashboardRequestObject)))
            .subscribe((data: any) => {
                this.result = data || [];
                if (this.result) {
                    this.claimRequestList = this.result.awardViews;
                }
            }));
    }

    setSortProperties() {
        this.resetSortObjects();
        this.sortCountObject = (Object.entries(this._claimListService.sortCountObject).length === 0) ?
            this.sortCountObject : this._claimListService.sortCountObject;
        this.sortMap = (Object.entries(this._claimListService.dashboardRequestObject.sort).length === 0) ?
            this.sortMap : this._claimListService.dashboardRequestObject.sort;
    }

    async setClaimRights() {
        this.isClaimable = await this._commonService.checkPermissionAllowed('CLAIM_PREPARER');
        this.isClaimDelete = await this._commonService.checkPermissionAllowed('DELETE_CLAIM');
    }

    setCurrentTab(tabName: string) {
        this._claimListService.dashboardRequestObject.tabName = tabName;
        sessionStorage.setItem('currentClaimsDashboardTab', this._claimListService.dashboardRequestObject.tabName);
        this.claimRequestList = [];
        this.clearAdvanceSearchField();
        this._claimListService.dashboardRequestObject.sort = {};
        this._claimListService.dashboardRequestObject.sortBy = '';
        this.resetSortObjects();
        if (this._claimListService.dashboardRequestObject.tabName === 'QUALIFIED_CLAIMS' ||
            this._claimListService.dashboardRequestObject.tabName === 'MANUAL_QUALIFIED_CLAIMS') {
            if (this._claimListService.dashboardRequestObject.tabName === 'QUALIFIED_CLAIMS') {
                this._claimListService.dashboardRequestObject.property9 = '';
                this.clearClaimPreparerField = new String('true');
            }
            this._claimListService.dashboardRequestObject.property13 = '';
            this.tempDashboardRequestObject.property13 = '';
        } else {
            this._claimListService.dashboardRequestObject.property10 = '';
            this.clearFinanceField = new String('true');
        }
        if (this._claimListService.dashboardRequestObject.advancedSearch === 'L') {
            document.getElementById('collapseClaims').classList.remove('show');
        }
        this.$claimList.next();
        this._claimListService.dashboardRequestObject.currentPage = 1;
    }

    actionsOnPageChange(event) {
        this._claimListService.dashboardRequestObject.currentPage = event;
        this.$claimList.next();
        pageScroll('pageScrollToTop');
    }

    /**
     * Start date is set based on whether last claim is present or not
     * If last claim End date is present one day (86400000) is added with
     * last claim End date and set as start date
     * ClaimType "S" => System Generated, "D" => Manual Generated.
     */
    createNewClaim(details, claimType) {
        this.claimMap.clear();
        this.dateWarningList = [];
        this.claimRequestObject = {};
        this.claimType = claimType;
        this.selectedAwardDetails = details;
        this.claimRequestObject.startDate = this.selectedAwardDetails.lastClaimEndDate ?
            getDateObjectFromTimeStamp(this.selectedAwardDetails.lastClaimEndDate + 86400000) : null;
        $('#claim-modal').modal('show');
    }

    setClaimsObject() {
        this.claimRequestObject.awardId = this.selectedAwardDetails.awardId;
        this.claimRequestObject.createUser = this._commonService.getCurrentUserDetail('userName');
        this.differenceBetweenDates(this.claimRequestObject.startDate, this.claimRequestObject.endDate);
        this.claimRequestObject.startDate = parseDateWithoutTimestamp(this.claimRequestObject.startDate);
        this.claimRequestObject.endDate = parseDateWithoutTimestamp(this.claimRequestObject.endDate);
        if (this.claimType === 'D') {
            this.claimRequestObject.claimSubmissionDate = parseDateWithoutTimestamp(this.claimRequestObject.claimSubmissionDate);
        }
    }

    differenceBetweenDates(startDate, endDate) {
        const DATE_OBJECT = getDuration(startDate, endDate);
        this.claimRequestObject.duration = DATE_OBJECT.durInYears + ' year(s), ' +
            DATE_OBJECT.durInMonths + ' month(s) & ' + DATE_OBJECT.durInDays + ' day(s)';
    }

    addNewClaim() {
        if (this.claimValidation() && this.claimCreateDateValidation() && !this.isSaving) {
            this.isSaving = true;
            this.setClaimsObject();
            this.$subscriptions.push(this._claimListService.saveOrUpdateClaim(this.claimRequestObject, this.claimType)
                .subscribe((data: any) => {
                    this.claimRequestObject = {};
                    $('#claim-modal').modal('hide');
                    openInNewTab('claims/overview?', ['claimId'], [data.claim.claimId]);
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to claim! Please try again.');
                    this.claimRequestObject = {};
                    $('#claim-modal').modal('hide');
                    this.isSaving = false;
                }));
        }
    }

    claimValidation() {
        this.claimMap.clear();
        if (!this.claimRequestObject.title) {
            this.claimMap.set('title', 'title');
        }
        if (!this.claimRequestObject.startDate) {
            this.claimMap.set('startDate', 'startDate');
        }
        if (!this.claimRequestObject.endDate) {
            this.claimMap.set('endDate', '* Please pick a End Date.');
        } else {
            this.validateEndDate();
        }
        if (this.claimType === 'D') {
            if (!this.claimRequestObject.claimSubmissionDate) {
                this.claimMap.set('claimSubmissionDate', 'claimSubmissionDate');
            }
            if (!this.claimRequestObject.totalAmount || this.claimRequestObject.totalAmount === '0') {
                this.claimMap.set('totalAmount', 'totalAmount');
            }
        }
        this.claimCreateDateValidation();
        return this.claimMap.size > 0 ? false : true;
    }

    validateEndDate() {
        this.claimMap.delete('endDate');
        if (this.claimRequestObject.startDate && this.claimRequestObject.endDate) {
            if (compareDates(this.claimRequestObject.startDate, this.claimRequestObject.endDate) === 1) {
                this.claimMap.set('endDate', '* Please select an end date after start date');
            }
        }
    }

    /**
     * ClaimType "S" => System Generated, "D" => Manual Generated.
     */
    navigateToClaim(details) {
        if (this._claimListService.dashboardRequestObject.tabName !== 'QUALIFIED_CLAIMS' &&
            this._claimListService.dashboardRequestObject.tabName !== 'MANUAL_QUALIFIED_CLAIMS') {
            openInNewTab('claims/overview?', ['claimId'], [details.claimId]);
        } else {
            if (this.isClaimable) {
                this.createNewClaim(details, this._claimListService.dashboardRequestObject.tabName === 'QUALIFIED_CLAIMS' ? 'S' : 'D');
            }
        }
    }

    /** sorts results based on fields
      * @param sortFieldBy
      */
    sortResult(sortFieldBy) {
        this.sortCountObject[sortFieldBy]++;
        this._claimListService.dashboardRequestObject.sortBy = sortFieldBy;
        if (this.sortCountObject[sortFieldBy] < 3) {
            if (this._claimListService.dashboardRequestObject.sortBy === sortFieldBy) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
            }
        } else {
            this.sortCountObject[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this._claimListService.dashboardRequestObject.sort = this.sortMap;
        this._claimListService.sortCountObject = this.sortCountObject;
        this.$claimList.next();
    }

    claimCreateDateValidation() {
        this.dateWarningList = [];
        this.selectedAwardDetails.lastClaimEndDate ? this.validationBasedOnLastClaim() : this.validationBasedOnAwardDate();
        return this.dateWarningList.length > 0 ? false : true;
    }

    validationBasedOnAwardDate() {
        if (this.claimRequestObject.startDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.selectedAwardDetails.awardStartDate),
                this.claimRequestObject.startDate) === 1) {
                this.dateWarningList.push('* Choose a From Date on or after the Award Start Date');
            }
        }
        if (this.claimRequestObject.endDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.selectedAwardDetails.awardStartDate),
                this.claimRequestObject.endDate) === 1) {
                this.dateWarningList.push('* Choose a To Date on or after the Award Start Date');
            }
        }
    }

    validationBasedOnLastClaim() {
        if (this.claimRequestObject.startDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.selectedAwardDetails.lastClaimEndDate),
                this.claimRequestObject.startDate) === 1) {
                this.dateWarningList.push('* Choose a From Date on or after the Last Claimed Date');
            }
        } if (this.claimRequestObject.endDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.selectedAwardDetails.lastClaimEndDate),
                this.claimRequestObject.endDate) === 1) {
                this.dateWarningList.push('* Choose a To Date on or after the Last Claimed Date');
            }
        }
    }

    clearAdvanceSearchField() {
        this._claimListService.dashboardRequestObject.property1 = '';
        this.clearLeadUnitForAdancedSearch();
        this.clearFundungAgencyForAdancedSearch();
        this._claimListService.dashboardRequestObject.property4 = '';
        this._claimListService.dashboardRequestObject.property6 = '';
        this._claimListService.dashboardRequestObject.property8 = [];
        this._claimListService.dashboardRequestObject.property9 = '';
        this._claimListService.dashboardRequestObject.property10 = '';
        this._claimListService.dashboardRequestObject.property13 = '';
        this.clearPiField = new String('true');
        this.clearClaimPreparerField = new String('true');
        this.clearFinanceField = new String('true');
        this.lookupValues = [];
        this._claimListService.dashboardRequestObject.advancedSearch = 'L';
        this._claimListService.dashboardRequestExtraData.leadUnit = '';
        this._claimListService.dashboardRequestExtraData.fullName = '';
        this._claimListService.dashboardRequestExtraData.finOfficerFullName = '';
        this._claimListService.dashboardRequestExtraData.preparerFullName = '';
        this._claimListService.dashboardRequestExtraData.isEmployeeFlag = true;
        this.tempDashboardRequestObject.property1 = '';
        this.tempDashboardRequestObject.property2 = '';
        this.tempDashboardRequestObject.property3 = '';
        this.tempDashboardRequestObject.property4 = '';
        this.tempDashboardRequestObject.property6 = '';
        this.tempDashboardRequestObject.property8 = [];
        this.tempDashboardRequestObject.property9 = '';
        this.tempDashboardRequestObject.property10 = '';
        this.tempDashboardRequestObject.property13 = '';
        this.tempDashboardRequestObject.leadUnit = '';
        this.tempDashboardRequestObject.fullName = '';
        this.tempDashboardRequestObject.preparerFullName = '';
        this.tempDashboardRequestObject.finOfficerFullName = '';
        this.isEmployeeFlag = true;
        this.setElasticPersonOption();

    }

    setLeadUnitForAdancedSearch(event) {
        this.tempDashboardRequestObject.property2 = event ? event.unitNumber : null;
        this.tempDashboardRequestObject.leadUnit = event ? event.unitName : '';
    }
    setFundungAgencyForAdancedSearch(event) {
        this._claimListService.sponsorAdvanceSearchDefaultValue = event ? getSponsorSearchDefaultValue(event) : '';
        this.tempDashboardRequestObject.property3 = event ? event.sponsorCode : null;
    }
    clearLeadUnitForAdancedSearch() {
        this._claimListService.dashboardRequestObject.property2 = null;
        this.clearFieldLeadUnit = new String('true');
    }
    clearFundungAgencyForAdancedSearch() {
        this._claimListService.sponsorAdvanceSearchDefaultValue = '';
        this._claimListService.dashboardRequestObject.property3 = null;
        this.clearFieldFundingAgency = new String('true');
    }

    selectedFilter(event) {
        this.tempDashboardRequestObject.fullName = event ? event.full_name : '';
        this.tempDashboardRequestObject.property4 = event ? this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id : '';
    }

    selectedClaimPreparerFilter(event) {
        this.tempDashboardRequestObject.property9 = event ? event.prncpl_nm : '';
        this.tempDashboardRequestObject.preparerFullName = event ? event.full_name : '';
    }

    selectedFinanceFilter(event) {
        this.tempDashboardRequestObject.property10 = event ? event.prncpl_id : '';
        this.tempDashboardRequestObject.finOfficerFullName = event ? event.full_name : '';
    }

    /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
    changeMemberType() {
        this.tempDashboardRequestObject.property4 = '';
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

    emptyValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this.tempDashboardRequestObject.property4 = '';
        }
    }

    emptyClaimPreparerValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this.tempDashboardRequestObject.property9 = '';
        }
    }

    emptyFinanceValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this.tempDashboardRequestObject.property10 = '';
        }
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

    /** searches using advance search options */
    advancedSearch() {
        this._claimListService.dashboardRequestObject.advancedSearch = 'A';
        this.$claimList.next();
    }

    setAdvanceSearchValuesToServiceObject() {
        this._claimListService.dashboardRequestObject.property1 = this.tempDashboardRequestObject.property1 || '';
        this._claimListService.dashboardRequestObject.property2 = this.tempDashboardRequestObject.property2 || '';
        this._claimListService.dashboardRequestObject.property3 = this.tempDashboardRequestObject.property3 || '';
        this._claimListService.dashboardRequestObject.property4 = this.tempDashboardRequestObject.property4 || '';
        this._claimListService.dashboardRequestObject.property6 = this.tempDashboardRequestObject.property6 || '';
        this._claimListService.dashboardRequestObject.property8 = this.tempDashboardRequestObject.property8;
        this._claimListService.dashboardRequestObject.property9 = this.tempDashboardRequestObject.property9 || '';
        this._claimListService.dashboardRequestObject.property10 = this.tempDashboardRequestObject.property10 || '';
        this._claimListService.dashboardRequestObject.property13 = this.tempDashboardRequestObject.property13 || '';
        this._claimListService.dashboardRequestExtraData.leadUnit = this.tempDashboardRequestObject.leadUnit || '';
        this._claimListService.dashboardRequestExtraData.fullName = this.tempDashboardRequestObject.fullName || '';
        this._claimListService.dashboardRequestExtraData.finOfficerFullName = this.tempDashboardRequestObject.finOfficerFullName || '';
        this._claimListService.dashboardRequestExtraData.preparerFullName = this.tempDashboardRequestObject.preparerFullName || '';
        this._claimListService.dashboardRequestExtraData.isEmployeeFlag = this.isEmployeeFlag;
    }
    /**
   * @param  {} data
   * @param  {} template
   * to get the values of the lookups in advanced search which returns string value
   */
    onLookupSelect(data, template) {
        this.lookupValues[template] = data;
        this.tempDashboardRequestObject[template] = data.length ? data.map(d => d.code) : [];
    }

    generateLookupArrayForDropdown() {
        if (this._claimListService.dashboardRequestObject.property8.length) {
            this.generateLookupArray(this._claimListService.dashboardRequestObject.property8, 'property8');
        }
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        property.forEach(element => {
            this.lookupValues[propertyNumber].push({ code: element });
        });
    }

    deleteClaimTempObject(claimId, index, awardId, unitNumber, claimStatusCode) {
        $('#deleteClaimModal').modal('show');
        this.removeObject.claimId = claimId;
        this.removeObject.index = index;
        this.removeObject.awardId = awardId;
        this.removeObject.unitNumber = unitNumber;
        this.removeObject.claimStatusCode = claimStatusCode;
    }

    deleteClaim() {
        if (!this.isSaving) {
            this.$subscriptions.push(this._claimListService.deleteClaimDetail(this.removeObject)
                .subscribe((data: any) => {
                    if (data.status) {
                        this.claimRequestList.splice(this.removeObject.index, 1);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim deleted Successfully.');
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, `You don't have the right to delete this claim.`);
                    }
                    this.isSaving = false;
                }, err => {
                    if (err && err.status === 405) {
                        $('#invalidActionModalInClaims').modal('show');
                    }
                    this.isSaving = false;
                }));
        }
    }

    reload() {
        window.location.reload();
      }
}
