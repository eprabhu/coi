import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressReportMilestonesComponent} from './progress-report-milestones.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {ProgressReportMilestonesService} from './progress-report-milestones.service';

const routes: Routes = [
    {path: '', component: ProgressReportMilestonesComponent}
];

@NgModule({
    declarations: [ProgressReportMilestonesComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
    ],
    providers: [ProgressReportMilestonesService]
})
export class ProgressReportMilestonesModule {
}
