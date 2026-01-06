import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GoogleChartService } from '../google-chart.service';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';


@Component({
  selector: 'app-expenditure-volume-chart',
  templateUrl: './expenditure-volume-chart.component.html',
  styleUrls: ['./expenditure-volume-chart.component.css'],
  animations: [fadeDown]
})
export class ExpenditureVolumeChartComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  expenditureVolumeData: any = [];
  private areaChartList = [];
  private options;
  private data;
  private chart;
  isShowLoader = false;
  widgetDescription: any;
  unitNumber = '';
  unitName = '';
  descentFlag = null;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    private _researchSummaryConfigService: ResearchSummaryConfigService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(3);
    this.getSelectedUnit();
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
      if (data) {
        this.unitNumber =  data.unitNumber;
        this.unitName = data.unitName;
        this.descentFlag = data.descentFlag;
      } else {
        this.unitNumber = '';
        this.unitName = '';
      }
      this.getExpenditureVolumeChart();
    }));
  }

  getExpenditureVolumeChart() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({
        descentFlag: this.descentFlag,
        unitNumber: this.unitNumber,
        tabName: 'PROPOSAL_EXPENDITURE_VOLUME'
       })
      .subscribe((data: any) => {
        this.expenditureVolumeData = data.widgetDatas || [];
        this.drawExpenditureVolumeChart();
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  drawExpenditureVolumeChart() {
    if (this.expenditureVolumeData.length > 0) {
      document.getElementById('expenditure_volume_chart_divEvolution').classList.remove('d-none');
      if (this.expenditureVolumeData !== null && this.expenditureVolumeData !== undefined) {
        this.areaChartList = [];
        this.areaChartList.push(['Year', 'Direct', 'FA']);
        for (let i = 0; i < this.expenditureVolumeData.length; i++) {
          this.areaChartList.push([this.expenditureVolumeData[i][0],
          this.expenditureVolumeData[i][1] || 0,
          this.expenditureVolumeData[i][2] || 0]);
        }
        this.googleChartFunction();
      }
    } else {
      document.getElementById('expenditure_volume_chart_divEvolution').classList.add('d-none');
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.data = this.createDataTable(this.areaChartList);
    this.options = {
      hAxis: {
        title: 'Year',
        minValue: 0,
        textStyle: { color: '#424242', fontName: 'Roboto' },
        titleTextStyle: { color: '#424242' },
        slantedText: true,
        textPosition: 'out'
      },
      chartArea: {
        height: 110,
      },
      legend: {
        position: 'top', alignment: 'end',
        textStyle: { color: '#424242', fontName: 'Roboto' }
      },
      colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
      animation: {
        startup: true,
        duration: 1000,
        easing: 'linear'
      },
      vAxis: {
        title: 'Cost Amount',
        textStyle: { color: '#424242', fontName: 'Roboto' },
        titleTextStyle: { color: '#424242', fontName: 'Roboto' }
      }
    };
    this.chart = this.createAreaChart(document.getElementById('expenditure_volume_chart_divEvolution'));
    if (this.chart) {
      this.chart.draw(this.data, this.options);
    }
  }

  onResize(event) {
    if (this.chart) {
      this.chart.draw(this.data, this.options);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
