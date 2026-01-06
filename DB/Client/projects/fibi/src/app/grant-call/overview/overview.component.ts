import { Component, OnInit, OnDestroy } from '@angular/core';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GrantCallService } from '../services/grant.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  result: any = {};
  map = new Map();
  isEditMode: any = false;
  constructor(public _commonData: GrantCommonDataService, private _grantService: GrantCallService) { }

  ngOnInit() {
    this.getGrantCallGeneralData();
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this._commonData.grantCallTitle.title = this.result.grantCall.grantCallName;
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  saveOrupdateGrantCall(event) {
    if (event) {
      this.getGrantCallGeneralData();
      this._grantService.isGrantActive.next(true);
    }
  }

}
