/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IndicationOfInterestService } from './indication-of-interest.service';

describe('Service: IntentOfInterest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndicationOfInterestService]
    });
  });

  it('should ...', inject([IndicationOfInterestService], (service: IndicationOfInterestService) => {
    expect(service).toBeTruthy();
  }));
});
