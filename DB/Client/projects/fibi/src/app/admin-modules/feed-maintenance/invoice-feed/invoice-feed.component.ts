import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { InvoiceFeedService } from './invoice-feed.service';

declare var $: any;

@Component({
  selector: 'app-invoice-feed',
  templateUrl: './invoice-feed.component.html',
  styleUrls: ['./invoice-feed.component.css']
})
export class InvoiceFeedComponent implements OnInit, OnDestroy {


  selectedTab = 'batchDetails';
  isMaintainSapProcessing = false;
  sapFileProcessInfoText: any;
  $subscriptions: Subscription[] = [];
  isMaintainInvoiceProcessing = false;

  constructor(private _commonService: CommonService, private _invoiceFeedService: InvoiceFeedService) { }

  ngOnInit() {
    this.getPermission();
    this.getSapFileProcessInfoText();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  async getPermission() {
    this.isMaintainInvoiceProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_INTERFACE_PROCESSING');
  }

  /**
   * This function takes the description text from lookup of child module BatchDetailsComponent
   * to display in pop up of SAP File Response Process
   */
  getSapFileProcessInfoText() {
    this.$subscriptions.push(this._invoiceFeedService.sapFileProcessInfoText.subscribe(data => {
      this.sapFileProcessInfoText = data;
    }));
  }

  triggerManualResponseProcess() {
    $('#modal-invoice-manual-response-trigger').modal('hide');
    this.$subscriptions.push(
      this._invoiceFeedService.manualResponseProcess().subscribe((data: any) => {
        if (data) {
          this._invoiceFeedService.$invoiceFileProcess.next(true);
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Trigger Invoice failed. Please click Trigger Invoice again.'); },
        () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Triggered.'); }
      ));
  }
}
