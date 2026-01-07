import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CommonDataService } from './services/common-data.service';
import { ProgressReportComponent } from './progress-report.component';
import { ProgressReportRoutingModule } from './progress-report-routing.module';
import { ProgressReportService } from './services/progress-report.service';
import { AttachmentsComponent } from './attachments/attachments.component';
import { ProgressReportRouteGuardService } from './services/progress-report-route-guard.service';
import { ProgressReportResolverGuardService } from './services/progress-report-resolver-guard.service';
import { OrderByPipe } from '../shared/directives/orderBy.pipe';


@NgModule({
    declarations: [ProgressReportComponent, AttachmentsComponent],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        ProgressReportRoutingModule,
        RouterModule
    ],
    providers: [ProgressReportService, CommonDataService, ProgressReportResolverGuardService, ProgressReportRouteGuardService, OrderByPipe]
})
export class ProgressReportModule {
}
