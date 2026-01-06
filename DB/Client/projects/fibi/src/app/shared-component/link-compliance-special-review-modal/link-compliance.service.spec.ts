/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LinkComplianceService } from './link-compliance.service';

describe('Service: LinkCompliance', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LinkComplianceService]
    });
  });

  it('should ...', inject([LinkComplianceService], (service: LinkComplianceService) => {
    expect(service).toBeTruthy();
  }));
});
