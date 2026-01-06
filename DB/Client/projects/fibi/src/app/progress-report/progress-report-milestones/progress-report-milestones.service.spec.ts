import { TestBed } from '@angular/core/testing';

import { ProgressReportMilestonesService } from './progress-report-milestones.service';

describe('ProgressReportMilestonesServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgressReportMilestonesService = TestBed.get(ProgressReportMilestonesService);
    expect(service).toBeTruthy();
  });
});
