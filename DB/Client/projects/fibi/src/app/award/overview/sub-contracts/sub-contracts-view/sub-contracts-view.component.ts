import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonDataService } from '../../../services/common-data.service';
import { CommonService } from '../../../../common/services/common.service';

@Component({
  selector: 'app-sub-contracts-view',
  templateUrl: './sub-contracts-view.component.html',
  styleUrls: ['./sub-contracts-view.component.css']
})
export class SubContractsViewComponent implements OnInit, OnChanges {
  @Input() result: any = {};
  isShowCollapse = true;
  subContractData: any = [];
  organizationSum = 0;
  isHighlighted: any = false;
  currency;

  constructor(private _commonData: CommonDataService, public _commonService: CommonService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
  }

  ngOnChanges() {
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('112');
    this.subContractData = this.result.awardSubContracts;
    if (this.subContractData) {
      this.subContractSum();
    }
  }

  subContractSum() {
    this.organizationSum = 0;
    this.subContractData.forEach(element => {
      this.organizationSum = this.organizationSum + parseInt(element.amount, 10);
    });
  }

}
