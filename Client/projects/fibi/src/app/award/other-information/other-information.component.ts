import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-other-information',
  template: `<div *ngIf="_commonData?.awardSectionConfig['120']?.isActive" id ="award-other-information-section">
                <app-custom-element *ngIf="awardId" [moduleItemKey]="awardId" [moduleCode]='1'
                [viewMode]="viewMode" (dataChangeEvent)="dataChangeEvent($event)"></app-custom-element> </div>`,
})
export class OtherInformationComponent implements OnInit, OnDestroy {

  awardId: any;
  viewMode: string;
  $subscriptions: Subscription[] = [];

  constructor(public _commonData: CommonDataService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardId = data.award.awardId;
        this.viewMode = !this._commonData.getSectionEditableFlag('120') ? 'view' : 'edit';
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  dataChangeEvent(event) {
    this._commonData.isAwardDataChange = event;
  }
}
