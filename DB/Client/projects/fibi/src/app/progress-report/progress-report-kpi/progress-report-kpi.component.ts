import { Component, OnInit } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';

@Component({
  selector: 'app-progress-report-kpi',
  templateUrl: './progress-report-kpi.component.html',
  styleUrls: ['./progress-report-kpi.component.css']
})
export class ProgressReportKpiComponent implements OnInit {

  constructor(public _commonData: CommonDataService) { }

  ngOnInit() {
  }

}
