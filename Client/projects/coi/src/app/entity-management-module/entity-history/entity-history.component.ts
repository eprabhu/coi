import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { EntityManagementService } from '../entity-management.service';
import { EntireEntityDetails } from '../shared/entity-interface';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { EntityDataStoreService } from '../entity-data-store.service';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HistoryTab } from '../shared/entity-constants';

@Component({
    selector: 'app-entity-history',
    templateUrl: './entity-history.component.html',
    styleUrls: ['./entity-history.component.scss'],
    animations: [fadeInOutHeight]

})
export class EntityHistoryComponent {

    $subscriptions: Subscription[] = [];
    entityHistoryLogs: any = {};
    coiEntityDetails: any = {};
    isEmptyObject = isEmptyObject;
    isReadMore: boolean[] = [];
    sectionDetails = {sectionId: '', sectionName: ''};


    constructor(private _commonService: CommonService,
        private _dataFormatPipe: DateFormatPipeWithTimeZone,
        private _entityManagementService: EntityManagementService,
        private _dataStoreService: EntityDataStoreService) { }


    ngOnInit() {
        window.scrollTo(0, 0);
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private setSectionIdAndName(): void {
        this.sectionDetails.sectionId = this._commonService.getSectionId(HistoryTab, 'HISTORY');
        this.sectionDetails.sectionName = this._commonService.getSectionName(HistoryTab, 'HISTORY');
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) {
            return;
        }
        this.coiEntityDetails = ENTITY_DATA.entityDetails;
        this.getEntityHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private getEntityHistory() {
        this.$subscriptions.push(this._entityManagementService.entityHistory(this.coiEntityDetails.entityId).subscribe((data: any) => {
            this.updateHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    /** This function is used as a comparator function for sorting the key-value pairs.
    Since it always returns 0, it effectively disables sorting, keeping the key-value pairs in their original order. */
    sortNull() { return 0; }

    private updateHistoryLogs(data: any): void {
        if (data.length) {
            this.entityHistoryLogs = {};
            data.forEach((historyObj) => {
                const DATE = this._dataFormatPipe.transform(historyObj.updateTimestamp);
                this.entityHistoryLogs[DATE] = this.entityHistoryLogs[DATE] ? this.entityHistoryLogs[DATE] : [];
                this.entityHistoryLogs[DATE].push(historyObj);
            });
        }
    }
}
