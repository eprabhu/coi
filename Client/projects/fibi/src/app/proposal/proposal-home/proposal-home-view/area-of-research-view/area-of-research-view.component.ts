import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-area-of-research-view',
  templateUrl: './area-of-research-view.component.html',
  styleUrls: ['./area-of-research-view.component.css']
})
export class AreaOfResearchViewComponent implements OnInit {
  @Input() dataVisibilityObj: any = {};
  @Input() result: any = {};
  @Input() helpText: any = {};

  isResearchDescriptionReadMore = false;
  isMultiDisciplinaryDescriptionReadMore = false;

  constructor() { }

  ngOnInit() {
  }

}
