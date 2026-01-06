import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonDataService } from '../../../services/common-data.service';
import {concatUnitNumberAndUnitName} from "../../../../common/utilities/custom-utilities"
@Component({
  selector: 'app-institute-proposal-view',
  templateUrl: './institute-proposal-view.component.html',
  styleUrls: ['./institute-proposal-view.component.css']
})
export class InstituteProposalViewComponent implements OnInit, OnChanges {
  @Input()  result: any = {};
  isShowCollapse = true;
  isHighlighted: any = false;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  constructor(private _router: Router, private _commonData: CommonDataService) { }

  ngOnInit() {}
  ngOnChanges() {
    if (this.result.award.awardId) {
      this.isHighlighted = this._commonData.checkSectionHightlightPermission('117');
    }
  }
}
