import { TestBed, inject } from '@angular/core/testing';

import { AgreementRouteGuardService } from './agreement-route-guard.service';

describe('AgreementRouteGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementRouteGuardService]
    });
  });

  it('should be created', inject([AgreementRouteGuardService], (service: AgreementRouteGuardService) => {
    expect(service).toBeTruthy();
  }));
});
