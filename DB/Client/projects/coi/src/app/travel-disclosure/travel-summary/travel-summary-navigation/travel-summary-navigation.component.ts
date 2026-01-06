import { Component } from '@angular/core';
import { TravelDisclosureService } from '../../services/travel-disclosure.service';

@Component({
    selector: 'app-travel-summary-navigation',
    templateUrl: './travel-summary-navigation.component.html',
    styleUrls: ['./travel-summary-navigation.component.scss']
})

export class TravelSummaryNavigationComponent {

    constructor(public travelDisclosureService: TravelDisclosureService) { }

    scrollIntoView(activeSectionId: 'TD2401' | 'TD2402'): void {
        if (!this.travelDisclosureService.isExpandSummaryBySection[activeSectionId]) {
            setTimeout(() => {
                this.travelDisclosureService.setActiveSection(activeSectionId);
                window.scroll(0, 0);
                const SCROLL_SPY_LEFT_ITEM = document.getElementById(activeSectionId);
                const SCROLL_SPY_LEFT_CONTAINER = document.getElementById('SCROLL_SPY_LEFT_CONTAINER');

                if (SCROLL_SPY_LEFT_CONTAINER && SCROLL_SPY_LEFT_ITEM) {
                    SCROLL_SPY_LEFT_CONTAINER.scrollTo({
                        top: SCROLL_SPY_LEFT_ITEM.offsetTop - SCROLL_SPY_LEFT_CONTAINER.offsetTop,
                        behavior: 'auto'
                    });
                }
            });
        }
    }

}
