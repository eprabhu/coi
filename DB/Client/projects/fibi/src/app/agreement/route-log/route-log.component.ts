/** last updated by Aravind on 12-0 **/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { AgreementCommonDataService } from '../agreement-common-data.service';

@Component({
  selector: 'app-route-log',
  template: `<workflow-engine  [workFlowResult]="result"
             (workFlowResponse)='workFlowResponse($event)' [workFlowDetailKey]="'agreementHeader'"></workflow-engine>`
})
export class RouteLogComponent implements OnInit, OnDestroy {

  awardId: any;
  $subscriptions: Subscription[] = [];
  result: any;

  constructor(private _commonAgreementData: AgreementCommonDataService) { }

  ngOnInit() {
    this._commonAgreementData.isShowSaveButton = false;
    this.getAgreementGeneralData();
  }
 getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  workFlowResponse(data) {
    this.updateAgreementData(data);
    this._commonAgreementData.setAgreementData(this.result);
  }

  updateAgreementData(data) {
    this.result.agreementHeader = data.agreementHeader;
    this.result.approvalStatus = data.approvalStatus;
    this.result.workflow = data.workflow;
    this.result.workflowList = data.workflowList;
    this.result.canApproveRouting = data.canApproveRouting;
    this.result.approverNumber = data.approverNumber;
    this.result.approverFlag = data.approverFlag;
    this.result.approverPersonId = data.approverPersonId;
    this.result.workflowList = data.workflowList;
  }
}
