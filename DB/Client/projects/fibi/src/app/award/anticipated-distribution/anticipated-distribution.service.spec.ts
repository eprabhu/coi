/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AnticipatedDistributionService } from './anticipated-distribution.service';

describe('Service: AnticipatedDistribution', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnticipatedDistributionService]
    });
  });

  it('should ...', inject([AnticipatedDistributionService], (service: AnticipatedDistributionService) => {
    expect(service).toBeTruthy();
  }));
});
