import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../services/common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-sponsor-terms',
  templateUrl: './sponsor-terms.component.html',
  styleUrls: ['./sponsor-terms.component.css']
})
export class SponsorTermsComponent implements OnInit, OnDestroy {

  isTermsEdit = false;
  tempTabName: any;
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
        this.isTermsEdit = this._commonData.getSectionEditableFlag('110');
      }
    }));
  }
}
