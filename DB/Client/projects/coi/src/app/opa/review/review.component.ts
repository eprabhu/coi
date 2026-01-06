import {Component, OnInit} from '@angular/core';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { ReviewService } from './review.service';
import { Subscription } from 'rxjs';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss'],
    animations: [fadeInOutHeight]
})
export class ReviewComponent implements OnInit {

    $subscriptions: Subscription[] = [];

    constructor(public reviewService: ReviewService, 
                public commonService: CommonService) { }

    ngOnInit() {
        window.scrollTo(0,0);
        this.setStickyTop();
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
            if (event.uniqueId === 'COI_OPA_HEADER') {
                this.setStickyTop();
            }
        }));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    setStickyTop(): void {
        const COI_DISCLOSURE_REVIEW_HEADER = document.getElementById('COI_OPA_HEADER').getBoundingClientRect();
        const COI_DISCLOSURE_REVIEW_HEADER_BOTTOM = COI_DISCLOSURE_REVIEW_HEADER.bottom;
        const PADDING = '1rem';
        this.reviewService.headerTop = `calc(${COI_DISCLOSURE_REVIEW_HEADER_BOTTOM}px - ${PADDING})`;
        
    }


}
