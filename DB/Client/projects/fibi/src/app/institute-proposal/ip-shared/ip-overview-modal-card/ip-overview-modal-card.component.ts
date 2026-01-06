import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { InstituteProposal, InstProposal } from '../../institute-proposal-interfaces';
import { DataStoreService } from '../../services/data-store.service';

@Component({
    selector: 'app-ip-overview-modal-card',
    templateUrl: './ip-overview-modal-card.component.html',
    styleUrls: ['./ip-overview-modal-card.component.css']
})
export class IpOverviewModalCardComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    generalDetails: InstProposal;

    constructor(private _dataStore: DataStoreService) { }

    ngOnInit() {
        this.getDataStoreEvent();
        this.getGeneralDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: any) => {
                if (data.includes('instProposal')) {
                    this.getGeneralDetails();
                }
            }));
    }
    
    getGeneralDetails() {
        const data: InstituteProposal = this._dataStore.getData(['instProposal']);
        this.generalDetails = data.instProposal;
    }

}

