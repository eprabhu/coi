import { Component, OnInit } from '@angular/core';
import { TravelDisclosureService } from '../../services/travel-disclosure.service';

@Component({
    selector: 'app-travel-review',
    templateUrl: './travel-review.component.html',
    styleUrls: ['./travel-review.component.scss']
})
export class TravelReviewComponent implements OnInit {

    intersectionObserverOptions: IntersectionObserverInit;
    isActivateObserverOption = false;

    constructor(public travelService: TravelDisclosureService) {
        window.scrollTo(0, 0);
    }

    ngOnInit() {
        this.intersectionObserverOptions = {
            root: document.getElementById('SCROLL_SPY_LEFT_CONTAINER'),
            rootMargin: '0px 0px 0px 0px',
            threshold: Array.from({ length: 100 }, (_, i) => i / 100)
        };
        this.isActivateObserverOption = true;
    }

}
