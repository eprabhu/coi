import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategy } from './common/services/custom-module-loader';
import { AuthGuard, LoginGuard } from './common/services/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { AppRouterComponent } from './common/app-router/app-router.component';
import { LogoutComponent } from './logout/logout.component';
import { DashboardGuardService } from './common/services/dashboard-guard.service';

const routes: Routes = [
    { path: '', redirectTo: 'fibi/dashboard', pathMatch: 'full' },
    {
        path: 'fibi', component: AppRouterComponent, canActivate: [DashboardGuardService],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
                data: { preload: true },
                canActivate: [AuthGuard]
            },
            {
                path: 'grant', loadChildren: () => import('./grant-call/grant-call.module').then(m => m.GrantCallModule),
                data: { preload: true },
                canActivate: [AuthGuard]
            },
            {
                path: 'proposal', loadChildren: () => import('./proposal/proposal.module').then(m => m.ProposalModule),
                data: { preload: true },
                canActivate: [AuthGuard]
            },
            {
                path: 'questionnaire',
                loadChildren: () => import('./admin-modules/questionnaire-create/create.module').then(m => m.CreateModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'codetable', loadChildren: () => import('./admin-modules/codetable/codetable.module').then(m => m.CodetableModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'unitHierarchy',
                loadChildren: () => import('./admin-modules/unit-hierarchy/unit-hierarchy.module').then(m => m.UnitHierarchyModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'user-activity',
                loadChildren: () => import('./admin-modules/user-activity/user-activity.module').then(m => m.UserActivityModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'award', loadChildren: () => import('./award/award.module').then(m => m.AwardModule),
                data: { preload: true },
                canActivate: [AuthGuard]
            },
            {
                path: 'report', loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'mapMaintainance',
                loadChildren: () => import('./admin-modules/map-maintenance/map-maintenance.module').then(m => m.MapMaintenanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'businessRule',
                loadChildren: () => import('./admin-modules/business-rule/business-rule.module').then(m => m.BusinessRuleModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'admin-dashboard',
                loadChildren: () => import('./admin-modules/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'role-maintainance',
                loadChildren: () => import('./admin-modules/role-maintainance/role-maintainance.module').then(m => m.RoleMaintainanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'sponsor-maintenance',
                loadChildren: () => import('./admin-modules/sponsor-maintenance/sponsor-maintenance.module').then(m => m.SponsorMaintenanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'training-maintenance',
                loadChildren: () => import('./admin-modules/person-training/person-training.module').then(m => m.PersonTrainingModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'agreement', loadChildren: () => import('./agreement/agreement.module').then(m => m.AgreementModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'instituteproposal',
                loadChildren: () => import('./institute-proposal/institute-proposal.module').then(m => m.InstituteProposalModule),
                data: { preload: true },
                canActivate: [AuthGuard]
            },
            {
                path: 'notification',
                loadChildren: () => import('./admin-modules/notification-engine/notification-engine.module').then(m => m.NotificationEngineModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'person',
                loadChildren: () => import('./admin-modules/person-maintenance/person-maintenance.module').then(m => m.PersonMaintenanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'rolodex',
                loadChildren: () => import('./admin-modules/rolodex-maintenance/rolodex-maintenance.module').then(m => m.RolodexMaintenanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'customdata',
                loadChildren: () => import('./admin-modules/custom-data/custom-data.module').then(m => m.CustomDataModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'expanded-widgets',
                loadChildren: () => import('./expanded-widgets/expanded-widgets.module').then(m => m.ExpandedWidgetsModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'service-request',
                loadChildren: () => import('./service-request/service-request.module').then(m => m.ServiceRequestModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'claims', loadChildren: () => import('./claims/claims.module').then(m => m.ClaimsModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'progress-report',
                loadChildren: () => import('./progress-report/progress-report.module').then(m => m.ProgressReportModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'feed-maintenance',
                loadChildren: () => import('./admin-modules/feed-maintenance/feed-maintenance.module').then(m => m.FeedMaintenanceModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'audit-report',
                loadChildren: () => import('./admin-modules/audit-report/audit-report.module').then(m => m.AuditReportModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'audit-log-report',
                loadChildren: () => import('./admin-modules/audit-log-report/audit-log-report.module').then(m => m.AuditLogReportModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'clauses-management', loadChildren: () => import('./admin-modules/clauses-management/clauses-management.module').then(m => m.ClausesManagementModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'triage', loadChildren: () => import('./triage/triage.module').then(m => m.TriageModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'template-management',
                loadChildren: () => import('./admin-modules/template-management/template-management.module').then(m => m.TemplateManagementModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'error',
                loadChildren: () => import('./error-handler/error-handler.module').then(m => m.ErrorHandlerModule),
                data: { preload: false }
            },
            {
                path: 'user-authentication', loadChildren: () => import('./admin-modules/user-authentication/user-authentication.module').then(m => m.UserAuthenticationModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'fetchAwardBaseSalary', loadChildren: () => import('./award-basesalary-list/award-basesalary-list.module').then(m => m.AwardBasesalaryListModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'sponsor-hierarchy',
                loadChildren: () => import('./admin-modules/sponsor-hierarchy/sponsor-hierarchy.module').then(m => m.SponsorHierarchyModule),
                data: {preload: false},
                canActivate: [AuthGuard]
            },
            {
                path: 'maintain-external-reviewer',
                loadChildren: () => import('./admin-modules/maintain-external-reviewer/maintain-external-reviewer.module').then(m => m.MaintainExternalReviewerModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'sponsor-report',
                loadChildren: () => import('./admin-modules/sponsor-report/sponsor-report.module').then(m => m.SponsorReportModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            },
            {
                path: 'elastic-monitoring',
                loadChildren: () => import('./admin-modules/elastic-monitoring/elastic-monitoring.module').then(m => m.ElasticMonitoringModule),
                data: { preload: false },
                canActivate: [AuthGuard]
            }
        ]
    },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'logout', component: LogoutComponent },
    {
        path: 'error', loadChildren: () => import('./error-handler/error-handler.module').then(m => m.ErrorHandlerModule),
        data: { preload: false }
    },
    { path: '**', redirectTo: 'fibi/dashboard', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: CustomPreloadingStrategy })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
