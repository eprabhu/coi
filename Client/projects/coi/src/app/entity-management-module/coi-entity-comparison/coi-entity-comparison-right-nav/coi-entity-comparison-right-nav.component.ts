import { Component, AfterViewInit } from '@angular/core';
import { EntityComparisonService } from '../coi-entity-comparison.service';
import * as bootstrap from 'bootstrap';
import { EntitySectionType } from '../../shared/entity-constants';

@Component({
    selector: 'app-coi-entity-comparison-right-nav',
    templateUrl: './coi-entity-comparison-right-nav.component.html',
    styleUrls: ['./coi-entity-comparison-right-nav.component.scss']
})
export class CoiEntityComparisonRightNavComponent implements AfterViewInit { 

    constructor(public comparisonService: EntityComparisonService) {}

    ngAfterViewInit(): void {
        this.setTooltip();
    }

    private setTooltip(): void {
        this.comparisonService.selectedSectionDetails?.forEach((section: EntitySectionType) => {
            const SECTION_TOOLTIP_ELEMENT = document.getElementById('coi-entity-comp-nav-item-' + section?.sectionId);
            if (SECTION_TOOLTIP_ELEMENT) {
                new bootstrap.Tooltip(SECTION_TOOLTIP_ELEMENT);
            }
        });
    }

    scrollToSelectedSection(sectionId: string | number): void {
        this.comparisonService.selectedSectionId = sectionId;
        setTimeout(() => {
            const SECTION_ELEMENT: HTMLElement | null = document.getElementById(`coi-card-${sectionId}`);
            const CONTAINER_ELEMENT: HTMLElement | null = document.getElementById(`${this.comparisonService.sliderId}-slider-body`);

            if (SECTION_ELEMENT && CONTAINER_ELEMENT) {
                const CONTAINER_TOP = CONTAINER_ELEMENT.getBoundingClientRect().top;
                const ELEMENT_TOP = SECTION_ELEMENT.getBoundingClientRect().top;
                const OFFSET_TOP = ELEMENT_TOP - CONTAINER_TOP - 52;
                CONTAINER_ELEMENT.scrollBy({
                    top: OFFSET_TOP,
                    behavior: 'smooth'
                });
            }
        });
    }

}
