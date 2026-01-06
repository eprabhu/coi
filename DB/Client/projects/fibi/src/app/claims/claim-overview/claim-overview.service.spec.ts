import { TestBed } from '@angular/core/testing';

import { ClaimOverviewService } from './claim-overview.service';

describe('ClaimOverviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClaimOverviewService = TestBed.get(ClaimOverviewService);
    expect(service).toBeTruthy();
  });
});
