import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SapFeedService } from '../sap-feed.service';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { fileDownloader, pageScroll } from '../../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
  selector: 'app-pending-feeds',
  templateUrl: './pending-feeds.component.html',
  styleUrls: ['./pending-feeds.component.css']
})
export class PendingFeedsComponent implements OnInit {

  /* property1 : Batch Id (Not Used Here), property2 : Award ID, property3 : Award Number,
  property4 : Feed Status, property5 : From Date (Not Used Here), property6 : To Date (Not Used Here) */
  pendingFeedsReqObj: any = {
    'property1': null,
    'property2': null,
    'property3': null,
    'property4': null,
    'property5': null,
    'property6': null,
    'property7': null,
    'isAdvanceSearch' : 'A',
    'tabName': 'PENDING_FEEDS',
    'sort': {},
    'currentPage': 1,
    'sortBy': '',
    'reverse' : '',
    'pageNumber': 20
  };
  pendingFeedsData: any = [];
  searchFeedStatus: any = 'AP';
  checkAll = false;
  selectedFeeds: any = [];
  selectedAction: any = {};
  actionComment: any;
  isCommented = true;
  isChecked = {};
  isMaintainSapFeed = false;
  $subscriptions: Subscription[] = [];
  isMaintainSapProcessing = false;
  pageScroll = pageScroll;
  isDesc = false;

  constructor(private _commonService: CommonService, private _sapFeedService: SapFeedService) { }

  ngOnInit() {
    this.getPermission();
    this.getPendingFeeds();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  async getPermission() {
    this.isMaintainSapFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED');
    this.isMaintainSapProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
  }

  getPendingFeeds() {
    this.pendingFeedsReqObj.property4 = this.searchFeedStatus ? [this.searchFeedStatus] : [];
    this.$subscriptions.push(
      this._sapFeedService.getBatchDetails(this.pendingFeedsReqObj).subscribe((data: any) => {
        if (data) {
          this.pendingFeedsData = data;
          this._sapFeedService.setSapFileProcessInfoText(this.pendingFeedsData.sapFeedUserActions);
        }
      }));
  }

  resetAndSearch() {
    this.searchFeedStatus = 'AP';
    this.pendingFeedsReqObj.property1 = null;
    this.pendingFeedsReqObj.property2 = null;
    this.pendingFeedsReqObj.property3 = null;
    this.pendingFeedsReqObj.property4 = null;
    this.pendingFeedsReqObj.property5 = null;
    this.pendingFeedsReqObj.property6 = null;
    this.pendingFeedsReqObj.property7 = null;
    this.getPendingFeeds();
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
   * @param userActionCode
   * Set the object for user action based on user action code. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger
   */
  setAction(userActionCode) {
    this.selectedAction = this.pendingFeedsData.sapFeedUserActions && this.pendingFeedsData.sapFeedUserActions.length ?
    this.pendingFeedsData.sapFeedUserActions.find(action => action.userActionCode === userActionCode) : null;
    this.actionComment = this.selectedAction ? this.selectedAction.comment : null;
  }

 /**
   * This function is used to divert to appropriate functions that process the action based on the action
   * that user takes once confirmed from modal. User Action Code 5 - Generate Batch, 6 - Cancel Feed, 7 - Queue to Feed
   */
  proceedAction() {
    if (this.selectedAction.userActionCode === '5' || this.checkIfCommented()) {
      switch (this.selectedAction.userActionCode) {
        case '5': this.generateBatch();
          break;
        case '6': this.processFeed('C');
          break;
        case '7': this.processFeed('Q');
          break;
        case '10': this.processFeed('H');
          break;
      }
    }
  }

  /**
   * @param type
   * This function will assign the selected feed lists to new batch.
   */
  generateBatch() {
    $('#modal-sap-pending-feed').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.generateBatch({
        'sapAwardFeeds': this.selectedFeeds,
        'sapFeedMaintenanceVO': this.pendingFeedsReqObj
      }).subscribe((data: any) => {
          this.resetCheckBoxAndTmpFeedList();
          this.pendingFeedsData = data;
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Batch failed. Please try again.'); },
        () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully generated.'); }
      ));
  }

  /**
   * @param type
   * This function update the status of list of Pending feeds to Cancelled or Vice-Versa.
   * ChangeType 'C' indicates backend that is is for status change to cancel while 'Q' indicates status change to Pending.
   */
  processFeed(type) {
    $('#modal-sap-pending-feed').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.updateFeedStatus({...{
        'sapFeedUserAction': this.selectedAction,
        'userComment': this.actionComment,
        'changeType': type,
        'sapAwardFeeds': this.selectedFeeds
      },...this.pendingFeedsReqObj}).subscribe((data: any) => {
        if (data && data.message === 'Success') {
          this.pendingFeedsData = data;
          this.resetCheckBoxAndTmpFeedList();
          this.triggerFailedCasePopUp(data);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully updated.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Feed Status failed. Please try again.');
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Feed Status failed. Please try again.'); }
      ));
  }

  triggerFailedCasePopUp(data) {
    if (data.failedAwardNumbers && data.failedAwardNumbers.length) {
     $('#failedPendingSapAwardsModal').modal('show');
    }
   }

  checkOrUncheckBatches() {
    this.checkAll ? this.checkAllBatches() : this.unCheckAllBatches();
  }

  checkAllBatches() {
    this.selectedFeeds = [];
    this.pendingFeedsData.sapAwardFeeds.forEach(element => {
      this.isChecked[element.feedId] = true;
      this.selectedFeeds.push(element);
    });
  }

  unCheckAllBatches() {
    this.pendingFeedsData.sapAwardFeeds.forEach(element => {
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
    this.isChecked[feed.feedId] ? this.addToFeedsList(feed) : this.removeFromFeedsList(feed);
  }

  addToFeedsList(feed) {
    this.selectedFeeds.push(feed);
    this.checkAll = this.selectedFeeds.length === this.pendingFeedsData.sapAwardFeeds.length ? true : false;
  }

  removeFromFeedsList(feed) {
    const removeFeedIndex = this.selectedFeeds.findIndex(element => element.feedId === feed.feedId);
    this.selectedFeeds.splice(removeFeedIndex, 1);
    this.checkAll = false;
  }

  resetCheckBoxAndTmpFeedList() {
    this.checkAll = false;
    this.isChecked = {};
    this.selectedFeeds = [];
  }

  actionsOnPageChange(event) {
    this.pendingFeedsReqObj.currentPage = event;
    this.getPendingFeeds();
    pageScroll('pageScrollToTop');
  }

  public sortResult(sortFieldBy) {
    this.isDesc = this.pendingFeedsReqObj.sortBy === sortFieldBy ? !this.isDesc : true;
    this.pendingFeedsReqObj.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
    this.pendingFeedsReqObj.sortBy = sortFieldBy;
    this.getPendingFeeds();
  }

  exportAsTypeDoc(docType: string) {
    const exportObject: any = {
      ...this.pendingFeedsReqObj,
      documentHeading: 'Pending Feeds',
      sortBy: this.pendingFeedsReqObj.sortBy,
      sort: this.pendingFeedsReqObj.sort
    };
    this.$subscriptions.push(this._sapFeedService.exportSapFeedReport(exportObject).subscribe(
      data => {
        const fileName = exportObject.documentHeading;
        exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
        fileDownloader(data.body, fileName, exportObject.exportType);
      }));
  }

}
