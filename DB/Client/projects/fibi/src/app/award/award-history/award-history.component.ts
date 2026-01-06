// Last updated by Krishnanunni on 05-12-2019
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';
import { AwardHistoryService } from './award-history.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { openInNewTab } from '../../common/utilities/custom-utilities';

@Component({
  selector: 'app-award-history',
  templateUrl: './award-history.component.html',
  styleUrls: ['./award-history.component.css']
})
export class AwardHistoryComponent implements OnInit, OnDestroy {

  awardVersionsData: any = [];
  $subscriptions: Subscription[] = [];
  masterVersion: any = null;
  awardId:  any;
  constructor(public _commonData: CommonDataService, private _awardHistoryService: AwardHistoryService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data && data.award.awardId) {
        this.$subscriptions.push(this._awardHistoryService.getAwardHistoryInfo({ 'awardNumber': data.award.awardNumber, 'isAwardHistoryTab' : true })
          .subscribe((result: any) => {
            this.awardVersionsData = result.awards;
            this.awardId = data.award.awardId;
            const MASTER_INDEX = this.getIndexOfMaster();
            if (MASTER_INDEX !== -1) {
              // this.awardVersionsData.unshift(this.awardVersionsData.splice(MASTER_INDEX, 1)[0]);
              this.masterVersion = this.awardVersionsData.splice(MASTER_INDEX, 1)[0];
            } else {
              this.masterVersion = null;
            }
          }));
      }
    }));
  }

  getIndexOfMaster() {
    return this.awardVersionsData.findIndex(e => e.sequenceNumber === 0);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param statusCode
   * Sets award status badge w.r.t status code
   */
  getBadgeByStatusCode(statusCode) {
    if (statusCode === 'ACTIVE') {
      return 'success';
    } else if (statusCode === 'CANCELLED') {
      return 'danger';
    } else if (statusCode === 'PENDING') {
      return 'warning';
    } else {
      return 'info';
    }
  }
  /**
  * @param  {} requestId
  * open selected service request in new browser tab w.r.t requestId
  */
  viewServiceRequest(requestId) {
      openInNewTab('service-request?', ['serviceRequestId'], [requestId]);
  }

}
