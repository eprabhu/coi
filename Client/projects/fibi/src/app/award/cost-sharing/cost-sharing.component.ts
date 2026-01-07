import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';
import { OverviewService } from '../overview/overview.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CostSharingService } from './cost-sharing.service';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-cost-sharing',
  templateUrl: './cost-sharing.component.html',
  styleUrls: ['./cost-sharing.component.css']
})
export class CostSharingComponent implements OnInit, OnDestroy {

  result: any = {
    award: '',
  };
  awardId: any;
  isCostShareEdit = false;
  map = new Map();
  costShareResult: any = {};
  awardCostDetails: any = [];
  isProjectCostActive = false;
  $subscriptions: Subscription[] = [];
  anticipatedModalType: string = null;
  isViewAnticipatedDistribution = false;

  constructor(public _commonData: CommonDataService, private _costShareService: CostSharingService,
    private _overviewService: OverviewService,
    private _activatedRoute: ActivatedRoute, public _commonService: CommonService) { }

  ngOnInit() {
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.getCostShareData();
    this.getAwardGeneralData();
    this.isProjectCostActive = !this.result.serviceRequest ? false : true;
    this.getPermissions();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardFunds() {
    this.$subscriptions.push(this._overviewService.getAwardFunds(
      {'awardId': this.awardId,'awardNumber': this.result.award.awardNumber }).subscribe((data: any) => {
      this.awardCostDetails = data;
    }));
  }

  getPermissions(): void {
    this.isViewAnticipatedDistribution = this._commonData.awardSectionConfig['196'].isActive &&
            (this._commonData.checkDepartmentLevelRightsInArray('VIEW_ANTICIPATED_FUNDING_DISTRIBUTION') ||
            this._commonData.checkDepartmentLevelRightsInArray('MODIFY_ANTICIPATED_FUNDING_DISTRIBUTION'));
  }
  /**
  * Gets award loopup data w.r.t  awardId,personId and lead unit number
  */

  getCostShareData() {
    this.$subscriptions.push(this._costShareService.getCostShareData(
      {'awardId': this.awardId,'awardNumber': this.result.award.awardNumber }
    ).subscribe((data: any) => {
      this.costShareResult = data;
    }));
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getSectionEditableList();
        this.getAwardFunds();
      }
    }));
  }

  /**
  * returns editable permission w.r.t section code
  */
  getSectionEditableList() {
    this.isCostShareEdit = this._commonData.getSectionEditableFlag('111'); // cost share
  }

  updateAnticipatedDistributable(event?: string): void {
    this.anticipatedModalType = event;
  }

}
