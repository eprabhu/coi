/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SpecialReviewService } from './special-review.service';

describe('Service: SpecialReview', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecialReviewService]
    });
  });

  it('should ...', inject([SpecialReviewService], (service: SpecialReviewService) => {
    expect(service).toBeTruthy();
  }));
});
