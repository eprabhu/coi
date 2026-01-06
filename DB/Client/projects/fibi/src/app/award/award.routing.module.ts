import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AwardComponent } from './award.component';
import { ExpenditureComponent } from './expenditure/expenditure.component';
import { AwardRouteGuardService } from './services/award-route-guard.service';
import { AwardDataResolveGuardService } from './services/award-data-resolve-guard.service';
import { WebSocketGuardService } from './services/web-socket-guard.service';

const routes: Routes = [{
  path: '', component: AwardComponent, canActivate: [AwardDataResolveGuardService],
  resolve: { products: WebSocketGuardService },
  children: [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) ,
     canDeactivate: [AwardRouteGuardService]},
     {
      path: 'comparison',
      loadChildren: () => import('./award-comparison/award-comparison.module').then(m => m.AwardComparisonModule),
    },
    {
      path: 'budget-expense',
      loadChildren: () => import('./budget-expenses/budget-expenses.module').then(m => m.BudgetExpensesModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'dates', loadChildren: () => import('./dates-amounts/dates-amounts.module').then(m => m.DatesAmountsModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'reports',
      loadChildren: () => import('./reporting-requirements/reporting-requirements.module').then(m => m.ReportingRequirementsModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'terms-approval',
      loadChildren: () => import('./terms-approval/terms-approval.module').then(m => m.TermsApprovalModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'cost-share',
      loadChildren: () => import('./cost-sharing/cost-sharing.module').then(m => m.CostSharingModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'attachments', loadChildren: () => import('./attachments/attachments.module').then(m => m.AttachmentsModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    { path: 'expenditure', component: ExpenditureComponent },
    {
      path: 'hierarchy', loadChildren: () => import('./award-hierarchy/award-hierarchy.module').then(m => m.AwardHierarchyModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'medusa', loadChildren: () => import('./medusa/medusa.module').then(m => m.MedusaModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'route-log', loadChildren: () => import('./route-log/route-log.module').then(m => m.RouteLogModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'review', loadChildren: () => import('./award-review/award-review.module').then(m => m.AwardReviewModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'questionnaire', loadChildren: () => import('./award-questionnaire/award-questionnaire.module')
      .then(m => m.AwardQuestionnaireModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'project-outcome', loadChildren: () => import('./project-outcome/project-outcome.module').then(m => m.ProjectOutcomeModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'permissions', loadChildren: () => import('./role/role.module').then(m => m.RoleModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'award-history', loadChildren: () => import('./award-history/award-history.module').then(m => m.AwardHistoryModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'other-information', loadChildren: () => import('./other-information/other-information.module')
      .then(m => m.OtherInformationModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'task', loadChildren: () => import('../task/task.module').then(m => m.TaskModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'payments', loadChildren: () => import('./payments/payments.module').then(m => m.PaymentsModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'manpower', loadChildren: () => import('./man-power/man-power.module').then(m => m.ManPowerModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
    {
      path: 'summary-report', loadChildren: () => import('./summary-report/summary-report.module').then(m => m.SummaryReportModule),
      canActivate: [AwardRouteGuardService], canDeactivate: [AwardRouteGuardService]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [WebSocketGuardService]
})
export class AwardRoutingModule { }
