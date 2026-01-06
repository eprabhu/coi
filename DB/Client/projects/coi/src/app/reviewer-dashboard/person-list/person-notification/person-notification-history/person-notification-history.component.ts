import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { FormSharedModule } from 'projects/coi/src/app/configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from 'projects/coi/src/app/shared-components/shared-component.module';
import { SharedModule } from 'projects/coi/src/app/shared/shared.module';
import { NotificationDetails } from '../../../reviewer-dashboard.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-person-notification-history',
    templateUrl: './person-notification-history.component.html',
    styleUrls: ['./person-notification-history.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, FormsModule, MatIconModule]
})
export class PersonNotificationHistoryComponent {

    @Input() notificationList: NotificationDetails[] = [];

    isRecipientReadMore: boolean[] = [];
    isViewMessage: boolean[] = [];
    isDesc: { [key: string]: boolean } = {
        sendDate: true
    };
    currentSortStateKey: string | null = null;

    constructor(private _commonService: CommonService) { }

    toggleReadMore(index: number, flag: boolean): void {
        this.isRecipientReadMore = [];
        this.isRecipientReadMore[index] = flag;
    }

    toggleViewMessage(index: number, flag: boolean): void {
        this.isViewMessage = [];
        this.isViewMessage[index] = flag;
    }

    openPersonDetailsModal(personId: string): void {
        this._commonService.openPersonDetailsModal(personId, 'PERSON');
    }

    /**
   *
   * @param index To retrieve the accurate project using the index value.
   * @param key The key is used to obtain a specific field name from the keyperson table, based on the data given at a particular index value.
   */
    onSortClick(key: string): void {
        const STATE_KEY = `${key}`;
        const CURRENT_SORT_DIRECTION = this.isDesc[STATE_KEY];

        if (this.currentSortStateKey && this.currentSortStateKey !== STATE_KEY) {
            this.isDesc[this.currentSortStateKey] = null;
        }

        this.currentSortStateKey = STATE_KEY;
        this.sortKeypersonsList(CURRENT_SORT_DIRECTION, key);
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    private sortKeypersonsList(isAsc: boolean, key: string): void {
        const STATE_KEY = `${key}`;
        this.isDesc[STATE_KEY] = !isAsc;
        const ALL_KEY_HAVE_VALUES = this.notificationList.every(item =>
            this.getNestedValue(item, key) !== undefined
        );
        if (ALL_KEY_HAVE_VALUES) {
            this.notificationList.sort((a, b) => {
                const VAL_A = this.getNestedValue(a, key);
                const VAL_B = this.getNestedValue(b, key);
                let comparison = 0;
                if (typeof VAL_A === 'boolean' && typeof VAL_B === 'boolean') {
                    comparison = VAL_A === VAL_B ? 0 : VAL_B ? 1 : -1;
                } else if (typeof VAL_A === 'number' && typeof VAL_B === 'number') {
                    comparison = VAL_A - VAL_B;
                } else if (typeof VAL_A === 'string' && typeof VAL_B === 'string') {
                    comparison = VAL_A.localeCompare(VAL_B);
                }
                return isAsc ? comparison : -comparison;
            });
        }
    }

}
