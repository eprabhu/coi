import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ClaimSummaryService } from '../claim-summary.service';
import {CommonService} from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-reimbursement',
  templateUrl: './reimbursement.component.html',
  styleUrls: ['./reimbursement.component.css']
})

export class ReimbursementComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  claimReimbursementObject: any = {};
  claimDetails: any = {};

  constructor(private _route: ActivatedRoute, private _claimsService: ClaimSummaryService,
    public _commonService: CommonService, public _commonData: CommonDataService ) { }

  ngOnInit() {
    this.getSharedClaimData();
  }

  getSharedClaimData() {
    this.$subscriptions.push(
      this._commonData.$claimData.subscribe((data: any) => {
        if (data && data.claim) {
          this.claimDetails = data.claim;
          this.loadClaimReimbursement();
        }
      })
    );
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  loadClaimReimbursement() {
    this._commonService.isManualLoaderOn = true;
    this.$subscriptions.push(this._claimsService.loadClaimReimbursement(
      { 'claimId': this._route.snapshot.queryParams['claimId'] }).subscribe((data: any) => {
        this.claimReimbursementObject = data;
        this._commonService.isManualLoaderOn = false;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching claim summary details failed. Please try again.');
        this._commonService.isManualLoaderOn = false;
      }));
  }
}
