import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import { DataStoreEvent } from '../../../../common/services/coi-common.interface';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import { CmpHeader, ManagementPlanStoreData } from '../../../shared/management-plan.interface';
import { ManagementPlanReviewsService } from './management-plan-reviews.service';
import { DateFormatPipeWithTimeZone } from '../../../../shared/pipes/custom-date.pipe';
import { SharedDocumentReviewsHistoryComponent } from '../../../../shared-components/shared-document-reviews-history/shared-document-reviews-history.component';
import { ManagementPlanReviewsLocationComponent } from './management-plan-reviews-location/management-plan-reviews-location.component';

@Component({
    selector: 'app-management-plan-reviews',
    templateUrl: './management-plan-reviews.component.html',
    styleUrls: ['./management-plan-reviews.component.scss'],
    standalone: true,
    providers: [ManagementPlanReviewsService],
    imports: [CommonModule, SharedDocumentReviewsHistoryComponent, ManagementPlanReviewsLocationComponent]
})
export class ManagementPlanReviewsComponent implements OnInit {

    historyLogs = {};
    planDetails = new CmpHeader();
    private $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService,
        private _dataFormatPipe: DateFormatPipeWithTimeZone,
        public managementPlanReviewsService: ManagementPlanReviewsService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) {}

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getReviewHistory(): void {
        this.$subscriptions.push(
            this.managementPlanReviewsService.reviewHistory(this.planDetails.cmpId)
                .subscribe({
                    next: (data: any) => {
                        this.updateHistoryLogs(data);
                    },
                    error: () => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
                    }
                }));
    }

    updateHistoryLogs(data: any): void {
        if (data.length) {
            this.historyLogs = {};
            data.forEach((historyObj) => {
                const FORMATTED_DATE = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.historyLogs[FORMATTED_DATE] = this.historyLogs[FORMATTED_DATE] ? this.historyLogs[FORMATTED_DATE] : [];
                this.historyLogs[FORMATTED_DATE].push(historyObj);
            });
        }
    }

    private getDataFromStore(): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        this.planDetails = MANAGEMENT_PLAN.plan;
        this.getReviewHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

}
