import { Routes } from '@angular/router';
import { DisclosureReviewListResolveService } from './disclosure-review-list/disclosure-review-list-resolve.service';
import { ReviewerDashboardRouteGuardService } from './services/reviewer-dashboard-route-guard.service';

export const REVIEWER_DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        canActivate: [ReviewerDashboardRouteGuardService],
        children: [
            {
                path: 'overview',
                loadComponent: () =>
                    import('./reviewer-overview/reviewer-overview.component').then(m => m.ReviewerOverviewComponent)
            },
            {
                path: 'person-list',
                loadComponent: () =>
                    import('./person-list/person-list.component').then(m => m.PersonListComponent)
            },
            {
                path: 'disclosures-list',
                loadComponent: () =>
                    import('./disclosure-review-list/disclosure-review-list.component').then(m => m.DisclosureReviewListComponent), resolve: { resolvedData: DisclosureReviewListResolveService }
            },
            { path: '', redirectTo: 'overview', pathMatch: 'full' }
        ]
    }
];
