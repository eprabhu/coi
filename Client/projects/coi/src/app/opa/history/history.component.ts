import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import { DataStoreService } from '../services/data-store.service';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { OpaService } from '../services/opa.service';
import { OpaDisclosure } from '../opa-interface';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    animations: [fadeInOutHeight]
})
export class HistoryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    dependencies = ['opaDisclosure'];
    opaDisclosure: OpaDisclosure = new OpaDisclosure();
    disclosureHistoryLogs: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];

    constructor(public _opaService: OpaService,
                private _commonService: CommonService,
                private _dataStore: DataStoreService,
                public _dataFormatPipe: DateFormatPipeWithTimeZone) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0,0);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getDisclosureHistory() {
        this.$subscriptions.push(this._opaService.disclosureHistory(this.opaDisclosure.opaDisclosureId).subscribe((data: any) => {
            this.updateHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    sortNull() {
        return 0;
    }

    updateHistoryLogs(data: any) {
        if (data.length) {
            this.disclosureHistoryLogs = {};
            data.forEach((historyObj) => {
                const date = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.disclosureHistoryLogs[date] = this.disclosureHistoryLogs[date] ? this.disclosureHistoryLogs[date] : [];
                this.disclosureHistoryLogs[date].push(historyObj);
            });
        }
    }

    private getDataFromStore(): void {
        const DATA = this._dataStore.getData(this.dependencies);
        this.opaDisclosure = DATA.opaDisclosure;
        this.getDisclosureHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent?.dependencies?.some((dep) => this.dependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

}
