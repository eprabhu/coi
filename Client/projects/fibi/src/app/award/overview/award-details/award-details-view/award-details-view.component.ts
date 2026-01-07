import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonDataService } from '../../../services/common-data.service';
import {concatUnitNumberAndUnitName} from "../../../../common/utilities/custom-utilities"

declare var $: any;

@Component({
  selector: 'app-award-details-view',
  templateUrl: './award-details-view.component.html',
  styleUrls: ['./award-details-view.component.css']
})
export class AwardDetailsViewComponent implements OnInit, OnChanges {

  @Input() result: any = {};
  keywords: any = [];
  isHighlighted: any = false;
  showGrantDetails = false;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  constructor(private _commonData: CommonDataService) { }

  ngOnInit() {
    if (this.result.award.awardKeywords) {
      this.keywords = this.result.award.awardKeywords;
    }
  }

  ngOnChanges() {
    if (this.result.award.awardId) {
      this.isHighlighted = this._commonData.checkSectionHightlightPermission('101');
    }
  }

  setGrantDetailsValue(isShowModal) {
    this.showGrantDetails = isShowModal;
  }

}
