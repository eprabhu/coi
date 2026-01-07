/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityDetailsRouteGuardService } from './entity-details-route-guard.service';

describe('Service: EntityDetailsRouteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityDetailsRouteGuardService]
    });
  });

  it('should ...', inject([EntityDetailsRouteGuardService], (service: EntityDetailsRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
