/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FeedMaintenanceRouteGuardService } from './feed-maintenance-route-guard.service';

describe('Service: FeedMaintenanceRouteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeedMaintenanceRouteGuardService]
    });
  });

  it('should ...', inject([FeedMaintenanceRouteGuardService], (service: FeedMaintenanceRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
