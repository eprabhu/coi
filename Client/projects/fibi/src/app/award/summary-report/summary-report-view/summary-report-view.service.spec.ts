/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SummaryReportViewService } from './summary-report-view.service';

describe('Service: SummaryReportView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SummaryReportViewService]
    });
  });

  it('should ...', inject([SummaryReportViewService], (service: SummaryReportViewService) => {
    expect(service).toBeTruthy();
  }));
});
