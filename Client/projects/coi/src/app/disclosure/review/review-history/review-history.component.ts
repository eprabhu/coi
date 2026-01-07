import { Component, OnInit } from '@angular/core';
import { fadeInOutHeight, heightAnimation } from '../../../common/utilities/animations';
import { Subscription } from 'rxjs';
import { ReviewService } from '../review.service';
import { subscriptionHandler } from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { CoiDisclosure } from '../../coi-interface';
import { DataStoreService } from '../../services/data-store.service';
import { isEmptyObject } from '../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { DataStoreEvent } from '../../../common/services/coi-common.interface';

@Component({
    selector: 'app-review-history',
    templateUrl: './review-history.component.html',
    styleUrls: ['./review-history.component.scss'],
    animations: [fadeInOutHeight, heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class ReviewHistoryComponent implements OnInit {

    $subscriptions: Subscription[] = [];
    isEmptyObject = isEmptyObject;
    coiDisclosure: CoiDisclosure = new CoiDisclosure();
    reviewHistoryLogs: any = {};
    dependencies = ['coiDisclosure', 'coiReviewerList'];
    isReadMore = false;
    isExpanded = true;
    hasHistoryLogs: any[] = [];

    constructor( public reviewService: ReviewService,
                 public _dataFormatPipe: DateFormatPipeWithTimeZone,
                 private _commonService: CommonService,
                 private _dataStore: DataStoreService ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    
    private getDataFromStore() {
        const DATA = this._dataStore.getData(this.dependencies);
        this.coiDisclosure = DATA.coiDisclosure;
        this.getReviewHistory();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent.dependencies?.some((dep) => this.dependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

    getReviewHistory() {
        this.$subscriptions.push(this.reviewService.reviewHistory(this.coiDisclosure.disclosureId).subscribe((data: any) => {
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
                const date = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.reviewHistoryLogs[date] = this.reviewHistoryLogs[date] ? this.reviewHistoryLogs[date] : [];
                this.reviewHistoryLogs[date].push(historyObj);
            });
        }
    }

    sortNull() { return 0; }
}
