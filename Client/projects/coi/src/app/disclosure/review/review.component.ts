import {Component, OnDestroy, OnInit} from '@angular/core';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { CoiService } from '../services/coi.service';
import { ReviewService } from './review.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss'],
    animations: [fadeInOutHeight]
})
export class ReviewComponent implements OnInit, OnDestroy {
    
    $subscriptions: Subscription[] = [];

    constructor(public coiService: CoiService,
                public reviewService: ReviewService,
                public commonService: CommonService) { }

    ngOnInit(): void {
        window.scrollTo(0,0);
        this.setStickyTop();
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
            if (event.uniqueId === 'COI_DISCLOSURE_HEADER_RESIZE') {
                this.setStickyTop();
            }
        }));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    setStickyTop(): void {
        const COI_DISCLOSURE_REVIEW_HEADER = document.getElementById('COI-DISCLOSURE-HEADER').getBoundingClientRect();
        const COI_DISCLOSURE_REVIEW_HEADER_BOTTOM = COI_DISCLOSURE_REVIEW_HEADER.bottom;
        const PADDING = '1rem';
        this.reviewService.headerTop = `calc(${COI_DISCLOSURE_REVIEW_HEADER_BOTTOM}px - ${PADDING})`;
    }

}
