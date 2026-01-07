import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OverviewService } from '../../overview.service';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../../services/common-data.service';

@Component({
  selector: 'app-project-cost-overview-view',
  templateUrl: './project-cost-overview-view.component.html',
  styleUrls: ['./project-cost-overview-view.component.css']
})
export class ProjectCostOverviewViewComponent implements OnInit, OnDestroy {
  @Input() serviceRequestList: any = {};
  isProjectCostActive = true;
  awardId: any;
  awardCostDetails: any = {};
  isShowCollapse = false;
  $subscriptions: Subscription[] = [];
  result: any;
  anticipatedModalType: string = null;
  isViewAnticipatedDistribution = false;

  constructor(private _overviewService: OverviewService, private route: ActivatedRoute,
    public _commonService: CommonService, public _commonDataService: CommonDataService) { }

    ngOnInit() {
        this.awardId = this.route.snapshot.queryParams['awardId'];
        this.getAwardGeneralData();
        this.getPermissions();
    }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonDataService.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getAwardFunds();
      }
    }));
  }

  getPermissions(): void {
    this.isViewAnticipatedDistribution = this._commonDataService.awardSectionConfig['196'].isActive &&
            (this._commonDataService.checkDepartmentLevelRightsInArray('VIEW_ANTICIPATED_FUNDING_DISTRIBUTION') ||
            this._commonDataService.checkDepartmentLevelRightsInArray('MODIFY_ANTICIPATED_FUNDING_DISTRIBUTION'));
  }

  getAwardFunds() {
    this.$subscriptions.push(this._overviewService.getAwardFunds(
      {'awardId': this.awardId,'awardNumber': this.result.award.awardNumber }).subscribe((data: any) => {
      this.awardCostDetails = data;
    }));
  }

    updateAnticipatedDistributable(event): void {
        this.anticipatedModalType = null;
    }

}
