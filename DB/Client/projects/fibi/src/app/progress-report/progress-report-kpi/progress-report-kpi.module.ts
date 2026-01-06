import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressReportKpiComponent } from './progress-report-kpi.component';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [
    {
        path: '', component: ProgressReportKpiComponent,
        children: [
            {path: '', redirectTo: 'details', pathMatch: 'full'},
            {
                path: 'details',
                loadChildren: () => import('./progress-report-details/progress-report-details.module')
                    .then(m => m.ProgressReportDetailsModule),
                canActivate: [RouteGuardService]
            }, {
                path: 'summary',
                loadChildren: () => import('./progress-report-summary/progress-report-summary.module')
                    .then(m => m.ProgressReportSummaryModule),
                canActivate: [RouteGuardService]
            },
            {
                path: '**',
                loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
            }
        ]
    }
];

@NgModule({
    declarations: [ProgressReportKpiComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
    ],
    providers: [RouteGuardService]
})
export class ProgressReportKpiModule {
}
