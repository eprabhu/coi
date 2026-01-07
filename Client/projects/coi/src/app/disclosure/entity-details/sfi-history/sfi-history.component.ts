import { Component, Input, OnChanges } from '@angular/core';
import { fadeInOutHeight } from '../../../common/utilities/animations';
import { Subscription } from 'rxjs';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { EntityDetailsService } from '../entity-details.service';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
    selector: 'app-sfi-history',
    templateUrl: './sfi-history.component.html',
    styleUrls: ['./sfi-history.component.scss'],
    animations: [fadeInOutHeight]
})
export class SfiHistoryComponent implements OnChanges {

    @Input() entityId: any;
    $subscriptions: Subscription[] = [];
    sfiHistoryLogs: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];

    constructor( private _commonService: CommonService,
                 public entityDetailService: EntityDetailsService,
                 public dataFormatPipe: DateFormatPipeWithTimeZone ) { }

    ngOnInit() {
        this.triggerHistoryUpdate();
    }

    ngOnChanges() {
        this.getSfiHistory();
    }

    triggerHistoryUpdate() {
        this.$subscriptions.push(this.entityDetailService.$updateHistory.subscribe((data: any) => {
            if (data) {
                this.getSfiHistory();
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getSfiHistory() {
        this.$subscriptions.push(this.entityDetailService.sfiHistory(this.entityDetailService.currentVersionDetails).subscribe((data: any) => {
            this.updateHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    sortNull() { return 0; }

    updateHistoryLogs(data: any) {
        if (data.length) {
            this.sfiHistoryLogs = [];
            data.forEach((historyObj) => {
                const date = this.dataFormatPipe.transform(historyObj.updateTimestamp);
                this.sfiHistoryLogs[date] = this.sfiHistoryLogs[date] ? this.sfiHistoryLogs[date] : [];
                this.sfiHistoryLogs[date].push(historyObj);
            });
        }
    }

}
