import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoiService } from '../services/coi.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { DataStoreService } from '../services/data-store.service';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { DataStoreEvent, DisclosureHistory } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    animations: [fadeInOutHeight]
})
export class HistoryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    dependencies = ['coiDisclosure'];
    coiDisclosure: any = {};
    disclosureHistoryLogs: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];

    constructor( public _coiService: CoiService, 
                 private _commonService: CommonService, 
                 private _dataStore: DataStoreService,
                 public _dataFormatPipe: DateFormatPipeWithTimeZone ) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0,0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const DATA = this._dataStore.getData(this.dependencies);
        this.coiDisclosure = DATA.coiDisclosure;
        this.getDisclosureHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent.dependencies?.some((dep) => this.dependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

    private getDisclosureHistory(): void {
        this.$subscriptions.push(this._coiService.disclosureHistory(this.coiDisclosure.disclosureId).subscribe((data: DisclosureHistory[]) => {
            this.updateFormattedHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching disclosure history.');
        }));
    }

    /**
     * Formats and groups the disclosure history logs.
     *
     * - If the action type is '34', it updates the date inside the message using the date format pipe.
     * - Groups the logs by the update date.
     * - Saves the grouped logs in the `disclosureHistoryLogs` object.
     *
     * @param data List of disclosure history items to update.
     */
    private updateFormattedHistoryLogs(data: DisclosureHistory[]): void {
        this.disclosureHistoryLogs = {};
        const DATE_PATTERN = /<b>(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.0)<\/b>/g;
        const FCOI_EXPIRATION_ACTION_TYPE_CODE = '34';
        data?.forEach(entry => {
            if (entry?.actionTypeCode?.toString() === FCOI_EXPIRATION_ACTION_TYPE_CODE && entry?.message?.includes('<b>')) {
                entry.message = entry.message.replace(DATE_PATTERN, (_match, dateStr) => `<b>${this._dataFormatPipe.transform(dateStr)}</b>`);
            }
            const GROUP_KEY = this._dataFormatPipe.transform(entry?.updateTimestamp);
            if (!this.disclosureHistoryLogs[GROUP_KEY]) {
                this.disclosureHistoryLogs[GROUP_KEY] = [];
            }
            this.disclosureHistoryLogs[GROUP_KEY].push(entry);
        });
    }

    sortNull(): number {
        return 0;
    }

}
