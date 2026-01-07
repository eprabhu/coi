import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { pageScroll, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SapFeedService } from '../sap-feed.service';
import { CommonService } from '../../../../common/services/common.service';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { fileDownloader } from '../../../../common/utilities/custom-utilities';
import { slideInOut, fadeDown } from '../../../../common/utilities/animations';

declare var $: any;

@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css'],
  animations: [slideInOut, fadeDown]
})
export class BatchDetailsComponent implements OnInit, OnDestroy {

  setFocusToElement = setFocusToElement;
  /* property1 : Batch Id, property2 : Award ID, property3 : Award Number,
     property4 : Feed Status, property5 : From Date, property6 : To Date */
  batchDetailsReqObj: any = {
    'property1': null,
    'property2': null,
    'property3': null,
    'property4': null,
    'property5': null,
    'property6': null,
    'property7': null,
    'isAdvanceSearch': 'L',
    'sort': {},
    'currentPage': 1,
    'pageNumber': 20,
    'tabName': 'BATCH_DETAIL',
    'sortBy': '',
    'reverse' : '',
  };
  selectedBatchId = null;
  selectedFeeds: any = [];
  searchFeedStatus: any = 'E';
  batchDetails: any = [];
  selectedAction: any = {};
  actionComment: string = null;
  isCommented = true;
  isFeedExpand: boolean[] = [];
  isViewMore: any = {};
  selectedTab: any = [];
  interfaceDetails: any = {};
  errorStatusInterfaceDetails: any = [];
  otherStatusInterfaceDetails: any = [];
  startDateSearch: any;
  endDateSearch: any;
  checkAll = false;
  isChecked = {};
  isMaintainSapFeed = false;
  isMaintainSapProcessing = false;
  selectableFeeds: any;
  pageScroll = pageScroll;
  isDesc = false;

  $subscriptions: Subscription[] = [];

  constructor(public _commonService: CommonService, private _sapFeedService: SapFeedService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getPermission();
    this.route.snapshot.queryParams['batchId'] ? this.processBatchDetail(this.route.snapshot.queryParams['batchId']) :
    this.getBatchDetails();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  async getPermission() {
    this.isMaintainSapFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED');
    this.isMaintainSapProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
  }

  /**
   * @param batchId
   * This function will call if there is batchId in query parameter of URL and set the search filter accordingly
   */
  processBatchDetail(batchId) {
    this.batchDetailsReqObj.isAdvanceSearch = 'A';
    this.batchDetailsReqObj.property1 = batchId;
    this.searchFeedStatus = 'A';
    this.getBatchDetails();
  }

  getBatchDetails() {
    this.batchDetailsReqObj.property3 = this.batchDetailsReqObj.property3 ? this.batchDetailsReqObj.property3 : null;
    this.batchDetailsReqObj.property4 = [this.searchFeedStatus];
    this.batchDetailsReqObj.property5 = this.startDateSearch ? parseDateWithoutTimestamp(this.startDateSearch) : null;
    this.batchDetailsReqObj.property6 = this.endDateSearch ? parseDateWithoutTimestamp(this.endDateSearch) : null;
    this.$subscriptions.push(
      this._sapFeedService.getBatchDetails(this.batchDetailsReqObj).subscribe((data: any) => {
        if (data) {
          this.batchDetails = data;
          this.updateSelectableFeeds();
          this._sapFeedService.setSapFileProcessInfoText(this.batchDetails.sapFeedUserActions);
        }
      }));
  }

  resetAndSearch() {
    this.searchFeedStatus = 'E';
    this.startDateSearch = null;
    this.endDateSearch = null;
    this.batchDetailsReqObj.property1 = null;
    this.batchDetailsReqObj.property2 = null;
    this.batchDetailsReqObj.property3 = null;
    this.batchDetailsReqObj.property4 = null;
    this.batchDetailsReqObj.property5 = null;
    this.batchDetailsReqObj.property6 = null;
    this.batchDetailsReqObj.property7 = null;
    this.getBatchDetails();
  }

  /**
   * @param userActionCode
   * Set the object for user action based on user action code. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger, 9 - Download
   */
  setAction(userActionCode) {
    this.selectedAction = this.batchDetails.sapFeedUserActions && this.batchDetails.sapFeedUserActions.length ?
    this.batchDetails.sapFeedUserActions.find(action => action.userActionCode === userActionCode) : null;
    this.actionComment = this.selectedAction ? this.selectedAction.comment : null;
  }

  /**
   * Function to validate if comment given by user for action Update Status, Notify PI and Re-Interface.
   * Comment is mandatory for these actions.
   */
  checkIfCommented() {
    this.isCommented = this.actionComment ? true : false;
    return this.isCommented;
  }

  /**
   * This function is used to divert to appropriate functions that process the action based on the action
   * that user takes once confirmed from modal. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger, 9 - Download
   */
  proceedAction() {
    if (this.selectedAction.userActionCode === '4' || this.selectedAction.userActionCode === '9' || this.checkIfCommented()) {
      switch (this.selectedAction.userActionCode) {
        case '1': this.updateFeedStatus();
          break;
        case '2': this.notifyPi();
          break;
        case '3': this.reInterface();
          break;
        case '4': this.reTriggerBatch();
          break;
        case '9': this.downloadAttachment();
          break;
      }
    }
  }

  /**
   * This function update the status of list of error feeds to success.
   * ChangeType 'U' indicates backend that is is for status change to success.
   */
  updateFeedStatus() {
    $('#modal-sap-basicdetails').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.updateFeedStatus({...{
        'sapFeedUserAction': this.selectedAction,
        'userComment': this.actionComment,
        'changeType': 'U',
        'sapAwardFeeds': this.selectedFeeds
      }, ...this.batchDetailsReqObj}).subscribe((data: any) => {
        if (data && data.message == 'Success') {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully updated.');
          this.batchDetails = data;
          this.updateSelectableFeeds();
          this.resetAllProperties();
          this.triggerFailedCasePopUp(data);
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Feed Status failed. Please try again.');
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Feed Status failed. Please try again.'); }
      ));
  }

  triggerFailedCasePopUp(data) {
   if (data.failedAwardNumbers && data.failedAwardNumbers.length) {
    $('#failedSapAwardsModal').modal('show');
   }
  }

  /**
   * This function is used to notify the PI based on list of error feeds that the user selected as Mail.
   */
  notifyPi() {
    $('#modal-sap-basicdetails').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.notifyPi({ ...{
        'sapFeedUserAction': this.selectedAction,
        'userComment': this.actionComment,
        'sapAwardFeeds': this.selectedFeeds
      }, ...this.batchDetailsReqObj}).subscribe((data: any) => {
        if (data && data.message == 'Success') {
        this.batchDetails = data;
        this.updateSelectableFeeds();
        this.resetAllProperties();
        this.triggerFailedCasePopUp(data);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Notified.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Notify PI action failed. Please click Notify PI again.');
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Notify PI action failed. Please click Notify PI again.'); }
      ));
  }

  /**
   * This function will sent list of given error feeds to create a copy of it that will be sent to SAP again.
   */
  reInterface() {
    $('#modal-sap-basicdetails').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.reInterface({ ...{
        'sapFeedUserAction': this.selectedAction,
        'userComment': this.actionComment,
        'sapAwardFeeds': this.selectedFeeds
      }, ...this.batchDetailsReqObj}).subscribe((data: any) => {
        if (data && data.message == 'Success') {
          this.batchDetails = data;
          this.updateSelectableFeeds();
          this.resetAllProperties();
          this.triggerFailedCasePopUp(data);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Re-Interfaced.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for Re-Interfacing. Please try again.');
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for Re-Interfacing. Please try again.'); }
      ));
  }

  /**
   * This function keep in track with number of selectable feeds which can be used to automatically trigger select all option
   * once length matches with selected feeds from list. It checks for Error feeds and not action taken by user.
   */
  updateSelectableFeeds() {
    this.selectableFeeds = this.batchDetails.sapAwardFeeds.length ? this.getSelectableFieldsLength() : null;
  }

  getSelectableFieldsLength() {
      const FILTERED_ARRAY = this.batchDetails.sapAwardFeeds.filter(feedObj => feedObj.feedStatus === 'E' && !feedObj.userActionCode);
      return FILTERED_ARRAY.length;
  }

  reTriggerBatch() {
    $('#modal-sap-basicdetails').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.reTrigger({ 'batchId': this.selectedBatchId }).subscribe((data: any) => {
        this.selectedBatchId = null;
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Re-Trigger Batch action failed. Please click Re-Trigger again.'); },
      () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Re-Triggered.'); }
    ));
  }

  downloadAttachment() {
    $('#modal-sap-basicdetails').modal('hide');
    if (this.batchDetails.sapAwardFeedHistory && this.batchDetails.sapAwardFeedHistory.batchId) {
      this.$subscriptions.push(this._sapFeedService.getSapBatchFeedAttachment({'batchId':  this.batchDetails.sapAwardFeedHistory.batchId})
        .subscribe((data) => {
          let reader = new FileReader();
          const currentInstance = this;
          reader.readAsText(data);
          reader.onload = function() {
            reader.result == 'Empty_Zip' ? currentInstance._commonService.showToast(HTTP_ERROR_STATUS, 'There are no interface files available for download') :
            fileDownloader(data, 'SAP_Feed_Batch_# '+  currentInstance.batchDetails.sapAwardFeedHistory.batchId, 'zip');
          };
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading Interface files failed. Please try again.'); },
      () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Interface files downloaded successfully.'); }
      ));
    }
  }

  /**
   * 
   * @param feedId
   * @param index
   * Fuction for calling API to get interface details belongs to particular feed data when the ser expands the feed to view interface messages.
   * This will not call API if the data already loaded.
   * 
   */
  expandInterface(feedId, awardId, index) {
    this.isFeedExpand[index] = !this.isFeedExpand[index];
    if (this.isFeedExpand[index] && !this.interfaceDetails[index]) {
      this.$subscriptions.push(
        this._sapFeedService.getInterfaceDetails({
          'feedId': feedId,
          'awardId': awardId
        }).subscribe((data: any) => {
          this.interfaceDetails[index] = data;
          this.interfaceDetails[index].sapFeedMaintenanceDto ? this.splitInterfaces(index) : '';
        }));
    }
  }

  /**
   * @param index
   * This function calls process function to perform Error and Other Interfaces spliting based on eight tabs.
   */
  splitInterfaces(index) {
     this.errorStatusInterfaceDetails[index] = [];
     this.otherStatusInterfaceDetails[index] = [];
     this.isViewMore[index] = [];
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplWbs, index, 'wbs_interface');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplGrantBudMasters, index, 'grant_budget_master');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplFmBudgets, index, 'fm_budget');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplProjectDefs, index, 'project_definition');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplGrantMasters, index, 'grant_master');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplSponsorClasses, index, 'sponsor_class');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplSponsoPrgms, index, 'sponsor_program');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplFundedPrgms, index, 'funded_program');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplFmDerivations, index, 'fm_derivation');
     this.processInterface(this.interfaceDetails[index].sapFeedMaintenanceDto.sapFeedTmplGmDerivations, index, 'gm_derivation');

     if (!this.selectedTab[index]) {
      this.selectedTab[index] = 'wbs_interface';
    }
  }

  /**
   * @param interfaceArray
   * @param index
   * @param tab
   * This function splits the interfaces with status Error and Other Statuses.
   * This is due to UI requirement to show Error interfaces and Other Statuses interfaces separately.
   * This function will set an Interface tab open where first error occurence is found.
   * Otherwise first tab 'WBS Interface' will be open by default.
   * This function also sets Hide/View Other lists open by default in case there is no error is present in particular interface.
   */
  processInterface(interfaceArray: any = [], index, tab) {
    this.errorStatusInterfaceDetails[index][tab] = [];
    this.otherStatusInterfaceDetails[index][tab] = [];
    interfaceArray.forEach((interfaceObj) => (interfaceObj.feedStatus === 'E') ?
    this.errorStatusInterfaceDetails[index][tab].push(interfaceObj) :
    this.otherStatusInterfaceDetails[index][tab].push(interfaceObj));
    if (this.errorStatusInterfaceDetails[index][tab].length) {
      this.isViewMore[index][tab] = false;
      if (!this.selectedTab[index]) {
        this.selectedTab[index] = tab;
      }
    } else {
      this.isViewMore[index][tab] = true;
    }
  }

  resetAllProperties() {
    this.isFeedExpand = [];
    this.interfaceDetails = [];
    this.isViewMore = [];
    this.selectedTab = [];
    this.checkAll = false;
    this.isChecked = {};
    this.selectedFeeds = [];
    this.selectedAction = null;
    this.actionComment = null;
  }

  checkOrUncheckBatches() {
    this.checkAll ? this.checkAllBatches() : this.unCheckAllBatches();
  }

  checkAllBatches() {
    this.selectedFeeds = [];
    this.batchDetails.sapAwardFeeds.forEach(element => {
      if (element.feedStatus === 'E' && !element.userActionCode) {
        this.isChecked[element.feedId] = true;
        this.selectedFeeds.push(element);
      }
    });
  }

  unCheckAllBatches() {
    this.batchDetails.sapAwardFeeds.forEach(element => {
      this.isChecked[element.feedId] = false;
    });
    this.selectedFeeds = [];
  }

  /**
   * @param feed
   * This function is triggered if a user check/uncheck a feed from list
   * and calls appropriate function to add/remove that feed in temporary list accordingly.
   */
  toggleFromList(feed) {
    this.isChecked[feed.feedId] ? this.addToFeeds(feed) : this.removeFromFeeds(feed);
  }

  addToFeeds(feed) {
    this.selectedFeeds.push(feed);
    this.checkAll = this.selectedFeeds.length === this.selectableFeeds ? true : false;
  }

  removeFromFeeds(feed) {
    const removeFeedIndex = this.selectedFeeds.findIndex(element => element.feedId === feed.feedId);
    this.selectedFeeds.splice(removeFeedIndex, 1);
    this.checkAll = false;
  }

  actionsOnPageChange(event) {
    this.batchDetailsReqObj.currentPage = event;
    this.getBatchDetails();
    pageScroll('pageScrollToTop');
    this.interfaceDetails = [];
    this.isFeedExpand = [];
  }

  public sortResult(sortFieldBy) {
    this.isDesc = this.batchDetailsReqObj.sortBy === sortFieldBy ? !this.isDesc : true;
    this.batchDetailsReqObj.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
    this.batchDetailsReqObj.sortBy = sortFieldBy;
    this.getBatchDetails();
}

    exportAsTypeDoc(docType: string) {
      const exportObject: any = {
        ...this.batchDetailsReqObj,
        documentHeading: 'Batch Details',
        sortBy: this.batchDetailsReqObj.sortBy,
        sort: this.batchDetailsReqObj.sort
      };
      this.$subscriptions.push(this._sapFeedService.exportSapFeedReport(exportObject).subscribe(
        data => {
          const fileName = exportObject.documentHeading;
          exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
          fileDownloader(data.body, fileName, exportObject.exportType);
        }));
    }

}
