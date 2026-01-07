import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogReportComponent } from './audit-log-report.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: AuditLogReportComponent }]),
        SharedModule,
        FormsModule
    ],
    declarations: [AuditLogReportComponent]
})
export class AuditLogReportModule { }
