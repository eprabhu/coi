import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
    selector: 'app-pending-ips-by-sponsor-type',
    templateUrl: './pending-ips-by-sponsor-type.component.html',
    styleUrls: ['./pending-ips-by-sponsor-type.component.css'],
    animations: [fadeDown]
})
export class PendingIpsBySponsorTypeComponent implements OnInit {

    summaryData: any = {};
    isShowLoader = false;
    widgetDescription: any;
    unitNumber = '';
    $subscriptions: Subscription[] = [];
    unitName = '';
    descentFlag = null;

    constructor(public _commonService: CommonService, private _router: Router,
        private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
        private _researchSummaryConfigService: ResearchSummaryConfigService) {
    }

    ngOnInit() {
        this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(36);
        this.getSelectedUnit();
    }

    private getSelectedUnit(): void {
        this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
            if (data) {
                this.unitNumber = data.unitNumber;
                this.unitName = data.unitName;
                this.descentFlag = data.descentFlag;
            } else {
                this.unitNumber = '';
                this.unitName = '';
            }
            this.getResearchSummaryTable();
        }));
    }

    private getResearchSummaryTable(): void {
        this.isShowLoader = true;
        const REQUEST_DATA = {
            unitNumber: this.unitNumber,
            tabName: 'PENDING_INSTITUTE_PROPOSAL_BY_SPONSOR_TYPE',
            descentFlag: this.descentFlag
        };
        this.$subscriptions.push(this._researchSummaryWidgetService
            .getResearchSummaryDatasByWidget(REQUEST_DATA)
            .subscribe((data: any) => {
                this.summaryData = data.widgetDatas || [];
                this.isShowLoader = false;
            }, err => {
                this.isShowLoader = false;
            }));
    }

    getDetailedResearchSummary(summaryLabel: any[]) {
        this._router.navigate(['/fibi/expanded-widgets/ip-by-sponsored'],
            {
                queryParams: {
                    sponsorCode: summaryLabel[0],
                    tabName: 'PENDING_INSTITUTE_PROPOSAL_BY_SPONSOR_TYPE',
                    proposalHeading: 'Pending Institute Proposals by Sponsor Type - ' + summaryLabel[1],
                    UN: this.unitNumber,
                    DF: this.descentFlag
                }
            });
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
