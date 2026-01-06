import { Component, OnInit, OnDestroy } from '@angular/core';
import { SponsorTermsService } from '../sponsor-terms.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-sponsor-terms-view',
  templateUrl: './sponsor-terms-view.component.html',
  styleUrls: ['./sponsor-terms-view.component.css']
})
export class SponsorTermsViewComponent implements OnInit, OnDestroy {

  awardId: any;
  reportTermsLookup: any = {};
  termKeys: any[] = [];
  termDatas: any = [];
  isTerms = false;
  $subscriptions: Subscription[] = [];

  constructor(private _termsService: SponsorTermsService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.awardId = this._route.snapshot.queryParamMap.get('awardId');
      if (this.awardId) {
        this.$subscriptions.push(this._termsService.reportsTermsLookUpData(this.awardId)
          .subscribe((result: any) => {
            this.reportTermsLookup = result;
          }));
        this.getTermsData();
      }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  getTermsData() {
    this.$subscriptions.push(this._termsService.termsData(this.awardId)
      .subscribe((data: any) => {
        this.termDatas = data.awardTermsList;
        if (this.termDatas) {
          this.termKeys = Object.keys(this.termDatas);
        }
      }));
  }

}
