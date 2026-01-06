/**
 * created by Harshith A S
 * last updated on 31-01-2020.
 * Please read this documentation before making any code changes
 * https://docs.google.com/document/d/1vDG_di1AkWOi5AboNArc60zhX3Vzw4lcVTUo66lEnUc/edit
 */

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GrantCommonDataService } from '../services/grant-common-data.service';

@Component({
  selector: 'app-key-performance-indicator',
  templateUrl: './key-performance-indicator.component.html',
  styleUrls: ['./key-performance-indicator.component.css']
})
export class KeyPerformanceIndicatorComponent implements OnInit, OnDestroy {

  result: any;
  $subscriptions: Subscription[] = [];

  constructor(public _commonData: GrantCommonDataService) { }

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
