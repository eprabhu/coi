/** Last updated by Ramlekshmy on 12--11-2019 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { ActivatedRoute } from '@angular/router';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { WebSocketService } from '../../common/services/web-socket.service';

@Component({
  selector: 'app-award-review',
  template: `<div id="award-review-section">
             <app-review *ngIf="moduleDetails.name != null && _commonData.awardSectionConfig['118'].isActive" [showRequestModal]="showRequestModal" [preReviewReq]="preReviewReq"
              [moduleDetails]="moduleDetails"></app-review> </div>`,
})
export class AwardReviewComponent implements OnInit, OnDestroy {

  preReviewReq: any = {
    moduleItemCode: 1,
    moduleSubItemCode: 0,
    moduleItemKey: '',
    moduleSubItemKey: '0',
    reviewTypeCode: '3',
    reviewSectionTypeCode: '3'
  };
  showRequestModal: any = {};
  moduleDetails: any = {};
  lookupData: any = [];
  $subscriptions: Subscription[] = [];

  constructor(public _commonData: CommonDataService, private route: ActivatedRoute,public webSocket:WebSocketService ) { }

  ngOnInit() {
    this.preReviewReq.moduleItemKey = this.route.snapshot.queryParams['awardId'];
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.setModuleDetails(data);
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /** setModuleDetails - sets module details to be passed to pre-routing
   * @param data
   */
  setModuleDetails(data) {
    this.moduleDetails.title = data.award.title;
    this.moduleDetails.name = 'Award';
    this.moduleDetails.availableRights = data.availableRights;
    this.moduleDetails.isShowAssignBtn = (data.award.workflowAwardStatusCode !== '3') ? true : false;
    this.moduleDetails.isShowActionBtns = (data.award.workflowAwardStatusCode !== '3') ? true : false;
    if (!this.webSocket.isLockAvailable('Award' + '#' + this.route.snapshot.queryParamMap.get('awardId'))) {
      this.moduleDetails.isShowAssignBtn = false;
      this.moduleDetails.isShowActionBtns =false;
    }
  }
}
