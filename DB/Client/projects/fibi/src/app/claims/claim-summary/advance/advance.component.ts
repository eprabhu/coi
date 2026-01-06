import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ClaimSummaryService } from '../claim-summary.service';

@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.css']
})
export class AdvanceComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  claimAdvanceObject: any = {};
  claimDetails: any = {};

  constructor(private _route: ActivatedRoute, private _claimsService: ClaimSummaryService,
    public _commonService: CommonService, public _commonData: CommonDataService) { }

  ngOnInit() {
    this.claimAdvanceData();
    this.getSharedClaimData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getSharedClaimData() {
    this.$subscriptions.push(
        this._commonData.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.claimDetails = data.claim;
                this.loadClaimAdvance();
            }
        })
    );
}

  loadClaimAdvance() {
    this._commonService.isManualLoaderOn = true;
    this.$subscriptions.push(this._claimsService.loadClaimAdvance(
      { 'claimId': this._route.snapshot.queryParams['claimId'] }).subscribe((data: any) => {
        this.claimAdvanceObject = data;
        if (this.claimAdvanceObject.claimAttachment) {
          this._claimsService.setForecastAttachment(this.claimAdvanceObject.claimAttachment);
        }
        this._commonService.isManualLoaderOn = false;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching claim summary details failed. Please try again.');
        this._commonService.isManualLoaderOn = false;
      }));
  }

  claimAdvanceData() {
    this.$subscriptions.push(this._commonData.$claimAdvanceData.subscribe((data: any) => {
      if (data) {
        this.claimAdvanceObject = data;
      }
    }));
  }
}

