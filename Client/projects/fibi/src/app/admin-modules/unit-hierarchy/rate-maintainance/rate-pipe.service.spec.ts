import { TestBed, inject } from '@angular/core/testing';

import { RatePipeService } from './rate-pipe.service';

describe('RatePipeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RatePipeService]
    });
  });

  it('should be created', inject([RatePipeService], (service: RatePipeService) => {
    expect(service).toBeTruthy();
  }));
});
