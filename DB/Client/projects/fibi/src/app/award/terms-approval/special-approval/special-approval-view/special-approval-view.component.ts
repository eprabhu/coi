import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpecialApprovalService } from '../special-approval.service';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-special-approval-view',
  templateUrl: './special-approval-view.component.html',
  styleUrls: ['./special-approval-view.component.css']
})
export class SpecialApprovalViewComponent implements OnInit, OnDestroy {
  foreignTravelSum = 0;
  equipmentSum = 0;
  totalSum = 0;
  specialForeignTravel: any = [];
  specialEquipment: any = [];
  reportTermsLookup: any = {};
  awardId: any;
  isApproval = false;
  isEquipment = false;
  $subscriptions: Subscription[] = [];

  constructor(private _route: ActivatedRoute, public _commonService: CommonService,
    private _specialApprovalService: SpecialApprovalService) { }

  ngOnInit() {
    this.awardId = this._route.snapshot.queryParamMap.get('awardId');
    if (this.awardId) {
      this.$subscriptions.push(this._specialApprovalService.reportsTermsLookUpData(this.awardId)
        .subscribe((result: any) => {
          this.reportTermsLookup = result;
          this.specialForeignTravel = this.reportTermsLookup.awardAprovedForeignTravelList;
          this.specialEquipment = this.reportTermsLookup.awardApprovedEquipmentList;
          this.specialApprovalSum();
        }));
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
     * calculate the total sum of foreign travel amount and equipment amount.
     */
  specialApprovalSum() {
    this.foreignTravelSum = 0;
    this.equipmentSum = 0;
    if (this.specialForeignTravel) {
      this.specialForeignTravel.forEach(element => {
      this.foreignTravelSum = this.foreignTravelSum + parseInt(element.amount, 10);
      });
    }
    if (this.specialForeignTravel) {
      this.specialEquipment.forEach(element => { this.equipmentSum = this.equipmentSum + parseInt(element.amount, 10); });
    }
  }
}
