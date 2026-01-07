import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { GrantCommonDataService } from '../../services/grant-common-data.service';

@Component({
    selector: 'app-grant-call-modal-card',
    templateUrl: './grant-call-modal-card.component.html',
    styleUrls: ['./grant-call-modal-card.component.css']
})
export class GrantCallModalCardComponent implements OnInit, OnDestroy {

    result: any = {};
    $subscriptions: Subscription[] = [];

    constructor(public commonData: GrantCommonDataService) { }

    ngOnInit() {
        this.result = this.commonData.$grantCallData.value;
        this.getGrantCallGeneralData();
    }

    getGrantCallGeneralData() {
        this.$subscriptions.push(this.commonData.$grantCallData.subscribe((data: any) => {
            if (data) {
                this.result = deepCloneObject(data);
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
