import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-manpower-summary',
  templateUrl: './manpower-summary.component.html',
  styleUrls: ['./manpower-summary.component.css']
})
export class ManpowerSummaryComponent implements OnInit {
  @Input() claimManpowerObject: any = {};
  constructor() { }

  ngOnInit() {
  }

}
