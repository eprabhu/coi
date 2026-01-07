import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-awardMedusa',
  template: `<app-medusa *ngIf="medusa.projectId && _commonData.awardSectionConfig['160'].isActive" [medusa] = "medusa"> </app-medusa>`,
})
export class MedusaComponent implements OnInit, OnDestroy {
  awardId: any;
  medusa: any = {};
  awardData: any = {};
  $subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute, public _commonData: CommonDataService) { }

  ngOnInit() {
    this.awardId = this.route.snapshot.queryParams['awardId'];
    this.medusa.moduleCode = 1;
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data !== null) {
        this.medusa.projectId = data.award.awardNumber;
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
