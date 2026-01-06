import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditReportComponent } from './audit-report.component';
import { RouterModule } from '@angular/router';
import { AuditReportService } from './audit-report.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AuditReportComponent}]),
  ],
  declarations: [AuditReportComponent],
  providers: [AuditReportService]
})
export class AuditReportModule { }
