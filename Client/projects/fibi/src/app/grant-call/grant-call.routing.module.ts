import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { GrantCallComponent } from './grant-call.component';
import { GrantRouteGuardService } from './services/grant-route-guard.service';
import { AwardDataResolveGuardService } from './services/grant-data-resolve-guard.service';

const routes: Routes = [{
    path: '', component: GrantCallComponent, canActivate: [AwardDataResolveGuardService],
    children: [
        {path: '', redirectTo: 'overview', pathMatch: 'full'},
        {
            path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule),
            canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'attachments', loadChildren: () => import('./attachments/attachments.module').then(m => m.AttachmentsModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'ioi', loadChildren: () => import('./indication-of-interest/indication-of-interest.module')
                .then(m => m.IndicationOfInterestModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'kpi', loadChildren: () => import('./key-performance-indicator/key-performance-indicator.module')
                .then(m => m.KeyPerformanceIndicatorModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'scoring-criteria',
            loadChildren: () => import('./scoring-criteria/scoring-criteria.module').then(m => m.ScoringCriteriaModule),
            canActivate: [GrantRouteGuardService],
            canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'evaluation', loadChildren: () => import('./evaluation/evaluation.module').then(m => m.EvaluationModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'submitted-proposals', loadChildren: () => import('./submitted-proposals/submitted-proposals.module')
                .then(m => m.SubmittedProposalsModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'history', loadChildren: () => import('./grant-history/grant-history.module')
                .then(m => m.GrantHistoryModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        },
        {
            path: 'other-information', loadChildren: () => import('./other-information/other-information.module')
                .then(m => m.GrantOtherInformationModule),
            canActivate: [GrantRouteGuardService], canDeactivate: [GrantRouteGuardService]
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GrantCallRoutingModule {
}
