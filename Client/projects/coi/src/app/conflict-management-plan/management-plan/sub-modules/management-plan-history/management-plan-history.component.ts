import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import { DataStoreEvent, DisclosureHistory } from '../../../../common/services/coi-common.interface';
import { CommonService } from '../../../../common/services/common.service';
import { isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';;
import { DateFormatPipeWithTimeZone } from '../../../../shared/pipes/custom-date.pipe';
import { Subscription } from 'rxjs';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import { ManagementPlanService } from '../../services/management-plan.service';
import { SharedHistoryTimelineComponent } from '../../../../shared-components/shared-history-timeline/shared-history-timeline.component';
import { CmpHeader } from '../../../shared/management-plan.interface';

@Component({
    selector: 'app-management-plan-history',
    templateUrl: './management-plan-history.component.html',
    styleUrls: ['./management-plan-history.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedHistoryTimelineComponent,
    ]
})
export class ManagementPlanHistoryComponent implements OnInit {

    $subscriptions: Subscription[] = [];
    cmpDetails = new CmpHeader();
    historyLogs: any = {};

    constructor(private _commonService: CommonService,
        private _dataFormatPipe: DateFormatPipeWithTimeZone,
        private _managementPlanService: ManagementPlanService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) {}

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const MANAGEMENT_PLAN = this._managementPlanDataStore.getData();
        this.cmpDetails = MANAGEMENT_PLAN?.plan;
        this.getDisclosureHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDisclosureHistory(): void {
        this.$subscriptions.push(
            this._managementPlanService.getManagementPlanHistory(this.cmpDetails?.cmpId)
                .subscribe((data: DisclosureHistory[]) => {
                    this.updateFormattedHistoryLogs(data);
                }, _err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching declaration history.');
                }));
    }

    /**
     * Formats and groups the disclosure history logs.
     *
     * - If the action type is '34', it updates the date inside the message using the date format pipe.
     * - Groups the logs by the update date.
     * - Saves the grouped logs in the `historyLogs` object.
     *
     * @param data List of disclosure history items to update.
     */
    private updateFormattedHistoryLogs(data: DisclosureHistory[]): void {
        this.historyLogs = {};
        data?.forEach(entry => {
            const GROUP_KEY = this._dataFormatPipe.transform(entry?.updateTimestamp);
            if (!this.historyLogs[GROUP_KEY]) {
                this.historyLogs[GROUP_KEY] = [];
            }
            this.historyLogs[GROUP_KEY].push(entry);
        });
    }

}

