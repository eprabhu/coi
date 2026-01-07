import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { fileDownloader, openInNewTab, pageScroll, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { InvoiceAdvanceSearch, InvoiceFeedDetails, PendingFeed } from '../invoice-feed';
import { InvoiceFeedService } from '../invoice-feed.service';
declare var $: any;

@Component({
  selector: 'app-pending-feeds',
  templateUrl: './pending-feeds.component.html',
  styleUrls: ['./pending-feeds.component.css']
})
export class PendingFeedsComponent implements OnInit {

  pendingFeedSearchParam: InvoiceAdvanceSearch = new PendingFeed();
  pendingFeedData: InvoiceFeedDetails;
  $subscriptions: Subscription[] = [];
  setFocusToElement = setFocusToElement;
  checkAll = false;
  selectedFeeds: any = [];
  isChecked = {};
  searchFeedStatus: any = 'P';
  selectedAction: any = {};
  actionComment: any;
  isCommented = true;
  pageScroll = pageScroll;
  isMaintainInvoiceFeed = false;
  isDesc = false;
  isSaving = false;
  isMaintainInvoiceProcessing = false;

  constructor(private _invoiceFeedService: InvoiceFeedService, public _commonService: CommonService) {
  }

  ngOnInit(): void {
    this.getPendingFeeds();
    this.sapProcessingTrigger();
    this.getPermission();
  }

  ngOnDestroy(): void {
    subscriptionHandler(this.$subscriptions);
  }

  async getPermission() {
    this.isMaintainInvoiceFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED');
    this.isMaintainInvoiceProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_INTERFACE_PROCESSING');
  }
  
  private sapProcessingTrigger() {
    this.$subscriptions.push(this._invoiceFeedService.$invoiceFileProcess.subscribe((data: any) => {
      if (data) {
        this.getPendingFeeds();
      }
    }));
  }

  public getPendingFeeds(): void {
    this.pendingFeedSearchParam.property4 = [this.searchFeedStatus];
    this.$subscriptions.push(this._invoiceFeedService.getInvoiceClaimFeedDashboard(this.pendingFeedSearchParam)
      .subscribe((res: InvoiceFeedDetails) => {
        if (res) {
          this.pendingFeedData = res;
          this._invoiceFeedService.invoiceFileProcessInfoText(this.pendingFeedData.sapFeedUserActions);
        }
      })
    );
  }

  /**
  * @param userActionCode
  * Set the object for user action based on user action code. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger
  */
  public setAction(userActionCode) {
    this.selectedAction = this.pendingFeedData.sapFeedUserActions && this.pendingFeedData.sapFeedUserActions.length ?
      this.pendingFeedData.sapFeedUserActions.find(action => action.userActionCode === userActionCode) : null;
    this.actionComment = this.selectedAction ? this.selectedAction.comment : null;
  }

  public resetAndSearch(): void {
    this.pendingFeedSearchParam = new PendingFeed();
    this.searchFeedStatus = 'P';
    this.getPendingFeeds();
  }

  public resetCheckBoxAndTmpFeedList() {
    this.checkAll = false;
    this.isChecked = {};
    this.selectedFeeds = [];
  }

  public checkOrUncheckBatches() {
    this.checkAll ? this.checkAllBatches() : this.unCheckAllBatches();
  }

  private checkAllBatches() {
    this.selectedFeeds = [];
    this.pendingFeedData.claimInvoiceFeedDtoList.forEach(element => {
      this.isChecked[element.feedId] = true;
      this.selectedFeeds.push(element);
    });
  }

  private unCheckAllBatches() {
    this.pendingFeedData.claimInvoiceFeedDtoList.forEach(element => {
      this.isChecked[element.feedId] = false;
    });
    this.selectedFeeds = [];
  }

  /**
 * @param feed
 * This function is triggered if a user check/uncheck a feed from list
 * and calls appropriate function to add/remove that feed in temporary list accordingly.
 */
  public toggleFromList(feed) {
    this.isChecked[feed.feedId] ? this.addToFeedsList(feed) : this.removeFromFeedsList(feed);
  }


  private addToFeedsList(feed) {
    this.selectedFeeds.push(feed);
    this.checkAll = this.selectedFeeds.length === this.pendingFeedData.claimInvoiceFeedDtoList.length ? true : false;
  }

  private removeFromFeedsList(feed) {
    const removeFeedIndex = this.selectedFeeds.findIndex(element => element.feedId === feed.feedId);
    this.selectedFeeds.splice(removeFeedIndex, 1);
    this.checkAll = false;
  }

  actionsOnPageChange(event) {
    this.pendingFeedSearchParam.currentPage = event;
    this.getPendingFeeds();
    pageScroll('pageScrollToTop');
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
      }
    }
  }

  /**
* Function to validate if comment given by user for action Update Status, Notify PI and Re-Interface.
* Comment is mandatory for these actions.
*/
  public checkIfCommented() {
    this.isCommented = this.actionComment ? true : false;
    return this.isCommented;
  }

  /**
   * @param type
   * This function will assign the selected feed lists to new batch.
   */
  generateBatch() {
    $('#modal-sap-pending-feed').modal('hide');
    if (!this.isSaving) {
    this.isSaving = true;
    this.$subscriptions.push(
      this._invoiceFeedService.processClaimInvoiceSapFeed(
        {
          ...{ 'claimInvoiceFeedDtoList': this.selectedFeeds },
          ...this.pendingFeedSearchParam
        }).subscribe((data: InvoiceFeedDetails) => {
          this.resetCheckBoxAndTmpFeedList();
          this.pendingFeedData = data;
          this.isSaving = false;
        }, err => { 
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Batch failed. Please try again.');
          this.isSaving = false;
         },
          () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully generated.'); }
        )); 
      }
  }

  public routeToClaimId(claimId) {
    openInNewTab('claims/invoice/summary?', ['claimId'], [claimId]);
  }

  public sortResult(sortFieldBy) {
    this.isDesc = this.pendingFeedSearchParam.sortBy === sortFieldBy ? !this.isDesc : true;
    this.pendingFeedSearchParam.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
    this.pendingFeedSearchParam.sortBy = sortFieldBy;
    this.getPendingFeeds();
  }

  exportAsTypeDoc(docType: string) {
    const exportObject: any = {
      ...this.pendingFeedSearchParam,
      documentHeading: 'Pending Feeds',
      sortBy: this.pendingFeedSearchParam.sortBy,
      sort: this.pendingFeedSearchParam.sort
    };
    this.$subscriptions.push(this._invoiceFeedService.exportInvoiceFeedReport(exportObject).subscribe(
      data => {
        const fileName = exportObject.documentHeading;
        exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
        fileDownloader(data.body, fileName, exportObject.exportType);
      }));
  }

}
