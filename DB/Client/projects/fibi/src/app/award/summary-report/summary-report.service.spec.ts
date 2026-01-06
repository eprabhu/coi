/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SummaryReportService } from './summary-report.service';

describe('Service: SummaryReport', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SummaryReportService]
    });
  });

  it('should ...', inject([SummaryReportService], (service: SummaryReportService) => {
    expect(service).toBeTruthy();
  }));
});
