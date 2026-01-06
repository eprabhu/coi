import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressReportListComponent} from './progress-report-list.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {ProgressReportListService} from './progress-report-list.service';
import {FormsModule} from '@angular/forms';
import {SharedComponentModule} from '../../shared-component/shared-component.module';

const routes: Routes = [{path: '', component: ProgressReportListComponent}];

@NgModule({
    declarations: [ProgressReportListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        SharedComponentModule
    ],
    providers: [ProgressReportListService]
})
export class ProgressReportListModule {
}
