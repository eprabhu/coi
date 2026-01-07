import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-endorsement-view',
  templateUrl: './endorsement-view.component.html',
  styleUrls: ['./endorsement-view.component.css']
})
export class EndorsementViewComponent implements OnInit {

  @Input() result: any = {};
  isCollapsePayment = false;

  constructor() { }

  ngOnInit() {
  }

}
