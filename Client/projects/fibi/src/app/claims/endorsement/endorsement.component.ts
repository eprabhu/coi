import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-endorsement',
    templateUrl: './endorsement.component.html',
    styleUrls: ['./endorsement.component.css']
})
export class EndorsementComponent implements OnInit, OnDestroy {

    claimDetails: any = {};
    isEditMode = true;
    isCollapseDelivery = false;
    $subscriptions: Subscription[] = [];

    constructor(public _commonData: CommonDataService) { }

    ngOnInit() {
        this.$subscriptions.push(
            this._commonData.$claimData.subscribe((data: any) => {
                if (data && data.claim) {
                    this.claimDetails = JSON.parse(JSON.stringify(data.claim));
                    this.checkEditMode(this.claimDetails.claimStatus.claimStatusCode);
                }
            })
        );
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    /**
    * 1 = Pending
    * 2 = Revision Requested
    */
    checkEditMode(claimStatusCode: string) {
        this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && this._commonData.isClaimModifiable();
    }
}
