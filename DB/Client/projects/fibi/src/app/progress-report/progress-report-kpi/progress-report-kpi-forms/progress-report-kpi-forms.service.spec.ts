import { TestBed } from '@angular/core/testing';

import { ProgressReportKpiFormsService } from './progress-report-kpi-forms.service';

describe('ProgressReportKpiFormsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgressReportKpiFormsService = TestBed.get(ProgressReportKpiFormsService);
    expect(service).toBeTruthy();
  });
});
