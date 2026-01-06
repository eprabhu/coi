import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstituteProposalComponent } from './institute-proposal.component';
import { IpDataResolveGuardService } from './services/ip-data-resolve-guard.service';
import { RouteGuardService } from './services/route-guard.service';
import { WebSocketGuardService } from './services/web-socket-guard.service'

const routes: Routes = [
    {
        path: '', component: InstituteProposalComponent, canActivate: [IpDataResolveGuardService],
        resolve: { products: WebSocketGuardService },
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            {
                path: 'overview',
                loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'other-information',
                loadChildren: () => import('./other-information/other-information.module').then(m => m.OtherInformationModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'attachments',
                loadChildren: () => import('./attachments/attachments.module').then(m => m.AttachmentsModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'comments',
                loadChildren: () => import('./comments/comments.module').then(m => m.CommentsModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'medusa',
                loadChildren: () => import('./medusa/medusa.module').then(m => m.MedusaModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            }
            ,
            {
                path: 'budget',
                loadChildren: () => import('./budget/ip-budget.module').then(m => m.IpBudgetModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'history',
                loadChildren: () => import('./history/history.module').then(m => m.HistoryModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            },
            {
                path: 'ip-comparison',
                loadChildren: () => import('./ip-comparison/ip-comparison.module').then(m => m.IpComparisonModule),
                canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [WebSocketGuardService]
})
export class InstituteProposalRoutingModule {
}
