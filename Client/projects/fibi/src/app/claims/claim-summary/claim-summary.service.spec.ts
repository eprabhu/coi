/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClaimSummaryService } from './claim-summary.service';

describe('Service: ClaimSummary', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClaimSummaryService]
    });
  });

  it('should ...', inject([ClaimSummaryService], (service: ClaimSummaryService) => {
    expect(service).toBeTruthy();
  }));
});
