import { AuditReportService } from './audit-report.service';
import { Component, OnInit } from '@angular/core';
import { AuditReport } from './audit-report';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.css']
})
export class AuditReportComponent implements OnInit {

  isSaving: boolean = false;
  $subscriptions: Subscription[] = [];

  auditReportList: AuditReport[] = [];

  constructor(private _reportService : AuditReportService) { }

  ngOnInit() {
    this.getAuditConfiguration();
  }

  getAuditConfiguration() {
    this.$subscriptions.push(this._reportService.auditReportTypes().subscribe((data: AuditReport[]) => {
      this.auditReportList = data.filter((e: AuditReport) =>e.isActive);
    }));
  }

  public exportReport(report: AuditReport): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._reportService.exportAuditReportBasedOnType({type: report.reportType})
      .subscribe((data: any) => {
        fileDownloader(data.body, report.reportName, 'xlsx');
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }
  
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
