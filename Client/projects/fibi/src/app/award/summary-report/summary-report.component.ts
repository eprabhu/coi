import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription, Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';


@Component({
  selector: 'app-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.css']
})
export class SummaryReportComponent implements OnInit, OnDestroy {

  $awardData: ISubscription;
  isReportsEdit = false;
  $subscriptions: Subscription[] = [];

  constructor(private _commonData: CommonDataService) { }

  ngOnInit() {
    this.getAwardGeneralData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.isReportsEdit = this._commonData.getSectionEditableFlag('109');
      }
    }));
  }

}
