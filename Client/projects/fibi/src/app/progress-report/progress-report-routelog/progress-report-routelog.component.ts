import { ProgressReportService } from './../services/progress-report.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
declare var $: any;

@Component({
    selector: 'app-progress-report-routelog',
    template: `<workflow-engine *ngIf="_commonData.progressReportSectionConfig['1609'].isActive"
                                [workFlowResult]="result" (workFlowResponse)='workFlowResponse($event)' (errorEvent)='errorEvent()'
                                [workFlowDetailKey]="'awardProgressReport'"></workflow-engine>`
})

export class ProgressReportRoutelogComponent implements OnInit, OnDestroy {

    result: any;
    progressReportId: any;
    $subscriptions: Subscription[] = [];

    constructor(private _activatedRoute: ActivatedRoute, public _commonData: CommonDataService,
        private _progressService: ProgressReportService) { }

    ngOnInit() {
        this.progressReportId = this._activatedRoute.snapshot.queryParamMap.get('progressReportId');
        this.getProgressReportData();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getProgressReportData() {
        this.$subscriptions.push(this._commonData.getProgressReportData().subscribe((data: any) => {
            this.result = data;
        }));
    }

    workFlowResponse(data) {
        this.updateProgressReportData(data);
        this._commonData.setProgressReportData(this.result);
    }

    updateProgressReportData(data) {
        this.result.workflow = data.workflow;
        this.result.workflowList = data.workflowList;
        this.result.canApproveRouting = data.canApproveRouting;
        this.result.awardProgressReport = data.awardProgressReport;
    }

    errorEvent() {
        $('#invalidActionModal').modal('show');
    }
}
