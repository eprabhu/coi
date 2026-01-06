import { Component, OnDestroy, OnInit } from '@angular/core';

import { setFocusToElement, openInNewTab, fileDownloader, pageScroll } from '../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SapFeedService } from '../sap-feed.service';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';

declare var $: any;

@Component({
  selector: 'app-batch-history',
  templateUrl: './batch-history.component.html',
  styleUrls: ['./batch-history.component.css']
})
export class BatchHistoryComponent implements OnInit, OnDestroy {

  /* property1 : Batch Id, property2 : Award ID, property3 : Award Number, property4 : Feed Status,
      property5 : From Date, property6 : To Date */
  batchHistoryReqObj: any = {
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
    'sortBy': '',
    'reverse' : '',
    'pageNumber': 20,
    'tabName': 'BATCH_HISTORY',
  };
  searchFeedStatus: any = '';
  batchHistoryData: any = [];
  startDateSearch: any;
  endDateSearch: any;
  setFocusToElement = setFocusToElement;
  downloadBatchId: any;
  downloadUserAction: any = {};
  $subscriptions: Subscription[] = [];
  isMaintainSapProcessing = false;
  pageScroll = pageScroll;
  isDesc = false;

  constructor(public _commonService: CommonService, private _sapFeedService: SapFeedService) { }

 ngOnInit() {
    this.getPermission();
    this.getBatchHistory();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  async getPermission() {
    this.isMaintainSapProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
  }

  getBatchHistory() {
    this.batchHistoryReqObj.property3 = this.batchHistoryReqObj.property3 ? this.batchHistoryReqObj.property3 : null;
    this.batchHistoryReqObj.property4 = this.searchFeedStatus ? [this.searchFeedStatus] : [];
    this.batchHistoryReqObj.property5 = this.startDateSearch ? parseDateWithoutTimestamp(this.startDateSearch) : null;
    this.batchHistoryReqObj.property6 = this.endDateSearch ? parseDateWithoutTimestamp(this.endDateSearch) : null;
    this.$subscriptions.push(
      this._sapFeedService.getBatchHistory(this.batchHistoryReqObj).subscribe((data: any) => {
        if (data) {
          this.batchHistoryData = data;
          this.downloadUserAction = this.batchHistoryData.sapFeedUserActions && this.batchHistoryData.sapFeedUserActions.length ?
          this.batchHistoryData.sapFeedUserActions.find(action => action.userActionCode === '9') : null;
          this._sapFeedService.setSapFileProcessInfoText(this.batchHistoryData.sapFeedUserActions);
        }
      }));
  }

  resetAndSearch() {
    this.searchFeedStatus = '';
    this.startDateSearch = null;
    this.endDateSearch = null;
    this.batchHistoryReqObj.property1 = null;
    this.batchHistoryReqObj.property2 = null;
    this.batchHistoryReqObj.property3 = null;
    this.batchHistoryReqObj.property4 = null;
    this.batchHistoryReqObj.property5 = null;
    this.batchHistoryReqObj.property6 = null;
    this.batchHistoryReqObj.property7 = null;
    this.getBatchHistory();
  }

  downloadAttachment() {
    $('#modal-sap-batchhistory').modal('hide');
    if (this.downloadBatchId) {
      this.$subscriptions.push(this._sapFeedService.getSapBatchFeedAttachment({'batchId': this.downloadBatchId})
        .subscribe((data) => {
          const reader = new FileReader();
          const currentInstance = this;
          reader.readAsText(data);
          reader.onload = () => {
            reader.result === 'Empty_Zip' ?
            currentInstance._commonService.showToast(HTTP_ERROR_STATUS, 'There are no Interface files available for download.') :
            fileDownloader(data, 'SAP_Feed_Batch_# ' + currentInstance.downloadBatchId, 'zip');
            this.downloadBatchId = null;
          };
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading Attachment failed. Please try again.');
        }));
      }
  }

  routeToSapBatchId(batchId) {
    openInNewTab('feed-maintenance/sap-feed/batch-details?', ['batchId'], [batchId]);
  }

  actionsOnPageChange(event) {
    this.batchHistoryReqObj.currentPage = event;
    this.getBatchHistory();
    pageScroll('pageScrollToTop');
  }

  public sortResult(sortFieldBy) {
    this.isDesc = this.batchHistoryReqObj.sortBy === sortFieldBy ? !this.isDesc : true;
    this.batchHistoryReqObj.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
    this.batchHistoryReqObj.sortBy = sortFieldBy;
    this.getBatchHistory();
  }

  exportAsTypeDoc(docType: string) {
    const exportObject: any = {
      ...this.batchHistoryReqObj,
      documentHeading: 'Batch History',
      sortBy: this.batchHistoryReqObj.sortBy,
      sort: this.batchHistoryReqObj.sort
    };
    this.$subscriptions.push(this._sapFeedService.exportSapFeedReport(exportObject).subscribe(
      data => {
        const fileName = exportObject.documentHeading;
        exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
        fileDownloader(data.body, fileName, exportObject.exportType);
      }));
  }

}
