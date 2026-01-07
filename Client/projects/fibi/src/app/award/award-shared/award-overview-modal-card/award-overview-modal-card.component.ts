import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';

@Component({
  selector: 'app-award-overview-modal-card',
  templateUrl: './award-overview-modal-card.component.html',
  styleUrls: ['./award-overview-modal-card.component.css']
})
export class AwardOverviewModalCardComponent implements OnInit , OnDestroy {
  awardId: number;
  generalDetails: any;
  $subscriptions: Subscription[] = [];

  constructor(public _commonData: CommonDataService) { }

  ngOnInit() {
    this.getAwardGeneralData();
  }
  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      this.generalDetails = data;
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
