import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { BudgetService } from '../budget.service';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css']
})
export class ClaimsComponent implements OnInit {
  $subscriptions: Subscription[] = [];
  awardBudgetClaimsData: any = [];
  totalClaimsAmount = 0;
  awardId: any;
  awardNumber: any;

  constructor(private _budgetService: BudgetService, public _commonData: CommonDataService,
    public _commonService: CommonService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getAwardGeneralData();
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.loadSubmittedClaimsForAward();
  }

  /*  This function will load all data that is need to be shown on table of Award claims page */

  loadSubmittedClaimsForAward() {
    this.$subscriptions.push(this._budgetService.loadSubmittedClaimsForAward({
      'awardId': this.awardId,
      'awardNumber': this.awardNumber
    }).subscribe((data: any) => {
          if (data) {
            this.awardBudgetClaimsData = data.claims;
            this.totalClaimsAmount = this.awardBudgetClaimsData.reduce((acc, claim) => claim.totalAmount + acc, 0);
          }
      }));
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardNumber = data.award.awardNumber;
      }
    }));
  }


  getBadgeByStatusCode(claimStatusCode: string): string {
    if (claimStatusCode === '4') {
      return 'success';
    } else if (claimStatusCode === '2' || claimStatusCode === '7') {
      return 'warning';
    } else {
      return 'info';
    }
  }
}
