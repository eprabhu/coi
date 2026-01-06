import {Component, OnDestroy, OnInit} from '@angular/core';
import { SummaryReportViewService } from './summary-report-view.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { openInNewTab } from '../../../common/utilities/custom-utilities';
import { CommonDataService } from '../../services/common-data.service';

@Component({
    selector: 'app-summary-report-view',
    templateUrl: './summary-report-view.component.html',
    styleUrls: ['./summary-report-view.component.css'],
    providers: [SummaryReportViewService]
})
export class SummaryReportViewComponent implements OnInit, OnDestroy {

    summaryList: any[] = [];
    sort: any = {
        sortColumn: '',
        sortOrder: -1
    };
    isDesc = false;
    $subscriptions: Subscription[] = [];

    constructor(private _reportSummaryService: SummaryReportViewService,
                private _commonData: CommonDataService) {
    }

    ngOnInit() {
        this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
            if (data.award.awardNumber) {
                this.getProgressReportSummary(data.award.awardNumber);
            }
        }));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getProgressReportSummary(awardNumber: string): void {
        this.$subscriptions.push(this._reportSummaryService.loadProgressReportForAward(awardNumber).subscribe((res: any) => {
            if (res && res.progressReports) {
                this.summaryList = res.progressReports;
            }
        }));
    }

    navigateToReport(progressReportId: any): void {
        openInNewTab('progress-report/overview?', ['progressReportId'], [progressReportId]);
    }

    sortBy(columnName: string): void {
        this.isDesc = !this.isDesc;
        this.sort.sortColumn = columnName;
        this.sort.sortOrder = this.isDesc ? 1 : -1;
    }

}
