import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../services/common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-special-approval',
  templateUrl: './special-approval.component.html',
  styleUrls: ['./special-approval.component.css']
})
export class SpecialApprovalComponent implements OnInit, OnDestroy {

  isApprovalEdit = false;
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
        this.isApprovalEdit = this._commonData.getSectionEditableFlag('119');
      }
    }));
  }
}
