/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AwardRouteGuardService } from './award-route-guard.service';

describe('Service: AwardRouteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwardRouteGuardService]
    });
  });

  it('should ...', inject([AwardRouteGuardService], (service: AwardRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
