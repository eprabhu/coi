import { Component, OnInit } from '@angular/core';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import { DataStoreEvent, DisclosureHistory } from '../../../../common/services/coi-common.interface';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DateFormatPipeWithTimeZone } from '../../../../shared/pipes/custom-date.pipe';
import { Subscription } from 'rxjs';
import { UserDeclarationService } from '../../services/user-declaration.service';
import { UserDeclarationDataStoreService } from '../../services/user-declaration-data-store.service';
import { CommonModule } from '@angular/common';
import { DeclarationType, UserDeclaration } from '../../../declaration.interface';
import { isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { SharedHistoryTimelineComponent } from '../../../../shared-components/shared-history-timeline/shared-history-timeline.component';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
    selector: 'app-user-declaration-history',
    templateUrl: './user-declaration-history.component.html',
    styleUrls: ['./user-declaration-history.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        SharedHistoryTimelineComponent
    ],
})
export class UserCertificationHistoryComponent implements OnInit {

    $subscriptions: Subscription[] = [];
    userDeclaration = new UserDeclaration();
    historyLogs: any = {};
    declarationTypeDetails: DeclarationType | null = null;

    constructor(private _commonService: CommonService,
        private _dataFormatPipe: DateFormatPipeWithTimeZone,
        private _userDeclarationDataStore: UserDeclarationDataStoreService,
        private _userDeclarationService: UserDeclarationService) {}

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const USER_DECLARATION = this._userDeclarationDataStore.getData();
        if (isEmptyObject(USER_DECLARATION)) { return; }
        this.userDeclaration = USER_DECLARATION;
        this.declarationTypeDetails = this.userDeclaration?.declaration?.declarationType;
        this.getDisclosureHistory();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._userDeclarationDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDisclosureHistory(): void {
        this.$subscriptions.push(
            this._userDeclarationService.getDeclarationHistory(this.userDeclaration?.declaration?.declarationId)
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
        // const DATE_PATTERN = /<b>(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.0)<\/b>/g;
        // const FCOI_EXPIRATION_ACTION_TYPE_CODE = '34';
        data?.forEach(entry => {
            // if (entry?.actionTypeCode?.toString() === FCOI_EXPIRATION_ACTION_TYPE_CODE && entry?.message?.includes('<b>')) {
            //     entry.message = entry.message.replace(DATE_PATTERN, (_match, dateStr) => `<b>${this._dataFormatPipe.transform(dateStr)}</b>`);
            // }
            const GROUP_KEY = this._dataFormatPipe.transform(entry?.updateTimestamp);
            if (!this.historyLogs[GROUP_KEY]) {
                this.historyLogs[GROUP_KEY] = [];
            }
            this.historyLogs[GROUP_KEY].push(entry);
        });
    }

}

