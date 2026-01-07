/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExternalReviewService } from './external-review.service';

describe('Service: ExternalReview', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExternalReviewService]
    });
  });

  it('should ...', inject([ExternalReviewService], (service: ExternalReviewService) => {
    expect(service).toBeTruthy();
  }));
});
