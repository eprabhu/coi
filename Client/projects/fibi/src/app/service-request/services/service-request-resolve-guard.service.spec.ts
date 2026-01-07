/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ServiceRequestResolveGuardService } from './service-request-resolve-guard.service';

describe('Service: ServiceRequestResolveGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceRequestResolveGuardService]
    });
  });

  it('should ...', inject([ServiceRequestResolveGuardService], (service: ServiceRequestResolveGuardService) => {
    expect(service).toBeTruthy();
  }));
});
