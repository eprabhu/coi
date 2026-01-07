import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() comparisonData:any = {
    base: {},
    current: {},
    proposalId: false
  };
  @Input() currentMethod: string;
  proposalSpecialReviews: any = [];
  isWidgetOpen = true;
  isShowCollapse = true;

  constructor() { }

  ngOnInit() {
  }

}
