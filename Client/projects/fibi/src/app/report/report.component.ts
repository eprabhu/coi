import { Component, OnInit } from '@angular/core';

import { slideInOut, fadeDown } from '../common/utilities/animations';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  animations: [slideInOut, fadeDown]
})
export class ReportComponent implements OnInit {


  constructor() {}

  ngOnInit() {
  }

}
