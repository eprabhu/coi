import { TestBed, inject } from '@angular/core/testing';

import { ReportingRequirementsService } from './reporting-requirements.service';

describe('ReportTermsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportingRequirementsService]
    });
  });

  it('should be created', inject([ReportingRequirementsService], (service: ReportingRequirementsService) => {
    expect(service).toBeTruthy();
  }));
});
