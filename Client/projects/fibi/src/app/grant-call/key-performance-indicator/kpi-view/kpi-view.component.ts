/**
 * created by Harshith A S
 * last updated on 29-10-2019.
 * please read this documentation before making any code changes
 * https://docs.google.com/document/d/1vDG_di1AkWOi5AboNArc60zhX3Vzw4lcVTUo66lEnUc/edit
 */

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeyPerformanceIndicatorService } from '../key-performance-indicator.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-kpi-view',
  templateUrl: './kpi-view.component.html',
  styleUrls: ['./kpi-view.component.css']
})
export class KpiViewComponent implements OnInit, OnDestroy {
  @Input() result: any;

  grantCallKpiList: any = [];
  grantCallId: any = '';
  isCollapsed = [];
  kpiList: any = '';
  isFlag;
  $subscriptions: Subscription[] = [];

  constructor(private _route: ActivatedRoute,
    public _KeyPerformanceIndicatorService: KeyPerformanceIndicatorService) { }

  ngOnInit() {
    this.grantCallId = this.result.grantCall.grantCallId;
    this.loadKpiBygrantCall();
    this.isCollapsed[0] = true;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {this.grantCallId}} when grand call id is  passed lookup data will load for end point search.
   */
  // whay is objec.assign used here??
  // and why is new variable for grantCallKpiList required??
  loadKpiBygrantCall() {
    this.$subscriptions.push(this._KeyPerformanceIndicatorService.getKpiByGrantCall({ 'grantCallId': this.grantCallId }).subscribe(data => {
      this.kpiList = data;
      this.grantCallKpiList = Object.assign(this.kpiList.grantCallKpis);
    }));
  }
}
