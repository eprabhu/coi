import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-scoring-criteria',
  templateUrl: './scoring-criteria.component.html',
  styleUrls: ['./scoring-criteria.component.css']
})
export class ScoringCriteriaComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  result: any = {};

  constructor(public _commonData: GrantCommonDataService) {}

  ngOnInit() {
    this.getGrantCallGeneralData();
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
