import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../services/common-data.service';
import { ManPowerService } from '../man-power.service';
import { openInNewTab } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';




@Component({
  selector: 'app-manpower-person-details',
  templateUrl: './manpower-person-details.component.html',
  styleUrls: ['./manpower-person-details.component.css']
})
export class ManpowerPersonDetailsComponent implements OnInit, OnChanges {
  constructor(
    public _commonData: CommonDataService,
    private _manpowerService: ManPowerService,
    public _commonService: CommonService
    ) {
  }

  @Input() resourceModalDetails: any;
  $subscriptions: Subscription[] = [];
  awardData: any = {};
  manpowerAllocation: any = [];


  ngOnInit() {
    this.getAwardGeneralData();
  }
  ngOnChanges() {
    if (this.resourceModalDetails) {
      this.getResourceDetail();
    }
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  getResourceDetail() {
    this.$subscriptions.push(this._manpowerService.getResourceDetail(this.getRequestObject())
      .subscribe((data: any) => {
        if (data.currentAndFutureResources) {
          this.manpowerAllocation = data.currentAndFutureResources;
        }
      }));
  }
  getRequestObject() {
    return {
      'manpowerResourceId': this.resourceModalDetails.resourceDetails.manpowerResourceId,
      'personId' : this.resourceModalDetails.resourceDetails.personId,
      'isNewHire' : this.resourceModalDetails.isNewHire
    };
  }
  navigateToAward(awardId) {
    if (awardId) {
      openInNewTab('award/manpower?', ['awardId'], [awardId]);
    }
  }

  /**
   * clearing the modal data on close
   */
  closeModal() {
    this.resourceModalDetails = {};
  }

}
