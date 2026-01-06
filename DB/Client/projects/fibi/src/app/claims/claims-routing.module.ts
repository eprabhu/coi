import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClaimsComponent} from './claims.component';
import {AttachmentsComponent} from './attachments/attachments.component';
import {ClaimRouteGuardService} from './services/claim-route-guard.service';
import {ClaimResolverGuardService} from './services/claim-resolver-guard.service';


const routes: Routes = [
    {
        path: '', component: ClaimsComponent, canActivate: [ClaimResolverGuardService],
        children: [
            {path: '', redirectTo: 'overview', pathMatch: 'full'},
            {
                path: 'overview',
                loadChildren: () => import('./claim-overview/claim-overview.module').then(m => m.ClaimOverviewModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'endorsement',
                loadChildren: () => import('./endorsement/endorsement.module').then(m => m.EndorsementModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'claim-summary',
                loadChildren: () => import('./claim-summary/claim-summary.module').then(m => m.ClaimSummaryModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'manpower',
                loadChildren: () => import('./man-power/man-power.module').then(m => m.ManPowerModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'details-breakdown',
                loadChildren: () => import('./details-breakdown/details-breakdown.module').then(m => m.DetailsBreakdownModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'invoice',
                loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
            {
                path: 'attachments',
                component: AttachmentsComponent,
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },

            {
                path: 'route-log',
                loadChildren: () => import('./route-log/route-log.module').then(m => m.RouteLogModule),
                canActivate: [ClaimRouteGuardService],
                canDeactivate: [ClaimRouteGuardService]
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClaimsRoutingModule {
}
