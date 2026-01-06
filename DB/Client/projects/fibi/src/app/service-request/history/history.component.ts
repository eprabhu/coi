import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { ServiceRequest } from '../service-request.interface';
import { CommonDataService } from '../services/common-data.service';
import { HistoryService } from './history.service';
import { isEmptyObject } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequestHistory: any = [];
    serviceRequest: ServiceRequest = new ServiceRequest();
    isEmptyObject = isEmptyObject;

    constructor(
        private _commonData: CommonDataService,
        private _history: HistoryService,
        public _dataFormatPipe: DateFormatPipeWithTimeZone
    ) { }

    ngOnInit() {
        this.getServiceRequestDetails();
        this.getGeneralDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest')) {
                    this.getGeneralDetails();
                }
            })
        );
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['serviceRequest']);
        this.serviceRequest = data.serviceRequest;
        this.fetchHistory();
    }

    private fetchHistory(): void {
        this.$subscriptions.push(
            this._history.loadServiceRequestHistory(this.serviceRequest.serviceRequestId)
                .subscribe((data: any) => {
                    this.updateHistoryLogs(data);
                })
        );
    }

    /**
    * @param  {} data : history log array
    * converts the key value pair to array of objects
    */
    private updateHistoryLogs(data: any): void {
        if (data) {
            this.serviceRequestHistory = [];
            data.forEach((historyObj) => {
                const date = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.serviceRequestHistory[date] = this.serviceRequestHistory[date] ? this.serviceRequestHistory[date] : [];
                this.setServiceRequestChange(this.serviceRequestHistory[date], historyObj);
            });
        }
    }

    private setServiceRequestChange(historyElement, history): void {
        if (history.serviceRequestHistory) {
            history.historyChangeList = this.setChangeData(history.serviceRequestHistory);
        }
        historyElement.push(history);
    }

    private setChangeData(history) {
        const historyChangeList = [];
        if (history.adminGroupName || history.previousAdminGroupName) {
            this.getChangedFields(historyChangeList, history, 'adminGroupName', 'previousAdminGroupName', 'Admin Group');
        }
        if (history.assigneePersonName || history.previousAssigneePersonName) {
            this.getChangedFields(historyChangeList, history, 'assigneePersonName', 'previousAssigneePersonName', 'Assignee');
        }
        if (history.description || history.previousDescription) {
            this.getChangedFields(historyChangeList, history, 'description', 'previousDescription', 'Description');
        }
        if ((history.moduleCodeDescription || history.previousModuleCodeDescription) &&
            history.moduleCodeDescription !== history.previousModuleCodeDescription) {
            this.getChangedFields(historyChangeList, history, 'moduleCodeDescription', 'previousModuleCodeDescription', 'Category');
        }
        if (history.srType || history.previousSrType) {
            this.getChangedFields(historyChangeList, history, 'srType', 'previousSrType', 'Type');
        }
        if (history.moduleItemKey || history.previousModuleItemKey) {
            this.getChangedFields(historyChangeList, history,
                'moduleItemKey+title', 'previousModuleItemKey+previousTitle', 'Linked Module');
        }
        if (history.sRPriority || history.previousSrPriority) {
            this.getChangedFields(historyChangeList, history, 'sRPriority', 'previousSrPriority', 'Priority');
        }
        if (history.subject || history.previousSubject) {
            this.getChangedFields(historyChangeList, history, 'subject', 'previousSubject', 'Subject');
        }
        if (history.unitName || history.previousUnitName) {
            this.getChangedFields(historyChangeList, history, 'unitName', 'previousUnitName', 'Unit');
        }
        return historyChangeList;
    }

    private getChangedFields(historyChangeList, history, value: string, previousValue: string, columnName: string): void {
        historyChangeList.push({
            affectedColumn: columnName,
            value: this.getValueString(value, history),
            previousValue: this.getValueString(previousValue, history)
        });
    }

    getValueString(value: string, history): string {
        if (!value.includes('+')) {
            return history[value];
        }
        const splittedKeys = value.split('+');
        let returnValue = '';
        splittedKeys.forEach((element, index) => {
            if (history[element] && (element.toLowerCase().includes('key') || element.toLowerCase().includes('id'))) {
                returnValue = returnValue.concat('#');
            }
            returnValue = history[element] ? returnValue.concat(history[element]) : returnValue;
            if (returnValue && index < splittedKeys.length - 1) {
                returnValue = returnValue.concat(': ');
            }
        });
        return returnValue;
    }

    sortNull() { return 0; }

}
