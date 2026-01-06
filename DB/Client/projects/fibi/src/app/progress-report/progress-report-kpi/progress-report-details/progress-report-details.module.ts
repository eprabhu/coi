import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressReportDetailsComponent} from './progress-report-details.component';
import {RouterModule, Routes} from '@angular/router';
import {ProgressReportKpiFormsModule} from '../progress-report-kpi-forms/progress-report-kpi-forms.module';
import {ProgressReportDetailsService} from './progress-report-details.service';

const routes: Routes = [
    {path: '', component: ProgressReportDetailsComponent}
];

@NgModule({
    declarations: [ProgressReportDetailsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ProgressReportKpiFormsModule
    ],
    providers: [ProgressReportDetailsService]
})
export class ProgressReportDetailsModule {
}
