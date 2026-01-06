import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';

import { GoogleChartService } from '../google-chart.service';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';

declare var google: any;

@Component({
  selector: 'app-research-funding-bar-chart',
  templateUrl: './research-funding-bar-chart.component.html',
  styleUrls: ['./research-funding-bar-chart.component.css'],
  animations: [fadeDown]
})
export class ResearchFundingBarChartComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  researchFundingList: any = [];
  isShowLoader = false;
  researchFundingchartData: any = [];
  private researchFundingChart;
  private options;
  private data;
  widgetDescription: any;
  maxLengthOfUnitName: number;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService, private _commonService: CommonService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(15);
    this.getChartData();
    const chart = document.getElementById('bar-chart_research_funding');
    chart.style.maxWidth = (chart.offsetWidth - 15) + 'px';
  }

  getChartData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget({
      tabName: 'ANNUALIZED_RESEARCH_FUNDING',
      unitNumber: null
    }).subscribe((data: any) => {
      this.researchFundingList = data.widgetDatas;
      this.getMaxUnitNumberLength(this.researchFundingList);
      this.drawResearchFundingBarChart();
    }, err => { this.isShowLoader = false; }));
  }

  drawResearchFundingBarChart() {
    if (this.researchFundingList.length > 1) {
      super.googleChartFunction();
    } else {
      this.isShowLoader = false;
    }
  }
  /**
   * @param  {any=[]} list
   * saves the max length of unit name string for adjusting the widget width
   */
  getMaxUnitNumberLength(list: any = []) {
    this.maxLengthOfUnitName = Math.max.apply(Math, list.map(element => element[0].length ));
  }

  drawGraph() {
    this.researchFundingchartData = [];
    this.data = this.createcolumnChartTable();
    this.data.addColumn('string', 'Unit name');
    this.data.addColumn('number', [this.researchFundingList[0][2]]);
    this.data.addColumn('number', [this.researchFundingList[0][3]]);
    this.data.addColumn('number', [this.researchFundingList[0][4]]);
    for (let index = 1; index < this.researchFundingList.length; index++) {
      this.data.addRow([this.researchFundingList[index][0],
      parseFloat(this.researchFundingList[index][2]),
      parseFloat(this.researchFundingList[index][3]),
      parseFloat(this.researchFundingList[index][4])]);
    }
    this.numberFormatter(1);
    this.numberFormatter(2);
    this.numberFormatter(3);
    this.options = {
      bars: 'vertical',
      vAxis: {
        title: 'Amount ($M)', format: 'decimal', textStyle: { fontSize: 15 },
        titleTextStyle: { fontSize: 17, bold: true }
      },
      height: 450,
      width: this.data.getNumberOfRows() > 4 ? this.data.getNumberOfRows() * (this.maxLengthOfUnitName + 100) : null,
      chartArea: { left: 100, top: 50, bottom: 70, width: '100%', height: '100%' },
      bar: { groupWidth: 95 },
      colors: ['#A4C2F4', '#396EC7', '#00348C'],
      legend: {
        position: 'top', alignment: 'left',
        textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' }
      },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'vertical',
        keepInBounds: true,
        maxZoomIn: 500.0,
      },
      hAxis: { slantedText: false, textStyle: { fontSize: 13 } },
      tooltip: { isHtml: false, textStyle: { fontSize: 13 }  }
    };
    this.researchFundingChart = this.createBarChart(document.getElementById('bar-chart_research_funding'));
    if (this.researchFundingChart) {
      this.researchFundingChart.draw(this.data, new google.charts.Bar.convertOptions(this.options));
    }
    this.isShowLoader = false;
  }
  /**
   * @param  {number} index
   * function sets the currency format for columns
   */
  numberFormatter(index: number): void {
    const formatter = new google.visualization.NumberFormat({prefix: this._commonService.currencyFormat,
      suffix: 'M', fractionDigits: 3});
    formatter.format(this.data, index);
  }

  onResize(event) {
    if (this.researchFundingChart) {
      this.researchFundingChart.draw(this.data, this.options);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
