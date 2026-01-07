import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { fileDownloader, openInNewTab, pageScroll, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { BatchHistory, InvoiceAdvanceSearch, InvoiceFeedDetails, SapFeedUserActions } from '../invoice-feed';
import { InvoiceFeedService } from '../invoice-feed.service';
declare var $: any;

@Component({
  selector: 'app-batch-history',
  templateUrl: './batch-history.component.html',
  styleUrls: ['./batch-history.component.css']
})
export class BatchHistoryComponent implements OnInit {

  batchHistorySearchParam: InvoiceAdvanceSearch = new BatchHistory();
  batchHistoryData: InvoiceFeedDetails;
  $subscriptions: Subscription[] = [];
  setFocusToElement = setFocusToElement;
  startDateSearch: any;
  endDateSearch: any;
  searchFeedStatus: any = '';
  downloadBatchId: any;
  pageScroll = pageScroll;
  isDesc = false;
  downloadUserAction: SapFeedUserActions;

  constructor(private _invoiceFeedService: InvoiceFeedService, public _commonService: CommonService) {
  }

  ngOnInit(): void {
    this.getBatchHistory();
    this.sapProcessingTrigger();
  }

  ngOnDestroy(): void {
    subscriptionHandler(this.$subscriptions);
  }

  private sapProcessingTrigger() {
    this.$subscriptions.push(this._invoiceFeedService.$invoiceFileProcess.subscribe((data: any) => {
      if (data) {
        this.getBatchHistory();
      }
    }));
  }

  public getBatchHistory(): void {
    this.batchHistorySearchParam.property4 = [this.searchFeedStatus];
    this.batchHistorySearchParam.property10 = this.startDateSearch ? parseDateWithoutTimestamp(this.startDateSearch) : null;
    this.batchHistorySearchParam.property11 = this.endDateSearch ? parseDateWithoutTimestamp(this.endDateSearch) : null;
    this.$subscriptions.push(this._invoiceFeedService.getInvoiceClaimFeedDashboard(this.batchHistorySearchParam)
      .subscribe((res: InvoiceFeedDetails) => {
        if (res) {
          this.batchHistoryData = res;
          this.downloadUserAction = this.batchHistoryData.sapFeedUserActions && this.batchHistoryData.sapFeedUserActions.length ?
          this.batchHistoryData.sapFeedUserActions.find(action => action.userActionCode === '9') : null;
          this._invoiceFeedService.invoiceFileProcessInfoText(this.batchHistoryData.sapFeedUserActions);
        }
      })
    );
  }

  public resetAndSearch(): void {
    this.searchFeedStatus = '';
    this.startDateSearch = null;
    this.endDateSearch = null;
    this.batchHistorySearchParam = new BatchHistory();
    this.getBatchHistory();
  }


  public routeToSapBatchId(batchId) {
    openInNewTab('feed-maintenance/invoice-feed/batch-details?', ['batchId'], [batchId]);
  }

  public actionsOnPageChange(event) {
    this.batchHistorySearchParam.currentPage = event;
    this.getBatchHistory();
    pageScroll('pageScrollToTop');
  }

  public sortResult(sortFieldBy) {
    this.isDesc = this.batchHistorySearchParam.sortBy === sortFieldBy ? !this.isDesc : true;
    this.batchHistorySearchParam.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
    this.batchHistorySearchParam.sortBy = sortFieldBy;
    this.getBatchHistory();
  }

  public downloadAttachment() {
    $('#modal-invoice-batch-history').modal('hide');
    if (this.downloadBatchId) {
      this.$subscriptions.push(this._invoiceFeedService.exportClaimInvoiceAttachments({'batchId': this.downloadBatchId})
        .subscribe((data) => {
          const reader = new FileReader();
          const currentInstance = this;
          reader.readAsText(data);
          reader.onload = () => {
            reader.result === '' ?
            currentInstance._commonService.showToast(HTTP_ERROR_STATUS, 'There are no claim Invoice files available for download.') :
            fileDownloader(data, 'Claim_Invoice_Batch_# ' + currentInstance.downloadBatchId, 'csv');
            this.downloadBatchId = null;
          };
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading the Attachment failed. Please try again.');
        }));
      }
  }

  exportAsTypeDoc(docType: string) {
    const exportObject: any = {
      ...this.batchHistorySearchParam,
      documentHeading: 'Batch History',
      sortBy: this.batchHistorySearchParam.sortBy,
      sort: this.batchHistorySearchParam.sort,
    };
    this.$subscriptions.push(this._invoiceFeedService.exportInvoiceFeedReport(exportObject).subscribe(
      data => {
        const fileName = exportObject.documentHeading;
        exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
        fileDownloader(data.body, fileName, exportObject.exportType);
      }));
  }

}
