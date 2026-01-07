import { NavigationService } from './../../common/services/navigation.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { itemAnim } from '../../common/utilities/animations';
import { openInNewTab, pageScroll, fileDownloader } from '../../common/utilities/custom-utilities';
import { GrantListService } from './grant-list.service';

declare var $: any;

@Component({
  selector: 'app-grant-list',
  templateUrl: './grant-list.component.html',
  styleUrls: ['./grant-list.component.css'],
  animations: [itemAnim]
})
export class GrantListComponent implements OnInit, OnDestroy {

  metadataForCalendarView: any = {
    headers: { 'Title': 'grantCallName', 'Sponsor': 'sponsorName' },
    dates: { 'Opening Date': 'openingDate', 'Closing Date': 'closingDate' },
    color: { 'Opening Date': '#55ce55', 'Closing Date': '#ff6666' },
    fill: {},
    fillColor: 'blue',
    yearRange: 2,
    showDate: true
  };

  isReverse = true;
  isShowCopyWarningModal = false;
  isShowAdvanceSearchOptions = false;
  isShowGrantCallResultCard = false;
  isSwitchCalendar = false;

  serviceRequestList: any[] = null;
  result: any = {};
  grantCallElasticSearchObject: any = {};
  grantCallElasticSearchOptions: any = {};
  sortMap: any = {};
  sortCountObj: any = {};
  clearField: String;
  grantId: number;
  grantCallIndex: number;
  isCreateGrantCall = false;
  isDeleteGrantCall = false;
  isModifyGrantCall = false;
  filterValues: any = {};
  lookupValues: any = {};
  $subscriptions: Subscription[] = [];
  grantCallTypeOptions = 'GRANT_CALL_TYPE#GRANT_TYPE_CODE#true';
  grantCallTypeColumnName = 'GRANT_TYPE_CODE';
  grantCallStatusOptions = 'GRANT_CALL_STATUS#GRANT_STATUS_CODE#true';
  grantCallStatusColumnName = 'GRANT_STATUS_CODE';
  relevantFieldOptions = 'RELEVANT_FIELD#RELEVANT_FIELD_CODE#true';
  relevantFieldColumnName = 'RELEVANT_FIELD_CODE';
  fundingAgencyOptions = 'SPONSOR#SPONSOR_CODE#true';
  fundingAgencyColumnName = 'SPONSOR_CODE';
  pageScroll = pageScroll;
  tempGrantCallRequestObject = {
    property1: '',
    property2: '',
    property3: [],
    property4: '',
    property5: [],
    property6: [],
    property7: '',
    property13: '',
    property14: '',
  };

  constructor(public _grantlistService: GrantListService, private _router: Router,
    private _elasticConfig: ElasticConfigService, public _commonService: CommonService, private _navigationService: NavigationService) {
  }

  async ngOnInit() {
    this.getPermissions();
    this.grantCallElasticSearchOptions = this._elasticConfig.getElasticForGrantCall();
    this.isCreateGrantCall = await this._commonService.checkPermissionAllowed('CREATE_GRANT_CALL');
    if (!this._navigationService.previousURL.includes('fibi/grant')) {
      this._grantlistService.grantCallRequestServiceObject.sort = {};
      this._grantlistService.grantCallRequestServiceObject.sortBy = '';
    }
    this.setSortProperties();
    this.checkForAdvanceSearch();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** Check if previous url is fibi/grant, if not then clear Advanced Search fields */
  checkForAdvanceSearch() {
    if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/grant')) {
      document.getElementById('collapseGrantCall').classList.add('show');
      this.fetchDashboardDataToTempObject();
      this.generateLookupArrayForDropdown();
      this.loadDashboard(1, 'A');
    } else {
      this.clearAdvanceSearchField();
      this.loadDashboard(1, 'L');
      this.resetSortObject();
    }
  }

  isAdvancedSearchMade() {
    if (this._grantlistService.grantCallRequestServiceObject.property1 || this._grantlistService.grantCallRequestServiceObject.property2 ||
      this._grantlistService.grantCallRequestServiceObject.property3.length ||
      this._grantlistService.grantCallRequestServiceObject.property4 ||
      this._grantlistService.grantCallRequestServiceObject.property5.length ||
      this._grantlistService.grantCallRequestServiceObject.property6.length ||
      this._grantlistService.grantCallRequestServiceObject.property7 ||
      this._grantlistService.grantCallRequestServiceObject.property13 ||
      this._grantlistService.grantCallRequestServiceObject.property14) {
      return true;
    } else  {
      return false;
    }
  }

  /** temparory object is used other than using the same service object here because
    * If user provide a field in Advanced Search and without clicking on search button user choose a record from the list,
    * In this case when clicks on back icon and comes to dashboard list, previously done search list result should be displayed.
    * Logic : save new search criteria only if search button is clicked.
    */
  fetchDashboardDataToTempObject() {
    this.tempGrantCallRequestObject.property1 = this._grantlistService.grantCallRequestServiceObject.property1 ?
      this._grantlistService.grantCallRequestServiceObject.property1 : '';
    this.tempGrantCallRequestObject.property2 = this._grantlistService.grantCallRequestServiceObject.property2 ?
      this._grantlistService.grantCallRequestServiceObject.property2 : '';
    this.tempGrantCallRequestObject.property3 = this._grantlistService.grantCallRequestServiceObject.property3.length > 0 ?
      this._grantlistService.grantCallRequestServiceObject.property3 : [];
    this.tempGrantCallRequestObject.property4 = this._grantlistService.grantCallRequestServiceObject.property4 ?
      this._grantlistService.grantCallRequestServiceObject.property4 : '';
    this.tempGrantCallRequestObject.property5 = this._grantlistService.grantCallRequestServiceObject.property5.length > 0 ?
      this._grantlistService.grantCallRequestServiceObject.property5 : [];
    this.tempGrantCallRequestObject.property6 = this._grantlistService.grantCallRequestServiceObject.property6.length > 0 ?
      this._grantlistService.grantCallRequestServiceObject.property6 : [];
    this.tempGrantCallRequestObject.property7 = this._grantlistService.grantCallRequestServiceObject.property7 ?
      this._grantlistService.grantCallRequestServiceObject.property7 : '';
  }

  /** Creating lookupValue array for lookup field and Advance search  */
  generateLookupArrayForDropdown() {
    if (this._grantlistService.grantCallRequestServiceObject.property3.length) {
      this.generateLookupArray(this._grantlistService.grantCallRequestServiceObject.property3, 'property3');
    }
    if (this._grantlistService.grantCallRequestServiceObject.property5.length) {
      this.generateLookupArray(this._grantlistService.grantCallRequestServiceObject.property5, 'property5');
    }
    if (this._grantlistService.grantCallRequestServiceObject.property6.length) {
      this.generateLookupArray(this._grantlistService.grantCallRequestServiceObject.property6, 'property6');
    }
  }

  generateLookupArray(property, propertyNumber) {
    this.lookupValues[propertyNumber] = [];
    property.forEach(element => {
      this.lookupValues[propertyNumber].push({ code: element });
    });
  }
  /** navigate to create grant page
     * @param event
     * @param mode
     */
  createGrant(mode) {
    // quick fix by Sarath
    localStorage.removeItem('selectedGrantTab');
    this._router.navigate(['fibi/grant'], { queryParams: { 'mode': mode } });
  }

  /** fetch grant call list */
  loadDashboard(pageNumber, searchType) {
    this._grantlistService.grantCallRequestServiceObject.isCalenderRequired = this.isSwitchCalendar;
    this._grantlistService.grantCallRequestServiceObject.currentPage = pageNumber;
    this._grantlistService.grantCallRequestServiceObject.advancedSearch = searchType;
    this.$subscriptions.push(this._grantlistService.getGrantCallDashBoardList(this._grantlistService.grantCallRequestServiceObject)
      .subscribe(data => {
        this.result = data;
        this.serviceRequestList = this.result && this.result.grantCalls || [];
      }, (err) => {
        if (err.status === 400) {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Grant Call list fetching failed. Please try again.');
        }
      }));
  }

  setAdvanceSearchValuesToServiceObject() {
    this._grantlistService.grantCallRequestServiceObject.property1 = this.tempGrantCallRequestObject.property1 || '';
    this._grantlistService.grantCallRequestServiceObject.property2 = this.tempGrantCallRequestObject.property2 || '';
    this._grantlistService.grantCallRequestServiceObject.property3 = this.tempGrantCallRequestObject.property3;
    this._grantlistService.grantCallRequestServiceObject.property4 = this.tempGrantCallRequestObject.property4 || '';
    this._grantlistService.grantCallRequestServiceObject.property5 = this.tempGrantCallRequestObject.property5;
    this._grantlistService.grantCallRequestServiceObject.property6 = this.tempGrantCallRequestObject.property6;
    this._grantlistService.grantCallRequestServiceObject.property7 = this.tempGrantCallRequestObject.property7 || '';
  }


  clearAdvanceSearchField() {
    this._grantlistService.grantCallRequestServiceObject.property1 = '';
    this._grantlistService.grantCallRequestServiceObject.property2 = '';
    this._grantlistService.grantCallRequestServiceObject.property3 = [];
    this._grantlistService.grantCallRequestServiceObject.property4 = '';
    this._grantlistService.grantCallRequestServiceObject.property5 = [];
    this._grantlistService.grantCallRequestServiceObject.property6 = [];
    this._grantlistService.grantCallRequestServiceObject.property7 = '';
    this._grantlistService.grantCallRequestServiceObject.currentPage = 1;
    this.lookupValues = [];
    this.tempGrantCallRequestObject.property1 = '';
    this.tempGrantCallRequestObject.property2 = '';
    this.tempGrantCallRequestObject.property3 = [];
    this.tempGrantCallRequestObject.property4 = '';
    this.tempGrantCallRequestObject.property5 = [];
    this.tempGrantCallRequestObject.property6 = [];
    this.tempGrantCallRequestObject.property7 = '';
  }

  /**navigates to grant call details page
   * @param event
   * @param grantId
   */
  viewGrantById(grantDetails: any) {
    localStorage.setItem('selectedGrantTab', 'GRANT_CALL');
    this._router.navigate(['fibi/grant'], { queryParams: { 'grantId': grantDetails.grantCallId } });
  }
  /**
   * navigateToGrantCall is created to load selected Grant Call in new tab. Currently implemented for Advanced Search Only
   * @param grantCallId
   */
  navigateToGrantCall(grantCallId) {
    localStorage.setItem('selectedGrantTab', 'GRANT_CALL');
    openInNewTab('grant/overview?', ['grantId'], [grantCallId]);
  }

  tempryCopyGrantCall(grantId) {
    this.grantId = grantId;
    this.isShowCopyWarningModal = true;
  }


  copyGrantCall() {
    this.$subscriptions.push(this._grantlistService.copyGrantCall({
      'grantCallId': this.grantId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((success: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call has been copied successfully.');
      openInNewTab('grant/overview?', ['grantId'], [success.grantCallId]);
    }));
    this.clearGrantCallModalFlags();
  }
  /**
  * @param  {any} event
  * restricts inputs other than numbers
  */
  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  showAdvanceSearch(event: any) {
    event.preventDefault();
    this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
  }

  selectGrantCallElasticResult(value) {
    if (value) {
      this.isShowGrantCallResultCard = true;
      this.isShowAdvanceSearchOptions = false;
      this.grantCallElasticSearchObject = value;
    } else {
      this.isShowGrantCallResultCard = false;
      this.grantCallElasticSearchObject = {};
    }
  }

  /** sorts results based on fields
  * @param sortFieldBy
  */
  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    this._grantlistService.grantCallRequestServiceObject.sortBy = sortFieldBy;
    if (this.sortCountObj[sortFieldBy] < 3) {
      if (this._grantlistService.grantCallRequestServiceObject.sortBy === sortFieldBy) {
        this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
      }
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this._grantlistService.grantCallRequestServiceObject.sort = this.sortMap;
    this._grantlistService.sortCountObj = this.sortCountObj;
    this.loadDashboard(1, this.isAdvancedSearchMade() ? 'A' : 'L');
  }

  /* temporary save grant id before deletion */
  temprySaveGrantCall(grantcallId, i) {
    this.grantId = grantcallId;
    this.grantCallIndex = i;
  }

  /* deletes grantcall */
  deleteGrantCall() {
    this.$subscriptions.push(this._grantlistService.deleteGrantcall({ 'grantCallId': this.grantId }).subscribe((success: any) => {
      if (success.message === 'GrantCall deleted successfully') {
        this.serviceRequestList.splice(this.grantCallIndex, 1);
      }
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call deleted successfully.');
    }));
  }

  clearGrantCallModalFlags() {
    this.isShowCopyWarningModal = false;
  }

  /*To get system level permissions for grantcall and load dashboard */
  async getPermissions() {
    this.isModifyGrantCall = await this._commonService.checkPermissionAllowed('MODIFY_GRANT_CALL');
    this.isDeleteGrantCall = await this._commonService.checkPermissionAllowed('DELETE_GRANT_CALL');
  }

  setSortProperties() {
  this.resetSortObject();
    this.sortCountObj = (Object.entries(this._grantlistService.sortCountObj).length === 0) ?
      this.sortCountObj : this._grantlistService.sortCountObj;
    this.sortMap = (Object.entries(this._grantlistService.grantCallRequestServiceObject.sort).length === 0) ?
      this.sortMap : this._grantlistService.grantCallRequestServiceObject.sort;
  }
  /**
   * @param  {} data
   * @param  {} template
   * to get the values of the lookups in advanced search which returns string value
   */
  onLookupSelect(data, template) {
    this.lookupValues[template] = data;
    this.tempGrantCallRequestObject[template] = data.length ? data.map(d => d.code) : [];
  }

  /**
   * @param  {} grant
   * @param  {} index
   * To check whether proposals are linked to this grant call or not
   */
  checkDeleteGrantCallOrNot(grant, index) {
    this.$subscriptions.push(this._grantlistService.checkCanDeleteGrantCall(
      { 'grantCallId': grant.grantCallId }).subscribe((response: any) => {
        this.showDeleteWarningModal(grant, index, response.isGrantCallLinked);
      }));
  }

  /**
   * @param  {} grant
   * @param  {} index
   * @param  {} isGrantCallLinked
   * show delete confirmation modal only if grant call status is draft(1), tendative(4) and closed(3) and no proposals are linked
   */
  showDeleteWarningModal(grant, index, isGrantCallLinked) {
    const statusArray = [1, 3, 4];
    if (statusArray.includes(grant.grantStatusCode) && !isGrantCallLinked) {
      this.temprySaveGrantCall(grant.grantCallId, index);
      document.getElementById('grantcall-delete').click();
    } else {
      document.getElementById('grantcall-delete-warning').click();
    }
  }
  actionsOnPageChange(event) {
    this._grantlistService.grantCallRequestServiceObject.currentPage = event;
    this.loadDashboard(this._grantlistService.grantCallRequestServiceObject.currentPage,
      this._grantlistService.grantCallRequestServiceObject.advancedSearch);
    pageScroll('pageScrollToTop');
  }

  exportAsTypeDoc(docType) {
    const exportDataReqObject = {
      property1: this._grantlistService.grantCallRequestServiceObject.property1,
      property2: this._grantlistService.grantCallRequestServiceObject.property2,
      property3: this._grantlistService.grantCallRequestServiceObject.property3,
      property4: this._grantlistService.grantCallRequestServiceObject.property4,
      property5: this._grantlistService.grantCallRequestServiceObject.property5,
      property6: this._grantlistService.grantCallRequestServiceObject.property6,
      property7: this._grantlistService.grantCallRequestServiceObject.property7,
      documentHeading: 'Grant Call',
      sortBy: this._grantlistService.grantCallRequestServiceObject.sortBy,
      sort: this._grantlistService.grantCallRequestServiceObject.sort,
      advancedSearch: 'L',
      tabName: 'ALL_GRANTCALL',
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : ''
    };
    exportDataReqObject.advancedSearch = this._grantlistService.grantCallRequestServiceObject.advancedSearch;
    this.$subscriptions.push(this._grantlistService.exportGrantCallDashboardData(exportDataReqObject).subscribe(
      data => {
        let fileName = '';
        fileName = exportDataReqObject.documentHeading;
        fileDownloader(data.body, fileName, exportDataReqObject.exportType);
      }));
  }

  resetSortObject() {
    this.sortMap = {};
    this.sortCountObj = {
      'grantCallId': 0, 'openingDate': 0, 'grantCallName': 0, 'closingDate': 0, 'grantCallStatus.description': 0,
      'sponsor.sponsorName': 0, 'grantCallType.description': 0, 'internalSubmissionDeadLineDate': 0
    };
  }

}
