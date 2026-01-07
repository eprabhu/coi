import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReviewerDashboardService } from './services/reviewer-dashboard.service';
import { REVIEWER_DASHBOARD_ROUTES } from './reviewer-dashboard-route';
import { CoiReviewCommentSliderService } from '../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { ReviewerDashboardRouteGuardService } from './services/reviewer-dashboard-route-guard.service';
import { DisclosureReviewListResolveService } from './disclosure-review-list/disclosure-review-list-resolve.service';

@NgModule({
    imports: [
        RouterModule.forChild(REVIEWER_DASHBOARD_ROUTES)
    ],
    providers: [
        CoiReviewCommentSliderService,
        ReviewerDashboardService,
        ReviewerDashboardRouteGuardService,
        DisclosureReviewListResolveService
    ]
})
export class ReviewerDashboardModule { }
