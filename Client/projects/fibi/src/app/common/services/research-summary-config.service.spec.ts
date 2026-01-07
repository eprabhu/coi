import { TestBed, inject } from '@angular/core/testing';

import { ResearchSummaryConfigService } from './research-summary-config.service';

describe('ResearchSummaryConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResearchSummaryConfigService]
    });
  });

  it('should be created', inject([ResearchSummaryConfigService], (service: ResearchSummaryConfigService) => {
    expect(service).toBeTruthy();
  }));
});
