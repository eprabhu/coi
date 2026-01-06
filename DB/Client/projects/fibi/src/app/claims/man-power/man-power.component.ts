import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonDataService } from '../services/common-data.service';
import { ManPowerService } from './man-power.service';

@Component({
  selector: 'app-man-power',
  templateUrl: './man-power.component.html',
  styleUrls: ['./man-power.component.css']
})
export class ManPowerComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  claimManpowerObject: any = {};
  result: any = {};

  constructor(private _route: ActivatedRoute, private _claimsService: ManPowerService,
     public _commonService: CommonService, public _commonData: CommonDataService) { }

  ngOnInit() {
    this.getClaimGeneralData();
    this.loadClaimReimbursement();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getClaimGeneralData() {
    this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }
  loadClaimReimbursement() {
    this.$subscriptions.push(this._claimsService.loadClaimManpower(
      {
        claim: {
          'claimId': this._route.snapshot.queryParams['claimId'],
          'awardNumber': this.result.claim.award.awardNumber,
          'sequenceNumber': this.result.claim.award.sequenceNumber,
          'startDate': parseDateWithoutTimestamp(this.result.claim.startDate),
          'endDate': parseDateWithoutTimestamp(this.result.claim.endDate),
          'awardStartDate': parseDateWithoutTimestamp(this.result.claim.award.beginDate),
          'awardEndDate': parseDateWithoutTimestamp(this.result.claim.award.finalExpirationDate)
       }
      }).subscribe((data: any) => {
       this.claimManpowerObject = data;
       this.claimManpowerObject.claimId = this.result.claim.claimId;
       this.claimManpowerObject.claimNumber = this.result.claim.claimNumber;
    }));
  }
}
