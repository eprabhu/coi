import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProgressReportDetailsService} from './progress-report-details.service';
import {ActivatedRoute} from '@angular/router';
import {subscriptionHandler} from '../../../common/utilities/subscription-handler';
import {CommonDataService} from '../../services/common-data.service';

@Component({
    selector: 'app-progress-report-details',
    templateUrl: './progress-report-details.component.html',
    styleUrls: ['./progress-report-details.component.css']
})
export class ProgressReportDetailsComponent implements OnInit, OnDestroy {
    progressReportId = null;
    awardProgressReportKPISummary = [];
    kpiLookups = [];
    lookupData = [];
    isEditMode = false;
    isAllFormsExpanded = true;
    $subscriptions = [];
    awardDetails = {};

    constructor(private _commonData: CommonDataService,
                private _progressReportDetailsService: ProgressReportDetailsService,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this.progressReportId = this._route.snapshot.queryParams['progressReportId'];
        this.fetchSummaryKpiDetails();
        this.fetchKpiLookups();
        this.checkForEditMode();
    }

    checkForEditMode() {
        this.$subscriptions.push(this._commonData.getEditMode().subscribe((data: any) => {
            this.isEditMode = data;
        }));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    fetchSummaryKpiDetails() {
        this.$subscriptions.push(this._commonData.getProgressReportData().subscribe((data: any) => {
            this.awardProgressReportKPISummary = data.awardProgressReport.awardProgressReportKPISummarys;
            this.awardDetails = data.awardProgressReport.award;
        }));
    }

    fetchKpiLookups() {
        this.$subscriptions.push(this._progressReportDetailsService.loadProgressReportKPILookups().subscribe((res: any) => {
            this.kpiLookups = res;
        }));
    }

    toggleAllFormsExpand() {
        this.isAllFormsExpanded = !this.isAllFormsExpanded;
    }

}
