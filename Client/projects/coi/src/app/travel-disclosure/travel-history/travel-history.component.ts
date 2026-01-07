import { Component, OnDestroy, OnInit } from '@angular/core';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { TravelDataStoreService } from '../services/travel-data-store.service';
import { TravelDisclosureService } from '../services/travel-disclosure.service';
import { TravelDisclosure } from '../travel-disclosure.interface';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { isEmptyObject } from '../../../../../fibi/src/app/common/utilities/custom-utilities';

@Component({
    selector: 'app-travel-history',
    templateUrl: './travel-history.component.html',
    styleUrls: ['./travel-history.component.scss'],
    animations: [fadeInOutHeight]
})
export class TravelHistoryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    travelDisclosure: TravelDisclosure = new TravelDisclosure();
    disclosureHistoryLogs: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];

    constructor( public travel_service: TravelDisclosureService,
                 private _commonService: CommonService,
                 private _dataStore: TravelDataStoreService,
                 private _dataFormatPipe: DateFormatPipeWithTimeZone ) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.getTravelDisclosureHistory();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        this.travelDisclosure = this._dataStore.getData();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getDataFromStore();
            })
        );
    }

    private getTravelDisclosureHistory(): void {
        this.$subscriptions.push(
            this.travel_service.getTravelDisclosureHistory(this.travelDisclosure.travelDisclosureId)
            .subscribe((data: any) => {
                this.updateHistoryLogs(data.body);
            }, _err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    private updateHistoryLogs(data: any): void {
        if (data.length) {
            this.disclosureHistoryLogs = {};
            data.forEach((historyObj) => {
                const DATE = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.disclosureHistoryLogs[DATE] = this.disclosureHistoryLogs[DATE] ? this.disclosureHistoryLogs[DATE] : [];
                this.disclosureHistoryLogs[DATE].push(historyObj);
            });
        }
    }

    sortNull(): number {
        return 0;
    }

}
