import { Component } from '@angular/core';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { ConsultingService } from '../services/consulting.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { ConsultingFormDataStoreService } from '../services/consulting-data-store.service';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { DataStoreEvent } from '../../common/services/coi-common.interface';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations: [fadeInOutHeight]

})
export class HistoryComponent {

    $subscriptions: Subscription[] = [];
    dependencies = ['consultingForm'];
    consultingDisclosure: any = {};
    disclosureHistoryLogs: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];

    constructor(private _consultingService: ConsultingService,
            private _commonService: CommonService,
            public _dataFormatPipe: DateFormatPipeWithTimeZone,
            private _dataStore: ConsultingFormDataStoreService
    ){}

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0,0);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getDisclosureHistory() {
        this.$subscriptions.push(this._consultingService.disclosureHistory(this.consultingDisclosure.disclosureId).subscribe((data: any) => {
            this.updateHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, please try again.');
        }));
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

    private getDataFromStore() {
        const DATA = this._dataStore.getData(this.dependencies);
        this.consultingDisclosure = DATA.consultingForm;
        this.getDisclosureHistory();
    }

    sortNull() {
        return 0;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent.dependencies.some((dep) => this.dependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }
}
