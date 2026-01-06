/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuditReportService } from './audit-report.service';

describe('Service: AuditReport', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditReportService]
    });
  });

  it('should ...', inject([AuditReportService], (service: AuditReportService) => {
    expect(service).toBeTruthy();
  }));
});
