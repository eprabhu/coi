import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { Router } from '@angular/router';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';

declare var google: any;

@Component({
    selector: 'app-award-by-sponsor-types',
    templateUrl: './award-by-sponsor-types.component.html',
    styleUrls: ['./award-by-sponsor-types.component.css'],
    animations: [fadeDown]
})
export class AwardBySponsorTypesComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    awardBySponsorData: any = [];
    isShowLoader = false;
    widgetDescription: any;
    unitNumber = null;
    unitName = '';
    descentFlag = null;

    constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
        private _researchSummaryConfigService: ResearchSummaryConfigService,
        private _router: Router) {
    }

    ngOnInit() {
        this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(29);
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
            this.getAwardBySponsorType();
        }));
    }

    getAwardBySponsorType() {
        this.isShowLoader = true;
        this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget({
            unitNumber: this.unitNumber,
            tabName: 'ACTIVE_AWARDS_BY_SPONSOR_TYPE',
            descentFlag: this.descentFlag
        })
            .subscribe((data: any) => {
                this.awardBySponsorData = data.widgetDatas || [];
                this.isShowLoader = false;
            }, err => {
                this.isShowLoader = false;
            }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getDetailedResearchSummary(sponsorCode: number, sponsorName: string) {
        this._router.navigate(['/fibi/expanded-widgets/award-by-sponsor'],
            {
                queryParams: {
                    sponsorCode, tabName: 'ACTIVE_AWARDS_BY_SPONSOR_TYPE',
                    expandedViewAwardHeading: 'Active Awards by ' + sponsorName,
                    UN: this.unitNumber,
                    DF: this.descentFlag
                }
            });
    }

}
