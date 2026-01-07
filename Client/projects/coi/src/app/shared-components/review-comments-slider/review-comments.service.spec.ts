/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReviewCommentsService } from './review-comments.service';

describe('Service: ReviewCommentsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReviewCommentsService]
    });
  });

  it('should ...', inject([ReviewCommentsService], (service: ReviewCommentsService) => {
    expect(service).toBeTruthy();
  }));
});
