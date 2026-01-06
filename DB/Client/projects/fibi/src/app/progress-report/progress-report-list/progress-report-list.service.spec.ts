import { TestBed } from '@angular/core/testing';

import { ProgressReportListService } from './progress-report-list.service';

describe('ProgressReportListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgressReportListService = TestBed.get(ProgressReportListService);
    expect(service).toBeTruthy();
  });
});
