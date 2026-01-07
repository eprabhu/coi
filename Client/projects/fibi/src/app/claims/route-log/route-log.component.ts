/** last updated by Aravind on 12-11-2019 **/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ClaimsService } from '../services/claims.service';
import { CommonDataService } from '../services/common-data.service';
declare var $: any;

@Component({
  selector: 'app-route-log',
  template: `<workflow-engine *ngIf="_commonData.claimSectionConfig['1411'].isActive" [workFlowResult]="result"
  (workFlowResponse)='workFlowResponse($event)'
  (errorEvent)='errorEvent()' [workFlowDetailKey]="'claim'"></workflow-engine>`
})
export class RouteLogComponent implements OnInit, OnDestroy {

  awardId: any;
  $subscriptions: Subscription[] = [];
  result: any;

  constructor(private _activatedRoute: ActivatedRoute, private _claimsService: ClaimsService,
    public _commonData: CommonDataService) { }

  ngOnInit() {
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.getClaimGeneralData();
    this.isRouteLogChange();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  isRouteLogChange() {
    this.$subscriptions.push(this._claimsService.isRouteChangeTrigger.subscribe((data: any) => {
      this.getClaimGeneralData();
    }));
  }

  getClaimGeneralData() {
    this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  workFlowResponse(data) {
    this.updateClaimData(data);
  }

  /**
 * @param  {} data
 * setup claim common data the values that changed after the service call need to be updated into the store.
 * every service call wont have all the all the details as response so
 * we need to cherry pick the changes and update them to the store.
 */
  updateClaimData(data) {
    this.result.claim = data.claim;
    this.result.workflow = data.workflow;
    this.result.workflowList = data.workflowList;
    this.result.canApproveRouting = data.canApproveRouting;
    this.updateClaimStoreData();
  }

  updateClaimStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setClaimData(this.result);
  }

  errorEvent() {
    $('#invalidActionModal').modal('show');
    }

}
