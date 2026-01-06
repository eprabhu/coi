import { SharedModule } from './../../shared/shared.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ProgressReportOverviewComponent} from './progress-report-overview.component';
import {RouterModule, Routes} from '@angular/router';
import { FuturePlanSummaryComponent } from './future-plan-summary/future-plan-summary.component';


const routes: Routes = [
    {path: '', component: ProgressReportOverviewComponent}
];

@NgModule({
    declarations: [ProgressReportOverviewComponent, FuturePlanSummaryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule
    ]
})
export class ProgressReportOverviewModule {
}
