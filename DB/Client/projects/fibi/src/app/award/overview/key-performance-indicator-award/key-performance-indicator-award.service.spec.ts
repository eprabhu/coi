/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KeyPerformanceIndicatorAwardService } from './key-performance-indicator-award.service';

describe('Service: KeyPerformanceIndicatorAward', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyPerformanceIndicatorAwardService]
    });
  });

  it('should ...', inject([KeyPerformanceIndicatorAwardService], (service: KeyPerformanceIndicatorAwardService) => {
    expect(service).toBeTruthy();
  }));
});
