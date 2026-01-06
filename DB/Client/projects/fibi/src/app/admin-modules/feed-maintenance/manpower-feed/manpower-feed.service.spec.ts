/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManpowerFeedService } from './manpower-feed.service';

describe('Service: ManpowerFeed', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManpowerFeedService]
    });
  });

  it('should ...', inject([ManpowerFeedService], (service: ManpowerFeedService) => {
    expect(service).toBeTruthy();
  }));
});
