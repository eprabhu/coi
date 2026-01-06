import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgressReportComponent } from './progress-report.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { ProgressReportRouteGuardService } from './services/progress-report-route-guard.service';
import { ProgressReportResolverGuardService } from './services/progress-report-resolver-guard.service';


const routes: Routes = [
    {
        path: '', component: ProgressReportComponent, canActivate: [ProgressReportResolverGuardService],
        children: [
            {path: '', redirectTo: 'overview', pathMatch: 'full'},
            {
                path: 'overview',
                loadChildren: () => import('./progress-report-overview/progress-report-overview.module').then(m => m.ProgressReportOverviewModule),
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
            {
                path: 'milestones',
                loadChildren: () => import('./progress-report-milestones/progress-report-milestones.module').then(m => m.ProgressReportMilestonesModule),
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
            {
                path: 'equipments',
                loadChildren: () => import('./progress-report-equipments/progress-report-equipments.module').then(m => m.ProgressReportEquipmentsModule),
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
            {
                path: 'performance-indicator',
                loadChildren: () => import('./progress-report-kpi/progress-report-kpi.module').then(m => m.ProgressReportKpiModule),
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
            {
                path: 'attachments',
                component: AttachmentsComponent,
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
            {
                path: 'route-log',
                loadChildren: () => import('./progress-report-routelog/progress-report-routelog.module').then(m => m.ProgressReportRoutelogModule),
                canActivate: [ProgressReportRouteGuardService],
                canDeactivate: [ProgressReportRouteGuardService]
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProgressReportRoutingModule {
}
