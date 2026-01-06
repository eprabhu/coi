import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOutHeight } from '../../../common/utilities/animations';
import { Subscription } from 'rxjs';
import { ReviewService } from '../review.service';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { DataStoreService } from '../../services/data-store.service';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DataStoreEvent } from '../../../common/services/coi-common.interface';

@Component({
    selector: 'app-review-history',
    templateUrl: './review-history.component.html',
    styleUrls: ['./review-history.component.scss'],
    animations: [fadeInOutHeight]
})
export class ReviewHistoryComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    isEmptyObject = isEmptyObject;
    opaDisclosure = null;
    reviewHistoryLogs: any = {};
    isReadMore = false;
    hasHistoryLogs : any[] = [];

    constructor(public reviewService: ReviewService,
                public dataFormatPipe: DateFormatPipeWithTimeZone,
                private _commonService: CommonService,
                private _dataStore: DataStoreService) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getReviewHistory() {
        this.$subscriptions.push(this.reviewService.reviewHistory(this.opaDisclosure.opaDisclosureId).subscribe((data: any) => {
            this.updateHistoryLogs(data);
            this.hasHistoryLogs = data;
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    updateHistoryLogs(data: any) {
        if (data.length) {
            this.reviewHistoryLogs = {};
            data.forEach((historyObj) => {
                const date = this.dataFormatPipe.transform(historyObj.updateTimestamp);
                this.reviewHistoryLogs[date] = this.reviewHistoryLogs[date] ? this.reviewHistoryLogs[date] : [];
                this.reviewHistoryLogs[date].push(historyObj);
            });
        }
    }

    sortNull() {
        return 0;
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData();
        this.opaDisclosure = DATA.opaDisclosure;
        this.getReviewHistory();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }
}
