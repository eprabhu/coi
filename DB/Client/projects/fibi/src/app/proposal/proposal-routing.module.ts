import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProposalComponent } from './proposal.component';
import { ProposalDataResolveGuardService } from './services/proposal-data-resolve-guard.service';
import { RouteGuardService } from './services/route-guard.service';
import { WebSocketGuardService } from './services/web-socket-guard.service';

const routes: Routes = [
    {
        path: '', component: ProposalComponent, canActivate: [ProposalDataResolveGuardService],
        resolve: { products: WebSocketGuardService },
        children: [
            {path: '', redirectTo: 'overview', pathMatch: 'full'},
            {
                path: 'current-pending', loadChildren: () =>
                    import('./current-pending/current-pending.module').then(m => m.CurrentPendingModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'budget', loadChildren: () =>
                    import('./budget/budget.module').then(m => m.BudgetModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'summary', loadChildren: () =>
                    import('./proposal-comparison/proposal-comparison.module').then(m => m.ProposalComparisonModule)
            },
            {
                path: 'certification', loadChildren: () =>
                    import('./certification/certification.module').then(m => m.CertificationModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            }, {
                path: 'permissions', loadChildren: () =>
                    import('./role/role.module').then(m => m.RoleModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            }, {
                path: 'medusa', loadChildren: () =>
                    import('./medusa/medusa.module').then(m => m.MedusaModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'review', loadChildren: () =>
                    import('./proposal-review/proposal-review.module').then(m => m.ProposalReviewModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'other-information',
                loadChildren: () => import('./other-information/other-information.module').then(m => m.OtherInformationModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'comments', loadChildren: () => import('./comments/comments.module').then(m => m.CommentsModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'attachment',
                loadChildren: () => import('./attachment/attachment.module').then(m => m.AttachmentModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: 'questionnaire',
                loadChildren: () => import('./questionnaire/questionnaire.module').then(m => m.QuestionnaireModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: 'evaluation',
                loadChildren: () => import('./evaluation/evaluation.module').then(m => m.EvaluationModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: 'route-log',
                loadChildren: () => import('./route-log/route-log.module').then(m => m.RouteLogModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: 'overview',
                loadChildren: () => import('./proposal-home/proposal-home.module').then(m => m.ProposalHomeModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
        ]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [ProposalDataResolveGuardService, RouteGuardService, WebSocketGuardService]
})
export class ProposalRoutingModule {
}
