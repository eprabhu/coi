import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fadeDown } from '../../common/utilities/animations';

@Component({
    selector: 'app-pending-proposal-by-sponsor-type',
    templateUrl: './pending-proposal-by-sponsor-type.component.html',
    styleUrls: ['./pending-proposal-by-sponsor-type.component.css'],
    animations: [fadeDown]
})
export class PendingProposalBySponsorTypeComponent implements OnInit, OnDestroy {

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
        this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(30);
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
            this.getResearchSummaryTable();
        }));
    }

    getResearchSummaryTable() {
        this.isShowLoader = true;
        const REQUEST_DATA = {
            unitNumber: this.unitNumber,
            tabName: 'PENDING_PROPOSAL_BY_SPONSOR_TYPE',
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
        this._router.navigate(['/fibi/expanded-widgets/proposal-by-sponsor'],
            {queryParams: {
                sponsorCode: summaryLabel[0],
                tabName: 'PENDING_PROPOSAL_BY_SPONSOR_TYPE',
                proposalHeading: 'Pending Proposals by ' + summaryLabel[1],
                UN: this.unitNumber,
                DF: this.descentFlag
            }});
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
