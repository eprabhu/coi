/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SfiDataResolveGuardService } from './sfi-data-resolve-guard.service';

describe('Service: SfiDataResolveGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SfiDataResolveGuardService]
    });
  });

  it('should ...', inject([SfiDataResolveGuardService], (service: SfiDataResolveGuardService) => {
    expect(service).toBeTruthy();
  }));
});
