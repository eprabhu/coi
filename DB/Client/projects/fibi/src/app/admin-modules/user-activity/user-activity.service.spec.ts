/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserActivityService } from './user-activity.service';

describe('Service: UserActivity', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserActivityService]
    });
  });

  it('should ...', inject([UserActivityService], (service: UserActivityService) => {
    expect(service).toBeTruthy();
  }));
});
