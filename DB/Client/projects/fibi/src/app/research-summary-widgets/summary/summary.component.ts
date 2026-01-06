import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { fadeDown } from '../../common/utilities/animations';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
    animations: [fadeDown]
})
export class SummaryComponent implements OnInit {
    summaryViewsData: any = [];
    $subscriptions: Subscription[] = [];
    isAgreementAdministrator = false;
    isShowLoader = false;

    constructor(
        private _dashboardService: DashboardService,
        private _commonService: CommonService,
        private _router: Router,
        private _researchSummaryService: ResearchSummaryWidgetsService
    ) {}

    ngOnInit() {
        this.getPermissions();
    }

    async getPermissions() {
        this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
        this.getAgreementSummary();
    }

    getDetailedResearchSummary(summaryView, tabName) {
        this._router.navigate(['fibi/expanded-widgets/expanded-view'], {
            queryParams: {
                categoryCode: summaryView[0],
                summaryHeading: summaryView[1],
                tabName: tabName,
            },
        });
    }

    getAgreementSummary() {
        this.isShowLoader = true;
        this.$subscriptions.push(
            this._researchSummaryService.getAgreementSummary(this.isAgreementAdministrator).subscribe((data: any) => {
                this.summaryViewsData = data.agreementView || [];
                this.isShowLoader = false;
            },
            (err)=> {this.isShowLoader = false;})
        );
    }
}
