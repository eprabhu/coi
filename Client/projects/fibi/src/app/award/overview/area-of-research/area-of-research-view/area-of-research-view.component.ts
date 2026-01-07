import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonDataService } from '../../../services/common-data.service';

@Component({
  selector: 'app-area-of-research-view',
  templateUrl: './area-of-research-view.component.html',
  styleUrls: ['./area-of-research-view.component.css']
})
export class AreaOfResearchViewComponent implements OnInit, OnChanges {
  @Input() result: any = {};
  @Input() lookupData: any = {};
  @Input() helpText: any = {};

  isShowCollapse = true;
  isMoreInfoWdgtOpen = true;
  isResearchDescriptionReadMore = false;
  isMultiDisciplinaryDescriptionReadMore = false;
  isHighlighted = false;

  constructor(private _commonData: CommonDataService) { }

  ngOnInit() {
  }
  ngOnChanges() {
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('125');
  }
}
