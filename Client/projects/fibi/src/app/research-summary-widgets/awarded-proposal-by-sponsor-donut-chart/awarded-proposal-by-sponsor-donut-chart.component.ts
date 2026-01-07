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
    selector: 'app-awarded-proposal-by-sponsor-donut-chart',
    templateUrl: './awarded-proposal-by-sponsor-donut-chart.component.html',
    styleUrls: ['./awarded-proposal-by-sponsor-donut-chart.component.css'],
    animations: [fadeDown]
})
export class AwardedProposalBySponsorDonutChartComponent extends GoogleChartService implements OnInit, OnDestroy {

    summaryAwardDonutChartData: any = [];
    private awardOptions = {};
    private awardList = [];
    private awardStateList = [];
    private sponsorList = [];
    private awardChart;
    private awardData;
    isShowLoader = false;
    $subscriptions: Subscription[] = [];
    department: any;
    widgetDescription: any;
    unitName = '';
    descentFlag = null;

    constructor(private router: Router, private _researchsummaryService: ResearchSummaryWidgetsService,
        private _researchSummaryConfigService: ResearchSummaryConfigService) {
        super();
    }

    ngOnInit() {
        this.widgetDescription = this._researchsummaryService.getWidgetDescription(5);
        this.getSelectedUnit();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /**
     * subscribes unit list data from the dashboard component will use load dashboard service
     * to fetch data with updated unit value subscription output emits the unit value
     */
    getSelectedUnit() {
        this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
            if (data) {
                this.department =  data.unitNumber;
                this.unitName = data.unitName;
                this.descentFlag = data.descentFlag;
            } else {
                this.department = '';
                this.unitName = '';
            }
            this.getSummaryAwardedProposalDonutChart();
        }));
    }

    getSummaryAwardedProposalDonutChart() {
        this.isShowLoader = true;
        this.$subscriptions.push(this._researchsummaryService.
            getResearchSummaryDatasByWidget({ 'unitNumber': this.department, tabName: 'AWARDED_PROPOSALS_BY_SPONSOR',
             descentFlag: this.descentFlag
        })
            .subscribe((data: any) => {
                this.summaryAwardDonutChartData = data.widgetDatas;
                this.getDataForChart();
            }, err => { this.isShowLoader = false; }));
    }

    getDataForChart() {
        const element = document.getElementById('awarded-proposal-by-sponsor-donut-chart');
        if (this.summaryAwardDonutChartData.length) {
            if (element && element.classList.contains('d-none')) { element.classList.remove("d-none") }
            this.awardList = this.summaryAwardDonutChartData;
            this.awardStateList = [];
            this.awardStateList.push(['Sponsor', 'AwardedProposalCount']);
            // tslint:disable-next-line: no-shadowed-variable
            this.awardList.forEach(element => {
                this.sponsorList.push([element[0], element[1]]);
                this.awardStateList.push([element[1], element[2]]);
            });
            super.googleChartFunction();
        } else {
            element.classList.add('d-none');
            this.isShowLoader = false;
        }
    }

    drawGraph() {
        this.awardData = google.visualization.arrayToDataTable(this.awardStateList);
        this.awardOptions = {
            legend: { position: 'right', alignment: 'center', textStyle: { color: '#424242', fontSize: 13, fontName: 'Roboto' } },
            pieHole: 0.2,
            chartArea: { width: '140%', height: '140%' },
            sliceVisibilityThreshold: 0
        };
        this.awardChart = this.createPiChart(document.getElementById('awarded-proposal-by-sponsor-donut-chart'));
        if (this.awardChart) {
            this.awardChart.draw(this.awardData, this.awardOptions);
            google.visualization.events.addListener(this.awardChart, 'select', (event) => {
                let sponsorType = '';
                if (this.awardChart.getSelection()[0].row !== null && this.awardChart.getSelection()[0].row !== undefined) {
                    sponsorType = this.awardData.getFormattedValue(this.awardChart.getSelection()[0].row, 0);
                    for (let index = 0; index < this.sponsorList.length; index++) {
                        if (sponsorType === this.sponsorList[index][1]) {
                            this.router.navigate(['/fibi/expanded-widgets/ip-by-sponsor'],
                                {
                                    queryParams: {
                                        sponsorCode: this.sponsorList[index][0],
                                        donutAwardHeading: 'Awarded Proposals by ' + sponsorType,
                                        UN: this.department,
                                        DF: this.descentFlag
                                    }
                                });
                            break;
                        }
                    }
                }
            });
            google.visualization.events.addListener(this.awardChart, 'onmouseover', (event) => {
                document.getElementById('awarded-proposal-by-sponsor-donut-chart').style.cursor = 'pointer';
            });
            google.visualization.events.addListener(this.awardChart, 'onmouseout', (event) => {
                document.getElementById('awarded-proposal-by-sponsor-donut-chart').style.cursor = '';
            });
        }
        this.isShowLoader = false;
    }

    onResize(event) {
        if (this.awardList != null && this.awardList !== undefined && this.awardChart) {
            this.awardChart.draw(this.awardData, this.awardOptions);
        }
    }
}
