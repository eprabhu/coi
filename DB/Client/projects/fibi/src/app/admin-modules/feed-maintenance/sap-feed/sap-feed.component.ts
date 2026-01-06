import { Component, OnInit } from '@angular/core';
import { SapFeedService } from './sap-feed.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';

declare var $: any;

@Component({
  selector: 'app-sap-feed',
  templateUrl: './sap-feed.component.html',
  styleUrls: ['./sap-feed.component.css']
})
export class SapFeedComponent implements OnInit {

  selectedTab = "batchDetails";
  isMaintainSapProcessing = false;
  sapFileProcessInfoText: any;
  $subscriptions: Subscription[] = [];

  constructor(private _commonService:CommonService, private _sapFeedService: SapFeedService) { }

  ngOnInit() {
    this.getPermission();
    this.getSapFileProcessInfoText();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * This function takes the description text from lookup of child module BatchDetailsComponent
   * to display in pop up of SAP File Response Process
   */
  getSapFileProcessInfoText() {
    this.$subscriptions.push(this._sapFeedService.sapFileProcessInfoText.subscribe(data => {
      this.sapFileProcessInfoText = data;
    }));
  }

  async getPermission() {
    this.isMaintainSapProcessing = await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
  }

  triggerManualResponseProcess() {
    $('#modal-sap-manual-response-trigger').modal('hide');
    this.$subscriptions.push(
      this._sapFeedService.manualResponseProcess().subscribe((data: any) => {
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Position Trigger list failed. Please try again.'); },
        () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Triggered.'); }
        ));
  }
}
