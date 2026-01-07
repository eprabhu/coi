import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GoogleChartService } from '../google-chart.service';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';


declare var google: any;

@Component({
  selector: 'app-under-utilized-awards',
  templateUrl: './under-utilized-awards.component.html',
  styleUrls: ['./under-utilized-awards.component.css'],
  animations: [fadeDown]
})
export class UnderUtilizedAwardsComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isShowLoader = true;
  underUtilizedAwardsStateList: any = [];
  private underUtilizedAwardOptions = {};
  private underUtilizedAward;
  private underUtilizedAwardChart;
  underUtilizedAwards: any = [];
  colors: any = [];
  widgetDescription: any;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(12);
    this.drawUnderUtilizedAwardsPieChart();
  }

  drawUnderUtilizedAwardsPieChart() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget({
      tabName: 'UNDER_UTALIZED_AWARD',
      unitNumber: null
    }).subscribe((data: any) => {
      this.setUtilisationData(data);
      }, err => { this.isShowLoader = false; }));
  }

  setUtilisationData(data) {
    const HIGH_UTILIZATION = data.widgetDatas.find(item => item.includes('High Utilization'));
    const LOW_UTILIZATION = data.widgetDatas.find(item => item.includes('Low Utilization'));
    const MEETS_UTILIZATION = data.widgetDatas.find(item => item.includes('Acceptable Utilization'));
    if (HIGH_UTILIZATION) {
      this.underUtilizedAwards.push(HIGH_UTILIZATION);
      this.colors.push('#109618');
    }
    if (LOW_UTILIZATION) {
      this.underUtilizedAwards.push(LOW_UTILIZATION);
      this.colors.push('#DC3912');
    }
    if (MEETS_UTILIZATION) {
      this.underUtilizedAwards.push(MEETS_UTILIZATION);
      this.colors.push('#FCCB2F');
    }
    this.drawAwardBySponsorChart();
  }

  drawAwardBySponsorChart() {
    if (this.underUtilizedAwards.length > 0) {
      this.underUtilizedAwardsStateList = [];
      this.underUtilizedAwardsStateList.push(['utilization', 'AwardCount']);
      for (let index = 0; index < this.underUtilizedAwards.length; index++) {
        this.underUtilizedAwardsStateList.push([this.underUtilizedAwards[index][0], this.underUtilizedAwards[index][1]]);
      }
      super.googleChartFunction();
    } else {
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.underUtilizedAward = google.visualization.arrayToDataTable(this.underUtilizedAwardsStateList);
    this.underUtilizedAwardOptions = {
      title: 'Under Utilized Awards info',
      is3D: true,
      colors: this.colors,
      legend: {
        position: 'right', alignment: 'center',
        textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' }
      },
      chartArea: { width: '140%', height: '140%' },
      sliceVisibilityThreshold: 0
    };
    this.underUtilizedAwardChart = this.createPiChart(document.getElementById('pie-chart_under_utilized_award'));
    if (this.underUtilizedAwardChart) {
      this.underUtilizedAwardChart.draw(this.underUtilizedAward, this.underUtilizedAwardOptions);
    }
    this.isShowLoader = false;
  }

  onResize(event) {
    if (this.underUtilizedAwardChart) {
      this.underUtilizedAwardChart.draw(this.underUtilizedAward, this.underUtilizedAwardOptions);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
