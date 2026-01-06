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
  selector: 'app-award-by-sponsor-types-piechart',
  templateUrl: './award-by-sponsor-types-piechart.component.html',
  styleUrls: ['./award-by-sponsor-types-piechart.component.css'],
  animations: [fadeDown]
})
export class AwardBySponsorTypesPiechartComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  awardBySponsorData: any = [];
  private awardOptions = {};
  private awardList = [];
  private awardStateList = [];
  private sponsorList = [];
  private awardChart;
  private awardData;
  isShowLoader = false;
  widgetDescription: any;
  unitNumber: any;
  unitName: any;
  descentFlag: any;
  currentFY = '';

  constructor(private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService, private _commonService: CommonService,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(6);
    this.getSelectedUnit();
    this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
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
      this.getAwardBySponsorChart();
    }));
  }

  getAwardBySponsorChart() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({descentFlag : this.descentFlag,
        unitNumber: this.unitNumber, tabName: 'AWARD_BY_SPONSOR_TYPE' })
      .subscribe((data: any) => {
        this.awardBySponsorData = data.widgetDatas || [];
        this.drawAwardBySponsorChart();
      }, err => { this.isShowLoader = false; }));
  }

  drawAwardBySponsorChart() {
    const element = document.getElementById('award_by_sponsor_types_pie_chart');
    if (this.awardBySponsorData.length > 0) {
      if (element && element.classList.contains('d-none')) { element.classList.remove('d-none'); }
      this.awardList = this.awardBySponsorData;
      this.awardStateList = [];
      this.awardStateList.push(['Sponsor', 'Anticipated Budget']);
      for (let index = 0; index < this.awardList.length; index++) {
        if (this.awardList[index][3] >= 0) {
          this.sponsorList.push([this.awardList[index][0], this.awardList[index][1]]);
          this.awardStateList.push([this.awardList[index][1], this.awardList[index][3]]);
        }
      }
      super.googleChartFunction();
    } else {
      element.classList.add('d-none');
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.awardData = google.visualization.arrayToDataTable(this.awardStateList);
    const formatter = new google.visualization.NumberFormat({prefix: this._commonService.currencyFormat,
      suffix: 'M', fractionDigits: 3});
    formatter.format(this.awardData, 1);
    this.awardOptions = {
      legend: { position: 'right', alignment: 'center', textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' } },
      is3D: true,
      chartArea: { width: '140%', height: '140%' },
      sliceVisibilityThreshold: 0
    };
    this.awardChart = this.createPiChart(document.getElementById('award_by_sponsor_types_pie_chart'));
    if (this.awardChart) {
      this.awardChart.draw(this.awardData, this.awardOptions);
      google.visualization.events.addListener(this.awardChart, 'select', (event) => {
        let sponsorType = '';
        if (this.awardChart.getSelection()[0].row !== null && this.awardChart.getSelection()[0].row !== undefined) {
          sponsorType = this.awardData.getFormattedValue(this.awardChart.getSelection()[0].row, 0);
          for (let index = 0; index < this.sponsorList.length; index++) {
            if (sponsorType === this.sponsorList[index][1]) {
              this.router.navigate(['/fibi/expanded-widgets/award-by-sponsor'],
                {
                  queryParams: {
                    sponsorCode: this.sponsorList[index][0],
                    expandedViewAwardHeading: 'Awards by ' + sponsorType,
                    UN: this.unitNumber,
                    DF: this.descentFlag
                  }
                });
            }
          }
        }
      });
      google.visualization.events.addListener(this.awardChart, 'onmouseover', (event) => {
        document.getElementById('award_by_sponsor_types_pie_chart').style.cursor = 'pointer';
      });
      google.visualization.events.addListener(this.awardChart, 'onmouseout', (event) => {
        document.getElementById('award_by_sponsor_types_pie_chart').style.cursor = '';
      });
    }
    this.isShowLoader = false;
  }

  onResize() {
    if (this.awardBySponsorData.length && this.awardChart) {
      this.awardChart.draw(this.awardData, this.awardOptions);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
