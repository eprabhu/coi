import { TestBed } from '@angular/core/testing';

import { ProgressReportDetailsService } from './progress-report-details.service';

describe('ProgressReportDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgressReportDetailsService = TestBed.get(ProgressReportDetailsService);
    expect(service).toBeTruthy();
  });
});
