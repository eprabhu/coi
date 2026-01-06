import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader.component';
import { DisclosureReviewCountDetails, DisclosureReviewData, ReviewCardTriggeredFrom } from '../../reviewer-dashboard.interface';

export interface ReviewerOverviewCardEvent { 
    action: 'VIEW_LIST',
    content: { reviewStatDetails: DisclosureReviewData, selectedCountDetails: DisclosureReviewCountDetails }
};

@Component({
    selector: 'app-shared-discl-review-overview-card',
    templateUrl: './shared-discl-review-overview-card.component.html',
    styleUrls: ['./shared-discl-review-overview-card.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, SkeletonLoaderComponent]
})
export class SharedDisclReviewOverviewCardComponent {

    @Input() reviewStatDetails: DisclosureReviewData;
    @Input() triggeredFrom: ReviewCardTriggeredFrom;
    @Input() loaderConfig = { isShowLoader: false, columnClassArray: [] };

    @Output() cardActions = new EventEmitter<ReviewerOverviewCardEvent>();

    customClass: Record<ReviewCardTriggeredFrom, string> = {
        DEPT_OVERVIEW: 'coi-card-grey-light overflow-hidden coi-card-shadow-none coi-card-section-body-p-0',
        OVERVIEW_HEADER: 'coi-card-grey-light overflow-hidden coi-card-section-body-p-3'
    }

    viewDisclosureList(selectedCountDetails: DisclosureReviewCountDetails): void {
        this.cardActions.emit({
            action: 'VIEW_LIST',
            content: { reviewStatDetails: this.reviewStatDetails, selectedCountDetails: selectedCountDetails }
        });
    }

}
