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
  selector: 'app-inprogress-proposals-donut-chart',
  templateUrl: './inprogress-proposals-donut-chart.component.html',
  styleUrls: ['./inprogress-proposals-donut-chart.component.css'],
  animations: [fadeDown]
})
export class InprogressProposalsDonutChartComponent extends GoogleChartService implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  inProgressProposalChartData = [];
  private proposalOptions = {};
  private proposalStateList = [];
  private sponsorList = [];
  private proposalData;
  private proposalChart;
  deptUnitNumber = null;
  isShowLoader = false;
  widgetDescription: any;
  unitName = '';
  descentFlag = null;

  constructor(private router: Router,
    private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService) {
    super();
  }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(7);
    this.getSelectedUnit();
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe((data: any) => {
      if (data) {
        this.deptUnitNumber =  data.unitNumber;
        this.unitName = data.unitName;
        this.descentFlag = data.descentFlag;
      } else {
        this.deptUnitNumber = '';
        this.unitName = '';
      }
      this.getInprogressProposalChart(this.deptUnitNumber);
    }));
  }

  getInprogressProposalChart(unitNumber) {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: unitNumber, tabName: 'INPROGRESS_PROPOSALS_BY_SPONSOR', descentFlag: this.descentFlag })
      .subscribe((data: any) => {
        this.inProgressProposalChartData = data.widgetDatas || [];
        this.drawInProgressProposalDonutChart();
      }, err => { this.isShowLoader = false; }));
  }

  drawInProgressProposalDonutChart() {
    const element = document.getElementById('inprogress_proposal_donut_chart');
    if (this.inProgressProposalChartData.length) {
      if (element && element.classList.contains('d-none')) { element.classList.remove('d-none'); }
      this.proposalStateList = [];
      this.proposalStateList.push(['Sponsor', 'ProposalCount']);
      for (let index = 0; index < this.inProgressProposalChartData.length; index++) {
        this.sponsorList.push([this.inProgressProposalChartData[index][0], this.inProgressProposalChartData[index][1]]);
        this.proposalStateList.push([this.inProgressProposalChartData[index][1], this.inProgressProposalChartData[index][2]]);
      }
      super.googleChartFunction();
    } else {
      element.classList.add('d-none');
      this.isShowLoader = false;
    }
  }

  drawGraph() {
    this.proposalData = google.visualization.arrayToDataTable(this.proposalStateList);
    this.proposalOptions = {
      pieHole: 0.2,
      pieStartAngle: 90,
      chartArea: { width: '120%', height: '120%' },
      legend: {
        position: 'right', alignment: 'center',
        textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' }
      },
      sliceVisibilityThreshold: 0
    };
    this.proposalChart = this.createPiChart(document.getElementById('inprogress_proposal_donut_chart'));
    if (this.proposalChart) {
      this.proposalChart.draw(this.proposalData, this.proposalOptions);
      google.visualization.events.addListener(this.proposalChart, 'select', (event) => {
        let sponsorType = '';
        if (this.proposalChart.getSelection()[0].row !== null && this.proposalChart.getSelection()[0].row !== undefined) {
          sponsorType = this.proposalData.getFormattedValue(this.proposalChart.getSelection()[0].row, 0);
          sessionStorage.removeItem('proposalBySponsorOther');
          if (sponsorType.toLowerCase() === 'others') {
            const sponsorCodes: any = [];
            this.sponsorList.forEach(element => {
              if (element[1].toLowerCase() !== 'others') {
                sponsorCodes.push(`'` + element[0] + `'`);
              }
            });
            sessionStorage.setItem('proposalBySponsorOther', sponsorCodes.toString());
          }
          for (let index = 0; index < this.sponsorList.length; index++) {
            if (sponsorType === this.sponsorList[index][1]) {
              this.router.navigate(['/fibi/expanded-widgets/inprogress-proposal-by-sponsor'],
                {
                  queryParams: {
                    sponsorCode: this.sponsorList[index][0],
                    donutProposalHeading: 'Proposals by Sponsor: ' + this.sponsorList[index][1],
                    UN: this.deptUnitNumber,
                    DF: this.descentFlag
                  }
                });
            }
          }
        }
      });
      google.visualization.events.addListener(this.proposalChart, 'onmouseover', (event) => {
        document.getElementById('inprogress_proposal_donut_chart').style.cursor = 'pointer';
      });
      google.visualization.events.addListener(this.proposalChart, 'onmouseout', (event) => {
        document.getElementById('inprogress_proposal_donut_chart').style.cursor = '';
      });
    }
    this.isShowLoader = false;
  }

  onResize(event) {
    if (this.inProgressProposalChartData.length && this.proposalChart) {
      this.proposalChart.draw(this.proposalData, this.proposalOptions);
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
