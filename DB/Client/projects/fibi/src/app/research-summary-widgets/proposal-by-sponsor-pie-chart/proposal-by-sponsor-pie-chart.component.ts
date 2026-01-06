import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GoogleChartService } from '../google-chart.service';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

declare var google: any;

@Component({
  selector: 'app-proposal-by-sponsor-pie-chart',
  templateUrl: './proposal-by-sponsor-pie-chart.component.html',
  styleUrls: ['./proposal-by-sponsor-pie-chart.component.css'],
  animations: [fadeDown]
})
export class ProposalBySponsorPieChartComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  summaryProposalPieChartData = [];
  private proposalOptions = {};
  private proposalStateList = [];
  private sponsorList = [];
  private proposalData;
  private proposalChart;
  isShowLoader = false;
  widgetDescription: any;
  unitNumber: String = '';
  unitName = '';
  descentFlag = null;

  constructor(private router: Router,
    private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(8);
    this.getSelectedUnit();
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe((data: any) => {
      if (data) {
        this.unitNumber =  data.unitNumber;
        this.unitName = data.unitName;
        this.descentFlag = data.descentFlag;
      } else {
        this.unitNumber = '';
        this.unitName = '';
      }
      this.getSummaryProposalPieChart( this.unitNumber);
    }));
  }

  getSummaryProposalPieChart(unitNumber) {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: unitNumber, tabName: 'PROPOSAL_BY_SPONSOR_TYPE', descentFlag: this.descentFlag })
      .subscribe((data: any) => {
        this.summaryProposalPieChartData = data.widgetDatas || [];
        this.drawSummaryProposalPieChart();
      }, err => { this.isShowLoader = false; }));
  }

  drawSummaryProposalPieChart() {
    const element = document.getElementById('pie-chart_proposal_by_sponsor_type');
    if (this.summaryProposalPieChartData.length) {
      if (element && element.classList.contains('d-none')) { element.classList.remove("d-none") }
      this.proposalStateList = [];
      this.proposalStateList.push(['Sponsor', 'ProposalCount']);
      for (let index = 0; index < this.summaryProposalPieChartData.length; index++) {
        this.sponsorList.push([this.summaryProposalPieChartData[index][0], this.summaryProposalPieChartData[index][1]]);
        this.proposalStateList.push([this.summaryProposalPieChartData[index][1], this.summaryProposalPieChartData[index][2]]);
      }
      super.googleChartFunction();
    } else {
      element.classList.add("d-none");
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.proposalData = google.visualization.arrayToDataTable(this.proposalStateList);
    this.proposalOptions = {
      is3D: true,
      legend: {
        position: 'right', alignment: 'center',
        textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' }
      },
      chartArea: { width: '140%', height: '140%' },
      sliceVisibilityThreshold: 0
    };
    this.proposalChart = this.createPiChart(document.getElementById('pie-chart_proposal_by_sponsor_type'));
    if (this.proposalChart) {
      this.proposalChart.draw(this.proposalData, this.proposalOptions);
      google.visualization.events.addListener(this.proposalChart, 'select', (event) => {
        let sponsorType = '';
        if (this.proposalChart.getSelection()[0].row !== null || this.proposalChart.getSelection()[0].row !== undefined) {
          sponsorType = this.proposalData.getFormattedValue(this.proposalChart.getSelection()[0].row, 0);
          for (let index = 0; index < this.sponsorList.length; index++) {
            if (sponsorType === this.sponsorList[index][1]) {
              localStorage.setItem('sponsorCode', this.sponsorList[index][0]);
              this.router.navigate(['/fibi/expanded-widgets/proposal-by-sponsor'],
                {
                  queryParams: {
                    sponsorCode: this.sponsorList[index][0],
                    proposalHeading: 'Proposals by Sponsor Types: ' + sponsorType,
                    UN: this.unitNumber,
                    DF: this.descentFlag
                  }
                });
            }
          }
        }
      });
      google.visualization.events.addListener(this.proposalChart, 'onmouseover', (event) => {
        document.getElementById('pie-chart_proposal_by_sponsor_type').style.cursor = 'pointer';
      });
      google.visualization.events.addListener(this.proposalChart, 'onmouseout', (event) => {
        document.getElementById('pie-chart_proposal_by_sponsor_type').style.cursor = '';
      });
    }
    this.isShowLoader = false;
  }

  onResize(event) {
    if (this.summaryProposalPieChartData.length && this.proposalChart) {
      this.proposalChart.draw(this.proposalData, this.proposalOptions);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
