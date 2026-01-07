/** last updated by Aravind on 12-11-2019 **/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { AwardService } from '../services/award.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-route-log',
  template: `<workflow-engine *ngIf="result?.award?.awardId && _commonData.awardSectionConfig['162'].isActive" [workFlowResult]="result"
             (workFlowResponse)='workFlowResponse($event)' (errorEvent)='errorEvent()' [workFlowDetailKey]="'award'"></workflow-engine>`
})
export class RouteLogComponent implements OnInit, OnDestroy {

  awardId: any;
  $subscriptions: Subscription[] = [];
  result: any;
  constructor(private _activatedRoute: ActivatedRoute, private _router: Router,
    public _commonData: CommonDataService, private _awardService: AwardService) { }


  ngOnInit() {
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.getAwardGeneralData();
    this.isRouteLogChange();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  isRouteLogChange() {
    this.$subscriptions.push(this._awardService.isRouteChangeTrigger.subscribe((data: any) => {
      this.getAwardGeneralData();
    }));
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  workFlowResponse(data) {
    this.updateAwardData(data);
    this._commonData.setAwardData(this.result);
    this._awardService.isAwardActive.next(true);
    if (data.award.awardSequenceStatus === 'ACTIVE') {
      this._router.navigate(['fibi/award/overview'], { queryParams: { 'awardId': data.award.awardId } });
    }
  }

  /**
   * @param  {} data
   * for updating the award data
   */
  updateAwardData(data) {
    this.result.award = data.award;
    this.result.awardPersons = data.awardPersons;
    this.result.workflow = data.workflow;
    this.result.workflowList = data.workflowList;
    this.result.canApproveRouting = data.canApproveRouting;
    this.result.submitUserFullName = data.submitUserFullName;
    this.result.updateTimeStamp = data.updateTimeStamp;
    this.result.serviceRequest = data.serviceRequest;
    this.result.previousActiveAwardId = data.previousActiveAwardId;
    this.result.pendingAwardsSummary = data.pendingAwardsSummary;
  }

  errorEvent() {
    $('#invalidActionModal').modal('show');
    }

}
