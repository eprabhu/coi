/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuditLogReportService } from './audit-log-report.service';

describe('Service: AuditLogReport', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogReportService]
    });
  });

  it('should ...', inject([AuditLogReportService], (service: AuditLogReportService) => {
    expect(service).toBeTruthy();
  }));
});
