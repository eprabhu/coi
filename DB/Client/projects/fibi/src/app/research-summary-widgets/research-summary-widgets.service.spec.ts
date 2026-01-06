/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ResearchSummaryWidgetsService } from './research-summary-widgets.service';

describe('Service: ResearchSummaryWidgets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResearchSummaryWidgetsService]
    });
  });

  it('should ...', inject([ResearchSummaryWidgetsService], (service: ResearchSummaryWidgetsService) => {
    expect(service).toBeTruthy();
  }));
});
