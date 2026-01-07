import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-feed-maintenance',
  templateUrl: './feed-maintenance.component.html',
  styleUrls: ['./feed-maintenance.component.css']
})
export class FeedMaintenanceComponent implements OnInit {

  helpInfo = false;
  isMaintainSapFeed = false;
  isMaintainManpowerFeed = false;
  isMaintainInvoiceFeed = false;

  constructor(public _commonService: CommonService) { }

  ngOnInit() {
    this.getPermissions();
  }

  async getPermissions() {
    this.isMaintainSapFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED') ||
      await this._commonService.checkPermissionAllowed('VIEW_SAP_FEED') ||
      await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
    this.isMaintainInvoiceFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED') ||
      await this._commonService.checkPermissionAllowed('VIEW_INVOICE_FEED') ||
      await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_INTERFACE_PROCESSING');
    this.isMaintainManpowerFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_MANPOWER_FEED');
  }

}
