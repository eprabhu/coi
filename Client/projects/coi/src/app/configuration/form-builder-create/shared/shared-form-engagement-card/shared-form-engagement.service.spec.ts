/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedEngagementService } from './shared-from-engagement.service';

describe('Service: SharedSfi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedEngagementService]
    });
  });

  it('should ...', inject([SharedEngagementService], (service: SharedEngagementService) => {
    expect(service).toBeTruthy();
  }));
});
