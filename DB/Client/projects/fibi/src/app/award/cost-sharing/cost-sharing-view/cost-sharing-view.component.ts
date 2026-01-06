import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-cost-sharing-view',
  templateUrl: './cost-sharing-view.component.html',
  styleUrls: ['./cost-sharing-view.component.css']
})
export class CostSharingViewComponent implements OnInit, OnChanges {

  @Input() result: any = {};
  @Input() costShareResult: any = {};
  isCostSharesWidgetOpen = true;
  currency: any;
  organizationSum = 0;
  commitmentSum = 0;
  costShareMetSum = 0;
  costShareData: any = [];

  constructor(private _commonService: CommonService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
  }

  ngOnChanges() {
    this.costShareData = this.result.awardCostShares;
    if (this.costShareData) {
      this.costShareSum();
    }
  }
    /**
   * @param  {} costShareTypeCode
   * get cost share type code and returns corresponding type description to the table list
   */
  getCostshareTypes(costShareTypeCode) {
    let costShareType: any = {};
    if (this.costShareResult.costShareTypes && costShareTypeCode) {
      costShareType = this.costShareResult.costShareTypes.find(type => type.costShareTypeCode === costShareTypeCode);
      return (costShareType) ? costShareType.description : null;
    }
  }
  costShareSum() {
    this.commitmentSum = 0;
    this.costShareMetSum = 0;
    this.costShareData.forEach(element => {
      this.commitmentSum = this.commitmentSum + element.commitmentAmount;
      this.costShareMetSum = this.costShareMetSum + element.costShareMet;
    });
  }
}
