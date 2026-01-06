// Last updated by Ayush Mahadev on 20/05/2021
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getMonthInCorrectFormat } from './../../../common/utilities/date-utilities';
import { CommonDataService } from '../../services/common-data.service';
import { ProgressReportService } from '../../services/progress-report.service';
import { subscriptionHandler } from './../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-progress-report-summary',
    templateUrl: './progress-report-summary.component.html',
    styleUrls: ['./progress-report-summary.component.css']
})
export class ProgressReportSummaryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    progressReportId: any = {};
    kpiSummary: any = [];
    progressReportNumbers: any = [];
    months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    column = '';
    isDesc: any;
    direction: number = -1;


    constructor(public _commonData: CommonDataService,
                private _progressReportService: ProgressReportService,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this.getKPISummary(this.getProgressReportId());
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getProgressReportId() {
        return this._route.snapshot.queryParamMap.get('progressReportId');
    }

    /**
     * @param progressReportId
     * kpiSummary is list of all the KPIs.
     * progressReportNumbers is list of all Progress Report, Its used to show columns of table heading- Achieved , year wise.
     */
    getKPISummary(progressReportId) {
        this.$subscriptions.push(this._progressReportService.loadProgressReportKPISummary(progressReportId).subscribe((response: any) => {
            this.kpiSummary = response.awardProgressReportKPISummary;
            this.progressReportNumbers = response.summaryHistoryData;
        }));
    }

    getMonth(dueDate) {
        return getMonthInCorrectFormat(new Date(dueDate).getMonth(), 'mmm');
    }

    getYear(dueDate) {
        return new Date(dueDate).getFullYear();
    }

    Number(s: string): number {
        return Number(s);
    }

    sortBy(property) {
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }
}
