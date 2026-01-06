import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from '../common/services/auth-guard.service';

const routes: Routes = [{
    path: '', component: DashboardComponent,
    children: [
        {path: '', redirectTo: 'researchSummary', pathMatch: 'full'},
        {
            path: 'researchSummary',
            loadChildren: () => import('../research-summary-widgets/research-summary-widgets.module')
                .then(m => m.ResearchSummaryWidgetsModule), canActivate: [AuthGuard]
        },
        {
            path: 'awardList', loadChildren: () => import('../award/award-list/award-list.module')
                .then(m => m.AwardListModule), canActivate: [AuthGuard]
        },
        {
            path: 'templateList', loadChildren: () => import('../report/template-list/template-list.module')
                .then(m => m.TemplateListModule), canActivate: [AuthGuard]
        },
        {
            path: 'proposalList', loadChildren: () => import('../proposal/proposal-list/proposal-list.module')
                .then(m => m.ProposalListModule), canActivate: [AuthGuard]
        },
        {
            path: 'grantCall', loadChildren: () => import('../grant-call/grant-list/grant-list.module')
                .then(m => m.GrantListModule), canActivate: [AuthGuard]
        },
        {
            path: 'instituteProposalList',
            loadChildren: () => import('../institute-proposal/institute-proposal-list/institute-proposal-list.module')
                .then(m => m.InstituteProposalListModule), canActivate: [AuthGuard]
        },
        {
            path: 'agreementsList',
            loadChildren: () => import('.././agreement/agreement-list/agreement-list.module')
                .then(m => m.AgreementListModule), canActivate: [AuthGuard]
        },
        {path: 'report', loadChildren: () => import('../report/report.module').then(m => m.ReportModule), canActivate: [AuthGuard]},
        {
            path: 'serviceRequestList', loadChildren: () => import('../service-request/service-request-list/service-request-list.module')
                .then(m => m.ServiceRequestListModule), canActivate: [AuthGuard]
        },
        {
            path: 'claim-list', loadChildren: () => import('../claims/claim-list/claim-list.module')
                .then(m => m.ClaimListModule), canActivate: [AuthGuard]
        },
        {
            path: 'progressReportList',
            loadChildren: () => import('../progress-report/progress-report-list/progress-report-list.module')
                .then(m => m.ProgressReportListModule), canActivate: [AuthGuard]
        }]
},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {
}
