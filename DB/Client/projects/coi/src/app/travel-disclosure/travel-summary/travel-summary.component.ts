import { GlobalEventNotifier } from './../../common/services/coi-common.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { TravelDisclosureService } from '../services/travel-disclosure.service';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-travel-summary',
    templateUrl: './travel-summary.component.html',
    styleUrls: ['./travel-summary.component.scss'],
    animations: [fadeInOutHeight]
})
export class TravelSummaryComponent implements OnInit, OnDestroy {

    isExpandRightNav = true;
    $subscriptions: Subscription[] = [];

    constructor(public travelService: TravelDisclosureService, private _commonService: CommonService) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.listenDisclosureHeaderChange();
        setTimeout(() => {
            this.travelService.configureScrollSpy();
        }, 200);
    }

    private listenDisclosureHeaderChange(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'TRAVEL_DISCLOSURE_HEADER_RESIZE') {
                    this.travelService.setHeight();
                    if (event.content.isResize) {
                        this.isExpandRightNav = true;
                    }
                }
            }));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
