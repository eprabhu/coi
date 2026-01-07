import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GoogleChartService } from '../google-chart.service';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

declare var google: any;

@Component({
  selector: 'app-project-ended-but-not-closed',
  templateUrl: './project-ended-but-not-closed.component.html',
  styleUrls: ['./project-ended-but-not-closed.component.css'],
  animations: [fadeDown]
})
export class ProjectEndedButNotClosedComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  awardPieChartData = [];
  private awardOptions = {};
  private awardStateList = [];
  private categoryList = [];
  private awardData;
  private awardChart;
  isShowLoader = false;
  widgetDescription: any;

  constructor(private router: Router, private _commonService: CommonService,
    private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(23);
    this.getSummaryProposalPieChart();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getSummaryProposalPieChart() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'AWARD_ENDED_BUT_NOT_CLOSED' })
      .subscribe((data: any) => {
        this.awardPieChartData = data.widgetDatas || [];
        this.drawSummaryProposalPieChart();
      }, err => { this.isShowLoader = false; }));
  }

  drawSummaryProposalPieChart() {
    if (this.awardPieChartData.length) {
      this.awardStateList = [];
      this.awardStateList.push(['Duration', 'BudgetBalance']);
      for (let index = 0; index < this.awardPieChartData.length; index++) {
        this.categoryList.push([this.awardPieChartData[index][0], this.awardPieChartData[index][1]]);
        this.awardStateList.push([this.awardPieChartData[index][0], this.awardPieChartData[index][1]]);
      }
      super.googleChartFunction();
    } else {
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.awardData = google.visualization.arrayToDataTable(this.awardStateList);
    this.awardOptions = {
      is3D: true,
      legend: {
        position: 'right', alignment: 'center',
        textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' }
      },
      chartArea: { width: '140%', height: '140%' },
      colors: ['#E25B5F', '#7E57C2', '#24A095', '#FFF15A'],
      sliceVisibilityThreshold: 0
    };
    this.awardChart = this.createPiChart(document.getElementById('pie-chart_project_ended_but_not_closed'));
    if (this.awardChart) {
      this.awardChart.draw(this.awardData, this.awardOptions);
      google.visualization.events.addListener(this.awardChart, 'onmouseover', (event) => {
        document.getElementById('pie-chart_project_ended_but_not_closed').style.cursor = 'pointer';
      });
      google.visualization.events.addListener(this.awardChart, 'onmouseout', (event) => {
        document.getElementById('pie-chart_project_ended_but_not_closed').style.cursor = '';
      });
    }
    this.isShowLoader = false;
  }

  onResize(event) {
    if (this.awardPieChartData.length && this.awardChart) {
      this.awardChart.draw(this.awardData, this.awardOptions);
    }
  }

}
